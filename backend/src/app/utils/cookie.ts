import type { Response } from "express";

interface CookieTokens {
  accessToken?: string;
  refreshToken?: string;
}

interface CookieOptions {
  accessTokenKey?: string;
  refreshTokenKey?: string;
  secure?: boolean;
}

export const setAuthCookies = (
  res: Response,
  tokens: CookieTokens,
  options: CookieOptions = {}
) => {
  const {
    accessTokenKey = "accessToken",
    refreshTokenKey = "refreshToken",
    secure = false,
  } = options;

  const baseConfig = {
    httpOnly: true,
    secure,
    sameSite: "strict" as const,
  };

  if (tokens.accessToken) {
    res.cookie(accessTokenKey, tokens.accessToken, baseConfig);
  }

  if (tokens.refreshToken) {
    res.cookie(refreshTokenKey, tokens.refreshToken, baseConfig);
  }
};
