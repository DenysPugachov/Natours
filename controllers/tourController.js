const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")

//querying by certain params (often) => use alias route
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "price,-ratingAverage"
  req.query.fields = "name,price,ratingsAverage,summary,difficulty"
  next()
}

// Aggregation pipe line (create statistics)
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //specify field to group to
        _id: { $toUpper: "$difficulty" },
        //fields to be displayed
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      // sort previous document (pipeline)
      $sort: { avgPrice: 1 }, // 1 => ascending order
    },
    // {
    // $match: { _id: { $ne: "EASY" } }, // all docs (not easy => "$ne")
    // },
  ])
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  })
})

//get number of tours in month of given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
    {
      //разматывать
      $unwind: "$startDates",
    },
    {
      // define what to select
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //first day of the year
          $lte: new Date(`${year}-12-31`), // last day or the year
        },
      },
    },
    {
      $group: {
        //what to use for grouping documents(month)
        _id: { $month: "$startDates" },
        //how many tours starts in that month
        numToursInThisMonth: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0, // 0 => hide field
      },
    },
    {
      $sort: {
        numToursInThisMonth: -1,
      },
    },
    {
      $limit: 6, // limit outputs to 6
    },
  ])

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  })
})

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, { path: "reviews" })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate()
//   const tours = await features.query
//   //SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       tours,
//     },
//   })
// })

// exports.getTour = catchAsync(async (req, res, next) => {
//   //findById = Tour.findOne({_id: req.params.id}) => one of the documents
//   const tour = await Tour.findById(req.params.id).populate("reviews")
//   if (!tour) {
//     // tour = null(id schema match but ID NOT exist)
//     return next(new AppError("No tour found with that ID", 404))
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   })
// })

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, //validators should run again
//     runValidators: true, //use validator from tourModel
//   })

//   if (!tour) {
//     // tour = null(id schema match but ID NOT exist)
//     return next(new AppError("No tour found with that ID", 404))
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   })
// })

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id)

//   if (!tour) {
//     // tour = null(id schema match but ID NOT exist)
//     return next(new AppError("No tour found with that ID", 404))
//   }
//   //204=> no content
//   res.status(204).json({
//     status: "success",
//     data: null, // null => data no longer exist
//   })
// })

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body)
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   })
// })
