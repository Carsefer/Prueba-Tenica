import { NODE_ENV, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } from "../config"
import { Sequelize, Op } from "sequelize";
import modelProfile from "./Models/Profile"
import modelDoctor from "./Models/Doctor"
import modelOrder from "./Models/Order"



let conn =
    NODE_ENV === "production"
        ? new Sequelize({
            database: DB_NAME,
            dialect: "postgres",
            host: DB_HOST,
            port: DB_PORT,
            username: DB_USER,
            password: DB_PASSWORD,
            pool: {
                max: 3,
                min: 1,
                idle: 10000,
            },
            /*  dialectOptions: {
                 ssl: {
                     require: true,
                     // Ref.: https://github.com/brianc/node-postgres/issues/2009
                     rejectUnauthorized: false,
                 },
                 keepAlive: true,
             }, */
            ssl: true,
        })
        : new Sequelize("prueba_tecnica", DB_USER, DB_PASSWORD, {
            host: DB_HOST,
            dialect: "postgres",
            logging: false, // set to console.log to see the raw SQL queries
            native: false, // lets Sequelize know we can use pg-native for ~30% more speed
        });



modelProfile(conn)
modelDoctor(conn)
modelOrder(conn)

//Relations

const {
    profile, doctor, order,
} = conn.models


//profile
profile.hasMany(order)
profile.hasMany(doctor)
//Doctor
doctor.hasMany(order)

export {
    conn,
    profile, doctor, order,
    Op,
};
