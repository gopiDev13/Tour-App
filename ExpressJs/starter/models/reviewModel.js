/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    reftoTour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour '],
    },

    reftoUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user '],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.index(
  {
    reftoTour: 1,
    reftoUser: 1,
  },
  {
    unique: true,
  },
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reftoUser',
    select: 'name photo',
  });
  next();
});
reviewSchema.statics.calculateRatingsAverage = async function (tourID) {
  const stats = await this.aggregate([
    {
      $match: {
        reftoTour: tourID,
      },
    },
    {
      $group: {
        _id: '$reftoTour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: stats[0].avgRatings,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calculateRatingsAverage(this.reftoTour);
});
/*FindByIdAndUpdate and Delete is a short hand property of findOneAndUpdate or Delete
Here we assigning the current reviwe to r property.
because we need to use this in post middleware.
In post middleware we cannot get the current doucument.
the reason we use like this is we need to get the tour id from the current review document.
*/
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calculateRatingsAverage(this.r.reftoTour);
});
const Reviews = mongoose.model('Reviews', reviewSchema);
module.exports = Reviews;
