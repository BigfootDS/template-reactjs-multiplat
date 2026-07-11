# Source branding assets

`icon.svg` is the square master icon. Capacitor Assets generates Android icons and splash screens from it, while Electron Builder turns it into the format each desktop target needs.

`logo.svg` is a horizontal placeholder logo for template documentation or a future browser landing screen. It is not copied into platform output automatically.

Replace both files when creating a real product. Keep the icon square, preserve an SVG or large raster source, and regenerate platform resources instead of editing Android or packaged Electron assets by hand.
