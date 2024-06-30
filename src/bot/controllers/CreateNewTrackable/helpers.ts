import { ContextMessageUpdate } from "telegraf";
import { saveToSession } from "../../utils/session";
import { SESSION_FIELDS } from "../../utils/CONST";
import Trackable from "../../models/Trackable";
import { ByBitService } from "../..";
import getCancelKeyboard from "../../keyboards/main.keyboard copy";
import getMainKeyboard from "../../keyboards/main.keyboard";

export async function createNewTrackableMsg(
  ctx: ContextMessageUpdate
): Promise<void> {
  const { cancelKeyboard } = getCancelKeyboard();
  const msg = await ctx.replyWithHTML(
    `📝 Напишите пару, которую вы хотите начать отслеживать в формате:\n\n<b>BTCUSDT</b> <i>или</i> <b>ETHUSDC</b> <i>и т.п</i> \n\n <i>(без /, ковычек)</i>`,
    cancelKeyboard
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

export async function saveTrackableMsg(
  ctx: ContextMessageUpdate,
  next
): Promise<void> {
  const symbol = ctx.message.text;
  const trackable = await Trackable.findOne({ symbol: symbol }).exec();

  if (trackable) {
    await ctx.replyWithHTML(`<b>Такая пара уже отслеживается</b>`);

    return next();
  }

  const isCanBeTrackableSpot = await ByBitService.subcribeTicker(
    symbol,
    "spot"
  );
  const isCanBeTrackableLinear = await ByBitService.subcribeTicker(
    symbol,
    "linear"
  );

  if (!isCanBeTrackableLinear && !isCanBeTrackableSpot) {
    await ctx.replyWithHTML(`<b>Невозможно отслеживать данную пару</b>`);

    return next();
  }

  if (isCanBeTrackableLinear) {
    await ByBitService.unSubcribeTicker(symbol, "spot");
    await ByBitService.subcribeLiquidation(symbol, "linear");
  }

  const newTrackable = new Trackable({
    symbol,
    type: isCanBeTrackableLinear ? "linear" : "spot"
  });
  await newTrackable.save();

  const { mainKeyboard } = getMainKeyboard();

  if (isCanBeTrackableLinear) {
    await ctx.replyWithHTML(
      `<b>Пара успешно сохранена!</b>\n\nТекущие доступы:\nOI screener - ✅\nPUMP screener - ✅\nLiquidation screener - ✅`,
      mainKeyboard
    );
  } else if (isCanBeTrackableSpot) {
    await ctx.replyWithHTML(
      `<b>Пара успешно сохранена!</b>\n\nТекущие доступы:\nOI screener - ❌\nPUMP screener - ✅\nLiquidation screener - ❌`,
      mainKeyboard
    );
  }

  return next();
}
