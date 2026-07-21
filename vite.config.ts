import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isMp = mode === 'miniprogram';

  return {
    build: isMp
      ? {
          outDir: 'dist',
          assetsDir: '',
          sourcemap: false,
          minify: 'esbuild',
          rollupOptions: {
            input: 'src/main.ts',
            output: {
              entryFileNames: 'game.js',
              chunkFileNames: 'chunks/[name].js',
              assetFileNames: 'assets/[name].[ext]',
              format: 'iife',
            },
          },
        }
      : {
          outDir: 'dist/browser',
        },
  };
});
