import dotenv from "dotenv";
dotenv.config();

import { Scenes, Telegraf, session } from "telegraf";
import mongoose from "mongoose";

import messageHandler from "./handlers/messageHandlers.js";
import commandHandler from "./handlers/commandHandlers.js";
import actionHandler from "./handlers/actionHandler.js";
import logger from "./utils/logger.js";
import { CreateNewTrackable } from "./controllers/CreateNewTrackable/index.js";
import { DeleteTrackable } from "./controllers/DeleteTrackable/index.js";
import initializeBDdata from "./utils/initializeBDdata.js";
import { SetOI } from "./controllers/SetOI/index.js";

import ByBitWebSocketApiService from "./services/api.service.js";
import OIServiceCl from "./services/oi.service.js";
import Trackable from "./models/Trackable.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb://localhost:27017/${process.env.DATABASE_HOST}`;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing from environment variables.");
}

let bot, OIService;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    logger.debug(undefined, "Подключена бд");

    // Инициализация данных
    await initializeBDdata();

    // Инициализация бота
    bot = new Telegraf(BOT_TOKEN);

    // Инициализация сцены
    const stage = new Scenes.Stage([
      CreateNewTrackable,
      DeleteTrackable,
      SetOI
    ]);
    bot.use(session());
    bot.use(stage.middleware());

    // Хэндлеры
    messageHandler(bot);
    commandHandler(bot);
    actionHandler(bot);

    bot.catch((error: any) => {
      logger.error(undefined, "Global error has happened, %O", error);
    });

    logger.debug(undefined, "Бот запущен");

    OIService = OIServiceCl.getOIService(Trackable, undefined, bot);
    const BybitWebSocketService =
      ByBitWebSocketApiService.getWebsocketClient(OIService);
    OIService.API = BybitWebSocketService;
    OIService.onStartApp();

    // Запуск бота
    await bot.launch({
      allowedUpdates: ["message", "callback_query"]
    });

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  })
  .catch((err) => {
    logger.error(
      undefined,
      "Error occurred during an attempt to establish connection with the database: %O",
      err
    );
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  logger.error(
    undefined,
    "Error occurred during an attempt to establish connection with the database: %O",
    err
  );
  process.exit(1);
});

export { OIService };
export default bot;
