const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")

exports.getOverview = catchAsync(async (req, res, next) => {
  //1. Get tour data form Collection
  const tours = await Tour.find()

  //2. Build template
  //3. Render template with tour-data form 1.
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get data for requested tour (including review and tour guides)
  const tour = await Tour.findOne(req.params).populate({
    path: "reviews",
    fields: "review, rating, user",
  })

  console.log("\n=================", "tour=", tour, req.params)
  // 2. Build template
  // 3. Render template using data from step 1.
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  })
})
