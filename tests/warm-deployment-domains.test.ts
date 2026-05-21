import { describe, expect, it, vi } from 'vitest';

import {
  IMPECCABLE_SITE_WARMUP_CONFIG,
  WarmupRunError,
  renderWarmupSummary,
  runWarmup,
} from '../scripts/warm-deployment-domains.mjs';

type WarmupFetchInit = RequestInit | undefined;
type WarmupHandler = (url: string, options?: WarmupFetchInit) => Promise<Response> | Response;
type WarmupLogger = Pick<Console, 'log' | 'warn' | 'error'>;

function createLogger(): WarmupLogger {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function createFetch(routes: Record<string, Response | WarmupHandler>, calls: Array<{ url: string; options: WarmupFetchInit }> = []): typeof fetch {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const normalizedUrl = String(input);
    calls.push({ url: normalizedUrl, options: init });
    const handler = routes[normalizedUrl];

    if (!handler) {
      throw new Error(`Unexpected warmup URL: ${normalizedUrl}`);
    }

    return typeof handler === 'function' ? handler(normalizedUrl, init) : handler;
  }) as typeof fetch;
}

describe('impeccable-site deployment warmup helper', () => {
  it('retries transient warmup failures and summarizes per-domain success', async () => {
    const calls: Array<{ url: string; options: WarmupFetchInit }> = [];
    const wait = vi.fn().mockResolvedValue(undefined);
    const logger = createLogger() as Console;
    const fetchImpl = createFetch(
      {
        'https://impeccable.472158246.workers.dev/': vi
          .fn()
          .mockResolvedValueOnce(new Response('warming', { status: 503 }))
          .mockResolvedValueOnce(new Response('ready', { status: 200 })),
        'https://impeccable.hagicode.com/': new Response(null, { status: 302 }),
      },
      calls,
    );

    const result = await runWarmup({
      fetchImpl,
      wait,
      logger,
    });

    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(0);
    expect(result.domainResults[0]).toMatchObject({
      domain: 'impeccable.472158246.workers.dev',
      ok: true,
      retriesUsed: 1,
      finalDetail: 'HTTP 200',
    });
    expect(result.domainResults[1]).toMatchObject({
      domain: 'impeccable.hagicode.com',
      ok: true,
      retriesUsed: 0,
      finalDetail: 'HTTP 302',
    });
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait).toHaveBeenCalledWith(IMPECCABLE_SITE_WARMUP_CONFIG.retryDelayMs);
    expect(calls.map((call) => call.url)).toEqual([
      'https://impeccable.472158246.workers.dev/',
      'https://impeccable.472158246.workers.dev/',
      'https://impeccable.hagicode.com/',
    ]);

    const summary = renderWarmupSummary(result);
    expect(summary).toContain('`impeccable.472158246.workers.dev`');
    expect(summary).toContain('`impeccable.hagicode.com`');
    expect(summary).toContain('warmed after retry');
  });

  it('reports exhausted retries with actionable failure details without skipping later domains', async () => {
    const wait = vi.fn().mockResolvedValue(undefined);
    const logger = createLogger() as Console;
    const fetchImpl = createFetch({
      'https://impeccable.472158246.workers.dev/': vi.fn().mockImplementation(async () => new Response('bad gateway', { status: 502 })),
      'https://impeccable.hagicode.com/': new Response('ok', { status: 200 }),
    });

    let error: unknown;

    try {
      await runWarmup({
        fetchImpl,
        wait,
        logger,
      });
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(WarmupRunError);
    const typedError = error as WarmupRunError & {
      result: {
        failureCount: number;
        successCount: number;
        domainResults: Array<{ domain: string; finalDetail: string; ok: boolean }>;
      };
    };
    expect(typedError.result.failureCount).toBe(1);
    expect(typedError.result.successCount).toBe(1);
    expect(typedError.result.domainResults[0].finalDetail).toContain('HTTP 502 - bad gateway');
    expect(typedError.result.domainResults[0].finalDetail).toContain('retries exhausted');
    expect(typedError.result.domainResults[1]).toMatchObject({
      domain: 'impeccable.hagicode.com',
      ok: true,
      finalDetail: 'HTTP 200',
    });
    expect(wait).toHaveBeenCalledTimes(IMPECCABLE_SITE_WARMUP_CONFIG.maxAttempts - 1);

    const summary = renderWarmupSummary(typedError.result);
    expect(summary).toContain('failed');
    expect(summary).toContain('Warmup failure does not roll back the published `gh-pages` snapshot.');
  });
});
