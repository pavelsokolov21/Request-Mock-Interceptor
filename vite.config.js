import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const SCRIPS_FOLDERS = {
  CONTENT_SCRIPTS: "content-scripts",
  BACKGROUND: "background",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentScriptsDir = path.resolve(
  __dirname,
  `src/${SCRIPS_FOLDERS.CONTENT_SCRIPTS}`
);
const backgroundScriptsDir = path.resolve(
  __dirname,
  `src/${SCRIPS_FOLDERS.BACKGROUND}`
);

const getStaticScriptEntries = () => {
  const entries = {};

  [
    [
      fs.existsSync(contentScriptsDir),
      {
        readdir: () => fs.readdirSync(contentScriptsDir),
        folder: SCRIPS_FOLDERS.CONTENT_SCRIPTS,
        pathResolve: contentScriptsDir,
      },
    ],
    [
      fs.existsSync(backgroundScriptsDir),
      {
        readdir: () => fs.readdirSync(backgroundScriptsDir),
        folder: SCRIPS_FOLDERS.BACKGROUND,
        pathResolve: backgroundScriptsDir,
      },
    ],
  ]
    .filter((pair) => {
      return pair[0];
    })
    .map((pair) => pair[1])
    .map(({ readdir, folder, pathResolve }) => {
      for (const file of readdir()) {
        const ext = path.extname(file);

        if (ext === ".js") {
          const name = path.parse(file).name;

          entries[`${folder}/${name}`] = path.resolve(pathResolve, file);
        }
      }
    });

  return entries;
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ...getStaticScriptEntries(),
      },
      output: {
        entryFileNames: (chunk) => {
          if (
            chunk.name.startsWith(`${SCRIPS_FOLDERS.CONTENT_SCRIPTS}/`) ||
            chunk.name.startsWith(`${SCRIPS_FOLDERS.BACKGROUND}/`)
          ) {
            return "[name].js";
          }

          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
