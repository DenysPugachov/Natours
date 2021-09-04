const mongoose = require("mongoose")
const dotenv = require("dotenv")
//config need to be defined before require("app")
dotenv.config({ path: "./config.env" })
const app = require("./app")

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
)

mongoose
  // .connect(process.env.DATABASE_LOCAL,{ // for local DB connection
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))

//server
const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(
    `mode: ${process.env.NODE_ENV}
    App running on port ${port}...`,
  )
})

