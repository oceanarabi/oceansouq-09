import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Import from App.js - these will be passed as props or imported from shared components
const ProductCard = React.lazy(() => import('../components/ProductCard'));
const ProductSkeleton = React.lazy(() => import('../components/ProductSkeleton'));
const HeroSection = React.lazy(() => import('../components/HeroSection'));

// Language hook placeholder - will be replaced with context
const useLanguage = () => {
  const language = localStorage.getItem('language') || 'en';
  const translations = {
    en: {
      dailyDeals: 'Daily Deals',
      limitedOffer: 'Limited time offer',
      discount: 'OFF',
      shopNow: 'Shop Now',
      recommendedForYou: 'Recommended For You',
      trendingNow: 'Trending Now',
      freshPicks: 'Fresh picks for you',
      shopByCategory: 'Shop by Category',
      bestSellers: 'Best Sellers',
      electronics: 'Electronics',
      mensFashion: "Men's Fashion",
      womensFashion: "Women's Fashion",
      kidsBaby: 'Kids & Baby',
      sportsFitness: 'Sports & Fitness',
      homeKitchen: 'Home & Kitchen',
      beautyPersonalCare: 'Beauty',
      fragrance: 'Fragrance',
      shoes: 'Shoes',
      bagsLuggage: 'Bags',
      jewelryWatches: 'Jewelry',
      books: 'Books',
      toysGames: 'Toys & Games',
      automotive: 'Automotive',
      phonesTablets: 'Phones',
      computers: 'Computers',
      cameras: 'Cameras',
      furniture: 'Furniture',
      homeDecor: 'Home Decor',
      gardenOutdoor: 'Garden',
      healthWellness: 'Health',
      groceryFood: 'Grocery',
      petSupplies: 'Pet Supplies',
      officeSupplies: 'Office',
      toolsHardware: 'Tools',
      musicalInstruments: 'Music',
      artCrafts: 'Art & Crafts',
      partySupplies: 'Party',
      babyCare: 'Baby Care'
    },
    ar: {
      dailyDeals: 'عروض اليوم',
      limitedOffer: 'عرض لفترة محدودة',
      discount: 'خصم',
      shopNow: 'تسوق الآن',
      recommendedForYou: 'موصى لك',
      trendingNow: 'الأكثر رواجاً',
      freshPicks: 'اختيارات جديدة لك',
      shopByCategory: 'تسوق حسب الفئة',
      bestSellers: 'الأكثر مبيعاً',
      electronics: 'إلكترونيات',
      mensFashion: 'أزياء رجالية',
      womensFashion: 'أزياء نسائية',
      kidsBaby: 'أطفال ورضع',
      sportsFitness: 'رياضة ولياقة',
      homeKitchen: 'المنزل والمطبخ',
      beautyPersonalCare: 'الجمال',
      fragrance: 'العطور',
      shoes: 'أحذية',
      bagsLuggage: 'حقائب',
      jewelryWatches: 'مجوهرات',
      books: 'كتب',
      toysGames: 'ألعاب',
      automotive: 'سيارات',
      phonesTablets: 'هواتف',
      computers: 'كمبيوتر',
      cameras: 'كاميرات',
      furniture: 'أثاث',
      homeDecor: 'ديكور',
      gardenOutdoor: 'حدائق',
      healthWellness: 'صحة',
      groceryFood: 'بقالة',
      petSupplies: 'حيوانات أليفة',
      officeSupplies: 'مكتبية',
      toolsHardware: 'أدوات',
      musicalInstruments: 'موسيقى',
      artCrafts: 'فنون',
      partySupplies: 'حفلات',
      babyCare: 'رعاية الطفل'
    }
  };
  const t = (key) => translations[language]?.[key] || key;
  return { language, t };
};

// Auth hook placeholder
const useAuth = () => {
  const token = localStorage.getItem('token');
  return { token };
};

