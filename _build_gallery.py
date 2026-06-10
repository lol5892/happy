import json
import os
import re
from pathlib import Path

root = Path(__file__).resolve().parent
photos_dir = root / "photos"
index = root / "index.html"

IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp")

files = sorted(
    f
    for f in os.listdir(photos_dir)
    if os.path.isfile(photos_dir / f)
    and f.lower().endswith(IMAGE_EXT)
    and f not in (".jpg",)
    and not f.startswith("template-")
    and not f.startswith("_")
)

gallery_json = json.dumps(files, ensure_ascii=False)
data_script = f'  <script id="gallery-data" type="application/json">{gallery_json}</script>\n'

html = index.read_text(encoding="utf-8")

# update or insert gallery-data script
if 'id="gallery-data"' in html:
    html = re.sub(
        r'  <script id="gallery-data" type="application/json">.*?</script>\n',
        data_script,
        html,
        count=1,
        flags=re.S,
    )
else:
    html = html.replace(
        '  <script src="script.js"></script>',
        data_script + '  <script src="script.js"></script>',
    )

marquee = """    <div class="gallery-marquee" aria-label="Наши любимые моменты">
      <div class="gallery-marquee__track" id="gallery-track"></div>
    </div>"""

pattern = (
    r'    <div class="gallery-marquee(?: reveal)?".*?</div>\n  </section>\n\n'
    r'  <!-- ====================== ПОДТВЕРДИТЬ'
)
replacement = marquee + "\n  </section>\n\n  <!-- ====================== ПОДТВЕРДИТЬ"
html, n = re.subn(pattern, replacement, html, count=1, flags=re.S)
if n != 1:
    raise SystemExit("gallery block not found in index.html")

index.write_text(html, encoding="utf-8")
print("gallery updated:", len(files), "photos")
print("run _optimize_photos.py to refresh thumbs after adding photos")
