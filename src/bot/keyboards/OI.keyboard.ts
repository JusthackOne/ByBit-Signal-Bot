import { Markup } from "telegraf";
import { BACK_ROUTES, OI_ROUTES } from "../utils/CONST";

const getOIKeyboard = () => {
  const oiKeyboard = Markup.keyboard([
    [OI_ROUTES.UP_PERIOD, OI_ROUTES.UP_PERCENTEGES],
    [OI_ROUTES.DOWN_PERIOD, OI_ROUTES.DOWN_PERCENTEGES],
    [BACK_ROUTES.BACK]
  ]).resize();

  return { oiKeyboard };
};

export default getOIKeyboard;
