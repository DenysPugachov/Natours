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

exports.getTour = (req, res) => {
  res.status(200).render("tour", {
    title: "The Forest Hiker",
  })
}
