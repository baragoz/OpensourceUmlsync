import { defineConfig } from "vite";
import spritesmith from "vite-plugin-spritesmith";

export default defineConfig({
  server: {
    open: "/examples/index.html", // Auto-open the example page
  },
  resolve: {
    alias: {
      "umlsync": "/src/", // Ensure alias points to source
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "src/UMLSync.js",
    },
  },
  publicDir: "public", // Ensure static assets (sprites) are copied to `dist`
  plugins: [
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
           // console.log("DATA IS", data);
          return `
.icons-sprite {
  background-image: url('/assets/icons/icons.png'); 
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
