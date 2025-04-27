/**
 * Configuration settings for appointments functionality
 */

// Cancellation window in hours
// 0 means cancellation is allowed up until the appointment start time
// 1 means cancellation must be done at least 1 hour before
// This should match the server configuration
export const CANCELLATION_WINDOW_HOURS = 0;

// Format to display appointment dates
export const DATE_FORMAT = "MMMM d, yyyy";

// Format to display appointment times 
export const TIME_FORMAT = "h:mm a";

// Get a human-readable description of the cancellation policy
export const getCancellationPolicyText = (): string => {
  if (CANCELLATION_WINDOW_HOURS === 0) {
    return "Appointments can be cancelled any time before they start";
  } else if (CANCELLATION_WINDOW_HOURS === 1) {
    return "Appointments must be cancelled at least 1 hour before the scheduled time";
  } else {
    return `Appointments must be cancelled at least ${CANCELLATION_WINDOW_HOURS} hours before the scheduled time`;
  }
}; 