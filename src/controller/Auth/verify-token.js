import jwt from "jsonwebtoken"
import { SECRET } from "../../config"
import { profile, doctor } from "../../DataBase/db"

export const verifyToken = async (req, res, next) => {
    const token = req.headers["x-acces-token"]
    console.log(token)
    if (!token) return res.status(403).json({
        messsage: "no token provide"
    })

    next()
}