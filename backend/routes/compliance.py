from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

security = HTTPBearer()
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# ==================== PROVIDER REQUIREMENTS ====================

@router.get("/requirements")
async def get_all_requirements():
    """Get requirements for all provider types"""
    return {
        "seller": get_seller_requirements(),
        "driver": get_driver_requirements(),
        "captain": get_captain_requirements(),
        "restaurant": get_restaurant_requirements(),
        "hotel": get_hotel_requirements(),
        "service_provider": get_service_provider_requirements(),
        "experience_provider": get_experience_provider_requirements()
    }

@router.get("/requirements/{provider_type}")
async def get_provider_requirements(provider_type: str):
    """Get requirements for specific provider type"""
    requirements_map = {
        "seller": get_seller_requirements(),
        "driver": get_driver_requirements(),
        "captain": get_captain_requirements(),
        "restaurant": get_restaurant_requirements(),
        "hotel": get_hotel_requirements(),
        "service_provider": get_service_provider_requirements(),
        "experience_provider": get_experience_provider_requirements()
    }
    
    if provider_type not in requirements_map:
        raise HTTPException(status_code=404, detail="Provider type not found")
    
    return requirements_map[provider_type]

def get_seller_requirements():
    """Requirements for sellers/stores"""
    return {
        "type": "seller",
        "title": "بائع / متجر إلكتروني",
        "title_en": "Seller / Online Store",
        "icon": "🏪",
        "description": "متطلبات التسجيل كبائع أو متجر إلكتروني على منصة Ocean",
        "documents": {
            "required": [
                {
                    "id": "national_id",
                    "name": "الهوية الوطنية / الإقامة",
                    "name_en": "National ID / Iqama",
                    "description": "صورة واضحة من الهوية الوطنية للسعوديين أو الإقامة للمقيمين (سارية المفعول)",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "commercial_register",
                    "name": "السجل التجاري / وثيقة العمل الحر",
                    "name_en": "Commercial Register / Freelance Document",
                    "description": "السجل التجاري من وزارة التجارة أو وثيقة العمل الحر من وزارة الموارد البشرية",
                    "alternatives": ["السجل التجاري", "وثيقة العمل الحر", "رخصة البلدية للمحلات"],
                    "issuing_authority": "وزارة التجارة / وزارة الموارد البشرية",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "bank_account",
                    "name": "شهادة الآيبان البنكي",
                    "name_en": "IBAN Certificate",
                    "description": "شهادة الآيبان من البنك باسم صاحب المتجر أو المنشأة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 2
                }
            ],
            "optional": [
                {
                    "id": "vat_certificate",
                    "name": "شهادة التسجيل في ضريبة القيمة المضافة",
                    "name_en": "VAT Registration Certificate",
                    "description": "مطلوبة للمنشآت التي تتجاوز إيراداتها 375,000 ريال سنوياً",
                    "issuing_authority": "هيئة الزكاة والضريبة والجمارك"
                },
                {
                    "id": "maroof_certificate",
                    "name": "شهادة معروف",
                    "name_en": "Maroof Certificate",
                    "description": "توثيق المتجر في منصة معروف التابعة لوزارة التجارة",
                    "issuing_authority": "وزارة التجارة - منصة معروف"
                }
            ]
        },
        "conditions": [
            "أن يكون المتقدم سعودي الجنسية أو مقيم بإقامة سارية",
            "أن يكون عمر المتقدم 18 سنة فأكثر",
            "أن تكون المنتجات المعروضة مطابقة للمواصفات السعودية",
            "الالتزام بنظام التجارة الإلكترونية السعودي",
            "الالتزام بأحكام نظام حماية المستهلك",
            "عدم بيع المنتجات المحظورة أو المقلدة"
        ],
        "fees": {
            "registration": 0,
            "commission": "5-15% حسب الفئة",
            "monthly": 0
        },
        "links": [
            {"name": "وزارة التجارة", "url": "https://mc.gov.sa"},
            {"name": "منصة معروف", "url": "https://maroof.sa"},
            {"name": "وثيقة العمل الحر", "url": "https://freelance.hrsd.gov.sa"}
        ]
    }

