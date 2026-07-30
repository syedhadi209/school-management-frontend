"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, RotateCcw, Trash2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export function ProfileAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "size-9 text-xs" : "size-14 text-sm";
  return imageUrl ? (
    <img
      src={imageUrl}
      alt={`${name || "Profile"} photo`}
      className={cn("rounded-full border border-border object-cover", dimensions)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-muted font-semibold text-muted-foreground",
        dimensions
      )}
      aria-label={`${name || "Profile"} initials`}
    >
      {initialsFromName(name)}
    </span>
  );
}

export function ProfileImagePicker({
  name,
  imageUrl,
  imageFile,
  clearRequested,
  onFileChange,
  onClearChange,
  onError,
}: {
  name: string;
  imageUrl?: string | null;
  imageFile: File | null;
  clearRequested: boolean;
  onFileChange: (file: File | null) => void;
  onClearChange: (value: boolean) => void;
  onError: (message: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const activeImageUrl = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (clearRequested) return null;
    return imageUrl ?? null;
  }, [clearRequested, imageUrl, previewUrl]);

  function chooseFile() {
    inputRef.current?.click();
  }

  function handleFileSelection(file: File | null) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError("Only JPEG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("Image must be 5 MB or smaller.");
      return;
    }
    onError(null);
    onFileChange(file);
    onClearChange(false);
  }

  function removeImage() {
    onError(null);
    onFileChange(null);
    onClearChange(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-4">
        <ProfileAvatar name={name} imageUrl={activeImageUrl} />
        <div className="space-y-2">
          <p className="text-sm font-medium">Profile photo</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              onClick={chooseFile}
            >
              {activeImageUrl ? <RotateCcw className="size-3.5" /> : <Camera className="size-3.5" />}
              {activeImageUrl ? "Replace" : "Upload"}
            </button>
            {activeImageUrl ? (
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={removeImage}
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Accepts JPG, PNG, or WEBP up to 5 MB.
          </p>
          {clearRequested && !previewUrl ? (
            <p className="text-xs text-amber-700">Current image will be removed when you save.</p>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
