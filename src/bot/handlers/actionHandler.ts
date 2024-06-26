import { ContextMessageUpdate } from "telegraf";

import { ACTIONS, SESSION_FIELDS } from "../utils/CONST.js";
import asyncWrapper from "../utils/error-handler";
import deleteMessages from "../utils/deleteMessages.js";
import { deleteFromSession } from "../utils/session.js";
import deleteMessagesMiddleware from "../middlewares/deleteMessages.middleware.js";

export default function handler(bot) {
  // Empty task
  bot.action(
    ACTIONS.NONE,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      await ctx.answerCbQuery();
    })
  );

  // Close message with inlineButton keyboard
  bot.action(
    ACTIONS.CLOSE,
    deleteMessagesMiddleware,
    asyncWrapper(async (ctx: ContextMessageUpdate) => {
      await ctx.answerCbQuery();
      return await ctx.scene.leave();
    })
  );
}
