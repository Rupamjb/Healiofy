import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  fromYear?: number;
  toYear?: number;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  // Generate years array for the year selector
  const years = React.useMemo(() => {
    if (!fromYear || !toYear) return [];
    return Array.from(
      { length: toYear - fromYear + 1 },
      (_, i) => fromYear + i
    );
  }, [fromYear, toYear]);

  // State for the current month
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date());
  // Track if dropdowns are open to prevent unintended closing
  const [monthSelectOpen, setMonthSelectOpen] = React.useState(false);
  const [yearSelectOpen, setYearSelectOpen] = React.useState(false);

  // Handle month change
  const handleMonthChange = (newMonth: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(newMonth));
    setMonth(newDate);
    
    // If there's an onMonthChange prop, call it
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }

    // Don't immediately close the dropdown
    setTimeout(() => {
      setMonthSelectOpen(false);
    }, 100);
  };

  // Handle year change
  const handleYearChange = (newYear: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(newYear));
    setMonth(newDate);
    
    // If there's an onMonthChange prop, call it
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }

    // Don't immediately close the dropdown
    setTimeout(() => {
      setYearSelectOpen(false);
    }, 100);
  };

  // Update the internal month state when the prop changes
  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month);
    }
  }, [props.month]);

  // Stop event propagation for dropdown clicks to prevent closing parent popovers
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Custom navigation component to handle month/year selection
  const CustomCaption = ({ displayMonth }: CaptionProps) => {
    const currentMonth = displayMonth.getMonth();
    const currentYear = displayMonth.getFullYear();

    return (
      <div className="flex w-full justify-between items-center px-2">
        <div className="flex gap-1" onClick={stopPropagation}>
          {/* Month selector */}
          <div onClick={stopPropagation}>
            <Select 
              open={monthSelectOpen} 
              onOpenChange={setMonthSelectOpen} 
              value={currentMonth.toString()} 
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 w-[100px] text-xs font-medium">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent position="popper">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year selector - only show if years are provided */}
          {years.length > 0 && (
            <div onClick={stopPropagation}>
              <Select 
                open={yearSelectOpen} 
                onOpenChange={setYearSelectOpen} 
                value={currentYear.toString()} 
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs font-medium">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const previousMonth = new Date(displayMonth);
              previousMonth.setMonth(previousMonth.getMonth() - 1);
              setMonth(previousMonth);
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextMonth = new Date(displayMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setMonth(nextMonth);
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={month}
      onMonthChange={setMonth}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Hide the default caption label
        nav: "hidden", // Hide the default navigation
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => null, // Hide default icons
        IconRight: () => null, // Hide default icons
        // Add our custom caption component at the top
        Caption: CustomCaption
      }}
      fromYear={fromYear}
      toYear={toYear}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
