import type { Response } from "express";

interface CookieTokens {
  accessToken?: string;
  refreshToken?: string;
}

interface CookieOptions {
  accessTokenKey?: string;
  refreshTokenKey?: string;
  isProduction?: boolean;
}

export const getAuthCookieConfig = (isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
});

export const setAuthCookies = (
  res: Response,
  tokens: CookieTokens,
  options: CookieOptions = {},
) => {
  const {
    accessTokenKey = "accessToken",
    refreshTokenKey = "refreshToken",
    isProduction = false,
  } = options;

  const baseConfig = getAuthCookieConfig(isProduction);

  if (tokens.accessToken) {
    res.cookie(accessTokenKey, tokens.accessToken, baseConfig);
  }

  if (tokens.refreshToken) {
    res.cookie(refreshTokenKey, tokens.refreshToken, baseConfig);
  }
};

export const clearAuthCookies = (res: Response, isProduction: boolean) => {
  const baseConfig = getAuthCookieConfig(isProduction);

  res.clearCookie("accessToken", baseConfig);
  res.clearCookie("refreshToken", baseConfig);
};
