from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
import bcrypt
from datetime import datetime, timedelta
import uuid
import os

router = APIRouter(prefix="/api/join", tags=["provider-registration"])

security = HTTPBearer()

# Database reference
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models for different provider types
class SellerRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    store_name: str
    store_name_ar: Optional[str] = None
    business_type: str = "individual"  # individual, company
    category: str  # electronics, fashion, etc.
    address: str
    commercial_register: Optional[str] = None

class DriverRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    id_number: str  # National ID
    license_number: str
    vehicle_type: str  # car, motorcycle, bicycle
    vehicle_model: Optional[str] = None
    vehicle_plate: Optional[str] = None
    city: str

class RestaurantRegistration(BaseModel):
    email: EmailStr
    password: str
    owner_name: str
    phone: str
    restaurant_name: str
    restaurant_name_ar: Optional[str] = None
    cuisine_type: str
    address: str
    commercial_register: Optional[str] = None
    delivery_available: bool = True

class HotelRegistration(BaseModel):
    email: EmailStr
    password: str
    manager_name: str
    phone: str
    hotel_name: str
    hotel_name_ar: Optional[str] = None
    star_rating: int = 3
    address: str
    city: str
    total_rooms: int
    facilities: List[str] = []
    commercial_register: Optional[str] = None

class ServiceProviderRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    company_name: Optional[str] = None
    service_type: str  # cleaning, maintenance, plumbing, electrical, car_wash
    experience_years: int = 0
    city: str
    areas_covered: List[str] = []
    has_team: bool = False
    team_size: Optional[int] = None

class ExperienceProviderRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    company_name: Optional[str] = None
    experience_type: str  # tours, activities, events, workshops
    description: str
    city: str
    license_number: Optional[str] = None

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_token(user_id: str, email: str, role: str) -> str:
    return jwt.encode({
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ==================== GET AVAILABLE SERVICES ====================

@router.get("/available-services")
async def get_available_services():
    """Get list of services available for registration based on Command Center settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get services configuration from command center
    services_config = db.command_services.find_one({"type": "services_config"}, {"_id": 0})
    
    all_services = [
        {
            "id": "seller",
            "service_id": "shopping",
            "name": "بائع / متجر",
            "name_en": "Seller / Store",
            "description": "سجل كبائع وافتح متجرك الإلكتروني",
            "icon": "🏪",
            "requirements": ["الهوية الوطنية", "السجل التجاري (اختياري)"],
            "route": "/join/seller"
        },
        {
            "id": "driver",
            "service_id": "delivery",
            "name": "سائق توصيل",
            "name_en": "Delivery Driver",
            "description": "انضم كسائق توصيل واربح من توصيل الطلبات",
            "icon": "🚚",
            "requirements": ["رخصة قيادة سارية", "الهوية الوطنية", "مركبة"],
            "route": "/join/driver"
        },
        {
            "id": "restaurant",
            "service_id": "food",
            "name": "مطعم / مقهى",
            "name_en": "Restaurant / Cafe",
            "description": "سجل مطعمك وابدأ استقبال الطلبات",
            "icon": "🍔",
            "requirements": ["السجل التجاري", "رخصة البلدية", "شهادة صحية"],
            "route": "/join/restaurant"
        },
        {
            "id": "captain",
            "service_id": "rides",
            "name": "كابتن / سائق",
            "name_en": "Ride Captain",
            "description": "انضم ككابتن وقدم خدمات التوصيل والمشاوير",
            "icon": "🚗",
            "requirements": ["رخصة قيادة سارية", "الهوية الوطنية", "سيارة حديثة"],
            "route": "/join/captain"
        },
        {
            "id": "hotel",
            "service_id": "hotels",
            "name": "فندق / شقق فندقية",
            "name_en": "Hotel / Apartments",
            "description": "سجل فندقك أو شققك الفندقية",
            "icon": "🏨",
            "requirements": ["السجل التجاري", "رخصة الهيئة العامة للسياحة"],
            "route": "/join/hotel"
        },
        {
            "id": "experience",
            "service_id": "experiences",
            "name": "مقدم تجارب / أنشطة",
            "name_en": "Experience Provider",
            "description": "قدم جولات سياحية وأنشطة ترفيهية",
            "icon": "🎭",
            "requirements": ["رخصة الهيئة العامة للسياحة (للجولات)"],
            "route": "/join/experience"
        },
        {
            "id": "service_provider",
            "service_id": "ondemand",
            "name": "مقدم خدمات",
            "name_en": "Service Provider",
            "description": "قدم خدمات التنظيف والصيانة والسباكة وغيرها",
            "icon": "🔧",
            "requirements": ["الهوية الوطنية", "شهادة خبرة (اختياري)"],
            "route": "/join/service-provider"
        }
    ]
    
    # Filter based on enabled services
    enabled_services = []
    if services_config and "services" in services_config:
        enabled_ids = [s["id"] for s in services_config["services"] if s.get("enabled")]
        for service in all_services:
            if service["service_id"] in enabled_ids:
                service["enabled"] = True
                enabled_services.append(service)
            else:
                service["enabled"] = False
    else:
        # If no config, only shopping is enabled by default
        for service in all_services:
            service["enabled"] = service["service_id"] == "shopping"
            if service["enabled"]:
                enabled_services.append(service)
    
    return {
        "available_services": enabled_services,
        "all_services": all_services
    }

# ==================== SELLER REGISTRATION ====================

@router.post("/seller")
async def register_seller(data: SellerRegistration):
    """Register as a seller"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check if email exists
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    # Create user account
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "seller",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    # Create seller profile
    seller_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "store_name": data.store_name,
        "store_name_ar": data.store_name_ar,
        "business_type": data.business_type,
        "category": data.category,
        "address": data.address,
        "commercial_register": data.commercial_register,
        "status": "pending",
        "verified": False,
        "created_at": datetime.utcnow().isoformat()
    }
    db.sellers.insert_one(seller_data)
    
    token = create_token(user_id, data.email, "seller")
    
    return {
        "message": "تم التسجيل بنجاح! سيتم مراجعة طلبك خلال 24-48 ساعة",
        "token": token,
        "user": {"id": user_id, "email": data.email, "name": data.name, "role": "seller"}
    }

# ==================== DRIVER REGISTRATION ====================

@router.post("/driver")
async def register_driver(data: DriverRegistration):
    """Register as a delivery driver"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        delivery_enabled = any(s["id"] == "delivery" and s.get("enabled") for s in services_config.get("services", []))
        if not delivery_enabled:
            raise HTTPException(status_code=400, detail="خدمة التوصيل غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "driver",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    driver_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "id_number": data.id_number,
        "license_number": data.license_number,
        "vehicle_type": data.vehicle_type,
        "vehicle_model": data.vehicle_model,
        "vehicle_plate": data.vehicle_plate,
        "city": data.city,
        "status": "pending",
        "is_online": False,
        "rating": 5.0,
        "total_deliveries": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    db.drivers.insert_one(driver_data)
    
    token = create_token(user_id, data.email, "driver")
    
    return {
        "message": "تم التسجيل بنجاح! سيتم مراجعة طلبك والتحقق من بياناتك",
        "token": token,
        "user": {"id": user_id, "email": data.email, "name": data.name, "role": "driver"}
    }

# ==================== RESTAURANT REGISTRATION ====================

@router.post("/restaurant")
async def register_restaurant(data: RestaurantRegistration):
    """Register a restaurant"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        food_enabled = any(s["id"] == "food" and s.get("enabled") for s in services_config.get("services", []))
        if not food_enabled:
            raise HTTPException(status_code=400, detail="خدمة طلب الطعام غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.owner_name,
        "phone": data.phone,
        "role": "restaurant_owner",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    restaurant_data = {
        "id": str(uuid.uuid4()),
        "owner_id": user_id,
        "name": data.restaurant_name,
        "name_ar": data.restaurant_name_ar,
        "cuisine_type": data.cuisine_type,
        "address": data.address,
        "phone": data.phone,
        "commercial_register": data.commercial_register,
        "delivery_available": data.delivery_available,
        "status": "pending",
        "is_featured": False,
        "delivery_time": "30-45 دقيقة",
        "delivery_fee": 10,
        "min_order": 30,
        "created_at": datetime.utcnow().isoformat()
    }
    db.restaurants.insert_one(restaurant_data)
    
    token = create_token(user_id, data.email, "restaurant_owner")
    
    return {
        "message": "تم تسجيل المطعم بنجاح! سيتم مراجعة طلبك",
        "token": token,
        "restaurant_id": restaurant_data["id"]
    }

# ==================== CAPTAIN (RIDES) REGISTRATION ====================

@router.post("/captain")
async def register_captain(data: DriverRegistration):
    """Register as a ride captain"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        rides_enabled = any(s["id"] == "rides" and s.get("enabled") for s in services_config.get("services", []))
        if not rides_enabled:
            raise HTTPException(status_code=400, detail="خدمة المشاوير غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "captain",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    captain_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "id_number": data.id_number,
        "license_number": data.license_number,
        "vehicle_type": data.vehicle_type,
        "vehicle_model": data.vehicle_model,
        "vehicle_plate": data.vehicle_plate,
        "city": data.city,
        "status": "pending",
        "is_online": False,
        "rating": 5.0,
        "total_rides": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    db.captains.insert_one(captain_data)
    
    token = create_token(user_id, data.email, "captain")
    
    return {
        "message": "تم التسجيل ككابتن بنجاح! سيتم مراجعة طلبك",
        "token": token
    }

# ==================== HOTEL REGISTRATION ====================

@router.post("/hotel")
async def register_hotel(data: HotelRegistration):
    """Register a hotel"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        hotels_enabled = any(s["id"] == "hotels" and s.get("enabled") for s in services_config.get("services", []))
        if not hotels_enabled:
            raise HTTPException(status_code=400, detail="خدمة الفنادق غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.manager_name,
        "phone": data.phone,
        "role": "hotel_manager",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    hotel_data = {
        "id": str(uuid.uuid4()),
        "manager_id": user_id,
        "name": data.hotel_name,
        "name_ar": data.hotel_name_ar,
        "star_rating": data.star_rating,
        "address": data.address,
        "city": data.city,
        "phone": data.phone,
        "total_rooms": data.total_rooms,
        "facilities": data.facilities,
        "commercial_register": data.commercial_register,
        "status": "pending",
        "is_featured": False,
        "created_at": datetime.utcnow().isoformat()
    }
    db.hotels.insert_one(hotel_data)
    
    token = create_token(user_id, data.email, "hotel_manager")
    
    return {
        "message": "تم تسجيل الفندق بنجاح! سيتم مراجعة طلبك",
        "token": token,
        "hotel_id": hotel_data["id"]
    }

# ==================== SERVICE PROVIDER REGISTRATION ====================

@router.post("/service-provider")
async def register_service_provider(data: ServiceProviderRegistration):
    """Register as a service provider (cleaning, maintenance, etc.)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        ondemand_enabled = any(s["id"] == "ondemand" and s.get("enabled") for s in services_config.get("services", []))
        if not ondemand_enabled:
            raise HTTPException(status_code=400, detail="خدمات الطلب غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "service_provider",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    provider_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "company_name": data.company_name,
        "service_type": data.service_type,
        "experience_years": data.experience_years,
        "city": data.city,
        "areas_covered": data.areas_covered,
        "has_team": data.has_team,
        "team_size": data.team_size,
        "status": "pending",
        "rating": 5.0,
        "total_jobs": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    db.service_providers.insert_one(provider_data)
    
    token = create_token(user_id, data.email, "service_provider")
    
    return {
        "message": "تم التسجيل كمقدم خدمات بنجاح!",
        "token": token
    }

# ==================== EXPERIENCE PROVIDER REGISTRATION ====================

@router.post("/experience")
async def register_experience_provider(data: ExperienceProviderRegistration):
    """Register as an experience/activity provider"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check service is enabled
    services_config = db.command_services.find_one({"type": "services_config"})
    if services_config:
        experiences_enabled = any(s["id"] == "experiences" and s.get("enabled") for s in services_config.get("services", []))
        if not experiences_enabled:
            raise HTTPException(status_code=400, detail="خدمة التجارب غير متاحة حالياً")
    
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = str(uuid.uuid4())
    
    user_data = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "experience_provider",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    db.users.insert_one(user_data)
    
    provider_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "company_name": data.company_name,
        "experience_type": data.experience_type,
        "description": data.description,
        "city": data.city,
        "license_number": data.license_number,
        "status": "pending",
        "rating": 5.0,
        "total_bookings": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    db.experience_providers.insert_one(provider_data)
    
    token = create_token(user_id, data.email, "experience_provider")
    
    return {
        "message": "تم التسجيل كمقدم تجارب بنجاح!",
        "token": token
    }
