import express from "express"
import PlantsController from "./plants.controller.js"

const router = express.Router()

router.route("/")
    .get(PlantsController.apiGetPlants)
    .post(PlantsController.apiPostPlants)
    .put(PlantsController.apiUpdatePlants)
    // .delete(PlantsController.apiDeletePlants)

export default router