"""
EPUB to Markdown Converter
Step 1: single file conversion
Step 2: batch conversion (multiple files → zip of .md files)
"""

import io
import os
import tempfile
import zipfile
from pathlib import Path

import ebooklib
import html2text
from ebooklib import epub
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="EPUB to Markdown Converter")

# Serve the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", encoding="utf-8") as f:
        return f.read()


def _epub_bytes_to_markdown(epub_bytes: bytes) -> str:
    """Convert raw EPUB bytes to a markdown string."""
    # ebooklib requires a file path, so write to a temp file
    with tempfile.NamedTemporaryFile(suffix=".epub", delete=False) as tmp:
        tmp.write(epub_bytes)
        tmp_path = tmp.name

    try:
        book = epub.read_epub(tmp_path)
    finally:
        os.unlink(tmp_path)

    converter = html2text.HTML2Text()
    converter.ignore_links = False
    converter.ignore_images = False
    converter.body_width = 0          # no forced line wrapping
    converter.unicode_snob = True     # keep unicode chars

    parts: list[str] = []

    # Prepend title + author as front matter
    title_meta = book.get_metadata("DC", "title")
    creator_meta = book.get_metadata("DC", "creator")
    if title_meta:
        parts.append(f"# {title_meta[0][0]}\n")
    if creator_meta:
        parts.append(f"*{creator_meta[0][0]}*\n")
    if title_meta or creator_meta:
        parts.append("\n---\n")

    # Walk document items in spine order
    spine_ids = {item_id for item_id, _ in book.spine}
    for item in book.get_items():
        if item.get_type() != ebooklib.ITEM_DOCUMENT:
            continue
        # Only include spine items (actual chapters), skip nav/toc files
        if spine_ids and item.get_id() not in spine_ids:
            continue
        html_content = item.get_content().decode("utf-8", errors="replace")
        md = converter.handle(html_content).strip()
        if md:
            parts.append(md)

    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Step 1 – single file
# ---------------------------------------------------------------------------

@app.post("/convert")
async def convert_single(file: UploadFile = File(...)):
    """Accept one .epub file, return a .md file."""
    if not file.filename.lower().endswith(".epub"):
        raise HTTPException(status_code=400, detail="Only .epub files are supported.")

    epub_bytes = await file.read()
    if len(epub_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        markdown = _epub_bytes_to_markdown(epub_bytes)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Conversion failed: {exc}") from exc

    stem = Path(file.filename).stem
    return Response(
        content=markdown.encode("utf-8"),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{stem}.md"'},
    )


# ---------------------------------------------------------------------------
# Step 2 – batch (multiple files → zip)
# ---------------------------------------------------------------------------

@app.post("/convert-batch")
async def convert_batch(files: list[UploadFile] = File(...)):
    """Accept multiple .epub files, return a zip of .md files."""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    results: list[dict] = []   # {name, success, error}
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for upload in files:
            if not upload.filename.lower().endswith(".epub"):
                results.append({"name": upload.filename, "success": False, "error": "Not an .epub file"})
                continue
            epub_bytes = await upload.read()
            stem = Path(upload.filename).stem
            try:
                markdown = _epub_bytes_to_markdown(epub_bytes)
                zf.writestr(f"{stem}.md", markdown.encode("utf-8"))
                results.append({"name": upload.filename, "success": True, "error": None})
            except Exception as exc:
                results.append({"name": upload.filename, "success": False, "error": str(exc)})

    successful = sum(1 for r in results if r["success"])
    if successful == 0:
        errors = "; ".join(f"{r['name']}: {r['error']}" for r in results)
        raise HTTPException(status_code=422, detail=f"All conversions failed: {errors}")

    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.read(),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="converted.zip"'},
    )
