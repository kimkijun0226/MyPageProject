export function isAdmin(user: { isAdmin?: boolean } | null | undefined): boolean {
  return user?.isAdmin === true;
}
