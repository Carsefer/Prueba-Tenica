import { Router } from "express"
import bcrypt from "bcryptjs"
import { profile, doctor, order } from "../DataBase/db"
import { EMAIL, EMAIL_PASSWORD, SECRET, BACKEND } from "../config";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import { getAllProfiles, getAllProfileByRole, getIdProfile, getOrders, getDoctorOrders, getHospitalOrder, getMedicOrder } from "../controller/index.controller";
import { verifyToken } from "../controller/Auth/verify-token";
import { addDoctor, addOrder } from "../controller/createOrder";
import { generateFile } from "../controller/fileController";


const router = Router()


router.get("/", verifyToken, async (req, res) => {

    res.send("Hola")
})

router.get("/profiles", verifyToken,
    async (req, res) => {
        const { role } = req.query
        if (role) {
            try {
                const profilesByRole = await getAllProfileByRole(role)
                res.status(201).send(profilesByRole)
            } catch (error) {
                res.status(400).send(error.message)
            }
        } else {
            try {
                const allProfiles = await getAllProfiles()
                res.status(201).send(allProfiles)
            }
            catch (error) {
                res.status(400).send("No profiles yet")
            }
        }
    })
router.get("/:id", verifyToken, async (req, res) => {
    const id = req.params.id;

    try {

        const idProfile = await getIdProfile(id);
        res.status(200).send(idProfile);
    }
    catch (error) {
        res.status(400).send(error.message)
    }


});




router.put("/changePassword/:id", verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { password, role } = req.body

        const passwordHash = await bcrypt.hash(password, 8);



        role === "Doctor" ? await doctor.update(
            { password: passwordHash },
            {
                where: {
                    id,
                }
            }
        ) : await profile.update({ password: passwordHash },
            {
                where: {
                    id,
                }
            })
        res.status(201).send("Sucess")
    } catch (error) {
        res.send(error);
    }
})


router.put("/updateData/:id", verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, location, services, birthday } = req.body
        await profile.update(
            { name, location, services, birthday },
            {
                where: {
                    id,
                }
            }
        )
        res.status(201).send("Sucess")
    } catch (error) {
        res.send(error);
    }
})


router.post(
    "/doctor/:id", verifyToken,
    async (req, res) => {

        const id = req.params.id
        const { name, phone, mail, location, password, identification } =
            req.body;

        const profileLink = await profile.findByPk(id);
        if (!(profileLink)) throw Error("Profile dont exist");
        if (profileLink.role !== "Hospital") throw Error("Need Role Hospital")
        console.log("", req.body);
        const passwordHash = await bcrypt.hash(identification, 8);

        try {
            const newDoctor = await doctor.create({
                name,
                phone,
                mail,
                location,
                password: passwordHash,
                hospital: profileLink.name,
                identification
                ,
            });
            await profileLink.addDoctor(newDoctor);
            // token and link
            const secret = SECRET + newDoctor.password;
            const token = jwt.sign({ email: newDoctor.mail, id: newDoctor.id }, secret, {
                expiresIn: 60 * 60 * 24,
            });
            const link = `${BACKEND || "http://localhost:3001"
                }/verify/${newDoctor.id}/${token}`;
            // mail 
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: EMAIL,
                    pass: EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: EMAIL,
                to: newDoctor.mail,
                subject: "Verificacion de usuario",
                text: `Bienvenido ${newDoctor.mail}, gracias por registrarte para terminar el proceso
                    de registro ingresa en el siguiente link para verificar tu cuenta ${link} el link
                    tendra un tiempo de expiracion de un dia.
                    `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            res.status(201).send(newDoctor)

        } catch (error) {
            res.status(400).send(error.message)
        }
    })


router.post("/", async (req, res) => {
    let { identification, mail, password, phone, role } = req.body
    const passwordHash = await bcrypt.hash(password, 8);

    try {

        const newProfile = await profile.create({


            mail,
            password: passwordHash,
            phone,
            identification,
            role



        });

        if (newProfile) {
            // token and link
            const secret = SECRET + newProfile.password;
            const token = jwt.sign({ email: newProfile.mail, id: newProfile.id }, secret, {
                expiresIn: 60 * 60 * 24,
            });
            const link = `${BACKEND || "http://localhost:3001"
                }/verify/${newProfile.id}/${token}`;
            // mail 
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: EMAIL,
                    pass: EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: EMAIL,
                to: newProfile.mail,
                subject: "Verificacion de usuario",
                text: `Bienvenido ${newProfile.mail}, gracias por registrarte para terminar el proceso
                de registro ingresa en el siguiente link para verificar tu cuenta ${link} el link
                tendra un tiempo de expiracion de un dia.
                `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });


            res.status(201).send(newProfile)

        }

    } catch (error) {
        res.status(400).send(error.message);
    }
});


router.post("/forgot-password", async (req, res) => {
    const { mail, role } = req.body;
    try {
        const oldUser = role !== "Doctor" ? await profile.findOne({
            where: {
                mail: mail,
            },
        }) : await doctor.findOne({
            where: {
                mail: mail,
            }
        })
        if (!oldUser) {
            return res.send("No existen usuarios con ese email");
        }
        const secret = SECRET + oldUser.password;
        const token = jwt.sign({ email: oldUser.mail, id: oldUser.id }, secret, {
            expiresIn: "2h",
        });
        const link = `${BACKEND || "http://localhost:3001"
            }/changePassword/${oldUser.id}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL,
                pass: EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: EMAIL,
            to: oldUser.mail,
            subject: "Enlace de recuperacion de contraseña",
            text: `Hola ${oldUser.name}, para recuperar tu contraseña accede a este link ${link}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res.send("Email de recuperacion enviado");
    } catch (error) {
        res.send(error.message);
    }
});

router.post(
    "/order/:id",
    async (req, res) => {
        try {
            const response = await addOrder(req);
            res.send(response);
        } catch (error) {
            res.send(error);
        }
    }
);


router.get("/order/:id", async (req, res) => {
    const id = req.params.id
    try {
        const response = await getOrders(id)
        res.status(200).send(response)

    }
    catch (error) {
        res.status(400).send(error.message)

    }
})

router.get("/doctorOrder/:id", async (req, res) => {
    const id = req.params.id
    try {
        const response = await getDoctorOrders(id)
        res.status(200).send(response)

    }
    catch (error) {
        res.status(400).send(error.message)

    }
})

router.get("/orderMedic", async (req, res) => {
    const { identification } = req.query

    try {
        const response = await getMedicOrder(identification)
        res.status(200).send(response)

    }
    catch (error) {
        res.status(400).send(error.message)

    }
})

router.get("/invoice", (req, res) => {
    const stream = res.writeHead(200, {
        "Content-Type": "aplication/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf"
    });

    generateFile(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});




export default router