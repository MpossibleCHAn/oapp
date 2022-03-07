import esbuild from "esbuild";
import path from "path";
import { spawn } from "child_process";
import { paths } from "../utils/common";

const clientEntryPoints = [path.resolve(paths.src, "client", "main.tsx")];

const serverEntryPoints = [path.resolve(paths.src, "server", "index.ts")];

const build = async function () {
  esbuild
    .build({
      entryPoints: clientEntryPoints,
      bundle: true,
      platform: "browser",
      outfile: path.resolve(paths.dist, "client", "index.js"),
    })
    .catch((e) => {
      console.log("build client error:", e);
      process.exit(1);
    });

  esbuild
    .build({
      entryPoints: serverEntryPoints,
      bundle: true,
      platform: "node",
      outfile: path.resolve(paths.dist, "server", "index.js"),
    })
    .catch((e) => {
      console.log("build server error:", e);
      process.exit(1);
    });
};

build()
