from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random

router = APIRouter(prefix="/api/car-rental", tags=["car-rental"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== CAR CATALOG ====================

@router.get("/cars")
async def get_available_cars(city: str = "الرياض", category: str = None, user = Depends(verify_token)):
    """السيارات المتاحة"""
    cars = [
        {
            "id": "CAR-001",
            "brand": "تويوتا",
            "model": "كامري 2024",
            "category": "سيدان",
            "year": 2024,
            "color": "أبيض",
            "seats": 5,
            "transmission": "أوتوماتيك",
            "fuel_type": "بنزين",
            "daily_rate": 250,
            "weekly_rate": 1500,
            "monthly_rate": 5000,
            "features": ["بلوتوث", "كاميرا خلفية", "مثبت سرعة"],
            "available": True,
            "location": "مطار الرياض",
            "image": "/images/cars/camry-2024.jpg",
            "rating": 4.8
        },
        {
            "id": "CAR-002",
            "brand": "هيونداي",
            "model": "سوناتا 2024",
            "category": "سيدان",
            "year": 2024,
            "color": "أسود",
            "seats": 5,
            "transmission": "أوتوماتيك",
            "fuel_type": "بنزين",
            "daily_rate": 200,
            "weekly_rate": 1200,
            "monthly_rate": 4000,
            "features": ["بلوتوث", "شاشة لمس"],
            "available": True,
            "location": "وسط الرياض",
            "image": "/images/cars/sonata-2024.jpg",
            "rating": 4.6
        },
        {
            "id": "CAR-003",
            "brand": "لكزس",
            "model": "ES 350 2024",
            "category": "فاخرة",
            "year": 2024,
            "color": "فضي",
            "seats": 5,
            "transmission": "أوتوماتيك",
            "fuel_type": "بنزين",
            "daily_rate": 450,
            "weekly_rate": 2800,
            "monthly_rate": 10000,
            "features": ["مقاعد جلد", "نظام صوتي مارك ليفنسون", "شاشة HUD"],
            "available": True,
            "location": "مطار الرياض",
            "image": "/images/cars/lexus-es-2024.jpg",
            "rating": 4.9
        },
        {
            "id": "CAR-004",
            "brand": "تويوتا",
            "model": "فورتشنر 2024",
            "category": "SUV",
            "year": 2024,
            "color": "أبيض",
            "seats": 7,
            "transmission": "أوتوماتيك",
            "fuel_type": "بنزين",
            "daily_rate": 350,
            "weekly_rate": 2100,
            "monthly_rate": 7500,
            "features": ["دفع رباعي", "شاشة كبيرة", "كاميرات 360"],
            "available": True,
            "location": "مطار الرياض",
            "image": "/images/cars/fortuner-2024.jpg",
            "rating": 4.7
        },
        {
            "id": "CAR-005",
            "brand": "نيسان",
            "model": "صني 2024",
            "category": "اقتصادية",
            "year": 2024,
            "color": "رمادي",
            "seats": 5,
            "transmission": "أوتوماتيك",
            "fuel_type": "بنزين",
            "daily_rate": 120,
            "weekly_rate": 700,
            "monthly_rate": 2500,
            "features": ["بلوتوث", "تكييف"],
            "available": True,
            "location": "وسط الرياض",
            "image": "/images/cars/sunny-2024.jpg",
            "rating": 4.4
        }
    ]
    
    if category:
        cars = [c for c in cars if c["category"] == category]
    
    return {
        "cars": cars,
        "total": len(cars),
        "city": city,
        "categories": ["اقتصادية", "سيدان", "SUV", "فاخرة", "عائلية"]
    }

@router.get("/cars/{car_id}")
async def get_car_details(car_id: str, user = Depends(verify_token)):
    """تفاصيل السيارة"""
    return {
        "id": car_id,
        "brand": "تويوتا",
        "model": "كامري 2024",
        "full_description": "سيارة تويوتا كامري 2024 الجديدة بالكامل...",
        "specifications": {
            "engine": "2.5L 4-cylinder",
            "horsepower": 203,
            "fuel_economy": "7.8L/100km",
            "trunk_capacity": "428L"
        },
        "insurance": {
            "basic": {"price": 50, "coverage": "تغطية أساسية"},
            "full": {"price": 100, "coverage": "تغطية شاملة + سائق إضافي"}
        },
        "extras": [
            {"name": "GPS", "price": 25},
            {"name": "كرسي أطفال", "price": 30},
            {"name": "WiFi", "price": 20}
        ],
        "reviews": [
            {"user": "أحمد", "rating": 5, "comment": "سيارة ممتازة", "date": "2024-01-10"},
            {"user": "محمد", "rating": 4, "comment": "جيدة جداً", "date": "2024-01-08"}
        ],
        "availability_calendar": [
            {"date": "2024-01-20", "available": True},
            {"date": "2024-01-21", "available": True},
            {"date": "2024-01-22", "available": False},
            {"date": "2024-01-23", "available": False},
            {"date": "2024-01-24", "available": True}
        ]
    }

# ==================== BOOKINGS ====================

class BookingRequest(BaseModel):
    car_id: str
    pickup_date: str
    return_date: str
    pickup_location: str
    return_location: str
    insurance_type: str = "basic"
    extras: List[str] = []
    driver_license: str

@router.post("/bookings")
async def create_booking(booking: BookingRequest, user = Depends(verify_token)):
    """إنشاء حجز"""
    days = 3  # حساب الأيام
    daily_rate = 250
    insurance = 50 if booking.insurance_type == "basic" else 100
    extras_cost = len(booking.extras) * 25
    
    total = (daily_rate * days) + (insurance * days) + (extras_cost * days)
    
    return {
        "success": True,
        "booking_id": f"BK-{random.randint(100000, 999999)}",
        "car_id": booking.car_id,
        "dates": {
            "pickup": booking.pickup_date,
            "return": booking.return_date,
            "days": days
        },
        "pricing": {
            "daily_rate": daily_rate,
            "insurance_daily": insurance,
            "extras_daily": extras_cost,
            "subtotal": daily_rate * days,
            "insurance_total": insurance * days,
            "extras_total": extras_cost * days,
            "vat": round(total * 0.15, 2),
            "total": round(total * 1.15, 2)
        },
        "status": "confirmed",
        "pickup_details": {
            "location": booking.pickup_location,
            "time": "10:00 AM",
            "instructions": "يرجى إحضار رخصة القيادة والهوية"
        }
    }

@router.get("/bookings")
async def get_user_bookings(status: str = "all", user = Depends(verify_token)):
    """حجوزات المستخدم"""
    bookings = [
        {
            "id": "BK-123456",
            "car": "تويوتا كامري 2024",
            "pickup_date": "2024-01-20",
            "return_date": "2024-01-23",
            "status": "active",
            "total": 1035
        },
        {
            "id": "BK-123455",
            "car": "هيونداي سوناتا 2024",
            "pickup_date": "2024-01-10",
            "return_date": "2024-01-12",
            "status": "completed",
            "total": 575
        }
    ]
    return {"bookings": bookings, "total": len(bookings)}

@router.get("/bookings/{booking_id}")
async def get_booking_details(booking_id: str, user = Depends(verify_token)):
    """تفاصيل الحجز"""
    return {
        "id": booking_id,
        "car": {
            "brand": "تويوتا",
            "model": "كامري 2024",
            "plate": "ABC 1234"
        },
        "dates": {
            "pickup": "2024-01-20 10:00",
            "return": "2024-01-23 10:00"
        },
        "locations": {
            "pickup": "مطار الرياض",
            "return": "مطار الرياض"
        },
        "pricing": {
            "rental": 750,
            "insurance": 150,
            "extras": 75,
            "vat": 146.25,
            "total": 1121.25
        },
        "status": "confirmed",
        "contract_url": "/contracts/BK-123456.pdf"
    }

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, reason: str = "", user = Depends(verify_token)):
    """إلغاء الحجز"""
    return {
        "success": True,
        "booking_id": booking_id,
        "status": "cancelled",
        "refund": {
            "amount": 1000,
            "method": "المحفظة",
            "processing_time": "3-5 أيام"
        },
        "cancellation_fee": 50
    }

# ==================== LOCATIONS ====================

@router.get("/locations")
async def get_rental_locations(city: str = None, user = Depends(verify_token)):
    """مواقع التأجير"""
    locations = [
        {"id": "LOC-001", "name": "مطار الملك خالد - الرياض", "city": "الرياض", "type": "airport", "hours": "24/7"},
        {"id": "LOC-002", "name": "وسط الرياض - العليا", "city": "الرياض", "type": "city", "hours": "8AM-10PM"},
        {"id": "LOC-003", "name": "مطار الملك عبدالعزيز - جدة", "city": "جدة", "type": "airport", "hours": "24/7"},
        {"id": "LOC-004", "name": "مطار الدمام", "city": "الدمام", "type": "airport", "hours": "24/7"}
    ]
    
    if city:
        locations = [l for l in locations if l["city"] == city]
    
    return {"locations": locations, "total": len(locations)}
