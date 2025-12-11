// utils/formValidation.ts or wherever you keep shared utilities

export interface ValidationErrors {
  name?: string;
  email?: string;
  code?: string;
}

export interface WaitlistFormData {
  name: string;
  email: string;
}

export interface InviteFormData {
  code: string;
  email: string;
}

function validateEmail(email: string): string | undefined {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 320) {
    return "Email address is too long";
  }

  const atIndex = trimmedEmail.indexOf("@");
  const lastDotIndex = trimmedEmail.lastIndexOf(".");

  if (
    atIndex < 1 ||
    lastDotIndex < atIndex + 2 ||
    lastDotIndex >= trimmedEmail.length - 1 ||
    trimmedEmail.includes("@@") ||
    /\s/.test(trimmedEmail)
  ) {
    return "Please enter a valid email address";
  }

  return undefined;
}

function validateName(name: string): string | undefined {
  if (!name || name.trim() === "") {
    return "Name is required";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (name.trim().length > 100) {
    return "Name must not exceed 100 characters";
  }

  return undefined;
}

function validateCode(code: string): string | undefined {
  if (!code || code.trim() === "") {
    return "Code is required";
  }

  if (code.trim().length < 2) {
    return "Code must be at least 2 characters long";
  }

  if (code.trim().length > 100) {
    return "Code must not exceed 100 characters";
  }

  return undefined;
}

export function validateWaitlistForm(data: WaitlistFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function validateInviteForm(data: InviteFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  const codeError = validateCode(data.code);
  if (codeError) errors.code = codeError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
