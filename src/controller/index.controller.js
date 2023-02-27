import { profile, Op, doctor, order } from "../DataBase/db"
import bcrtypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SECRET } from "../config"

export const helloWorld = async (req, res, next) => {
    const token = req.headers["x-acces-token"]
    const decoded = jwt.verify(token, SECRET)
    const user = await profile.findByPk(decoded.id)


    if (user.role === "Hospital" && user.services === null) {


        res.json({
            messsage: "Porfavor complete sus datos"
        })

    }
    next()



}


export const getAllProfiles = async () => {

    const allProfiles = await profile.findAll()
    if (!allProfiles.length) throw Error("No profiles yet")
    return allProfiles

}

export const getAllProfileByRole = async (search) => {

    const profilesByRole = await profile.findAll({
        where: {
            role: {
                [Op.like]: '%' + search.toLowerCase() + '%'
            }
        },
        raw: true
    })

    if (!profilesByRole.length) throw Error("No profiles yet")
    return profilesByRole

}


export const signIn = async (req, res, next) => {
    const { identification, password, role } = req.body;

    try {
        const user = role !== "Doctor" ? await profile.findOne({
            where: { identification: identification },
        }) : await doctor.findOne({
            where: { identification: identification },
        })

        console.log(user);

        const passwordCorrect =
            user === null ? false : await bcrtypt.compare(password, user.password);

        if (!(user && passwordCorrect)) {
            return res.status(401).json({
                message: "Usuario o contraseña invalida",
            });
        }

        if (!user.verified) {
            return res.status(401).json({
                message:
                    "Por favor verifica tu cuenta en el enlace que se te envio a tu correo electronico",
            });
        }
        if (user && passwordCorrect && user.location === null) {
            const token = jwt.sign({ id: user.id }, "secretkey", {
                expiresIn: 8600
            });

            return res.status(201).json({
                token: token,
                message: "Porfavor actualice sus datos",
            }).redirect(`/updateData/${user.id}`);
        }
        if (user && passwordCorrect && password === user.identification) {
            const token = jwt.sign({ id: user.id }, "secretkey", {
                expiresIn: 8600
            });

            return res.status(201).json({
                token: token,
                message: "Porfavor actualice su contraseña",
            }).redirect(`/changePassword/${user.id}`);
        }


        if (user && passwordCorrect) {
            const token = jwt.sign({ id: user.id }, "secretkey", {
                expiresIn: 8600,
            });

            return res.status(201).json({
                token: token,
                message: "Credenciales correctas",
            }).redirect("/");

        }


    } catch (err) {
        return next(err);
    }
};



export const getIdProfile = async (id) => {

    try {
        const resultFind = await profile.findByPk(id)
        return resultFind
    }
    catch (error) {
        console.error(error);
        return "error";
    }
}

export const getOrders = async (id) => {

    try {
        const resultFind = await order.findAll({
            where: {
                profileId: id
            }
        })
        return resultFind
    }
    catch (error) {
        console.error(error);
        return "error";
    }
}



export const getDoctorOrders = async (id) => {


    try {



        const resultFind = await order.findAll({
            where: {
                doctorId: id
            }
        })
        return resultFind
    }
    catch (error) {
        console.error(error);
        return "error";
    }
}


export const getMedicOrder = async (identification) => {


    const result = await doctor.findOne({
        where: {
            identification: identification
        }
    })
    try {

        const resultFind = await order.findAll({
            where: {
                hospital: result.hospital
            }
        })
        return resultFind
    }
    catch (error) {
        console.error(error);
        return "error";
    }
}