def get_driver_requirements():
    """Requirements for delivery drivers"""
    return {
        "type": "driver",
        "title": "سائق توصيل",
        "title_en": "Delivery Driver",
        "icon": "🚚",
        "description": "متطلبات التسجيل كسائق توصيل على منصة Ocean",
        "documents": {
            "required": [
                {
                    "id": "national_id",
                    "name": "الهوية الوطنية / الإقامة",
                    "name_en": "National ID / Iqama",
                    "description": "صورة واضحة من الهوية الوطنية أو الإقامة (سارية المفعول)",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "driving_license",
                    "name": "رخصة القيادة",
                    "name_en": "Driving License",
                    "description": "رخصة قيادة سعودية سارية المفعول (خاصة أو عامة)",
                    "validity": "يجب أن تكون سارية لمدة 6 أشهر على الأقل",
                    "issuing_authority": "المرور السعودي",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "vehicle_registration",
                    "name": "استمارة المركبة",
                    "name_en": "Vehicle Registration",
                    "description": "استمارة تسجيل المركبة (رخصة السير) سارية المفعول",
                    "issuing_authority": "المرور السعودي",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "vehicle_insurance",
                    "name": "تأمين المركبة",
                    "name_en": "Vehicle Insurance",
                    "description": "وثيقة تأمين شامل أو ضد الغير سارية المفعول",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                }
            ],
            "optional": [
                {
                    "id": "vehicle_inspection",
                    "name": "الفحص الدوري",
                    "name_en": "Vehicle Inspection",
                    "description": "شهادة الفحص الدوري للمركبة"
                }
            ]
        },
        "vehicle_requirements": {
            "car": {
                "name": "سيارة",
                "max_age_years": 10,
                "conditions": ["حالة جيدة", "تكييف يعمل", "نظيفة"]
            },
            "motorcycle": {
                "name": "دراجة نارية",
                "max_age_years": 5,
                "conditions": ["صندوق توصيل معتمد", "خوذة"]
            },
            "bicycle": {
                "name": "دراجة هوائية",
                "conditions": ["صندوق توصيل", "سترة عاكسة"]
            }
        },
        "conditions": [
            "أن يكون عمر السائق 18 سنة فأكثر",
            "أن يكون حاصلاً على رخصة قيادة سعودية سارية",
            "عدم وجود مخالفات مرورية جسيمة",
            "اجتياز الفحص الطبي (لمن تجاوز 60 سنة)",
            "الالتزام بأنظمة المرور والسلامة",
            "المحافظة على نظافة المركبة"
        ],
        "fees": {
            "registration": 0,
            "commission": "15-20% من قيمة التوصيل",
            "monthly": 0
        },
        "links": [
            {"name": "أبشر - المرور", "url": "https://www.absher.sa"},
            {"name": "نجم للتأمين", "url": "https://www.najm.sa"}
        ]
    }

