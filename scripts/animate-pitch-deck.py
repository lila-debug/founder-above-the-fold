#!/usr/bin/env python3
"""Add restrained native PowerPoint transitions without disturbing slide content."""

from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path

from defusedxml import minidom


TRANSITIONS: dict[int, tuple[str, str, dict[str, str]]] = {
    1: ("slow", "fade", {}),
    2: ("med", "push", {"dir": "l"}),
    3: ("med", "push", {"dir": "l"}),
    4: ("fast", "push", {"dir": "l"}),
    5: ("fast", "push", {"dir": "l"}),
    6: ("fast", "push", {"dir": "l"}),
    7: ("fast", "push", {"dir": "l"}),
    8: ("fast", "push", {"dir": "l"}),
    9: ("med", "wipe", {"dir": "r"}),
    10: ("med", "fade", {}),
    11: ("med", "fade", {}),
    12: ("med", "push", {"dir": "l"}),
    13: ("slow", "fade", {}),
}


def slide_number(name: str) -> int | None:
    match = re.fullmatch(r"ppt/slides/slide(\d+)\.xml", name)
    return int(match.group(1)) if match else None


def add_transition(xml_bytes: bytes, number: int) -> bytes:
    speed, effect_name, effect_attributes = TRANSITIONS[number]
    document = minidom.parseString(xml_bytes)
    slide = document.documentElement

    for existing in list(slide.childNodes):
        if existing.nodeType == existing.ELEMENT_NODE and existing.tagName == "p:transition":
            slide.removeChild(existing)

    transition = document.createElement("p:transition")
    transition.setAttribute("spd", speed)
    transition.setAttribute("advClick", "1")

    effect = document.createElement(f"p:{effect_name}")
    for key, value in effect_attributes.items():
        effect.setAttribute(key, value)
    transition.appendChild(effect)

    insertion_point = next(
        (
            node
            for node in slide.childNodes
            if node.nodeType == node.ELEMENT_NODE and node.tagName in {"p:timing", "p:extLst"}
        ),
        None,
    )
    if insertion_point is None:
        slide.appendChild(transition)
    else:
        slide.insertBefore(transition, insertion_point)

    return document.toxml(encoding="utf-8")


def animate(source: Path, destination: Path) -> None:
    if source.resolve() == destination.resolve():
        raise ValueError("Source and destination must be different so the original stays intact.")

    with zipfile.ZipFile(source, "r") as source_zip:
        slide_names = {
            number: info.filename
            for info in source_zip.infolist()
            if (number := slide_number(info.filename)) is not None
        }
        missing = sorted(set(TRANSITIONS) - set(slide_names))
        if missing:
            raise ValueError(f"Missing expected slides: {missing}")

        destination.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(destination, "w") as output_zip:
            for info in source_zip.infolist():
                data = source_zip.read(info.filename)
                number = slide_number(info.filename)
                if number in TRANSITIONS:
                    data = add_transition(data, number)
                output_zip.writestr(info, data)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    animate(args.source, args.destination)
    print(f"Animated deck written to {args.destination}")
    for slide, (speed, effect, attributes) in TRANSITIONS.items():
        detail = " ".join(f"{key}={value}" for key, value in attributes.items())
        print(f"slide {slide:02d}: {effect} {detail} speed={speed}".rstrip())


if __name__ == "__main__":
    main()
