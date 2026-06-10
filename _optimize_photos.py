# -*- coding: utf-8 -*-
"""Сжатие фото для сайта: thumbs для галереи, оптимизация assets/photos."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
PHOTOS = ROOT / "photos"
THUMBS = PHOTOS / "thumbs"
ASSETS = ROOT / "assets" / "photos"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}

THUMB_MAX = 480
THUMB_QUALITY = 82
ASSET_MAX = 960
ASSET_QUALITY = 85


def is_image(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in IMAGE_EXT


def save_jpeg(im: Image.Image, dst: Path, quality: int) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    im.save(dst, "JPEG", quality=quality, optimize=True)


def resize_copy(src: Path, dst: Path, max_width: int, quality: int) -> tuple[int, int]:
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.width > max_width:
            height = max(1, round(im.height * max_width / im.width))
            im = im.resize((max_width, height), Image.LANCZOS)
        save_jpeg(im, dst, quality)
    return src.stat().st_size, dst.stat().st_size


def build_thumbs() -> None:
    THUMBS.mkdir(exist_ok=True)
    done = 0
    for src in sorted(PHOTOS.iterdir()):
        if not is_image(src) or src.parent == THUMBS:
            continue
        dst = THUMBS / (src.stem + ".jpg")
        before, after = resize_copy(src, dst, THUMB_MAX, THUMB_QUALITY)
        done += 1
        print(f"thumb {src.name}: {before // 1024}KB -> {after // 1024}KB")
    print(f"thumbs ready: {done}")


def optimize_assets() -> None:
    done = 0
    for src in sorted(ASSETS.iterdir()):
        if not is_image(src):
            continue
        tmp = src.with_suffix(src.suffix + ".tmp.jpg")
        before, after = resize_copy(src, tmp, ASSET_MAX, ASSET_QUALITY)
        tmp.replace(src)
        done += 1
        print(f"asset {src.name}: {before // 1024}KB -> {after // 1024}KB")
    print(f"assets optimized: {done}")


if __name__ == "__main__":
    build_thumbs()
    optimize_assets()
