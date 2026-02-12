"use client";
import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { requestPasswordConfirmationCode } from "@omenai/shared-services/requests/requestPasswordConfirmationCode";
import { updatePassword } from "@omenai/shared-services/requests/updatePassword";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { validatePasswordFields } from "@omenai/shared-lib/validations/validatePasswordFields";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
export default function UpdatePasswordForm() {
  const { updatePasswordModalPopup } = actionStore();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [info, setInfo] = useState({
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = () => {
    const password = info.password;
    if (!password) return null;

    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 25;
    else feedback.push("At least 8 characters");

    if (password.length >= 12) strength += 25;

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    else feedback.push("Mix of upper and lowercase");

    if (/[0-9]/.test(password)) strength += 12.5;
    else feedback.push("Include numbers");

    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    else feedback.push("Include special characters");

    return { strength, feedback };
  };

  const passwordData = calculatePasswordStrength();
  const passwordsMatch =
    info.password &&
    info.confirmPassword &&
    info.password === info.confirmPassword;

  const { user, csrf, signOut } = useAuth({ requiredRole: "user" });

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
  }

  async function requestConfirmationCode() {
    setCodeLoading(true);
    const response = await requestPasswordConfirmationCode(
      "individual",
      user.id,
      csrf || "",
    );
    if (response?.isOk)
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
    else
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    setCodeLoading(false);
    setCodeRequested(true);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(value, name, info.password);
    if (!success) setErrorList(errors);
    setInfo((prev) => {
      return { ...prev, [name]: value };
    });
  }
  useEffect(() => {
    setErrorList(validatePasswordFields(info));
  }, [info.password, info.confirmPassword]);

  async function handlePasswordUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const response = await updatePassword(
      info.password,
      info.code,
      "individual",
      user.id,
      csrf || "",
    );

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      updatePasswordModalPopup(false);
      await handleSignOut();
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setLoading(false);
  }

  const getStrengthColor = () => {
    if (!passwordData) return "#e5e7eb";
    const { strength } = passwordData;
    if (strength < 40) return "#ef4444";
    if (strength < 70) return "#f59e0b";
    if (strength < 90) return "#3b82f6";
    return "#10b981";
  };

  const getStrengthText = () => {
    if (!passwordData) return "";
    const { strength } = passwordData;
    if (strength < 40) return "Weak";
    if (strength < 70) return "Fair";
    if (strength < 90) return "Good";
    return "Strong";
  };

  return (
    <div className="flex w-full">
      <div className=" w-full relative">
        {/* Decorative elements */}

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-dark rounded flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-fluid-sm font-bold text-dark">
                Update Password
              </h1>
              <p className="text-fluid-xxs text-dark/20-500 mt-1">
                Secure your account with a strong password
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate}>
          {/* Password Field */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-fluid-xxs font-light text-dark/20-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                onChange={handleInputChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a strong password"
                value={info.password}
                className={`${INPUT_CLASS} ${
                  focusedField === "password"
                    ? "border-dark/80 shadow-sm"
                    : "border-dark/40 hover:border-dark/80"
                }`}
                style={{ outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-dark/60 text-fluid-xxs hover:text-dark/20-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {info.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-light text-dark/20-500">
                    Password strength
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: getStrengthColor() }}
                  >
                    {getStrengthText()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="flex-1 h-1.5 rounded transition-all duration-300"
                      style={{
                        backgroundColor:
                          passwordData &&
                          passwordData.strength >= level * 25 - 5
                            ? getStrengthColor()
                            : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                {(passwordData?.feedback?.length ?? 0) > 0 && (
                  <div className="mt-2">
                    {passwordData?.feedback?.map((tip, i) => (
                      <p
                        key={i}
                        className="text-xs text-dark/20-500 flex items-center gap-1 mt-1"
                      >
                        <span className="w-1 h-1 bg-dark/60 text-fluid-xxs rounded"></span>
                        {tip}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-5">
            <label
              htmlFor="confirmPassword"
              className="block text-fluid-xxs font-light text-dark/20-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                onChange={handleInputChange}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField("")}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                required
                value={info.confirmPassword}
                className={`${INPUT_CLASS} ${
                  focusedField === "confirmPassword"
                    ? "border-dark/80 shadow-sm"
                    : "border-dark/40 hover:border-dark/80"
                }`}
                style={{ outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-dark/60 text-fluid-xxs hover:text-dark/20-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMatch && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle size={14} />
                <span className="text-xs font-light">Passwords match</span>
              </div>
            )}
          </div>

          {/* Confirmation Code Field */}
          <div className="mb-6">
            <label
              htmlFor="code"
              className="block text-fluid-xxs font-light text-dark/20-700 mb-2"
            >
              Verification Code
            </label>
            <div className="relative">
              <input
                onChange={handleInputChange}
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField("")}
                name="code"
                type="text"
                placeholder="Enter 6-digit code"
                required
                value={info.code}
                className={`${INPUT_CLASS} ${
                  focusedField === "code"
                    ? "border-dark/80 shadow-sm"
                    : "border-dark/40 hover:border-dark/80"
                }`}
                style={{ outline: "none" }}
              />
              <button
                type="button"
                onClick={requestConfirmationCode}
                disabled={
                  loading ||
                  errorList.length > 0 ||
                  info.confirmPassword === "" ||
                  info.password === "" ||
                  codeLoading
                }
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded text-xs font-light transition-all duration-200 grid place-items-center disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-dark ${
                  loading ||
                  errorList.length > 0 ||
                  !info.confirmPassword ||
                  !info.password ||
                  codeLoading
                    ? "bg-dark/20 text-dark/60 text-fluid-xxs cursor-not-allowed"
                    : "bg-dark text-white hover:bg-dark/80"
                }`}
              >
                {codeLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : codeRequested ? (
                  "Resend"
                ) : (
                  "Get code"
                )}
              </button>
            </div>
            {codeRequested && (
              <p className="text-xs text-dark/20-500 mt-2">
                Verification code sent to your email
              </p>
            )}
          </div>

          {/* Error Messages */}
          {errorList.length > 0 && (
            <div className="mb-5 space-y-2">
              {errorList.map((error, index) => (
                <div
                  key={`${error}-${index}`}
                  className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded"
                >
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-fluid-xxs text-red-700">{error}</p>
                </div>
              ))}
            </div>
          )}
          {/* Security Note */}
          <div className=" p-4 bg-dark/20-50 rounded border border-dark/40">
            <div className="flex gap-3">
              <AlertCircle className="w-4 h-4 text-dark/20-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-dark/20-600 space-y-1">
                <p className="font-light">Security tips:</p>
                <p>
                  It is highly recommended to change your password regularly.
                  <br />
                  After updating your password, you'll need to sign in again on
                  all your devices for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={
              loading ||
              errorList.length > 0 ||
              info.code === "" ||
              info.confirmPassword === "" ||
              info.password === ""
            }
            type="submit"
            className={`w-full h-12 mt-6 rounded text-fluid-xxs font-light transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ||
              errorList.length > 0 ||
              !info.code ||
              !info.confirmPassword ||
              !info.password
                ? "bg-dark/20 text-dark/60 text-fluid-xxs cursor-not-allowed"
                : "bg-dark text-white hover:bg-dark/80 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
