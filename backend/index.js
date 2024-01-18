//import express  from 'express';

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: "http://localhost:3001",
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/product_transaction', { useNewUrlParser: true, useUnifiedTopology: true });

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  sold: Number,
  image: String,
  dateOfSale: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/api/init-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.insertMany(transactions);

    res.json({ message: 'Database initialized with seed data.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.get('/api/transactions', async (req, res) => {
    const { page = 1, per_page = 10, search = '', month } = req.query;
    const filter = {};
  
    if (month) {
      const startDate = new Date(`${month} 01`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
  
      filter.dateOfSale = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { price: { $regex: new RegExp(search, 'i') } },
      ];
    }
  
    try {
      const totalRecords = await Transaction.countDocuments(filter);
      const transactions = await Transaction.find(filter)
        .skip((page - 1) * per_page)
        .limit(parseInt(per_page));
  
      res.json({ transactions, total_count: totalRecords });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;
    const filter = {};
  
    if (month) {
      const startDate = new Date(`${month} 01`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
  
      filter.dateOfSale = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  
    try {
      const totalSaleAmount = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: '$price' } } },
      ]);
  
      const totalSoldItems = await Transaction.countDocuments({ ...filter, sold: { $gt: 0 } });
  
      const totalNotSoldItems = await Transaction.countDocuments({ ...filter, sold: 0 });
  
      res.json({
        totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
        totalSoldItems,
        totalNotSoldItems,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;
    const filter = {};
  
    if (month) {
      const startDate = new Date(`${month} 01`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
  
      filter.dateOfSale = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  
    try {
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Number.MAX_SAFE_INTEGER }, // 'above' range
      ];
  
      const barChartData = [];
  
      for (const range of priceRanges) {
        const count = await Transaction.countDocuments({
          ...filter,
          price: { $gte: range.min, $lte: range.max },
        });
  
        barChartData.push({
          priceRange: `${range.min} - ${range.max === Number.MAX_SAFE_INTEGER ? 'above' : range.max}`,
          itemCount: count,
        });
      }
  
      res.json(barChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;
    const filter = {};
  
    if (month) {
      const startDate = new Date(`${month} 01`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
  
      filter.dateOfSale = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  
    try {
      const categoryCounts = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
  
      const pieChartData = categoryCounts.map((entry) => ({
        category: entry._id,
        itemCount: entry.count,
      }));
  
      res.json(pieChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

app.get('/api/combined-data', async (req, res) => {
    const { month } = req.query;
  
    try {
      const [transactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/transactions?month=${month}`),
        axios.get(`http://localhost:3000/api/statistics?month=${month}`),
        axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
        axios.get(`http://localhost:3000/api/pie-chart?month=${month}`),
      ]);
  
      const combinedData = {
        transactions: transactionsResponse.data,
        statistics: statisticsResponse.data,
        barChart: barChartResponse.data,
        pieChart: pieChartResponse.data,
      };
  
      res.json(combinedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  
  
