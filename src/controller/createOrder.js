import { profile, doctor, order } from "../DataBase/db"
export const addOrder = async (req) => {

    const id = req.params.id
    const { identification, observation, service, healthCondition } =
        req.body;




    const doctorLink = await doctor.findByPk(id);
    const profileLink = await profile.findOne({
        where: { identification: identification }
    })


    if (!(doctorLink)) throw Error("Profile dont exist");
    if (doctorLink.role !== "Doctor") throw Error("Need Role Doctor")
    console.log("", req.body);

    try {
        const newOrder = await order.create({
            observation,
            service,
            healthCondition,
            hospital: doctorLink.hospital

        });
        await profileLink.addOrder(newOrder);
        await doctorLink.addOrder(newOrder);
        return "Orden creado con exito"


    } catch (error) {
        console.log(error);
    }
}

