const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeature');

/* This function can be used for any Model to delete their document */
exports.delete = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('Cannot find document for given ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/* This function can be used for any Model to update their document */

exports.update = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError('Cannot find document for given ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.create = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: `Document has been created`,
      data: {
        document,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    res.status(200).json({
      status: 'success',
      data: { document },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //Small hack to get Reviews by nested route
    let filter = {};
    if (req.params.tourId) filter = { reftoTour: req.params.tourId };
    const feature = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .limiting()
      .pagination();

    const document = await feature.query;

    res.status(200).json({
      status: 'success',
      count: document.length,
      data: { document },
    });
  });
