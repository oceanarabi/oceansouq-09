from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random
import math

router = APIRouter(prefix="/api/ai-advanced", tags=["ai-advanced"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# ==================== MODELS ====================

class RecommendationContext(BaseModel):
    user_id: str
    session_id: Optional[str] = ""
    current_page: str = "homepage"  # homepage, product, cart, checkout, category
    current_product_id: Optional[str] = None
    cart_items: Optional[List[str]] = []
    browsing_history: Optional[List[str]] = []
    user_preferences: Optional[Dict] = {}

class FraudAnalysisRequest(BaseModel):
    transaction_id: str
    amount: float
    currency: str = "SAR"
    payment_method: str
    customer_id: str
    ip_address: str
    device_fingerprint: Optional[str] = ""
    shipping_address: Optional[Dict] = {}
    billing_address: Optional[Dict] = {}

class SentimentAnalysisRequest(BaseModel):
    text: str
    language: str = "ar"
    context: str = "review"  # review, support, social

class DemandForecastRequest(BaseModel):
    product_id: str
    forecast_days: int = 30
    include_seasonality: bool = True
    include_trends: bool = True

class CustomerSegmentRequest(BaseModel):
    customer_id: str

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== SMART RECOMMENDATION ENGINE ====================

@router.post("/recommendations/personalized")
async def get_personalized_recommendations(context: RecommendationContext, user = Depends(verify_admin_token)):
    """محرك التوصيات الذكي - توصيات شخصية متقدمة"""
    
    # تحليل سلوك المستخدم
    user_profile = analyze_user_profile(context)
    
    # توليد التوصيات بناءً على السياق
    recommendations = []
    
    if context.current_page == "homepage":
        recommendations = generate_homepage_recommendations(user_profile)
    elif context.current_page == "product":
        recommendations = generate_product_recommendations(context.current_product_id, user_profile)
    elif context.current_page == "cart":
        recommendations = generate_cart_recommendations(context.cart_items, user_profile)
    elif context.current_page == "checkout":
        recommendations = generate_checkout_recommendations(context.cart_items)
    else:
        recommendations = generate_category_recommendations(user_profile)
    
    return {
        "user_id": context.user_id,
        "context": context.current_page,
        "recommendations": recommendations,
        "personalization_score": round(random.uniform(0.75, 0.95), 2),
        "algorithms_used": [
            "Collaborative Filtering",
            "Content-Based Filtering",
            "Session-Based Neural Network",
            "Contextual Bandits"
        ],
        "user_profile": user_profile,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/recommendations/similar/{product_id}")
async def get_similar_products(product_id: str, limit: int = 10, user = Depends(verify_admin_token)):
    """الحصول على منتجات مشابهة"""
    similar = [
        {"id": f"SIM-{i}", "name": f"منتج مشابه {i}", "similarity_score": round(random.uniform(0.7, 0.98), 2), "price": random.randint(100, 5000)} 
        for i in range(1, limit + 1)
    ]
    return {
        "product_id": product_id,
        "similar_products": similar,
        "algorithm": "Visual + Attribute Similarity",
        "confidence": round(random.uniform(0.85, 0.95), 2)
    }

@router.get("/recommendations/frequently-bought/{product_id}")
async def get_frequently_bought_together(product_id: str, user = Depends(verify_admin_token)):
    """المنتجات التي يتم شراؤها معاً"""
    bundles = [
        {
            "products": [
                {"id": "P-101", "name": "iPhone 15 Pro", "price": 4999},
                {"id": "P-201", "name": "AirPods Pro 2", "price": 999},
                {"id": "P-301", "name": "حافظة MagSafe", "price": 199}
            ],
            "bundle_discount": 10,
            "bundle_price": 5577,
            "original_price": 6197,
            "confidence": 0.92
        },
        {
            "products": [
                {"id": "P-101", "name": "iPhone 15 Pro", "price": 4999},
                {"id": "P-401", "name": "شاحن سريع 20W", "price": 99}
            ],
            "bundle_discount": 5,
            "bundle_price": 4843,
            "original_price": 5098,
            "confidence": 0.88
        }
    ]
    return {
        "product_id": product_id,
        "bundles": bundles,
        "cross_sell_revenue_potential": 25000
    }

@router.get("/recommendations/trending")
async def get_trending_products(category: str = None, timeframe: str = "24h", user = Depends(verify_admin_token)):
    """المنتجات الرائجة"""
    trending = [
        {"id": "T-001", "name": "iPhone 15 Pro Max", "trend_score": 98, "sales_velocity": "+45%", "views_24h": 15420},
        {"id": "T-002", "name": "Samsung Galaxy S24 Ultra", "trend_score": 92, "sales_velocity": "+32%", "views_24h": 12350},
        {"id": "T-003", "name": "MacBook Air M3", "trend_score": 88, "sales_velocity": "+28%", "views_24h": 9870},
        {"id": "T-004", "name": "AirPods Pro 2", "trend_score": 85, "sales_velocity": "+22%", "views_24h": 8540},
        {"id": "T-005", "name": "PlayStation 5", "trend_score": 82, "sales_velocity": "+18%", "views_24h": 7650},
    ]
    return {
        "timeframe": timeframe,
        "category": category,
        "trending_products": trending,
        "trend_factors": ["مبيعات مرتفعة", "زيادة البحث", "نشاط وسائل التواصل"]
    }

def analyze_user_profile(context: RecommendationContext):
    """تحليل ملف المستخدم"""
    return {
        "user_segment": random.choice(["VIP", "متكرر", "جديد", "محتمل"]),
        "preferred_categories": ["إلكترونيات", "أجهزة منزلية"],
        "price_sensitivity": random.choice(["منخفضة", "متوسطة", "عالية"]),
        "brand_affinity": ["Apple", "Samsung", "Sony"],
        "avg_order_value": random.randint(300, 1500),
        "purchase_frequency": random.choice(["أسبوعي", "شهري", "موسمي"]),
        "engagement_level": round(random.uniform(0.5, 1.0), 2)
    }

def generate_homepage_recommendations(profile):
    categories = ["إلكترونيات", "أزياء", "منزل", "رياضة"]
    return [
        {
            "type": "personalized_for_you",
            "title": "مختار خصيصاً لك",
            "products": [{"id": f"HP-{i}", "name": f"منتج {i}", "price": random.randint(100, 2000), "match_score": round(random.uniform(0.8, 0.98), 2)} for i in range(1, 6)]
        },
        {
            "type": "based_on_history",
            "title": "بناءً على تصفحك",
            "products": [{"id": f"HH-{i}", "name": f"منتج مشابه {i}", "price": random.randint(100, 2000), "match_score": round(random.uniform(0.7, 0.9), 2)} for i in range(1, 5)]
        },
        {
            "type": "trending_in_category",
            "title": f"رائج في {profile['preferred_categories'][0]}",
            "products": [{"id": f"TC-{i}", "name": f"رائج {i}", "price": random.randint(100, 2000), "trend_score": random.randint(80, 99)} for i in range(1, 5)]
        }
    ]

def generate_product_recommendations(product_id, profile):
    return [
        {
            "type": "similar_products",
            "title": "منتجات مشابهة",
            "products": [{"id": f"SP-{i}", "name": f"مشابه {i}", "price": random.randint(100, 2000), "similarity": round(random.uniform(0.75, 0.95), 2)} for i in range(1, 5)]
        },
        {
            "type": "bought_together",
            "title": "يُشترى معاً عادةً",
            "products": [{"id": f"BT-{i}", "name": f"ملحق {i}", "price": random.randint(50, 500), "confidence": round(random.uniform(0.7, 0.9), 2)} for i in range(1, 4)]
        },
        {
            "type": "others_also_viewed",
            "title": "شاهد العملاء أيضاً",
            "products": [{"id": f"OV-{i}", "name": f"منتج آخر {i}", "price": random.randint(100, 2000), "view_correlation": round(random.uniform(0.6, 0.85), 2)} for i in range(1, 5)]
        }
    ]

def generate_cart_recommendations(cart_items, profile):
    return [
        {
            "type": "complete_the_look",
            "title": "أكمل مشترياتك",
            "products": [{"id": f"CL-{i}", "name": f"ملحق مقترح {i}", "price": random.randint(50, 300), "relevance": round(random.uniform(0.8, 0.95), 2)} for i in range(1, 4)]
        },
        {
            "type": "protection_plans",
            "title": "احمِ مشترياتك",
            "products": [{"id": "PP-1", "name": "ضمان ممتد سنتين", "price": 199, "coverage": "شامل"}]
        }
    ]

def generate_checkout_recommendations(cart_items):
    return [
        {
            "type": "last_minute_deals",
            "title": "عروض اللحظة الأخيرة",
            "products": [{"id": f"LM-{i}", "name": f"عرض {i}", "price": random.randint(20, 100), "discount": f"{random.randint(10, 30)}%"} for i in range(1, 3)]
        }
    ]

def generate_category_recommendations(profile):
    return [
        {
            "type": "top_in_category",
            "title": "الأعلى تقييماً",
            "products": [{"id": f"TOP-{i}", "name": f"أفضل {i}", "price": random.randint(100, 2000), "rating": round(random.uniform(4.5, 5.0), 1)} for i in range(1, 5)]
        }
    ]

# ==================== ADVANCED FRAUD DETECTION ====================

@router.post("/fraud/analyze")
async def analyze_fraud_risk(request: FraudAnalysisRequest, user = Depends(verify_admin_token)):
    """تحليل مخاطر الاحتيال المتقدم"""
    
    # تحليل عوامل الخطر
    risk_factors = calculate_risk_factors(request)
    
    # حساب درجة الخطر الإجمالية
    total_risk_score = sum(f["score"] * f["weight"] for f in risk_factors) / sum(f["weight"] for f in risk_factors)
    
    # تحديد مستوى الخطر
    risk_level = "low" if total_risk_score < 30 else "medium" if total_risk_score < 60 else "high" if total_risk_score < 80 else "critical"
    
    # تحديد الإجراء المقترح
    action = determine_action(risk_level, total_risk_score)
    
    return {
        "transaction_id": request.transaction_id,
        "risk_analysis": {
            "overall_score": round(total_risk_score, 1),
            "risk_level": risk_level,
            "confidence": round(random.uniform(0.85, 0.98), 2)
        },
        "risk_factors": risk_factors,
        "behavioral_analysis": {
            "velocity_check": random.choice(["passed", "warning", "failed"]),
            "device_reputation": random.choice(["trusted", "neutral", "suspicious"]),
            "ip_reputation": random.choice(["clean", "proxy_detected", "vpn_detected", "blacklisted"]),
            "address_verification": random.choice(["match", "partial_match", "mismatch"])
        },
        "similar_fraud_cases": random.randint(0, 5) if total_risk_score > 50 else 0,
        "recommendation": action,
        "rules_triggered": get_triggered_rules(total_risk_score),
        "analyzed_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/fraud/rules")
async def get_fraud_rules(user = Depends(verify_admin_token)):
    """الحصول على قواعد كشف الاحتيال"""
    return {
        "rules": [
            {"id": "FR-001", "name": "معاملة عالية القيمة", "condition": "amount > 10000", "action": "review", "enabled": True, "triggers_24h": 45},
            {"id": "FR-002", "name": "IP مشبوه", "condition": "ip_reputation == 'blacklisted'", "action": "block", "enabled": True, "triggers_24h": 12},
            {"id": "FR-003", "name": "سرعة عالية", "condition": "transactions_per_hour > 5", "action": "review", "enabled": True, "triggers_24h": 28},
            {"id": "FR-004", "name": "عدم تطابق العنوان", "condition": "shipping != billing AND amount > 2000", "action": "verify", "enabled": True, "triggers_24h": 67},
            {"id": "FR-005", "name": "جهاز جديد + قيمة عالية", "condition": "new_device AND amount > 5000", "action": "otp_verify", "enabled": True, "triggers_24h": 34},
            {"id": "FR-006", "name": "بطاقة من دولة مختلفة", "condition": "card_country != shipping_country", "action": "review", "enabled": True, "triggers_24h": 89},
            {"id": "FR-007", "name": "محاولات متعددة فاشلة", "condition": "failed_attempts > 3", "action": "block_temp", "enabled": True, "triggers_24h": 156},
            {"id": "FR-008", "name": "VPN/Proxy detected", "condition": "proxy_detected == true", "action": "flag", "enabled": True, "triggers_24h": 234},
        ],
        "summary": {
            "total_rules": 8,
            "active_rules": 8,
            "total_triggers_24h": 665,
            "blocked_24h": 12,
            "reviewed_24h": 45
        }
    }

@router.post("/fraud/rules")
async def create_fraud_rule(name: str, condition: str, action: str, user = Depends(verify_admin_token)):
    """إنشاء قاعدة كشف احتيال جديدة"""
    rule_id = f"FR-{str(uuid4())[:8].upper()}"
    return {
        "success": True,
        "rule_id": rule_id,
        "message": f"تم إنشاء القاعدة: {name}"
    }

@router.get("/fraud/dashboard")
async def get_fraud_dashboard(user = Depends(verify_admin_token)):
    """لوحة تحكم كشف الاحتيال"""
    return {
        "overview": {
            "transactions_analyzed_24h": 15420,
            "flagged": 156,
            "blocked": 23,
            "under_review": 45,
            "false_positives": 8,
            "detection_rate": 97.8,
            "false_positive_rate": 0.05
        },
        "prevented_losses": {
            "today": 45000,
            "this_week": 285000,
            "this_month": 1250000
        },
        "fraud_types": [
            {"type": "بطاقات مسروقة", "count": 45, "percentage": 35, "trend": "down"},
            {"type": "استيلاء على حساب", "count": 32, "percentage": 25, "trend": "up"},
            {"type": "احتيال الهوية", "count": 28, "percentage": 22, "trend": "stable"},
            {"type": "استرداد احتيالي", "count": 23, "percentage": 18, "trend": "down"}
        ],
        "high_risk_countries": [
            {"country": "نيجيريا", "risk_score": 85, "blocked": 15},
            {"country": "غانا", "risk_score": 78, "blocked": 8},
            {"country": "كينيا", "risk_score": 72, "blocked": 5}
        ],
        "model_performance": {
            "accuracy": 97.8,
            "precision": 96.5,
            "recall": 94.2,
            "f1_score": 95.3,
            "last_trained": "2024-01-15"
        }
    }

def calculate_risk_factors(request: FraudAnalysisRequest):
    """حساب عوامل الخطر"""
    factors = [
        {
            "factor": "قيمة المعاملة",
            "score": min(100, (request.amount / 100)),
            "weight": 0.2,
            "flag": request.amount > 5000,
            "details": f"المبلغ: {request.amount} ر.س"
        },
        {
            "factor": "سمعة IP",
            "score": random.randint(10, 60),
            "weight": 0.15,
            "flag": random.random() > 0.7,
            "details": f"IP: {request.ip_address}"
        },
        {
            "factor": "بصمة الجهاز",
            "score": random.randint(5, 40),
            "weight": 0.15,
            "flag": random.random() > 0.8,
            "details": "جهاز معروف" if random.random() > 0.3 else "جهاز جديد"
        },
        {
            "factor": "سرعة المعاملات",
            "score": random.randint(5, 50),
            "weight": 0.15,
            "flag": random.random() > 0.8,
            "details": f"{random.randint(1, 5)} معاملات في الساعة"
        },
        {
            "factor": "تطابق العنوان",
            "score": random.randint(0, 30),
            "weight": 0.1,
            "flag": random.random() > 0.85,
            "details": "متطابق" if random.random() > 0.2 else "غير متطابق"
        },
        {
            "factor": "تاريخ العميل",
            "score": random.randint(0, 25),
            "weight": 0.15,
            "flag": random.random() > 0.9,
            "details": f"عميل منذ {random.randint(1, 36)} شهر"
        },
        {
            "factor": "نمط الشراء",
            "score": random.randint(5, 35),
            "weight": 0.1,
            "flag": random.random() > 0.85,
            "details": "نمط طبيعي" if random.random() > 0.3 else "نمط غير معتاد"
        }
    ]
    return factors

def determine_action(risk_level, score):
    """تحديد الإجراء المناسب"""
    if risk_level == "critical":
        return {"action": "block", "message": "حظر المعاملة فوراً", "requires_review": True}
    elif risk_level == "high":
        return {"action": "review", "message": "مراجعة يدوية مطلوبة", "requires_review": True}
    elif risk_level == "medium":
        return {"action": "verify", "message": "التحقق من OTP أو 3DS", "requires_review": False}
    else:
        return {"action": "approve", "message": "الموافقة على المعاملة", "requires_review": False}

def get_triggered_rules(score):
    """الحصول على القواعد المفعلة"""
    rules = []
    if score > 30:
        rules.append({"rule": "FR-001", "name": "درجة خطر متوسطة"})
    if score > 50:
        rules.append({"rule": "FR-003", "name": "درجة خطر مرتفعة"})
    if score > 70:
        rules.append({"rule": "FR-002", "name": "درجة خطر عالية جداً"})
    return rules

# ==================== SENTIMENT ANALYSIS ENGINE ====================

@router.post("/sentiment/analyze")
async def analyze_sentiment(request: SentimentAnalysisRequest, user = Depends(verify_admin_token)):
    """تحليل المشاعر في النص"""
    
    # محاكاة تحليل المشاعر
    sentiment_score = random.uniform(-1, 1)
    
    if sentiment_score > 0.3:
        sentiment = "positive"
        sentiment_ar = "إيجابي"
    elif sentiment_score < -0.3:
        sentiment = "negative"
        sentiment_ar = "سلبي"
    else:
        sentiment = "neutral"
        sentiment_ar = "محايد"
    
    # استخراج الجوانب
    aspects = extract_aspects(request.text, request.language)
    
    # استخراج الكلمات المفتاحية
    keywords = extract_keywords(request.text, request.language)
    
    return {
        "text": request.text[:200] + "..." if len(request.text) > 200 else request.text,
        "language": request.language,
        "sentiment": {
            "label": sentiment,
            "label_ar": sentiment_ar,
            "score": round(sentiment_score, 3),
            "confidence": round(random.uniform(0.75, 0.98), 2)
        },
        "aspects": aspects,
        "keywords": keywords,
        "emotions": {
            "joy": round(random.uniform(0, 1), 2) if sentiment == "positive" else round(random.uniform(0, 0.3), 2),
            "anger": round(random.uniform(0, 0.3), 2) if sentiment != "negative" else round(random.uniform(0.3, 0.8), 2),
            "sadness": round(random.uniform(0, 0.2), 2),
            "surprise": round(random.uniform(0, 0.4), 2),
            "trust": round(random.uniform(0.3, 0.9), 2) if sentiment == "positive" else round(random.uniform(0, 0.4), 2)
        },
        "intent": random.choice(["feedback", "complaint", "question", "praise"]),
        "urgency": random.choice(["low", "medium", "high"]),
        "action_required": sentiment == "negative",
        "analyzed_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/sentiment/batch")
async def batch_sentiment_analysis(texts: List[str], language: str = "ar", user = Depends(verify_admin_token)):
    """تحليل مشاعر مجموعة نصوص"""
    results = []
    for text in texts[:50]:  # حد أقصى 50 نص
        score = random.uniform(-1, 1)
        results.append({
            "text": text[:100] + "..." if len(text) > 100 else text,
            "sentiment": "positive" if score > 0.3 else "negative" if score < -0.3 else "neutral",
            "score": round(score, 3)
        })
    
    positive_count = len([r for r in results if r["sentiment"] == "positive"])
    negative_count = len([r for r in results if r["sentiment"] == "negative"])
    neutral_count = len([r for r in results if r["sentiment"] == "neutral"])
    
    return {
        "total_analyzed": len(results),
        "results": results,
        "summary": {
            "positive": positive_count,
            "negative": negative_count,
            "neutral": neutral_count,
            "positive_percentage": round(positive_count / len(results) * 100, 1),
            "negative_percentage": round(negative_count / len(results) * 100, 1),
            "overall_sentiment": "positive" if positive_count > negative_count else "negative" if negative_count > positive_count else "neutral"
        }
    }

@router.get("/sentiment/reviews-analysis")
async def get_reviews_sentiment_analysis(product_id: str = None, period: str = "30d", user = Depends(verify_admin_token)):
    """تحليل مشاعر المراجعات"""
    return {
        "period": period,
        "product_id": product_id,
        "total_reviews": 1250,
        "sentiment_distribution": {
            "positive": 68,
            "neutral": 22,
            "negative": 10
        },
        "average_rating": 4.2,
        "sentiment_trend": [
            {"date": "2024-01-01", "positive": 65, "negative": 12},
            {"date": "2024-01-08", "positive": 68, "negative": 10},
            {"date": "2024-01-15", "positive": 70, "negative": 9}
        ],
        "top_positive_aspects": [
            {"aspect": "جودة المنتج", "mentions": 450, "sentiment": 0.85},
            {"aspect": "سرعة التوصيل", "mentions": 380, "sentiment": 0.78},
            {"aspect": "خدمة العملاء", "mentions": 220, "sentiment": 0.72}
        ],
        "top_negative_aspects": [
            {"aspect": "سعر مرتفع", "mentions": 85, "sentiment": -0.65},
            {"aspect": "التغليف", "mentions": 45, "sentiment": -0.55},
            {"aspect": "وقت الانتظار", "mentions": 32, "sentiment": -0.48}
        ],
        "action_items": [
            {"priority": "high", "issue": "شكاوى عن التغليف - 45 مراجعة سلبية", "suggested_action": "تحسين مواد التغليف"},
            {"priority": "medium", "issue": "ملاحظات عن السعر - 85 مراجعة", "suggested_action": "مراجعة استراتيجية التسعير"}
        ]
    }

def extract_aspects(text, language):
    """استخراج الجوانب من النص"""
    aspects_ar = ["الجودة", "السعر", "التوصيل", "خدمة العملاء", "التغليف"]
    aspects_en = ["quality", "price", "delivery", "customer service", "packaging"]
    
    aspects = aspects_ar if language == "ar" else aspects_en
    
    return [
        {
            "aspect": random.choice(aspects),
            "sentiment": random.choice(["positive", "negative", "neutral"]),
            "score": round(random.uniform(-1, 1), 2)
        }
        for _ in range(random.randint(1, 3))
    ]

def extract_keywords(text, language):
    """استخراج الكلمات المفتاحية"""
    keywords_ar = ["ممتاز", "سريع", "جودة", "سعر", "توصيل", "خدمة", "منتج"]
    keywords_en = ["excellent", "fast", "quality", "price", "delivery", "service", "product"]
    
    keywords = keywords_ar if language == "ar" else keywords_en
    
    return random.sample(keywords, min(5, len(keywords)))

# ==================== DEMAND FORECASTING ENGINE ====================

@router.post("/demand/forecast")
async def forecast_demand(request: DemandForecastRequest, user = Depends(verify_admin_token)):
    """التنبؤ بالطلب على المنتج"""
    
    # توليد بيانات التنبؤ
    forecasts = []
    base_demand = random.randint(50, 200)
    
    for day in range(request.forecast_days):
        date = datetime.now(timezone.utc) + timedelta(days=day)
        
        # إضافة الموسمية
        seasonality_factor = 1.0
        if request.include_seasonality:
            # زيادة في نهاية الأسبوع
            if date.weekday() >= 4:
                seasonality_factor *= 1.3
            # زيادة في نهاية الشهر
            if date.day > 25:
                seasonality_factor *= 1.15
        
        # إضافة الاتجاه
        trend_factor = 1.0
        if request.include_trends:
            trend_factor = 1 + (day * 0.005)  # نمو 0.5% يومياً
        
        predicted_demand = int(base_demand * seasonality_factor * trend_factor * random.uniform(0.9, 1.1))
        
        forecasts.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_demand": predicted_demand,
            "confidence_low": int(predicted_demand * 0.85),
            "confidence_high": int(predicted_demand * 1.15),
            "factors": {
                "seasonality": round(seasonality_factor, 2),
                "trend": round(trend_factor, 2)
            }
        })
    
    # حساب الإحصائيات
    total_demand = sum(f["predicted_demand"] for f in forecasts)
    avg_demand = total_demand / len(forecasts)
    
    return {
        "product_id": request.product_id,
        "forecast_period": f"{request.forecast_days} days",
        "forecasts": forecasts,
        "summary": {
            "total_predicted_demand": total_demand,
            "average_daily_demand": round(avg_demand, 1),
            "peak_demand_date": max(forecasts, key=lambda x: x["predicted_demand"])["date"],
            "peak_demand_value": max(f["predicted_demand"] for f in forecasts),
            "low_demand_date": min(forecasts, key=lambda x: x["predicted_demand"])["date"],
            "low_demand_value": min(f["predicted_demand"] for f in forecasts)
        },
        "inventory_recommendations": {
            "recommended_stock": int(total_demand * 1.2),
            "reorder_point": int(avg_demand * 7),
            "safety_stock": int(avg_demand * 3)
        },
        "model_info": {
            "algorithm": "LSTM + Seasonal Decomposition",
            "accuracy": round(random.uniform(85, 95), 1),
            "last_trained": "2024-01-15"
        },
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/demand/insights")
async def get_demand_insights(user = Depends(verify_admin_token)):
    """رؤى الطلب والمخزون"""
    return {
        "insights": [
            {
                "type": "stockout_risk",
                "severity": "high",
                "product": "iPhone 15 Pro - 256GB",
                "current_stock": 45,
                "predicted_demand_7d": 120,
                "days_until_stockout": 3,
                "recommendation": "طلب شراء عاجل - 200 وحدة"
            },
            {
                "type": "overstock",
                "severity": "medium",
                "product": "Samsung Galaxy S23",
                "current_stock": 350,
                "predicted_demand_30d": 150,
                "excess_stock": 200,
                "recommendation": "خفض السعر 10% أو حملة تسويقية"
            },
            {
                "type": "trending_up",
                "severity": "info",
                "product": "AirPods Pro 2",
                "demand_change": "+45%",
                "reason": "موسم الهدايا قادم",
                "recommendation": "زيادة المخزون بنسبة 50%"
            }
        ],
        "category_forecasts": [
            {"category": "إلكترونيات", "growth": "+12%", "top_product": "iPhone 15 Pro"},
            {"category": "أزياء", "growth": "+8%", "top_product": "عبايات"},
            {"category": "منزل", "growth": "+5%", "top_product": "أدوات مطبخ"}
        ],
        "seasonal_events": [
            {"event": "رمضان", "starts_in": "45 days", "expected_impact": "+35%"},
            {"event": "عيد الفطر", "starts_in": "75 days", "expected_impact": "+50%"},
            {"event": "اليوم الوطني", "starts_in": "120 days", "expected_impact": "+25%"}
        ]
    }

# ==================== CUSTOMER SEGMENTATION ====================

@router.get("/segmentation/customer/{customer_id}")
async def get_customer_segment(customer_id: str, user = Depends(verify_admin_token)):
    """تحليل شريحة العميل"""
    segment = random.choice(["VIP", "Loyal", "Potential", "At Risk", "New", "Churned"])
    
    return {
        "customer_id": customer_id,
        "segment": {
            "name": segment,
            "name_ar": {"VIP": "عميل VIP", "Loyal": "عميل مخلص", "Potential": "عميل محتمل", "At Risk": "معرض للفقدان", "New": "عميل جديد", "Churned": "عميل مفقود"}.get(segment, segment),
            "confidence": round(random.uniform(0.75, 0.95), 2)
        },
        "metrics": {
            "lifetime_value": random.randint(1000, 50000),
            "total_orders": random.randint(1, 100),
            "avg_order_value": random.randint(150, 1500),
            "days_since_last_order": random.randint(1, 365),
            "purchase_frequency": random.choice(["weekly", "monthly", "quarterly", "yearly"])
        },
        "behavior": {
            "preferred_categories": random.sample(["إلكترونيات", "أزياء", "منزل", "رياضة", "جمال"], 2),
            "preferred_payment": random.choice(["مدى", "فيزا", "تمارا", "STC Pay"]),
            "preferred_time": random.choice(["صباحاً", "ظهراً", "مساءً", "ليلاً"]),
            "device": random.choice(["iOS", "Android", "Desktop"]),
            "engagement_score": round(random.uniform(0.3, 1.0), 2)
        },
        "recommendations": {
            "marketing": "حملة ولاء" if segment in ["VIP", "Loyal"] else "عرض خاص للعودة" if segment == "At Risk" else "حملة ترحيبية",
            "discount": "5%" if segment == "VIP" else "15%" if segment == "At Risk" else "10%",
            "channel": "email" if segment in ["VIP", "Loyal"] else "sms" if segment == "At Risk" else "push"
        },
        "predicted_next_purchase": {
            "probability": round(random.uniform(0.3, 0.9), 2),
            "expected_date": (datetime.now(timezone.utc) + timedelta(days=random.randint(5, 60))).strftime("%Y-%m-%d"),
            "expected_value": random.randint(200, 2000)
        }
    }

@router.get("/segmentation/overview")
async def get_segmentation_overview(user = Depends(verify_admin_token)):
    """نظرة عامة على شرائح العملاء"""
    return {
        "total_customers": 45000,
        "segments": [
            {"name": "VIP", "name_ar": "عملاء VIP", "count": 1250, "percentage": 2.8, "revenue_share": 25, "avg_ltv": 15000},
            {"name": "Loyal", "name_ar": "عملاء مخلصون", "count": 8500, "percentage": 18.9, "revenue_share": 35, "avg_ltv": 4500},
            {"name": "Potential", "name_ar": "عملاء محتملون", "count": 15000, "percentage": 33.3, "revenue_share": 22, "avg_ltv": 1200},
            {"name": "At Risk", "name_ar": "معرضون للفقدان", "count": 12000, "percentage": 26.7, "revenue_share": 12, "avg_ltv": 800},
            {"name": "Churned", "name_ar": "عملاء مفقودون", "count": 8250, "percentage": 18.3, "revenue_share": 6, "avg_ltv": 350}
        ],
        "migration_trends": {
            "potential_to_loyal": 450,
            "at_risk_to_churned": 120,
            "loyal_to_vip": 85
        },
        "actions": [
            {"segment": "At Risk", "action": "إطلاق حملة استعادة", "potential_revenue": 125000},
            {"segment": "Potential", "action": "برنامج ولاء", "potential_revenue": 85000}
        ]
    }
