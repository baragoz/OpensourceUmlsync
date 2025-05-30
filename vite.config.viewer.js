import { defineConfig } from "vite";

import path from 'path';
import spritesmith from "vite-plugin-spritesmith";


export default defineConfig({
  server: {
    open: "/examples/index.html",
  },
  
  resolve: {
    alias: {
      "umlsync": "/src/UMLSync.viewer.js",
    },
  },
  publicDir: "public",
  build: {
    outDir: "dist/viewer",
    lib: 
      {
        entry: {
			viewer: path.resolve(__dirname, "src/UMLSync.viewer.js"), // Entry for UMLSync.editor.js
		},
        name: "UMLSync",
        formats: ["es", "cjs"], // Both ESM and CommonJS
        fileName: (format, target) => {
          return `UMLSync.${target}.${format}.js`;
		},
      },
    rollupOptions: {
      external: ['jquery'],
      output: {
        exports: "named",
        sourcemap: true,
        globals: {
			jquery: '$'
		},
      },
      
    },
  },
});
