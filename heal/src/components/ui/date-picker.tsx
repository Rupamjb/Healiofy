import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Select date",
  disabled,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  // Check if the date is valid
  const isValidDate = date && isValid(date);
  const [open, setOpen] = React.useState(false);
  
  // Custom handler for date selection that closes the popover
  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      // Slightly delay closing the popover to ensure the calendar updates properly
      setTimeout(() => {
        setOpen(false);
      }, 300);
    }
  };

  // Handle popover open state changes
  const handleOpenChange = (open: boolean) => {
    // If we're closing the popover while interacting with a dropdown, prevent it
    if (!open) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        setOpen(open);
      }, 10);
    } else {
      setOpen(open);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !isValidDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate ? format(date as Date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div onClick={(e) => e.stopPropagation()}>
          <Calendar
            mode="single"
            selected={isValidDate ? date : undefined}
            onSelect={handleSelect}
            initialFocus
            disabled={disabled}
            fromYear={fromYear}
            toYear={toYear}
            className="border rounded-md"
            defaultMonth={date || new Date()}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
} 