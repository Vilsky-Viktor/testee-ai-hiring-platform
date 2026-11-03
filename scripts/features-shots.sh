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
    "topics": (350, 226, 994, 664),
    "invite": (459, 248, 512, 404),
    "settings": (350, 226, 994, 470),
    "start": (100, 150, 1231, 600),
    "question": (86, 36, 1260, 480),
    "voice": (86, 36, 1260, 520),
    "brand": (350, 190, 994, 700),
    "candidates": (350, 226, 994, 664),
    "signals": (86, 36, 1260, 560),
    "share": (427, 304, 576, 292),
    "notes": (350, 236, 994, 420),
    "integrations": (350, 190, 994, 700),
    "bias-audit": (427, 172, 576, 556),
    "email": (30, 30, 580, 525),
    "create": (355, 346, 720, 270),
    "flow-review": (95, 198, 1240, 590),
    "flow-questions": (266, 29, 897, 590),
    "flow-settings": (360, 205, 975, 660),
    "flow-invite": (459, 248, 512, 404),
    "flow-question": (86, 36, 1260, 520),
    "flow-candidates": (350, 226, 994, 664),
    "flow-share": (427, 304, 576, 292),
    "flow-report": (40, 95, 1300, 1000),
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
