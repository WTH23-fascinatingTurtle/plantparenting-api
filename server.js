import express from "express"
import cors from "cors"
import dotenv from "dotenv"
// Route Files
import plants from "./api/plants.route.js"

dotenv.config()

// Server Setup
const app = express()
const allowedOrigin = ["https://plantparenting.ethanchew.com", "http://localhost:3000", "*"]
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowedOrigin.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.options("*", cors(corsOptionsDelegate))
app.use(cors(corsOptionsDelegate))
app.use(express.json())

app.use("/api/plants", plants)
app.use("*", (req, res) => res.status(404).json({error: "Not Found"}))
app.use((err, req, res, next) => {
    const status = err.status || 500
    const msg = err.message || "Internal Server Error"
    res.status(status).send({ error: msg })
})

export default app