def get_captain_requirements():
    """Requirements for ride captains"""
    return {
        "type": "captain",
        "title": "كابتن / سائق توصيل ركاب",
        "title_en": "Ride Captain",
        "icon": "🚗",
        "description": "متطلبات التسجيل ككابتن توصيل ركاب على منصة Ocean",
        "documents": {
            "required": [
                {
                    "id": "national_id",
                    "name": "الهوية الوطنية",
                    "name_en": "National ID",
                    "description": "يجب أن يكون سعودي الجنسية فقط لنشاط توصيل الركاب",
                    "note": "نشاط توصيل الركاب مقصور على السعوديين حسب أنظمة هيئة النقل",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "driving_license",
                    "name": "رخصة القيادة",
                    "name_en": "Driving License",
                    "description": "رخصة قيادة خاصة سارية المفعول لمدة سنة على الأقل",
                    "validity": "يجب أن تكون سارية لمدة سنة على الأقل",
                    "minimum_experience": "سنة واحدة من تاريخ الإصدار",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "vehicle_registration",
                    "name": "استمارة المركبة",
                    "name_en": "Vehicle Registration",
                    "description": "استمارة تسجيل المركبة باسم السائق أو مفوض رسمياً",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "vehicle_insurance",
                    "name": "تأمين شامل",
                    "name_en": "Comprehensive Insurance",
                    "description": "وثيقة تأمين شامل على المركبة (إلزامي لنقل الركاب)",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "criminal_record",
                    "name": "شهادة السوابق الجنائية",
                    "name_en": "Criminal Record Certificate",
                    "description": "شهادة بعدم وجود سوابق جنائية من الأمن العام",
                    "issuing_authority": "الأمن العام",
                    "validity": "صادرة خلال آخر 3 أشهر",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                }
            ],
            "optional": [
                {
                    "id": "tcc_license",
                    "name": "ترخيص هيئة النقل",
                    "name_en": "TCC License",
                    "description": "ترخيص من هيئة النقل العام لنشاط توصيل الركاب"
                }
            ]
        },
        "vehicle_requirements": {
            "sedan": {
                "name": "سيدان",
                "max_age_years": 5,
                "min_model_year": 2019,
                "conditions": ["4 أبواب", "تكييف يعمل", "نظيفة من الداخل والخارج"]
            },
            "suv": {
                "name": "دفع رباعي",
                "max_age_years": 6,
                "conditions": ["حالة ممتازة", "مقاعد مريحة"]
            },
            "luxury": {
                "name": "فاخرة",
                "max_age_years": 4,
                "conditions": ["ماركات معتمدة فقط", "مواصفات فاخرة"]
            }
        },
        "conditions": [
            "أن يكون سعودي الجنسية (إلزامي)",
            "أن يكون عمر السائق بين 20 و 65 سنة",
            "أن تكون المركبة موديل 2019 أو أحدث",
            "اجتياز الفحص الطبي",
            "عدم وجود سوابق جنائية",
            "عدم وجود مخالفات مرورية خطيرة (تجاوز السرعة بأكثر من 50 كم/س)",
            "الالتزام بمعايير السلامة والأمان"
        ],
        "fees": {
            "registration": 0,
            "commission": "20-25% من قيمة الرحلة",
            "monthly": 0
        },
        "links": [
            {"name": "هيئة النقل العام", "url": "https://tga.gov.sa"},
            {"name": "أبشر", "url": "https://www.absher.sa"}
        ]
    }

def get_restaurant_requirements():
    """Requirements for restaurants"""
    return {
        "type": "restaurant",
        "title": "مطعم / مقهى",
        "title_en": "Restaurant / Cafe",
        "icon": "🍔",
        "description": "متطلبات التسجيل كمطعم أو مقهى على منصة Ocean",
        "documents": {
            "required": [
                {
                    "id": "commercial_register",
                    "name": "السجل التجاري",
                    "name_en": "Commercial Register",
                    "description": "سجل تجاري يتضمن نشاط المطاعم والمقاهي",
                    "issuing_authority": "وزارة التجارة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "municipality_license",
                    "name": "رخصة البلدية",
                    "name_en": "Municipality License",
                    "description": "رخصة فتح محل من الأمانة/البلدية سارية المفعول",
                    "issuing_authority": "الأمانة / البلدية",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "health_certificate",
                    "name": "الشهادة الصحية",
                    "name_en": "Health Certificate",
                    "description": "شهادة صحية للمنشأة من وزارة الصحة أو البلدية",
                    "issuing_authority": "وزارة الصحة / الأمانة",
                    "validity": "سارية المفعول",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "food_handlers_certificate",
                    "name": "شهادات العاملين الصحية",
                    "name_en": "Food Handlers Certificates",
                    "description": "شهادات صحية لجميع العاملين في إعداد وتقديم الطعام",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 10
                },
                {
                    "id": "bank_account",
                    "name": "شهادة الآيبان البنكي",
                    "name_en": "IBAN Certificate",
                    "description": "شهادة الآيبان باسم المنشأة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 2
                }
            ],
            "optional": [
                {
                    "id": "sfda_license",
                    "name": "ترخيص الغذاء والدواء",
                    "name_en": "SFDA License",
                    "description": "ترخيص من هيئة الغذاء والدواء (للمنتجات المصنعة)"
                },
                {
                    "id": "halal_certificate",
                    "name": "شهادة حلال",
                    "name_en": "Halal Certificate",
                    "description": "شهادة منتجات حلال (للحوم والدواجن)"
                }
            ]
        },
        "conditions": [
            "الالتزام بمعايير سلامة الغذاء",
            "توفر نظام تخزين وتبريد مناسب",
            "نظافة المكان والمعدات",
            "التزام العاملين بالزي والنظافة الشخصية",
            "وجود نظام إدارة جودة للمنتجات",
            "الالتزام بأوقات التوصيل المحددة"
        ],
        "fees": {
            "registration": 0,
            "commission": "15-25% من قيمة الطلب",
            "monthly": 0
        },
        "links": [
            {"name": "وزارة الشؤون البلدية", "url": "https://momra.gov.sa"},
            {"name": "هيئة الغذاء والدواء", "url": "https://sfda.gov.sa"},
            {"name": "بلدي", "url": "https://balady.gov.sa"}
        ]
    }

