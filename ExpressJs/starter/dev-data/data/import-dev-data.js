/* eslint-disable import/no-unresolved */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });
/* For Running Server 8*/
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully');
  })
  .catch((err) => {
    console.log('Mongo DB error', err);
  });

const tour = JSON.parse(fs.readFileSync('./dev-data/data/tours.json'));
const review = JSON.parse(fs.readFileSync('./dev-data/data/reviews.json'));
const users = JSON.parse(fs.readFileSync('./dev-data/data/users.json'));

const importTour = async () => {
  try {
    await Tour.create(tour);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(review);

    console.log('Data import successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteTour = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('datas successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importTour();
} else if (process.argv[2] === '--delete') {
  deleteTour();
}
