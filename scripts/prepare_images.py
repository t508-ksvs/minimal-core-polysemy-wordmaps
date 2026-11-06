"""Convert selected source diagrams to high-quality WebP without changing dimensions."""

from __future__ import annotations

import argparse
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


def convert(stem: str, source_folder: Path, destination: Path, quality: int) -> str:
    source = source_folder / f"Codex_{stem}_43.png"
    target = destination / f"Codex_{stem}_43.webp"
    with Image.open(source) as image:
        dimensions = image.size
        image.save(target, format="WEBP", quality=quality, method=6)
    with Image.open(target) as converted:
        if converted.size != dimensions:
            raise RuntimeError(f"Dimension mismatch: {target}")
        converted.verify()
    return f"{source.name} -> {target.name} ({target.stat().st_size / 1024 / 1024:.2f} MiB)"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Folder containing Codex_*_43.png originals")
    parser.add_argument("--quality", type=int, default=95, choices=range(1, 101), metavar="1-100")
    parser.add_argument("words", nargs="+", help="Word stems, e.g. account mind_vs_heart")
    args = parser.parse_args()

    destination = Path(__file__).resolve().parents[1] / "assets"
    destination.mkdir(parents=True, exist_ok=True)
    for stem in args.words:
        if not re.fullmatch(r"[a-z]+(?:_[a-z]+)*", stem):
            parser.error(f"Invalid word stem: {stem!r}")
        if not (args.source / f"Codex_{stem}_43.png").is_file():
            parser.error(f"Missing image for: {stem}")

    with ThreadPoolExecutor(max_workers=min(4, len(args.words))) as pool:
        for result in pool.map(lambda stem: convert(stem, args.source, destination, args.quality), args.words):
            print(result, flush=True)


if __name__ == "__main__":
    main()
