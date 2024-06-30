import { Markup } from "telegraf";
import { CANCEL_SCENE } from "../utils/CONST";

const getCancelKeyboard = () => {
  const cancelKeyboard = Markup.keyboard([[CANCEL_SCENE]]).resize();

  return { cancelKeyboard };
};

export default getCancelKeyboard;
