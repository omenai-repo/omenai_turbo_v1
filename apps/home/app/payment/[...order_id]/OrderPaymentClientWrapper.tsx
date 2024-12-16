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
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { getApiUrl } from "@omenai/url-config/src/config";

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

  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (session === null) {
      toast.error("Error notification", {
        description: "Please login to your account",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      router.replace("/auth/login");
    }
    if (user_id_key === "" || undefined) notFound();
    if (session === undefined || session.user_id !== user_id_key) {
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
      router.replace("/auth/login/");
    } else {
      setIsLoggedIn(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ComponentWrapper
      order_id={order_id}
      session={session}
      isLoggedIn={isLoggedIn}
    />
  );
}
