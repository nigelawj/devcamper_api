const express = require('express');
const app = express();

const dotenv = require('dotenv');
// const logger = require('./middleware/logger'); // Simple middleware for testing purposes
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const colors = require('colors');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load config
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}
// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Sanitize Mongoose
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss());
// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10min
  max: 100,
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());
// Enable CORS
app.use(cors());
// File uploading
app.use(fileupload());
// Set Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/reviews', require('./routes/reviews'));
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
