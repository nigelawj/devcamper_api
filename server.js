const express = require('express');
const app = express().use(express.json());

const dotenv = require('dotenv');
// const logger = require('./middleware/logger'); // Simple middleware for testing purposes
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const colors = require('colors');
const fileupload = require('express-fileupload');
const path = require('path');

// Load config
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use(errorHandler);

// Connect to DB
connectDB();

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  )
);
