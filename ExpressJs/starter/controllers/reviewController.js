const review = require('../models/reviewModel');
const factory = require('./factoryHandler');

exports.checkForTourAndUserIDs = (req, res, next) => {
  if (!req.body.reftoTour) req.body.reftoTour = req.params.tourId;
  if (!req.body.reftoUser) req.body.reftoUser = req.user.id;
  next();
};
exports.getReview = factory.getAll(review);

exports.getReviewById = factory.getOne(review);

exports.createReview = factory.create(review);

exports.updateReview = factory.update(review);

exports.deleteReview = factory.delete(review);
