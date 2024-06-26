import { ContextMessageUpdate } from "telegraf";

import { BACK_ROUTES, MAIN_ROUTES, OI_ROUTES } from "../utils/CONST";
import asyncWrapper from "../utils/error-handler";
import getMainKeyboard from "../keyboards/main.keyboard";
import getOIKeyboard from "../keyboards/OI.keyboard";
import getPUMPKeyboard from "../keyboards/PUMP.keyboard";
import getREKTKeyboard from "../keyboards/REKT.keyboard";

export default function handlers(bot) {
  // OI screener
  bot.hears(
    MAIN_ROUTES.OI,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { oiKeyboard } = getOIKeyboard();

      await ctx.replyWithHTML(
        "<b>🤖 Я сканирую рынок на предмет роста Open Interest</b>",
        oiKeyboard
      );
    })
  );

  // PUMP screener
  bot.hears(
    MAIN_ROUTES.PUMP,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { pumpKeyboard } = getPUMPKeyboard();

      await ctx.replyWithHTML(
        "<b>🤖 Я сканирую рынок на маленькие пампы, чтобы искать точки входа в ЛОНГ 📈 и большие пампы, чтобы искать точки входа в ШОРТ 📉</b>",
        pumpKeyboard
      );
    })
  );

  // REKT screener
  bot.hears(
    MAIN_ROUTES.REKT,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { rektKeyboard } = getREKTKeyboard();

      await ctx.replyWithHTML(
        "<b>🤖 Я сканирую рынок на ликвидации</b>",
        rektKeyboard
      );
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
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('CreateNewTrackable'))
  );

   // 🔴 Удалить пару
   bot.hears(
    MAIN_ROUTES.DELETE,
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('DeleteTrackable'))
  );


   // 📈 Период роста OI
   bot.hears(
    OI_ROUTES.UP_PERIOD,
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('SetOI'))
  );

   // 📉 Период просадки
   bot.hears(
    OI_ROUTES.DOWN_PERIOD,
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('SetOI'))
  );


   // 🟩 Процент роста
   bot.hears(
    OI_ROUTES.UP_PERCENTEGES,
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('SetOI'))
  );

  // 🟥 Процент просадки
  bot.hears(
    OI_ROUTES.DOWN_PERCENTEGES,
    asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('SetOI'))
  );

}
