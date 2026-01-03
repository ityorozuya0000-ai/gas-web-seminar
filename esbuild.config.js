const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/server/main.ts'],
    bundle: true,
    outfile: 'dist/code.js',
    platform: 'node', // GAS runs in V8, closer to Node environment for many libs
    target: 'es2020',
    format: 'esm', // GAS V8 supports modern JS features
    external: [], // Add external libs if needed, but for GAS we usually bundle everything
}).catch(() => process.exit(1));
