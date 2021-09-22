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
