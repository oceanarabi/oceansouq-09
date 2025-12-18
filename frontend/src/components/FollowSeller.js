import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FollowSeller = ({ sellerId, sellerName }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language') || 'en';

  const t = (key) => {
    const translations = {
      en: {
        follow: 'Follow',
        following: 'Following',
        followers: 'followers',
        unfollow: 'Unfollow',
        loginToFollow: 'Login to follow'
      },
      ar: {
        follow: 'متابعة',
        following: 'متابَع',
        followers: 'متابع',
        unfollow: 'إلغاء المتابعة',
        loginToFollow: 'سجل دخول للمتابعة'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    fetchFollowStatus();
    fetchFollowersCount();
  }, [sellerId]);

  const fetchFollowStatus = async () => {
    if (!token || !sellerId) return;
    try {
      const res = await axios.get(`${API_URL}/api/sellers/${sellerId}/is-following`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.following);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const fetchFollowersCount = async () => {
    if (!sellerId) return;
    try {
      const res = await axios.get(`${API_URL}/api/sellers/${sellerId}/followers`);
      setFollowersCount(res.data.followers_count || 0);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleFollow = async () => {
    if (!token) {
      alert(t('loginToFollow'));
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API_URL}/api/sellers/${sellerId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await axios.post(`${API_URL}/api/sellers/${sellerId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
          isFollowing
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600'
            : 'bg-ocean-600 hover:bg-ocean-700 text-white'
        } disabled:opacity-50`}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : isFollowing ? (
          <>
            <span>✓</span>
            <span>{t('following')}</span>
          </>
        ) : (
          <>
            <span>+</span>
            <span>{t('follow')}</span>
          </>
        )}
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {followersCount.toLocaleString()} {t('followers')}
      </span>
    </div>
  );
};

export default FollowSeller;
