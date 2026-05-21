import {
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';
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

for (const command of commandCatalog.commands) {
  for (const locale of commandCatalog.locales) {
    commandByLocaleRoute.set(`${locale}:${command.locales[locale].routeSlug}`, command);
  }
}

export interface CommandSectionCommand extends CommandCatalogRecord {
  localized: LocalizedCommandSummary;
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
  const locale = resolveSiteLocale(localeInput);
  return commandByLocaleRoute.get(`${locale}:${routeSlug}`);
}

export function getLocalizedCommandContent(
  command: CommandCatalogRecord,
  localeInput: SiteLocale | string | null | undefined,
): LocalizedCommandSummary {
  const locale = resolveSiteLocale(localeInput);
  const localized = command.locales[locale];

  if (!localized) {
    throw new Error(`Missing localized command content for ${command.slug} (${locale})`);
  }

  return localized;
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
  return getLocalizedCommandContent(resolveCommand(commandOrId), locale).routePath;
}

export function getCommandAlternateLocalePaths(
  commandOrId: CommandCatalogRecord | string,
): Record<CommandLocale, string> {
  const command = resolveCommand(commandOrId);
  return command.localePaths;
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
