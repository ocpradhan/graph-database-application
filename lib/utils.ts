import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZodErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const fieldName = issue.path[0]?.toString();
    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  });
  return fieldErrors;
}
