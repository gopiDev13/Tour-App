/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must contain a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must contain character below 40'],
      minlength: [5, 'A tour must contain character above 5'],
      // validate: [validate.isAlpha, 'Tour name must be alphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must contain a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must contain a group size'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must easy,medium & difficult',
      },
      required: [true, 'A tour must contain a difficult'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must contain a price'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1'],
      max: [5, 'Ratings must be below 5'],
      set: function (val) {
        // Only round if val is a valid number
        if (typeof val === 'number') {
          return Math.round(val * 10) / 10;
        }
        return val; // Return the original value if it's not a number
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this is only points to current doc on new document creation
          return val < this.price;
        },
        message: 'Price Discount must be less than Price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must contain a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must contain a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    vipTours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});
tourSchema.index({
  slug: 1,
});
tourSchema.index({
  startLocation: '2dsphere',
});
// eslint-disable-next-line prefer-arrow-callback
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Reviews',
  foreignField: 'reftoTour',
  localField: '_id',
});
//Document Middleware can be used in actions like save and create. Contains Pre and Post Hooks.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//Commenting Because we can use parent refrencing instead of this
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
//Query MiddleWare can be used in actions like find etc
tourSchema.pre(/^find/, function (next) {
  this.find({
    vipTours: { $ne: true },
  });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select:
      '-__v -passwordChangedDate -passWordResetToken -passWordResetTokenExpriesIn',
  });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});
//Aggregate Middleware
// tourSchema.pre('aggregate', function (next) {
//   console.log(this.pipeline());
//   this.pipeline().unshift({
//     $match: { vipTours: { $ne: true } },
//   });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
