/**
 * Configuration for appointment cancellation
 * 
 * This file centralizes cancellation policy configuration for easier management
 */

// Default cancellation window (in hours) if not set in environment variables
// 0 means cancellation is allowed up until the appointment start time
// 1 means cancellation must be done at least 1 hour before the appointment
// 24 means cancellation must be done at least 24 hours before the appointment
const DEFAULT_CANCELLATION_WINDOW_HOURS = 0;

/**
 * Get the configured cancellation window in hours
 * @returns {number} Cancellation window in hours
 */
const getCancellationWindowHours = () => {
  const envValue = process.env.CANCELLATION_WINDOW_HOURS;
  if (envValue !== undefined && !isNaN(Number(envValue))) {
    return Number(envValue);
  }
  return DEFAULT_CANCELLATION_WINDOW_HOURS;
};

module.exports = {
  getCancellationWindowHours
}; 