from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os, shutil, re, cv2
from pdfminer.high_level import extract_text
from PIL import Image
import pytesseract
from models import User, Report, LabValue
from database import SessionLocal

# Tesseract path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# homepage
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

# 🔹 NEW: Preprocess images (for mobile photos)
def preprocess_image_for_ocr(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Deskew
    coords = cv2.findNonZero(255 - gray)
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45: angle = -(90 + angle)
    else: angle = -angle
    (h, w) = gray.shape
    M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
    gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Adaptive threshold (better for uneven lighting)
    thresh = cv2.adaptiveThreshold(gray, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 11, 2)

    # Noise removal
    thresh = cv2.medianBlur(thresh, 3)

    # Resize to improve OCR
    thresh = cv2.resize(thresh, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    return thresh

def process_image(file_path: str):
    img = preprocess_image_for_ocr(file_path)
    config = "--oem 3 --psm 6 -l eng --user-words med_terms.txt"
    text = pytesseract.image_to_string(img, config=config)  # uniform block mode
    return text

# Lab value extraction
def parse_lab_values(text: str):
    results = {}

    # RBC (accepts "RBC 4.5" or "RBC: 4.5")
    rbc_match = re.search(r"RBC[:\s]+([\d.]+)", text, re.IGNORECASE)
    if rbc_match:
        value = float(rbc_match.group(1))
        results["RBC"] = analyze_value("RBC", value)

    # WBC (accepts "WBC 7.8" or "WBC: 7800")
    wbc_match = re.search(r"WBC[:\s]+([\d,.]+)", text, re.IGNORECASE)
    if wbc_match:
        value = float(wbc_match.group(1).replace(",", ""))
        results["WBC"] = analyze_value("WBC", value)

    # HbA1c
    hba1c_match = re.search(r"HbA1c[:\s]+([\d.]+)", text, re.IGNORECASE)
    if hba1c_match:
        value = float(hba1c_match.group(1))
        results["HbA1c"] = analyze_value("HbA1c", value)

    # SGPT
    sgpt_match = re.search(r"(SGPT|ALT)[:\s]+([\d.]+)", text, re.IGNORECASE)
    if sgpt_match:
        value = float(sgpt_match.group(2))
        results["SGPT"] = analyze_value("SGPT", value)

    return results

@app.post("/login/")
def login_user(
    mobile_number: str = Form(..., description="Mobile number"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.mobile_number == mobile_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "message": "✅ Login successful",
        "user_id": user.id,
        "name": user.name,
        "mobile_number": user.mobile_number,
        "role": user.role
    }

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

        # Check for duplicate
        existing_report = db.query(Report).filter(
            Report.user_id == user_id,
            Report.file_name == file.filename
        ).first()
        if existing_report:
            raise HTTPException(status_code=400, detail="Report already uploaded for this user")

        # Save file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text (PDF vs Image)
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
            "extracted_text_preview": text[:200],  # first 200 chars
            "lab_results": lab_results
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/users/")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/reports/")
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    result = []
    for report in reports:
        lab_values = db.query(LabValue).filter(LabValue.report_id == report.id).all()
        lab_results = {}
        for lab in lab_values:
            lab_results[lab.name] = {
                "value": lab.value,
                "unit": lab.unit,
                "status": lab.status
            }
        
        result.append({
            "report_id": report.id,
            "user_id": report.user_id,
            "file_name": report.file_name,
            "upload_time": report.upload_time,
            "lab_results": lab_results
        })
    return result

@app.get("/user/{user_id}/reports/")
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == user_id).all()
    result = []
    for report in reports:
        lab_values = db.query(LabValue).filter(LabValue.report_id == report.id).all()
        lab_results = {}
        for lab in lab_values:
            lab_results[lab.name] = {
                "value": lab.value,
                "unit": lab.unit,
                "status": lab.status
            }
        
        result.append({
            "report_id": report.id,
            "user_id": report.user_id,
            "file_name": report.file_name,
            "upload_time": report.upload_time,
            "lab_results": lab_results
        })
    return result
