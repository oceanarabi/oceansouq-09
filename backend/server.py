from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from typing import Optional, List
import os
from dotenv import load_dotenv
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid

# Load environment variables
load_dotenv()

app = FastAPI()

# Import and include admin routes
from routes.admin import router as admin_router, set_db as set_admin_db
from routes.seller import router as seller_router, set_db as set_seller_db
from routes.command import router as command_router, set_db as set_command_db
from routes.food import router as food_router, set_db as set_food_db
from routes.provider_registration import router as provider_router, set_db as set_provider_db

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['oceansouq']

# Collections
users_collection = db['users']
products_collection = db['products']
carts_collection = db['carts']
orders_collection = db['orders']
reviews_collection = db['reviews']
wishlist_collection = db['wishlist']
loyalty_points_collection = db['loyalty_points']
browsing_history_collection = db['browsing_history']
notifications_collection = db['notifications']
settings_collection = db['settings']

# New Collections for Social & Advanced Features
followers_collection = db['followers']  # Follow sellers
shared_lists_collection = db['shared_lists']  # Shared shopping lists
product_comparisons_collection = db['product_comparisons']  # Compare products
recently_viewed_collection = db['recently_viewed']  # Recently viewed products
review_votes_collection = db['review_votes']  # Helpful review votes

# Set database for admin routes
set_admin_db(db)

# Set database for seller routes
set_seller_db(db)

# Set database for command center routes
set_command_db(db)

# Set database for food service routes
set_food_db(db)

# Set database for provider registration routes
set_provider_db(db)

# Include admin router
app.include_router(admin_router)

# Include seller router
app.include_router(seller_router)

# Include command center router
app.include_router(command_router)

# Include food service router
app.include_router(food_router)

# Include provider registration router
app.include_router(provider_router)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "buyer"  # buyer or seller

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    title: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = ""
    stock: int = 0

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    shipping_phone: str

class Review(BaseModel):
    product_id: str
    rating: int  # 1-5
    comment: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_data = decode_token(token)
    return user_data

def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """Optional authentication - returns None if no token"""
    if not credentials:
        return None
    try:
        token = credentials.credentials
        user_data = decode_token(token)
        return user_data
    except:
        return None

# Routes
@app.get("/api")
def read_root():
    return {"message": "Welcome to OceanSouq API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Authentication Endpoints
@app.post("/api/auth/register")
def register(user: UserRegister):
    # Check if user exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "role": user.role,
        "created_at": datetime.utcnow().isoformat()
    }
    users_collection.insert_one(user_doc)
    
    # Create token
    token = create_token(user_id, user.email, user.role)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@app.post("/api/auth/login")
def login(credentials: UserLogin):
    # Find user
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_token(user['id'], user['email'], user['role'])
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"id": current_user['user_id']}, {"password": 0, "_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Product Endpoints
@app.get("/api/products")
def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    products = list(products_collection.find(query, {"_id": 0}).sort("created_at", -1))
    return products

# Special Product Endpoints (must be before /{product_id})
@app.get("/api/products/trending")
def get_trending_products():
    trending = list(products_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(12))
    return trending

@app.get("/api/products/daily-deals")
def get_daily_deals():
    import random
    all_products = list(products_collection.find({}, {"_id": 0}))
    deals = random.sample(all_products, min(8, len(all_products)))
    for deal in deals:
        deal['original_price'] = deal['price']
        deal['discount_percent'] = random.choice([10, 15, 20, 25, 30])
        deal['price'] = round(deal['price'] * (1 - deal['discount_percent']/100), 2)
    return deals

@app.get("/api/products/best-sellers")
def get_best_sellers():
    best_sellers = list(products_collection.find({}, {"_id": 0}).sort("stock", -1).limit(12))
    return best_sellers

@app.get("/api/products/recommended")
def get_recommended_products(current_user: dict = Depends(get_current_user)):
    wishlist = wishlist_collection.find_one({"user_id": current_user['user_id']})
    
    if wishlist and wishlist.get('items'):
        wishlist_products = list(products_collection.find({"id": {"$in": wishlist['items']}}, {"_id": 0}))
        categories = list(set([p['category'] for p in wishlist_products]))
        recommended = list(products_collection.find({
            "category": {"$in": categories},
            "id": {"$nin": wishlist['items']}
        }, {"_id": 0}).limit(12))
    else:
        recommended = list(products_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(12))
    
    return recommended

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get reviews for this product
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1))
    
    # Calculate average rating
    avg_rating = 0
    if reviews:
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
    
    product['reviews'] = reviews
    product['average_rating'] = round(avg_rating, 1)
    product['review_count'] = len(reviews)
    
    return product

