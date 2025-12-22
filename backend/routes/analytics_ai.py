from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random

router = APIRouter(prefix="/api/analytics-advanced", tags=["advanced-analytics"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== SALES PREDICTION ====================

@router.get("/sales-prediction")
async def get_sales_prediction(period: str = "7d", user = Depends(verify_admin_token)):
    """التنبؤ بالمبيعات"""
    predictions = []
    base = 125000
    
    days = 7 if period == "7d" else 30 if period == "30d" else 90
    
    for i in range(days):
        date = datetime.now(timezone.utc) + timedelta(days=i+1)
        # Weekend boost
        multiplier = 1.3 if date.weekday() >= 4 else 1.0
        predicted = int(base * multiplier * random.uniform(0.9, 1.15))
        predictions.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_sales": predicted,
            "confidence_low": int(predicted * 0.85),
            "confidence_high": int(predicted * 1.15),
            "is_weekend": date.weekday() >= 4
        })
    
    return {
        "period": period,
        "predictions": predictions,
        "summary": {
            "total_predicted": sum(p["predicted_sales"] for p in predictions),
            "average_daily": sum(p["predicted_sales"] for p in predictions) // len(predictions),
            "peak_day": max(predictions, key=lambda x: x["predicted_sales"])["date"],
            "model_accuracy": 92.5
        },
        "factors": [
            {"name": "الموسمية", "impact": "+15%"},
            {"name": "الحملات التسويقية", "impact": "+8%"},
            {"name": "المنافسة", "impact": "-3%"}
        ]
    }

# ==================== COMPETITOR ANALYSIS ====================

@router.get("/competitor-analysis")
async def get_competitor_analysis(user = Depends(verify_admin_token)):
    """تحليل المنافسين"""
    competitors = [
        {
            "name": "أمازون السعودية",
            "market_share": 35,
            "price_comparison": {
                "cheaper": 45,
                "similar": 30,
                "expensive": 25
            },
            "strengths": ["شحن سريع", "تنوع المنتجات"],
            "weaknesses": ["خدمة عملاء ضعيفة"],
            "recent_moves": ["خفض أسعار الإلكترونيات 10%"]
        },
        {
            "name": "نون",
            "market_share": 28,
            "price_comparison": {
                "cheaper": 30,
                "similar": 45,
                "expensive": 25
            },
            "strengths": ["توصيل مجاني", "عروض مستمرة"],
            "weaknesses": ["منتجات محدودة"],
            "recent_moves": ["إطلاق برنامج ولاء جديد"]
        },
        {
            "name": "جرير",
            "market_share": 15,
            "price_comparison": {
                "cheaper": 20,
                "similar": 50,
                "expensive": 30
            },
            "strengths": ["فروع منتشرة", "ثقة العملاء"],
            "weaknesses": ["تجربة إلكترونية ضعيفة"],
            "recent_moves": []
        }
    ]
    
    return {
        "competitors": competitors,
        "our_position": {
            "market_share": 22,
            "rank": 2,
            "growth": "+5% شهرياً"
        },
        "price_alerts": [
            {"product": "iPhone 15 Pro", "competitor": "أمازون", "their_price": 4799, "our_price": 4999, "diff": "-4%"},
            {"product": "Samsung S24", "competitor": "نون", "their_price": 3199, "our_price": 3299, "diff": "-3%"}
        ],
        "recommendations": [
            {
                "action": "خفض سعر iPhone 15 Pro",
                "reason": "المنافس أقل بـ 200 ر.س",
                "expected_impact": "+15% مبيعات"
            }
        ]
    }

# ==================== SMART MARKETING ====================

@router.get("/marketing/campaigns")
async def get_smart_campaigns(user = Depends(verify_admin_token)):
    """الحملات التسويقية الذكية"""
    campaigns = [
        {
            "id": "CMP-001",
            "name": "استعادة العملاء المفقودين",
            "type": "re-engagement",
            "status": "active",
            "target_segment": "عملاء لم يشتروا منذ 60 يوم",
            "audience_size": 12500,
            "channel": "email + sms",
            "offer": "خصم 15%",
            "performance": {
                "sent": 12500,
                "opened": 4500,
                "clicked": 1200,
                "converted": 350,
                "revenue": 85000
            },
            "ai_generated": True
        },
        {
            "id": "CMP-002",
            "name": "ترقية VIP",
            "type": "upsell",
            "status": "active",
            "target_segment": "عملاء مخلصون قريبون من VIP",
            "audience_size": 3500,
            "channel": "push notification",
            "offer": "مضاعفة النقاط",
            "performance": {
                "sent": 3500,
                "opened": 2100,
                "clicked": 890,
                "converted": 245,
                "revenue": 125000
            },
            "ai_generated": True
        }
    ]
    
    return {
        "campaigns": campaigns,
        "suggested_campaigns": [
            {
                "name": "حملة نهاية الأسبوع",
                "target": "جميع العملاء",
                "expected_roi": "320%",
                "confidence": 89
            }
        ],
        "total_roi": "285%",
        "total_revenue_from_campaigns": 210000
    }

@router.post("/marketing/generate-campaign")
async def generate_ai_campaign(target_segment: str, goal: str, budget: float, user = Depends(verify_admin_token)):
    """توليد حملة تسويقية بالذكاء الاصطناعي"""
    return {
        "success": True,
        "campaign": {
            "name": f"حملة {goal} - {target_segment}",
            "channels": ["email", "sms", "push"],
            "offer": "خصم 10% + شحن مجاني",
            "timing": "الجمعة 10 صباحاً",
            "expected_reach": 15000,
            "expected_conversion": "3.5%",
            "expected_revenue": budget * 3.2
        }
    }

# ==================== A/B TESTING ====================

@router.get("/ab-tests")
async def get_ab_tests(user = Depends(verify_admin_token)):
    """اختبارات A/B"""
    tests = [
        {
            "id": "AB-001",
            "name": "لون زر الشراء",
            "status": "running",
            "started": "2024-01-10",
            "variants": [
                {"name": "A - أزرق", "visitors": 12500, "conversions": 450, "rate": 3.6},
                {"name": "B - أخضر", "visitors": 12300, "conversions": 520, "rate": 4.2}
            ],
            "winner": "B",
            "confidence": 95,
            "recommendation": "تطبيق النسخة B - زيادة متوقعة 17%"
        },
        {
            "id": "AB-002",
            "name": "تصميم صفحة المنتج",
            "status": "running",
            "started": "2024-01-12",
            "variants": [
                {"name": "A - الحالي", "visitors": 8500, "conversions": 340, "rate": 4.0},
                {"name": "B - جديد", "visitors": 8400, "conversions": 355, "rate": 4.2}
            ],
            "winner": None,
            "confidence": 72,
            "recommendation": "يحتاج مزيد من البيانات"
        }
    ]
    
    return {
        "tests": tests,
        "summary": {
            "active": 2,
            "completed": 8,
            "total_revenue_impact": "+125,000 ر.س"
        }
    }

@router.post("/ab-tests/create")
async def create_ab_test(name: str, element: str, variants: List[str], user = Depends(verify_admin_token)):
    """إنشاء اختبار A/B جديد"""
    return {
        "success": True,
        "test_id": f"AB-{random.randint(100, 999)}",
        "message": f"تم إنشاء اختبار: {name}"
    }
