"use client";
import OrdersGroup from "./components/OrdersGroup";
import PageTitle from "../components/PageTitle";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { auth_uri } from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export default function Orders() {
  return (
    <>
      <PageTitle title="Orders" />
      <OrdersGroup />
    </>
  );
}
