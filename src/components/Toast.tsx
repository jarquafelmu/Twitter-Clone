import { TRPCError } from "@trpc/server";
import toast, { type ToastOptions } from "react-hot-toast";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error || error instanceof TRPCError)
    return error.message;
  return String(error);
};

export const toastError = (
  error: unknown,
  toastId?: string,
  options?: ToastOptions
) => {
  const message = getErrorMessage(error);
  toast.error(message, { ...options, id: toastId });
};
