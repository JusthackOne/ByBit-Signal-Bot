import { Markup } from "telegraf";
import { ITrackable } from "../../models/Trackable";
import { ACTIONS, TRACKABLE_KEYBOARD_ITEMS } from "../../utils/CONST";
import loggerWithCtx from "../../utils/logger";

export const getTrackablesKeyboard = (
  trackables: ITrackable[],
  actionText: string,
  current: number = 0
) => {
  const pages: number = Math.ceil(trackables.length / TRACKABLE_KEYBOARD_ITEMS);
  const buttons = [];

  for (
    let index = current * TRACKABLE_KEYBOARD_ITEMS;
    index < current * TRACKABLE_KEYBOARD_ITEMS + TRACKABLE_KEYBOARD_ITEMS;
    index++
  ) {
    if (trackables[index]) {
      const name = trackables[index].symbol;

      buttons.push(
        Markup.button.callback(
          name,
          `${actionText} ${trackables[index]._id.toString()}`
        )
      );
    } else {
      buttons.push(Markup.button.callback("-", `none`));
    }
  }

  buttons.push(Markup.button.callback("<<", `prev_${actionText} ${current}`));
  buttons.push(Markup.button.callback(`${current + 1}/${pages}`, `none`));
  buttons.push(Markup.button.callback(">>", `next_${actionText} ${current}`));
  buttons.push(Markup.button.callback("Close", `${ACTIONS.CLOSE}`));

  const trackableKeyboard = Markup.inlineKeyboard(buttons, {
    columns: 3
  }).resize();
  return { trackableKeyboard };
};
