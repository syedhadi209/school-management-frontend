"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SelectMenu } from "@/components/data/select-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  fromYear,
  toYear,
  disableFuture = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  /** When true, dates after today cannot be selected (useful for date of birth). */
  disableFuture?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseValue(value);
  const today = React.useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const startMonth = new Date(fromYear ?? currentYear - 30, 0);
  const endMonth = new Date(toYear ?? currentYear, 11);
  const [displayMonth, setDisplayMonth] = React.useState(selected ?? today);
  const firstYear = startMonth.getFullYear();
  const lastYear = endMonth.getFullYear();
  const monthOptions = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => ({
        value: String(month),
        label: format(new Date(2000, month, 1), "MMMM"),
        disabled:
          disableFuture &&
          displayMonth.getFullYear() === currentYear &&
          month > today.getMonth(),
      })),
    [currentYear, disableFuture, displayMonth, today]
  );
  const yearOptions = React.useMemo(
    () =>
      Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
        const year = lastYear - index;
        return { value: String(year), label: String(year) };
      }),
    [firstYear, lastYear]
  );

  React.useEffect(() => {
    const nextSelected = parseValue(value);
    if (nextSelected) setDisplayMonth(nextSelected);
  }, [value]);

  function changeMonth(month: number) {
    setDisplayMonth((current) => new Date(current.getFullYear(), month, 1));
  }

  function changeYear(year: number) {
    setDisplayMonth((current) => {
      const month =
        disableFuture && year === currentYear
          ? Math.min(current.getMonth(), today.getMonth())
          : current.getMonth();
      return new Date(year, month, 1);
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setDisplayMonth(selected ?? today);
      }}
      modal={false}
    >
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            data-empty={!selected}
            className={cn(
              "h-9 w-full justify-start rounded-xl border-input bg-transparent px-3 text-left text-sm font-normal shadow-xs data-[empty=true]:text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-1 p-2">
        <div className="grid grid-cols-[1fr_6.5rem] gap-2 px-1 pb-1">
          <SelectMenu
            value={String(displayMonth.getMonth())}
            onValueChange={(month) => changeMonth(Number(month))}
            options={monthOptions}
            menuLabel="Select month"
            triggerClassName="h-8"
          />
          <SelectMenu
            value={String(displayMonth.getFullYear())}
            onValueChange={(year) => changeYear(Number(year))}
            options={yearOptions}
            menuLabel="Select year"
            triggerClassName="h-8"
            contentClassName="max-h-64 min-w-28"
          />
        </div>
        <Calendar
          mode="single"
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          hideNavigation
          classNames={{ month_caption: "hidden" }}
          selected={selected}
          startMonth={startMonth}
          endMonth={endMonth}
          className="p-0"
          disabled={disableFuture ? { after: today } : undefined}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
