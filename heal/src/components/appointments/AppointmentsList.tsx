import { useState, useEffect } from "react";
import { 
  getUserAppointments, 
  updateAppointmentStatus, 
  debugAppointmentApi,
  setSuccessfulEndpoint,
  hasPendingAppointmentSyncs,
  syncPendingAppointments
} from "../../services/appointmentService";
import { format, parseISO, isBefore, addHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle, Clock, Info } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CANCELLATION_WINDOW_HOURS,
  DATE_FORMAT,
  TIME_FORMAT,
  getCancellationPolicyText
} from "@/config/appointmentConfig";
import axios from "axios";
import { authHeader } from "../../services/authService";

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancellation, setConfirmingCancellation] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cannotCancel, setCannotCancel] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasPendingSyncs, setHasPendingSyncs] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Helper to get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  // Check for pending syncs periodically
  useEffect(() => {
    const checkPendingSyncs = () => {
      setHasPendingSyncs(hasPendingAppointmentSyncs());
    };
    
    // Check immediately and then every 5 seconds
    checkPendingSyncs();
    const interval = setInterval(checkPendingSyncs, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle manual sync
  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Cannot Sync",
        description: "You are offline. Connect to the internet to sync changes.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncPendingAppointments();
      setHasPendingSyncs(hasPendingAppointmentSyncs());
      if (!hasPendingAppointmentSyncs()) {
        toast({
          title: "Sync Complete",
          description: "All appointment changes have been synchronized with the server."
        });
      } else {
        toast({
          title: "Partial Sync",
          description: "Some changes couldn't be synchronized. Will retry automatically when possible.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing appointments:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize appointment changes. Will retry automatically.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "You're back online. Your changes will be synchronized.",
      });
      // Refresh data when coming back online
      fetchAppointments();
      // Try to sync any pending changes
      syncPendingAppointments();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're now offline. Some features may be limited.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setCannotCancel(false);
    try {
      const data = await getUserAppointments();
      console.log("Fetched appointments:", data);
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Debug API configuration
  const runApiDebug = () => {
    debugAppointmentApi();
    toast({
      title: "Debug Info",
      description: "API configuration info logged to console",
    });
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      setCancellingId(id);
      console.log("Cancelling appointment with ID:", id);
      
      // Log current appointments to check the ID format
      console.log("Current appointments:", appointments);
      const appointmentToCancel = appointments.find(a => a._id === id);
      console.log("Appointment to cancel:", appointmentToCancel);
      
      // Attempt to cancel via API, will use mock mode if API is down
      const updatedAppointment = await updateAppointmentStatus(id, "cancelled");
      console.log("Appointment cancelled, received:", updatedAppointment);
      
      if (updatedAppointment) {
        // Update the local state
        setAppointments(appointments.map(appt => 
          appt._id === id ? updatedAppointment : appt
        ));
        
        toast({
          title: "Appointment cancelled",
          description: "Your appointment has been successfully cancelled."
        });
        setCannotCancel(false);
      } else {
        // If we get here, something went wrong but didn't throw an error
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Appointment marked as cancelled, but we couldn't confirm with the server. Changes may not be saved when you reconnect."
        });
        
        // Still update the UI to show it as cancelled
        setAppointments(appointments.map(appt => 
          appt._id === id 
            ? {...appt, status: "cancelled", updatedAt: new Date().toISOString()} 
            : appt
        ));
      }
    } catch (err: any) {
      console.error("Error in cancellation:", err);
      
      // Create a more user-friendly message
      let errorMessage = err.message || "Failed to cancel appointment. Please try again.";
      if (errorMessage.includes("endpoint not found") || errorMessage.includes("404")) {
        errorMessage = "The server couldn't find the appointment to cancel. The system may be experiencing technical difficulties.";
      } else if (errorMessage.includes("No response received")) {
        errorMessage = "Couldn't connect to the server. Please check your internet connection and try again.";
      }
      
      // Only show cannot cancel UI if we're having a real failure
      if (!navigator.onLine || err.message?.includes("No response received")) {
        toast({
          variant: "destructive",
          title: "Offline Mode",
          description: "You appear to be offline. Your cancellation will be processed when you reconnect."
        });
        
        // Still update the UI to show it as cancelled (optimistic update)
        setAppointments(appointments.map(appt => 
          appt._id === id 
            ? {...appt, status: "cancelled", updatedAt: new Date().toISOString()} 
            : appt
        ));
      } else {
        setCannotCancel(true);
        toast({
          title: "Error cancelling appointment",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setConfirmingCancellation(null);
      setCancellingId(null);
    }
  };

  // Hard refresh (reload page) function
  const hardRefresh = () => {
    window.location.reload();
  };

  // Check if an appointment is cancellable based on time constraints
  const isCancellable = (appointmentDate: Date) => {
    const now = new Date();
    
    // If appointment is in the past, it's not cancellable
    if (isBefore(appointmentDate, now)) {
      return false;
    }
    
    // If there's a cancellation window, check if we're still within it
    if (CANCELLATION_WINDOW_HOURS > 0) {
      const cancellationDeadline = new Date(appointmentDate);
      cancellationDeadline.setHours(cancellationDeadline.getHours() - CANCELLATION_WINDOW_HOURS);
      return isBefore(now, cancellationDeadline);
    }
    
    // Otherwise, any future appointment can be cancelled
    return true;
  };

  // Function to store successful endpoint in localStorage
  const storeSuccessfulEndpoint = (url: string, method: string) => {
    try {
      localStorage.setItem('successfulAppointmentEndpoint', JSON.stringify({ url, method }));
      console.log('Saved successful endpoint to localStorage:', { url, method });
    } catch (error) {
      console.error('Error saving endpoint to localStorage:', error);
    }
  };

  // Function to get successful endpoint from localStorage
  const getStoredEndpoint = () => {
    try {
      const stored = localStorage.getItem('successfulAppointmentEndpoint');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading endpoint from localStorage:', error);
    }
    return null;
  };

  // Manual test for appointment cancellation
  const testCancellation = async (appointment: any) => {
    if (!appointment) {
      toast({
        title: "No appointment selected",
        description: "Please select an appointment to test cancellation",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Clean up the id parameter
    const cleanId = appointment._id.trim();
    
    // Check if we have a stored successful endpoint
    const storedEndpoint = getStoredEndpoint();
    if (storedEndpoint) {
      try {
        console.log(`Trying stored successful endpoint: ${storedEndpoint.url} with method ${storedEndpoint.method}`);
        // Replace any ID in the URL with the current ID
        const url = storedEndpoint.url.replace(/\/[a-f0-9]{24}(?:\/|$)/, `/${cleanId}`);
        
        const response = await axios({
          method: storedEndpoint.method,
          url,
          headers: authHeader(),
          data: { status: 'cancelled' },
          timeout: 10000
        });
        
        console.log('Update successful using stored endpoint:', response.data);
        toast({
          title: "Success!",
          description: "Appointment cancelled using stored endpoint.",
        });
        
        // Update the appointment in the local state first
        setAppointments(prev => prev.map(a => 
          a._id === cleanId 
            ? { ...a, status: 'cancelled', updatedAt: new Date().toISOString() } 
            : a
        ));
        
        // Save to localStorage for offline access
        try {
          const cachedAppointments = localStorage.getItem('cachedAppointments');
          if (cachedAppointments) {
            const appointments = JSON.parse(cachedAppointments);
            const updatedAppointments = appointments.map((a: any) => 
              a._id === cleanId 
                ? { ...a, status: 'cancelled', updatedAt: new Date().toISOString() } 
                : a
            );
            localStorage.setItem('cachedAppointments', JSON.stringify(updatedAppointments));
          }
        } catch (e) {
          console.error('Error updating cached appointments', e);
        }
        
        setLoading(false);
        return;
      } catch (error) {
        console.log('Stored endpoint failed, trying alternatives');
        // Continue to try other endpoints
      }
    }
    
    // Define different endpoint variations to test
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const endpointVariations = [
      // Path parameter variations
      { url: `${apiUrl}/appointments/${cleanId}`, method: 'PATCH' },
      { url: `${apiUrl}/appointments/status/${cleanId}`, method: 'PUT' },
      { url: `${apiUrl}/appointment/${cleanId}`, method: 'PATCH' },
      { url: `${apiUrl}/appointment/status/${cleanId}`, method: 'PUT' },
      
      // Query parameter variations
      { url: `${apiUrl}/appointments?id=${cleanId}`, method: 'PATCH' },
      { url: `${apiUrl}/appointment?id=${cleanId}`, method: 'PATCH' },
      { url: `${apiUrl}/appointments/status?id=${cleanId}`, method: 'PUT' },
      { url: `${apiUrl}/appointment/status?id=${cleanId}`, method: 'PUT' },
      
      // Additional forms
      { url: `${apiUrl}/updateAppointment/${cleanId}`, method: 'POST' },
      { url: `${apiUrl}/cancelAppointment/${cleanId}`, method: 'POST' }
    ];
    
    const testResults = [];
    const successfulEndpoints = [];
    
    // Try each endpoint
    for (const endpoint of endpointVariations) {
      try {
        console.log(`Testing endpoint: ${endpoint.url} with method ${endpoint.method}`);
        
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          headers: authHeader(),
          data: { status: 'cancelled' },
          timeout: 10000
        });
        
        console.log(`Endpoint ${endpoint.url} succeeded:`, response.data);
        testResults.push({ endpoint, success: true });
        successfulEndpoints.push(endpoint);
        
        // Store first successful endpoint for future use
        if (successfulEndpoints.length === 1) {
          // Call both the service function and store locally
          setSuccessfulEndpoint(endpoint.url, endpoint.method);
          storeSuccessfulEndpoint(endpoint.url, endpoint.method);
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint.url} failed:`, error);
        testResults.push({ endpoint, success: false, error });
      }
    }
    
    console.log('Endpoint test results:', testResults);
    
    if (successfulEndpoints.length > 0) {
      toast({
        title: "Success!",
        description: `Found ${successfulEndpoints.length} working endpoint(s). Appointment cancelled.`,
      });
      
      // Update the appointment in the local state
      setAppointments(prev => prev.map(a => 
        a._id === cleanId 
          ? { ...a, status: 'cancelled', updatedAt: new Date().toISOString() } 
          : a
      ));
      
      // Save to localStorage for offline access
      try {
        const cachedAppointments = localStorage.getItem('cachedAppointments');
        if (cachedAppointments) {
          const appointments = JSON.parse(cachedAppointments);
          const updatedAppointments = appointments.map((a: any) => 
            a._id === cleanId 
              ? { ...a, status: 'cancelled', updatedAt: new Date().toISOString() } 
              : a
          );
          localStorage.setItem('cachedAppointments', JSON.stringify(updatedAppointments));
        }
      } catch (e) {
        console.error('Error updating cached appointments', e);
      }
    } else {
      // If all endpoints failed but we're in a test context, still update UI optimistically
      toast({
        variant: "destructive",
        title: "API Unavailable",
        description: "All endpoints failed, but we'll update the UI. This is a testing mode only.",
      });
      
      // Update the appointment in the local state for testing purposes
      setAppointments(prev => prev.map(a => 
        a._id === cleanId 
          ? { ...a, status: 'cancelled', updatedAt: new Date().toISOString() } 
          : a
      ));
    }
    
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to view your appointments.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-10 w-10 text-medical-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAppointments}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-700">No appointments found</h3>
        <p className="text-gray-500 mt-2">
          You haven't booked any appointments yet.
        </p>
      </div>
    );
  }

  if (cannotCancel) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cancellation Issue Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              We're having trouble cancelling appointments. This could be due to a connection issue or server problem.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={fetchAppointments}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                variant="default"
                onClick={hardRefresh}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Reload Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="opacity-75">
          {appointments.map((appointment) => {
            const doctor = appointment.doctorId || {};
            const appointmentDate = parseISO(appointment.date);
            const formattedDate = format(appointmentDate, DATE_FORMAT);
            const formattedTime = format(appointmentDate, TIME_FORMAT);
            const canCancel = appointment.status !== "cancelled" && isCancellable(appointmentDate);
            
            return (
              <Card key={appointment._id} className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-900">{doctor.name || "Unknown Doctor"}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{doctor.specialty || "Specialty not available"}</CardDescription>
                    </div>
                    <Badge className={`rounded-full py-1 px-2.5 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Date</div>
                      <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Time</div>
                      <div className="text-sm font-medium text-gray-900">{formattedTime}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Status</div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{appointment.status}</div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3 pb-4 border-t flex justify-center">
                  {canCancel ? (
                    <Dialog open={confirmingCancellation === appointment._id} onOpenChange={(open) => {
                      if (!open) setConfirmingCancellation(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-4 py-1 text-sm font-medium shadow-sm transition-all"
                          onClick={() => setConfirmingCancellation(appointment._id)}
                          disabled={cancellingId === appointment._id}
                        >
                          {cancellingId === appointment._id ? (
                            <div className="flex items-center">
                              <Loader className="h-3 w-3 mr-2 animate-spin" />
                              <span>Cancelling...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg className="h-3 w-3 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>Cancel Appointment</span>
                            </div>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Cancel Appointment</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your appointment with {doctor.name || "Unknown Doctor"} on {formattedDate} at {formattedTime}?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-md">
                          <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            Please note that frequent cancellations may affect your ability to book appointments with this doctor in the future.
                          </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            onClick={() => setConfirmingCancellation(null)}
                            className="border-gray-200 text-gray-700"
                          >
                            Keep Appointment
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={cancellingId === appointment._id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cancellingId === appointment._id ? (
                              <div className="flex items-center">
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>Confirm Cancellation</span>
                              </div>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : appointment.status !== "cancelled" && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      {isBefore(appointmentDate, new Date()) 
                        ? "This appointment has already occurred" 
                        : `Cancellation window has passed`}
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Appointments</h2>
        <div className="flex gap-2 items-center">
          {!isOnline && (
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Offline Mode
            </span>
          )}
          {hasPendingSyncs && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center text-xs"
            >
              {isSyncing ? (
                <>
                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Sync Changes
                </>
              )}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAppointments}
            className="flex items-center"
          >
            <svg 
              className="h-4 w-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Refresh
          </Button>
        </div>
      </div>
      
      {!isOnline && (
        <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You're currently offline. You can still view and manage your appointments, 
            but changes will be synchronized when you reconnect to the internet.
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && hasPendingSyncs && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <Clock className="h-4 w-4" />
          <AlertTitle>Pending Changes</AlertTitle>
          <AlertDescription>
            You have appointment changes that need to be synchronized with the server.
            Synchronization will happen automatically, or you can click the "Sync Changes" button.
          </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Cancellation Policy</AlertTitle>
        <AlertDescription>
          {getCancellationPolicyText()}
        </AlertDescription>
      </Alert>
      
      {appointments.map((appointment) => {
        const doctor = appointment.doctorId || {};
        const appointmentDate = parseISO(appointment.date);
        const formattedDate = format(appointmentDate, DATE_FORMAT);
        const formattedTime = format(appointmentDate, TIME_FORMAT);
        const canCancel = appointment.status !== "cancelled" && isCancellable(appointmentDate);
        
        return (
          <Card key={appointment._id} className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-gray-900">{doctor.name || "Unknown Doctor"}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{doctor.specialty || "Specialty not available"}</CardDescription>
                </div>
                <Badge className={`rounded-full py-1 px-2.5 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Date</div>
                  <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Time</div>
                  <div className="text-sm font-medium text-gray-900">{formattedTime}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs uppercase tracking-wide font-medium text-gray-500 mb-1">Status</div>
                  <div className="text-sm font-medium text-gray-900 capitalize">{appointment.status}</div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-3 pb-4 border-t flex justify-center">
              {canCancel ? (
                <Dialog open={confirmingCancellation === appointment._id} onOpenChange={(open) => {
                  if (!open) setConfirmingCancellation(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-4 py-1 text-sm font-medium shadow-sm transition-all"
                      onClick={() => setConfirmingCancellation(appointment._id)}
                      disabled={cancellingId === appointment._id}
                    >
                      {cancellingId === appointment._id ? (
                        <div className="flex items-center">
                          <Loader className="h-3 w-3 mr-2 animate-spin" />
                          <span>Cancelling...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="h-3 w-3 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Cancel Appointment</span>
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your appointment with {doctor.name || "Unknown Doctor"} on {formattedDate} at {formattedTime}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-md">
                      <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        Please note that frequent cancellations may affect your ability to book appointments with this doctor in the future.
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmingCancellation(null)}
                        className="border-gray-200 text-gray-700"
                      >
                        Keep Appointment
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancellingId === appointment._id}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {cancellingId === appointment._id ? (
                          <div className="flex items-center">
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span>Confirm Cancellation</span>
                          </div>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : appointment.status !== "cancelled" && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  {isBefore(appointmentDate, new Date()) 
                    ? "This appointment has already occurred" 
                    : `Cancellation window has passed`}
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 