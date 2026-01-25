import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000"
});

export const getClientAuthSession = async () => {
  const session = await authClient.getSession();

  return session;
};

const signUpAdminByEmail = async (email: string, password: string) => {
  const session = await authClient.signUp.email({
    email,
    password,
    name: "Administrator",
  });

  return session;
};

// signUpAdminByEmail("helloawuraba@gmail.com", "nBkdySKH93EBypB");
