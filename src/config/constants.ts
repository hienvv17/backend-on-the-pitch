export default {
  default: {
    listItemLimit: 20,
  },
  cache: {
    minutes: {
      user: 5,
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
};
