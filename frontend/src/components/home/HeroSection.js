import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { useLanguage } from '../../contexts';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
    },
    {
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      title: language === 'ar' ? 'تقنية وإلكترونيات' : 'Tech & Electronics',
      subtitle: language === 'ar' ? 'أحدث الأجهزة والتقنيات' : 'Latest gadgets and devices',
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
      title: language === 'ar' ? 'أزياء وموضة' : 'Fashion & Style',
      subtitle: language === 'ar' ? 'أحدث صيحات الموضة' : 'Trending styles for everyone',
    },
  ];

  return (
    <div className="relative">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx} className="relative">
            <div 
              className="h-[280px] sm:h-[350px] md:h-[500px] bg-cover bg-center relative" 
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 flex items-center justify-center">
                <div className="text-center text-white px-6 md:px-4 max-w-2xl">
                  <h2 
                    className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 leading-tight" 
                    data-testid="hero-title"
                  >
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => navigate('/products')}
                      className="touch-btn touch-btn-primary text-sm md:text-lg"
                      data-testid="shop-now-btn"
                    >
                      {t('shopNow')}
                    </button>
                    <button
                      onClick={() => navigate('/about')}
                      className="touch-btn touch-btn-secondary text-sm md:text-lg"
                    >
                      {t('learnMore')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <style>{`
        .slick-dots {
          bottom: 16px !important;
        }
        .slick-dots li button:before {
          color: white !important;
          opacity: 0.5 !important;
          font-size: 10px !important;
        }
        .slick-dots li.slick-active button:before {
          opacity: 1 !important;
        }
        @media (max-width: 640px) {
          .slick-dots li {
            margin: 0 3px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
