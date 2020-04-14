const express = require('express');
const app = express();

const dotenv = require('dotenv');
// const logger = require('./middleware/logger'); // Simple middleware for testing purposes
const morgan = require('morgan');

// Load config
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  )
);
