import { ContextMessageUpdate } from "telegraf";

import {
  BACK_ROUTES,
  CANCEL_SCENE,
  MAIN_ROUTES,
  OI_ROUTES,
  PUMP_ROUTES,
  REKT_ROUTES
} from "../utils/CONST";
import asyncWrapper from "../utils/error-handler";
import getMainKeyboard from "../keyboards/main.keyboard";
import getOIKeyboard from "../keyboards/OI.keyboard";
import getPUMPKeyboard from "../keyboards/PUMP.keyboard";
import getREKTKeyboard from "../keyboards/REKT.keyboard";
import Config from "../models/Config";
import { deleteMessageNext } from "../middlewares/deleteMessages.middleware";
import {
  getMainOIText,
  getMainPumpText,
  getMainREKTText
} from "../utils/texts";

export default function handlers(bot) {
  // OI screener
  bot.hears(
    MAIN_ROUTES.OI,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { oiKeyboard } = getOIKeyboard();
      const config = (await Config.find().exec())[0];
      const oiText = getMainOIText(config);
      await ctx.replyWithHTML(oiText, oiKeyboard);
    })
  );

  // PUMP screener
  bot.hears(
    MAIN_ROUTES.PUMP,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { pumpKeyboard } = getPUMPKeyboard();
      const config = (await Config.find().exec())[0];
      const pumpText = getMainPumpText(config);

      await ctx.replyWithHTML(pumpText, pumpKeyboard);
    })
  );

  // REKT screener
  bot.hears(
    MAIN_ROUTES.REKT,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { rektKeyboard } = getREKTKeyboard();
      const config = (await Config.find().exec())[0];
      const rektText = getMainREKTText(config);
      await ctx.replyWithHTML(rektText, rektKeyboard);
    })
  );

  // PUMP screener
  bot.hears(
    BACK_ROUTES.BACK,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { mainKeyboard } = getMainKeyboard();

      await ctx.replyWithHTML("<b>Главное меню</b>", mainKeyboard);
    })
  );

  // 🟢 Отслеживать новую пару
  bot.hears(
    MAIN_ROUTES.CREATE,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) =>
        await ctx.scene.enter("CreateNewTrackable")
    )
  );

  // 🔴 Удалить пару
  bot.hears(
    MAIN_ROUTES.DELETE,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) =>
        await ctx.scene.enter("DeleteTrackable")
    )
  );

  // 📈 Период роста OI
  bot.hears(
    OI_ROUTES.UP_PERIOD,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetOI")
    )
  );

  // 📉 Период просадки
  bot.hears(
    OI_ROUTES.DOWN_PERIOD,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetOI")
    )
  );

  // 🟩 Процент роста
  bot.hears(
    OI_ROUTES.UP_PERCENTEGES,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetOI")
    )
  );

  // 🟥 Процент просадки
  bot.hears(
    OI_ROUTES.DOWN_PERCENTEGES,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetOI")
    )
  );

  // Pump

  // 📈 Период лонг
  bot.hears(
    PUMP_ROUTES.UP_PERIOD,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetPUMP")
    )
  );

  // 📉 Период шорт
  bot.hears(
    PUMP_ROUTES.DOWN_PERIOD,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetPUMP")
    )
  );

  // 🟩 Процент лонг
  bot.hears(
    PUMP_ROUTES.UP_PERCENTEGES,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetPUMP")
    )
  );

  // 🟥 Процент шорт
  bot.hears(
    PUMP_ROUTES.DOWN_PERCENTEGES,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetPUMP")
    )
  );

  // 🟥 Процент шорт
  bot.hears(
    CANCEL_SCENE,
    deleteMessageNext,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      return await ctx.scene.leave();
    })
  );

  // Ликвадация настройка
  bot.hears(
    REKT_ROUTES.SET_LIMIT,
    deleteMessageNext,
    asyncWrapper(
      async (ctx: ContextMessageUpdate) => await ctx.scene.enter("SetREKT")
    )
  );
}
