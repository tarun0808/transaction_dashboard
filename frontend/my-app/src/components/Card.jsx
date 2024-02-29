import React from 'react';

const Card = ({ month, totalSaleAmount, totalSoldItems, totalNotSoldItems }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">Transactions Statistics</div>
        <div className="text-gray-700 text-base">
          <p><span className="font-bold">Month:</span> {month}</p>
          <p><span className="font-bold">Total Sale Amount:</span> {totalSaleAmount}</p>
          <p><span className="font-bold">Total Sold Items:</span> {totalSoldItems}</p>
          <p><span className="font-bold">Total Not Sold Items:</span> {totalNotSoldItems}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
