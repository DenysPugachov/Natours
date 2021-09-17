class APIFeatures {
  constructor(query, queryString) {
    this.query = query //Tour.find() (query Object(schema))
    this.queryString = queryString //req.query (query string coming from express)
  }

  filter() {
    //make obj copy
    const queryObj = { ...this.queryString }
    const excludedFields = ["page", "sort", "limit", "fields"]
    excludedFields.forEach(el => delete queryObj[el])
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr))

    return this //further chaining
  }

  sort() {
    //query key: ?sort=-price
    if (this.queryString.sort) {
      // console.log("this.queryString.sort=", this.queryString.sort)
      const sortBy = this.queryString.sort.split(",").join(" ")
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort("-createdAt") // sort by default
    }
    return this
  }

  limitFields() {
    // selecting only certain filed => PROJECTING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ")
      this.query = this.query.select(fields)
    } else {
      //exclude tech field by default (-)
      this.query = this.query.select("-__v")
    }
    return this
  }

  paginate() {
    // convert to number, (1 = default)
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    // previous page * limit pro page
    const skip = (page - 1) * limit
    // page=2&limit=10, 1-10, 11-20, ...
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

module.exports = APIFeatures
