#!/usr/bin/env python3
"""Founder Above the Fold - launch film renderer.

Cuts the 60-second landscape master and the 30-second portrait social cut
from the deployed 4K screen captures. Hard cuts only, per the shot board:
no circular overlays, no talking-head bubbles, no crossfades.
"""

import os
import subprocess
import sys

SRC = ("/sessions/wizardly-pensive-rubin/mnt/Founder Above the Fold/"
       "output/live-screen-captures-4k-2026-07-19")
CARDS = "/tmp/fatf/cards"
BUILD = "/tmp/fatf/build"
FPS = 30

os.makedirs(BUILD, exist_ok=True)


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-3000:])
        raise SystemExit(f"FAILED: {cmd[:160]}")
    return r


def card(name, src, dur, out, w, h):
    """Static brand card with a slow drift - held, not dead."""
    frames = int(dur * FPS)
    vf = (
        f"scale={int(w*1.06)}:{int(h*1.06)},"
        f"zoompan=z='1.0':d={frames}:s={w}x{h}:fps={FPS}:"
        f"x='(iw-{w})*(on/{frames})*0.55':y='(ih-{h})*0.5'"
    )
    run(f'ffmpeg -y -loop 1 -i "{src}" -vf "{vf}" -t {dur} '
        f'-r {FPS} -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p '
        f'-x264-params keyint=30 "{out}"')


def screen(name, src, overlay, dur, out, w, h, mode="push", hold=0.0):
    """Product screen with a slow push or vertical reveal, plus a label plate.

    hold - seconds before the label plate snaps in (0 = present from frame 1).
    """
    frames = int(dur * FPS)
    if mode == "push":
        # centred push from 1.00 to ~1.07
        zp = (f"zoompan=z='min(1.0+0.0009*on,1.07)':d={frames}:s={w}x{h}:fps={FPS}:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'")
        pre = f"scale={w}:{h}"
    elif mode == "pull":
        zp = (f"zoompan=z='max(1.07-0.0009*on,1.0)':d={frames}:s={w}x{h}:fps={FPS}:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'")
        pre = f"scale={w}:{h}"
    else:  # reveal - slow vertical drift down an oversized frame
        zp = (f"zoompan=z='1.0':d={frames}:s={w}x{h}:fps={FPS}:"
              f"x='(iw-{w})*0.5':y='(ih-{h})*(on/{frames})'")
        pre = f"scale={int(w*1.10)}:{int(h*1.10)}"

    base = f"[0:v]{pre},{zp},setsar=1[bg]"
    if hold > 0:
        ov = (f"{base};[1:v]scale={w}:{h}[ov];"
              f"[bg][ov]overlay=0:0:enable='gte(t,{hold})'[v]")
    else:
        ov = f"{base};[1:v]scale={w}:{h}[ov];[bg][ov]overlay=0:0[v]"

    run(f'ffmpeg -y -loop 1 -i "{src}" -loop 1 -i "{overlay}" '
        f'-filter_complex "{ov}" -map "[v]" -t {dur} -r {FPS} '
        f'-c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p '
        f'-x264-params keyint=30 "{out}"')


def concat(segments, out):
    lst = os.path.join(BUILD, "concat_" + os.path.basename(out) + ".txt")
    with open(lst, "w") as fh:
        for s in segments:
            fh.write(f"file '{s}'\n")
    run(f'ffmpeg -y -f concat -safe 0 -i "{lst}" -c copy "{out}"')


# ---------------------------------------------------------------------------
# 60-second landscape master - 3840x2160
# ---------------------------------------------------------------------------

W, H = 3840, 2160
S9 = f"{SRC}/16x9"

