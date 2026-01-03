import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
    plugins: [vue(), viteSingleFile()],
    root: './src/client',
    build: {
        outDir: '../../dist',
        emptyOutDir: false, // Don't delete dist as esbuild will output there too
    }
})
