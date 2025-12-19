from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/api/experiences", tags=["experiences-service"])

security = HTTPBearer()
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class BookingCreate(BaseModel):
    experience_id: str
    date: str
    participants: int
    contact_name: str
    contact_phone: str
    contact_email: str
    notes: Optional[str] = None

@router.get("/types")
async def get_experience_types():
    """Get experience types"""
    return [
        {"id": "tours", "name": "جولات سياحية", "icon": "🗺️"},
        {"id": "activities", "name": "أنشطة ترفيهية", "icon": "🎯"},
        {"id": "adventure", "name": "مغامرات", "icon": "🏔️"},
        {"id": "workshops", "name": "ورش عمل", "icon": "🎨"},
        {"id": "events", "name": "فعاليات", "icon": "🎉"}
    ]

@router.get("/")
async def get_experiences(
    type: Optional[str] = None,
    city: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20
):
    """Get all experiences"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {"status": "active"}
    if type:
        query["experience_type"] = type
    if city:
        query["city"] = city
    if featured:
        query["is_featured"] = True
    
    experiences = list(db.experiences.find(query, {"_id": 0}).limit(limit))
    
    if min_price:
        experiences = [e for e in experiences if e.get("price", 0) >= min_price]
    if max_price:
        experiences = [e for e in experiences if e.get("price", 0) <= max_price]
    
    return experiences

@router.get("/{experience_id}")
async def get_experience(experience_id: str):
    """Get experience details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    experience = db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    # Get reviews
    reviews = list(db.experience_reviews.find({"experience_id": experience_id}, {"_id": 0}).limit(10))
    experience["reviews"] = reviews
    
    return experience

@router.post("/bookings")
async def book_experience(booking: BookingCreate, user = Depends(verify_token)):
    """Book an experience"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    experience = db.experiences.find_one({"id": booking.experience_id}, {"_id": 0})
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    total_price = experience["price"] * booking.participants
    
    booking_data = {
        "id": str(uuid.uuid4()),
        "booking_number": f"EXP-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        "user_id": user["user_id"],
        "experience_id": booking.experience_id,
        "experience_name": experience["name_ar"],
        "date": booking.date,
        "participants": booking.participants,
        "price_per_person": experience["price"],
        "total_price": total_price,
        "contact_name": booking.contact_name,
        "contact_phone": booking.contact_phone,
        "contact_email": booking.contact_email,
        "notes": booking.notes,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.experience_bookings.insert_one(booking_data)
    
    return {"message": "تم الحجز بنجاح!", "booking": {k: v for k, v in booking_data.items() if k != "_id"}}

@router.get("/bookings/my")
async def get_my_bookings(user = Depends(verify_token)):
    """Get user's experience bookings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    bookings = list(db.experience_bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1))
    return bookings
