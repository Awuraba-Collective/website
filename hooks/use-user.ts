import { authClient } from "@/lib/auth-client";

export const useUser = () => {
  const session = authClient.useSession();
  return session?.data?.user;
};
