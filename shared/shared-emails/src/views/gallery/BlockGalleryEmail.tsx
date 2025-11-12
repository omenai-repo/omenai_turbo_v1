import React from "react";
import GalleryEmailLayout from "./GalleryEmailLayout";
import { Text } from "@react-email/components";

export default function BlockGalleryEmail(gallery_name: string) {
  return (
    <GalleryEmailLayout gallery_name={gallery_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We wanted to inform you that your gallery account has been temporarily
        suspended. This action was taken due to a violation of our community
        guidelines.
      </Text>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Please note that during this time, you will not be able to access your
        gallery dashboard, upload new content, or receive payments.
      </Text>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        If you believe this action was made in error or would like to resolve
        the issue, please contact our support team. We’ll be happy to review
        your case and help you restore access as soon as possible.
      </Text>
    </GalleryEmailLayout>
  );
}