@app.post("/api/products")
def create_product(product: Product, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'seller':
        raise HTTPException(status_code=403, detail="Only sellers can create products")
    
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "seller_id": current_user['user_id'],
        "title": product.title,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "image_url": product.image_url,
        "stock": product.stock,
        "created_at": datetime.utcnow().isoformat()
    }
    products_collection.insert_one(product_doc)
    
    return {"id": product_id, **product.dict()}

@app.put("/api/products/{product_id}")
def update_product(product_id: str, product: ProductUpdate, current_user: dict = Depends(get_current_user)):
    # Check if product exists and belongs to user
    existing_product = products_collection.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if existing_product['seller_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    
    # Update only provided fields
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    if update_data:
        products_collection.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = products_collection.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    # Check if product exists and belongs to user
    product = products_collection.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product['seller_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    products_collection.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}

@app.get("/api/products/seller/my-products")
def get_my_products(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'seller':
        raise HTTPException(status_code=403, detail="Only sellers can access this endpoint")
    
    products = list(products_collection.find({"seller_id": current_user['user_id']}, {"_id": 0}).sort("created_at", -1))
    return products

# Cart Endpoints
@app.get("/api/cart")
def get_cart(current_user: dict = Depends(get_current_user)):
    cart = carts_collection.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not cart:
        return {"user_id": current_user['user_id'], "items": [], "total": 0}
    
    # Populate product details
    items_with_details = []
    total = 0
    for item in cart.get('items', []):
        product = products_collection.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            item_total = product['price'] * item['quantity']
            items_with_details.append({
                **item,
                "product": product,
                "item_total": item_total
            })
            total += item_total
    
    return {"user_id": current_user['user_id'], "items": items_with_details, "total": total}

@app.post("/api/cart")
def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = products_collection.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product['stock'] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = carts_collection.find_one({"user_id": current_user['user_id']})
    if not cart:
        cart = {"user_id": current_user['user_id'], "items": []}
    
    # Check if product already in cart
    existing_item = next((i for i in cart['items'] if i['product_id'] == item.product_id), None)
    if existing_item:
        existing_item['quantity'] += item.quantity
    else:
        cart['items'].append({"product_id": item.product_id, "quantity": item.quantity})
    
    # Update cart
    carts_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart"}

@app.put("/api/cart/{product_id}")
def update_cart_item(product_id: str, item: CartItem, current_user: dict = Depends(get_current_user)):
    cart = carts_collection.find_one({"user_id": current_user['user_id']})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    found = False
    for cart_item in cart['items']:
        if cart_item['product_id'] == product_id:
            cart_item['quantity'] = item.quantity
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    carts_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"items": cart['items']}}
    )
    
    return {"message": "Cart updated"}

@app.delete("/api/cart/{product_id}")
def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    cart = carts_collection.find_one({"user_id": current_user['user_id']})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart['items'] = [item for item in cart['items'] if item['product_id'] != product_id]
    
    carts_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"items": cart['items']}}
    )
    
    return {"message": "Item removed from cart"}

# Order Endpoints
@app.post("/api/orders")
def create_order(order: Order, current_user: dict = Depends(get_current_user)):
    # Get cart
    cart = carts_collection.find_one({"user_id": current_user['user_id']})
    if not cart or not cart.get('items'):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and prepare order items
    order_items = []
    total = 0
    for item in cart['items']:
        product = products_collection.find_one({"id": item['product_id']})
        if product:
            item_total = product['price'] * item['quantity']
            order_items.append({
                "product_id": item['product_id'],
                "title": product['title'],
                "price": product['price'],
                "quantity": item['quantity'],
                "item_total": item_total
            })
            total += item_total
            
            # Update stock
            products_collection.update_one(
                {"id": item['product_id']},
                {"$inc": {"stock": -item['quantity']}}
            )
    
    # Create order
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": current_user['user_id'],
        "items": order_items,
        "total": total,
        "status": "pending",
        "shipping_name": order.shipping_name,
        "shipping_address": order.shipping_address,
        "shipping_city": order.shipping_city,
        "shipping_zip": order.shipping_zip,
        "shipping_phone": order.shipping_phone,
        "created_at": datetime.utcnow().isoformat()
    }
    orders_collection.insert_one(order_doc)
    
    # Clear cart
    carts_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"items": []}}
    )
    
    return {"order_id": order_id, "total": total, "message": "Order placed successfully"}

