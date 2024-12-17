/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const TourRouter = require('./route/tourRoute');
const UserRouter = require('./route/userRoute');
const ReviewRouter = require('./route/reviewRoute');
const viewRouter = require('./route/viewRoute');

const app = express();

//Using pug template for server side rendering

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));
/* Global MiddleWare */

//Set security header middleware

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://unpkg.com'], // Add other sources as needed
      imgSrc: [
        "'self'",
        'https://a.tile.openstreetmap.org',
        'https://b.tile.openstreetmap.org',
        'https://c.tile.openstreetmap.org',
        'data:',
      ],
      // styleSrc: ["'self'", 'https://unpkg.com'], // Add other sources as needed
      styleSrc: ["'self'", 'https://unpkg.com', 'https://fonts.googleapis.com'], // Allow Google Fonts
      fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Allow font files from Google
    },
  }),
);
//Development Logging Middleware

if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this Ip.please try again in a hour',
});
//Limiting Request Middleware
app.use('/api', limiter);
//Body parser to req.body middleware
app.use(express.json());
app.use(cookieParser());
//Data sanitization to prevent NOSQL injection
app.use(mongoSanitize());
//Data sanitize against XSS
app.use(xss());
//Prevent Parameter pollution like duplicate parameters
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
/*Routing
    app.HTTPMETHOD('FileName',(req,res)=>{

    });
*/
app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});
/* Calling all routes */
app.use('/', viewRouter);
app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/reviews', ReviewRouter);
/* For Handling Unwanted Routes */
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this server`, 404));
});

app.use(globalErrorController);
module.exports = app;
