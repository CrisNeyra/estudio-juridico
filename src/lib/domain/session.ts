/** True when the JWT was issued before the last password/credential change. */
export function credentialsInvalidateJwt(
  iat: unknown,
  credentialsChangedAt: Date | null | undefined,
): boolean {
  if (!credentialsChangedAt || typeof iat !== "number") return false;
  return Math.floor(credentialsChangedAt.getTime() / 1000) > iat;
}
