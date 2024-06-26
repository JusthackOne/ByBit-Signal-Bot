import db from "../db/index.js";
import TelegramError from "../errors/TelegramError.js";

export default async function (ctx, next) {
  try {
    const user = await db.users.getUserByUserId(ctx.message.from.id);

    if (!user) {
      await ctx.deleteMessage();
      await ctx.replyWithHTML("<b>You need to register</b>");
      return;
    }
    return next();
  } catch (error) {
    const err = TelegramError.IsAdminError(
      "Ошибка при проверки, что пользователь зарегистрирован",
      error
    );
    console.log(err.error);
    return;
  }
}
