/* eslint-disable @typescript-eslint/no-explicit-any */
export const authRole = {
  Admin: ["admin"],
  User: ["user", "admin"],
};

export const defaultUser: any = {
  uid: "john-alex",
  displayName: "John Alex",
  email: "demo@example.com",
  token: "access-token",
  role: "user",
  photoURL: "/assets/images/avatar/A11.jpg",
};
export const allowMultiLanguage = import.meta.env.VITE_MULTILINGUAL === "true";
export const fileStackKey = import.meta.env.VITE_FILESTACK_KEY as string;
export const initialUrl = import.meta.env.VITE_INITIAL_URL as string || "/"; // this url will open after login
