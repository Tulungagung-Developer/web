import { astro, FetchState } from "astro/fetch";
import { cf } from "@astrojs/cloudflare/fetch";
import { Effect } from "effect";

import {
  parseRegistrationQueueMessage,
  registrationQueueMessageToSheetRow,
  type RegistrationQueueMessage,
} from "@/lib/registration-queue";
import { appendSheetRow, parseGoogleServiceAccountJson } from "@/lib/sheets";

type QueueEnv = Env & {
  readonly SPREADSHEET_RANGE?: string;
};

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

async function appendRegistrationToSheet(
  message: RegistrationQueueMessage,
  env: QueueEnv
): Promise<void> {
  const spreadsheetId = env.SPREADSHEET_ID;
  const range = env.SPREADSHEET_RANGE || "Sheet1!A:K";
  const credentials = await Effect.runPromise(
    parseGoogleServiceAccountJson(env.GOOGLE_SERVICE_ACCOUNT_JSON)
  );

  await Effect.runPromise(
    appendSheetRow(spreadsheetId, range, registrationQueueMessageToSheetRow(message), credentials)
  );
}

export default {
  async fetch(request, env, ctx) {
    const state = new FetchState(request);
    const asset = await cf(state, env, ctx);

    if (asset) return asset;
    return astro(state);
  },
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        const registration = parseRegistrationQueueMessage(message.body);
        await appendRegistrationToSheet(registration, env);
        message.ack();
      } catch (error) {
        console.error("Failed to append registration to Google Sheets", {
          messageId: message.id,
          attempts: message.attempts,
          ...getErrorDetails(error),
        });
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<QueueEnv, RegistrationQueueMessage>;
