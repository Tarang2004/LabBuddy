from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    mobile_number = Column(String, unique=True)
    role = Column(String)  # "patient" or "doctor"

    reports = relationship("Report", back_populates="owner")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String)
    file_path = Column(String)
    upload_time = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
    lab_values = relationship("LabValue", back_populates="report")

class LabValue(Base):
    __tablename__ = "lab_values"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    name = Column(String)
    value = Column(Float)
    unit = Column(String)
    status = Column(String)

    report = relationship("Report", back_populates="lab_values")
