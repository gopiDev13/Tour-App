const AppError = require('../utils/appError');

const handleErrorDB = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (error) => {
  const value = error.errmsg.match(/"([^"]*)"/)[0];
  const message = `Duplicate field value : ${value}. please use another value`;
  return new AppError(message, 400);
};
const handleTokenExpiredError = () =>
  new AppError('Token expired. Please login');
const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data : ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () =>
  new AppError('Invalid token. please login again!', 401);
const sendErrDev = (err, req, res) => {
  //API ERROR HANDLING
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  } else {
    //WEBSITE ERROR PAGE
    res.status(404).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrProd = (err, req, res) => {
  //ERROR FOR API
  if (req.originalUrl.startsWith('/api')) {
    //Used for operational errors and trusted errors
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong',
    });
  }
  //ERROR FOR WEBSITE
  //Used for operational errors and trusted errors
  if (err.isOperational) {
    return res.status(404).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  return res.status(404).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'fail';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'developement') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') {
      error = handleErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    sendErrProd(error, req, res);
  }
};