const HomePage = ({ ProductCardComponent, ProductSkeletonComponent, HeroSectionComponent }) => {
  const [products, setProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const { t } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all product sections
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(Array.isArray(res.data) ? res.data : res.data.products || []))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/daily-deals`)
      .then(res => setDailyDeals(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/trending`)
      .then(res => setTrending(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/best-sellers`)
      .then(res => setBestSellers(res.data))
      .catch(err => console.error(err));
    
    if (token) {
      axios.get(`${API_URL}/api/products/recommended`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRecommended(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  const categories = [
    { name: t('electronics'), icon: '📱', category: 'Electronics', img: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=400&h=300' },
    { name: t('mensFashion'), icon: '👔', category: 'MensFashion', img: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400&h=300' },
    { name: t('womensFashion'), icon: '👗', category: 'WomensFashion', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300' },
    { name: t('kidsBaby'), icon: '👶', category: 'KidsBaby', img: 'https://images.pexels.com/photos/255514/pexels-photo-255514.jpeg?w=400&h=300' },
    { name: t('sportsFitness'), icon: '⚽', category: 'SportsFitness', img: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=400&h=300' },
    { name: t('homeKitchen'), icon: '🏠', category: 'HomeKitchen', img: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=400&h=300' },
    { name: t('beautyPersonalCare'), icon: '💄', category: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
    { name: t('shoes'), icon: '👟', category: 'Shoes', img: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?w=400&h=300' },
    { name: t('jewelryWatches'), icon: '⌚', category: 'Jewelry', img: 'https://images.pexels.com/photos/6662322/pexels-photo-6662322.jpeg?w=400&h=300' },
    { name: t('books'), icon: '📚', category: 'Books', img: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?w=400&h=300' },
    { name: t('toysGames'), icon: '🎮', category: 'Toys', img: 'https://images.pexels.com/photos/168866/pexels-photo-168866.jpeg?w=400&h=300' },
    { name: t('automotive'), icon: '🚗', category: 'Automotive', img: 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?w=400&h=300' },
  ];

  // Use passed components or fallback to lazy loaded
  const ProductCardEl = ProductCardComponent;
  const ProductSkeletonEl = ProductSkeletonComponent;
  const HeroSectionEl = HeroSectionComponent;

  return (
    <div>
      {/* Hero Section */}
      {HeroSectionEl && <HeroSectionEl />}

      {/* Daily Deals */}
      {dailyDeals.length > 0 && (
        <section className="py-12 bg-red-50 dark:bg-red-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 text-red-600 dark:text-red-300">⚡ {t('dailyDeals')} ⚡</h2>
              <p className="text-gray-600 dark:text-gray-300">{t('limitedOffer')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {dailyDeals.slice(0, 4).map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative">
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    {product.discount_percent}% {t('discount')}
                  </div>
                  <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">{product.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-red-600">${product.price}</span>
                      <span className="text-sm line-through text-gray-400">${product.original_price}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                    >
                      {t('shopNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Products */}
      {recommended.length > 0 && ProductCardEl && (
        <section className="py-12 bg-purple-50 dark:bg-purple-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 dark:text-white">💎 {t('recommendedForYou')} 💎</h2>
              <p className="text-gray-600 dark:text-gray-300">Based on your interests</p>
            </div>
            <Slider {...sliderSettings}>
              {recommended.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCardEl product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">{t('trendingNow')}</h2>
            <p className="text-gray-600">{t('freshPicks')}</p>
          </div>

          {products.length > 0 && ProductCardEl ? (
            <Slider {...sliderSettings}>
              {products.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCardEl product={product} />
                </div>
              ))}
            </Slider>
          ) : ProductSkeletonEl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <ProductSkeletonEl key={idx} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('shopByCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/products?category=${cat.category}`}
                className="group relative h-40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                data-testid={`category-${cat.category}`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cat.img})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                  <span className="text-5xl mb-2 drop-shadow-lg">{cat.icon}</span>
                  <h3 className="text-sm font-bold text-center drop-shadow-lg">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && ProductCardEl && (
        <section className="py-12 bg-yellow-50 dark:bg-yellow-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 dark:text-white">🏆 {t('bestSellers')} 🏆</h2>
              <p className="text-gray-600 dark:text-gray-300">Most popular products</p>
            </div>
            <Slider {...sliderSettings}>
              {bestSellers.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCardEl product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
