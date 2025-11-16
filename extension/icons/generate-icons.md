# Generating Extension Icons

The extension requires three icon sizes:
- `icon16.png` - 16x16 pixels (toolbar)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Option 1: Use the SVG Template

Use the `icon.svg` file in this directory to generate PNG icons at the required sizes.

### Using ImageMagick (recommended):

```bash
# Install ImageMagick if needed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Using Inkscape:

```bash
# Install Inkscape if needed
# macOS: brew install inkscape
# Ubuntu: sudo apt-get install inkscape

# Generate icons
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

### Using Online Tools:

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set the width/height for each size
4. Download and rename appropriately

## Option 2: Create Your Own Icons

Use any image editor to create PNG files at the required sizes. The icon should represent browser automation or AI integration.

**Design Tips:**
- Use simple, clear shapes
- Ensure the icon is recognizable at 16x16
- Use colors that stand out in the browser toolbar
- Consider using the MCP or browser automation theme

## Option 3: Use Placeholder Icons (Temporary)

If you just want to test the extension, you can create simple colored squares as placeholders:

```bash
# Using ImageMagick to create colored placeholders
convert -size 16x16 xc:#3b82f6 icon16.png
convert -size 48x48 xc:#3b82f6 icon48.png
convert -size 128x128 xc:#3b82f6 icon128.png
```

The extension will work with placeholder icons, but you should replace them with proper icons before publishing.