def get_hotel_requirements():
    """Requirements for hotels"""
    return {
        "type": "hotel",
        "title": "فندق / شقق فندقية",
        "title_en": "Hotel / Serviced Apartments",
        "icon": "🏨",
        "description": "متطلبات التسجيل كفندق أو شقق فندقية على منصة Ocean",
        "documents": {
            "required": [
                {
                    "id": "commercial_register",
                    "name": "السجل التجاري",
                    "name_en": "Commercial Register",
                    "description": "سجل تجاري يتضمن نشاط الإيواء السياحي",
                    "issuing_authority": "وزارة التجارة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "tourism_license",
                    "name": "ترخيص وزارة السياحة",
                    "name_en": "Tourism License",
                    "description": "ترخيص مزاولة نشاط الإيواء من وزارة السياحة",
                    "issuing_authority": "وزارة السياحة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "municipality_license",
                    "name": "رخصة البلدية",
                    "name_en": "Municipality License",
                    "description": "رخصة البناء والتشغيل من البلدية",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "civil_defense",
                    "name": "شهادة الدفاع المدني",
                    "name_en": "Civil Defense Certificate",
                    "description": "شهادة سلامة من الدفاع المدني",
                    "issuing_authority": "الدفاع المدني",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "bank_account",
                    "name": "شهادة الآيبان البنكي",
                    "name_en": "IBAN Certificate",
                    "description": "شهادة الآيبان باسم المنشأة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 2
                }
            ],
            "optional": [
                {
                    "id": "star_rating",
                    "name": "شهادة التصنيف الفندقي",
                    "name_en": "Star Rating Certificate",
                    "description": "شهادة تصنيف النجوم من وزارة السياحة"
                },
                {
                    "id": "quality_certificate",
                    "name": "شهادة الجودة",
                    "name_en": "Quality Certificate",
                    "description": "شهادة ISO أو ما يعادلها"
                }
            ]
        },
        "conditions": [
            "الالتزام بمعايير وزارة السياحة للإيواء",
            "توفر نظام حجز إلكتروني",
            "وجود استقبال 24 ساعة",
            "الالتزام بمعايير السلامة والأمان",
            "توفر خدمات النظافة اليومية",
            "الإبلاغ عن النزلاء للجهات المختصة (شموس)"
        ],
        "fees": {
            "registration": 0,
            "commission": "10-18% من قيمة الحجز",
            "monthly": 0
        },
        "links": [
            {"name": "وزارة السياحة", "url": "https://mt.gov.sa"},
            {"name": "منصة شموس", "url": "https://shomoos.sa"},
            {"name": "الدفاع المدني", "url": "https://998.gov.sa"}
        ]
    }

