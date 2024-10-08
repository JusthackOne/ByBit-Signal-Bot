import { Composer, Scenes, ContextMessageUpdate } from "telegraf";

import {
  ACTIONS,
  MAIN_ROUTES,
  SESSION_FIELDS,
  TRACKABLE_KEYBOARD_ITEMS
} from "../../utils/CONST";
import { saveToSession } from "../../utils/session";
import { getTrackablesKeyboard } from "./utils";
import Trackable from "../../models/Trackable";

import { deleteMessageNext } from "../../middlewares/deleteMessages.middleware";
import { ByBitService } from "../..";
import { sendMessageMsg } from "./helpers";

const sendMessage = new Composer();
sendMessage.hears(MAIN_ROUTES.DELETE, async (ctx: ContextMessageUpdate) => {
  await sendMessageMsg(ctx);
});

const actionsDeleteTrackable = new Composer();

actionsDeleteTrackable.action(
  new RegExp(ACTIONS.PREV_DELETE_TRACKABLE, "g"),

  async (ctx: ContextMessageUpdate, next) => {
    const currentPage =
      Number(
        ctx.callbackQuery.data.replace(ACTIONS.PREV_DELETE_TRACKABLE + " ", "")
      ) - 1;

    if (currentPage < 0) {
      return await ctx.answerCbQuery();
    }

    const trackables = await Trackable.find().exec();

    const { trackableKeyboard } = getTrackablesKeyboard(
      trackables,
      ACTIONS.DELETE_TRACKABLE,
      currentPage
    );

    await ctx.editMessageText(`<b>Список отслеживаемых пар: </b>`, {
      ...trackableKeyboard,
      parse_mode: "HTML"
    });

    await ctx.answerCbQuery();
  }
);

actionsDeleteTrackable.action(
  new RegExp(ACTIONS.NEXT_DELETE_TRACKABLE, "g"),

  async (ctx: ContextMessageUpdate, next) => {
    const currentPage =
      Number(
        ctx.callbackQuery.data.replace(ACTIONS.NEXT_DELETE_TRACKABLE + " ", "")
      ) + 1;
    const trackables = await Trackable.find().exec();

    if (
      currentPage === Math.ceil(trackables.length / TRACKABLE_KEYBOARD_ITEMS)
    ) {
      return await ctx.answerCbQuery();
    }

    const { trackableKeyboard } = getTrackablesKeyboard(
      trackables,
      ACTIONS.DELETE_TRACKABLE,
      currentPage
    );

    await ctx.editMessageText(`<b>Список отслеживаемых пар: </b>`, {
      ...trackableKeyboard,
      parse_mode: "HTML"
    });

    await ctx.answerCbQuery();
  }
);

actionsDeleteTrackable.action(
  new RegExp(ACTIONS.DELETE_TRACKABLE, "g"),
  deleteMessageNext,
  async (ctx: ContextMessageUpdate, next) => {
    const _id = ctx.callbackQuery.data.replace(
      ACTIONS.DELETE_TRACKABLE + " ",
      ""
    );

    const deleteTrackable = await Trackable.findOne({ _id }).exec();
    await ByBitService.unSubcribeTicker(
      deleteTrackable.symbol,
      deleteTrackable.type
    ); // Отмена подписки

    if (deleteTrackable.type === "linear") {
      await ByBitService.unSubcribeLiquidation(
        deleteTrackable.symbol,
        deleteTrackable.type
      );
    }
    await Trackable.deleteOne({ _id });
    const trackables = await Trackable.find().exec();

    const { trackableKeyboard } = getTrackablesKeyboard(
      trackables,
      ACTIONS.DELETE_TRACKABLE
    );

    await ctx.replyWithHTML(
      `<b>Успешно удалёна пара <i>"${deleteTrackable.symbol}"</i></b>`
    );

    if (!trackables.length) {
      await ctx.replyWithHTML(`<b>Осталось ни одной отслеживаемой пары!</b>`);
      return await ctx.scene.leave();
    }

    const msg = await ctx.replyWithHTML(
      `<b>Список отслеживаемых пар: </b>`,
      trackableKeyboard
    );

    saveToSession(
      ctx,
      SESSION_FIELDS.DELETE_MESSAGES,
      ctx.session[SESSION_FIELDS.DELETE_MESSAGES]
        ? [...ctx.session[SESSION_FIELDS.DELETE_MESSAGES], msg.message_id]
        : [msg.message_id]
    );

    await ctx.answerCbQuery();
  }
);

export const DeleteTrackable = new Scenes.WizardScene(
  "DeleteTrackable",
  sendMessage,
  actionsDeleteTrackable
);
