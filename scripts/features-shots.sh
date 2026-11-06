#!/usr/bin/env bash
# Makes the features and hiring flow pages' pictures (frontend/public/features/<name>-<light|dark>.webp)
# from the screens e2e_tests/signed-in/specs/zz-features-shots.spec.ts and zz-flow-shots.spec.ts
# take with SHOTS=1 (the flow's are flow-* and create): crops each to the part the page shows, converts it to WebP, and writes its size into
# frontend/src/config/features-shots.ts. The screens are taken at twice the pixels of a
# 1440 x 900 window; the crops below are in the window's pixels (left, top, width, height).
# Usage: scripts/features-shots.sh <folder with the screens> (the run's screenshots/features)
set -euo pipefail

cd "$(dirname "$0")/.."
source_dir="$1"

uv run -q --with pillow python - "$source_dir" <<'EOF'
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

CROPS = {
    "topics": (355, 210, 1000, 680),
    "invite": (459, 221, 512, 457),
    "settings": (355, 240, 1000, 640),
    "start": (90, 50, 1240, 780),
    "question": (86, 36, 1260, 640),
    "voice": (86, 36, 1260, 640),
    "brand": (350, 190, 994, 700),
    "candidates": (355, 235, 1000, 655),
    "signals": (86, 76, 1260, 640),
    "share": (459, 232, 512, 435),
    "notes": (355, 240, 1000, 460),
    "integrations": (350, 190, 994, 700),
    "bias-audit": (459, 178, 512, 544),
    "email": (30, 30, 580, 525),
    "create": (355, 371, 720, 250),
    "flow-review": (86, 96, 1260, 804),
    "flow-questions": (40, 90, 1310, 918),
    "flow-settings": (355, 240, 1000, 640),
    "flow-invite": (459, 221, 512, 457),
    "flow-question": (86, 36, 1260, 640),
    "flow-candidates": (355, 235, 1000, 655),
    "flow-share": (459, 232, 512, 435),
    "flow-report": (86, 76, 1260, 1320),
}
SCALE = 2
source = Path(sys.argv[1])
target = Path("frontend/public/features")
target.mkdir(parents=True, exist_ok=True)
config = Path("frontend/src/config/features-shots.ts")
text = config.read_text()

for name, (left, top, width, height) in CROPS.items():
    for scheme in ("light", "dark"):
        found = source / f"{name}-{scheme}.png"

        if not found.exists():
            print(f"missing {found}")
            continue

        box = tuple(value * SCALE for value in (left, top, left + width, top + height))
        cropped = Image.open(found).convert("RGB").crop(box)

        with tempfile.NamedTemporaryFile(suffix=".png") as png:
            cropped.save(png.name)
            out = target / f"{name}-{scheme}.webp"
            subprocess.run(
                ["cwebp", "-quiet", "-q", "85", "-m", "6", png.name, "-o", str(out)],
                check=True,
            )

    key = re.escape(f'"{name}"' if "-" in name else name)
    text = re.sub(
        rf"(\n  {key}: )\{{ width: \d+, height: \d+ \}}",
        rf"\g<1>{{ width: {width * SCALE}, height: {height * SCALE} }}",
        text,
    )

config.write_text(text)
EOF

# The local site's image resizer keeps each picture's sizes by address, not content: cleared, so
# the new pictures show at once.
docker compose exec -T frontend find /frontend/.next/dev/cache/images -mindepth 1 -delete \
  2>/dev/null || true
