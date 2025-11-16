# Extension Icons

This directory contains the icons for the Browser MCP Chrome extension.

## Required Files

The extension needs three PNG icon files:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Generating Icons

### Quick Method (Placeholder Icons)

For testing purposes, create simple colored placeholders:

**Using Python with PIL:**
```bash
pip install pillow
python3 << 'EOF'
from PIL import Image

# Create placeholder icons
for size in [16, 48, 128]:
    img = Image.new('RGB', (size, size), color='#3b82f6')
    img.save(f'icon{size}.png')
print("Icons generated!")
EOF
```

**Using Node.js with canvas:**
```bash
npm install canvas
node << 'EOF'
const { createCanvas } = require('canvas');
const fs = require('fs');

[16, 48, 128].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
});
console.log('Icons generated!');
EOF
```

### Professional Method (Custom Icons)

1. **Use the SVG template:**
   - Edit `icon.svg` to customize the design
   - Use an online converter or tool to export at different sizes
   - Recommended: https://cloudconvert.com/svg-to-png

2. **Design from scratch:**
   - Use Figma, Sketch, or Adobe Illustrator
   - Export at 16x16, 48x48, and 128x128
   - Ensure the icon is clear at the smallest size

3. **Use ImageMagick (if installed):**
   ```bash
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png
   ```

## Testing

Once you've generated the icons:

1. Load the extension in Chrome
2. Check the extension toolbar - icon should appear clearly
3. Go to `chrome://extensions/` - icon should be visible
4. Click the extension icon - popup should show with proper styling

## Notes

- The extension will work without custom icons (Chrome uses a default)
- For publishing to Chrome Web Store, you'll need proper icons
- Recommended: transparent background PNG with clear visual design
- Keep the design simple - it needs to be recognizable at 16x16
