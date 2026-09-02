import { z } from "astro/zod";

import { registrationSchema, type RegistrationPayload } from "@/lib/registration-schema";

export const registrationQueueMessageSchema = z.object({
  version: z.literal(1),
  submittedAt: z.iso.datetime(),
  payload: registrationSchema,
});

export type RegistrationQueueMessage = z.infer<typeof registrationQueueMessageSchema>;

export function createRegistrationQueueMessage(
  payload: RegistrationPayload
): RegistrationQueueMessage {
  return {
    version: 1,
    submittedAt: new Date().toISOString(),
    payload: registrationSchema.parse(payload),
  };
}

export function parseRegistrationQueueMessage(value: unknown): RegistrationQueueMessage {
  return registrationQueueMessageSchema.parse(value);
}

export function registrationQueueMessageToSheetRow(
  message: RegistrationQueueMessage
): readonly string[] {
  const { payload } = message;

  return [
    message.submittedAt,
    payload.fullName,
    payload.email,
    payload.whatsapp,
    payload.domicile,
    payload.occupation,
    payload.interest,
    payload.experience,
    payload.motivation,
    payload.consent ? "Yes" : "No",
  ];
}
