import { Composer, Scenes, ContextMessageUpdate } from "telegraf";
import { message } from "telegraf/filters";

import { CANCEL_SCENE, PUMP_ROUTES, SESSION_FIELDS } from "../../utils/CONST";
import { deleteFromSession, saveToSession } from "../../utils/session";
import isNumeric from "../../utils/isNumeric";
import deleteMessages from "../../utils/deleteMessages";
import {
  isValidOIPercenteges,
  isValidOIPeriod
} from "../../utils/validateData";
import asyncWrapper from "../../utils/error-handler";
import { getMainPumpText } from "../../utils/texts";

import getPUMPKeyboard from "../../keyboards/PUMP.keyboard";
import getCancelKeyboard from "../../keyboards/main.keyboard copy";
import Config, { IConfig } from "../../models/Config";
import {deleteMessageNext} from "../../middlewares/deleteMessages.middleware";

const sendMessage = new Composer();
sendMessage.hears(PUMP_ROUTES.UP_PERIOD, async (ctx: ContextMessageUpdate) => {
  const configData = (await Config.find().exec())[0];
  const { cancelKeyboard } = getCancelKeyboard();
  await ctx.replyWithHTML(
    `⏱ <b>Текущий период времени, за который цена должна вырасти на нужный % - ${configData.pump_growth_period} мин</b>\n\n Введи новый период времени: от 1 до 30 минут`,
    cancelKeyboard
  );

  saveToSession(ctx, SESSION_FIELDS.CHANGE, PUMP_ROUTES.UP_PERIOD);
  await ctx.wizard.next();
});

sendMessage.hears(
  PUMP_ROUTES.DOWN_PERIOD,
  async (ctx: ContextMessageUpdate) => {
    const configData: IConfig = (await Config.find().exec())[0];
    const { cancelKeyboard } = getCancelKeyboard();
    await ctx.replyWithHTML(
      `⏱ <b>Текущий период времени, за который цена должна упасть на нужный % - ${configData.pump_recession_period} мин</b>\n\n Введи новый период времени: от 1 до 30 минут`,
      cancelKeyboard
    );

    saveToSession(ctx, SESSION_FIELDS.CHANGE, PUMP_ROUTES.DOWN_PERIOD);
    await ctx.wizard.next();
  }
);

sendMessage.hears(
  PUMP_ROUTES.UP_PERCENTEGES,
  async (ctx: ContextMessageUpdate) => {
    const configData: IConfig = (await Config.find().exec())[0];
    const { cancelKeyboard } = getCancelKeyboard();
    await ctx.replyWithHTML(
      `📈 <b>Текущий % изменения цены для большого пампа - ${configData.pump_growth_percentage}%</b>\n\n Введи новый % изменения цены: от 0.1% до 100%`,
      cancelKeyboard
    );

    saveToSession(ctx, SESSION_FIELDS.CHANGE, PUMP_ROUTES.UP_PERCENTEGES);
    await ctx.wizard.next();
  }
);

sendMessage.hears(
  PUMP_ROUTES.DOWN_PERCENTEGES,
  async (ctx: ContextMessageUpdate) => {
    const configData: IConfig = (await Config.find().exec())[0];
    const { cancelKeyboard } = getCancelKeyboard();
    const msg = await ctx.replyWithHTML(
      `📉 <b>Текущий % изменения цены для шорта - ${configData.pump_recession_percentage}%</b>\n\n Введи новый % изменения цены: от 0.1% до 100%`,
      cancelKeyboard
    );

    saveToSession(ctx, SESSION_FIELDS.CHANGE, PUMP_ROUTES.DOWN_PERCENTEGES);
    await ctx.wizard.next();
  }
);

const changePUMPParam = new Composer();
changePUMPParam.hears(
  CANCEL_SCENE,
  deleteMessageNext,
  asyncWrapper(async (ctx: ContextMessageUpdate) => {
    const config = (await Config.find().exec())[0];
    const { pumpKeyboard } = getPUMPKeyboard();
    const pumpText = getMainPumpText(config);
    await ctx.replyWithHTML("<b>❌ Отмена действия</b>");
    await ctx.replyWithHTML(pumpText, pumpKeyboard);
    return await ctx.scene.leave();
  })
);

changePUMPParam.on(
  message("text"),
  async (ctx: ContextMessageUpdate, next) => {
    const num: string = ctx.message.text;
    const configData: IConfig = (await Config.find().exec())[0];
    let res;
    const { pumpKeyboard } = getPUMPKeyboard();

    if (!isNumeric(num)) {
      await ctx.replyWithHTML(`<b>Введите число!</b>`);

      return;
    }

    switch (ctx.session[SESSION_FIELDS.CHANGE]) {
      case PUMP_ROUTES.UP_PERIOD:
        if (!isValidOIPeriod(num)) {
          await ctx.replyWithHTML(
            `<b>Введите число в указанном интервале!</b>`
          );

          return;
        }

        res = await Config.updateOne(
          { _id: configData._id },
          { pump_growth_period: num }
        );
        await ctx.replyWithHTML(
          `<b>Успешно изменен период роста цены, теперь равен - ${num} мин</b>`,
          pumpKeyboard
        );
        break;
      case PUMP_ROUTES.UP_PERCENTEGES:
        if (!isValidOIPercenteges(num)) {
          await ctx.replyWithHTML(
            `<b>Введите число в указанном интервале!</b>`
          );

          return;
        }

        res = await Config.updateOne(
          { _id: configData._id },
          { pump_growth_percentage: num }
        );
        await ctx.replyWithHTML(
          `<b>Успешно изменен % роста цены, теперь равен - ${num}%</b>`,
          pumpKeyboard
        );
        break;
      case PUMP_ROUTES.DOWN_PERIOD:
        if (!isValidOIPeriod(num)) {
          await ctx.replyWithHTML(
            `<b>Введите число в указанном интервале!</b>`
          );

          return;
        }

        res = await Config.updateOne(
          { _id: configData._id },
          { pump_recession_period: num }
        );
        await ctx.replyWithHTML(
          `<b>Успешно изменен период спада, теперь равен - ${num} мин</b>`,
          pumpKeyboard
        );
        break;

      case PUMP_ROUTES.DOWN_PERCENTEGES:
        if (!isValidOIPercenteges(num)) {
          await ctx.replyWithHTML(
            `<b>Введите число в указанном интервале!</b>`
          );

          return;
        }

        res = await Config.updateOne(
          { _id: configData._id },
          { pump_recession_percentage: num }
        );
        await ctx.replyWithHTML(
          `<b>Успешно изменен % падения цены, теперь равен - ${num}%</b>`,
          pumpKeyboard
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

export const SetPUMP = new Scenes.WizardScene(
  "SetPUMP",
  sendMessage,
  changePUMPParam
);
