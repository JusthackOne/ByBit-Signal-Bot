import TelegramError from "../errors/TelegramError.js";
import dotenv from "dotenv";
dotenv.config();

export default async function (ctx, next) {
  try {

    const groupId = ctx.message?.chat.id ?  ctx.message.chat.id : ctx.callbackQuery.message.chat.id;

    if (String(groupId) !== process.env.GroupID) {
      await ctx.deleteMessage();
      return;
    }
 
    return next();
  } catch (error) {
    const err = TelegramError.IsAdminError(
      "Ошибка при проверки, что чат является администраторским",
      error
    );
    console.log(err.error);
    return;
  }
}
