import { Composer, Scenes, ContextMessageUpdate, session } from "telegraf";
import { message } from "telegraf/filters";

import { MAIN_ROUTES, SESSION_FIELDS } from "../../utils/CONST";
import { deleteFromSession, saveToSession } from "../../utils/session";
import Trackable from "../../models/Trackable";
import deleteMessages from "../../utils/deleteMessages";
import loggerWithCtx from "../../utils/logger";
import { OIService } from "../..";

const sendMessage = new Composer();
sendMessage.hears(MAIN_ROUTES.CREATE, async (ctx: ContextMessageUpdate) => {
  const msg = await ctx.replyWithHTML(
    `📝 Напишите пару, которую вы хотите начать отслеживать в формате:\n\n<b>BTCUSDT</b> <i>или</i> <b>ETHUSDC</b> <i>и т.п</i> \n\n <i>(без /, ковычек)</i>`
  );

  saveToSession(
    ctx,
    SESSION_FIELDS.DELETE_MESSAGES,
    ctx.session[SESSION_FIELDS.DELETE_MESSAGES]
      ? [...ctx.session[SESSION_FIELDS.DELETE_MESSAGES], msg.message_id]
      : [msg.message_id]
  );
  await ctx.wizard.next();
});

const saveTrackable = new Composer();
saveTrackable.on(
  message("text"),
  async (ctx: ContextMessageUpdate, next) => {
    const symbol = ctx.message.text;
const isCanBeTrackable = await OIService.subcribeNewTicker(symbol)
    const trackable = await Trackable.findOne({ symbol: symbol }).exec();

    if (trackable) {
      await ctx.replyWithHTML(`<b>Такая пара уже отслеживается</b>`);

      return next();
    }

    if (!isCanBeTrackable) {
      await ctx.replyWithHTML(`<b>Невозможно отслеживать данную пару</b>`);

      return next();
    }



    const newTrackable = new Trackable({ symbol });
    await newTrackable.save();

    await ctx.replyWithHTML(`<b>Пара успешно сохранена!</b>`);
    return next();
  },

  async (ctx: ContextMessageUpdate) => {
    deleteMessages(ctx, ctx.session[SESSION_FIELDS.DELETE_MESSAGES]);
    deleteFromSession(ctx, SESSION_FIELDS.DELETE_MESSAGES);

    return await ctx.scene.leave();
  }
);

export const CreateNewTrackable = new Scenes.WizardScene(
  "CreateNewTrackable",
  sendMessage,
  saveTrackable
);
