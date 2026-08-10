import { CookieOptions, Response } from 'express';
import { Duration } from 'luxon';
import { CookieResponse } from 'src/dtos/auth.dto';
import { ImmichCookie } from 'src/enum';

/** Lifetime of a cookie that should survive across browser sessions. */
const PERSISTENT_COOKIE_MS = Duration.fromObject({ days: 400 }).toMillis();
/** Lifetime of a cookie scoped to a single short-lived grant. */
const SHORT_LIVED_COOKIE_MS = Duration.fromObject({ days: 1 }).toMillis();

export const respondWithCookie = <T>(res: Response, body: T, { isSecure, values }: CookieResponse) => {
  const defaults: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecure,
    maxAge: PERSISTENT_COOKIE_MS,
  };

  const cookieOptions: Record<ImmichCookie, CookieOptions> = {
    [ImmichCookie.AuthType]: defaults,
    [ImmichCookie.AccessToken]: defaults,
    [ImmichCookie.MaintenanceToken]: { ...defaults, maxAge: SHORT_LIVED_COOKIE_MS },
    [ImmichCookie.OAuthState]: defaults,
    [ImmichCookie.OAuthCodeVerifier]: defaults,
    // no httpOnly so that the client can know the auth state
    [ImmichCookie.IsAuthenticated]: { ...defaults, httpOnly: false },
    [ImmichCookie.SharedLinkToken]: { ...defaults, maxAge: SHORT_LIVED_COOKIE_MS },
  };

  for (const { key, value } of values) {
    const options = cookieOptions[key];
    res.cookie(key, value, options);
  }

  return body;
};

export const respondWithoutCookie = <T>(res: Response, body: T, cookies: ImmichCookie[]) => {
  for (const cookie of cookies) {
    res.clearCookie(cookie);
  }

  return body;
};
