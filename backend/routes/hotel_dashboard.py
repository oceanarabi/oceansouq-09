from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/api/hotel", tags=["hotel-dashboard"])

# Get database from server.py
db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-hotel-secret-key-2024")

# Models
class HotelLogin(BaseModel):
    email: str
    password: str

class AvailabilityUpdate(BaseModel):
    is_available: bool

class RoomUpdate(BaseModel):
    room_type: str
    price: float
    available_rooms: int

# Token verification
async def verify_hotel_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الـ Token")
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

@router.post("/auth/login")
async def hotel_login(data: HotelLogin):
    """Login for hotels"""
    # Demo hotels
    demo_hotels = [
        {"email": "hotel@ocean.com", "password": "hotel123", "name": "فندق Ocean الرياض", "id": "hotel-1", "rating": 4.8, "stars": 5, "city": "الرياض", "rooms_count": 120},
        {"email": "hilton@ocean.com", "password": "hotel123", "name": "هيلتون جدة", "id": "hotel-2", "rating": 4.6, "stars": 5, "city": "جدة", "rooms_count": 200},
    ]
    
    hotel = next((h for h in demo_hotels if h["email"] == data.email and h["password"] == data.password), None)
    
    if not hotel:
        # Check database
        if db is not None:
            db_hotel = db.hotel_accounts.find_one({"email": data.email}, {"_id": 0})
            if db_hotel and db_hotel.get("password") == data.password:
                hotel = db_hotel
    
    if not hotel:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    token = jwt.encode({
        "hotel_id": hotel.get("id", str(uuid4())),
        "email": hotel["email"],
        "name": hotel["name"],
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "hotel": {
            "id": hotel.get("id"),
            "name": hotel["name"],
            "email": hotel["email"],
            "rating": hotel.get("rating", 4.5),
            "stars": hotel.get("stars", 4),
            "city": hotel.get("city", "الرياض"),
            "rooms_count": hotel.get("rooms_count", 50),
            "is_available": hotel.get("is_available", True)
        }
    }

@router.post("/status")
async def update_hotel_status(data: AvailabilityUpdate, user = Depends(verify_hotel_token)):
    """Update hotel availability status"""
    if db is not None:
        db.hotel_accounts.update_one(
            {"id": user["hotel_id"]},
            {"$set": {"is_available": data.is_available, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"success": True, "is_available": data.is_available}

@router.get("/dashboard")
async def get_hotel_dashboard(user = Depends(verify_hotel_token)):
    """Get hotel dashboard data"""
    import random
    
    return {
        "todayBookings": random.randint(5, 20),
        "todayRevenue": random.randint(15000, 50000),
        "occupancyRate": random.randint(65, 95),
        "rating": round(4.3 + random.random() * 0.6, 1),
        "availableRooms": random.randint(20, 60),
        "totalRooms": 120,
        "pendingBookings": [
            {
                "id": f"BK-{str(i).zfill(4)}",
                "guest": ["أحمد محمد", "سارة علي", "محمد خالد", "فاطمة أحمد"][i % 4],
                "room_type": ["غرفة فردية", "غرفة مزدوجة", "جناح ديلوكس", "جناح ملكي"][i % 4],
                "check_in": "2024-01-20",
                "check_out": "2024-01-23",
                "nights": random.randint(1, 7),
                "total": random.randint(800, 5000),
                "status": "pending"
            }
            for i in range(random.randint(2, 5))
        ],
        "todayCheckIns": [
            {
                "id": f"BK-{str(i+10).zfill(4)}",
                "guest": ["علي حسن", "نورة محمد", "خالد سعود"][i % 3],
                "room": f"{random.randint(1, 5)}{random.randint(0, 9):02d}",
                "room_type": "جناح ديلوكس",
                "time": f"{random.randint(14, 18)}:00"
            }
            for i in range(random.randint(2, 4))
        ],
        "todayCheckOuts": [
            {
                "id": f"BK-{str(i+20).zfill(4)}",
                "guest": ["محمد عبدالله", "عائشة أحمد"][i % 2],
                "room": f"{random.randint(1, 5)}{random.randint(0, 9):02d}",
                "time": "12:00"
            }
            for i in range(random.randint(1, 3))
        ]
    }

@router.get("/bookings")
async def get_hotel_bookings(user = Depends(verify_hotel_token), status: str = None):
    """Get hotel bookings"""
    import random
    
    bookings = []
    guests = ["أحمد محمد", "سارة علي", "محمد خالد", "فاطمة أحمد", "علي حسن", "نورة محمد"]
    room_types = ["غرفة فردية", "غرفة مزدوجة", "جناح ديلوكس", "جناح ملكي", "غرفة عائلية"]
    statuses = ["confirmed", "confirmed", "pending", "checked_in", "checked_out", "cancelled"]
    
    for i in range(30):
        booking_status = random.choice(statuses) if not status else status
        nights = random.randint(1, 10)
        price_per_night = random.randint(300, 2000)
        bookings.append({
            "id": f"BK-{str(i).zfill(4)}",
            "guest": random.choice(guests),
            "room_type": random.choice(room_types),
            "room_number": f"{random.randint(1, 5)}{random.randint(0, 9):02d}",
            "check_in": f"2024-01-{random.randint(15, 28)}",
            "check_out": f"2024-01-{random.randint(18, 31)}",
            "nights": nights,
            "price_per_night": price_per_night,
            "total": nights * price_per_night,
            "status": booking_status,
            "special_requests": random.choice(["إطلالة على المدينة", "طابق عالي", "سرير إضافي", "", ""])
        })
    
    if status:
        bookings = [b for b in bookings if b["status"] == status]
    
    return {"bookings": bookings}

@router.get("/rooms")
async def get_hotel_rooms(user = Depends(verify_hotel_token)):
    """Get hotel rooms inventory"""
    rooms = [
        {"id": 1, "type": "غرفة فردية", "name_en": "Single Room", "price": 350, "total": 40, "available": 15, "occupied": 25},
        {"id": 2, "type": "غرفة مزدوجة", "name_en": "Double Room", "price": 500, "total": 35, "available": 12, "occupied": 23},
        {"id": 3, "type": "جناح ديلوكس", "name_en": "Deluxe Suite", "price": 900, "total": 25, "available": 8, "occupied": 17},
        {"id": 4, "type": "جناح ملكي", "name_en": "Royal Suite", "price": 2500, "total": 10, "available": 3, "occupied": 7},
        {"id": 5, "type": "غرفة عائلية", "name_en": "Family Room", "price": 750, "total": 10, "available": 5, "occupied": 5},
    ]
    return {"rooms": rooms}

@router.put("/rooms/{room_id}")
async def update_room(room_id: int, data: RoomUpdate, user = Depends(verify_hotel_token)):
    """Update room details"""
    return {"success": True, "message": f"تم تحديث الغرفة {room_id}"}

@router.get("/analytics")
async def get_hotel_analytics(user = Depends(verify_hotel_token), period: str = "week"):
    """Get hotel analytics"""
    import random
    
    multiplier = {"today": 1, "week": 7, "month": 30}.get(period, 7)
    
    return {
        "totalBookings": random.randint(20, 50) * multiplier,
        "totalRevenue": random.randint(50000, 150000) * multiplier // 7,
        "avgOccupancy": random.randint(70, 95),
        "avgDailyRate": random.randint(600, 1200),
        "revPAR": random.randint(500, 1000),  # Revenue Per Available Room
        "topRoomTypes": [
            {"type": "جناح ديلوكس", "bookings": random.randint(30, 60), "revenue": random.randint(40000, 80000)},
            {"type": "غرفة مزدوجة", "bookings": random.randint(40, 80), "revenue": random.randint(30000, 60000)},
            {"type": "جناح ملكي", "bookings": random.randint(10, 25), "revenue": random.randint(30000, 70000)},
        ],
        "weeklyOccupancy": [
            {"day": "السبت", "rate": random.randint(70, 95)},
            {"day": "الأحد", "rate": random.randint(65, 90)},
            {"day": "الإثنين", "rate": random.randint(60, 85)},
            {"day": "الثلاثاء", "rate": random.randint(65, 85)},
            {"day": "الأربعاء", "rate": random.randint(70, 90)},
            {"day": "الخميس", "rate": random.randint(80, 98)},
            {"day": "الجمعة", "rate": random.randint(85, 99)},
        ]
    }

@router.get("/reviews")
async def get_hotel_reviews(user = Depends(verify_hotel_token)):
    """Get hotel reviews"""
    reviews = [
        {"id": 1, "guest": "أحمد محمد", "rating": 5, "comment": "فندق رائع! الخدمة ممتازة والموقع مثالي.", "date": "2024-01-15", "room_type": "جناح ديلوكس"},
        {"id": 2, "guest": "سارة علي", "rating": 4, "comment": "إقامة مريحة، الغرفة نظيفة لكن الإفطار يحتاج تحسين.", "date": "2024-01-14", "room_type": "غرفة مزدوجة"},
        {"id": 3, "guest": "محمد خالد", "rating": 5, "comment": "من أفضل الفنادق التي أقمت بها!", "date": "2024-01-13", "room_type": "جناح ملكي"},
        {"id": 4, "guest": "فاطمة أحمد", "rating": 4, "comment": "تجربة جيدة بشكل عام.", "date": "2024-01-12", "room_type": "غرفة فردية"},
        {"id": 5, "guest": "علي حسن", "rating": 5, "comment": "موظفين محترفين وخدمة راقية.", "date": "2024-01-11", "room_type": "جناح ديلوكس"},
    ]
    
    return {
        "overallRating": 4.6,
        "totalReviews": 324,
        "ratingDistribution": {5: 220, 4: 70, 3: 25, 2: 6, 1: 3},
        "reviews": reviews
    }

@router.post("/bookings/{booking_id}/confirm")
async def confirm_booking(booking_id: str, user = Depends(verify_hotel_token)):
    """Confirm a booking"""
    return {"success": True, "message": f"تم تأكيد الحجز {booking_id}"}

@router.post("/bookings/{booking_id}/check-in")
async def check_in_guest(booking_id: str, user = Depends(verify_hotel_token)):
    """Check in a guest"""
    return {"success": True, "message": f"تم تسجيل دخول الضيف - الحجز {booking_id}"}

@router.post("/bookings/{booking_id}/check-out")
async def check_out_guest(booking_id: str, user = Depends(verify_hotel_token)):
    """Check out a guest"""
    return {"success": True, "message": f"تم تسجيل خروج الضيف - الحجز {booking_id}"}

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user = Depends(verify_hotel_token)):
    """Cancel a booking"""
    return {"success": True, "message": f"تم إلغاء الحجز {booking_id}"}
