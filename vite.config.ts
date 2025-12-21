import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import i18nextLoader from 'vite-plugin-i18next-loader';

import { dirname , resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname (fileURLToPath (import.meta.url))

export default defineConfig( {
	build: {
		rollupOptions: {
			input: {
				main: './index.html',
				create: './create.html',
        features: resolve(__dirname, 'public/features.html'),
        faq: resolve(__dirname, 'public/faq.html')
			},
		},
	},
	plugins: [
		i18nextLoader( { paths: [ './src/locales' ], namespaceResolution: 'basename' } ),
		react(),
	],
	resolve: {
		alias: {
			'~': resolve( __dirname, 'src' ),
		},
	},
	worker: {
		format: 'es',
		plugins: () => [
			i18nextLoader( { paths: [ './src/locales' ], namespaceResolution: 'basename' } ),
			react(),
		],
	},
} );
