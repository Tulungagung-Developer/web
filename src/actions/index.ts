import { ActionError, defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";

import { registrationSchema } from "@/lib/registration-schema";
import {
  createRegistrationQueueMessage,
  type RegistrationQueueMessage,
} from "@/lib/registration-queue";
import { env } from "cloudflare:workers";

const SUBMISSION_ERROR_MESSAGE = "Pendaftaran belum dapat dikirim. Silakan coba lagi.";

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
    input: registrationSchema,
    handler: async (payload) => {
      const spreadsheetId = getSecret("SPREADSHEET_ID");

      if (!spreadsheetId) {
        console.error("Failed to save join form submission", {
          tag: "RegistrationConfigurationError",
          status: undefined,
        });
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SUBMISSION_ERROR_MESSAGE,
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
