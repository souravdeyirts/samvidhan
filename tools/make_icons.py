"""Draw the site icon (favicon.ico, icon-180.png, icon-512.png, favicon.svg) and the link-preview card (og-image.png).

Usage: python -I tools/make_icons.py <project dir>
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1]
SAFFRON, GREEN, NAVY, CREAM, INK, MUTED, ACCENT = "#ff9933", "#138808", "#1b2a8f", "#fffaf3", "#131a3b", "#4b5275", "#c25700"
FONTS = os.path.join(os.environ.get("WINDIR", "C:/Windows"), "Fonts")


def chakra(d, cx, cy, r, color, width, spokes=8):
    """The site's wheel mark (as in the header logo): rim, hub and spokes."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=width)
    hub = r * 0.16
    d.ellipse([cx - hub, cy - hub, cx + hub, cy + hub], fill=color)
    for i in range(spokes):
        a = i * 2 * math.pi / spokes
        d.line([cx + hub * math.cos(a), cy + hub * math.sin(a), cx + (r - width / 2) * math.cos(a), cy + (r - width / 2) * math.sin(a)],
               fill=color, width=max(1, int(width * 0.45)))


def icon(size):
    S = 8  # supersample
    n = size * S
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rad = n * 0.22
    d.rounded_rectangle([0, 0, n - 1, n - 1], radius=rad, fill=CREAM)
    chakra(d, n / 2, n * 0.46, n * 0.30, NAVY, max(S, int(n * 0.06)))
    # small saffron / green accent under the wheel
    y0, y1 = n * 0.83, n * 0.88
    d.rounded_rectangle([n * 0.26, y0, n * 0.49, y1], radius=(y1 - y0) / 2, fill=SAFFRON)
    d.rounded_rectangle([n * 0.51, y0, n * 0.74, y1], radius=(y1 - y0) / 2, fill=GREEN)
    return im.resize((size, size), Image.LANCZOS)


icon(512).save(os.path.join(root, "icon-512.png"))
icon(180).convert("RGB").save(os.path.join(root, "icon-180.png"))  # apple-touch-icon: no transparency
icon(64).save(os.path.join(root, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# the same design as SVG, for browsers that prefer it
spokes = "".join(f'<line x1="{32 + 2.9 * math.cos(i * math.pi / 4):.2f}" y1="{29.4 + 2.9 * math.sin(i * math.pi / 4):.2f}" x2="{32 + 17.5 * math.cos(i * math.pi / 4):.2f}" y2="{29.4 + 17.5 * math.sin(i * math.pi / 4):.2f}"/>' for i in range(8))
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{CREAM}"/>
<circle cx="32" cy="29.4" r="18" fill="none" stroke="{NAVY}" stroke-width="3.8"/><circle cx="32" cy="29.4" r="3" fill="{NAVY}"/>
<g stroke="{NAVY}" stroke-width="1.8">{spokes}</g>
<rect x="16.6" y="53" width="14.8" height="3.2" rx="1.6" fill="{SAFFRON}"/><rect x="32.6" y="53" width="14.8" height="3.2" rx="1.6" fill="{GREEN}"/></svg>
'''
open(os.path.join(root, "favicon.svg"), "w", encoding="utf-8", newline="\n").write(svg)

# link-preview card, 1200 x 630
W, H, S = 1200, 630, 2
im = Image.new("RGB", (W * S, H * S), CREAM)
d = ImageDraw.Draw(im)
f = lambda name, px: ImageFont.truetype(os.path.join(FONTS, name), px * S)
d.rectangle([0, 0, W * S, 14 * S], fill=SAFFRON)
d.rectangle([0, 14 * S, W * S, 28 * S], fill="#ffffff")
d.rectangle([0, 28 * S, W * S, 42 * S], fill=GREEN)
# big faint chakra on the right
chakra(d, 1010 * S, 360 * S, 230 * S, "#e7e9f7", 14 * S)
x = 80 * S
d.text((x, 118 * S), "Samvidhan", font=f("georgiab.ttf", 92), fill=INK)
w = d.textlength("Samvidhan ", font=f("georgiab.ttf", 92))
d.text((x + w, 118 * S), "Explorer", font=f("georgiab.ttf", 92), fill=ACCENT)
d.text((x, 248 * S), "The Constitution of India, explained", font=f("georgia.ttf", 46), fill=INK)
lines = ["Every Article in its official text, in plain language",
         "Amendments, landmark judgments and a time machine",
         "Your rights in everyday situations, and 848 laws"]
for i, t in enumerate(lines):
    y = (345 + i * 52) * S
    d.ellipse([x, y + 13 * S, x + 12 * S, y + 25 * S], fill=NAVY)
    d.text((x + 28 * S, y), t, font=f("segoeui.ttf", 32), fill=MUTED)
d.text((x, 540 * S), "souravdeyirts.github.io/samvidhan", font=f("segoeuib.ttf", 30), fill=NAVY)
im.resize((W, H), Image.LANCZOS).save(os.path.join(root, "og-image.png"), optimize=True)
print("ok")
