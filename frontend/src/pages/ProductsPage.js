import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Language hook placeholder
const useLanguage = () => {
  const language = localStorage.getItem('language') || 'en';
  const translations = {
    en: {
      allProducts: 'All Products',
      filters: 'Filters',
      sortBy: 'Sort By',
      newest: 'Newest',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      mostPopular: 'Most Popular',
      priceRange: 'Price Range',
      brand: 'Brand',
      clearFilters: 'Clear Filters',
      showing: 'Showing',
      results: 'results',
      loadMore: 'Load More',
      noMoreProducts: 'No more products to load'
    },
    ar: {
      allProducts: 'جميع المنتجات',
      filters: 'الفلاتر',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      priceLowToHigh: 'السعر: من الأقل للأعلى',
      priceHighToLow: 'السعر: من الأعلى للأقل',
      mostPopular: 'الأكثر شعبية',
      priceRange: 'نطاق السعر',
      brand: 'العلامة التجارية',
      clearFilters: 'مسح الفلاتر',
      showing: 'عرض',
      results: 'نتيجة',
      loadMore: 'تحميل المزيد',
      noMoreProducts: 'لا توجد منتجات أخرى'
    }
  };
  const t = (key) => translations[language]?.[key] || key;
  return { language, t };
};

const ProductsPage = ({ ProductCardComponent }) => {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const location = window.location;
  const productsPerPage = 12;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const categoryParam = params.get('category') || '';
    
    setSearch(searchParam);
    setCategory(categoryParam);
    setPage(1);
    
    const apiParams = new URLSearchParams();
    if (searchParam) apiParams.append('search', searchParam);
    if (categoryParam) apiParams.append('category', categoryParam);
    
    axios.get(`${API_URL}/api/products?${apiParams.toString()}&limit=100`)
      .then(res => {
        // API returns array directly or { products: [], total: n }
        let allProducts = Array.isArray(res.data) ? res.data : (res.data.products || []);
        
        // Apply filters
        if (selectedBrand) {
          allProducts = allProducts.filter(p => p.brand === selectedBrand);
        }
        allProducts = allProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
        
        // Apply sorting
        const filtered = sortProducts(allProducts, sortBy);
        
        setProducts(filtered);
        setDisplayedProducts(filtered.slice(0, productsPerPage));
        setHasMore(filtered.length > productsPerPage);
      })
      .catch(err => console.error('Error fetching products:', err));
  }, [location.search, sortBy, priceRange, selectedBrand]);
  
  const sortProducts = (prods, sort) => {
    const sorted = [...prods];
    switch(sort) {
      case 'priceLow':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceHigh':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };
  
  const loadMore = () => {
    const nextPage = page + 1;
    const start = nextPage * productsPerPage;
    const newProducts = products.slice(0, start);
    setDisplayedProducts(newProducts);
    setPage(nextPage);
    setHasMore(products.length > start);
  };

  const ProductCardEl = ProductCardComponent;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold dark:text-white">{t('allProducts')}</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden bg-ocean-600 text-white px-4 py-2 rounded-lg"
        >
          {t('filters')} ☰
        </button>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-4 dark:text-white">{t('filters')}</h3>
            
            {/* Sort By */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="newest">{t('newest')}</option>
                <option value="priceLow">{t('priceLowToHigh')}</option>
                <option value="priceHigh">{t('priceHighToLow')}</option>
                <option value="popular">{t('mostPopular')}</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('priceRange')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Min"
                />
                <span className="dark:text-white">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Max"
                />
              </div>
            </div>
            
            {/* Brand Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('brand')}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">All Brands</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
              </select>
            </div>
            
            <button 
              onClick={() => {
                setSortBy('newest');
                setPriceRange([0, 10000]);
                setSelectedBrand('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg"
            >
              {t('clearFilters')}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('showing')} {displayedProducts.length} {t('results')}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              ProductCardEl ? <ProductCardEl key={product.id} product={product} /> : (
                <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                  <h3>{product.title}</h3>
                  <p>${product.price}</p>
                </div>
              )
            ))}
          </div>

          {displayedProducts.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-12">No products found</p>
          )}
          
          {/* Load More Button */}
          {hasMore && displayedProducts.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                {t('loadMore')}
              </button>
            </div>
          )}
          
          {!hasMore && displayedProducts.length > 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noMoreProducts')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
