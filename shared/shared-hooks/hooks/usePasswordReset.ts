import { useState, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { validatePasswordFields } from "@omenai/shared-lib/validations/validatePasswordFields";
import { requestPasswordConfirmationCode } from "@omenai/shared-services/requests/requestPasswordConfirmationCode";
import { validate } from "@omenai/shared-lib/validations/validatorGroup";

type UserRole = "gallery" | "artist";

export function usePasswordReset(role: UserRole) {
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLoading, setCodeLoading] = useState<boolean>(false);
  const [info, setInfo] = useState({
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [errorList, setErrorList] = useState<string[]>([]);
  const { user, csrf } = useAuth({ requiredRole: role });

  async function requestConfirmationCode() {
    setCodeLoading(true);

    // Get the correct ID based on role
    const userId = user.role === "gallery" ? user.gallery_id : user.artist_id;

    const response = await requestPasswordConfirmationCode(
      role,
      userId,
      csrf || ""
    );

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: response.message,
        style: { background: "green", color: "white" },
        className: "class",
      });
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: { background: "red", color: "white" },
        className: "class",
      });
    }

    setCodeLoading(false);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    setErrorList([]);
    const { success, errors } = validate(value, name, info.password);

    if (!success) {
      setErrorList(errors);
    } else {
      setInfo((prev) => ({ ...prev, [name]: value }));
    }
  }

  useEffect(() => {
    setErrorList(validatePasswordFields(info));
  }, [info.password, info.confirmPassword]);

  return {
    loading,
    setLoading,
    codeLoading,
    info,
    setInfo,
    errorList,
    user,
    csrf,
    requestConfirmationCode,
    handleInputChange,
  };
}
