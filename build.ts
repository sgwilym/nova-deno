import * as esbuild from "https://deno.land/x/esbuild@v0.14.11/mod.js";
import { bundle } from "https://deno.land/x/emit@0.0.2/mod.ts";

const { code } = await bundle(new URL("./src/nova_deno.ts", import.meta.url));

esbuild
  .build({
    stdin: {
      contents: code,
    },
    outfile: "./deno.novaextension/Scripts/main.js",
    format: "cjs",
    bundle: true,
  })
  .then(() => {
    console.log("Success!");
    Deno.exit(0);
  })
  .catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
