import { Data, Effect } from "effect";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export interface GoogleServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

export type GoogleSheetRow = readonly string[];

export class GoogleServiceAccountConfigError extends Data.TaggedError(
  "GoogleServiceAccountConfigError"
)<{ readonly message: string }> {}

export class GoogleAuthenticationError extends Data.TaggedError("GoogleAuthenticationError")<{
  readonly message: string;
  readonly status?: number;
}> {}

export class GoogleSheetsRequestError extends Data.TaggedError("GoogleSheetsRequestError")<{
  readonly message: string;
  readonly status?: number;
}> {}

type GoogleApiError =
  | GoogleServiceAccountConfigError
  | GoogleAuthenticationError
  | GoogleSheetsRequestError;

function encodeBase64Url(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePrivateKey(privateKey: string) {
  const base64 = privateKey
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function parseGoogleServiceAccountJson(
  value: string | undefined
): Effect.Effect<GoogleServiceAccountCredentials, GoogleServiceAccountConfigError> {
  return Effect.gen(function* () {
    if (!value) {
      return yield* Effect.fail(
        new GoogleServiceAccountConfigError({
          message: "GOOGLE_SERVICE_ACCOUNT_JSON is not configured",
        })
      );
    }

    const parsed = yield* Effect.tryPromise({
      try: () => Promise.resolve().then(() => JSON.parse(value) as unknown),
      catch: () =>
        new GoogleServiceAccountConfigError({
          message: "GOOGLE_SERVICE_ACCOUNT_JSON must contain valid JSON",
        }),
    });

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return yield* Effect.fail(
        new GoogleServiceAccountConfigError({
          message: "GOOGLE_SERVICE_ACCOUNT_JSON must contain a service account object",
        })
      );
    }

    const account = parsed as Partial<GoogleServiceAccountCredentials>;
    if (typeof account.client_email !== "string" || typeof account.private_key !== "string") {
      return yield* Effect.fail(
        new GoogleServiceAccountConfigError({
          message: "Google service account JSON is missing client_email or private_key",
        })
      );
    }

    return {
      client_email: account.client_email,
      private_key: account.private_key,
    };
  });
}

function createGoogleAccessToken(
  credentials: GoogleServiceAccountCredentials
): Effect.Effect<string, GoogleAuthenticationError> {
  return Effect.gen(function* () {
    const issuedAt = Math.floor(Date.now() / 1000);
    const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claimSet = encodeBase64Url(
      JSON.stringify({
        iss: credentials.client_email,
        scope: GOOGLE_SHEETS_SCOPE,
        aud: GOOGLE_TOKEN_URL,
        iat: issuedAt,
        exp: issuedAt + 3600,
      })
    );

    const unsignedToken = `${header}.${claimSet}`;
    const cryptoKey = yield* Effect.tryPromise({
      try: () =>
        crypto.subtle.importKey(
          "pkcs8",
          decodePrivateKey(credentials.private_key),
          { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
          false,
          ["sign"]
        ),
      catch: () =>
        new GoogleAuthenticationError({
          message: "Google service account private key could not be imported",
        }),
    });
    const signature = yield* Effect.tryPromise({
      try: () =>
        crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(unsignedToken)),
      catch: () =>
        new GoogleAuthenticationError({
          message: "Google service account assertion could not be signed",
        }),
    });
    const assertion = `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;

    const response = yield* Effect.tryPromise({
      try: (signal) =>
        fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            assertion,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          }),
          signal,
        }),
      catch: () =>
        new GoogleAuthenticationError({
          message: "Google authentication request failed",
        }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new GoogleAuthenticationError({
          message: `Google authentication failed (${response.status})`,
          status: response.status,
        })
      );
    }

    const token = yield* Effect.tryPromise({
      try: () => response.json() as Promise<{ access_token?: string }>,
      catch: () =>
        new GoogleAuthenticationError({
          message: "Google authentication response was invalid",
        }),
    });

    if (!token.access_token) {
      return yield* Effect.fail(
        new GoogleAuthenticationError({
          message: "Google authentication response did not contain an access token",
        })
      );
    }

    return token.access_token;
  });
}

function googleSheetsRequest(
  spreadsheetId: string,
  range: string,
  credentials: GoogleServiceAccountCredentials,
  init: RequestInit
): Effect.Effect<unknown, GoogleApiError> {
  return Effect.gen(function* () {
    const accessToken = yield* createGoogleAccessToken(credentials);
    const encodedRange = encodeURIComponent(range);
    const response = yield* Effect.tryPromise({
      try: (signal) =>
        fetch(
          `${GOOGLE_SHEETS_API_URL}/${encodeURIComponent(spreadsheetId)}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          {
            ...init,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              ...init.headers,
            },
            signal,
          }
        ),
      catch: () =>
        new GoogleSheetsRequestError({
          message: "Google Sheets request failed",
        }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new GoogleSheetsRequestError({
          message: `Google Sheets request failed (${response.status})`,
          status: response.status,
        })
      );
    }

    return yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () =>
        new GoogleSheetsRequestError({
          message: "Google Sheets returned an invalid response",
        }),
    });
  });
}

export function appendSheetRow(
  spreadsheetId: string,
  range: string,
  values: GoogleSheetRow,
  credentials: GoogleServiceAccountCredentials
): Effect.Effect<unknown, GoogleApiError> {
  return googleSheetsRequest(spreadsheetId, range, credentials, {
    method: "POST",
    body: JSON.stringify({ values: [values] }),
  });
}
