from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import mimetypes

router = APIRouter(prefix="/api/images", tags=["images"])


def _uploads_base():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads"))


@router.get("/{category}/{filename}")
def serve_image(category: str, filename: str):
    base = _uploads_base()
    if category not in ("thoughts", "works"):
        raise HTTPException(status_code=404, detail="Image not found")
    path = os.path.join(base, category, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Image not found")
    media_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type)


@router.get("/{category}/{filename}/blob")
def serve_image_blob(category: str, filename: str):
    base = _uploads_base()
    if category not in ("thoughts", "works"):
        raise HTTPException(status_code=404, detail="Image not found")
    path = os.path.join(base, category, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Image not found")
    # force download as binary blob
    return FileResponse(path, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename=\"{filename}\""})
