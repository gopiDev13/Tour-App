/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

/* Function to get top 5 cheapest tour */
exports.aliasCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,duration,difficulty,price';
  next();
};

/* Function to get all tours */
exports.getAllTours = factory.getAll(Tour);
/* Function to create tour */
exports.createTour = factory.create(Tour);
/* Function to get tour */
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
/* Function to update tour */
exports.updateTour = factory.update(Tour);
/* Function to delete tour */
exports.deleteTour = factory.delete(Tour);

/* Function to get Tour stats */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
  ]);
  console.log(stats, 'STATS');
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});
exports.getBusiestMonthOfTours = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTousPerMonth: { $sum: 1 },
        tourNames: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTousPerMonth: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new AppError('please provide longitude and latitude', 400));
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json({
    status: 'success',
    count: tours.length,
    results: tours,
  });
});
exports.getToursDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(new AppError('please provide longitude and latitude', 400));
  }
  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'Distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        Distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    count: tours.length,
    results: tours,
  });
});