@app.get("/api/orders")
def get_orders(current_user: dict = Depends(get_current_user)):
    orders = list(orders_collection.find({"user_id": current_user['user_id']}, {"_id": 0}).sort("created_at", -1))
    return orders

@app.get("/api/orders/{order_id}")
def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = orders_collection.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

# Review Endpoints
@app.post("/api/reviews")
def create_review(review: Review, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = products_collection.find_one({"id": review.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed
    existing_review = reviews_collection.find_one({
        "product_id": review.product_id,
        "user_id": current_user['user_id']
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # Get user info
    user = users_collection.find_one({"id": current_user['user_id']})
    
    # Create review
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "product_id": review.product_id,
        "user_id": current_user['user_id'],
        "user_name": user['name'],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow().isoformat()
    }
    reviews_collection.insert_one(review_doc)
    
    return {"id": review_id, "message": "Review added successfully"}

@app.get("/api/reviews/{product_id}")
def get_reviews(product_id: str):
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1))
    return reviews

# Wishlist Endpoints
@app.get("/api/wishlist")
def get_wishlist(current_user: dict = Depends(get_current_user)):
    wishlist = wishlist_collection.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not wishlist:
        return {"user_id": current_user['user_id'], "items": []}
    
    # Populate product details
    items_with_details = []
    for product_id in wishlist.get('items', []):
        product = products_collection.find_one({"id": product_id}, {"_id": 0})
        if product:
            items_with_details.append(product)
    
    return {"user_id": current_user['user_id'], "items": items_with_details}

@app.post("/api/wishlist/{product_id}")
def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = products_collection.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create wishlist
    wishlist = wishlist_collection.find_one({"user_id": current_user['user_id']})
    if not wishlist:
        wishlist = {"user_id": current_user['user_id'], "items": []}
    
    # Check if product already in wishlist
    if product_id not in wishlist['items']:
        wishlist['items'].append(product_id)
        wishlist_collection.update_one(
            {"user_id": current_user['user_id']},
            {"$set": wishlist},
            upsert=True
        )
    
    return {"message": "Added to wishlist"}

@app.delete("/api/wishlist/{product_id}")
def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    wishlist = wishlist_collection.find_one({"user_id": current_user['user_id']})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    # Remove item
    if product_id in wishlist['items']:
        wishlist['items'].remove(product_id)
        wishlist_collection.update_one(
            {"user_id": current_user['user_id']},
            {"$set": {"items": wishlist['items']}}
        )
    
    return {"message": "Removed from wishlist"}

# Similar & Cross-sell Products

@app.get("/api/products/{product_id}/similar")
def get_similar_products(product_id: str):
    # Get product
    product = products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Find similar products in same category
    similar = list(products_collection.find({
        "category": product['category'],
        "id": {"$ne": product_id}
    }, {"_id": 0}).limit(6))
    
    return similar

@app.get("/api/products/{product_id}/cross-sell")
def get_cross_sell_products(product_id: str):
    # Get complementary products (different category, similar price range)
    product = products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    price_min = product['price'] * 0.5
    price_max = product['price'] * 1.5
    
    cross_sell = list(products_collection.find({
        "category": {"$ne": product['category']},
        "price": {"$gte": price_min, "$lte": price_max},
        "id": {"$ne": product_id}
    }, {"_id": 0}).limit(6))
    
    return cross_sell

@app.get("/api/search/suggestions")
def search_suggestions(q: str):
    if len(q) < 2:
        return []
    
    # Search in product titles and categories
    suggestions = list(products_collection.find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    }, {"_id": 0, "id": 1, "title": 1, "category": 1, "price": 1, "image_url": 1}).limit(5))
    
    return suggestions

