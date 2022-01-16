import * as esbuild from "https://deno.land/x/esbuild@v0.14.11/mod.js";

const { files } = await Deno.emit("./mod.ts", {
  bundle: "module",
});

esbuild
  .build({
    stdin: {
      contents: files["deno:///bundle.js"],
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
