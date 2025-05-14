export default {
  default: {
    listItemLimit: 20,
  },
  cache: {
    minutes: {
      default: 5 * 60,
    },
  },
  apiRequest: {
    autoRetryEnabled: true,
    maxRetries: 5, // Max 5 times
    retryDelay: 2, // 2 seconds
    backgroundRetries: 10, // Max 10 times
    backgroundRetryInterval: 60 * 15, // 15 minutes
    timeout: 30 * 1000, // 30 seconds
  },
  field: {
    minBookingTime: 60, // 1 hour booking is min
    startBookingMinute: ['00', '30'], // booking start or middle hour
    endBookingMinute: ['00', '30'], // interval 30 mins
  },
  refund: {
    minRefundTime: 48, // 48 hours after bookingDate
  },
  email: {
    maxRetry: 2,
  },
};
