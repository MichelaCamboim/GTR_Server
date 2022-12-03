import express from "express";
import * as dotenv from "dotenv";
import connect from "./config/db.config.js";
import userRoute from "./routes/user.routes.js";
import avaliacaoRoute from "./routes/avaliacao.routes.js";
import taskRoute from "./routes/task.routes.js";
import chatbotRoute from "./routes/chatbot.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

connect();

app.use("/user", userRoute);
app.use("/task", taskRoute);
app.use("/avaliacao", avaliacaoRoute);
app.use("/chatbot", chatbotRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `App up and running on port http://localhost:${process.env.PORT}`
  );
});
