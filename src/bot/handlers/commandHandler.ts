import { Stage } from "telegraf/scenes";
import { ContextMessageUpdate } from "telegraf";

import asyncWrapper from "../utils/error-handler";
import getMainKeyboard from "../keyboards/main.keyboard";

export default function handlers(bot) {
  // Main menu
  bot.command(
    "start",
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { mainKeyboard } = getMainKeyboard();

      await ctx.replyWithHTML(
        `<b>👋 Привет!</b>\n\nЯ - <b>Сигнал Бот 🚀</b>, который внимательно следит за биржами 🌐 и мгновенно оповещает вас, когда произойдут важные события, такие как изменение <b>открытого интереса</b>, <b>памп 📈</b> или <b>ликвидация 💥</b> любых криптовалютных пар! 💹\n\n<b>Главное меню ⬇️</b>`,
        mainKeyboard
      );
    })
  );
}
