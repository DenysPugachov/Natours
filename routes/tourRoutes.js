const express = require("express")
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require("../controllers/tourController")

const router = express.Router()


router.param("id", checkId) //middleware to validate id

router.route("/")
  .get(getAllTours)
  .post(checkBody, createTour)

router.route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)


module.exports = router
