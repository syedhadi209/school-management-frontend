"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  hint?: string;
}

export function AuthField({ label, hint, className, id, ...props }: AuthFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={fieldId}
        className={cn("h-11 rounded-xl text-base", className)}
        {...props}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface PasswordFieldProps extends Omit<React.ComponentProps<"input">, "type"> {
  label: string;
  hint?: string;
}

export function PasswordField({ label, hint, className, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? "password";
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn("h-11 rounded-xl pr-10 text-base", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
