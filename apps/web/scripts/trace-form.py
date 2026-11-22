#!/usr/bin/env python3
"""Trace an 8-bit RGBA Sinica PNG on white; requires Python 3 and potrace."""
import argparse
import struct
import subprocess
import tempfile
import zlib
from pathlib import Path


def paeth(left, above, upper_left):
    estimate = left + above - upper_left
    candidates = (left, above, upper_left)
    return min(candidates, key=lambda value: abs(estimate - value))


def read_rgba(path):
    png = path.read_bytes()
    if png[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Expected a PNG file')
    width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', png[16:29])
    if (depth, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
        raise ValueError('Expected an 8-bit, non-interlaced RGBA PNG')
    offset, compressed = 8, bytearray()
    while offset < len(png):
        size = struct.unpack('>I', png[offset:offset + 4])[0]
        if png[offset + 4:offset + 8] == b'IDAT':
            compressed.extend(png[offset + 8:offset + 8 + size])
        offset += size + 12
    raw = zlib.decompress(compressed)
    stride = width * 4
    if len(raw) != height * (stride + 1):
        raise ValueError('Unexpected PNG scanline length')
    previous = bytearray(stride)
    rows = []
    for y in range(height):
        start = y * (stride + 1)
        filter_type = raw[start]
        if filter_type > 4:
            raise ValueError('Unsupported PNG filter')
        row = bytearray(raw[start + 1:start + 1 + stride])
        for x in range(stride):
            left = row[x - 4] if x >= 4 else 0
            above = previous[x]
            upper_left = previous[x - 4] if x >= 4 else 0
            predictor = (0, left, above, (left + above) // 2, paeth(left, above, upper_left))[filter_type]
            row[x] = (row[x] + predictor) % 256
        rows.append(row)
        previous = row
    return width, height, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    width, height, rows = read_rgba(args.input)
    with tempfile.TemporaryDirectory(prefix='verbarium-form-') as temp:
        bitmap = Path(temp) / 'form.pbm'
        with bitmap.open('w') as file:
            file.write(f'P1\n{width * 4} {height * 4}\n')
            for row in rows:
                pixels = []
                for x in range(width):
                    red, green, blue, alpha = row[x * 4:x * 4 + 4]
                    # Flatten transparent pixels onto white before thresholding.
                    gray = (red + green + blue) / 3 * alpha / 255 + 255 - alpha
                    pixels.extend(['1' if gray < 128 else '0'] * 4)
                file.write((' '.join(pixels) + '\n') * 4)
        subprocess.run(['potrace', str(bitmap), '-s', '--flat', '-t', '8', '-a', '1.0',
                        '-O', '0.4', '-r', '288', '-o', str(args.output)], check=True)


if __name__ == '__main__':
    main()
