import { Markup } from "telegraf";
import { BACK_ROUTES, PUMP_ROUTES } from "../utils/CONST";

const getPUMPKeyboard = () => {
  const pumpKeyboard = Markup.keyboard([
    [PUMP_ROUTES.UP_PERIOD, PUMP_ROUTES.UP_PERCENTEGES],
    [PUMP_ROUTES.DOWN_PERIOD, PUMP_ROUTES.DOWN_PERCENTEGES],
    [BACK_ROUTES.BACK]
  ]).resize();

  return { pumpKeyboard };
};

export default getPUMPKeyboard;
