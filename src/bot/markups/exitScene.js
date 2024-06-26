import { Markup } from "telegraf";

export default function () {
  return Markup.inlineKeyboard([
    Markup.button.callback(`Cancel ❌`, `exitScene`)
  ]).resize();
}
