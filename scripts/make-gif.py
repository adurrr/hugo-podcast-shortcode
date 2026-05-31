"""Create a demo GIF from captured screenshots."""
from PIL import Image, ImageDraw, ImageFont
import os

FRAMES_DIR = '/tmp/demo-frames'
OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'images', 'demo.gif')
WIDTH = 800

captions = [
    "Page loads with inline podcast player",
    "Click play -> sticky footer player appears at bottom",
    "Navigate to another page -> footer persists",
    "Navigate back -> footer still there, still playing",
    "Close the footer player",
    "Navigate again -> footer stays closed",
]

frame_files = sorted(
    [f for f in os.listdir(FRAMES_DIR) if f.endswith('.png')]
)

frames = []
for i, filename in enumerate(frame_files):
    path = os.path.join(FRAMES_DIR, filename)
    img = Image.open(path)

    # Resize keeping proportion
    ratio = WIDTH / img.width
    new_h = int(img.height * ratio)
    img = img.resize((WIDTH, new_h), Image.LANCZOS)

    # Add caption bar at bottom
    bar_h = 44
    canvas = Image.new('RGBA', (WIDTH, new_h + bar_h), (15, 15, 30, 255))
    canvas.paste(img, (0, 0))

    draw = ImageDraw.Draw(canvas)

    # Semi-transparent bar background
    draw.rectangle([0, new_h, WIDTH, new_h + bar_h], fill=(30, 30, 50, 220))

    # Caption text
    caption = captions[i] if i < len(captions) else ''
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
    except (IOError, OSError):
        font = ImageFont.load_default()

    # Text with slight shadow for readability
    text_x, text_y = 16, new_h + 11
    draw.text((text_x + 1, text_y + 1), caption, font=font, fill=(0, 0, 0, 100))
    draw.text((text_x, text_y), caption, font=font, fill=(200, 200, 220, 255))

    frames.append(canvas.convert('P', palette=Image.Palette.ADAPTIVE))

# Timing: each frame 2 seconds (2000ms), except last which pauses 1 second
durations = [2000] * (len(frames) - 1) + [1500]

# Save GIF
frames[0].save(
    OUTPUT,
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=0,  # loop forever
    optimize=True,
)

print(f"GIF saved to {OUTPUT} ({os.path.getsize(OUTPUT) / 1024:.0f} KB, {len(frames)} frames)")
