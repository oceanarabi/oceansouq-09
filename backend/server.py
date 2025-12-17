from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from typing import Optional, List
import os
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid

app = FastAPI()

# Import and include admin routes
from routes.admin import router as admin_router, set_db as set_admin_db

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)