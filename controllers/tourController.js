const fs = require("fs")

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


exports.checkBody = (req, res, next) => {
  const { name, price } = req.body
  if (!name || !price) {
    return res.status(400).json({
      status: "error",
      message: `Required name and price!`
    })
  }
  next()
}

exports.checkId = (req, res, next, val) => {
  console.log(`Function checkID run id val=${val}`)
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    })
  }
  next()
}

exports.getAllTours = (req, res) => {
  console.log(req.requestTime)
  res
    .status(200)
    .json({
      status: "success",
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    })
}


exports.getTour = (req, res) => {
  //convert string to a number
  const id = req.params.id * 1
  const tour = tours.find(el => el.id === id)
  res
    .status(200)
    .json({
      status: "success",
      data: {
        tour
      }
    })
}


exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1
  const newTour = Object.assign({ id: newId }, req.body)
  tours.push(newTour)
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    // 200 => ok
    //201 => created
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    })
  })
}


exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...>"
    }
  })
}


exports.deleteTour = (req, res) => {
  //204=> no content
  res.status(204).json({
    status: "success",
    data: null// null => data no longer exist
  })
}
