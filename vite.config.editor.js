import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import spritesmith from "vite-plugin-spritesmith";
import path from "path";
import fs from "fs";
import copy from "rollup-plugin-copy";

//
// Constants
//
const SPRITE_PATH = "public/assets/icons/icons.png";

//
// Convert sprite to base64
//
function convertSpriteToBase64() {
  if (fs.existsSync(SPRITE_PATH)) {
    const fileBuffer = fs.readFileSync(SPRITE_PATH);
    return `data:image/png;base64,${fileBuffer.toString("base64")}`;
  }
  return "";
}

//
// Vite configuration
//
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
    lib: {
      entry: {
        editor: path.resolve(__dirname, "src/UMLSync.editor.js"),
      },
      name: "UMLSync",
      formats: ["es", "cjs"],
      fileName: (format, target) => {
        console.log("LOOKING FOR FORMAT: " + format + " SOM " + target);
        return `UMLSync.${target}.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["jquery", "jquery-ui"],
      output: {
        exports: "named",
        sourcemap: true,
        globals: {
          jquery: "$",
        },
      },
      plugins: [
        //
        // Copy extra JS files
        //
        copy({
          targets: [
            { src: "src/assets/js/jquery.editable.js", dest: "dist/editor/assets/js/" },
          ],
          verbose: true,
        }),
      ],
    },
  },

  plugins: [
    //
    // Node polyfills
    //
    nodePolyfills(),

    //
    // Sprite generator
    //
    spritesmith({
      src: {
        cwd: "src/assets/icons/vp/",
        glob: "**/*.png",
      },
      target: {
        image: "public/assets/icons/icons.png",
        css: "src/assets/styles/icons.css", // placed inside src for Vite import
      },
      apiOptions: {
        cssImageRef: "assets/icons/icons.png",
      },
      customTemplates: {
        css: (data) => {
          return `
.icons-sprite {
  background-image: url('${convertSpriteToBase64()}');
  background-repeat: no-repeat;
  display: inline-block;
  margin-right: 6px;
}
${data.sprites
  .map((sprite) => {
    const className = sprite.image
      .replace(/^.*?\/icons\/vp\//, "")
      .replace(/\//g, "-")
      .replace(".png", "");
    return `
.icon-${className} {
  background-position: ${sprite.offset_x}px ${sprite.offset_y}px;
  width: ${sprite.width}px;
  height: ${sprite.height}px;
}`;
  })
  .join("\n")}
          `;
        },
      },
      spritesmithOptions: {
        padding: 0,
      },
    }),
  ],
});
