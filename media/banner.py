#!/usr/bin/env python3
"""Draws the dashkit banner — "Quiet Routing" (see design-philosophy.md).

    python media/banner.py <canvas-fonts dir>

Writes media/banner.svg (rounded corners, for the README) and
media/social-preview.svg (square, for GitHub's social preview). Fonts are
subset to the glyphs actually used and embedded, so the SVG renders identically
wherever it is shown as an image, with no external requests.
"""
import base64
import io
import math
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

W, H = 1280, 640
M = 64  # outer margin, keeps everything inside GitHub's social-preview crop

INK = "#0C1117"
BONE = "#EDE6D8"
AMBER = "#E8B931"
TEAL = "#3E9C94"
RULE = "#222A33"
RAIL = "#3A444F"
LABEL = "#7C8591"

WORDMARK = "dashkit"
TAGLINE = ["Power BI skills,", "routed to every AI tool."]
KICKER = "PLATE 02 — ROUTING"
FOOT = "one command · five tools · one project at a time"
FIG = "fig. 1 — a single trunk, divided"
TOOLS = ["claude", "copilot", "cursor", "codex", "gemini"]

# Five lanes on a 72px rhythm around the trunk. The left column hangs its
# baselines on the same lines, so the whole plate shares one grid.
LANES = [320 + (i - 2) * 72 for i in range(5)]


def embed(font_path: Path, text: str, family: str, style: str = "normal") -> str:
    """Subset a font to `text` and return an @font-face rule with it inline."""
    font = TTFont(font_path)
    opts = subset.Options()
    opts.layout_features = ["kern", "liga"]
    opts.name_IDs = ["*"]
    sub = subset.Subsetter(opts)
    sub.populate(text=text + " ")
    sub.subset(font)
    buf = io.BytesIO()
    font.save(buf)
    data = base64.b64encode(buf.getvalue()).decode()
    return (
        f"@font-face{{font-family:'{family}';font-style:{style};"
        f"src:url(data:font/ttf;base64,{data}) format('truetype');}}"
    )


def f(x: float) -> str:
    """Coordinates at a tenth of a pixel: crisp, and the file stays readable."""
    return f"{x:.1f}".rstrip("0").rstrip(".")


def bars(x: float, y: float, w: float, h: float, seed: int, fill: str, count: int = 3) -> list[str]:
    """A tiny bar chart inside a w×h box, heights from a lawful series."""
    out = []
    gap = 2.0
    bw = (w - gap * (count + 1)) / count
    for i in range(count):
        # A slow sine, phase-shifted per unit: varied, but never random.
        t = 0.5 + 0.5 * math.sin(seed * 1.7 + i * 1.25)
        bh = max(2.0, (h - 4) * (0.28 + 0.72 * t))
        bx = x + gap + i * (bw + gap)
        by = y + h - 2 - bh
        out.append(f'<rect x="{f(bx)}" y="{f(by)}" width="{f(bw)}" height="{f(bh)}" fill="{fill}"/>')
    return out


