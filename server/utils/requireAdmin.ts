import { createError, type H3Event } from "h3";
import type { JwtPayload } from "@supabase/supabase-js";
import { serverSupabaseUser } from "#supabase/server";

function userIdFromClaims(claims: JwtPayload): string | null {
  return claims.sub ?? (claims as { id?: string }).id ?? null;
}

export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null);
  const { adminUserId } = useRuntimeConfig(event);
  const userId = user ? userIdFromClaims(user) : null;

  if (!adminUserId || !userId || userId !== adminUserId) {
    throw createError({ statusCode: 404 });
  }

  return user;
}