# Loyalty Points Endpoints
@app.get("/api/loyalty/points")
def get_loyalty_points(current_user: dict = Depends(get_current_user)):
    points = loyalty_points_collection.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    if not points:
        return {"user_id": current_user['user_id'], "points": 0, "tier": "bronze"}
    return points

@app.post("/api/loyalty/add-points")
def add_loyalty_points(points_to_add: int, current_user: dict = Depends(get_current_user)):
    loyalty = loyalty_points_collection.find_one({"user_id": current_user['user_id']})
    
    if not loyalty:
        loyalty = {"user_id": current_user['user_id'], "points": 0, "tier": "bronze"}
    
    loyalty['points'] += points_to_add
    
    # Update tier based on points
    if loyalty['points'] >= 1000:
        loyalty['tier'] = "platinum"
    elif loyalty['points'] >= 500:
        loyalty['tier'] = "gold"
    elif loyalty['points'] >= 200:
        loyalty['tier'] = "silver"
    else:
        loyalty['tier'] = "bronze"
    
    loyalty_points_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": loyalty},
        upsert=True
    )
    
    return loyalty

# Browsing History
@app.post("/api/browsing-history/{product_id}")
def add_browsing_history(product_id: str, current_user: dict = Depends(get_current_user)):
    history = browsing_history_collection.find_one({"user_id": current_user['user_id']})
    
    if not history:
        history = {"user_id": current_user['user_id'], "products": []}
    
    # Add to beginning and keep last 50
    if product_id in history['products']:
        history['products'].remove(product_id)
    history['products'].insert(0, product_id)
    history['products'] = history['products'][:50]
    
    browsing_history_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": history},
        upsert=True
    )
    
    return {"message": "History updated"}

# ==========================================
# SOCIAL FEATURES - Follow Sellers
# ==========================================

