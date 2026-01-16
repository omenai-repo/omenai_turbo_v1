"use client";
import ComponentWrapper from "./components/ComponentWrapper";

import {
  notFound,
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { useContext, useEffect, useState } from "react";
import { getApiUrl, auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function OrderPaymentClientWrapper({
  order_id,
}: {
  order_id: string;
}) {
  const router = useRouter();
  const route = usePathname();
  const url = getApiUrl();
  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchParams = useSearchParams();
  const user_id_key = searchParams.get("id_key");

  const auth_url = auth_uri();
  const { user } = useAuth({ requiredRole: "user" });

  useEffect(() => {
    if (user_id_key === "" || undefined) notFound();
    if (user.id !== user_id_key) {
      toast.error("Error notification", {
        description:
          "Unauthorized access detected. Please login to the appropriate account to access this page",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      set_redirect_uri(`${url}${route}?id_key=${user_id_key}`);
      router.replace(`${auth_url}/login`);
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  return <ComponentWrapper order_id={order_id} isLoggedIn={isLoggedIn} />;
}
