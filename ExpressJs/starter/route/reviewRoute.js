const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router({
  mergeParams: true,
});

Router.route('/')
  .get(reviewController.getReview)
  .post(
    authController.tokenVerification,
    authController.checkPermission('user'),
    reviewController.checkForTourAndUserIDs,
    reviewController.createReview,
  );
Router.route('/:id')
  .get(reviewController.getReviewById)
  .delete(
    authController.tokenVerification,
    authController.checkPermission('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.tokenVerification,
    authController.checkPermission('user', 'admin'),
    reviewController.updateReview,
  );
module.exports = Router;
