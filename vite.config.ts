import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import i18nextLoader from 'vite-plugin-i18next-loader';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: './index.html',
				create: './create.html',
				features: './features.html',
				faq: './faq.html',
			},
		},
	},
	plugins: [
		i18nextLoader({
			paths: [ './src/locales' ],
			namespaceResolution: 'basename',
		}),
		react({
			exclude: [/\/pdf\//, /\/worker\//, /\/node_modules\//],
		}),
	],
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
	worker: {
		format: 'es',
		plugins: () => [
			i18nextLoader({
				paths: [ './src/locales' ],
				namespaceResolution: 'basename',
			}),
			react({
				exclude: [/\/src\//, /\/node_modules\//],
			}),
		],
	},
});
