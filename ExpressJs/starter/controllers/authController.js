/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');
const { version } = require('os');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '5d',
  });
const createTokenandSendRespsone = (statusCode, user, res, message) => {
  const token = createToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: { user, message: message },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const createdUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    passwordChangedDate: req.body.passwordChangedDate,
  });
  createTokenandSendRespsone(
    201,
    createdUser,
    res,
    'User signed in successfully',
  );
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  /* Check If email and password is exist */
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  /* Check if the user exits in our DB */
  const user = await User.findOne({
    email: email,
  }).select('+password');

  if (!user || !(await user.comparingPasswords(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  createTokenandSendRespsone(200, user, res, 'User logged in successfully');
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.tokenVerification = catchAsync(async (req, res, next) => {
  //Check For token Whether it's exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError('You are not logged in! please login to access', 401),
    );
  //Verfiy Token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  //Check User exists for this token
  const verifiedUser = await User.findById(decodedToken.id);
  if (!verifiedUser)
    return next(
      new AppError('The user belongs to this token is no longer exists', 401),
    );
  console.log(decodedToken);
  //Check Whether Password changed after token issued
  if (verifiedUser.checkPassWordChange(decodedToken.iat)) {
    return next(
      new AppError('User changed password recently.Please log in again', 401),
    );
  }
  req.user = verifiedUser;
  res.locals.user = verifiedUser;

  next();
});

exports.isLoggedUser = async (req, res, next) => {
  //Check For token Whether it's exists
  if (req.cookies.jwt) {
    try {
      //Verfiy Token
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      //Check User exists for this token
      const verifiedUser = await User.findById(decodedToken.id);
      if (!verifiedUser) return next();
      //Check Whether Password changed after token issued
      if (verifiedUser.checkPassWordChange(decodedToken.iat)) {
        return next();
      }
      res.locals.user = verifiedUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.checkPermission =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Check whether the given email id exists
  if (!req.body.email) {
    return next(new AppError('Please provide us E-mail-ID', 404));
  }
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError('There is no user with this email id', 404));
  }
  //Generate Token
  const resetToken = user.createResetPasswordToken();
  await user.save({
    validateBeforeSave: false,
  });
  //Send E-Mail to the user
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/${resetToken}`;
  const message = `Forgot your password ? Submit a Patch request
                   with your new password and password confirmation to  : ${resetUrl}.
                   If you didn't forgot your password,please ignore this email `;
  try {
    await sendMail({
      email: user.email,
      subject: 'Password reset link (Expires in 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email',
    });
  } catch (err) {
    user.passWordResetToken = undefined;
    user.passWordResetTokenExpriesIn = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(
      new AppError(
        'There was an error sending the email.please try again later',
        500,
      ),
    );
  }
});
exports.resetToken = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const verifiedUser = await User.findOne({
    passWordResetToken: hashedToken,
    passWordResetTokenExpriesIn: { $gt: Date.now() },
  });
  //Check whether token expires. If not set the new password
  if (!verifiedUser) {
    return next(new AppError('Token invalid or token expries', 400));
  }
  verifiedUser.password = req.body.password;
  verifiedUser.passwordConfirmation = req.body.passwordConfirmation;
  verifiedUser.passWordResetToken = undefined;
  verifiedUser.passWordResetTokenExpriesIn = undefined;
  await verifiedUser.save();

  //Update passwordChangedAt property for the user
  //Log the user
  createTokenandSendRespsone(
    200,
    verifiedUser,
    res,
    'User logged in successfully',
  );
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get the user from collection

  const user = await User.findById(req.user.id).select('+password');
  //Check if posted password is correct
  if (
    !user ||
    !(await user.comparingPasswords(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Incorrect password', 403));
  }

  //Update the password
  user.password = req.body.newPassword;
  user.passwordConfirmation = req.body.passwordConfirmation;
  await user.save({ validateBeforeSave: false });
  //Logged in and the sent the token
  createTokenandSendRespsone(200, user, res, 'User logged in successfully');
});
