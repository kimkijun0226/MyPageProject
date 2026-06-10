import { userApi } from "@/api";

export type AuthStoreUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

export async function resolveAuthStoreUser(id: string, email: string): Promise<AuthStoreUser> {
  const isAdmin = await userApi.getMyIsAdmin();
  return { id, email, isAdmin };
}
