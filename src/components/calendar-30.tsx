"use client"

import * as React from "react"
import { formatDateRange } from "little-date"
import { ChevronDownIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Calendar30Props {
  selected?: DateRange | undefined;
  onSelect?: (range: DateRange | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

export default function Calendar30({
  selected,
  onSelect,
  label = "Select your stay",
  placeholder = "Select date",
  disabled
}: Calendar30Props) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 4),
    to: new Date(2025, 5, 10),
  })

  // Use controlled state if provided, otherwise use internal state
  const range = selected !== undefined ? selected : internalRange;
  const setRange = onSelect || setInternalRange;

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="dates" className="px-1">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dates"
            className="w-full justify-between font-normal"
          >
            {range?.from && range?.to
              ? formatDateRange(range.from, range.to, {
                includeTime: false,
              })
              : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            captionLayout="dropdown"
            onSelect={(range) => {
              setRange(range)
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
