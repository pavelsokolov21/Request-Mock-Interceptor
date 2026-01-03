import { build } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";

const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, "src", "content-scripts");
const INJECTIONS_DIR = path.resolve(__dirname, "src", "injections");
const BACKGROUND_DIR = path.resolve(__dirname, "src", "background");

const BACKGROUND_OUTPUT_FOLDER = "background";
const CONTENT_SCRIPT_OUTPUT_FOLDER = "content-scripts";
const INJECTIONS_OUTPUT_FOLDER = "injections";

const getIIFEEntries = () => {
  return [
    [
      fs.existsSync(BACKGROUND_DIR),
      {
        readdir: () => fs.readdirSync(BACKGROUND_DIR),
        pathResolve: BACKGROUND_DIR,
        outputFolder: BACKGROUND_OUTPUT_FOLDER,
      },
    ],
    [
      fs.existsSync(CONTENT_SCRIPTS_DIR),
      {
        readdir: () => fs.readdirSync(CONTENT_SCRIPTS_DIR),
        pathResolve: CONTENT_SCRIPTS_DIR,
        outputFolder: CONTENT_SCRIPT_OUTPUT_FOLDER,
      },
    ],
    [
      fs.existsSync(INJECTIONS_DIR),
      {
        readdir: () => fs.readdirSync(INJECTIONS_DIR),
        pathResolve: INJECTIONS_DIR,
        outputFolder: INJECTIONS_OUTPUT_FOLDER,
      },
    ],
  ]
    .filter((pair) => {
      return pair[0];
    })
    .flatMap((pair) => {
      const { readdir, outputFolder, pathResolve } = pair[1];

      const entries = [];

      for (const file of readdir()) {
        const ext = path.extname(file);

        if (ext === ".js") {
          const name = path.parse(file).name;

          entries.push({
            lib: {
              entry: path.resolve(pathResolve, file),
              name: name,
              fileName: name,
            },
            folder: outputFolder,
          });
        }
      }

      return entries;
    });
};

const iifeEntries = getIIFEEntries();

(async () => {
  // UI
  await build({
    plugins: [react(), tailwindcss()],
    configFile: false,
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          sourcemap: isDev,
        },
      },
    },
  });

  // Extension scripts
  await Promise.all(
    iifeEntries.map(async ({ folder, lib }) => {
      return await build({
        configFile: false,
        build: {
          lib: { ...lib, formats: ["iife"] },
          emptyOutDir: false,
          rollupOptions: {
            output: {
              entryFileNames: `js/${folder}/[name].js`,
              sourcemap: isDev,
            },
          },
        },
      });
    }),
  );
})();
