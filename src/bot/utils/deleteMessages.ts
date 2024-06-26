import { ContextMessageUpdate } from "telegraf";

export default async function (ctx: ContextMessageUpdate, arr: []) {
  for (let i in arr) {
    await ctx.deleteMessage(arr[i]);
  }
}
