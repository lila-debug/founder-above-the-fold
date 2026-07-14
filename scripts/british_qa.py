#!/usr/bin/env python3
"""Founder Above the Fold British English voice gate.

Reads a draft body from stdin and exits:
- 0 when the draft passes.
- 1 when the draft fails voice or British-English checks.
- 2 when the local checker is not installed/configured.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys


ALLOWLIST = {
    "AI",
    "API",
    "CPO",
    "MCP",
    "LinkedIn",
    "Prototype",
    "Cafe",
    "roadmap",
    "roadmaps",
    "product",
    "product-led",
}

US_SPELLING_FLAGS = {
    "analyze": "Use analyse.",
    "center": "Use centre.",
    "color": "Use colour.",
    "favorite": "Use favourite.",
    "flavor": "Use flavour.",
    "honor": "Use honour.",
    "labor": "Use labour.",
    "theater": "Use theatre.",
}

PROHIBITED_PHRASES = [
    "comment below",
    "crush it",
    "game changer",
    "here's the thing",
    "hustle",
    "like and share",
    "link in comments",
    "unlock your potential",
]


def main() -> int:
    text = sys.stdin.read().strip()

    if not text:
        print("FAILED: Draft body is empty.")
        return 1

    setup_error = check_hunspell_setup()
    if setup_error:
        print(setup_error, file=sys.stderr)
        return 2

    failures = run_style_checks(text)
    failures.extend(run_hunspell(text))

    if failures:
        print("FAILED")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("PASSED")
    print("British English and Founder Above the Fold voice checks passed.")
    return 0


def check_hunspell_setup() -> str | None:
    if not shutil.which("hunspell"):
        return "Hunspell binary not found. Install hunspell with the en_GB dictionary."

    probe = subprocess.run(
        ["hunspell", "-d", "en_GB", "-l"],
        input="colour\n",
        text=True,
        capture_output=True,
        check=False,
    )

    if probe.returncode not in (0, 1):
        return probe.stderr.strip() or "Hunspell en_GB dictionary is not available."

    if "Can't open affix" in probe.stderr or "Can't open dictionary" in probe.stderr:
        return "Hunspell en_GB dictionary is not available."

    return None


def run_style_checks(text: str) -> list[str]:
    failures: list[str] = []
    lowered = text.lower()

    for spelling, message in US_SPELLING_FLAGS.items():
        if re.search(rf"\b{re.escape(spelling)}\b", lowered):
            failures.append(f"US spelling found: {spelling}. {message}")

    for phrase in PROHIBITED_PHRASES:
        if phrase in lowered:
            failures.append(f"Prohibited phrase found: {phrase}.")

    if re.search(r"(?:^|\s)#[A-Za-z0-9_]+", text):
        failures.append("Hashtag found. MVP drafts should not include hashtags unless the owner deliberately adds them.")

    if "!!!" in text:
        failures.append("Excessive exclamation marks found.")

    return failures


def run_hunspell(text: str) -> list[str]:
    result = subprocess.run(
        ["hunspell", "-d", "en_GB", "-l"],
        input=text,
        text=True,
        capture_output=True,
        check=False,
    )

    if result.returncode not in (0, 1):
        return [result.stderr.strip() or "Hunspell check failed."]

    unknown_words = sorted(
        {
            token.strip()
            for token in result.stdout.splitlines()
            if token.strip() and token.strip() not in ALLOWLIST
        },
        key=str.lower,
    )

    if not unknown_words:
        return []

    return [f"Hunspell en_GB unknown words: {', '.join(unknown_words[:20])}."]


if __name__ == "__main__":
    raise SystemExit(main())
