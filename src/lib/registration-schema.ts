import { z } from "astro/zod";

const requiredText = () =>
  z
    .string()
    .trim()
    .min(1, { error: "Please complete all required fields" })
    .max(2000, { error: "One or more fields are too long" });

export const registrationSchema = z.object({
  fullName: requiredText(),
  email: z
    .string()
    .trim()
    .min(1, { error: "Please complete all required fields" })
    .max(2000, { error: "One or more fields are too long" })
    .pipe(z.email({ error: "Please enter a valid email address" })),
  whatsapp: requiredText(),
  domicile: requiredText(),
  occupation: z
    .enum(["student", "professional", "freelancer", "business", "other", ""], {
      error: "Please select a valid activity",
    })
    .refine((value) => value !== "", "Please select a valid activity"),
  interest: z
    .enum(["web", "mobile", "design", "data", "security", "other", ""], {
      error: "Please select a valid interest",
    })
    .refine((value) => value !== "", "Please select a valid interest"),
  experience: z
    .enum(["beginner", "intermediate", "advanced", ""], {
      error: "Please select a valid experience level",
    })
    .refine((value) => value !== "", "Please select a valid experience level"),
  motivation: requiredText(),
  consent: z
    .boolean()
    .refine((value) => value === true, "You must agree to the terms and conditions to proceed"),
});

export type RegistrationPayload = z.input<typeof registrationSchema>;
