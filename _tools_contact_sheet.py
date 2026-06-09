import os, json, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_review")
os.makedirs(OUT, exist_ok=True)

# собрать все jpg в корне (без assets и _review)
files = []
for f in glob.glob(os.path.join(ROOT, "*.jpg")):
    files.append(f)
files.sort()  # детерминированный порядок

mapping = {}
for i, f in enumerate(files, 1):
    mapping[i] = os.path.basename(f)

with open(os.path.join(OUT, "mapping.json"), "w", encoding="utf-8") as fh:
    json.dump(mapping, fh, ensure_ascii=False, indent=2)

# параметры сетки
COLS = 4
THUMB_W, THUMB_H = 360, 270
PAD = 14
LABEL_H = 30
PER_SHEET = 24  # 4 x 6

try:
    font = ImageFont.truetype("arial.ttf", 26)
except Exception:
    font = ImageFont.load_default()

cell_w = THUMB_W + PAD * 2
cell_h = THUMB_H + LABEL_H + PAD * 2

def make_sheet(batch, sheet_idx):
    rows = (len(batch) + COLS - 1) // COLS
    W = COLS * cell_w
    H = rows * cell_h
    sheet = Image.new("RGB", (W, H), (253, 248, 236))
    draw = ImageDraw.Draw(sheet)
    for n, (idx, path) in enumerate(batch):
        r, c = divmod(n, COLS)
        x = c * cell_w + PAD
        y = r * cell_h + PAD
        try:
            im = Image.open(path).convert("RGB")
        except Exception as e:
            draw.rectangle([x, y, x+THUMB_W, y+THUMB_H], fill=(220,220,220))
            draw.text((x+6, y+6), f"ERR {idx}", fill=(200,0,0), font=font)
            continue
        im.thumbnail((THUMB_W, THUMB_H))
        ox = x + (THUMB_W - im.width)//2
        oy = y + (THUMB_H - im.height)//2
        sheet.paste(im, (ox, oy))
        # подпись с номером
        label = f"#{idx}"
        draw.rectangle([x, y+THUMB_H, x+THUMB_W, y+THUMB_H+LABEL_H], fill=(47,115,179))
        draw.text((x+8, y+THUMB_H+3), label, fill=(255,255,255), font=font)
    out = os.path.join(OUT, f"sheet_{sheet_idx}.png")
    sheet.save(out, "PNG")
    return out

items = list(mapping.items())
items = [(i, os.path.join(ROOT, name)) for i, name in items]

sheets = []
for s, start in enumerate(range(0, len(items), PER_SHEET), 1):
    batch = items[start:start+PER_SHEET]
    sheets.append(make_sheet(batch, s))

print("TOTAL", len(items))
print("SHEETS", len(sheets))
for s in sheets:
    print(s)
