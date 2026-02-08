const imageAssets = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default'
});

export function resolveImageAsset(relativePath) {
  const normalizedPath = String(relativePath || '').replace(/^\.?\//, '');
  const assetKey = `../assets/images/${normalizedPath}`;
  return imageAssets[assetKey] || '';
}
