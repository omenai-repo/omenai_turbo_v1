import { getApiUrl } from "@omenai/url-config/src/config";

export async function rejectGalleryVerification(
  gallery_id: string,
  name: string,
  email: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/reject_gallery_verification`, {
      method: "POST",
      body: JSON.stringify({ gallery_id, name, email }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
