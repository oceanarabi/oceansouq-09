import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="h-64 skeleton"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton rounded w-3/4"></div>
        <div className="h-4 skeleton rounded w-full"></div>
        <div className="h-4 skeleton rounded w-5/6"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 skeleton rounded w-20"></div>
          <div className="h-6 skeleton rounded w-16"></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 skeleton rounded"></div>
          <div className="flex-1 h-10 skeleton rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
