import { Markup } from "telegraf";
import { BACK_ROUTES, REKT_ROUTES } from "../utils/CONST";

const getREKTKeyboard = () => {
  const rektKeyboard = Markup.keyboard([
    [REKT_ROUTES.SET_LIMIT],

    [BACK_ROUTES.BACK]
  ]).resize();

  return { rektKeyboard };
};

export default getREKTKeyboard;
