
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import DataTable from './table';
import { Container } from '@mui/material';
import backgroundImage from '../assets/sales-tracking.png'
import Card from './Card';
import { FcNext } from "react-icons/fc";
import { FcPrevious } from "react-icons/fc";
import {Link }from 'react-router-dom';
import Contact from '../pages/Contact';
import About from '../pages/About';


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
  const [currentChart, setCurrentChart] = useState()
  const [currentPieChart, setCurrentPieChart] = useState()
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/transactions?page=${page}&per_page=${perPage}&search=${search}&month=${selectedMonth}`);
        setTransactions(response.data.transactions);
        
        if (response.data.transactions){
          const pieChartData = response.data.transactions.reduce((acc, item) => {return {...acc, [item.category]: (acc[item.category] || 0) + 1} }, {})
          renderPieChart(pieChartData)
        }
      
        setTotalCount(response.data.total_count);
      } catch (error) {
        console.error(error);
      }
    };

      const fetchBarChartData = async () => {
        try {
          const response = await axios.get(`https://transactiondashboard-production.up.railway.app/api/bar-chart?month=${selectedMonth}`);
          setBarChartData(response.data);
          renderBarChart(response.data);
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
  
  const renderBarChart = (barChartData) => {
    if (currentChart){
      currentChart.destroy()
    }
    const ctx = document.getElementById('barChart');
    
    const myChart =  new Chart(ctx, {
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

    setCurrentChart(myChart)
  };
  const renderPieChart = (barChartData) => {
    if (currentPieChart){
      currentPieChart.destroy()
    }
  console.log(
    barChartData
  )
    
    const ctx = document.getElementById('pieChart');
    
    const myChart =  new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(barChartData),
        datasets: [
          {
            label: 'Number of Items',
            data: Object.values(barChartData),
            // backgroundColor: 'rgba(75, 192, 192, 0.2)',
            // borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
    });
   

    setCurrentPieChart(myChart)
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
   
    <div className='flex flex-col items-center justify-items-center bg-slate-200'>
      <div className="flex justify-between items-center w-11/12 max-w-[1160px] py-4 mx-auto">
      <Link to="/">
        <h1 className='font-semibold italic'>SalesTracker</h1>
      </Link>

      <nav>
        <ul className="flex gap-x-6 text-richblack-100">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
      </div>
      <div class="flex justify-center items-center w-screen h-screen bg-cover bg-center min-h-screen" style={{backgroundImage: `url(${backgroundImage})`, opacity: 0.8}}>
    <div class="text-center">
    <h1 class="text-5xl font-bold mb-4">Welcome to our Sales Tracker</h1>
    <p class="text-lg text-gray-700 mb-6">Where Growth Begins!</p>
    <p class="text-lg text-gray-800 mb-4">Dive into insightful analytics, streamline your sales process, and watch your business soar.</p>
    <p class="text-lg text-gray-800 mb-4">Get ready to revolutionize the way you track and boost your sales.</p>
    <p class="text-lg text-gray-800">Welcome aboard!</p>
  </div>
</div>

      <div className='flex justify-center m-4 p-4 text-2xl'>
        
        <label className=' font-semibold text-cyan-500'>Select Month :  </label>
        <select className='border-2 mx-2' value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div >
        

        <label className='px-2 mx-2 font-semibold'>Search Transactions:</label>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 mx-2 rounded shadow-md' onClick={handleSearch}>Search</button>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md ' onClick={handleClearSearch}>Clear Search</button>
      </div>
      <div className='flex flex-col items-center m-4 rounded-md p-2 m-2 shadow-lg justify-center md-relative'>
      <DataTable data={transactions}/>
        <div className='flex flex-col shadow-md m-4 p-4 rounded-md'>
          <h2 className='text-xl font-semibold'>Transactions Statistics:</h2>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
        
        
        <p className='font-semibold '>Total Count: {totalCount}</p>
        <div className='m-2 p-2 '>
        <button className='rounded shadow-md p-2 mx-2' onClick={handlePreviousPage}>
        <FcPrevious />         
          </button>
        <button className='rounded shadow-lg p-2 mx-2'  onClick={handleNextPage}>
        <FcNext />
          </button>
          </div>
      </div>
  
     
      
        
      <div className='flex flex-col shadow rounded-md mx-2 my-8 p-8'>
        <h2 className='text-xl font-semibold'>Transactions Bar Chart</h2>
        <canvas id="barChart" width="400" height="200"></canvas>
      </div>
      
      <div className='flex flex-col shadow rounded-md m-8 p-8'>
        <h2 className='text-xl font-semibold'>Transactions Pie Chart</h2>
        <canvas id="pieChart" width="400" height="200"></canvas>
      </div>
      
  
      
    </div>
   
  );
};

export default TransactionsTable;
