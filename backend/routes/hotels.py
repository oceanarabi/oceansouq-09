from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime, timedelta
import uuid
import os

router = APIRouter(prefix="/api/hotels", tags=["hotels-service"])

security = HTTPBearer()

# Database reference
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models
class RoomTypeCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    description: str
    description_ar: Optional[str] = None
    price_per_night: float
    max_guests: int = 2
    beds: str = "1 سرير كبير"
    amenities: List[str] = []
    images: List[str] = []
    available_rooms: int = 1

class BookingCreate(BaseModel):
    hotel_id: str
    room_type_id: str
    check_in: str  # ISO date
    check_out: str  # ISO date
    guests: int = 2
    special_requests: Optional[str] = None
    guest_name: str
    guest_phone: str
    guest_email: str
    payment_method: str = "pay_at_hotel"

class BookingStatusUpdate(BaseModel):
    status: str  # pending, confirmed, checked_in, checked_out, cancelled

# Auth Helper
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_hotel_manager(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if payload.get('role') not in ['hotel_manager', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Hotel manager access required")
    return payload

# ==================== CITIES ====================

@router.get("/cities")
async def get_cities():
    """Get popular cities"""
    return [
        {"id": "riyadh", "name": "الرياض", "name_en": "Riyadh", "hotels_count": 150},
        {"id": "jeddah", "name": "جدة", "name_en": "Jeddah", "hotels_count": 120},
        {"id": "mecca", "name": "مكة المكرمة", "name_en": "Mecca", "hotels_count": 200},
        {"id": "medina", "name": "المدينة المنورة", "name_en": "Medina", "hotels_count": 180},
        {"id": "dammam", "name": "الدمام", "name_en": "Dammam", "hotels_count": 60},
        {"id": "khobar", "name": "الخبر", "name_en": "Khobar", "hotels_count": 45},
        {"id": "taif", "name": "الطائف", "name_en": "Taif", "hotels_count": 35},
        {"id": "abha", "name": "أبها", "name_en": "Abha", "hotels_count": 40}
    ]

# ==================== FACILITIES ====================

@router.get("/facilities")
async def get_facilities():
    """Get hotel facilities/amenities"""
    return [
        {"id": "wifi", "name": "واي فاي مجاني", "icon": "📶"},
        {"id": "parking", "name": "موقف سيارات", "icon": "🅿️"},
        {"id": "pool", "name": "مسبح", "icon": "🏊"},
        {"id": "gym", "name": "صالة رياضية", "icon": "🏋️"},
        {"id": "restaurant", "name": "مطعم", "icon": "🍽️"},
        {"id": "spa", "name": "سبا", "icon": "💆"},
        {"id": "room_service", "name": "خدمة الغرف", "icon": "🛎️"},
        {"id": "breakfast", "name": "إفطار مجاني", "icon": "🍳"},
        {"id": "airport_shuttle", "name": "نقل من المطار", "icon": "✈️"},
        {"id": "laundry", "name": "غسيل ملابس", "icon": "🧺"},
        {"id": "ac", "name": "تكييف", "icon": "❄️"},
        {"id": "prayer_room", "name": "مصلى", "icon": "🕌"}
    ]

# ==================== HOTELS ====================

@router.get("/search")
async def search_hotels(
    city: Optional[str] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    guests: int = 2,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    star_rating: Optional[int] = None,
    facilities: Optional[str] = None,  # comma-separated
    search: Optional[str] = None,
    sort_by: str = "recommended",  # recommended, price_low, price_high, rating
    limit: int = 20
):
    """Search hotels"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {"status": "active"}
    
    if city:
        query["city"] = city
    if star_rating:
        query["star_rating"] = star_rating
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"name_ar": {"$regex": search, "$options": "i"}}
        ]
    if facilities:
        facility_list = facilities.split(",")
        query["facilities"] = {"$all": facility_list}
    
    hotels = list(db.hotels.find(query, {"_id": 0}).limit(limit))
    
    # Add min price from room types
    for hotel in hotels:
        room_types = list(db.hotel_rooms.find({"hotel_id": hotel["id"]}, {"_id": 0, "price_per_night": 1}))
        if room_types:
            hotel["min_price"] = min(r["price_per_night"] for r in room_types)
        else:
            hotel["min_price"] = 0
        
        # Add rating
        reviews = list(db.hotel_reviews.find({"hotel_id": hotel["id"]}, {"_id": 0, "rating": 1}))
        if reviews:
            hotel["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
            hotel["review_count"] = len(reviews)
        else:
            hotel["rating"] = 0
            hotel["review_count"] = 0
    
    # Filter by price
    if min_price:
        hotels = [h for h in hotels if h.get("min_price", 0) >= min_price]
    if max_price:
        hotels = [h for h in hotels if h.get("min_price", 0) <= max_price]
    
    # Sort
    if sort_by == "price_low":
        hotels.sort(key=lambda h: h.get("min_price", 0))
    elif sort_by == "price_high":
        hotels.sort(key=lambda h: h.get("min_price", 0), reverse=True)
    elif sort_by == "rating":
        hotels.sort(key=lambda h: h.get("rating", 0), reverse=True)
    
    return hotels

@router.get("/{hotel_id}")
async def get_hotel(hotel_id: str):
    """Get hotel details with room types"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    hotel = db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Get room types
    room_types = list(db.hotel_rooms.find({"hotel_id": hotel_id}, {"_id": 0}))
    hotel["room_types"] = room_types
    
    # Get reviews
    reviews = list(db.hotel_reviews.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).limit(10))
    hotel["reviews"] = reviews
    
    if reviews:
        hotel["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
        hotel["review_count"] = len(reviews)
    
    return hotel

@router.get("/{hotel_id}/rooms")
async def get_hotel_rooms(
    hotel_id: str,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    guests: int = 2
):
    """Get available room types"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    room_types = list(db.hotel_rooms.find(
        {"hotel_id": hotel_id, "available_rooms": {"$gt": 0}},
        {"_id": 0}
    ))
    
    # Filter by guest capacity
    room_types = [r for r in room_types if r.get("max_guests", 2) >= guests]
    
    # TODO: Check availability for specific dates by checking existing bookings
    
    return room_types

# ==================== BOOKINGS ====================

@router.post("/bookings")
async def create_booking(booking: BookingCreate, user = Depends(verify_token)):
    """Create a hotel booking"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get hotel and room info
    hotel = db.hotels.find_one({"id": booking.hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    room_type = db.hotel_rooms.find_one({"id": booking.room_type_id}, {"_id": 0})
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    # Calculate nights and total
    check_in_date = datetime.fromisoformat(booking.check_in)
    check_out_date = datetime.fromisoformat(booking.check_out)
    nights = (check_out_date - check_in_date).days
    
    if nights < 1:
        raise HTTPException(status_code=400, detail="Invalid dates")
    
    total_price = room_type["price_per_night"] * nights
    
    booking_data = {
        "id": str(uuid.uuid4()),
        "booking_number": f"H-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        "user_id": user["user_id"],
        "hotel_id": booking.hotel_id,
        "hotel_name": hotel.get("name"),
        "room_type_id": booking.room_type_id,
        "room_type_name": room_type.get("name"),
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "nights": nights,
        "guests": booking.guests,
        "price_per_night": room_type["price_per_night"],
        "total_price": total_price,
        "special_requests": booking.special_requests,
        "guest_name": booking.guest_name,
        "guest_phone": booking.guest_phone,
        "guest_email": booking.guest_email,
        "payment_method": booking.payment_method,
        "status": "pending",  # pending, confirmed, checked_in, checked_out, cancelled
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.hotel_bookings.insert_one(booking_data)
    
    return {
        "message": "تم الحجز بنجاح! سيتم تأكيد الحجز قريباً",
        "booking": {k: v for k, v in booking_data.items() if k != "_id"}
    }

@router.get("/bookings/my")
async def get_my_bookings(user = Depends(verify_token)):
    """Get user's hotel bookings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    bookings = list(db.hotel_bookings.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1))
    
    return bookings

@router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user = Depends(verify_token)):
    """Get booking details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    booking = db.hotel_bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user = Depends(verify_token)):
    """Cancel a booking"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    booking = db.hotel_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.get("status") in ["checked_in", "checked_out", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
    
    db.hotel_bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم إلغاء الحجز"}

# ==================== REVIEWS ====================

@router.post("/{hotel_id}/reviews")
async def add_review(hotel_id: str, rating: int, comment: str, user = Depends(verify_token)):
    """Add hotel review"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_data = {
        "id": str(uuid.uuid4()),
        "hotel_id": hotel_id,
        "user_id": user["user_id"],
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.hotel_reviews.insert_one(review_data)
    
    return {"message": "شكراً لتقييمك!"}

# ==================== HOTEL MANAGER ENDPOINTS ====================

@router.get("/manager/hotels")
async def get_manager_hotels(manager = Depends(verify_hotel_manager)):
    """Get hotels managed by this user"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    hotels = list(db.hotels.find({"manager_id": manager["user_id"]}, {"_id": 0}))
    return hotels

@router.get("/manager/bookings")
async def get_manager_bookings(
    status: Optional[str] = None,
    manager = Depends(verify_hotel_manager)
):
    """Get bookings for manager's hotels"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get manager's hotels
    hotels = list(db.hotels.find({"manager_id": manager["user_id"]}, {"_id": 0, "id": 1}))
    hotel_ids = [h["id"] for h in hotels]
    
    query = {"hotel_id": {"$in": hotel_ids}}
    if status:
        query["status"] = status
    
    bookings = list(db.hotel_bookings.find(query, {"_id": 0}).sort("created_at", -1))
    return bookings

@router.post("/manager/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: BookingStatusUpdate,
    manager = Depends(verify_hotel_manager)
):
    """Update booking status"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    valid_statuses = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]
    if status.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    db.hotel_bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": status.status, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم تحديث حالة الحجز"}

@router.post("/manager/rooms")
async def add_room_type(room: RoomTypeCreate, manager = Depends(verify_hotel_manager)):
    """Add room type to hotel"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get manager's hotel
    hotel = db.hotels.find_one({"manager_id": manager["user_id"]})
    if not hotel:
        raise HTTPException(status_code=404, detail="No hotel found for this manager")
    
    room_data = {
        "id": str(uuid.uuid4()),
        "hotel_id": hotel["id"],
        **room.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.hotel_rooms.insert_one(room_data)
    
    return {"message": "تمت إضافة نوع الغرفة", "room_id": room_data["id"]}
