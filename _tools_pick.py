import os, json
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.abspath(__file__))
DST = os.path.join(ROOT, "assets", "photos")
os.makedirs(DST, exist_ok=True)

mapping = json.load(open(os.path.join(ROOT, "_review", "mapping.json"), encoding="utf-8"))

# index (как на контактном листе) -> имя файла назначения
picks = {
    # --- история (хронология) ---
    32: "story-01-love.jpg",      # свадьба родителей
    5:  "story-02-birth.jpg",     # новорождённый
    15: "story-03-smile.jpg",     # первая улыбка
    63: "story-04-5months.jpg",   # 5 месяцев (шарик)
    10: "story-05-sitting.jpg",   # сидит, первый прикорм
    29: "story-06-foods.jpg",     # весёлый месси с едой
    40: "story-07-crib.jpg",      # встаёт у кроватки
    9:  "story-08-beach.jpg",     # лето на море
    75: "story-09-now.jpg",       # уже катается
    # --- семья ---
    64: "family-dad.jpg",
    74: "family-baby.jpg",
    25: "family-mom.jpg",
    76: "family-all.jpg",
    # --- герой ---
    13: "hero.jpg",
    # --- галерея ---
    14: "gallery-1.jpg",
    23: "gallery-2.jpg",
    28: "gallery-3.jpg",
    50: "gallery-4.jpg",
    44: "gallery-5.jpg",
    31: "gallery-6.jpg",
    52: "gallery-7.jpg",
    78: "gallery-8.jpg",
    2:  "gallery-9.jpg",
    81: "gallery-10.jpg",
}

MAX = 1500
for idx, dstname in picks.items():
    src = os.path.join(ROOT, mapping[str(idx)])
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((MAX, MAX))
    out = os.path.join(DST, dstname)
    im.save(out, "JPEG", quality=86, optimize=True)
    print(f"#{idx:>3} -> {dstname:<24} {im.width}x{im.height}")

print("OK, files:", len(picks))
