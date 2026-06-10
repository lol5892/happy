# -*- coding: utf-8 -*-
"""Сборка папки dist/ и архива для выкладки на хостинг."""
from __future__ import annotations

import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
ARCHIVE = ROOT / "happy-site.zip"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


def read_gallery_files() -> list[str]:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    match = re.search(
        r'<script id="gallery-data" type="application/json">(.*?)</script>',
        html,
        re.S,
    )
    if not match:
        raise SystemExit("gallery-data not found in index.html")
    return json.loads(match.group(1))


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def patch_script_for_php_hosting() -> None:
    path = DIST / "script.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace('fetch("/api/rsvp"', 'fetch("rsvp.php"')
    path.write_text(text, encoding="utf-8")


def write_hosting_files() -> None:
    (DIST / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n",
        encoding="utf-8",
    )
    (DIST / ".htaccess").write_text(
        "\n".join(
            [
                "AddDefaultCharset UTF-8",
                "Options -Indexes",
                "",
                "<IfModule mod_expires.c>",
                "  ExpiresActive On",
                "  ExpiresByType text/css \"access plus 7 days\"",
                "  ExpiresByType application/javascript \"access plus 7 days\"",
                "  ExpiresByType image/jpeg \"access plus 30 days\"",
                "  ExpiresByType image/png \"access plus 30 days\"",
                "  ExpiresByType image/webp \"access plus 30 days\"",
                "</IfModule>",
                "",
                "<IfModule mod_deflate.c>",
                "  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json",
                "</IfModule>",
            ]
        )
        + "\n",
        encoding="utf-8",
    )


def build() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for name in ("index.html", "styles.css", "script.js", "rsvp.php", "rsvp-config.example.php"):
        copy_file(ROOT / name, DIST / name)

    assets_src = ROOT / "assets"
    for path in assets_src.rglob("*"):
        if path.is_file():
            copy_file(path, DIST / "assets" / path.relative_to(assets_src))

    gallery_files = read_gallery_files()
    photos_src = ROOT / "photos"
    missing: list[str] = []
    copied = 0
    for name in gallery_files:
        src = photos_src / name
        if not src.is_file():
            missing.append(name)
            continue
        copy_file(src, DIST / "photos" / name)
        copied += 1

    write_hosting_files()
    patch_script_for_php_hosting()

    if ARCHIVE.exists():
        ARCHIVE.unlink()
    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(DIST.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(DIST).as_posix())

    total_mb = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file()) / (1024 * 1024)
    archive_mb = ARCHIVE.stat().st_size / (1024 * 1024)

    print(f"dist ready: {DIST}")
    print(f"archive: {ARCHIVE}")
    print(f"gallery photos copied: {copied}/{len(gallery_files)}")
    print(f"dist size: {total_mb:.1f} MB")
    print(f"zip size: {archive_mb:.1f} MB")
    if missing:
        print("missing gallery files:")
        for name in missing:
            print(f"  - {name}")


if __name__ == "__main__":
    build()
