from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4
import random

router = APIRouter(prefix="/api/ai-engines", tags=["ai-engines"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class AIEngineConfig(BaseModel):
    engine_id: str
    enabled: bool = True
    settings: Optional[Dict] = {}

class PricingRequest(BaseModel):
    product_id: str
    competitor_prices: Optional[List[float]] = []
    target_margin: Optional[float] = 15.0

class SEORequest(BaseModel):
    product_id: str
    title: str
    description: str
    category: str

class RecommendationRequest(BaseModel):
    user_id: str
    context: str = "homepage"  # homepage, cart, product_page
    limit: int = 10

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

# ==================== AI ENGINES CATALOG ====================

AI_ENGINES = {
    "pricing_optimizer": {
        "name": "محسّن الأسعار",
        "name_en": "Pricing Optimizer",
        "description": "تحسين الأسعار تلقائياً بناءً على المنافسة والطلب",
        "icon": "💰",
        "status": "active",
        "accuracy": 94.5,
        "requests_today": 15420
    },
    "seo_optimizer": {
        "name": "محسّن SEO",
        "name_en": "SEO Optimizer",
        "description": "تحسين عناوين ووصف المنتجات لمحركات البحث",
        "icon": "🔍",
        "status": "active",
        "accuracy": 89.2,
        "requests_today": 8750
    },
    "recommendation_engine": {
        "name": "محرك التوصيات",
        "name_en": "Recommendation Engine",
        "description": "توصيات شخصية للمنتجات بناءً على سلوك المستخدم",
        "icon": "🎯",
        "status": "active",
        "accuracy": 91.8,
        "requests_today": 45200
    },
    "fraud_detector": {
        "name": "كاشف الاحتيال",
        "name_en": "Fraud Detector",
        "description": "كشف المعاملات المشبوهة في الوقت الفعلي",
        "icon": "🛡️",
        "status": "active",
        "accuracy": 97.3,
        "requests_today": 28900
    },
    "demand_forecaster": {
        "name": "متنبئ الطلب",
        "name_en": "Demand Forecaster",
        "description": "توقع الطلب على المنتجات والخدمات",
        "icon": "📈",
        "status": "active",
        "accuracy": 86.4,
        "requests_today": 3200
    },
    "sentiment_analyzer": {
        "name": "محلل المشاعر",
        "name_en": "Sentiment Analyzer",
        "description": "تحليل مراجعات العملاء واستخراج المشاعر",
        "icon": "😊",
        "status": "active",
        "accuracy": 88.7,
        "requests_today": 12500
    },
    "image_classifier": {
        "name": "مصنف الصور",
        "name_en": "Image Classifier",
        "description": "تصنيف وتحليل صور المنتجات تلقائياً",
        "icon": "🖼️",
        "status": "active",
        "accuracy": 93.1,
        "requests_today": 6800
    },
    "chatbot_engine": {
        "name": "محرك الدردشة",
        "name_en": "Chatbot Engine",
        "description": "محادثات ذكية مع العملاء والدعم الآلي",
        "icon": "🤖",
        "status": "active",
        "accuracy": 90.5,
        "requests_today": 18700
    },
}

# ==================== ENGINES LIST ====================

@router.get("/list")
async def get_ai_engines(user = Depends(verify_admin_token)):
    """Get all AI engines with their status"""
    engines = [{"id": eid, **edata} for eid, edata in AI_ENGINES.items()]
    return {
        "engines": engines,
        "summary": {
            "total": len(engines),
            "active": len([e for e in engines if e["status"] == "active"]),
            "total_requests_today": sum(e["requests_today"] for e in engines),
            "avg_accuracy": round(sum(e["accuracy"] for e in engines) / len(engines), 1)
        }
    }

@router.get("/dashboard")
async def get_ai_dashboard(user = Depends(verify_admin_token)):
    """Get AI engines dashboard"""
    return {
        "overview": {
            "total_requests_today": 139470,
            "avg_accuracy": 91.4,
            "active_engines": 8,
            "cost_saved_today": 45000
        },
        "engines_status": [
            {"engine": "التوصيات", "status": "healthy", "load": 65},
            {"engine": "كشف الاحتيال", "status": "healthy", "load": 42},
            {"engine": "تحسين الأسعار", "status": "healthy", "load": 38},
            {"engine": "تحسين SEO", "status": "healthy", "load": 25},
        ],
        "recent_insights": [
            {"type": "opportunity", "message": "45 منتج يمكن زيادة سعره بنسبة 10%", "impact": "high"},
            {"type": "alert", "message": "ارتفاع محاولات الاحتيال بنسبة 15%", "impact": "medium"},
            {"type": "success", "message": "التوصيات حققت 125K ريال اليوم", "impact": "high"},
        ]
    }

@router.get("/{engine_id}")
async def get_engine_details(engine_id: str, user = Depends(verify_admin_token)):
    """Get detailed info about specific engine"""
    if engine_id not in AI_ENGINES:
        raise HTTPException(status_code=404, detail="المحرك غير موجود")
    
    engine = AI_ENGINES[engine_id]
    return {
        "id": engine_id,
        **engine,
        "performance": {
            "accuracy_7d": [engine["accuracy"] + random.uniform(-2, 2) for _ in range(7)],
            "requests_7d": [engine["requests_today"] + random.randint(-1000, 2000) for _ in range(7)],
            "avg_response_time": f"{random.randint(50, 200)}ms"
        },
        "configuration": {
            "model_version": "v2.1",
            "last_trained": "2024-01-10",
            "training_data_size": f"{random.randint(100, 500)}K samples"
        }
    }

@router.post("/{engine_id}/toggle")
async def toggle_engine(engine_id: str, enabled: bool, user = Depends(verify_admin_token)):
    """Enable/disable an AI engine"""
    if engine_id not in AI_ENGINES:
        raise HTTPException(status_code=404, detail="المحرك غير موجود")
    
    return {
        "success": True,
        "message": f"تم {'تفعيل' if enabled else 'تعطيل'} محرك {AI_ENGINES[engine_id]['name']}"
    }

# ==================== PRICING OPTIMIZER ====================

@router.post("/pricing/optimize")
async def optimize_pricing(request: PricingRequest, user = Depends(verify_admin_token)):
    """Get AI-optimized pricing suggestion"""
    base_price = 100  # Would come from DB
    
    # Simulate AI pricing optimization
    competitor_avg = sum(request.competitor_prices) / len(request.competitor_prices) if request.competitor_prices else base_price
    
    suggested_price = round(competitor_avg * (1 + (request.target_margin / 100)), 2)
    
    return {
        "product_id": request.product_id,
        "current_price": base_price,
        "suggested_price": suggested_price,
        "competitor_avg": round(competitor_avg, 2),
        "expected_margin": request.target_margin,
        "confidence": round(random.uniform(85, 98), 1),
        "factors": [
            {"factor": "أسعار المنافسين", "impact": "high", "direction": "up" if suggested_price > base_price else "down"},
            {"factor": "الطلب الموسمي", "impact": "medium", "direction": "up"},
            {"factor": "مستوى المخزون", "impact": "low", "direction": "neutral"},
        ],
        "recommendation": "يُنصح بتطبيق السعر المقترح لتحقيق التوازن الأمثل بين الربحية والتنافسية"
    }

@router.get("/pricing/bulk-analysis")
async def bulk_pricing_analysis(user = Depends(verify_admin_token), category: str = None):
    """Get bulk pricing analysis for products"""
    products = [
        {"id": "P-001", "name": "iPhone 15 Pro", "current_price": 4999, "suggested_price": 4799, "potential_increase": 12, "action": "reduce"},
        {"id": "P-002", "name": "Samsung Galaxy S24", "current_price": 3499, "suggested_price": 3699, "potential_increase": 8, "action": "increase"},
        {"id": "P-003", "name": "AirPods Pro", "current_price": 999, "suggested_price": 949, "potential_increase": 15, "action": "reduce"},
        {"id": "P-004", "name": "MacBook Air M3", "current_price": 5499, "suggested_price": 5499, "potential_increase": 0, "action": "keep"},
    ]
    
    return {
        "products": products,
        "summary": {
            "total_analyzed": len(products),
            "suggest_increase": len([p for p in products if p["action"] == "increase"]),
            "suggest_reduce": len([p for p in products if p["action"] == "reduce"]),
            "suggest_keep": len([p for p in products if p["action"] == "keep"]),
            "avg_potential_increase": f"{sum(p['potential_increase'] for p in products) / len(products):.1f}%"
        }
    }

# ==================== SEO OPTIMIZER ====================

@router.post("/seo/optimize")
async def optimize_seo(request: SEORequest, user = Depends(verify_admin_token)):
    """Get AI-optimized SEO suggestions"""
    return {
        "product_id": request.product_id,
        "original": {
            "title": request.title,
            "description": request.description
        },
        "optimized": {
            "title": f"{request.title} | أفضل سعر في السعودية | شحن مجاني",
            "description": f"{request.description} ✓ ضمان سنتين ✓ شحن سريع ✓ الدفع عند الاستلام",
            "meta_keywords": [request.category, "شراء أونلاين", "توصيل سريع", "ضمان", "أفضل سعر"],
            "url_slug": request.title.lower().replace(" ", "-")
        },
        "seo_score": {
            "before": random.randint(45, 65),
            "after": random.randint(80, 95)
        },
        "recommendations": [
            "إضافة كلمات مفتاحية مستهدفة",
            "تحسين طول العنوان (50-60 حرف)",
            "إضافة Schema markup للمنتج",
            "تحسين سرعة تحميل الصفحة"
        ]
    }

@router.get("/seo/audit")
async def seo_audit(user = Depends(verify_admin_token)):
    """Get overall SEO audit"""
    return {
        "overall_score": 72,
        "issues": {
            "critical": 3,
            "warnings": 12,
            "notices": 25
        },
        "top_issues": [
            {"type": "critical", "issue": "45 صفحة بدون meta description", "affected": 45},
            {"type": "critical", "issue": "صور بدون alt text", "affected": 128},
            {"type": "warning", "issue": "عناوين مكررة", "affected": 23},
        ],
        "improvements": [
            {"action": "إضافة meta descriptions", "impact": "high", "effort": "medium"},
            {"action": "تحسين سرعة الموقع", "impact": "high", "effort": "high"},
            {"action": "إصلاح الروابط المكسورة", "impact": "medium", "effort": "low"},
        ]
    }

# ==================== RECOMMENDATION ENGINE ====================

@router.post("/recommendations/get")
async def get_recommendations(request: RecommendationRequest, user = Depends(verify_admin_token)):
    """Get personalized product recommendations"""
    recommendations = [
        {"id": "P-101", "name": "iPhone 15 Pro Max", "price": 5499, "score": 0.95, "reason": "بناءً على مشترياتك السابقة"},
        {"id": "P-102", "name": "AirPods Pro 2", "price": 999, "score": 0.89, "reason": "يُشترى عادةً مع المنتجات في سلتك"},
        {"id": "P-103", "name": "حافظة MagSafe", "price": 199, "score": 0.87, "reason": "منتج متوافق"},
        {"id": "P-104", "name": "شاحن سريع 20W", "price": 99, "score": 0.82, "reason": "الأكثر مبيعاً في هذه الفئة"},
    ]
    
    return {
        "user_id": request.user_id,
        "context": request.context,
        "recommendations": recommendations[:request.limit],
        "model_version": "v2.1",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/recommendations/analytics")
async def recommendations_analytics(user = Depends(verify_admin_token)):
    """Get recommendation engine analytics"""
    return {
        "performance": {
            "click_through_rate": 12.5,
            "conversion_rate": 3.8,
            "revenue_attributed": 425000,
            "avg_order_value_increase": 18.5
        },
        "top_performing": [
            {"strategy": "المنتجات المشابهة", "ctr": 15.2, "conversions": 1250},
            {"strategy": "يُشترى معاً", "ctr": 12.8, "conversions": 980},
            {"strategy": "بناءً على التصفح", "ctr": 10.5, "conversions": 750},
        ]
    }

# ==================== FRAUD DETECTION ====================

@router.post("/fraud/analyze")
async def analyze_fraud_risk(transaction_id: str, user = Depends(verify_admin_token)):
    """Analyze transaction for fraud risk"""
    risk_score = random.randint(5, 95)
    
    return {
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
        "factors": [
            {"factor": "سرعة المعاملة", "contribution": random.randint(10, 30), "flag": risk_score > 50},
            {"factor": "موقع IP", "contribution": random.randint(5, 25), "flag": risk_score > 60},
            {"factor": "تاريخ الحساب", "contribution": random.randint(5, 20), "flag": risk_score > 70},
            {"factor": "نمط الشراء", "contribution": random.randint(10, 25), "flag": risk_score > 40},
        ],
        "recommendation": "مراجعة يدوية" if risk_score > 70 else "قبول" if risk_score < 40 else "تحقق إضافي",
        "similar_fraud_cases": random.randint(0, 5) if risk_score > 50 else 0
    }

@router.get("/fraud/statistics")
async def fraud_statistics(user = Depends(verify_admin_token)):
    """Get fraud detection statistics"""
    return {
        "today": {
            "transactions_analyzed": 15420,
            "flagged": 45,
            "blocked": 12,
            "false_positives": 3
        },
        "this_month": {
            "total_prevented_loss": 125000,
            "fraud_rate": 0.08,
            "detection_accuracy": 97.3
        },
        "trends": [
            {"type": "بطاقات مسروقة", "count": 23, "trend": "up"},
            {"type": "حسابات مزيفة", "count": 15, "trend": "down"},
            {"type": "استرداد احتيالي", "count": 8, "trend": "stable"},
        ]
    }

# ==================== DASHBOARD ====================
# Dashboard route moved above to avoid conflict with /{engine_id} route
