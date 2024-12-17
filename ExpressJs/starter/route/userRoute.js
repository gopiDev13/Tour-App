const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const UserRouter = express.Router();
UserRouter.post('/signup', authController.signUp);
UserRouter.post('/login', authController.login);
UserRouter.get('/logout', authController.logout);
UserRouter.post('/forgot-password', authController.forgotPassword);
UserRouter.patch('/reset-password/:token', authController.resetToken);

UserRouter.use(authController.tokenVerification); //For Authentication

UserRouter.patch('/update-password', authController.updatePassword);
UserRouter.patch(
  '/update-user',
  userController.uploadPhotos,
  userController.updateCurrentUser,
);
UserRouter.delete('/deactivate-user', userController.deleteCurrentUser);
UserRouter.get('/getme', userController.getMe, userController.getUser);

UserRouter.use(authController.checkPermission('admin'));
UserRouter.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
UserRouter.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = UserRouter;
