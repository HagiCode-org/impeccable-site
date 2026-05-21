import {
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';
import type {
  CommandCatalogRecord,
  GeneratedCommandCatalog,
  LocalizedCommandSummary,
} from '@/lib/vendor/impeccable-source';
import commandCatalogData from '@/lib/generated/command-catalog.json';

const commandCatalog = commandCatalogData as GeneratedCommandCatalog;

export interface CommandSectionCommand extends CommandCatalogRecord {
  localized: LocalizedCommandSummary;
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

export function getCommandRecord(slug: string): CommandCatalogRecord | undefined {
  return commandCatalog.commands.find((command) => command.slug === slug);
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

export function getCommandSections(localeInput: SiteLocale | string | null | undefined): CommandSection[] {
  const locale = resolveSiteLocale(localeInput);

  return commandCatalog.categoryOrder.map((categoryId) => ({
    categoryId,
    commands: commandCatalog.commands
      .filter((command) => command.categoryId === categoryId)
      .map((command) => ({
        ...command,
        localized: getLocalizedCommandContent(command, locale),
      })),
  }));
}

export function getOverviewRouteKey(): string {
  return '/docs/';
}

export function getCommandRouteKey(slug: string): string {
  return `/docs/${slug}/`;
}
