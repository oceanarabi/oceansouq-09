from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
from datetime import datetime, timedelta
import uuid
import os

router = APIRouter(prefix="/api/food", tags=["food-service"])

security = HTTPBearer()

# Database reference
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models
class RestaurantCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    description: str
    description_ar: Optional[str] = None
    cuisine_type: str  # fast_food, arabic, asian, italian, etc.
    address: str
    phone: str
    logo_url: Optional[str] = ""
    cover_image: Optional[str] = ""
    delivery_time: Optional[str] = "30-45 دقيقة"
    delivery_fee: float = 0
    min_order: float = 0
    is_featured: bool = False

class MenuItemCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    description: str
    description_ar: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = ""
    is_available: bool = True
    is_popular: bool = False
    calories: Optional[int] = None
    preparation_time: Optional[str] = "15-20 دقيقة"

class FoodOrderCreate(BaseModel):
    restaurant_id: str
    items: List[dict]  # [{menu_item_id, quantity, special_instructions}]
    delivery_address: str
    payment_method: str = "cash"
    notes: Optional[str] = ""

class FoodOrderStatusUpdate(BaseModel):
    status: str  # pending, confirmed, preparing, ready, delivering, delivered, cancelled

# Auth Helper
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_restaurant_owner(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if payload.get('role') not in ['restaurant_owner', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Restaurant owner access required")
    return payload

# ==================== RESTAURANTS ====================

@router.get("/restaurants")
async def get_restaurants(
    cuisine: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 20
):
    """Get all restaurants"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {"status": "active"}
    
    if cuisine:
        query["cuisine_type"] = cuisine
    if featured:
        query["is_featured"] = True
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"name_ar": {"$regex": search, "$options": "i"}}
        ]
    
    restaurants = list(db.restaurants.find(query, {"_id": 0}).limit(limit))
    
    # Add rating for each restaurant
    for restaurant in restaurants:
        reviews = list(db.food_reviews.find({"restaurant_id": restaurant["id"]}, {"_id": 0, "rating": 1}))
        if reviews:
            restaurant["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
            restaurant["review_count"] = len(reviews)
        else:
            restaurant["rating"] = 0
            restaurant["review_count"] = 0
    
    return restaurants

@router.get("/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    """Get restaurant details with menu"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    restaurant = db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get menu items
    menu_items = list(db.menu_items.find({"restaurant_id": restaurant_id, "is_available": True}, {"_id": 0}))
    
    # Group by category
    categories = {}
    for item in menu_items:
        cat = item.get("category", "أخرى")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    restaurant["menu"] = categories
    
    # Get reviews
    reviews = list(db.food_reviews.find({"restaurant_id": restaurant_id}, {"_id": 0}).sort("created_at", -1).limit(10))
    restaurant["reviews"] = reviews
    
    if reviews:
        restaurant["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
    
    return restaurant

@router.post("/restaurants")
async def create_restaurant(restaurant: RestaurantCreate, user = Depends(verify_restaurant_owner)):
    """Create a new restaurant"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    restaurant_data = {
        "id": str(uuid.uuid4()),
        "owner_id": user["user_id"],
        **restaurant.dict(),
        "status": "pending",  # pending, active, suspended
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.restaurants.insert_one(restaurant_data)
    if "_id" in restaurant_data:
        del restaurant_data["_id"]
    
    return {"message": "Restaurant created successfully", "restaurant": restaurant_data}

@router.put("/restaurants/{restaurant_id}")
async def update_restaurant(restaurant_id: str, updates: dict, user = Depends(verify_restaurant_owner)):
    """Update restaurant details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    restaurant = db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check ownership
    if user.get("role") not in ["admin", "super_admin"] and restaurant.get("owner_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updates["updated_at"] = datetime.utcnow().isoformat()
    db.restaurants.update_one({"id": restaurant_id}, {"$set": updates})
    
    return {"message": "Restaurant updated successfully"}

# ==================== MENU ITEMS ====================

@router.get("/restaurants/{restaurant_id}/menu")
async def get_menu(restaurant_id: str):
    """Get restaurant menu"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    items = list(db.menu_items.find({"restaurant_id": restaurant_id}, {"_id": 0}))
    
    # Group by category
    categories = {}
    for item in items:
        cat = item.get("category", "أخرى")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    return {"categories": categories, "total_items": len(items)}

@router.post("/restaurants/{restaurant_id}/menu")
async def add_menu_item(restaurant_id: str, item: MenuItemCreate, user = Depends(verify_restaurant_owner)):
    """Add menu item to restaurant"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Verify restaurant ownership
    restaurant = db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if user.get("role") not in ["admin", "super_admin"] and restaurant.get("owner_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    item_data = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        **item.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.menu_items.insert_one(item_data)
    
    return {"message": "Menu item added successfully", "item_id": item_data["id"]}

@router.put("/menu-items/{item_id}")
async def update_menu_item(item_id: str, updates: dict, user = Depends(verify_restaurant_owner)):
    """Update menu item"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    item = db.menu_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.menu_items.update_one({"id": item_id}, {"$set": updates})
    
    return {"message": "Menu item updated successfully"}

@router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, user = Depends(verify_restaurant_owner)):
    """Delete menu item"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db.menu_items.delete_one({"id": item_id})
    
    return {"message": "Menu item deleted successfully"}

# ==================== ORDERS ====================

@router.post("/orders")
async def create_food_order(order: FoodOrderCreate, user = Depends(verify_token)):
    """Create a food order"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get restaurant
    restaurant = db.restaurants.find_one({"id": order.restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Calculate total
    total = 0
    order_items = []
    for item in order.items:
        menu_item = db.menu_items.find_one({"id": item["menu_item_id"]}, {"_id": 0})
        if menu_item:
            item_total = menu_item["price"] * item["quantity"]
            total += item_total
            order_items.append({
                **item,
                "name": menu_item["name"],
                "name_ar": menu_item.get("name_ar", ""),
                "price": menu_item["price"],
                "item_total": item_total
            })
    
    # Add delivery fee
    total += restaurant.get("delivery_fee", 0)
    
    order_data = {
        "id": str(uuid.uuid4()),
        "order_number": f"FO-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        "user_id": user["user_id"],
        "restaurant_id": order.restaurant_id,
        "restaurant_name": restaurant["name"],
        "items": order_items,
        "subtotal": total - restaurant.get("delivery_fee", 0),
        "delivery_fee": restaurant.get("delivery_fee", 0),
        "total": total,
        "delivery_address": order.delivery_address,
        "payment_method": order.payment_method,
        "notes": order.notes,
        "status": "pending",
        "driver_id": None,
        "estimated_delivery": (datetime.utcnow() + timedelta(minutes=45)).isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.food_orders.insert_one(order_data)
    
    return {"message": "Order placed successfully", "order": {k: v for k, v in order_data.items() if k != "_id"}}

@router.get("/orders")
async def get_user_food_orders(user = Depends(verify_token)):
    """Get user's food orders"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    orders = list(db.food_orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1))
    return orders

@router.get("/orders/{order_id}")
async def get_food_order(order_id: str, user = Depends(verify_token)):
    """Get food order details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    order = db.food_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@router.put("/orders/{order_id}/status")
async def update_food_order_status(order_id: str, status_update: FoodOrderStatusUpdate, user = Depends(verify_restaurant_owner)):
    """Update food order status"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    db.food_orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": f"Order status updated to {status_update.status}"}

# ==================== REVIEWS ====================

@router.post("/restaurants/{restaurant_id}/reviews")
async def add_restaurant_review(restaurant_id: str, rating: int, comment: str, user = Depends(verify_token)):
    """Add review to restaurant"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_data = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "user_id": user["user_id"],
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.food_reviews.insert_one(review_data)
    
    return {"message": "Review added successfully"}

# ==================== CATEGORIES / CUISINES ====================

@router.get("/cuisines")
async def get_cuisines():
    """Get all cuisine types"""
    cuisines = [
        {"id": "fast_food", "name": "وجبات سريعة", "name_en": "Fast Food", "icon": "🍔"},
        {"id": "arabic", "name": "مأكولات عربية", "name_en": "Arabic", "icon": "🥙"},
        {"id": "asian", "name": "مأكولات آسيوية", "name_en": "Asian", "icon": "🍜"},
        {"id": "italian", "name": "مأكولات إيطالية", "name_en": "Italian", "icon": "🍕"},
        {"id": "indian", "name": "مأكولات هندية", "name_en": "Indian", "icon": "🍛"},
        {"id": "seafood", "name": "مأكولات بحرية", "name_en": "Seafood", "icon": "🦞"},
        {"id": "desserts", "name": "حلويات", "name_en": "Desserts", "icon": "🍰"},
        {"id": "coffee", "name": "قهوة ومشروبات", "name_en": "Coffee & Drinks", "icon": "☕"},
        {"id": "healthy", "name": "أكل صحي", "name_en": "Healthy", "icon": "🥗"},
        {"id": "grills", "name": "مشويات", "name_en": "Grills", "icon": "🍖"}
    ]
    return cuisines

# ==================== RESTAURANT DASHBOARD ====================

@router.get("/dashboard/stats")
async def get_restaurant_dashboard_stats(user = Depends(verify_restaurant_owner)):
    """Get restaurant owner dashboard stats"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get owner's restaurants
    restaurants = list(db.restaurants.find({"owner_id": user["user_id"]}, {"_id": 0, "id": 1}))
    restaurant_ids = [r["id"] for r in restaurants]
    
    # Calculate stats
    total_orders = db.food_orders.count_documents({"restaurant_id": {"$in": restaurant_ids}})
    pending_orders = db.food_orders.count_documents({"restaurant_id": {"$in": restaurant_ids}, "status": "pending"})
    
    orders = list(db.food_orders.find({"restaurant_id": {"$in": restaurant_ids}}, {"_id": 0, "total": 1}))
    total_revenue = sum(o.get("total", 0) for o in orders)
    
    menu_items = db.menu_items.count_documents({"restaurant_id": {"$in": restaurant_ids}})
    
    return {
        "total_restaurants": len(restaurants),
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue,
        "menu_items": menu_items
    }

@router.get("/dashboard/orders")
async def get_restaurant_orders(status: Optional[str] = None, user = Depends(verify_restaurant_owner)):
    """Get restaurant orders for dashboard"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get owner's restaurants
    restaurants = list(db.restaurants.find({"owner_id": user["user_id"]}, {"_id": 0, "id": 1}))
    restaurant_ids = [r["id"] for r in restaurants]
    
    query = {"restaurant_id": {"$in": restaurant_ids}}
    if status:
        query["status"] = status
    
    orders = list(db.food_orders.find(query, {"_id": 0}).sort("created_at", -1).limit(50))
    return orders
