import { defineEventHandler } from "h3";
import { requireAdmin } from "~~/server/utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return { ok: true };
});
