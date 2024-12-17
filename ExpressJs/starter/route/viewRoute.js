const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedUser, viewController.getOverview);
viewRouter.use(
  '/tour/:slug',
  authController.isLoggedUser,
  viewController.getTourDetails,
);
viewRouter.get('/login', authController.isLoggedUser, viewController.login);
viewRouter.get(
  '/me',
  authController.tokenVerification,
  viewController.getUserDetails,
);

module.exports = viewRouter;
