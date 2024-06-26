import { ContextMessageUpdate } from "telegraf";

import deleteMessages from "../utils/deleteMessages";
import asyncWrapper from "../utils/error-handler";
import { SESSION_FIELDS } from "../utils/CONST";
import { deleteFromSession } from "../utils/session";

export default asyncWrapper(async (ctx: ContextMessageUpdate, next) => {
  deleteMessages(ctx, ctx.session[SESSION_FIELDS.DELETE_MESSAGES]);
  deleteFromSession(ctx, SESSION_FIELDS.DELETE_MESSAGES);

  return next();
});
