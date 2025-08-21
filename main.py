from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os, shutil
from pdfminer.high_level import extract_text
from PIL import Image
import pytesseract
from models import User

from database import SessionLocal
from models import Report, LabValue

app = FastAPI()
#homepage
@app.get("/")
def home():
    return {"message": "MediSage API is running 🚀"}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Reference Ranges
REFERENCE_RANGES = {
    "WBC": (4000, 11000, "/cmm"),
    "RBC": (4.2, 5.9, "mill/cmm"),
    "HbA1c": (4.0, 5.6, "%"),
    "SGPT": (7, 56, "U/L"),
}

def analyze_value(param, value):
    if param not in REFERENCE_RANGES:
        return {"value": value, "status": "Unknown", "unit": ""}
    low, high, unit = REFERENCE_RANGES[param]
    if value < low: status = "Low"
    elif value > high: status = "High"
    else: status = "Normal"
    return {"value": value, "status": status, "unit": unit}

def process_pdf(file_path: str):
    return extract_text(file_path)

def process_image(file_path: str):
    img = Image.open(file_path)
    return pytesseract.image_to_string(img)

def parse_lab_values(text: str):
    results = {}
    # Demo parsing – replace with regex later
    if "WBC" in text: results["WBC"] = analyze_value("WBC", 12000)
    if "RBC" in text: results["RBC"] = analyze_value("RBC", 4.5)
    if "HbA1c" in text: results["HbA1c"] = analyze_value("HbA1c", 8.0)
    if "SGPT" in text: results["SGPT"] = analyze_value("SGPT", 70)
    return results


@app.post("/register-user/")
def register_user(
    name: str = Form(..., description="Full name of the user"),
    mobile_number: str = Form(..., description="Mobile number (unique)"),
    role: str = Form(..., description="Role of the user: patient or doctor"),
    db: Session = Depends(get_db)
):
    # Check if mobile number already exists
    existing_user = db.query(User).filter(User.mobile_number == mobile_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    # Create user
    user = User(name=name, mobile_number=mobile_number, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "✅ User created successfully",
        "user_id": user.id,
        "name": user.name,
        "role": user.role
    }


@app.post("/upload-report/")
async def upload_report(
    file: UploadFile = File(...),
    user_id: int = Form(..., description="User ID of the patient"),  # 👈 FIXED
    db: Session = Depends(get_db)
):
    try:
        # Validate extension
        ext = file.filename.split(".")[-1].lower()
        if ext not in ["pdf", "png", "jpg", "jpeg"]:
            raise HTTPException(status_code=400, detail="Invalid file format")

        # Save file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        text = process_pdf(file_path) if ext == "pdf" else process_image(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from file")

        # Parse lab values
        lab_results = parse_lab_values(text)

        # Save to DB
        report = Report(user_id=user_id, file_name=file.filename, file_path=file_path)
        db.add(report)
        db.commit()
        db.refresh(report)

        for name, data in lab_results.items():
            lab_value = LabValue(
                report_id=report.id,
                name=name,
                value=data["value"],
                unit=data["unit"],
                status=data["status"]
            )
            db.add(lab_value)
        db.commit()

        return JSONResponse(content={
            "user_id": user_id,
            "report_id": report.id,
            "file_name": file.filename,
            "extracted_text_preview": text[:200],  # only first 200 chars
            "lab_results": lab_results
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
