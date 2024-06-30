import { Composer, Scenes, ContextMessageUpdate } from "telegraf";
import { message } from "telegraf/filters";

import {
  CANCEL_SCENE,
  PUMP_ROUTES,
  REKT_ROUTES,
  SESSION_FIELDS
} from "../../utils/CONST";
import { deleteFromSession, saveToSession } from "../../utils/session";
import isNumeric from "../../utils/isNumeric";
import deleteMessages from "../../utils/deleteMessages";
import {
  isValidOIPercenteges,
  isValidOIPeriod
} from "../../utils/validateData";
import asyncWrapper from "../../utils/error-handler";
import { getMainPumpText, getMainREKTText } from "../../utils/texts";

import getPUMPKeyboard from "../../keyboards/PUMP.keyboard";
import getCancelKeyboard from "../../keyboards/main.keyboard copy";
import Config, { IConfig } from "../../models/Config";
import { deleteMessageNext } from "../../middlewares/deleteMessages.middleware";
import getREKTKeyboard from "../../keyboards/REKT.keyboard";

const sendMessage = new Composer();
sendMessage.hears(REKT_ROUTES.SET_LIMIT, async (ctx: ContextMessageUpdate) => {
  const configData = (await Config.find().exec())[0];
  const { cancelKeyboard } = getCancelKeyboard();
  await ctx.replyWithHTML(
    `🔻 <b>Текущая минимальная ликвидация - ${configData.rekt_limit}$</b>\n\nВведи новую: от 1000$`,
    cancelKeyboard
  );

  saveToSession(ctx, SESSION_FIELDS.CHANGE, REKT_ROUTES.SET_LIMIT);
  await ctx.wizard.next();
});

const changeREKTParam = new Composer();
changeREKTParam.hears(
  CANCEL_SCENE,
  deleteMessageNext,
  asyncWrapper(async (ctx: ContextMessageUpdate) => {
    const { rektKeyboard } = getREKTKeyboard();
    const config = (await Config.find().exec())[0];
    const rektText = getMainREKTText(config);
    await ctx.replyWithHTML("<b>❌ Отмена действия</b>");
    await ctx.replyWithHTML(rektText, rektKeyboard);
    return await ctx.scene.leave();
  })
);

changeREKTParam.on(
  message("text"),
  async (ctx: ContextMessageUpdate, next) => {
    const num: string = ctx.message.text;
    const configData: IConfig = (await Config.find().exec())[0];
    let res;
    const { rektKeyboard } = getREKTKeyboard();

    if (!isNumeric(num)) {
      await ctx.replyWithHTML(`<b>Введите число!</b>`);

      return;
    }

    switch (ctx.session[SESSION_FIELDS.CHANGE]) {
      case REKT_ROUTES.SET_LIMIT:
        if (Number(num) < 1000) {
          await ctx.replyWithHTML(`<b>Число должно быть >= 100</b>`);

          return;
        }

        res = await Config.updateOne(
          { _id: configData._id },
          { rekt_limit: num }
        );
        await ctx.replyWithHTML(
          `<b>Успешно изменена минимальная ликвидация, теперь равна - ${num}$</b>`,
          rektKeyboard
        );
        break;
    }

    return next();
  },

  async (ctx: ContextMessageUpdate) => {
    deleteMessages(ctx, ctx.session[SESSION_FIELDS.DELETE_MESSAGES]);
    deleteFromSession(ctx, SESSION_FIELDS.DELETE_MESSAGES);

    return await ctx.scene.leave();
  }
);

export const SetREKT = new Scenes.WizardScene(
  "SetREKT",
  sendMessage,
  changeREKTParam
);
