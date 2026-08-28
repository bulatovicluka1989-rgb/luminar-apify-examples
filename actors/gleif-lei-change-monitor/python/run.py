import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "runners" / "python"))

from apify_actor import run_actor  # noqa: E402

run_actor(
    "luminar/gleif-lei-change-monitor",
    Path(__file__).resolve().parent.parent / "inputs" / "quick-start.json",
)
