from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/api/services", tags=["ondemand-services"])

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
class ServiceBooking(BaseModel):
    service_id: str
    scheduled_date: str
    scheduled_time: str
    address: str
    phone: str
    notes: Optional[str] = None
    hours: Optional[int] = 2

@router.get("/types")
async def get_service_types():
    """Get on-demand service types"""
    return [
        {"id": "cleaning", "name": "تنظيف", "icon": "🧹"},
        {"id": "ac_maintenance", "name": "صيانة مكيفات", "icon": "❄️"},
        {"id": "plumbing", "name": "سباكة", "icon": "🔧"},
        {"id": "electrical", "name": "كهرباء", "icon": "⚡"},
        {"id": "car_wash", "name": "غسيل سيارات", "icon": "🚗"},
        {"id": "moving", "name": "نقل أثاث", "icon": "📦"},
        {"id": "painting", "name": "دهان", "icon": "🎨"},
        {"id": "carpentry", "name": "نجارة", "icon": "🪚"}
    ]

@router.get("/")
async def get_services(
    type: Optional[str] = None,
    city: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 20
):
    """Get all on-demand services"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {"status": "active"}
    if type:
        query["service_type"] = type
    if city:
        query["city"] = city
    if featured:
        query["is_featured"] = True
    
    services = list(db.ondemand_services.find(query, {"_id": 0}).limit(limit))
    return services

@router.get("/{service_id}")
async def get_service(service_id: str):
    """Get service details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    service = db.ondemand_services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service

@router.post("/bookings")
async def book_service(booking: ServiceBooking, user = Depends(verify_token)):
    """Book an on-demand service"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    service = db.ondemand_services.find_one({"id": booking.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Calculate price
    if service.get("price_type") == "hourly":
        total_price = service["base_price"] * booking.hours
    else:
        total_price = service["base_price"]
    
    booking_data = {
        "id": str(uuid.uuid4()),
        "booking_number": f"SVC-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        "user_id": user["user_id"],
        "service_id": booking.service_id,
        "service_name": service["name_ar"],
        "service_type": service["service_type"],
        "scheduled_date": booking.scheduled_date,
        "scheduled_time": booking.scheduled_time,
        "hours": booking.hours,
        "address": booking.address,
        "phone": booking.phone,
        "notes": booking.notes,
        "total_price": total_price,
        "status": "pending",
        "provider_id": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.service_bookings.insert_one(booking_data)
    
    return {"message": "تم حجز الخدمة بنجاح!", "booking": {k: v for k, v in booking_data.items() if k != "_id"}}

@router.get("/bookings/my")
async def get_my_service_bookings(user = Depends(verify_token)):
    """Get user's service bookings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    bookings = list(db.service_bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1))
    return bookings

@router.post("/bookings/{booking_id}/cancel")
async def cancel_service_booking(booking_id: str, user = Depends(verify_token)):
    """Cancel a service booking"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    booking = db.service_bookings.find_one({"id": booking_id, "user_id": user["user_id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.get("status") in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
    
    db.service_bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم إلغاء الحجز"}
