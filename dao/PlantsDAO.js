import mongodb from "mongodb"
import crypto from 'crypto'

function hashToLength8(data) {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash.slice(0, 8);
}

const ObjectID  = mongodb.ObjectId
let plants

function makeStruct(keys) {
    if (!keys) return null;
    const count = keys.length;
    
    /** @constructor */
    function constructor() {
        for (let i = 0; i < count; i++) this[keys[i]] = arguments[i];
    }
    return constructor;
}

export default class PlantsDAO {
    static async injectDB(conn) {
        if (plants) { return }

        try {
            plants = await conn.db("plants").collection("plants")
        } catch(err) {
            console.error(`Cannot create a connection handle for in plantsDAO with: ${err}`)
        }
    }

    static async getPlants({
        filters = null,
        page = 0,
        plantsPerPage = 100
    } = {}) {
        let userQuery

        if(filters) {
            if("id" in filters) {
                if ("id" == "undefined" || "id" == null) {
                    throw new Error("ID is undefined or null")
                }

                const filterID = filters["id"]
                userQuery = { "hash": filterID }
            }
        }

        let cursor
        try {
            cursor = await plants
                .find(userQuery)
        } catch (err) {
            console.error(`Unable to find plants with: ${err}`)
            return { plantsList: [], totalPlants: 0 }
        }

        const displayCursor = cursor.limit(plantsPerPage).skip(plantsPerPage * page)
        try {
            const plantsList = await displayCursor.toArray()
            const totalPlants = await plants.countDocuments(userQuery)

            return { plantsList, totalPlants }
        } catch (err) {
            console.error(`Unable to convert cursor to array, or a problem occured when counting documents: ${err}`)
            
            return { plantsList: [], totalPlants: 0 }
        }
    }

    static async addPlants(name, species) {
        try {
            const PlantStruct = new makeStruct(["name", "species", "hash", "realtime", "controls"])
            const ControlsStruct = new makeStruct(["volWater", "light"]) // Vol Water is in mililiters, light in boolean
            const plant = new PlantStruct(name, species, hashToLength8(`${name} ${species}`), [], new ControlsStruct(0.0, false))

            const insertRequest = await plants.insertOne(plant)

            if (!insertRequest.acknowledged) {
                throw new Error("Insert Request not acknowledged by db")
            }

            return insertRequest
        } catch (err) {
            return { error: err }
        }
    }

    static async updatePlants(id, update) {
        try {
            const updateResponse = await plants.updateOne({"hash": id}, {$set: update})

            return updateResponse
        } catch (err) {
            return { error: err }
        }
    }
}