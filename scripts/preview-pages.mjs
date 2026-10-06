import { build, preview } from 'vite'

const options = {
  base: '/RoomLab/',
  define: { 'import.meta.env.VITE_ROUTER_MODE': JSON.stringify('hash') },
  build: { outDir: 'dist-pages' },
}
await build(options)
const server = await preview({
  ...options,
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
})
server.printUrls()
