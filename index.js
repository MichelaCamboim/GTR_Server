import express from "express";
import * as dotenv from "dotenv";
import connect from "./config/db.config.js";
import userRoute from "./routes/user.routes.js";
import reportRoute from "./routes/report.routes.js";
import taskRoute from "./routes/task.routes.js";
import chatbotRoute from "./routes/chatbot.routes.js";
import cors from "cors";

dotenv.config();
connect();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/user", userRoute);
app.use("/task", taskRoute);
app.use("/report", reportRoute);
app.use("/chatbot", chatbotRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `App up and running on port http://localhost:${process.env.PORT}`
  );
});
