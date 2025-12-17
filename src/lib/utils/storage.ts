import Cookies from "js-cookie";

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const setCookie = (
  name: string,
  value: string,
  options?: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }
) => {
  Cookies.set(name, value, {
    ...options,
    secure: process.env.NODE_ENV === "production",
    path: options?.path ?? "/"
  });
};

export const deleteCookie = (name: string, path: string = "/") => {
  Cookies.remove(name, { path });
};
