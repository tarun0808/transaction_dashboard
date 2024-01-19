
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';


const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [statistics, setStatistics] = useState({});
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [barChartData, setBarChartData] = useState([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/transactions?page=${page}&per_page=${perPage}&search=${search}&month=${selectedMonth}`);
        setTransactions(response.data.transactions);
        setTotalCount(response.data.total_count);
      } catch (error) {
        console.error(error);
      }
    };

      const fetchBarChartData = async () => {
        try {
          const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/bar-chart?month=${selectedMonth}`);
          setBarChartData(response.data);
          renderBarChart();
        } catch (error) {
          console.error(error);
        }
      };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/statistics?month=${selectedMonth}`);
        setStatistics(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBarChartData();
    fetchTransactions();
    fetchStatistics();
  }, [page, perPage, search, selectedMonth]);

  const renderBarChart = () => {
    const ctx = document.getElementById('barChart');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: barChartData.map((data) => data.priceRange),
        datasets: [
          {
            label: 'Number of Items',
            data: barChartData.map((data) => data.itemCount),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
    });
  };


  const handleMonthChange = async (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    try {
      const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/transactions?page=${page}&per_page=${perPage}&search=${search}&month=${newMonth}`);
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/transactions?page=${page}&per_page=${perPage}&search=${search}&month=${selectedMonth}`);
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearSearch = async () => {
    setSearch('');
    try {
      const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/transactions?page=${page}&per_page=${perPage}&search=&month=${selectedMonth}`);
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div>
      <h1>Transactions Table</h1>
      <div>
        <label>Select Month:</label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Search Transactions:</label>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClearSearch}>Clear Search</button>
      </div>
      <div>
        <div>
          <h2>Transactions Statistics</h2>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold}</td>
                <td>{transaction.image}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Total Count: {totalCount}</p>
        <button onClick={handlePreviousPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>

      <div>
        <h2>Transactions Bar Chart</h2>
        <canvas id="barChart" width="400" height="200"></canvas>
      </div>
    </div>
  );
};

export default TransactionsTable;
