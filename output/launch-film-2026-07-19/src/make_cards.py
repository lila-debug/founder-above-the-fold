#!/usr/bin/env python3
"""Founder Above the Fold - launch film card generator.

Builds title cards and lower-third label plates in the deployed brand language:
square edges, block shadows, Archivo Black headlines, CS Claire Mono rail labels.
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/tmp/fatf/cards"
os.makedirs(OUT, exist_ok=True)

# --- deployed palette (apps/web/src/app/globals.css) -------------------------
INK = (16, 16, 16)
ORANGE = (240, 90, 40)      # #f05a28
TEAL = (73, 168, 148)       # #49a894
YELLOW = (244, 209, 61)     # #f4d13d
CYAN = (39, 199, 239)       # #27c7ef
PAPER = (247, 241, 223)     # #f7f1df
OFFWHITE = (255, 254, 248)  # #fffef8

HEAVY = "/tmp/fatf/ArchivoBlack.ttf"
MONO = "/tmp/fatf/claire.otf"

W, H = 3840, 2160
PW, PH = 2160, 3840


def f(path, size):
    return ImageFont.truetype(path, size)


def track_text(draw, xy, text, font, fill, tracking=0):
    """Draw text with manual letter tracking. Returns advance width."""
    x, y = xy
    for ch in text:
        if draw is not None:
            draw.text((x, y), ch, font=font, fill=fill)
        x += draw_len(font, ch) + tracking
    return x - xy[0]


def draw_len(font, ch):
    return font.getlength(ch)


def measure_tracked(font, text, tracking=0):
    return sum(font.getlength(c) for c in text) + tracking * max(len(text) - 1, 0)


def rail(draw, x, y, text, size, fg, bg=None, pad=14, tracking=None):
    """CS Claire Mono rail label, optionally on a solid plate."""
    fnt = f(MONO, size)
    tr = size * 0.16 if tracking is None else tracking
    w = measure_tracked(fnt, text, tr)
    asc, desc = fnt.getmetrics()
    h = asc + desc
    if bg is not None:
        draw.rectangle([x, y, x + w + pad * 2, y + h + pad * 2], fill=bg)
        draw.rectangle([x, y, x + w + pad * 2, y + h + pad * 2], outline=INK, width=5)
        track_text(draw, (x + pad, y + pad), text, fnt, fg, tr)
        return (w + pad * 2, h + pad * 2)
    track_text(draw, (x, y), text, fnt, fg, tr)
    return (w, h)


def headline(draw, x, y, lines, size, fill, leading=0.92, tracking=-0.012, shadow=None):
    """Archivo Black stacked headline, tight leading, slight negative tracking."""
    fnt = f(HEAVY, size)
    tr = size * tracking
    step = int(size * leading)
    for i, line in enumerate(lines):
        ly = y + i * step
        if shadow is not None:
            track_text(draw, (x + size * 0.035, ly + size * 0.035), line, fnt, shadow, tr)
        track_text(draw, (x, ly), line, fnt, fill, tr)
    return len(lines) * step


def logo_lockup(draw, x, y, scale=1.0, on_dark=False):
    """ABOVE / THE FOLD stacked lockup, matching the deployed header mark.

    Deployed behaviour: 'ABOVE' in the foreground colour, 'THE FOLD' reversed
    out of a solid plate. Plate is ink on light/colour, orange on ink.
    """
    s = int(60 * scale)
    fnt = f(HEAVY, s)
    fg = OFFWHITE if on_dark else INK
    plate = ORANGE if on_dark else INK
    plate_fg = INK if on_dark else OFFWHITE
    track_text(draw, (x, y), "ABOVE", fnt, fg, s * -0.01)
    w = measure_tracked(fnt, "THE FOLD", s * -0.01)
    y2 = y + int(s * 1.04)
    draw.rectangle([x - 10, y2 - 6, x + w + 14, y2 + int(s * 1.18)], fill=plate)
    track_text(draw, (x, y2), "THE FOLD", fnt, plate_fg, s * -0.01)


def corner_plate(draw, w, h, colour, thickness=26):
    """Hard square frame - the assembly-panel edge used across the product."""
    draw.rectangle([0, 0, w - 1, h - 1], outline=colour, width=thickness)


# --------------------------------------------------------------------------
# 16:9 title cards
# --------------------------------------------------------------------------

def card_16x9(name, bg, kicker, lines, size, fg=INK, kicker_bg=None,
              kicker_fg=None, footer=None, footer_fg=None, frame=None):
    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    if frame:
        corner_plate(d, W, H, frame)

    x = 300
    logo_lockup(d, x, 210, scale=1.7, on_dark=(bg == INK))

    ky = 560
    if kicker:
        rail(d, x, ky, kicker, 54,
             kicker_fg if kicker_fg else (INK if kicker_bg else fg),
             bg=kicker_bg)

    hy = 780
    used = headline(d, x, hy, lines, size, fg)

    if footer:
        fy = hy + used + 96
        # accent rule then the footing line, sized to read at social scale
        d.rectangle([x, fy - 44, x + 260, fy - 32],
                    fill=footer_fg if footer_fg else fg)
        rail(d, x, fy, footer, 62, footer_fg if footer_fg else fg)

    im.save(f"{OUT}/{name}.png")
    return im


# --------------------------------------------------------------------------
# Lower-third label plates (transparent, overlaid on product screens)
# --------------------------------------------------------------------------

def lower_third(name, kicker, line, plate=YELLOW, size=150, width=W, height=H):
    im = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    margin = 300 if width == W else 170
    fnt = f(HEAVY, size)
    tr = size * -0.012
    tw = measure_tracked(fnt, line, tr)
    asc, desc = fnt.getmetrics()
    th = asc + desc

    pad_x, pad_y = 64, 40
    box_w = tw + pad_x * 2
    box_h = th + pad_y * 2

    ky = 0
    kh = 0
    if kicker:
        kf = f(MONO, 44)
        ktr = 44 * 0.18
        kw = measure_tracked(kf, kicker, ktr)
        ka, kd = kf.getmetrics()
        kh = ka + kd + 32

    total = box_h + kh + 16
    y0 = height - margin - total

    if kicker:
        kf = f(MONO, 44)
        ktr = 44 * 0.18
        kw = measure_tracked(kf, kicker, ktr)
        ka, kd = kf.getmetrics()
        d.rectangle([margin, y0, margin + kw + 44, y0 + ka + kd + 28], fill=INK)
        track_text(d, (margin + 22, y0 + 14), kicker, kf, OFFWHITE, ktr)
        y0 += kh + 16

    # block shadow then plate - the product's panel signature
    d.rectangle([margin + 16, y0 + 16, margin + box_w + 16, y0 + box_h + 16], fill=INK)
    d.rectangle([margin, y0, margin + box_w, y0 + box_h], fill=plate)
    d.rectangle([margin, y0, margin + box_w, y0 + box_h], outline=INK, width=7)
    track_text(d, (margin + pad_x, y0 + pad_y - int(size * 0.02)), line, fnt, INK, tr)

    im.save(f"{OUT}/{name}.png")


# --------------------------------------------------------------------------
# 9:16 portrait cards
# --------------------------------------------------------------------------

def card_9x16(name, bg, kicker, lines, size, fg=INK, kicker_bg=None, footer=None):
    im = Image.new("RGB", (PW, PH), bg)
    d = ImageDraw.Draw(im)
    x = 170
    logo_lockup(d, x, 330, scale=1.9, on_dark=(bg == INK))
    if kicker:
        rail(d, x, 760, kicker, 58, INK if kicker_bg else fg, bg=kicker_bg)
    used = headline(d, x, 1020, lines, size, fg)
    if footer:
        rail(d, x, 1020 + used + 90, footer, 50, fg)
    im.save(f"{OUT}/{name}.png")


if __name__ == "__main__":
    # ---- 16:9 -------------------------------------------------------------
    card_16x9("c01-hook", ORANGE, "PRIVATE FOUNDER OPERATING SYSTEM",
              ["LINKEDIN", "IS A CHORE."], 420,
              kicker_bg=YELLOW,
              footer="SO IT NEVER GETS DONE.")

    card_16x9("c02-not-scheduler", INK, "WHAT THIS IS NOT",
              ["NOT ANOTHER", "SCHEDULER."], 400, fg=OFFWHITE,
              kicker_bg=YELLOW,
              footer="SCHEDULERS POST. THEY DO NOT MAKE YOU CREDIBLE.",
              footer_fg=YELLOW)

    card_16x9("c03-clamp", YELLOW, "THE VOICE CLAMP",
              ["IF THE VOICE", "FAILS, THE QUEUE", "STAYS SHUT."], 320,
              kicker_bg=OFFWHITE,
              footer="EDIT THE DRAFT AND THE OLD PASS IS VOID.")

    card_16x9("c04-boundary", INK, "THE SAFETY BOUNDARY",
              ["NO SCRAPING.", "NO AUTO-DMS.", "NO BOTS."], 360, fg=OFFWHITE,
              kicker_bg=CYAN,
              footer="OFFICIAL LINKEDIN API RAIL, UNDER OWNER CONTROL.",
              footer_fg=CYAN)

    end = card_16x9("c05-end", ORANGE, "REVOLUTIONISING LIFE SINCE 1982",
                    ["TAKE YOUR", "PLACE."], 440,
                    kicker_bg=YELLOW)
    # hard CTA plate - the only thing the viewer has to remember
    d = ImageDraw.Draw(end)
    bf = f(HEAVY, 132)
    url = "FOUNDERACCOUNT.COM"
    tr = 132 * -0.01
    tw = measure_tracked(bf, url, tr)
    asc, desc = bf.getmetrics()
    bx, by = 300, 1700
    bw, bh = tw + 130, asc + desc + 76
    d.rectangle([bx + 18, by + 18, bx + bw + 18, by + bh + 18], fill=INK)
    d.rectangle([bx, by, bx + bw, by + bh], fill=YELLOW)
    d.rectangle([bx, by, bx + bw, by + bh], outline=INK, width=8)
    track_text(d, (bx + 65, by + 34), url, bf, INK, tr)
    rail(d, bx, by + bh + 56, "FOUNDER ABOVE THE FOLD - PRIVATE BETA", 58, INK)
    end.save(f"{OUT}/c05-end.png")

    # ---- 16:9 lower thirds ------------------------------------------------
    lower_third("l01-opposite", "THE PROBLEM", "SO WE BUILT THE OPPOSITE.", YELLOW)
    lower_third("l02-nopassword", "OWNER CABINET", "NO PASSWORD. NO HANDOVER.", CYAN)
    lower_third("l03-write", "STEP 01", "WRITE THE WORK.", OFFWHITE)
    lower_third("l04-clamp", "STEP 02", "CLAMP THE VOICE.", YELLOW)
    lower_third("l05-queue", "STEP 03", "QUEUE WHAT PASSES.", TEAL)
    lower_third("l06-showroom", "THE BUILD", "SIXTEEN SCREENS. ONE ASSEMBLY.", CYAN)
    lower_third("l07-manual", "EVERY PART", "SHIPS WITH ITS MANUAL.", YELLOW)
    lower_third("l08-privacy", "PROVABLE", "OFFICIAL API ONLY.", OFFWHITE)
    lower_third("l09-price", "DIRECT", "CA$199 ONCE. CA$69 A MONTH.", YELLOW)
    lower_third("l10-place", "PRIVATE BETA", "REQUEST YOUR PLACE.", TEAL)

    # ---- 9:16 -------------------------------------------------------------
    card_9x16("p01-hook", ORANGE, "FOUNDER OPERATING SYSTEM",
              ["LINKEDIN", "IS A", "CHORE."], 400, kicker_bg=YELLOW)
    card_9x16("p02-clamp", YELLOW, "THE VOICE CLAMP",
              ["VOICE FAILS?", "QUEUE", "STAYS SHUT."], 300, kicker_bg=OFFWHITE)
    card_9x16("p03-boundary", INK, "THE BOUNDARY",
              ["NO SCRAPING.", "NO BOTS.", "NO DMS."], 300, fg=OFFWHITE,
              kicker_bg=CYAN)
    card_9x16("p04-end", ORANGE, "PRIVATE BETA",
              ["TAKE", "YOUR", "PLACE."], 420, kicker_bg=YELLOW)
    pend = Image.open(f"{OUT}/p04-end.png")
    pd = ImageDraw.Draw(pend)
    purl = "FOUNDERACCOUNT.COM"
    pbx, pby = 170, 2500
    # size the CTA plate to the frame, never past the safe right edge
    psize = 138
    while psize > 60:
        pbf = f(HEAVY, psize)
        ptr = psize * -0.012
        ptw = measure_tracked(pbf, purl, ptr)
        if pbx + ptw + 110 + 40 <= PW - 170:
            break
        psize -= 4
    pa, pdc = pbf.getmetrics()
    pbw, pbh = ptw + 110, pa + pdc + 70
    pd.rectangle([pbx + 16, pby + 16, pbx + pbw + 16, pby + pbh + 16], fill=INK)
    pd.rectangle([pbx, pby, pbx + pbw, pby + pbh], fill=YELLOW)
    pd.rectangle([pbx, pby, pbx + pbw, pby + pbh], outline=INK, width=8)
    track_text(pd, (pbx + 55, pby + 30), purl, pbf, INK, ptr)
    rail(pd, pbx, pby + pbh + 54, "FOUNDER ABOVE THE FOLD", 56, INK)
    pend.save(f"{OUT}/p04-end.png")

    for n, k, l, c in [
        ("q01-opposite", "THE PROBLEM", "WE BUILT THE OPPOSITE.", YELLOW),
        ("q02-write", "STEP 01", "WRITE THE WORK.", OFFWHITE),
        ("q03-clamp", "STEP 02", "CLAMP THE VOICE.", YELLOW),
        ("q04-queue", "STEP 03", "QUEUE WHAT PASSES.", TEAL),
        ("q05-showroom", "THE BUILD", "ONE ASSEMBLY.", CYAN),
        ("q06-privacy", "PROVABLE", "OFFICIAL API ONLY.", OFFWHITE),
    ]:
        lower_third(n, k, l, c, size=118, width=PW, height=PH)

    print("cards written to", OUT)
