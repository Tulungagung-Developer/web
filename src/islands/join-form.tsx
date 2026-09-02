import { withState } from "@astrojs/react/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions, isInputError } from "astro:actions";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type RegistrationPayload, registrationSchema } from "@/lib/registration-schema";

const occupationItems = [
  { label: "Pilih aktivitas", value: null },
  { label: "Pelajar atau mahasiswa", value: "student" },
  { label: "Profesional", value: "professional" },
  { label: "Freelancer", value: "freelancer" },
  { label: "Pemilik usaha", value: "business" },
  { label: "Lainnya", value: "other" },
] as const;

const interestItems = [
  { label: "Pilih bidang minat", value: null },
  { label: "Web development", value: "web" },
  { label: "Mobile development", value: "mobile" },
  { label: "UI dan UX design", value: "design" },
  { label: "Data dan AI", value: "data" },
  { label: "Cybersecurity", value: "security" },
  { label: "Bidang lainnya", value: "other" },
] as const;

const experienceItems = [
  { label: "Pilih tingkat pengalaman", value: null },
  { label: "Baru mulai belajar", value: "beginner" },
  { label: "Sudah mengerjakan beberapa proyek", value: "intermediate" },
  { label: "Berpengalaman secara profesional", value: "advanced" },
] as const;

const defaultValues: RegistrationPayload = {
  fullName: "",
  email: "",
  whatsapp: "",
  domicile: "",
  occupation: "",
  interest: "",
  experience: "",
  motivation: "",
  consent: false,
};

type JoinSelectName = "occupation" | "interest" | "experience";

interface JoinSelectProps<Name extends JoinSelectName> {
  control: ReturnType<typeof useForm<RegistrationPayload>>["control"];
  id: string;
  name: Name;
  label: string;
  items: ReadonlyArray<{ label: string; value: string | null }>;
  serverError?: string;
}

function JoinSelect<Name extends JoinSelectName>({
  control,
  id,
  name,
  label,
  items,
  serverError,
}: JoinSelectProps<Name>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message ?? serverError;
        const hasError = fieldState.invalid || !!serverError;

        return (
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select
              items={items}
              name={field.name}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? undefined)}
            >
              <SelectTrigger
                id={id}
                aria-label={label}
                aria-invalid={hasError}
                aria-describedby={`${id}-error`}
                onBlur={field.onBlur}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError id={`${id}-error`}>{errorMessage}</FieldError>
          </Field>
        );
      }}
    />
  );
}

