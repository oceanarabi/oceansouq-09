#!/usr/bin/env python3
"""
Seed script to add demo data for restaurants, hotels, and other services
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient
import uuid
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['oceansouq']

def seed_restaurants():
    """Add demo restaurants with menu items"""
    restaurants = [
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-1",
            "name": "Al Baik",
            "name_ar": "البيك",
            "description": "أشهر مطعم وجبات سريعة في السعودية",
            "description_ar": "أشهر مطعم وجبات سريعة في السعودية",
            "cuisine_type": "fast_food",
            "address": "طريق الملك فهد، الرياض",
            "phone": "+966112345678",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "25-35 دقيقة",
            "delivery_fee": 10,
            "min_order": 30,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-2",
            "name": "Kudu",
            "name_ar": "كودو",
            "description": "ساندويتشات طازجة ولذيذة",
            "description_ar": "ساندويتشات طازجة ولذيذة",
            "cuisine_type": "fast_food",
            "address": "شارع التحلية، جدة",
            "phone": "+966122345678",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "20-30 دقيقة",
            "delivery_fee": 8,
            "min_order": 25,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-3",
            "name": "Herfy",
            "name_ar": "هرفي",
            "description": "برجر سعودي أصيل",
            "description_ar": "برجر سعودي أصيل",
            "cuisine_type": "fast_food",
            "address": "طريق الأمير سلطان، الرياض",
            "phone": "+966113456789",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "30-40 دقيقة",
            "delivery_fee": 12,
            "min_order": 35,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-4",
            "name": "Mama Noura",
            "name_ar": "ماما نورة",
            "description": "أطباق شرقية وشاورما لذيذة",
            "description_ar": "أطباق شرقية وشاورما لذيذة",
            "cuisine_type": "arabic",
            "address": "شارع العليا، الرياض",
            "phone": "+966114567890",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "35-45 دقيقة",
            "delivery_fee": 10,
            "min_order": 40,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-5",
            "name": "Shrimp House",
            "name_ar": "بيت الروبيان",
            "description": "أفضل المأكولات البحرية الطازجة",
            "description_ar": "أفضل المأكولات البحرية الطازجة",
            "cuisine_type": "seafood",
            "address": "كورنيش جدة",
            "phone": "+966125678901",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "40-50 دقيقة",
            "delivery_fee": 15,
            "min_order": 60,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-6",
            "name": "Piatto",
            "name_ar": "بياتو",
            "description": "أشهى المأكولات الإيطالية",
            "description_ar": "أشهى المأكولات الإيطالية",
            "cuisine_type": "italian",
            "address": "النخيل مول، الرياض",
            "phone": "+966116789012",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "35-45 دقيقة",
            "delivery_fee": 12,
            "min_order": 50,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-7",
            "name": "Nando's",
            "name_ar": "ناندوز",
            "description": "دجاج مشوي على الطريقة البرتغالية",
            "description_ar": "دجاج مشوي على الطريقة البرتغالية",
            "cuisine_type": "grills",
            "address": "غرناطة مول، الرياض",
            "phone": "+966117890123",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "30-40 دقيقة",
            "delivery_fee": 10,
            "min_order": 45,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "owner_id": "demo-owner-8",
            "name": "Starbucks",
            "name_ar": "ستاربكس",
            "description": "قهوة ومشروبات متميزة",
            "description_ar": "قهوة ومشروبات متميزة",
            "cuisine_type": "coffee",
            "address": "الرياض بارك، الرياض",
            "phone": "+966118901234",
            "logo_url": "",
            "cover_image": "",
            "delivery_time": "20-30 دقيقة",
            "delivery_fee": 8,
            "min_order": 20,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    # Clear existing and insert new
    db.restaurants.delete_many({})
    db.restaurants.insert_many(restaurants)
    print(f"✅ Added {len(restaurants)} restaurants")
    
    # Add menu items for each restaurant
    menu_items = []
    
    # Al Baik menu
    albaik_id = restaurants[0]["id"]
    menu_items.extend([
        {"id": str(uuid.uuid4()), "restaurant_id": albaik_id, "name": "Broasted Chicken", "name_ar": "دجاج بروستد", "description": "قطعتان دجاج بروستد مع بطاطس وصلصة ثوم", "price": 18, "category": "الوجبات الرئيسية", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": albaik_id, "name": "Shrimp Meal", "name_ar": "وجبة روبيان", "description": "روبيان مقرمش مع بطاطس وصلصة", "price": 22, "category": "الوجبات الرئيسية", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": albaik_id, "name": "Fish Fillet", "name_ar": "فيليه سمك", "description": "قطعتان فيليه سمك مقرمش", "price": 20, "category": "الوجبات الرئيسية", "is_available": True, "is_popular": False},
        {"id": str(uuid.uuid4()), "restaurant_id": albaik_id, "name": "Family Meal", "name_ar": "وجبة عائلية", "description": "8 قطع دجاج + بطاطس كبير + كول سلو", "price": 65, "category": "الوجبات العائلية", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": albaik_id, "name": "Garlic Sauce", "name_ar": "صلصة ثوم", "description": "صلصة الثوم الشهيرة", "price": 2, "category": "الإضافات", "is_available": True, "is_popular": True},
    ])
    
    # Kudu menu
    kudu_id = restaurants[1]["id"]
    menu_items.extend([
        {"id": str(uuid.uuid4()), "restaurant_id": kudu_id, "name": "Chicken Sandwich", "name_ar": "ساندويتش دجاج", "description": "دجاج مشوي مع خضار طازجة", "price": 16, "category": "الساندويتشات", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": kudu_id, "name": "Beef Burger", "name_ar": "برجر لحم", "description": "لحم بقري طازج مع جبنة", "price": 22, "category": "البرجر", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": kudu_id, "name": "Fries", "name_ar": "بطاطس مقلية", "description": "بطاطس مقرمشة", "price": 8, "category": "الجانبية", "is_available": True, "is_popular": False},
    ])
    
    # Mama Noura menu
    mama_id = restaurants[3]["id"]
    menu_items.extend([
        {"id": str(uuid.uuid4()), "restaurant_id": mama_id, "name": "Shawarma", "name_ar": "شاورما", "description": "شاورما دجاج مع صلصة طحينة", "price": 12, "category": "الشاورما", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": mama_id, "name": "Chicken Shawarma Plate", "name_ar": "صحن شاورما دجاج", "description": "شاورما مع أرز وسلطة", "price": 28, "category": "الأطباق", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": mama_id, "name": "Mixed Grill", "name_ar": "مشاوي مشكلة", "description": "تشكيلة من اللحوم المشوية", "price": 55, "category": "المشويات", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": mama_id, "name": "Hummus", "name_ar": "حمص", "description": "حمص بالطحينة", "price": 10, "category": "المقبلات", "is_available": True, "is_popular": False},
    ])
    
    # Shrimp House menu
    shrimp_id = restaurants[4]["id"]
    menu_items.extend([
        {"id": str(uuid.uuid4()), "restaurant_id": shrimp_id, "name": "Grilled Shrimp", "name_ar": "روبيان مشوي", "description": "روبيان جامبو مشوي بالثوم", "price": 75, "category": "الروبيان", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": shrimp_id, "name": "Fish Grill", "name_ar": "سمك مشوي", "description": "سمك هامور مشوي", "price": 85, "category": "الأسماك", "is_available": True, "is_popular": True},
        {"id": str(uuid.uuid4()), "restaurant_id": shrimp_id, "name": "Seafood Platter", "name_ar": "طبق بحري مشكل", "description": "تشكيلة من المأكولات البحرية", "price": 120, "category": "الأطباق", "is_available": True, "is_popular": True},
    ])
    
    db.menu_items.delete_many({})
    db.menu_items.insert_many(menu_items)
    print(f"✅ Added {len(menu_items)} menu items")

def seed_hotels():
    """Add demo hotels with room types"""
    hotels = [
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-1",
            "name": "Ritz Carlton Riyadh",
            "name_ar": "ريتز كارلتون الرياض",
            "star_rating": 5,
            "address": "طريق الملك فهد، حي الصحافة",
            "city": "riyadh",
            "phone": "+966112345678",
            "description": "فندق فاخر من فئة 5 نجوم في قلب الرياض",
            "facilities": ["wifi", "pool", "gym", "spa", "restaurant", "parking", "room_service"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-2",
            "name": "Hilton Jeddah",
            "name_ar": "هيلتون جدة",
            "star_rating": 5,
            "address": "كورنيش جدة",
            "city": "jeddah",
            "phone": "+966122345678",
            "description": "إطلالة رائعة على البحر الأحمر",
            "facilities": ["wifi", "pool", "gym", "restaurant", "parking", "airport_shuttle"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-3",
            "name": "Swissotel Makkah",
            "name_ar": "سويس أوتيل مكة",
            "star_rating": 5,
            "address": "أبراج البيت، مكة المكرمة",
            "city": "mecca",
            "phone": "+966125678901",
            "description": "على بعد خطوات من الحرم المكي الشريف",
            "facilities": ["wifi", "restaurant", "room_service", "prayer_room", "laundry"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-4",
            "name": "Oberoi Medina",
            "name_ar": "أوبروي المدينة",
            "star_rating": 5,
            "address": "المنطقة المركزية، المدينة المنورة",
            "city": "medina",
            "phone": "+966148901234",
            "description": "قريب من المسجد النبوي الشريف",
            "facilities": ["wifi", "restaurant", "room_service", "prayer_room", "parking"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-5",
            "name": "Novotel Dammam",
            "name_ar": "نوفوتيل الدمام",
            "star_rating": 4,
            "address": "طريق الملك فهد، الدمام",
            "city": "dammam",
            "phone": "+966138901234",
            "description": "فندق عصري في قلب المنطقة الشرقية",
            "facilities": ["wifi", "pool", "gym", "restaurant", "parking"],
            "cover_image": "",
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-6",
            "name": "InterContinental Khobar",
            "name_ar": "انتركونتيننتال الخبر",
            "star_rating": 5,
            "address": "كورنيش الخبر",
            "city": "khobar",
            "phone": "+966138765432",
            "description": "إطلالة بانورامية على الخليج العربي",
            "facilities": ["wifi", "pool", "gym", "spa", "restaurant", "parking", "breakfast"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-7",
            "name": "Le Meridien Taif",
            "name_ar": "لو ميريديان الطائف",
            "star_rating": 4,
            "address": "طريق الهدا، الطائف",
            "city": "taif",
            "phone": "+966127654321",
            "description": "في قلب جبال الطائف الساحرة",
            "facilities": ["wifi", "restaurant", "parking", "gym"],
            "cover_image": "",
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "manager_id": "demo-manager-8",
            "name": "Abha Palace",
            "name_ar": "قصر أبها",
            "star_rating": 4,
            "address": "منتزه السودة، أبها",
            "city": "abha",
            "phone": "+966175432109",
            "description": "استمتع بأجواء عسير الباردة",
            "facilities": ["wifi", "restaurant", "parking", "room_service"],
            "cover_image": "",
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    db.hotels.delete_many({})
    db.hotels.insert_many(hotels)
    print(f"✅ Added {len(hotels)} hotels")
    
    # Add room types
    room_types = []
    
    for hotel in hotels:
        base_price = 500 if hotel["star_rating"] == 5 else 300
        
        room_types.extend([
            {
                "id": str(uuid.uuid4()),
                "hotel_id": hotel["id"],
                "name": "Standard Room",
                "name_ar": "غرفة قياسية",
                "description": "غرفة مريحة مع جميع وسائل الراحة",
                "price_per_night": base_price,
                "max_guests": 2,
                "beds": "1 سرير كبير",
                "amenities": ["تكييف", "واي فاي", "تلفزيون", "ثلاجة صغيرة"],
                "images": [],
                "available_rooms": 10,
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "hotel_id": hotel["id"],
                "name": "Deluxe Room",
                "name_ar": "غرفة ديلوكس",
                "description": "غرفة واسعة مع إطلالة مميزة",
                "price_per_night": int(base_price * 1.5),
                "max_guests": 2,
                "beds": "1 سرير كينج",
                "amenities": ["تكييف", "واي فاي", "تلفزيون", "ثلاجة", "صندوق أمانات", "روب حمام"],
                "images": [],
                "available_rooms": 8,
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "hotel_id": hotel["id"],
                "name": "Suite",
                "name_ar": "جناح",
                "description": "جناح فاخر مع غرفة معيشة منفصلة",
                "price_per_night": int(base_price * 2.5),
                "max_guests": 4,
                "beds": "1 سرير كينج + أريكة سرير",
                "amenities": ["تكييف", "واي فاي", "تلفزيون", "مطبخ صغير", "غرفة معيشة", "جاكوزي"],
                "images": [],
                "available_rooms": 4,
                "created_at": datetime.utcnow().isoformat()
            }
        ])
    
    db.hotel_rooms.delete_many({})
    db.hotel_rooms.insert_many(room_types)
    print(f"✅ Added {len(room_types)} room types")

def seed_experiences():
    """Add demo experiences and activities"""
    experiences = [
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-exp-1",
            "name": "Desert Safari",
            "name_ar": "رحلة صحراوية",
            "description": "مغامرة في الصحراء مع ركوب الجمال والعشاء البدوي",
            "experience_type": "adventure",
            "city": "riyadh",
            "duration": "6 ساعات",
            "price": 350,
            "max_participants": 20,
            "includes": ["نقل من الفندق", "عشاء بدوي", "ركوب جمال", "تزلج على الرمال"],
            "images": [],
            "rating": 4.8,
            "review_count": 156,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-exp-2",
            "name": "Jeddah Historical Tour",
            "name_ar": "جولة جدة التاريخية",
            "description": "اكتشف تاريخ جدة العريق في البلد القديم",
            "experience_type": "tours",
            "city": "jeddah",
            "duration": "4 ساعات",
            "price": 150,
            "max_participants": 15,
            "includes": ["مرشد سياحي", "دخول المتاحف", "مشروبات"],
            "images": [],
            "rating": 4.6,
            "review_count": 89,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-exp-3",
            "name": "Scuba Diving Red Sea",
            "name_ar": "غوص في البحر الأحمر",
            "description": "استكشف الشعاب المرجانية الخلابة",
            "experience_type": "activities",
            "city": "jeddah",
            "duration": "5 ساعات",
            "price": 500,
            "max_participants": 8,
            "includes": ["معدات الغوص", "مدرب محترف", "وجبة غداء", "نقل بحري"],
            "images": [],
            "rating": 4.9,
            "review_count": 234,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-exp-4",
            "name": "Saudi Cooking Class",
            "name_ar": "دورة الطبخ السعودي",
            "description": "تعلم أسرار المطبخ السعودي الأصيل",
            "experience_type": "workshops",
            "city": "riyadh",
            "duration": "3 ساعات",
            "price": 200,
            "max_participants": 10,
            "includes": ["جميع المكونات", "وصفات مطبوعة", "تناول ما طبخته"],
            "images": [],
            "rating": 4.7,
            "review_count": 67,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-exp-5",
            "name": "Edge of the World",
            "name_ar": "حافة العالم",
            "description": "رحلة إلى أشهر معلم طبيعي في السعودية",
            "experience_type": "adventure",
            "city": "riyadh",
            "duration": "8 ساعات",
            "price": 400,
            "max_participants": 12,
            "includes": ["نقل 4x4", "وجبة غداء", "مرشد", "معدات التسلق"],
            "images": [],
            "rating": 4.9,
            "review_count": 312,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    db.experiences.delete_many({})
    db.experiences.insert_many(experiences)
    print(f"✅ Added {len(experiences)} experiences")

def seed_services():
    """Add demo on-demand services"""
    services = [
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-1",
            "name": "Home Cleaning",
            "name_ar": "تنظيف منازل",
            "service_type": "cleaning",
            "description": "تنظيف شامل للمنزل بأيدي محترفة",
            "price_type": "hourly",
            "base_price": 50,
            "min_hours": 2,
            "city": "riyadh",
            "rating": 4.7,
            "total_jobs": 523,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-2",
            "name": "AC Maintenance",
            "name_ar": "صيانة مكيفات",
            "service_type": "ac_maintenance",
            "description": "صيانة وتنظيف جميع أنواع المكيفات",
            "price_type": "fixed",
            "base_price": 150,
            "min_hours": 1,
            "city": "riyadh",
            "rating": 4.8,
            "total_jobs": 892,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-3",
            "name": "Plumbing Services",
            "name_ar": "خدمات سباكة",
            "service_type": "plumbing",
            "description": "إصلاح جميع مشاكل السباكة",
            "price_type": "fixed",
            "base_price": 100,
            "min_hours": 1,
            "city": "riyadh",
            "rating": 4.5,
            "total_jobs": 367,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-4",
            "name": "Electrical Work",
            "name_ar": "أعمال كهربائية",
            "service_type": "electrical",
            "description": "تمديدات وإصلاحات كهربائية",
            "price_type": "hourly",
            "base_price": 80,
            "min_hours": 1,
            "city": "riyadh",
            "rating": 4.6,
            "total_jobs": 445,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-5",
            "name": "Car Wash",
            "name_ar": "غسيل سيارات",
            "service_type": "car_wash",
            "description": "غسيل سيارتك في موقعك",
            "price_type": "fixed",
            "base_price": 50,
            "min_hours": 1,
            "city": "riyadh",
            "rating": 4.9,
            "total_jobs": 1205,
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "provider_id": "demo-service-6",
            "name": "Furniture Moving",
            "name_ar": "نقل أثاث",
            "service_type": "moving",
            "description": "نقل الأثاث بعناية فائقة",
            "price_type": "quote",
            "base_price": 500,
            "min_hours": 3,
            "city": "riyadh",
            "rating": 4.4,
            "total_jobs": 234,
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    db.ondemand_services.delete_many({})
    db.ondemand_services.insert_many(services)
    print(f"✅ Added {len(services)} on-demand services")

def seed_subscriptions():
    """Add demo subscription packages"""
    subscriptions = [
        {
            "id": str(uuid.uuid4()),
            "name": "Ocean Plus",
            "name_ar": "أوشن بلس",
            "description": "اشتراك شهري للتوفير على جميع الخدمات",
            "price_monthly": 49,
            "price_yearly": 399,
            "benefits": [
                "توصيل مجاني غير محدود",
                "خصم 10% على جميع الطلبات",
                "أولوية في الدعم الفني",
                "عروض حصرية"
            ],
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ocean Family",
            "name_ar": "أوشن عائلي",
            "description": "اشتراك لكل أفراد العائلة",
            "price_monthly": 99,
            "price_yearly": 799,
            "benefits": [
                "5 حسابات عائلية",
                "توصيل مجاني غير محدود",
                "خصم 15% على جميع الطلبات",
                "خصم 20% على الفنادق",
                "أولوية في المشاوير"
            ],
            "is_featured": True,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ocean Business",
            "name_ar": "أوشن أعمال",
            "description": "للشركات والمؤسسات",
            "price_monthly": 299,
            "price_yearly": 2499,
            "benefits": [
                "حسابات غير محدودة للموظفين",
                "فواتير شهرية موحدة",
                "مدير حساب مخصص",
                "تقارير استخدام تفصيلية",
                "خصومات حصرية للشركات"
            ],
            "is_featured": False,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    db.subscriptions.delete_many({})
    db.subscriptions.insert_many(subscriptions)
    print(f"✅ Added {len(subscriptions)} subscription packages")

def main():
    print("\n🌊 Ocean Super App - Seeding Demo Data\n")
    print("="*50)
    
    seed_restaurants()
    seed_hotels()
    seed_experiences()
    seed_services()
    seed_subscriptions()
    
    print("="*50)
    print("\n✅ All demo data seeded successfully!\n")

if __name__ == "__main__":
    main()
