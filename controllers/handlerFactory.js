const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if (!document) {
      // tour = null(id schema match but ID NOT exist)
      return next(new AppError("No document found with that ID", 404))
    }
    //204=> no content
    res.status(204).json({
      status: "success",
      data: null, // null => data no longer exist
    })
  })

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //validators should run again
      runValidators: true, //use validator from tourModel
    })

    if (!doc) {
      // tour = null(id schema match but ID NOT exist)
      return next(new AppError("No document found with that ID", 404))
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    })
  })

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    })
  })
