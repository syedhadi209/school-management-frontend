"use client";

import { FormField } from "@/components/data/form-field";
import { Input } from "@/components/ui/input";

export type FamilyDetailsValues = {
  father_name: string;
  mother_name: string;
  father_cnic: string;
  mother_cnic: string;
  address: string;
  region: string;
  guardian_phone: string;
  parent_phone?: string;
  parent_alternate_phone: string;
  parent_email: string;
  parent_occupation?: string;
};

export const EMPTY_FAMILY_DETAILS: FamilyDetailsValues = {
  father_name: "",
  mother_name: "",
  father_cnic: "",
  mother_cnic: "",
  address: "",
  region: "",
  guardian_phone: "",
  parent_alternate_phone: "",
  parent_email: "",
  parent_occupation: "",
};

/** Field keys that belong on the family / parent step. */
export const FAMILY_FIELD_KEYS = [
  "father_name",
  "mother_name",
  "father_cnic",
  "mother_cnic",
  "address",
  "region",
  "guardian_phone",
  "parent_phone",
  "parent_alternate_phone",
  "parent_email",
  "parent_occupation",
] as const;

export function FamilyDetailsFields({
  values,
  onChange,
  showOccupation = true,
  required = false,
  phoneField = "guardian_phone",
}: {
  values: FamilyDetailsValues;
  onChange: (patch: Partial<FamilyDetailsValues>) => void;
  showOccupation?: boolean;
  required?: boolean;
  /** Inquiry forms store the primary phone as parent_phone; students use guardian_phone. */
  phoneField?: "guardian_phone" | "parent_phone";
}) {
  const phoneValue =
    phoneField === "parent_phone"
      ? values.parent_phone ?? values.guardian_phone
      : values.guardian_phone;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="Father's name" required={required}>
        <Input
          placeholder="e.g. Muhammad Ali"
          value={values.father_name}
          onChange={(e) => onChange({ father_name: e.target.value })}
        />
      </FormField>
      <FormField label="Mother's name" required={required}>
        <Input
          placeholder="e.g. Fatima Ali"
          value={values.mother_name}
          onChange={(e) => onChange({ mother_name: e.target.value })}
        />
      </FormField>
      <FormField label="Father's CNIC" hint="Optional. Format 00000-0000000-0.">
        <Input
          placeholder="00000-0000000-0"
          value={values.father_cnic}
          onChange={(e) => onChange({ father_cnic: e.target.value })}
        />
      </FormField>
      <FormField label="Mother's CNIC" hint="Optional. Format 00000-0000000-0.">
        <Input
          placeholder="00000-0000000-0"
          value={values.mother_cnic}
          onChange={(e) => onChange({ mother_cnic: e.target.value })}
        />
      </FormField>
      <FormField
        label="Home address"
        required={required}
        hint="Street, area, and city details."
        className="sm:col-span-2"
      >
        <textarea
          className="flex min-h-20 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          placeholder="House / street, area, city"
          value={values.address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </FormField>
      <FormField label="City or region">
        <Input
          placeholder="e.g. Lahore"
          value={values.region}
          onChange={(e) => onChange({ region: e.target.value })}
        />
      </FormField>
      <FormField label="Parent phone" hint="Primary contact number for the family." required={required}>
        <Input
          type="tel"
          placeholder="e.g. 0300 1234567"
          value={phoneValue}
          onChange={(e) => {
            if (phoneField === "parent_phone") {
              onChange({ parent_phone: e.target.value, guardian_phone: e.target.value });
            } else {
              onChange({ guardian_phone: e.target.value });
            }
          }}
        />
      </FormField>
      <FormField label="Alternate phone">
        <Input
          type="tel"
          placeholder="Optional second number"
          value={values.parent_alternate_phone}
          onChange={(e) => onChange({ parent_alternate_phone: e.target.value })}
        />
      </FormField>
      <FormField
        label="Parent email"
        required={required}
        hint="Used for the parent portal login. Use the same email for siblings so they share one account. Invite email comes later."
        className={showOccupation ? undefined : "sm:col-span-2"}
      >
        <Input
          type="email"
          placeholder="e.g. parent@email.com"
          value={values.parent_email}
          onChange={(e) => onChange({ parent_email: e.target.value })}
        />
      </FormField>
      {showOccupation ? (
        <FormField label="Parent occupation / profession">
          <Input
            placeholder="e.g. Teacher, business owner"
            value={values.parent_occupation ?? ""}
            onChange={(e) => onChange({ parent_occupation: e.target.value })}
          />
        </FormField>
      ) : null}
    </div>
  );
}