MASTER = [
    # (kind, source, overlay, seconds, motion, label-hold)
    ("card",   f"{CARDS}/c01-hook.png",            None,                        3.2, None,     0),
    ("screen", f"{S9}/10-no-circle-of-hell.png",   f"{CARDS}/l01-opposite.png", 4.2, "push",   0.9),
    ("card",   f"{CARDS}/c02-not-scheduler.png",   None,                        3.2, None,     0),
    ("screen", f"{S9}/01-owner-sign-in.png",       f"{CARDS}/l02-nopassword.png", 4.0, "push", 0.8),
    ("screen", f"{S9}/08-try-the-mechanism.png",   f"{CARDS}/l03-write.png",    2.6, "push",   0.3),
    ("screen", f"{S9}/08-try-the-mechanism.png",   f"{CARDS}/l04-clamp.png",    2.6, "reveal", 0.2),
    ("screen", f"{S9}/08-try-the-mechanism.png",   f"{CARDS}/l05-queue.png",    2.8, "pull",   0.2),
    ("card",   f"{CARDS}/c03-clamp.png",           None,                        3.6, None,     0),
    ("screen", f"{S9}/14-product-showroom.png",    f"{CARDS}/l06-showroom.png", 5.2, "push",   0.9),
    ("screen", f"{S9}/07-build-manual.png",        f"{CARDS}/l07-manual.png",   4.6, "reveal", 0.9),
    ("card",   f"{CARDS}/c04-boundary.png",        None,                        3.8, None,     0),
    ("screen", f"{S9}/11-privacy.png",             f"{CARDS}/l08-privacy.png",  4.0, "push",   0.8),
    ("screen", f"{S9}/03-pricing.png",             f"{CARDS}/l09-price.png",    4.6, "push",   0.8),
    ("screen", f"{S9}/09-private-beta-waitlist.png", f"{CARDS}/l10-place.png",  4.4, "pull",   0.8),
    ("card",   f"{CARDS}/c05-end.png",             None,                        7.2, None,     0),
]

# ---------------------------------------------------------------------------
# 30-second portrait social cut - 2160x3840
# ---------------------------------------------------------------------------

PW, PH = 2160, 3840
S16 = f"{SRC}/9x16"

SOCIAL = [
    ("card",   f"{CARDS}/p01-hook.png",             None,                       2.8, None,     0),
    ("screen", f"{S16}/10-no-circle-of-hell.png",   f"{CARDS}/q01-opposite.png", 3.4, "push",  0.7),
    ("screen", f"{S16}/08-try-the-mechanism.png",   f"{CARDS}/q02-write.png",   2.4, "push",   0.2),
    ("screen", f"{S16}/08-try-the-mechanism.png",   f"{CARDS}/q03-clamp.png",   2.4, "reveal", 0.2),
    ("screen", f"{S16}/08-try-the-mechanism.png",   f"{CARDS}/q04-queue.png",   2.6, "pull",   0.2),
    ("card",   f"{CARDS}/p02-clamp.png",            None,                       3.0, None,     0),
    ("screen", f"{S16}/14-product-showroom.png",    f"{CARDS}/q05-showroom.png", 3.6, "push",  0.7),
    ("card",   f"{CARDS}/p03-boundary.png",         None,                       3.0, None,     0),
    ("screen", f"{S16}/11-privacy.png",             f"{CARDS}/q06-privacy.png", 3.0, "push",   0.7),
    ("card",   f"{CARDS}/p04-end.png",              None,                       5.0, None,     0),
]


def good(path, dur):
    """A segment counts as built only if it decodes at roughly the right length."""
    if not os.path.exists(path) or os.path.getsize(path) < 20000:
        return False
    r = subprocess.run(
        f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{path}"',
        shell=True, capture_output=True, text=True)
    try:
        return abs(float(r.stdout.strip()) - dur) < 0.35
    except ValueError:
        return False


def build(plan, w, h, tag, budget=None):
    """Render any segments not already present. Resumable across invocations."""
    import time
    start = time.time()
    segs = []
    for i, (kind, src, ov, dur, mode, hold) in enumerate(plan):
        out = f"{BUILD}/{tag}-{i:02d}.mp4"
        segs.append(out)
        if good(out, dur):
            continue
        if budget and (time.time() - start) > budget:
            print(f"  [{tag}] budget reached at {i:02d}")
            return segs, False
        if kind == "card":
            card(tag, src, dur, out, w, h)
        else:
            screen(tag, src, ov, dur, out, w, h, mode=mode, hold=hold)
        print(f"  [{tag}] {i:02d} {os.path.basename(src)} {dur}s")
    return segs, True


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "both"
    budget = float(sys.argv[2]) if len(sys.argv) > 2 else 33.0

    done_all = True

    if which in ("both", "master"):
        segs, done = build(MASTER, W, H, "m", budget)
        done_all &= done
        if done:
            concat(segs, f"{BUILD}/founder-above-the-fold-launch-4k-16x9.mp4")
            print("MASTER COMPLETE")

    if which in ("both", "social") and done_all:
        segs, done = build(SOCIAL, PW, PH, "s", budget)
        done_all &= done
        if done:
            concat(segs, f"{BUILD}/founder-above-the-fold-launch-4k-9x16.mp4")
            print("SOCIAL COMPLETE")

    print("ALL DONE" if done_all else "MORE PASSES NEEDED")
