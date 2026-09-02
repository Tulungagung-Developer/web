import { Data, Effect } from "effect";

const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerificationResponse {
  success?: boolean;
  action?: string;
  "error-codes"?: string[];
}

export class TurnstileVerificationRequestError extends Data.TaggedError(
  "TurnstileVerificationRequestError"
)<{
  readonly message: string;
  readonly status?: number;
}> {}

export class TurnstileVerificationResponseError extends Data.TaggedError(
  "TurnstileVerificationResponseError"
)<{ readonly message: string }> {}

export type TurnstileVerificationError =
  | TurnstileVerificationRequestError
  | TurnstileVerificationResponseError;

export interface TurnstileVerificationResult {
  success: boolean;
  action?: string;
  errorCodes: readonly string[];
}

export function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteIp?: string
): Effect.Effect<TurnstileVerificationResult, TurnstileVerificationError> {
  return Effect.gen(function* () {
    const body = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const response = yield* Effect.tryPromise({
      try: (signal) =>
        fetch(TURNSTILE_SITEVERIFY_URL, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          body,
          signal,
        }),
      catch: () =>
        new TurnstileVerificationRequestError({
          message: "Turnstile verification request failed",
        }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new TurnstileVerificationRequestError({
          message: "Turnstile verification failed (" + response.status + ")",
          status: response.status,
        })
      );
    }

    const result = yield* Effect.tryPromise({
      try: () => response.json() as Promise<TurnstileVerificationResponse>,
      catch: () =>
        new TurnstileVerificationResponseError({
          message: "Turnstile verification response was invalid",
        }),
    });

    return {
      success: result.success === true,
      action: result.action,
      errorCodes: Array.isArray(result["error-codes"]) ? result["error-codes"] : [],
    };
  });
}
