from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import os
from PIL import Image
import io
import time
import random

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/", status_code=201)
async def upload_image(request: Request, file: UploadFile = File(...)):
    # Accept optional 'category' form field to place uploads under different folders
    form = await request.form()
    category = (form.get("category") or "thoughts").strip().lower()
    if category not in ("thoughts", "works"):
        category = "thoughts"

    # Save uploads into backend/static/uploads/<category>
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", category))
    os.makedirs(base_dir, exist_ok=True)

    filename = file.filename or "upload"
    # always save as .jpg for consistency
    safe_name = f"{int(time.time())}-{random.randint(1000,9999)}.jpg"
    out_path = os.path.join(base_dir, safe_name)

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        # Convert to RGB for JPEGs
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Optionally resize large images to max width 2000
        max_w = 2000
        if img.width > max_w:
            ratio = max_w / float(img.width)
            new_h = int(float(img.height) * ratio)
            img = img.resize((max_w, new_h), Image.LANCZOS)
        # Save compressed JPEG
        img.save(out_path, format="JPEG", quality=78)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    # Return API image path so DB stores a stable API URL that maps to the images router
    rel_path = f"/api/images/{category}/{safe_name}"
    return {"url": rel_path}
