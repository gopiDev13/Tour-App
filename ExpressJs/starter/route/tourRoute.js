const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const TourRouter = express.Router();

TourRouter.use('/:tourId/reviews', reviewRouter);
/*
Reference 
Param Middleware to validate ID 
TourRouter.param('id', tourController.checkId);
*/
/* Better Way to write routes */
/* Router concept in Express.JS */
/* Here TourRouter is a middleware.It first looks for the url matching and call the Router function belongs to them */
TourRouter.route('/tour-stats').get(tourController.getTourStats);
TourRouter.route('/tour-busiest-month/:year').get(
  authController.tokenVerification,
  authController.checkPermission('admin', 'lead-guide', 'guide'),
  tourController.getBusiestMonthOfTours,
);

TourRouter.route('/top-5-cheapest-tour').get(
  tourController.aliasCheap,
  tourController.getAllTours,
);
TourRouter.route('/gettourswithin/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin,
);
TourRouter.route('/getdistance/:latlng/units/:unit').get(
  tourController.getToursDistance,
);
TourRouter.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.tokenVerification,
    authController.checkPermission('admin', 'lead-guide'),
    tourController.createTour,
  );
TourRouter.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.tokenVerification,
    authController.checkPermission('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.tokenVerification,
    authController.checkPermission('admin', 'lead-guide'),
    tourController.deleteTour,
  );
// TourRouter.route('/:tourId/reviews').post(
//   authController.tokenVerification,
//   authController.checkPermission('user'),
//   reviewController.createReview,
// );
module.exports = TourRouter;
