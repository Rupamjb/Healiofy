import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths, getDaysInMonth, isSameDay, startOfMonth, getDay } from "date-fns";
import { Clock, IndianRupee, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Doctor } from "../../services/doctorService";
import { bookAppointment } from "../../services/appointmentService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/currencyFormatter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

interface AppointmentFormProps {
  doctor: Doctor;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

// Component for the custom calendar
const SimpleCalendar = ({ 
  value, 
  onChange, 
  disabledDates 
}: { 
  value?: Date, 
  onChange: (date: Date) => void,
  disabledDates?: (date: Date) => boolean 
}) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value || today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Get days for the current month view
  const getDaysForMonth = (date: Date) => {
    const firstDayOfMonth = startOfMonth(date);
    const daysInMonth = getDaysInMonth(date);
    const dayOfWeek = getDay(firstDayOfMonth);
    
    const days: (Date | null)[] = Array(dayOfWeek).fill(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
      days.push(dayDate);
    }
    
    return days;
  };
  
  const days = getDaysForMonth(viewDate);
  
  // Month navigation
  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  // For month selection
  const handleMonthChange = (month: string) => {
    setViewDate(prev => new Date(prev.getFullYear(), parseInt(month), 1));
  };
  
  // For year selection
  const handleYearChange = (year: string) => {
    setViewDate(prev => new Date(parseInt(year), prev.getMonth(), 1));
  };
  
  // Check if a date is disabled
  const isDisabled = (date: Date | null) => {
    if (!date) return true;
    return disabledDates ? disabledDates(date) : false;
  };
  
  // Select a date
  const selectDate = (date: Date | null) => {
    if (date && !isDisabled(date)) {
      onChange(date);
      setCalendarOpen(false);
    }
  };
  
  // Generate years for selection (from current year to current year + 2)
  const years = Array.from(
    { length: 3 },
    (_, i) => (today.getFullYear() + i).toString()
  );

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-3">
          {/* Calendar header with month/year selectors */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Select
                value={viewDate.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(0, i), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={viewDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="icon"
                onClick={prevMonth}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={nextMonth}
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
              <Button
                key={i}
                variant={date && isSameDay(date, value || new Date(-1)) ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 p-0 font-normal",
                  !date && "invisible",
                  date && isSameDay(date, today) && "bg-gray-100",
                  date && isDisabled(date) && "text-gray-300 cursor-not-allowed hover:bg-transparent"
                )}
                disabled={!date || isDisabled(date)}
                onClick={() => selectDate(date)}
              >
                {date?.getDate()}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function AppointmentForm({ doctor, onSuccess, onCancel }: AppointmentFormProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { subscriptionStatus, checkAccess } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Custom date handler for appointment booking
  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isAuthenticated) {
      setError("Please sign in to book an appointment");
      return;
    }

    if (!date || !time) {
      setError("Please select both date and time");
      return;
    }

    // Check subscription status for consultation access
    if (subscriptionStatus?.status === 'trial' && subscriptionStatus.trialConsultationsRemaining <= 0) {
      setError("You've used all your free consultations. Subscribe to book more appointments.");
      
      // Direct to subscription page
      const redirectPath = encodeURIComponent(window.location.pathname);
      setTimeout(() => {
        navigate(`/subscription?redirect=${redirectPath}&service=doctor consultations`);
        if (onCancel) onCancel();
      }, 2000);
      
      return;
    }

    // Check if user has access to consultation service
    if (!checkAccess('consultation')) {
      setError("Your subscription doesn't allow booking appointments. Please upgrade your plan.");
      
      // Direct to subscription page
      const redirectPath = encodeURIComponent(window.location.pathname);
      setTimeout(() => {
        navigate(`/subscription?redirect=${redirectPath}&service=doctor consultations`);
        if (onCancel) onCancel();
      }, 2000);
      
      return;
    }

    setIsLoading(true);
    try {
      // Create ISO date string by combining date and time
      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Book the appointment
      await bookAppointment(doctor._id, appointmentDate.toISOString());
      
      toast({
        title: "Appointment booked",
        description: `Your appointment with ${doctor.name} has been scheduled.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error booking appointment:", err);
      setError(err.message || "Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to disable dates in the past and more than 2 months in the future
  const disableDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoMonthsFromNow = addMonths(today, 2);
    
    return date < today || date > twoMonthsFromNow;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-center">Book Appointment with {doctor.name}</h3>
      <p className="text-gray-600 mb-2 text-center text-sm">{doctor.specialty} • {doctor.experience}</p>
      <p className="text-medical-primary font-medium mb-4 text-center">
        <span className="inline-flex items-center">
          <IndianRupee className="h-3 w-3 mr-1" />
          {formatCurrency(doctor.price || 0)} / session
        </span>
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Date</label>
          <SimpleCalendar
            value={date}
            onChange={handleDateChange}
            disabledDates={disableDates}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Time</label>
          <Select onValueChange={setTime} value={time}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time">
                {time ? (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {time}
                  </div>
                ) : (
                  "Select time"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {slot}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="submit"
            className="w-full bg-medical-primary hover:bg-medical-primary/90"
            disabled={!date || !time || isLoading}
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 