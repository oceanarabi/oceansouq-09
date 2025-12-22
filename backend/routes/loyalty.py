from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random

router = APIRouter(prefix="/api/loyalty", tags=["loyalty"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== LOYALTY PROGRAM ====================

@router.get("/program/overview")
async def get_loyalty_overview(user = Depends(verify_token)):
    """نظرة عامة على برنامج الولاء"""
    return {
        "program_name": "Ocean Rewards",
        "total_members": 125000,
        "active_members": 89000,
        "points_issued_today": 450000,
        "points_redeemed_today": 125000,
        "tiers": [
            {"name": "برونزي", "members": 75000, "min_points": 0, "benefits": ["نقاط على كل شراء"]},
            {"name": "فضي", "members": 35000, "min_points": 5000, "benefits": ["نقاط مضاعفة", "شحن مخفض"]},
            {"name": "ذهبي", "members": 12000, "min_points": 15000, "benefits": ["نقاط 3x", "شحن مجاني", "دعم VIP"]},
            {"name": "بلاتيني", "members": 3000, "min_points": 50000, "benefits": ["نقاط 5x", "عروض حصرية", "مدير حساب"]}
        ],
        "redemption_options": [
            {"type": "خصم مباشر", "conversion": "100 نقطة = 1 ر.س"},
            {"type": "شحن مجاني", "points_required": 500},
            {"type": "منتجات مجانية", "points_required": "varies"}
        ]
    }

@router.get("/members")
async def get_loyalty_members(tier: str = "all", limit: int = 50, user = Depends(verify_token)):
    """قائمة أعضاء برنامج الولاء"""
    tiers = ["برونزي", "فضي", "ذهبي", "بلاتيني"]
    members = []
    
    for i in range(limit):
        members.append({
            "id": f"MEM-{10000 + i}",
            "name": f"عضو {i+1}",
            "email": f"member{i+1}@email.com",
            "tier": random.choice(tiers) if tier == "all" else tier,
            "points_balance": random.randint(100, 50000),
            "lifetime_points": random.randint(1000, 100000),
            "joined_date": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 730))).strftime("%Y-%m-%d"),
            "last_activity": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
        })
    
    return {"members": members, "total": len(members)}

@router.get("/member/{member_id}")
async def get_member_details(member_id: str, user = Depends(verify_token)):
    """تفاصيل العضو"""
    return {
        "id": member_id,
        "name": "عبدالله محمد",
        "email": "abdullah@email.com",
        "phone": "+966501234567",
        "tier": "ذهبي",
        "points_balance": 15450,
        "points_expiring_soon": 2500,
        "expiry_date": "2024-03-31",
        "lifetime_points": 45000,
        "lifetime_redemptions": 12500,
        "history": [
            {"date": "2024-01-15", "type": "earned", "points": 450, "source": "طلب #12345"},
            {"date": "2024-01-14", "type": "redeemed", "points": -500, "source": "شحن مجاني"},
            {"date": "2024-01-12", "type": "earned", "points": 320, "source": "طلب #12340"},
            {"date": "2024-01-10", "type": "bonus", "points": 1000, "source": "مكافأة الترقية"}
        ],
        "recommendations": [
            "استخدم 2500 نقطة قبل انتهائها",
            "اشتري 5000 ر.س إضافية للترقية لبلاتيني"
        ]
    }

@router.post("/points/award")
async def award_points(member_id: str, points: int, reason: str, user = Depends(verify_token)):
    """منح نقاط"""
    return {
        "success": True,
        "member_id": member_id,
        "points_awarded": points,
        "reason": reason,
        "new_balance": random.randint(1000, 50000)
    }

@router.post("/points/redeem")
async def redeem_points(member_id: str, points: int, reward_type: str, user = Depends(verify_token)):
    """استبدال نقاط"""
    return {
        "success": True,
        "member_id": member_id,
        "points_redeemed": points,
        "reward": reward_type,
        "new_balance": random.randint(500, 45000)
    }

# ==================== INSTALLMENTS ====================

@router.get("/installments/plans")
async def get_installment_plans(user = Depends(verify_token)):
    """خطط التقسيط"""
    return {
        "plans": [
            {"id": "INS-3", "months": 3, "interest": 0, "min_amount": 500, "max_amount": 10000},
            {"id": "INS-6", "months": 6, "interest": 0, "min_amount": 1000, "max_amount": 20000},
            {"id": "INS-12", "months": 12, "interest": 5, "min_amount": 2000, "max_amount": 50000},
            {"id": "INS-24", "months": 24, "interest": 8, "min_amount": 5000, "max_amount": 100000}
        ],
        "active_installments": 2500,
        "total_financed": 12500000,
        "default_rate": 0.8
    }

@router.get("/installments/active")
async def get_active_installments(limit: int = 50, user = Depends(verify_token)):
    """التقسيطات النشطة"""
    installments = []
    for i in range(limit):
        total = random.randint(1000, 20000)
        paid = random.randint(0, total)
        installments.append({
            "id": f"INST-{10000 + i}",
            "customer": f"عميل {i+1}",
            "order_id": f"ORD-{50000 + i}",
            "total_amount": total,
            "paid_amount": paid,
            "remaining": total - paid,
            "monthly_payment": total // random.choice([3, 6, 12]),
            "next_payment_date": (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
            "status": "active" if paid < total else "completed"
        })
    return {"installments": installments, "total": len(installments)}

@router.post("/installments/calculate")
async def calculate_installment(amount: float, months: int, user = Depends(verify_token)):
    """حساب التقسيط"""
    interest = 0 if months <= 6 else 5 if months == 12 else 8
    total = amount * (1 + interest / 100)
    monthly = total / months
    
    return {
        "amount": amount,
        "months": months,
        "interest_rate": f"{interest}%",
        "total_amount": round(total, 2),
        "monthly_payment": round(monthly, 2),
        "first_payment": round(monthly, 2),
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }
