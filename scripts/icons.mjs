import sharp from 'sharp'
for (const [name, size] of [['pwa-192.png', 192], ['pwa-512.png', 512], ['pwa-maskable.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp('public/icon.svg').resize(size, size).png().toFile(`public/${name}`)
}
