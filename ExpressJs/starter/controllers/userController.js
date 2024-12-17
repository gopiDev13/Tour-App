const multer = require('multer');
const user = require('../models/userModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

// const upload = multer({ dest: 'public/img/users' });
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Accept the image file
  } else {
    cb(new AppError('Not an image! Please upload an image.', 400), false); // Reject the file if not an image
  }
};
const upload = multer({
  storage: multerStorage, // Use `storage` as the key
  fileFilter: multerFilter, // `fileFilter` is used instead of `multerFilter`
});

exports.uploadPhotos = upload.single('photo');

const filterFields = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  //Check for any posted password in req.body
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'passwords cannot be updated in this route.Please use /update-password',
        400,
      ),
    );
  //Filter out the fields that are not to be updated
  const filteredObj = filterFields(req.body, 'name', 'email', 'phone');
  //Update the User
  const updatedUser = await user.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });
  //Response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
      message: 'User updated successfully',
    },
  });
});
exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await user.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(user);

exports.getUser = factory.getOne(user);

exports.createUser = factory.create(user);

exports.updateUser = factory.update(user);

exports.deleteUser = factory.delete(user);