export default function JoinForm() {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(registrationSchema),
  });

  const [actionState, submitAction, isSubmitting] = React.useActionState(
    withState(actions.register),
    {
      data: { ok: false, message: "" },
      error: undefined,
    }
  );

  React.useEffect(() => {
    if (actionState.data?.ok) {
      form.reset();
    }
  }, [actionState.data, form.reset]);

  const inputError =
    actionState.error && isInputError(actionState.error) ? actionState.error : null;
  const serverErrors = inputError?.fields as
    | Partial<Record<keyof RegistrationPayload, string[]>>
    | undefined;
  const getServerError = (name: keyof RegistrationPayload) => serverErrors?.[name]?.join(", ");

  const onSubmit = form.handleSubmit((_values, event) => {
    const form = event?.target as HTMLFormElement | undefined;

    if (!form) {
      return;
    }

    React.startTransition(() => {
      submitAction(new FormData(form));
    });
  });

  const status = isSubmitting
    ? "idle"
    : actionState.error
      ? "error"
      : actionState.data?.ok
        ? "success"
        : "idle";
  const statusMessage = isSubmitting
    ? "Mengirim pendaftaran..."
    : actionState.error
      ? isInputError(actionState.error)
        ? "Periksa kembali kolom yang ditandai."
        : actionState.error.message || "Pendaftaran belum dapat dikirim. Silakan coba lagi."
      : actionState.data?.message;

  return (
    <form
      className="rounded-2xl border border-border bg-background p-5 md:p-7"
      aria-label="Formulir pendaftaran anggota"
      onSubmit={onSubmit}
    >
      <FieldGroup className="grid sm:grid-cols-2">
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              className="sm:col-span-2"
              data-invalid={fieldState.invalid || !!getServerError("fullName")}
            >
              <FieldLabel htmlFor="full-name">Nama lengkap</FieldLabel>
              <Input
                id="full-name"
                type="text"
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                aria-invalid={fieldState.invalid || !!getServerError("fullName")}
                aria-describedby="full-name-error"
                {...field}
              />
              <FieldError id="full-name-error">
                {fieldState.error?.message ?? getServerError("fullName")}
              </FieldError>
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || !!getServerError("email")}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                aria-invalid={fieldState.invalid || !!getServerError("email")}
                aria-describedby="email-error"
                {...field}
              />
              <FieldError id="email-error">
                {fieldState.error?.message ?? getServerError("email")}
              </FieldError>
            </Field>
          )}
        />

        <Controller
          name="whatsapp"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || !!getServerError("whatsapp")}>
              <FieldLabel htmlFor="whatsapp">Nomor WhatsApp</FieldLabel>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                aria-invalid={fieldState.invalid || !!getServerError("whatsapp")}
                aria-describedby="whatsapp-error"
                {...field}
              />
              <FieldError id="whatsapp-error">
                {fieldState.error?.message ?? getServerError("whatsapp")}
              </FieldError>
            </Field>
          )}
        />

        <Controller
          name="domicile"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || !!getServerError("domicile")}>
              <FieldLabel htmlFor="domicile">Domisili</FieldLabel>
              <Input
                id="domicile"
                type="text"
                placeholder="Kota atau kabupaten tempat tinggal"
                autoComplete="address-level2"
                aria-invalid={fieldState.invalid || !!getServerError("domicile")}
                aria-describedby="domicile-error"
                {...field}
              />
              <FieldError id="domicile-error">
                {fieldState.error?.message ?? getServerError("domicile")}
              </FieldError>
            </Field>
          )}
        />

        <JoinSelect
          id="occupation"
          name="occupation"
          label="Aktivitas saat ini"
          items={occupationItems}
          control={form.control}
          serverError={getServerError("occupation")}
        />
        <JoinSelect
          id="interest"
          name="interest"
          label="Minat utama"
          items={interestItems}
          control={form.control}
          serverError={getServerError("interest")}
        />
        <JoinSelect
          id="experience"
          name="experience"
          label="Tingkat pengalaman"
          items={experienceItems}
          control={form.control}
          serverError={getServerError("experience")}
        />

        <Controller
          name="motivation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              className="sm:col-span-2"
              data-invalid={fieldState.invalid || !!getServerError("motivation")}
            >
              <FieldLabel htmlFor="motivation">Motivasi bergabung</FieldLabel>
              <Textarea
                id="motivation"
                placeholder="Ceritakan motivasi Anda bergabung dengan komunitas ini"
                aria-invalid={fieldState.invalid || !!getServerError("motivation")}
                aria-describedby="motivation-error"
                {...field}
              />
              <FieldError id="motivation-error">
                {fieldState.error?.message ?? getServerError("motivation")}
              </FieldError>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="consent"
          render={({ field, fieldState }) => (
            <Field
              orientation="horizontal"
              className="items-start sm:col-span-2"
              data-invalid={fieldState.invalid || !!getServerError("consent")}
            >
              <Checkbox
                id="consent"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                aria-invalid={fieldState.invalid || !!getServerError("consent")}
              />
              <div className="space-y-1">
                <FieldLabel htmlFor="consent" className="font-normal text-muted-foreground">
                  Saya bersedia menerima informasi kegiatan dan pembaruan komunitas melalui kontak
                  yang saya berikan.
                </FieldLabel>
                <FieldError id="consent-error">
                  {fieldState.error?.message ?? getServerError("consent")}
                </FieldError>
              </div>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="mt-7 border-t border-border pt-5">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim pendaftaran"}
        </Button>
        <p
          id="form-status"
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={[
            "mt-3 text-xs leading-5",
            status === "success" && "text-primary",
            status === "error" && "text-destructive",
            status === "idle" && "text-muted-foreground",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}
