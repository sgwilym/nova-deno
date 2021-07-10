import * as esbuild from "https://deno.land/x/esbuild@v0.12.13/mod.js";

esbuild
  .build({
    entryPoints: ["./nova-deno.ts"],
    outfile: "./deno.novaextension/Scripts/main.js",
    format: "cjs",
    bundle: true,
    watch: {
      onRebuild(error, result) {
        if (error) console.error("watch build failed:", error);
        else console.log("watch build succeeded:", result);
      },
    },
  })
  .then()
  .catch((error) => {
    console.error(error)
    Deno.exit(1)
  });