import { Stage } from "telegraf/scenes";
import {  ContextMessageUpdate } from "telegraf";

import asyncWrapper from "../utils/error-handler";
import getMainKeyboard from "../keyboards/main.keyboard";

export default function handlers(bot) {
  // Main menu
  bot.command(
    "start",
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      const { mainKeyboard } = getMainKeyboard();

      await ctx.replyWithHTML("<b>Главное меню</b>", mainKeyboard);
    })
  );
}
