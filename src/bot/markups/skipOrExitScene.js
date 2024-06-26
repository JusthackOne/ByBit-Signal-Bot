import { Markup } from "telegraf";

export default function (id) {
  return Markup.inlineKeyboard([
    Markup.button.callback(`Cancel ❌`, `exitScene`),
    Markup.button.callback(`Skip`, `skip`),
  ]).resize();
}
