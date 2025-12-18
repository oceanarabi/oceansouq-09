import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LoyaltyBadge = () => {
  const [points, setPoints] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/loyalty/points`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPoints(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  if (!points) return null;

  const tierColors = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-600'
  };

  return (
    <div className={`${tierColors[points.tier]} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
      <span>⭐</span>
      <span>{points.points}</span>
    </div>
  );
};

export default LoyaltyBadge;
