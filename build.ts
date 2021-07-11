import * as esbuild from "https://deno.land/x/esbuild@v0.12.13/mod.js";

const httpPlugin : esbuild.Plugin = {
  name: 'http',
  setup(build) {
   

    // Intercept import paths starting with "http:" and "https:" so
    // esbuild doesn't attempt to map them to a file system location.
    // Tag them with the "http-url" namespace to associate them with
    // this plugin.
    build.onResolve({ filter: /^https?:\/\// }, args => ({
      path: args.path,
      namespace: 'http-url',
    }))

    // We also want to intercept all import paths inside downloaded
    // files and resolve them against the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
      path: new URL(args.path, args.importer).toString(),
      namespace: 'http-url',
    }))

    // When a URL is loaded, we want to actually download the content
    // from the internet. This has just enough logic to be able to
    // handle the example import from unpkg.com but in reality this
    // would probably need to be more complex.
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      const contents: string = await new Promise((resolve, reject) => {
        
        fetch(args.path).then((res) => {
          if ([301, 302, 307].includes(res.status)) {
            return fetch(new URL(res.headers.get('Location') || '', args.path).toString())
          } else if (res.status === 200) {
         
            resolve(res.text())
          } else {
            reject(new Error(`GET ${args.path} failed: status ${res.status}`));
          }
        }).catch((err: string) => {
          reject(err)
        })
      })
      return { contents }
    })
  },
}


esbuild
  .build({
    entryPoints: ["./mod.ts"],
    outfile: "./deno.novaextension/Scripts/main.js",
    format: "cjs",
    bundle: true,
    plugins: [httpPlugin],
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