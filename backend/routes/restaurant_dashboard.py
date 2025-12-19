from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/api/restaurant", tags=["restaurant-dashboard"])

# Get database from server.py
db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-restaurant-secret-key-2024")

# Models
class RestaurantLogin(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    is_open: bool

class MenuItem(BaseModel):
    name: str
    category: str
    price: float
    available: bool = True

# Token verification
from fastapi import Header

async def verify_restaurant_token(authorization: str = Header(None)):
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
async def restaurant_login(data: RestaurantLogin):
    """Login for restaurants"""
    # For demo, accept specific credentials
    demo_restaurants = [
        {"email": "restaurant@ocean.com", "password": "restaurant123", "name": "مطعم Ocean", "id": "rest-1", "rating": 4.7, "cuisine": "متنوع"},
        {"email": "albaik@ocean.com", "password": "restaurant123", "name": "البيك", "id": "rest-2", "rating": 4.9, "cuisine": "دجاج"},
    ]
    
    restaurant = next((r for r in demo_restaurants if r["email"] == data.email and r["password"] == data.password), None)
    
    if not restaurant:
        # Check in database
        if db:
            db_restaurant = await db.restaurants.find_one({"email": data.email}, {"_id": 0})
            if db_restaurant and db_restaurant.get("password") == data.password:
                restaurant = db_restaurant
    
    if not restaurant:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    token = jwt.encode({
        "restaurant_id": restaurant.get("id", str(uuid4())),
        "email": restaurant["email"],
        "name": restaurant["name"],
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "restaurant": {
            "id": restaurant.get("id"),
            "name": restaurant["name"],
            "email": restaurant["email"],
            "rating": restaurant.get("rating", 4.5),
            "cuisine": restaurant.get("cuisine", "متنوع"),
            "is_open": restaurant.get("is_open", True)
        }
    }

@router.post("/status")
async def update_restaurant_status(data: StatusUpdate, user = Depends(verify_restaurant_token)):
    """Update restaurant open/close status"""
    if db:
        await db.restaurants.update_one(
            {"id": user["restaurant_id"]},
            {"$set": {"is_open": data.is_open, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"success": True, "is_open": data.is_open}

@router.get("/dashboard")
async def get_restaurant_dashboard(user = Depends(verify_restaurant_token)):
    """Get restaurant dashboard data"""
    import random
    
    return {
        "todayOrders": random.randint(30, 60),
        "todayRevenue": random.randint(2000, 5000),
        "avgPrepTime": random.randint(15, 25),
        "rating": round(4.3 + random.random() * 0.6, 1),
        "pendingOrders": [
            {
                "id": f"FO-{str(i).zfill(3)}",
                "customer": f"عميل {random.randint(1, 50)}",
                "items": random.sample(["برجر دجاج", "بيتزا كبيرة", "شاورما لحم", "وجبة عائلية", "سلطة", "عصير"], k=random.randint(1, 3)),
                "total": random.randint(25, 120),
                "time": f"{random.randint(1, 10)} دقيقة"
            }
            for i in range(random.randint(1, 4))
        ],
        "preparingOrders": [
            {
                "id": f"FO-{str(i+10).zfill(3)}",
                "customer": f"عميل {random.randint(1, 50)}",
                "items": random.sample(["برجر لحم", "بيتزا صغيرة", "شاورما دجاج", "مشاوي"], k=random.randint(1, 2)),
                "total": random.randint(30, 80),
                "prepTime": f"{random.randint(5, 15)} دقيقة"
            }
            for i in range(random.randint(0, 3))
        ]
    }

@router.get("/orders")
async def get_restaurant_orders(user = Depends(verify_restaurant_token), status: str = None):
    """Get restaurant orders"""
    import random
    
    orders = []
    items_list = ["برجر دجاج", "برجر لحم", "بيتزا مارجريتا", "بيتزا بيبروني", "شاورما لحم", "شاورما دجاج", "وجبة عائلية", "مشاوي مشكلة"]
    statuses = ["pending", "preparing", "ready", "completed", "cancelled"]
    
    for i in range(30):
        order_status = random.choice(statuses) if not status else status
        orders.append({
            "id": f"FO-{str(i).zfill(3)}",
            "customer": f"عميل {random.randint(1, 100)}",
            "items": random.sample(items_list, k=random.randint(1, 4)),
            "status": order_status,
            "total": random.randint(25, 200),
            "date": f"2024-01-15 {random.randint(10, 23)}:{random.randint(0, 59):02d}"
        })
    
    if status:
        orders = [o for o in orders if o["status"] == status]
    
    return {"orders": orders}

@router.get("/menu")
async def get_restaurant_menu(user = Depends(verify_restaurant_token)):
    """Get restaurant menu items"""
    menu = [
        {"id": 1, "name": "برجر دجاج", "category": "burgers", "price": 25, "available": True},
        {"id": 2, "name": "برجر لحم", "category": "burgers", "price": 30, "available": True},
        {"id": 3, "name": "بيتزا مارجريتا", "category": "pizza", "price": 45, "available": True},
        {"id": 4, "name": "بيتزا بيبروني", "category": "pizza", "price": 55, "available": False},
        {"id": 5, "name": "شاورما لحم", "category": "shawarma", "price": 18, "available": True},
        {"id": 6, "name": "شاورما دجاج", "category": "shawarma", "price": 15, "available": True},
        {"id": 7, "name": "كولا", "category": "drinks", "price": 5, "available": True},
        {"id": 8, "name": "عصير برتقال", "category": "drinks", "price": 8, "available": True},
    ]
    return {"menu": menu}

@router.post("/menu")
async def add_menu_item(item: MenuItem, user = Depends(verify_restaurant_token)):
    """Add new menu item"""
    new_item = {
        "id": str(uuid4()),
        "restaurant_id": user["restaurant_id"],
        **item.dict(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if db:
        await db.menu_items.insert_one(new_item)
    
    return {"success": True, "item": {k: v for k, v in new_item.items() if k != "_id"}}

@router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, item: MenuItem, user = Depends(verify_restaurant_token)):
    """Update menu item"""
    if db:
        await db.menu_items.update_one(
            {"id": item_id, "restaurant_id": user["restaurant_id"]},
            {"$set": item.dict()}
        )
    return {"success": True}

@router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, user = Depends(verify_restaurant_token)):
    """Delete menu item"""
    if db:
        await db.menu_items.delete_one({"id": item_id, "restaurant_id": user["restaurant_id"]})
    return {"success": True}

@router.get("/analytics")
async def get_restaurant_analytics(user = Depends(verify_restaurant_token), period: str = "week"):
    """Get restaurant analytics"""
    import random
    
    multiplier = {"today": 1, "week": 7, "month": 30}.get(period, 7)
    
    return {
        "totalOrders": random.randint(40, 80) * multiplier,
        "totalRevenue": random.randint(3000, 6000) * multiplier,
        "avgOrderValue": random.randint(60, 90),
        "cancelRate": round(random.uniform(1, 5), 1),
        "topItems": [
            {"name": "برجر دجاج", "orders": random.randint(50, 100) * multiplier // 7, "revenue": random.randint(1500, 3000)},
            {"name": "بيتزا بيبروني", "orders": random.randint(40, 80) * multiplier // 7, "revenue": random.randint(2000, 4000)},
            {"name": "شاورما لحم", "orders": random.randint(30, 60) * multiplier // 7, "revenue": random.randint(800, 1500)},
            {"name": "وجبة عائلية", "orders": random.randint(20, 40) * multiplier // 7, "revenue": random.randint(3000, 6000)},
        ]
    }

@router.get("/reviews")
async def get_restaurant_reviews(user = Depends(verify_restaurant_token)):
    """Get restaurant reviews"""
    import random
    
    reviews = [
        {"id": 1, "customer": "أحمد محمد", "rating": 5, "comment": "طعام لذيذ جداً والتوصيل سريع!", "date": "2024-01-15", "items": ["برجر دجاج", "بطاطس"]},
        {"id": 2, "customer": "سارة علي", "rating": 4, "comment": "بيتزا رائعة لكن وصلت باردة قليلاً", "date": "2024-01-14", "items": ["بيتزا كبيرة"]},
        {"id": 3, "customer": "محمد خالد", "rating": 5, "comment": "أفضل شاورما في المدينة!", "date": "2024-01-14", "items": ["شاورما لحم"]},
        {"id": 4, "customer": "فاطمة أحمد", "rating": 3, "comment": "الكمية قليلة بالنسبة للسعر", "date": "2024-01-13", "items": ["وجبة عائلية"]},
    ]
    
    return {
        "overallRating": 4.5,
        "totalReviews": 186,
        "reviews": reviews
    }

@router.post("/orders/{order_id}/accept")
async def accept_order(order_id: str, user = Depends(verify_restaurant_token)):
    """Accept an order"""
    return {"success": True, "message": f"تم قبول الطلب {order_id}"}

@router.post("/orders/{order_id}/ready")
async def mark_order_ready(order_id: str, user = Depends(verify_restaurant_token)):
    """Mark order as ready for pickup"""
    return {"success": True, "message": f"الطلب {order_id} جاهز للتسليم"}

@router.post("/orders/{order_id}/reject")
async def reject_order(order_id: str, user = Depends(verify_restaurant_token)):
    """Reject an order"""
    return {"success": True, "message": f"تم رفض الطلب {order_id}"}
