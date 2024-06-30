import { Composer, Scenes, ContextMessageUpdate } from "telegraf";
import { message } from "telegraf/filters";

import { CANCEL_SCENE, MAIN_ROUTES, SESSION_FIELDS } from "../../utils/CONST";
import { deleteFromSession, saveToSession } from "../../utils/session";
import deleteMessages from "../../utils/deleteMessages";

import Trackable from "../../models/Trackable";
import { ByBitService } from "./../../index";
import { createNewTrackableMsg, saveTrackableMsg } from "./helpers";
import {
  deleteMessageLeave,
  deleteMessageNext
} from "../../middlewares/deleteMessages.middleware";
import asyncWrapper from "../../utils/error-handler";
import getMainKeyboard from "../../keyboards/main.keyboard";

const sendMessage = new Composer();
sendMessage.hears(MAIN_ROUTES.CREATE, async (ctx: ContextMessageUpdate) => {
  await createNewTrackableMsg(ctx);
});

const saveTrackable = new Composer();
saveTrackable.hears(
  CANCEL_SCENE,
  deleteMessageNext,
  asyncWrapper(async (ctx: ContextMessageUpdate) => {
    const { mainKeyboard } = getMainKeyboard();

    await ctx.replyWithHTML("<b>❌ Отмена действия</b>");
    await ctx.replyWithHTML("<b>Главное меню</b>", mainKeyboard);
    return await ctx.scene.leave();
  })
);

saveTrackable.on(
  message("text"),
  async (ctx: ContextMessageUpdate, next) => {
    await saveTrackableMsg(ctx, next);
  },
  deleteMessageLeave
);

export const CreateNewTrackable = new Scenes.WizardScene(
  "CreateNewTrackable",
  sendMessage,
  saveTrackable
);
