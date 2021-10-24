const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")

exports.getOverview = catchAsync(async (req, res, next) => {
  //1. Get tour data form Collection
  const tours = await Tour.find()
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
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  })
})
