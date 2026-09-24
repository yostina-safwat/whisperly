import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bootstrap from "./src/app.controller.js";
import logger from "./src/utils/logger/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

bootstrap(app, express);

app.listen(PORT, () => {
  logger.info(`Whisperly server is running on http://localhost:${PORT}`);
});
