const {dtsPlugin} = require("esbuild-plugin-d.ts");
/* eslint-disable @typescript-eslint/no-var-requires */
async function start() {
  await require('esbuild').build({
    entryPoints: ['src/index.ts', 'src/binding.ts', 'src/session.ts', 'src/ui.ts', 'src/session.ts', 'src/key.ts'],
    plugins: [dtsPlugin({})],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV === 'development',
    mainFields: ['module', 'main'],
    external: ['coc.nvim'],
    platform: 'node',
    target: 'node10.12',
    outdir: 'lib',
  });
}

start()
  .then((r) => {
    if (process.argv.length > 2 && process.argv[2] === '--watch') {
      r.watch();
    }
  })
  .catch((e) => {
    console.error(e);
  });
