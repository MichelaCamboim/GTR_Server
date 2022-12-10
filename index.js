import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connect from "./config/db.config.js";

import userRoute from "./routes/user.routes.js";
import taskRoute from "./routes/task.routes.js";
import reportRoute from "./routes/report.routes.js";
import chatbotRoute from "./routes/chatbot.routes.js";

import logRoute from "./routes/log.routes.js";
import uploadRoute from "./routes/uploadFile.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connect();

app.use("/user", userRoute);
app.use("/task", taskRoute);
app.use("/report", reportRoute);
app.use("/chatbot", chatbotRoute);

app.use("/log", logRoute);
app.use("/fileUpload", uploadRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `App up and running on port http://localhost:${process.env.PORT}`
  );
});
