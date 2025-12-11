// hooks/useWaitlistForm.ts
import { useState, ChangeEvent } from "react";
import { ValidationErrors } from "./FormValidation";

export function useWaitlistForm<T extends Record<string, string>>(
  initialValues: T
) {
  const [form, setForm] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm,
  };
}
