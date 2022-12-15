import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connect from "./config/db.config.js";

import userRoute from "./routes/user.routes.js";
import taskRoute from "./routes/task.routes.js";
import mytasksRoute from "./routes/mytask.routes.js";

import reportRoute from "./routes/report.routes.js";
//import chatbotRoute from "./routes/chatbot.routes.js";
import activityRoute from "./routes/activity.routes.js";
import logRoute from "./routes/log.routes.js";
import uploadRoute from "./routes/uploadFile.routes.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.REACT_APP }));
app.use(express.json());
connect();

app.use("/user", userRoute);
app.use("/task", taskRoute);
app.use("/activity", activityRoute);
app.use("/mytask", mytasksRoute);
app.use("/report", reportRoute);
//app.use("/chatbot", chatbotRoute);

app.use("/log", logRoute);
app.use("/fileUpload", uploadRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `App up and running on port http://localhost:${process.env.PORT}`
  );
});
