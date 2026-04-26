"""
Crop individual cards from scanned sheets.
Handles both grid-based sheets and single card images.
"""
from PIL import Image
import os
import shutil

SRC = "D:/deception/source/CSFiles Scans/Scans"
OUT = "D:/deception/deception-game/public/assets/cards"

# Create output directories
for d in ["means", "clues", "scene-tiles", "roles", "events", "backs", "tokens"]:
    os.makedirs(f"{OUT}/{d}", exist_ok=True)

TARGET_W = 300  # Target card width for web
TARGET_H = 460  # Target card height for web


def crop_grid(img_path, cols, rows, out_dir, prefix, start_idx=1, padding=0):
    """Crop a grid of cards from a sheet."""
    img = Image.open(img_path)
    w, h = img.size
    card_w = (w - padding * 2) / cols
    card_h = (h - padding * 2) / rows

    idx = start_idx
    cards = []
    for r in range(rows):
        for c in range(cols):
            x1 = int(padding + c * card_w)
            y1 = int(padding + r * card_h)
            x2 = int(x1 + card_w)
            y2 = int(y1 + card_h)

            # Slight inset to remove borders
            margin = 4
            card = img.crop((x1 + margin, y1 + margin, x2 - margin, y2 - margin))
            card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)

            fname = f"{prefix}{idx:02d}.jpg"
            card.save(f"{out_dir}/{fname}", "JPEG", quality=90)
            cards.append(fname)
            idx += 1

    return idx


def copy_single(img_path, out_dir, fname):
    """Copy and resize a single card image."""
    img = Image.open(img_path)
    w, h = img.size

    # Auto-rotate if landscape
    if w > h:
        img = img.rotate(90, expand=True)

    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    img.save(f"{out_dir}/{fname}", "JPEG", quality=90)


def crop_scene_tiles_horizontal(img_path, count, out_dir, prefix, start_idx=1):
    """Crop scene tiles arranged horizontally."""
    img = Image.open(img_path)
    w, h = img.size
    tile_w = w / count

    idx = start_idx
    for i in range(count):
        x1 = int(i * tile_w)
        x2 = int((i + 1) * tile_w)
        margin = 4
        tile = img.crop((x1 + margin, margin, x2 - margin, h - margin))
        tile = tile.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        tile.save(f"{out_dir}/{prefix}{idx:02d}.jpg", "JPEG", quality=90)
        idx += 1
    return idx


def crop_scene_tiles_vertical(img_path, count, out_dir, prefix, start_idx=1):
    """Crop scene tiles arranged vertically."""
    img = Image.open(img_path)
    w, h = img.size
    tile_h = h / count

    idx = start_idx
    for i in range(count):
        y1 = int(i * tile_h)
        y2 = int((i + 1) * tile_h)
        margin = 4
        tile = img.crop((margin, y1 + margin, w - margin, y2 - margin))
        tile = tile.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        tile.save(f"{out_dir}/{prefix}{idx:02d}.jpg", "JPEG", quality=90)
        idx += 1
    return idx


print("=== MEANS CARDS (Blue) ===")
# Blue Cards: 5 sheets, each 6 cols x 3 rows = 18 cards/sheet
means_idx = 1
for i, fname in enumerate(["Image.jpg", "Image (2).jpg", "Image (3).jpg", "Image (4).jpg", "Image (5).jpg"]):
    path = f"{SRC}/Blue Cards/{fname}"
    if os.path.exists(path):
        means_idx = crop_grid(path, 6, 3, f"{OUT}/means", "means_", means_idx)
        print(f"  Cropped {fname} -> means_{means_idx-18:02d} to means_{means_idx-1:02d}")
print(f"  Total means cards: {means_idx - 1}")

print("\n=== CLUE CARDS (Brown) ===")
clue_idx = 1
clue_dir = f"{OUT}/clues"

