from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, UploadFile, File, Form
from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
from PIL import Image
import pandas as pd
import io
import numpy as np


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = YOLO("models/best.pt")

# Class mapping
class_map = {
    0: "Longitudinal",
    1: "Transverse",
    2: "Alligator",
    3: "Repaired",
    4: "Pothole",
    5: "Patchy road",
    6: "Rutting"
}

CRACK_TYPES = [
    "Longitudinal",
    "Transverse",
    "Alligator",
    "Repaired"
]

# -----------------------------------
# 📌 DETECTION API
# -----------------------------------
@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # 🔥 FIXED: use predict + lower confidence
        results = model.predict(img, conf=0.2)

        detections = []

        for r in results:
            if r.boxes is None:
                continue

            for box in r.boxes:
                detections.append({
                    "class": class_map[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy.tolist()
                })

        return {"detections": detections}

    except Exception as e:
        return {"error": str(e)}
# -----------------------------------
# 📌 PCI CALCULATION API
# -----------------------------------
# @app.post("/calculate-pci")
# async def calculate_pci(
#     detections: list,
#     road_type: str = Form(...),
#     road_length: float = Form(...),
#     lane_width: float = Form(...)
# ):
    
#     df = pd.DataFrame(detections)

#     TOTAL_AREA = road_length * lane_width

#     CE = len(df[df['class'].isin(CRACK_TYPES)]) / TOTAL_AREA * 100 if not df.empty else 0
#     PN = len(df[df['class'] == "Pothole"])
#     RD = 10  # mock (can improve later)
#     PaE = len(df[df['class'] == "Patchy road"]) / TOTAL_AREA * 100 if not df.empty else 0

#     # Simple PCI (you can plug your full formula later)
#     pci = 100 - (CE + PN + RD + PaE)

#     return {
#         "PCI": round(pci, 2),
#         "road_type": road_type,
#         "metrics": {
#             "CE": CE,
#             "PN": PN,
#             "RD": RD,
#             "PaE": PaE
#         }
#     }
from pydantic import BaseModel
from typing import List, Dict

class PCIRequest(BaseModel):
    detections: List[Dict]
    road_type: str
    road_length: float
    lane_width: float

@app.post("/calculate-pci")
async def calculate_pci(data: PCIRequest):
    
    df = pd.DataFrame(data.detections)

    TOTAL_AREA = data.road_length * data.lane_width

    CE = len(df[df['class'].isin(CRACK_TYPES)]) / TOTAL_AREA * 100 if not df.empty else 0
    PN = len(df[df['class'] == "Pothole"])
    RD = 10
    PaE = len(df[df['class'] == "Patchy road"]) / TOTAL_AREA * 100 if not df.empty else 0

    pci = 100 - (CE + PN + RD + PaE)

    return {
        "PCI": round(pci, 2),
        "road_type": data.road_type,
        "metrics": {
            "CE": CE,
            "PN": PN,
            "RD": RD,
            "PaE": PaE
        }
    }