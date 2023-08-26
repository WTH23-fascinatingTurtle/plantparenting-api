import app from "./server.js"
import dotenv from "dotenv"
import mongodb from 'mongodb'

let MongoClient = mongodb.MongoClient

// DAO
import PlantsDAO from "./dao/PlantsDAO.js"

dotenv.config()

const port = process.env.PORT || 8080

;(async () => {
    try {
        let dbUrl = process.env.ATLAS_URI
        const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        await PlantsDAO.injectDB(client)

        if (process.env.NODE_ENV !== "test") {
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`)
            })
        }
    }
    catch (err) {
        console.error(err.stack)
        process.exit(1)
    }
})()