"""Restore the three external Tiled tilesets from the project's existing editor archive."""
from pathlib import Path, PurePosixPath
from posixpath import normpath
from struct import unpack
import xml.etree.ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_NAME = "The Fan-tasy Tileset (Free)"
XML_DIRECTORY = f"{ARCHIVE_NAME}/Tiled/Tilesets"
ART_DIRECTORY = f"{ARCHIVE_NAME}/Art/"
TILESET_NAMES = ("Tileset_Ground.tsx", "Objects_Props.tsx", "Objects_Buildings.tsx")


def restore():
    directory = ROOT / "src/data/maps/tilesets"
    directory.mkdir(parents=True, exist_ok=True)
    copied = set()
    with ZipFile(ROOT / "Pixel_Art" / f"{ARCHIVE_NAME} 1.5.9.zip") as archive:
        for filename in TILESET_NAMES:
            member = f"{XML_DIRECTORY}/{filename}"
            content = ET.fromstring(archive.read(member))
            for image in content.iter("image"):
                src = normpath(f"{XML_DIRECTORY}/{image.attrib['source']}")
                if not src.startswith(ART_DIRECTORY):
                    raise ValueError(f"Unexpected image location in {filename}: {src}")
                local = PurePosixPath("art", src.removeprefix(ART_DIRECTORY))
                target = directory / local
                target.parent.mkdir(parents=True, exist_ok=True)
                pixels = archive.read(src)
                if pixels[:8] != b"\x89PNG\r\n\x1a\n":
                    raise ValueError(f"Expected the original PNG in {src}")
                width, height = unpack(">II", pixels[16:24])
                target.write_bytes(pixels)
                image.attrib.update(source=local.as_posix(), width=str(width), height=str(height))
                copied.add(local)
            if content.attrib["columns"] == "0":
                for dimension in ("width", "height"):
                    size = max(int(image.attrib[dimension]) for image in content.iter("image"))
                    content.attrib[f"tile{dimension}"] = str(size)
            ET.indent(content, space=" ")
            ET.ElementTree(content).write(directory / filename, encoding="UTF-8", xml_declaration=True)
    print(f"Restored {len(TILESET_NAMES)} tilesets and {len(copied)} local editor images.")


if __name__ == "__main__":
    restore()
