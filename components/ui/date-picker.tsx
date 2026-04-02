"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: string;
  onChange?: (date: string) => void;
  className?: string;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function DatePicker({
  date,
  onChange,
  className,
  placeholder = "Pick a date",
  open,
  onOpenChange,
  defaultOpen,
}: DatePickerProps) {
  const selectedDate = date ? parseISO(date) : undefined;

  return (
    <Popover open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9 rounded-lg border-input bg-background shadow-xs px-3",
              !date && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
        {selectedDate && isValid(selectedDate) ? (
          format(selectedDate, "PPP")
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 border-none shadow-none" data-slot="calendar">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              onChange?.(format(d, "yyyy-MM-dd"));
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
