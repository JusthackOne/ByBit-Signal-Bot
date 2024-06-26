import TelegramError from "../errors/TelegramError.js";

export default async function (ctx, next) {
  try {
    const chatMember = ctx.message?.chat.id
      ? await ctx.telegram.getChatMember(
          ctx.message.chat.id,
          ctx.message.from.id
        )
      : await ctx.telegram.getChatMember(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.from.id
        );

    if (chatMember.status === "member") {
      await ctx.deleteMessage();
      return;
    }
    return next();
  } catch (error) {
    const err = TelegramError.IsAdminError(
      "Ошибка при проверки, что пользователь обладает правами администратора",
      error
    );
    console.log(err.error);
    return;
  }
}
