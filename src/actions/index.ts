import { ActionError, defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { Effect } from "effect";

import { registrationActionSchema } from "@/lib/registration-schema";
import {
  createRegistrationQueueMessage,
  type RegistrationQueueMessage,
} from "@/lib/registration-queue";
import { verifyTurnstileToken, type TurnstileVerificationResult } from "@/lib/turnstile";
import { env } from "cloudflare:workers";

const SUBMISSION_ERROR_MESSAGE = "Pendaftaran belum dapat dikirim. Silakan coba lagi.";
const SECURITY_ERROR_MESSAGE = "Verifikasi keamanan gagal. Silakan coba lagi.";
const RATE_LIMIT_ERROR_MESSAGE =
  "Terlalu banyak percobaan pendaftaran dari jaringan ini. Silakan coba lagi sebentar lagi.";

function getErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return { tag: "Unknown", status: undefined };
  }

  const details = error as { _tag?: unknown; status?: unknown };
  return {
    tag: typeof details._tag === "string" ? details._tag : "Unknown",
    status: typeof details.status === "number" ? details.status : undefined,
  };
}

export const server = {
  register: defineAction({
    accept: "form",
    input: registrationActionSchema,
    handler: async (payload, context) => {
      const spreadsheetId = getSecret("SPREADSHEET_ID");
      const turnstileSecret = getSecret("TURNSTILE_SECRET");

      if (!spreadsheetId || !turnstileSecret) {
        console.error("Failed to save join form submission", {
          tag: "RegistrationConfigurationError",
          status: undefined,
        });
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SUBMISSION_ERROR_MESSAGE,
        });
      }

      const clientAddress = context.clientAddress;
      let verification: TurnstileVerificationResult;

      try {
        verification = await Effect.runPromise(
          verifyTurnstileToken(payload.turnstileToken, turnstileSecret, clientAddress)
        );
      } catch (error) {
        console.warn("Rejected join form submission after Turnstile verification", {
          ...getErrorDetails(error),
        });
        throw new ActionError({
          code: "BAD_REQUEST",
          message: SECURITY_ERROR_MESSAGE,
        });
      }

      if (!verification.success || verification.action !== "registration") {
        console.warn("Rejected join form submission after Turnstile verification", {
          action: verification.action,
          errorCodes: verification.errorCodes,
        });
        throw new ActionError({
          code: "BAD_REQUEST",
          message: SECURITY_ERROR_MESSAGE,
        });
      }

      const rateLimiter = env.REGISTRATION_RATE_LIMITER;

      if (!rateLimiter) {
        console.error("Failed to save join form submission", {
          tag: "RegistrationRateLimitConfigurationError",
          status: undefined,
        });
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SUBMISSION_ERROR_MESSAGE,
        });
      }

      const rateLimitKey = `registration:${clientAddress ?? "unknown"}`;
      const { success: withinRateLimit } = await rateLimiter.limit({ key: rateLimitKey });

      if (!withinRateLimit) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: RATE_LIMIT_ERROR_MESSAGE,
        });
      }

      try {
        const registrationQueue: Queue<RegistrationQueueMessage> = env.REGISTER_QUEUE;

        await registrationQueue.send(createRegistrationQueueMessage(payload), {
          contentType: "json",
        });
      } catch (error) {
        console.error("Failed to save join form submission", getErrorDetails(error));

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SUBMISSION_ERROR_MESSAGE,
        });
      }

      return {
        ok: true,
        message: "Pendaftaran berhasil dikirim. Sampai jumpa di komunitas!",
      };
    },
  }),
};
