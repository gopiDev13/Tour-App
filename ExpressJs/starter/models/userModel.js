/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    maxLength: 20,
    minLength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
    email: true,
  },
  phone: {
    type: String,
    required: true,
    maxLength: 20,
    minLength: 8,
  },
  photo: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide password'],
    minLength: [8, 'Password must contain atleast 8 characters'],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: true,
    validate: {
      //Only works on save and create
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords doesn't macth",
    },
  },
  passwordChangedDate: {
    type: Date,
    default: null,
  },
  passWordResetToken: {
    type: String,
    default: null,
  },
  passWordResetTokenExpriesIn: {
    type: Date,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  //Only runs when passwords is actually modified
  if (!this.isModified('password')) {
    return next();
  }

  //Hashing Password
  this.password = await bcrypt.hash(this.password, 12);
  //Delete confirm password
  this.passwordConfirmation = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedDate = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({
    active: { $ne: false },
  });
  next();
});
userSchema.methods.comparingPasswords = async function (
  PasswordFromclient,
  PasswordFromDBUser,
) {
  return await bcrypt.compare(PasswordFromclient, PasswordFromDBUser);
};
userSchema.methods.checkPassWordChange = function (JwtIst) {
  if (this.passwordChangedDate) {
    const convertedPwdChangeDate = parseInt(
      this.passwordChangedDate.getTime() / 1000,
      10,
    );
    return JwtIst < convertedPwdChangeDate;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passWordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passWordResetTokenExpriesIn = Date.now() + 10 * 60 * 1000;
  console.log(
    resetToken,
    this.passWordResetToken,
    this.passWordResetTokenExpriesIn,
  );
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
