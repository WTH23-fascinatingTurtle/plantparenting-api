import PlantsDAO from "../dao/PlantsDAO.js"

export default class PlantsController {
    static async apiGetPlants(req, res, next) {
        const plantsPerPage = req.query.plantsPerPage ? parseInt(req.query.plantsPerPage, 10) : 100
        const page = req.query.page ? parseInt(req.query.page, 10) : 0

        let filters = {}
        if (req.query.id) {
            filters.id = req.query.id
        }

        const { plantsList, totalPlants } = await PlantsDAO.getPlants({
            filters,
            page,
            plantsPerPage
        })

        let response = {
            plants: plantsList,
            page: page,
            filters: filters,
            plant: plantsPerPage,
            totalPlants: totalPlants
        }

        res.json(response)
    }

    static async apiUpdatePlants(req, res, next) {
        try {
            const id = req.body.id
            const update = req.body.update

            if (id === undefined || update === undefined) {
                throw new Error("ID or Update Field is undefined.")
            }

            const updateResponse = await PlantsDAO.updatePlants(id, update)

            res.json({ status: "success", updated: updateResponse })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    }

    static async apiPostPlants(req, res, next) {
        try {
            const name = req.body.name
            const species = req.body.species

            if (name === undefined || species === undefined) {
                throw new Error("One or more required fields returned undefined. Refer to documentation to see required fields")
            }

            const reviewResponse = await PlantsDAO.addPlants(name, species)

            if (reviewResponse.error) {
                throw new Error(reviewResponse.error)
            }

            res.json({ status: "success", insertedProjectWithID: reviewResponse.insertedId })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    }
}