export const VENDOR_SOURCE_ROOT = 'vendor/impeccable';
export const VENDOR_COMMAND_CONTENT_ROOT = `${VENDOR_SOURCE_ROOT}/site/content/skills`;
export const VENDOR_CATEGORY_DATA_PATH = `${VENDOR_SOURCE_ROOT}/site/data/sub-pages-data.ts`;
export const VENDOR_COMMAND_METADATA_PATH = `${VENDOR_SOURCE_ROOT}/skill/scripts/command-metadata.json`;

export type CommandCategoryId =
  | 'create'
  | 'evaluate'
  | 'refine'
  | 'simplify'
  | 'harden'
  | 'system';

export interface VendorCommandRecord {
  slug: string;
  commandName: string;
  categoryId: CommandCategoryId;
  orderInCategory: number;
  tagline: string;
  description: string;
  argumentHint: string;
  sourcePath: string;
  relationships: {
    leadsTo?: string[];
    pairs?: string;
    combinesWith?: string[];
  };
}

export interface LocalizedCommandSummary {
  slug: string;
  title: string;
  summary: string;
  seoTitle?: string;
  seoDescription?: string;
  highlights: string[];
  related: string[];
  contentPath: string;
}

export interface CommandCatalogRecord extends VendorCommandRecord {
  locales: Record<string, LocalizedCommandSummary>;
}

export interface GeneratedCommandCatalog {
  generatedAt: string;
  locales: string[];
  categoryOrder: CommandCategoryId[];
  categoryLabels: Record<CommandCategoryId, string>;
  categoryDescriptions: Record<CommandCategoryId, string>;
  commands: CommandCatalogRecord[];
}
