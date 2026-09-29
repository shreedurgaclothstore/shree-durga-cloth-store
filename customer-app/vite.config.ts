import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscatorPlugin from 'rollup-plugin-obfuscator';

const obfuscator = (obfuscatorPlugin as any).default || obfuscatorPlugin;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        shuffleStringArray: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 8,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.8,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
      }
    })
  ],
  build: {
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    host: true
  }
});
