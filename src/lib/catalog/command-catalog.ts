import {
  getSiteLocaleFallbackChain,
  resolveSiteLocale,
  SUPPORTED_SITE_LOCALES,
  type SiteLocale,
} from '@/i18n/locale-metadata';
import { getLocalizedPath } from '@/lib/i18n/locale-routing';
import type {
  CommandCatalogRecord,
  CommandLocale,
  GeneratedCommandCatalog,
  LocalizedCommandSummary,
} from '@/lib/vendor/impeccable-source';
import commandCatalogData from '@/lib/generated/command-catalog.json';

const commandCatalog = commandCatalogData as GeneratedCommandCatalog;
const commandByCanonicalId = new Map(commandCatalog.commands.map((command) => [command.canonicalId, command]));
const commandByLocaleRoute = new Map<string, CommandCatalogRecord>();
const commandSourceLocales = new Set<CommandLocale>(commandCatalog.locales);

for (const command of commandCatalog.commands) {
  for (const locale of commandCatalog.locales) {
    commandByLocaleRoute.set(`${locale}:${command.locales[locale].routeSlug}`, command);
  }
}

function resolveCommandSourceLocale(localeInput: SiteLocale | string | null | undefined): CommandLocale {
  const locale = resolveSiteLocale(localeInput);
  const lookupChain = [locale, ...getSiteLocaleFallbackChain(locale)];

  for (const candidate of lookupChain) {
    if (commandSourceLocales.has(candidate as CommandLocale)) {
      return candidate as CommandLocale;
    }
  }

  return 'en-US';
}

function getLocalizedCommandRoutePath(routeSlug: string, locale: SiteLocale): string {
  return getLocalizedPath(`/docs/${routeSlug}/`, locale);
}

export interface ResolvedLocalizedCommandSummary extends LocalizedCommandSummary {
  alternateLocalePaths: Record<SiteLocale, string>;
}

export interface CommandSectionCommand extends CommandCatalogRecord {
  localized: ResolvedLocalizedCommandSummary;
  path: string;
}

export interface CommandSection {
  categoryId: CommandCatalogRecord['categoryId'];
  commands: CommandSectionCommand[];
}

export function getCommandCatalog(): GeneratedCommandCatalog {
  return commandCatalog;
}

export function getAllCommands(): CommandCatalogRecord[] {
  return commandCatalog.commands;
}

export function getCommandRecord(canonicalId: string): CommandCatalogRecord | undefined {
  return commandByCanonicalId.get(canonicalId);
}

export function getCommandRecordByLocaleRoute(
  localeInput: SiteLocale | string | null | undefined,
  routeSlug: string,
): CommandCatalogRecord | undefined {
  const sourceLocale = resolveCommandSourceLocale(localeInput);
  return commandByLocaleRoute.get(`${sourceLocale}:${routeSlug}`);
}

export function getCommandAlternateLocalePaths(
  commandOrId: CommandCatalogRecord | string,
): Record<SiteLocale, string> {
  const command = resolveCommand(commandOrId);

  return Object.fromEntries(
    SUPPORTED_SITE_LOCALES.map((locale) => {
      const sourceLocale = resolveCommandSourceLocale(locale);
      return [locale, getLocalizedCommandRoutePath(command.locales[sourceLocale].routeSlug, locale)];
    }),
  ) as Record<SiteLocale, string>;
}

export function getLocalizedCommandContent(
  command: CommandCatalogRecord,
  localeInput: SiteLocale | string | null | undefined,
): ResolvedLocalizedCommandSummary {
  const locale = resolveSiteLocale(localeInput);
  const sourceLocale = resolveCommandSourceLocale(locale);
  const localized = command.locales[sourceLocale];

  if (!localized) {
    throw new Error(`Missing localized command content for ${command.slug} (${sourceLocale})`);
  }

  return {
    ...localized,
    routePath: getLocalizedCommandRoutePath(localized.routeSlug, locale),
    alternateLocalePaths: getCommandAlternateLocalePaths(command),
  };
}

function resolveCommand(commandOrId: CommandCatalogRecord | string): CommandCatalogRecord {
  if (typeof commandOrId !== 'string') {
    return commandOrId;
  }

  const command = getCommandRecord(commandOrId);

  if (!command) {
    throw new Error(`Unknown command id: ${commandOrId}`);
  }

  return command;
}

export function getCommandPath(
  commandOrId: CommandCatalogRecord | string,
  localeInput: SiteLocale | string | null | undefined,
): string {
  const locale = resolveSiteLocale(localeInput);
  const command = resolveCommand(commandOrId);
  const sourceLocale = resolveCommandSourceLocale(locale);
  return getLocalizedCommandRoutePath(command.locales[sourceLocale].routeSlug, locale);
}

export function getCommandSections(localeInput: SiteLocale | string | null | undefined): CommandSection[] {
  const locale = resolveSiteLocale(localeInput);

  return commandCatalog.categoryOrder.map((categoryId) => ({
    categoryId,
    commands: commandCatalog.commands
      .filter((command) => command.categoryId === categoryId)
      .map((command) => ({
        ...command,
        localized: getLocalizedCommandContent(command, locale),
        path: getCommandPath(command, locale),
      })),
  }));
}

export function getOverviewRouteKey(): string {
  return '/docs/';
}

export function getCommandRouteKey(
  commandOrId: CommandCatalogRecord | string,
  localeInput: SiteLocale | string | null | undefined,
): string {
  return getCommandPath(commandOrId, localeInput);
}
