
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import DataTable from './table';
import { Container } from '@mui/material';

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
    <Container >
    <div>
      <div>
      <h1>Transactions Table</h1>
      </div>
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
      <div >
        <label>Search Transactions:</label>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClearSearch}>Clear Search</button>
      </div>
      <div>
        <Container sx={{width: "auto", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "10px"}}>
        <div>
          <h2>Transactions Statistics</h2>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
        </Container>
        <DataTable data={transactions}/>
        <p>Total Count: {totalCount}</p>
        <button onClick={handlePreviousPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>
      <Container>
        
      <div>
        <h2>Transactions Bar Chart</h2>
        <canvas id="barChart" width="400" height="200"></canvas>
      </div>
      
      <Container sx={{width: "auto", height: "100%", display: "flex", justifyContent: "left", alignItems: "left", margin: "10px"}}>
      <div>
        <h2>Transactions Pie Chart</h2>
        <canvas id="pieChart" width="400" height="200"></canvas>
      </div>
      </Container>
      </Container>
      
    </div>
    </Container>
  );
};

export default TransactionsTable;
