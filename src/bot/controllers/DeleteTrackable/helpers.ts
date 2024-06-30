import { Composer, Scenes, ContextMessageUpdate } from "telegraf";

import { ACTIONS, SESSION_FIELDS } from "../../utils/CONST";
import { saveToSession } from "../../utils/session";
import { getTrackablesKeyboard } from "./utils";
import Trackable from "../../models/Trackable";

export async function sendMessageMsg(
  ctx: ContextMessageUpdate,
  
): Promise<void> {
  const trackables = await Trackable.find().exec();

  if (!trackables.length) {
    await ctx.replyWithHTML(
      `<b>Пока вы не добавили ни одной отслеживаемой пары!</b>`
    );
    return await ctx.scene.leave();
  }

  const { trackableKeyboard } = getTrackablesKeyboard(
    trackables,
    ACTIONS.DELETE_TRACKABLE
  );

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

  await ctx.wizard.next();
}
