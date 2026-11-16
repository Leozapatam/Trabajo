"""Convierte las ilustraciones .jpg/.png de public/assets/art a .webp (unas 6 veces más livianas).

Uso:  python scripts/optimizar-imagenes.py
Requiere Pillow (pip install pillow). Borra el original solo si el .webp quedó bien escrito.
Después hay que referenciar el archivo como .webp en el código.
"""
import os
import sys

from PIL import Image

ART_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'assets', 'art')
MAX_WIDTH = 1920
QUALITY = 80


def convert(path: str) -> None:
    target = os.path.splitext(path)[0] + '.webp'
    with Image.open(path) as im:
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        if im.width > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
        im.save(target, 'WEBP', quality=QUALITY, method=6)
    before, after = os.path.getsize(path), os.path.getsize(target)
    if after == 0:
        sys.exit(f'No se pudo escribir {target}')
    os.remove(path)
    print(f'{os.path.basename(path)}: {before // 1024} KB -> {after // 1024} KB')


def main() -> None:
    found = False
    for root, _dirs, files in os.walk(ART_DIR):
        for name in sorted(files):
            if name.lower().endswith(('.jpg', '.jpeg', '.png')):
                found = True
                convert(os.path.join(root, name))
    if not found:
        print('Nada que convertir: todas las ilustraciones ya son .webp')


if __name__ == '__main__':
    main()