# Process Brown Cards - separate singles from sheets
brown_dir = f"{SRC}/Brown Cards"
for fname in sorted(os.listdir(brown_dir)):
    if not fname.endswith('.jpg'):
        continue
    path = f"{brown_dir}/{fname}"
    img = Image.open(path)
    w, h = img.size

    # Classify by size
    if w > 2000 and h > 2000:
        # Large sheet - likely grid
        # Determine grid size based on aspect ratio
        if w > h:
            # Landscape - could be 6x3 or similar
            cols = round(w / 520)
            rows = round(h / 810)
        else:
            # Portrait
            cols = round(w / 520)
            rows = round(h / 810)

        if cols < 1: cols = 1
        if rows < 1: rows = 1

        clue_idx = crop_grid(path, cols, rows, clue_dir, "clue_", clue_idx)
        print(f"  Sheet {fname} ({w}x{h}) -> {cols}x{rows} grid")
    elif w > 1500 or h > 1500:
        # Medium - probably 2-3 cards
        if w > h:
            count = round(w / 520)
            clue_idx = crop_scene_tiles_horizontal(path, count, clue_dir, "clue_", clue_idx)
        else:
            count = round(h / 810)
            clue_idx = crop_scene_tiles_vertical(path, count, clue_dir, "clue_", clue_idx)
        print(f"  Strip {fname} ({w}x{h}) -> {count} cards")
    else:
        # Single card
        copy_single(path, clue_dir, f"clue_{clue_idx:02d}.jpg")
        print(f"  Single {fname} ({w}x{h})")
        clue_idx += 1

print(f"  Total clue cards: {clue_idx - 1}")

print("\n=== SCENE TILES ===")
scene_dir = f"{OUT}/scene-tiles"
scene_idx = 1

# Brown Background - Scene tiles (Clue type)
brown_bg = f"{SRC}/Brown Background"
for fname in sorted(os.listdir(brown_bg)):
    if not fname.endswith('.jpg'):
        continue
    path = f"{brown_bg}/{fname}"
    img = Image.open(path)
    w, h = img.size

    if w > h:
        # Horizontal layout
        count = round(w / 700)
        if count < 1: count = 1
        scene_idx = crop_scene_tiles_horizontal(path, count, scene_dir, "scene_", scene_idx)
    else:
        # Vertical layout
        count = round(h / 700)
        if count < 1: count = 1
        scene_idx = crop_scene_tiles_vertical(path, count, scene_dir, "scene_", scene_idx)
    print(f"  {fname} ({w}x{h}) -> {count} tiles")

# Green and Purple Background - Location & Cause tiles
gp_path = f"{SRC}/Green and Purple Background/Image.jpg"
if os.path.exists(gp_path):
    img = Image.open(gp_path)
    w, h = img.size
    count = round(w / 700)
    scene_idx = crop_scene_tiles_horizontal(gp_path, count, scene_dir, "scene_", scene_idx)
    print(f"  Green+Purple ({w}x{h}) -> {count} tiles")

print(f"  Total scene tiles: {scene_idx - 1}")

print("\n=== EVENT CARDS ===")
event_path = f"{SRC}/Blue Background/Image.jpg"
if os.path.exists(event_path):
    img = Image.open(event_path)
    w, h = img.size
    # 6 event cards in top row + 1 at bottom
    # Top row: 5 cards wide, bottom: partial
    # From the image: 5 cards top + 1 bottom = 6 total
    # Let's crop top row (5 cards) and bottom
    top_h = int(h * 0.6)  # Top portion
    top = img.crop((0, 0, w, top_h))
    tw, th = top.size
    card_w = tw / 5
    for i in range(5):
        x1 = int(i * card_w)
        x2 = int((i + 1) * card_w)
        card = top.crop((x1 + 4, 4, x2 - 4, th - 4))
        card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        card.save(f"{OUT}/events/event_{i+1:02d}.jpg", "JPEG", quality=90)

    # Bottom card(s)
    bottom = img.crop((0, top_h, w, h))
    bw, bh = bottom.size
    bottom_card_w = bw / 5  # Assuming same grid
    card = bottom.crop((4, 4, int(bottom_card_w) - 4, bh - 4))
    card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    card.save(f"{OUT}/events/event_06.jpg", "JPEG", quality=90)
    print(f"  6 event cards cropped")

print("\n=== ROLE CARDS ===")
role_dir = f"{OUT}/roles"
role_names = ["murderer", "investigator", "forensic", "accomplice", "witness"]

