"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  isEditMode: boolean;
  type?: "text" | "multiline" | "number" | "date";
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function EditableField({
  value,
  onChange,
  isEditMode,
  type = "text",
  className,
  placeholder = "Click to edit",
  style,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (type !== "multiline") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editing, type]);

  if (!isEditMode) {
    return (
      <span className={className} style={style}>
        {value || <span className="opacity-30">{placeholder}</span>}
      </span>
    );
  }

  if (editing) {
    const sharedProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(e.target.value),
      onBlur: () => setEditing(false),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (type !== "multiline" && e.key === "Enter") setEditing(false);
        if (e.key === "Escape") setEditing(false);
      },
      className: cn(
        "bg-transparent outline-none w-full resize-none",
        "border border-dashed border-blue-400 rounded px-1",
        className,
      ),
      style,
    };

    if (type === "multiline") {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...sharedProps}
          rows={Math.max(3, value.split("\n").length)}
        />
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          date={value}
          onChange={(val) => {
            onChange(val);
            setEditing(false);
          }}
          onOpenChange={(open) => {
            if (!open) setEditing(false);
          }}
          defaultOpen={true}
          className={cn("h-7 px-1 min-w-[120px]", className)}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === "number" ? "number" : "text"}
        {...sharedProps}
      />
    );
  }

  return (
    <span
      className={cn(
        "cursor-text rounded px-1 transition-colors",
        "hover:border hover:border-dashed hover:border-blue-300",
        "border border-transparent",
        className,
      )}
      style={style}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="opacity-30">{placeholder}</span>}
    </span>
  );
}
