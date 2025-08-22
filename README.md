
# MediSage - Medical Report Analysis System

MediSage is a comprehensive web-based medical report analysis system that allows users to upload, analyze, and track medical lab reports. The system uses OCR and pattern recognition to extract lab values from PDF and image files, providing intelligent health insights and recommendations.

## Features

- **User Registration & Management**: Register patients and doctors with role-based access
- **Report Upload & Analysis**: Upload medical reports (PDF/Images) with automatic text extraction
- **Lab Value Extraction**: Automatically extract key lab parameters using regex patterns
- **Health Analysis**: Compare lab values against reference ranges with status indicators
- **Health Profile Dashboard**: View comprehensive health profiles with recent test results
- **Real-time Recommendations**: Get personalized health suggestions based on lab results

## Supported Lab Parameters

The system currently analyzes the following lab parameters:

### Complete Blood Count (CBC)
- **WBC** (White Blood Cells): 4,000-11,000 /cmm
- **RBC** (Red Blood Cells): 4.2-5.9 mill/cmm  
- **Hemoglobin**: 12.0-16.0 g/dL
- **Hematocrit**: 36.0-48.0%
- **Platelets**: 150,000-450,000 /cmm

### Additional Parameters
- **HbA1c**: 4.0-5.6% (Diabetes monitoring)
- **SGPT/ALT**: 7-56 U/L (Liver function)

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Database for storing user and report data
- **PDFMiner**: PDF text extraction
- **Tesseract OCR**: Image text recognition
- **Pillow**: Image processing

### Frontend
- **React**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

## Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL database
- Tesseract OCR (pre-installed in Replit environment)

### Backend Setup

1. **Install Python dependencies:**
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pdfminer3k pytesseract pillow python-multipart
```

2. **Configure Database:**
   - Update `database.py` with your PostgreSQL credentials
   - Default: `postgresql://postgres:user@localhost/medisage`

3. **Create Database Tables:**
   - The application will automatically create tables on first run

4. **Start Backend Server:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd medisage-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start React development server:**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
medisage/
├── main.py                 # FastAPI backend application
├── models.py              # SQLAlchemy database models
├── database.py            # Database configuration
├── uploads/               # Uploaded files storage
├── medisage-frontend/     # React frontend application
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── ...
│   ├── public/
│   └── package.json
├── pyproject.toml         # Python dependencies
└── README.md
```

## API Endpoints

### User Management
- `POST /register-user/` - Register a new user
- `GET /users/` - Get all users
- `GET /user-profile/{user_id}` - Get user health profile

### Report Management  
- `POST /upload-report/` - Upload and analyze medical report
- `GET /reports/` - Get all reports with analysis

## Usage

1. **Register Users**: Start by registering patients or doctors
2. **Upload Reports**: Upload PDF or image files of medical reports
3. **View Analysis**: System automatically extracts lab values and provides analysis
4. **Health Dashboard**: View comprehensive health profiles with trends and recommendations

## Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `mobile_number`: Unique mobile number
- `role`: patient or doctor

### Reports Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `file_name`: Original filename
- `file_path`: Storage path
- `upload_time`: Timestamp

### Lab Values Table
- `id`: Primary key
- `report_id`: Foreign key to reports
- `name`: Parameter name (e.g., "Hemoglobin")
- `value`: Numerical value
- `unit`: Unit of measurement
- `status`: Normal/High/Low

## Health Analysis Logic

The system compares extracted lab values against predefined reference ranges:

1. **Value Extraction**: Uses regex patterns to find lab parameters in text
2. **Range Comparison**: Compares values against normal ranges
3. **Status Assignment**: Assigns Normal/High/Low status
4. **Recommendations**: Provides personalized health suggestions

## Development

### Running in Development Mode

1. **Backend**: `uvicorn main:app --reload`
2. **Frontend**: `npm start` (in medisage-frontend directory)

### Adding New Lab Parameters

1. Update `REFERENCE_RANGES` in `main.py`
2. Add corresponding regex pattern in `parse_lab_values()`
3. Update frontend display components if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.
