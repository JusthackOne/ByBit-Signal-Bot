import dotenv from "dotenv";
dotenv.config();

import { Context, Scenes, Telegraf, session } from "telegraf";
import mongoose from "mongoose";

import messageHandler from "./handlers/messageHandler.js";
import commandHandler from "./handlers/commandHandler.js";
import actionHandler from "./handlers/actionHandler.js";
import logger from "./utils/logger.js";
import { CreateNewTrackable } from "./controllers/CreateNewTrackable/index.js";
import { DeleteTrackable } from "./controllers/DeleteTrackable/index.js";
import initializeBDdata from "./utils/initializeBDdata.js";
import { SetOI } from "./controllers/SetOI/index.js";

import ByBitWebSocketApiService from "./services/api.service.js";

import Trackable from "./models/Trackable.js";
import ByBitServiceCl from "./services/bybit.service/bybit.service.js";
import { SetPUMP } from "./controllers/SetPUPM/index.js";
import { SetREKT } from "./controllers/SetREKT/index.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb://localhost:27017/${process.env.DATABASE_HOST}`;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing from environment variables.");
}

let bot: Context,
  ByBitService: ByBitServiceCl,
  BYBIT_API: ByBitWebSocketApiService;

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
      SetOI,
      SetPUMP,
      SetREKT
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

    ByBitService = ByBitServiceCl.getByBitService(Trackable, bot);
    BYBIT_API = ByBitWebSocketApiService.getWebsocketClient();

    await ByBitService.onStartApp();
    await ByBitService.signalCheckAndClear();

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

export { ByBitService, BYBIT_API };
export default bot;
