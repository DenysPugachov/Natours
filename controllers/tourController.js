const Tour = require("../models/tourModel")
const AppError = require("../utils/appError")
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

// ... /tours-within/:distance/center/:latlng/:unit",
// .../tours-within/250/center/34.07250417478967, -118.29915810932668/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(",")
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1 // calculate "radiance" with ears radius(mile or km)

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng",
        400,
      ),
    )
  }

  console.log("\n==========\n ", distance, latlng, unit)

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }) //$geoWithin -> finds coord in certain distance

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { data: tours },
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(",")
  const multiplier = unit === "mi" ? 0.000621371 : 0.001

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng",
        400,
      ),
    )
  }

  const distances = await Tour.aggregate([
    // $geoNear needs to be the first stage
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1], // *1 convert to number
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      // $project stage => filtering showing fields
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])

  res.status(200).json({
    status: "success",
    data: { data: distances },
  })
})
