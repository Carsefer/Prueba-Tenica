import { Router } from "express"
import bcrypt from "bcryptjs"
import { profile } from "../DataBase/db"
import { EMAIL, EMAIL_PASSWORD, SECRET } from "../config";
import jwt, { sign } from "jsonwebtoken"
import nodemailer from "nodemailer"
import { signIn } from "../controller/index.controller";

const router = Router()

router.get("/verify/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const user = await profile.findOne({
        where: {
            id: id,
        },
    });
    if (!user) {
        return res.send("El usuario no existe");
    }
    const secret = SECRET + user.password;
    try {
        const verify = jwt.verify(token, secret);
        await profile.update(
            {
                verified: true,
            },
            {
                where: {
                    id: user.id,
                },
            }
        );
        res.send(`verified`);
    } catch (err) {
        res.send(`not-verified`);
    }
});

router.post("/login", signIn)


router.get("/logout", (req, res) => {
    if (req.user) {
        req.logout();
        res.send("succes");
    }
});


export default router