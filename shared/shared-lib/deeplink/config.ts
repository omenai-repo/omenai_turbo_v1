import {
  AccessRoleTypes,
  DeepLinkPages,
  DeepLinkPayload,
} from "@omenai/shared-types";
import {
  auth_uri,
  base_url,
  dashboard_url,
  deeplink_url,
} from "@omenai/url-config/src/config";
import { encryptLinkData } from "@omenai/shared-utils/src/deeplinkCrypto";
export function generateArtworkDeeplink(art_id: string) {
  const data: DeepLinkPayload = {
    role: "user",
    route: `${base_url()}/artwork/${art_id}`,
    payload: {
      page: "artwork",
    },
    params: {
      art_id,
    },
  };
  const artworkToken = encryptLinkData(data);
  const artworkUrl = `${deeplink_url()}?token=${artworkToken}`;
  return artworkUrl;
}

export function generatePaymentDeeplink(order_id: string, user_id: string) {
  const data: DeepLinkPayload = {
    role: "user",
    route: `${base_url()}/payment/${order_id}?id_key=${user_id}`,
    payload: {
      page: "payment",
    },
    params: {
      order_id,
      user_id,
    },
  };
  const paymentToken = encryptLinkData(data);
  const paymentUrl = `${deeplink_url()}?token=${paymentToken}`;
  return paymentUrl;
}

export function generatePurchaseDeeplink(art_id: string) {
  const data: DeepLinkPayload = {
    role: "user",
    route: `${base_url()}/purchase/${art_id}`,
    payload: {
      page: "purchase",
    },
    params: {
      art_id,
    },
  };
  const purchaseToken = encryptLinkData(data);
  const purchaseUrl = `${deeplink_url()}?token=${purchaseToken}`;
  return purchaseUrl;
}

export function generateCatalogDeeplink() {
  const catalogUrlData: DeepLinkPayload = {
    route: `${base_url()}/catalog`,
    role: "user",
    payload: {
      page: "artworks",
    },
  };

  const catalogUrlToken = encryptLinkData(catalogUrlData);
  const catalogUrl = `${deeplink_url()}/dl?token=${catalogUrlToken}`;

  return catalogUrl;
}

export function generateDashboardDeeplink(
  role: Exclude<AccessRoleTypes, "admin">,
  page: DeepLinkPages,
) {
  const dynamicBaseRoute =
    role === "artist"
      ? `${dashboard_url()}/${role}/app/${page}`
      : `${dashboard_url()}/${role}/${page}`;
  const data: DeepLinkPayload = {
    role,
    route: dynamicBaseRoute,
    payload: {
      page,
    },
  };
  const dashboardToken = encryptLinkData(data);
  const dashboardUrl = `${deeplink_url()}?token=${dashboardToken}`;
  return dashboardUrl;
}

export function generateAuthDeeplink(
  role: Exclude<AccessRoleTypes, "admin">,
  page: Partial<DeepLinkPages>,
) {
  const authRoute = `${auth_uri()}/${page}/${role}`;
  const data: DeepLinkPayload = {
    role,
    route: authRoute,
    payload: {
      page,
    },
  };
  const authToken = encryptLinkData(data);
  const authUrl = `${deeplink_url()}?token=${authToken}`;
  return authUrl;
}