# Image.jpg - 2 cards vertically (Murderer + Investigator)
role_path = f"{SRC}/Role Cards/Image.jpg"
if os.path.exists(role_path):
    img = Image.open(role_path)
    w, h = img.size
    card_h = h / 2
    for i, name in enumerate(["murderer", "investigator"]):
        y1 = int(i * card_h)
        y2 = int((i + 1) * card_h)
        card = img.crop((4, y1 + 4, w - 4, y2 - 4))
        card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        card.save(f"{role_dir}/{name}.jpg", "JPEG", quality=90)
    print("  Murderer + Investigator")

# Image (2).jpg - 6 cards (2x3 grid): Investigator variants + Forensic
role_path2 = f"{SRC}/Role Cards/Image (2).jpg"
if os.path.exists(role_path2):
    img = Image.open(role_path2)
    w, h = img.size
    # 3 cols x 2 rows
    card_w = w / 3
    card_h = h / 2
    # Top-middle is Forensic Scientist
    card = img.crop((int(card_w) + 4, 4, int(2 * card_w) - 4, int(card_h) - 4))
    card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    card.save(f"{role_dir}/forensic.jpg", "JPEG", quality=90)
    print("  Forensic Scientist")

# Image (3).jpg - 2 cards vertically (likely Accomplice + Witness)
role_path3 = f"{SRC}/Role Cards/Image (3).jpg"
if os.path.exists(role_path3):
    img = Image.open(role_path3)
    w, h = img.size
    card_h = h / 2
    for i, name in enumerate(["accomplice", "witness"]):
        y1 = int(i * card_h)
        y2 = int((i + 1) * card_h)
        card = img.crop((4, y1 + 4, w - 4, y2 - 4))
        card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        card.save(f"{role_dir}/{name}.jpg", "JPEG", quality=90)
    print("  Accomplice + Witness")

# Single role card images
for fname, name in [("Image (4).jpg", "investigator2"), ("Image (5).jpg", "witness2"), ("Image (6).jpg", "accomplice2")]:
    path = f"{SRC}/Role Cards/{fname}"
    if os.path.exists(path):
        copy_single(path, role_dir, f"{name}.jpg")

print("\n=== CARD BACKS ===")
backs_dir = f"{OUT}/backs"

# Blue card back (Means)
for fname in ["Blue Card Backs (1).jpg", "Blue Card Backs (2).jpg"]:
    path = f"{SRC}/{fname}"
    if os.path.exists(path):
        copy_single(path, backs_dir, "means_back.jpg")
        print(f"  Means back: {fname}")
        break

# Brown card back (Clues)
brown_back = f"{SRC}/Brown Card Backs.jpg"
if os.path.exists(brown_back):
    img = Image.open(brown_back)
    w, h = img.size
    # 2 cards side by side, take first
    card = img.crop((4, 4, w // 2 - 4, h - 4))
    card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    card.save(f"{backs_dir}/clue_back.jpg", "JPEG", quality=90)
    print("  Clue back")

# Scene tile backs (from Backs.jpg - 3 backs: purple, brown, green)
backs_path = f"{SRC}/Backs.jpg"
if os.path.exists(backs_path):
    img = Image.open(backs_path)
    w, h = img.size
    card_w = w / 3
    for i, name in enumerate(["scene_back_purple", "scene_back_brown", "scene_back_green"]):
        x1 = int(i * card_w)
        x2 = int((i + 1) * card_w)
        card = img.crop((x1 + 4, 4, x2 - 4, h - 4))
        card = card.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        card.save(f"{backs_dir}/{name}.jpg", "JPEG", quality=90)
    print("  3 scene tile backs")

print("\n=== TOKENS ===")
token_path = f"{SRC}/Tokens and Bullets/Tokens x12.jpg"
if os.path.exists(token_path):
    img = Image.open(token_path)
    # Just crop one token from the pair
    w, h = img.size
    # Two tokens roughly in center
    token = img.crop((w // 4, h // 6, w // 2, h * 5 // 6))
    token = token.resize((150, 100), Image.LANCZOS)
    token.save(f"{OUT}/tokens/badge.jpg", "JPEG", quality=90)
    print("  Badge token")

print("\n=== DONE ===")
# Summary
for d in ["means", "clues", "scene-tiles", "roles", "events", "backs", "tokens"]:
    count = len([f for f in os.listdir(f"{OUT}/{d}") if f.endswith('.jpg')])
    print(f"  {d}: {count} files")