def draw(rounded: bool, fonts_css: str) -> str:
    el: list[str] = []
    add = el.append

    add(f'<rect width="{W}" height="{H}" rx="{24 if rounded else 0}" fill="{INK}"/>')

    # Registration marks at the four corners, as on a printed plate.
    for cx, cy in [(40, 40), (W - 40, 40), (40, H - 40), (W - 40, H - 40)]:
        add(f'<path d="M{cx-6} {cy}H{cx+6}M{cx} {cy-6}V{cy+6}" stroke="{RAIL}" stroke-width="0.75"/>')

    # ---- left column: kicker, wordmark, tagline, footing -------------------
    add(f'<text x="{M}" y="{LANES[0]}" class="mono kicker">{KICKER}</text>')
    # The word sits on the trunk line itself.
    add(f'<text x="{M - 5}" y="{LANES[2]}" class="serif word">{WORDMARK}</text>')
    for i, line in enumerate(TAGLINE):
        add(f'<text x="{M}" y="{LANES[3] - (len(TAGLINE) - 1 - i) * 34}" class="serif-i tag">{line}</text>')
    add(f'<rect x="{M}" y="{LANES[3] + 34}" width="24" height="1.5" fill="{AMBER}"/>')
    add(f'<text x="{M}" y="{LANES[4]}" class="mono foot">{FOOT}</text>')

    # ---- the origin: a tray of small dashboards ----------------------------
    cols, rows, cell, gap = 4, 6, 24, 4
    tx, ty = 512, 320 - (rows * cell + (rows - 1) * gap) / 2
    tray_w = cols * cell + (cols - 1) * gap
    tray_h = rows * cell + (rows - 1) * gap
    # Corner brackets instead of a box: the tray is implied, not fenced.
    pad, arm = 10, 10
    for (bx, by, sx, sy) in [
        (tx - pad, ty - pad, 1, 1), (tx + tray_w + pad, ty - pad, -1, 1),
        (tx - pad, ty + tray_h + pad, 1, -1), (tx + tray_w + pad, ty + tray_h + pad, -1, -1),
    ]:
        add(f'<path d="M{f(bx)} {f(by + sy*arm)}V{f(by)}H{f(bx + sx*arm)}" '
            f'stroke="{LABEL}" stroke-width="0.75" fill="none"/>')

    # Which cells are carried out onto a lane (amber), and which support (teal).
    carried = {(0, 1), (2, 0), (1, 3), (3, 4), (2, 5)}
    support = {(1, 1), (3, 0), (0, 4), (2, 3), (3, 2), (1, 5)}
    for r in range(rows):
        for c in range(cols):
            x = tx + c * (cell + gap)
            y = ty + r * (cell + gap)
            seed = r * cols + c
            if (c, r) in carried:
                add(f'<rect x="{f(x)}" y="{f(y)}" width="{cell}" height="{cell}" rx="2" fill="{AMBER}"/>')
                el.extend(bars(x + 3, y + 3, cell - 6, cell - 6, seed, INK))
            else:
                stroke = TEAL if (c, r) in support else RAIL
                add(f'<rect x="{f(x+0.375)}" y="{f(y+0.375)}" width="{cell-0.75}" height="{cell-0.75}" '
                    f'rx="2" fill="none" stroke="{stroke}" stroke-width="0.75"/>')
                el.extend(bars(x + 3, y + 3, cell - 6, cell - 6, seed, stroke))

    # ---- trunk, junction and the divided routes ----------------------------
    trunk_y = 320
    x0 = tx + tray_w + pad + 6
    jx = 736          # the junction: where one line becomes five
    lane_x0 = 872     # where every route has settled into its lane
    lane_x1 = 1112    # buffer stops
    lanes = LANES

    add(f'<path d="M{f(x0)} {trunk_y}H{jx}" stroke="{BONE}" stroke-width="1.5"/>')
    for ly in lanes:
        # A cubic with horizontal tangents at both ends: the curve of a turnout.
        mid = (jx + lane_x0) / 2
        add(f'<path d="M{jx} {trunk_y}C{f(mid)} {trunk_y} {f(mid)} {ly} {lane_x0} {ly}" '
            f'stroke="{BONE}" stroke-width="1.25" fill="none" opacity="0.92"/>')
    add(f'<circle cx="{jx}" cy="{trunk_y}" r="5" fill="{INK}" stroke="{AMBER}" stroke-width="1.5"/>')

    wagons = [3, 2, 4, 3, 2]  # lawful variation in what each lane carries
    for i, (ly, n) in enumerate(zip(lanes, wagons)):
        # Rails: the guard on either side of every route.
        for off in (-10, 10):
            add(f'<path d="M{lane_x0} {ly + off}H{lane_x1}" stroke="{TEAL}" stroke-width="0.75" opacity="0.85"/>')
        # Sleepers, the rhythm under the track.
        for sx in range(lane_x0 + 8, lane_x1 - 4, 16):
            add(f'<path d="M{sx} {ly-10}V{ly+10}" stroke="{RULE}" stroke-width="0.75"/>')
        add(f'<path d="M{lane_x0} {ly}H{lane_x1}" stroke="{BONE}" stroke-width="1.25" opacity="0.92"/>')

        # Wagons: the first on each lane is the one it was sent for.
        wx = lane_x0 + 24 + (i % 2) * 14
        for k in range(n):
            x = wx + k * 42
            seed = i * 5 + k
            if k == 0:
                add(f'<rect x="{x}" y="{ly-7}" width="32" height="14" rx="2" fill="{AMBER}"/>')
                el.extend(bars(x + 2, ly - 6, 28, 12, seed, INK, count=5))
            else:
                add(f'<rect x="{x+0.375}" y="{f(ly-6.625)}" width="31.25" height="13.25" rx="2" '
                    f'fill="{INK}" stroke="{LABEL}" stroke-width="0.75"/>')
                el.extend(bars(x + 2, ly - 6, 28, 12, seed, LABEL, count=5))

        # Buffer stop and the name of the tool the lane ends at.
        add(f'<path d="M{lane_x1} {ly-13}V{ly+13}" stroke="{BONE}" stroke-width="2"/>')
        add(f'<text x="{lane_x1 + 18}" y="{ly + 4.5}" class="mono tool">{TOOLS[i]}</text>')
        add(f'<text x="{lane_x0}" y="{ly - 17}" class="mono num">{i + 1:02d}</text>')

    # ---- survey ruler along the foot --------------------------------------
    ry = H - 72
    add(f'<path d="M{M} {ry}H{W - M}" stroke="{RULE}" stroke-width="0.75"/>')
    for x in range(M, W - M + 1, 8):
        major = (x - M) % 128 == 0
        add(f'<path d="M{x} {ry}V{ry + (7 if major else 3)}" stroke="{RAIL if major else RULE}" stroke-width="0.75"/>')
        if major:
            add(f'<text x="{x + 3}" y="{ry + 18}" class="mono scale">{x - M}</text>')
    add(f'<text x="{W - M}" y="{ry - 12}" class="mono fig" text-anchor="end">{FIG}</text>')

    css = (
        fonts_css +
        f".serif{{font-family:'Instrument Serif';fill:{BONE}}}"
        f".serif-i{{font-family:'Instrument Serif Italic';font-style:italic;fill:{BONE}}}"
        f".mono{{font-family:'Geist Mono';fill:{LABEL}}}"
        ".word{font-size:124px;letter-spacing:-2px}"
        ".tag{font-size:27px;opacity:.78}"
        ".kicker{font-size:11px;letter-spacing:2.6px}"
        ".foot{font-size:12px;letter-spacing:.4px}"
        f".tool{{font-size:13px;fill:{BONE};letter-spacing:.4px}}"
        ".num{font-size:9px;letter-spacing:1px}"
        ".scale{font-size:8px;letter-spacing:.5px}"
        ".fig{font-size:10px;letter-spacing:.8px}"
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
        f'role="img" aria-label="dashkit — Power BI skills, routed to every AI tool">'
        f"<title>dashkit</title><style>{css}</style>"
        + "".join(el) +
        "</svg>\n"
    )


def main() -> None:
    fonts = Path(sys.argv[1])
    mono_text = KICKER + FOOT + FIG + "".join(TOOLS) + "0123456789"
    css = (
        embed(fonts / "InstrumentSerif-Regular.ttf", WORDMARK, "Instrument Serif")
        + embed(fonts / "InstrumentSerif-Italic.ttf", "".join(TAGLINE), "Instrument Serif Italic", "italic")
        + embed(fonts / "GeistMono-Regular.ttf", mono_text, "Geist Mono")
    )
    here = Path(__file__).parent
    (here / "banner.svg").write_text(draw(True, css), encoding="utf-8")
    (here / "social-preview.svg").write_text(draw(False, css), encoding="utf-8")
    for name in ("banner.svg", "social-preview.svg"):
        print(f"{name}: {(here / name).stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
