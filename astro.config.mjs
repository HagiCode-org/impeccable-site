import { fileURLToPath } from 'node:url';

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import hagilight from '@hagicode/hagilight-starlight';

import { getStarlightLocales, getStarlightSidebar } from './src/lib/starlight/config.ts';

export default defineConfig({
  site: 'https://impeccable.hagicode.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Impeccable Commands',
      description: 'Localized command documentation for the impeccable workflow.',
      defaultLocale: 'root',
      locales: getStarlightLocales(),
      sidebar: getStarlightSidebar(),
      customCss: ['./src/styles/starlight.css'],
      social: [
        { icon: 'github', label: 'Upstream source', href: 'https://github.com/pbakaus/impeccable' },
      ],
      components: {
        MarkdownContent: './src/components/docs/CommandMarkdownContent.astro',
      },
      plugins: [
        hagilight({
          links: {
            siteId: 'impeccable-site',
            siteUrl: 'https://impeccable.hagicode.com/',
          },
          analytics: {
            googleAnalytics: { measurementId: 'G-EN03FMT2Q4' },
            fiftyOneLa: { siteId: 'L6b88a5yK4h2Xnci' },
          },
          seo: {
            title: 'Impeccable Commands',
            description: 'Localized command documentation for the impeccable workflow.',
            organization: { name: 'HagiCode', url: 'https://www.hagicode.com/' },
          },
          contentComponents: {
            markdownContent: false,
          },
        }),
      ],
    }),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return pathname !== '/en-US/' && !pathname.startsWith('/en-US/');
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});