import app from "./app";
import { PORT } from "./config";
import { conn } from "./DataBase/db"

const db = conn
db.sync({ force: true }).then(() => {
    app.listen(PORT, async () => {
        try {
            db.authenticate().then(() => console.log("database connected"));
            console.log("Server is up, at port ", PORT);
        } catch (error) {
            console.log(
                "An error occurred during server startup: " + error.message
            );
        }
    });
});
