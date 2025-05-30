import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import path from 'path';
import spritesmith from "vite-plugin-spritesmith";
import copy from "rollup-plugin-copy";
import fs from 'fs';

const SPRITE_PATH = 'public/assets/icons/icons.png';

//
// Convert image to base64
//
function convertSpriteToBase64() {
  if (fs.existsSync(SPRITE_PATH)) {
    const fileBuffer = fs.readFileSync(SPRITE_PATH);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }
  return ""; 
}

export default defineConfig({
  server: {
    open: "/examples/index.html",
  },
  
  resolve: {
    alias: {
      "umlsync": "/src/UMLSync.editor.js",
    },
  },
  publicDir: "public",
  build: {
    outDir: "dist/editor",
    lib: 
      {
        entry: {
			editor: path.resolve(__dirname, "src/UMLSync.editor.js"), // Entry for UMLSync.editor.js
		},
		name: "UMLSync",
        formats: ["es", "cjs"], // Both ESM and CommonJS
        fileName: (format, target) => {
			console.log("LOOKING FOR FORMAT: " + format + " SOM" + target);
			return `UMLSync.${target}.${format}.js`;
		},
      },
    rollupOptions: {
      external: ['jquery', 'jquery-ui'], // Add dependencies if needed
      output: {
        exports: "named",
        sourcemap: true,
        globals: {
			jquery: '$'
		},
      },
      plugins: [
        copy({
          targets: [
            { src: "src/assets/css/umlsync.css", dest: "dist/assets/styles/" },
            { src: "src/assets/js/jquery.editable.js", dest: "dist/assets/js/" }
          ],
          verbose: true
        })
      ],
      
    }
  },
  plugins: [
    nodePolyfills(),
    spritesmith({
      src: {
        cwd: "src/assets/icons/vp/",
        glob: "**/*.png", // Includes subdirectories
      },
      target: {
        image: "public/assets/icons/icons.png", // Place sprite inside `public/`
        css: "public/assets/styles/icons.css", // CSS file goes into `src/`
      },
      apiOptions: {
        cssImageRef: "assets/styles/icons.png", // Ensure proper path reference
        generateSpriteName: function (imageData) {
            //
            // DOES NOT WORK - ADD source_image to the node module
            //
            return "NOTHING";
        }
      },
      customTemplates: {
        css: (data) => {
          return `
.icons-sprite {
  background-image: url('` + convertSpriteToBase64()  + `');
  background-repeat: no-repeat;
  display: inline-block;
  margin-right: 6px;
}` + 
          data.sprites.map((sprite) => {
            const className = sprite.source_image
              .replace(/^.*?\/icons\/vp\//, "") // Remove base path
              .replace(/\//g, "-") // Replace "/" with "-"
              .replace(".png", ""); // Remove ".png"

            return `
.icon-${className} {
  background-position: left ${sprite.offset_x}px top ${sprite.offset_y}px;
  width: ${sprite.width}px;
  height: ${sprite.height}px;
}`;
          }).join("\n");
        },
      },
      spritesmithOptions: {
        padding: 0,
      },
    }),
  ],

});
