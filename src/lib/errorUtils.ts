type ErrorWithData = {
  data?: {
    message?: unknown;
  };
  error?: unknown;
  message?: unknown;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  const maybeError = error as ErrorWithData;

  if (typeof maybeError?.data?.message === "string") {
    return maybeError.data.message;
  }

  if (typeof maybeError?.message === "string") {
    return maybeError.message;
  }

  if (typeof maybeError?.error === "string") {
    return maybeError.error;
  }

  return fallback;
};