@app.post("/api/sellers/{seller_id}/follow")
def follow_seller(seller_id: str, current_user: dict = Depends(get_current_user)):
    """Follow a seller"""
    # Check if seller exists
    seller = users_collection.find_one({"id": seller_id, "role": "seller"}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Check if already following
    existing = followers_collection.find_one({
        "user_id": current_user['user_id'],
        "seller_id": seller_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this seller")
    
    follow_data = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "seller_id": seller_id,
        "created_at": datetime.utcnow().isoformat()
    }
    followers_collection.insert_one(follow_data)
    
    return {"message": "Successfully followed seller", "following": True}

@app.delete("/api/sellers/{seller_id}/follow")
def unfollow_seller(seller_id: str, current_user: dict = Depends(get_current_user)):
    """Unfollow a seller"""
    result = followers_collection.delete_one({
        "user_id": current_user['user_id'],
        "seller_id": seller_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not following this seller")
    
    return {"message": "Successfully unfollowed seller", "following": False}

@app.get("/api/sellers/{seller_id}/followers")
def get_seller_followers(seller_id: str):
    """Get follower count for a seller"""
    count = followers_collection.count_documents({"seller_id": seller_id})
    return {"seller_id": seller_id, "followers_count": count}

@app.get("/api/user/following")
def get_user_following(current_user: dict = Depends(get_current_user)):
    """Get list of sellers the user is following"""
    following = list(followers_collection.find(
        {"user_id": current_user['user_id']},
        {"_id": 0, "seller_id": 1}
    ))
    
    seller_ids = [f['seller_id'] for f in following]
    sellers = list(users_collection.find(
        {"id": {"$in": seller_ids}, "role": "seller"},
        {"_id": 0, "id": 1, "name": 1, "email": 1}
    ))
    
    return {"following": sellers, "count": len(sellers)}

@app.get("/api/sellers/{seller_id}/is-following")
def check_following(seller_id: str, current_user: dict = Depends(get_current_user)):
    """Check if user is following a seller"""
    following = followers_collection.find_one({
        "user_id": current_user['user_id'],
        "seller_id": seller_id
    })
    return {"following": following is not None}

# ==========================================
# SOCIAL FEATURES - Shared Shopping Lists
# ==========================================

class SharedListCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    is_public: bool = False

class SharedListAddProduct(BaseModel):
    product_id: str
    note: Optional[str] = ""

@app.post("/api/shared-lists")
def create_shared_list(list_data: SharedListCreate, current_user: dict = Depends(get_current_user)):
    """Create a new shared shopping list"""
    new_list = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "name": list_data.name,
        "description": list_data.description,
        "is_public": list_data.is_public,
        "products": [],
        "shared_with": [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    shared_lists_collection.insert_one(new_list)
    del new_list['_id']
    return new_list

@app.get("/api/shared-lists")
def get_user_shared_lists(current_user: dict = Depends(get_current_user)):
    """Get all shared lists for the user"""
    # Get lists owned by user or shared with user
    lists = list(shared_lists_collection.find({
        "$or": [
            {"user_id": current_user['user_id']},
            {"shared_with": current_user['user_id']}
        ]
    }, {"_id": 0}))
    return lists

@app.get("/api/shared-lists/{list_id}")
def get_shared_list(list_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific shared list with product details"""
    shopping_list = shared_lists_collection.find_one({"id": list_id}, {"_id": 0})
    if not shopping_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    # Check access
    if not shopping_list['is_public'] and shopping_list['user_id'] != current_user['user_id'] and current_user['user_id'] not in shopping_list.get('shared_with', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get product details
    product_ids = [p['product_id'] for p in shopping_list['products']]
    products = list(products_collection.find({"id": {"$in": product_ids}}, {"_id": 0}))
    products_dict = {p['id']: p for p in products}
    
    # Enrich products with full details
    for item in shopping_list['products']:
        if item['product_id'] in products_dict:
            item['product'] = products_dict[item['product_id']]
    
    return shopping_list

@app.post("/api/shared-lists/{list_id}/products")
def add_product_to_list(list_id: str, product_data: SharedListAddProduct, current_user: dict = Depends(get_current_user)):
    """Add a product to a shared list"""
    shopping_list = shared_lists_collection.find_one({"id": list_id})
    if not shopping_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    if shopping_list['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only owner can add products")
    
    # Check if product already in list
    for p in shopping_list['products']:
        if p['product_id'] == product_data.product_id:
            raise HTTPException(status_code=400, detail="Product already in list")
    
    new_product = {
        "product_id": product_data.product_id,
        "note": product_data.note,
        "added_at": datetime.utcnow().isoformat()
    }
    
    shared_lists_collection.update_one(
        {"id": list_id},
        {
            "$push": {"products": new_product},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    return {"message": "Product added to list"}

@app.delete("/api/shared-lists/{list_id}/products/{product_id}")
def remove_product_from_list(list_id: str, product_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a product from a shared list"""
    shopping_list = shared_lists_collection.find_one({"id": list_id})
    if not shopping_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    if shopping_list['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Only owner can remove products")
    
    shared_lists_collection.update_one(
        {"id": list_id},
        {
            "$pull": {"products": {"product_id": product_id}},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    return {"message": "Product removed from list"}

# ==========================================
# ADVANCED PRODUCT FEATURES - Compare Products
# ==========================================

@app.post("/api/compare/{product_id}")
def add_to_compare(product_id: str, current_user: dict = Depends(get_current_user)):
    """Add product to comparison list"""
    # Get or create comparison list for user
    comparison = product_comparisons_collection.find_one({"user_id": current_user['user_id']})
    
    if not comparison:
        comparison = {
            "user_id": current_user['user_id'],
            "products": []
        }
    
    # Max 4 products for comparison
    if len(comparison['products']) >= 4:
        raise HTTPException(status_code=400, detail="Maximum 4 products can be compared")
    
    if product_id in comparison['products']:
        raise HTTPException(status_code=400, detail="Product already in comparison")
    
    comparison['products'].append(product_id)
    
    product_comparisons_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": comparison},
        upsert=True
    )
    
    return {"message": "Added to comparison", "products": comparison['products']}

@app.delete("/api/compare/{product_id}")
def remove_from_compare(product_id: str, current_user: dict = Depends(get_current_user)):
    """Remove product from comparison list"""
    product_comparisons_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$pull": {"products": product_id}}
    )
    
    return {"message": "Removed from comparison"}

@app.get("/api/compare")
def get_comparison(current_user: dict = Depends(get_current_user)):
    """Get comparison list with product details"""
    comparison = product_comparisons_collection.find_one(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    )
    
    if not comparison or not comparison.get('products'):
        return {"products": []}
    
    # Get full product details
    products = list(products_collection.find(
        {"id": {"$in": comparison['products']}},
        {"_id": 0}
    ))
    
    return {"products": products}

@app.delete("/api/compare")
def clear_comparison(current_user: dict = Depends(get_current_user)):
    """Clear comparison list"""
    product_comparisons_collection.delete_one({"user_id": current_user['user_id']})
    return {"message": "Comparison cleared"}

# ==========================================
# ADVANCED PRODUCT FEATURES - Recently Viewed
# ==========================================

@app.get("/api/recently-viewed")
def get_recently_viewed(current_user: dict = Depends(get_current_user)):
    """Get recently viewed products"""
    history = recently_viewed_collection.find_one(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    )
    
    if not history or not history.get('products'):
        return {"products": []}
    
    # Get full product details
    products = list(products_collection.find(
        {"id": {"$in": history['products'][:20]}},
        {"_id": 0}
    ))
    
    # Sort by view order
    products_dict = {p['id']: p for p in products}
    ordered_products = [products_dict[pid] for pid in history['products'][:20] if pid in products_dict]
    
    return {"products": ordered_products}

@app.post("/api/recently-viewed/{product_id}")
def add_to_recently_viewed(product_id: str, current_user: dict = Depends(get_current_user)):
    """Add product to recently viewed"""
    history = recently_viewed_collection.find_one({"user_id": current_user['user_id']})
    
    if not history:
        history = {"user_id": current_user['user_id'], "products": []}
    
    # Remove if already exists (to move to front)
    if product_id in history['products']:
        history['products'].remove(product_id)
    
    # Add to front
    history['products'].insert(0, product_id)
    
    # Keep only last 50
    history['products'] = history['products'][:50]
    
    recently_viewed_collection.update_one(
        {"user_id": current_user['user_id']},
        {"$set": history},
        upsert=True
    )
    
    return {"message": "Added to recently viewed"}

# ==========================================
# ENHANCED REVIEWS
# ==========================================

@app.post("/api/reviews/{review_id}/helpful")
def mark_review_helpful(review_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a review as helpful"""
    # Check if already voted
    existing_vote = review_votes_collection.find_one({
        "user_id": current_user['user_id'],
        "review_id": review_id
    })
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="Already voted on this review")
    
    # Add vote
    vote = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "review_id": review_id,
        "created_at": datetime.utcnow().isoformat()
    }
    review_votes_collection.insert_one(vote)
    
    # Increment helpful count on review
    reviews_collection.update_one(
        {"id": review_id},
        {"$inc": {"helpful_count": 1}}
    )
    
    return {"message": "Marked as helpful"}

@app.get("/api/products/{product_id}/reviews/summary")
def get_reviews_summary(product_id: str):
    """Get review summary with rating distribution"""
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 0}))
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total = len(reviews)
    avg = sum(r.get('rating', 0) for r in reviews) / total
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        rating = r.get('rating', 0)
        if 1 <= rating <= 5:
            distribution[rating] += 1
    
    return {
        "total_reviews": total,
        "average_rating": round(avg, 1),
        "rating_distribution": distribution,
        "reviews": reviews[:10]  # Latest 10 reviews
    }

# ==========================================
# SELLER PROFILE
# ==========================================

@app.get("/api/sellers/{seller_id}/profile")
def get_seller_profile(seller_id: str):
    """Get public seller profile"""
    seller = users_collection.find_one(
        {"id": seller_id, "role": "seller"},
        {"_id": 0, "password": 0}
    )
    
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get seller stats
    products_count = products_collection.count_documents({"seller_id": seller_id})
    followers_count = followers_collection.count_documents({"seller_id": seller_id})
    
    # Get total orders for this seller
    total_sales = orders_collection.count_documents({"seller_id": seller_id})
    
    # Get average rating
    seller_products = list(products_collection.find({"seller_id": seller_id}, {"id": 1}))
    product_ids = [p['id'] for p in seller_products]
    reviews = list(reviews_collection.find({"product_id": {"$in": product_ids}}, {"rating": 1}))
    avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0
    
    return {
        **seller,
        "products_count": products_count,
        "followers_count": followers_count,
        "total_sales": total_sales,
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews)
    }

@app.get("/api/sellers/{seller_id}/products")
def get_seller_products(seller_id: str, limit: int = 20, skip: int = 0):
    """Get products from a specific seller"""
    products = list(products_collection.find(
        {"seller_id": seller_id},
        {"_id": 0}
    ).skip(skip).limit(limit))
    
    total = products_collection.count_documents({"seller_id": seller_id})
    
    return {"products": products, "total": total}

# ==========================================
# AI CHATBOT - Customer Service Assistant
# ==========================================

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Chat sessions storage
chat_sessions = {}

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"

# Chat history collection
chat_history_collection = db['chat_history']

def get_system_prompt(language: str = "en") -> str:
    """Get system prompt based on language"""
    prompts = {
        "en": """You are Ocean AI Assistant, a helpful customer service chatbot for Ocean E-commerce marketplace.

Your capabilities:
- Help customers find products
- Answer questions about orders, shipping, returns
- Provide product recommendations
- Assist with account issues
- Answer general shopping questions

Guidelines:
- Be friendly, professional, and helpful
- Keep responses concise (max 2-3 sentences unless more detail is needed)
- If you don't know something, say so honestly
- For order tracking, ask for order ID
- Suggest relevant products when appropriate
- Use emojis sparingly to be friendly 😊

Store info:
- Free shipping on orders over $99
- 30-day return policy
- 1 year warranty on electronics
- Multiple payment options: Credit Card, PayPal, Cash on Delivery""",

        "ar": """أنت مساعد Ocean الذكي، روبوت خدمة عملاء لسوق Ocean للتجارة الإلكترونية.

قدراتك:
- مساعدة العملاء في إيجاد المنتجات
- الإجابة على أسئلة الطلبات والشحن والإرجاع
- تقديم توصيات المنتجات
- المساعدة في مشاكل الحساب
- الإجابة على أسئلة التسوق العامة

إرشادات:
- كن ودوداً ومهنياً ومفيداً
- اجعل الردود مختصرة (جملتين أو ثلاث كحد أقصى)
- إذا لم تعرف شيئاً، قل ذلك بصدق
- لتتبع الطلب، اطلب رقم الطلب
- اقترح منتجات مناسبة عند الحاجة
- استخدم الرموز التعبيرية باعتدال 😊

معلومات المتجر:
- شحن مجاني للطلبات فوق 99$
- سياسة إرجاع 30 يوم
- ضمان سنة على الإلكترونيات
- خيارات دفع متعددة""",

        "tr": """Sen Ocean AI Asistanı'sın, Ocean E-ticaret pazaryeri için yardımcı müşteri hizmetleri chatbot'u.

Yeteneklerin:
- Müşterilerin ürün bulmasına yardım et
- Siparişler, kargo, iadeler hakkında soruları yanıtla
- Ürün önerileri sun
- Hesap sorunlarında yardım et

Kurallar:
- Samimi, profesyonel ve yardımsever ol
- Yanıtları kısa tut
- Bilmediğin bir şey varsa dürüstçe söyle""",

        "de": """Du bist Ocean AI Assistent, ein hilfreicher Kundenservice-Chatbot für den Ocean E-Commerce-Marktplatz.

Fähigkeiten:
- Kunden bei der Produktsuche helfen
- Fragen zu Bestellungen, Versand, Rückgaben beantworten
- Produktempfehlungen geben

Richtlinien:
- Sei freundlich, professionell und hilfsbereit
- Halte Antworten kurz
- Wenn du etwas nicht weißt, sag es ehrlich""",

        "zh": """你是Ocean AI助手，Ocean电商平台的客服机器人。

能力：
- 帮助客户找到产品
- 回答订单、物流、退货问题
- 提供产品推荐

准则：
- 友好、专业、乐于助人
- 保持回答简洁
- 如果不知道，诚实说明""",

        "fr": """Tu es Ocean AI Assistant, un chatbot de service client pour la marketplace Ocean E-commerce.

Capacités:
- Aider les clients à trouver des produits
- Répondre aux questions sur les commandes, livraisons, retours
- Fournir des recommandations de produits

Directives:
- Sois amical, professionnel et utile
- Garde les réponses concises
- Si tu ne sais pas quelque chose, dis-le honnêtement"""
    }
    return prompts.get(language, prompts["en"])

@app.post("/api/chat")
async def chat_with_ai(chat_data: ChatMessage, current_user: dict = Depends(get_current_user_optional)):
    """AI Chatbot endpoint"""
    try:
        user_id = current_user['user_id'] if current_user else "anonymous"
        session_id = chat_data.session_id or f"{user_id}_{datetime.utcnow().strftime('%Y%m%d')}"
        
        # Get or create chat instance
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=get_system_prompt(chat_data.language)
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_data.message)
        response = await chat.send_message(user_message)
        
        # Save to database
        chat_record = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": user_id,
            "user_message": chat_data.message,
            "ai_response": response,
            "language": chat_data.language,
            "created_at": datetime.utcnow().isoformat()
        }
        chat_history_collection.insert_one(chat_record)
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        print(f"Chat error: {e}")
        # Fallback response
        fallback_responses = {
            "en": "I'm having trouble connecting right now. Please try again in a moment. 🙏",
            "ar": "أواجه مشكلة في الاتصال حالياً. يرجى المحاولة مرة أخرى. 🙏",
            "tr": "Şu anda bağlantı sorunu yaşıyorum. Lütfen tekrar deneyin. 🙏",
            "de": "Ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es erneut. 🙏",
            "zh": "我现在连接有问题。请稍后重试。🙏",
            "fr": "J'ai des problèmes de connexion. Veuillez réessayer. 🙏"
        }
        return {
            "response": fallback_responses.get(chat_data.language, fallback_responses["en"]),
            "session_id": chat_data.session_id or "error",
            "error": True
        }

@app.get("/api/chat/history")
async def get_chat_history(session_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get chat history for a session"""
    query = {"user_id": current_user['user_id']}
    if session_id:
        query["session_id"] = session_id
    
    history = list(chat_history_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(50))
    
    return {"history": history}

@app.delete("/api/chat/clear")
async def clear_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Clear chat session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    chat_history_collection.delete_many({
        "session_id": session_id,
        "user_id": current_user['user_id']
    })
    
    return {"message": "Chat session cleared"}

# ==========================================
# AI PRODUCT RECOMMENDATIONS
# ==========================================

@app.get("/api/recommendations/ai")
async def get_ai_recommendations(current_user: dict = Depends(get_current_user)):
    """Get AI-powered product recommendations based on user behavior"""
    user_id = current_user['user_id']
    
    # Get user's recently viewed products
    recent = recently_viewed_collection.find_one({"user_id": user_id})
    recent_ids = recent.get('products', [])[:5] if recent else []
    
    # Get user's purchase history
    orders = list(orders_collection.find({"user_id": user_id}, {"items": 1}).limit(5))
    purchased_categories = set()
    for order in orders:
        for item in order.get('items', []):
            product = products_collection.find_one({"id": item.get('product_id')})
            if product:
                purchased_categories.add(product.get('category'))
    
    # Get user's wishlist
    wishlist = wishlist_collection.find_one({"user_id": user_id})
    wishlist_ids = [item['id'] for item in wishlist.get('items', [])] if wishlist else []
    
    # Combine all viewed/purchased/wishlisted IDs to exclude
    exclude_ids = set(recent_ids + wishlist_ids)
    
    # Get recommendations based on categories
    recommendations = []
    for category in purchased_categories:
        prods = list(products_collection.find(
            {"category": category, "id": {"$nin": list(exclude_ids)}},
            {"_id": 0}
        ).limit(3))
        recommendations.extend(prods)
    
    # If not enough, get trending products
    if len(recommendations) < 8:
        trending = list(products_collection.find(
            {"id": {"$nin": list(exclude_ids)}},
            {"_id": 0}
        ).sort("stock", -1).limit(8 - len(recommendations)))
        recommendations.extend(trending)
    
    return {
        "recommendations": recommendations[:8],
        "based_on": {
            "recently_viewed": len(recent_ids),
            "purchase_history": len(purchased_categories),
            "wishlist": len(wishlist_ids)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)