def get_service_provider_requirements():
    """Requirements for on-demand service providers"""
    return {
        "type": "service_provider",
        "title": "مقدم خدمات منزلية",
        "title_en": "Home Service Provider",
        "icon": "🔧",
        "description": "متطلبات التسجيل كمقدم خدمات منزلية (صيانة، تنظيف، سباكة، كهرباء)",
        "documents": {
            "required": [
                {
                    "id": "national_id",
                    "name": "الهوية الوطنية / الإقامة",
                    "name_en": "National ID / Iqama",
                    "description": "صورة من الهوية أو الإقامة سارية المفعول",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "work_permit",
                    "name": "تصريح العمل / وثيقة العمل الحر",
                    "name_en": "Work Permit / Freelance Document",
                    "description": "للمقيمين: تصريح عمل في المهنة. للسعوديين: وثيقة العمل الحر",
                    "note": "المهنة في الإقامة يجب أن تتوافق مع الخدمة المقدمة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                }
            ],
            "conditional": [
                {
                    "id": "electrical_license",
                    "name": "رخصة كهربائي",
                    "name_en": "Electrician License",
                    "description": "رخصة مزاولة مهنة من هيئة المواصفات (للكهربائيين)",
                    "applies_to": "electrical"
                },
                {
                    "id": "plumbing_certificate",
                    "name": "شهادة سباكة",
                    "name_en": "Plumbing Certificate",
                    "description": "شهادة تأهيل في السباكة (للسباكين)",
                    "applies_to": "plumbing"
                },
                {
                    "id": "ac_certificate",
                    "name": "شهادة تكييف وتبريد",
                    "name_en": "HVAC Certificate",
                    "description": "شهادة في صيانة أنظمة التكييف",
                    "applies_to": "ac_maintenance"
                }
            ],
            "optional": [
                {
                    "id": "experience_certificate",
                    "name": "شهادة خبرة",
                    "name_en": "Experience Certificate",
                    "description": "شهادات خبرة من جهات عمل سابقة"
                },
                {
                    "id": "training_certificate",
                    "name": "شهادات تدريبية",
                    "name_en": "Training Certificates",
                    "description": "شهادات دورات تدريبية في المجال"
                }
            ]
        },
        "service_specific": {
            "cleaning": {
                "name": "تنظيف",
                "requirements": ["شهادة صحية", "لا يشترط مؤهل"]
            },
            "electrical": {
                "name": "كهرباء",
                "requirements": ["رخصة كهربائي", "شهادة تأهيل"]
            },
            "plumbing": {
                "name": "سباكة",
                "requirements": ["خبرة في المجال", "أدوات مناسبة"]
            },
            "ac_maintenance": {
                "name": "تكييف",
                "requirements": ["شهادة تكييف", "خبرة عملية"]
            },
            "carpentry": {
                "name": "نجارة",
                "requirements": ["خبرة في المجال", "أدوات مناسبة"]
            }
        },
        "conditions": [
            "أن يكون عمر المتقدم 18 سنة فأكثر",
            "امتلاك الأدوات اللازمة للعمل",
            "الالتزام بمواعيد العمل المحددة",
            "المحافظة على نظافة وممتلكات العميل",
            "الالتزام بمعايير السلامة المهنية",
            "عدم التدخين في منزل العميل"
        ],
        "fees": {
            "registration": 0,
            "commission": "15-25% من قيمة الخدمة",
            "monthly": 0
        },
        "links": [
            {"name": "وثيقة العمل الحر", "url": "https://freelance.hrsd.gov.sa"},
            {"name": "هيئة المواصفات والمقاييس", "url": "https://saso.gov.sa"}
        ]
    }

def get_experience_provider_requirements():
    """Requirements for experience/tour providers"""
    return {
        "type": "experience_provider",
        "title": "مقدم تجارب وجولات سياحية",
        "title_en": "Experience & Tour Provider",
        "icon": "🎭",
        "description": "متطلبات التسجيل كمقدم تجارب سياحية أو أنشطة ترفيهية",
        "documents": {
            "required": [
                {
                    "id": "commercial_register",
                    "name": "السجل التجاري",
                    "name_en": "Commercial Register",
                    "description": "سجل تجاري يتضمن نشاط السياحة أو الترفيه",
                    "issuing_authority": "وزارة التجارة",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "tourism_license",
                    "name": "ترخيص وزارة السياحة",
                    "name_en": "Tourism License",
                    "description": "ترخيص مزاولة النشاط السياحي",
                    "issuing_authority": "وزارة السياحة",
                    "note": "مطلوب للجولات السياحية والأنشطة الترفيهية",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "insurance",
                    "name": "تأمين المسؤولية",
                    "name_en": "Liability Insurance",
                    "description": "وثيقة تأمين ضد المسؤولية تجاه المشاركين",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 5
                },
                {
                    "id": "bank_account",
                    "name": "شهادة الآيبان",
                    "name_en": "IBAN Certificate",
                    "accepted_formats": ["jpg", "png", "pdf"],
                    "max_size_mb": 2
                }
            ],
            "conditional": [
                {
                    "id": "tour_guide_license",
                    "name": "رخصة مرشد سياحي",
                    "name_en": "Tour Guide License",
                    "description": "رخصة من وزارة السياحة (للمرشدين)",
                    "applies_to": "tours"
                },
                {
                    "id": "diving_certificate",
                    "name": "شهادة غوص معتمدة",
                    "name_en": "Diving Certificate",
                    "description": "شهادة PADI أو معادلة (للغوص)",
                    "applies_to": "diving"
                },
                {
                    "id": "adventure_safety",
                    "name": "شهادة سلامة المغامرات",
                    "name_en": "Adventure Safety Certificate",
                    "description": "شهادة تدريب على السلامة (للمغامرات)",
                    "applies_to": "adventure"
                }
            ],
            "optional": [
                {
                    "id": "first_aid",
                    "name": "شهادة إسعافات أولية",
                    "name_en": "First Aid Certificate",
                    "description": "يفضل وجودها لجميع الأنشطة"
                }
            ]
        },
        "conditions": [
            "الالتزام بمعايير السلامة للأنشطة",
            "توفر معدات السلامة اللازمة",
            "وجود خطة طوارئ واضحة",
            "إبلاغ المشاركين بالمخاطر المحتملة",
            "الحصول على موافقة ولي الأمر للقاصرين",
            "الالتزام بالطاقة الاستيعابية المحددة"
        ],
        "fees": {
            "registration": 0,
            "commission": "10-20% من قيمة الحجز",
            "monthly": 0
        },
        "links": [
            {"name": "وزارة السياحة", "url": "https://mt.gov.sa"},
            {"name": "الهيئة العامة للترفيه", "url": "https://gea.gov.sa"}
        ]
    }

# ==================== TERMS & CONDITIONS ====================

@router.get("/terms")
async def get_terms_and_conditions():
    """Get platform terms and conditions"""
    return {
        "version": "1.0",
        "last_updated": "2024-12-19",
        "sections": [
            {
                "id": "general",
                "title": "الشروط العامة",
                "content": [
                    "منصة Ocean هي منصة إلكترونية تربط بين مقدمي الخدمات والمستفيدين",
                    "باستخدام المنصة، فإنك توافق على جميع الشروط والأحكام الواردة هنا",
                    "يجب أن يكون عمر المستخدم 18 سنة فأكثر",
                    "تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت"
                ]
            },
            {
                "id": "provider_obligations",
                "title": "التزامات مقدمي الخدمات",
                "content": [
                    "تقديم جميع الوثائق المطلوبة والصحيحة",
                    "الالتزام بجميع الأنظمة واللوائح السعودية",
                    "تقديم الخدمة بجودة عالية وفي الوقت المحدد",
                    "عدم التمييز بين العملاء",
                    "المحافظة على سرية بيانات العملاء",
                    "الإبلاغ الفوري عن أي مشكلات أو حوادث"
                ]
            },
            {
                "id": "user_obligations",
                "title": "التزامات المستخدمين",
                "content": [
                    "تقديم معلومات صحيحة ودقيقة",
                    "الدفع في الوقت المحدد",
                    "احترام مقدمي الخدمات",
                    "عدم إساءة استخدام المنصة",
                    "الإبلاغ عن أي مخالفات"
                ]
            },
            {
                "id": "payments",
                "title": "المدفوعات والعمولات",
                "content": [
                    "تحتسب عمولة المنصة من إجمالي قيمة الخدمة",
                    "يتم تحويل المستحقات أسبوعياً إلى الحساب البنكي المسجل",
                    "تخضع جميع المعاملات لضريبة القيمة المضافة 15%",
                    "لا يتم استرداد العمولة في حال إلغاء الطلب من قبل مقدم الخدمة"
                ]
            },
            {
                "id": "suspension",
                "title": "الإيقاف والإنهاء",
                "content": [
                    "يحق للمنصة إيقاف أو إنهاء حساب أي مستخدم يخالف الشروط",
                    "في حال انتهاء صلاحية الوثائق، يتم إيقاف الحساب مؤقتاً",
                    "التقييم المنخفض المستمر قد يؤدي إلى إيقاف الحساب",
                    "الشكاوى المتكررة قد تؤدي إلى التحقيق وإمكانية الإيقاف"
                ]
            },
            {
                "id": "liability",
                "title": "المسؤولية",
                "content": [
                    "المنصة وسيط فقط ولا تتحمل مسؤولية جودة الخدمات",
                    "مقدم الخدمة مسؤول عن أي أضرار ناتجة عن الخدمة",
                    "يجب على مقدم الخدمة امتلاك تأمين مناسب",
                    "المنصة غير مسؤولة عن التأخير الناتج عن ظروف خارجة عن السيطرة"
                ]
            },
            {
                "id": "privacy",
                "title": "الخصوصية",
                "content": [
                    "تلتزم المنصة بحماية بيانات المستخدمين",
                    "لن يتم مشاركة البيانات مع أطراف ثالثة إلا بموافقة المستخدم أو بطلب قانوني",
                    "يحق للمستخدم طلب حذف بياناته وفق الأنظمة المعمول بها"
                ]
            },
            {
                "id": "disputes",
                "title": "النزاعات",
                "content": [
                    "في حال وجود نزاع، يتم التواصل أولاً مع خدمة العملاء",
                    "تخضع هذه الشروط للأنظمة السعودية",
                    "الاختصاص القضائي للمحاكم السعودية"
                ]
            }
        ],
        "legal_references": [
            {
                "name": "نظام التجارة الإلكترونية",
                "authority": "وزارة التجارة",
                "url": "https://mc.gov.sa"
            },
            {
                "name": "نظام حماية البيانات الشخصية",
                "authority": "الهيئة السعودية للبيانات والذكاء الاصطناعي",
                "url": "https://sdaia.gov.sa"
            },
            {
                "name": "نظام حماية المستهلك",
                "authority": "وزارة التجارة",
                "url": "https://mc.gov.sa"
            }
        ]
    }

@router.get("/privacy-policy")
async def get_privacy_policy():
    """Get privacy policy"""
    return {
        "version": "1.0",
        "last_updated": "2024-12-19",
        "sections": [
            {
                "title": "البيانات التي نجمعها",
                "content": [
                    "بيانات الهوية (الاسم، رقم الهوية)",
                    "بيانات التواصل (البريد الإلكتروني، رقم الجوال)",
                    "بيانات الموقع (للسائقين والتوصيل)",
                    "بيانات المعاملات والدفع",
                    "بيانات الاستخدام والتفاعل مع المنصة"
                ]
            },
            {
                "title": "كيف نستخدم بياناتك",
                "content": [
                    "تقديم وتحسين خدماتنا",
                    "التواصل معك بخصوص طلباتك",
                    "التحقق من هويتك وأهليتك",
                    "الامتثال للمتطلبات القانونية",
                    "تحليل الاستخدام لتحسين التجربة"
                ]
            },
            {
                "title": "حماية البيانات",
                "content": [
                    "نستخدم تشفير SSL لحماية البيانات",
                    "نخزن البيانات في خوادم آمنة",
                    "نقصر الوصول على الموظفين المخولين فقط",
                    "نراجع سياسات الأمان بشكل دوري"
                ]
            },
            {
                "title": "حقوقك",
                "content": [
                    "الوصول إلى بياناتك الشخصية",
                    "تصحيح البيانات غير الدقيقة",
                    "طلب حذف بياناتك",
                    "الاعتراض على معالجة البيانات",
                    "نقل بياناتك إلى جهة أخرى"
                ]
            }
        ]
    }
