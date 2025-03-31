"use client";

import { useContext, useRef, useState } from "react";
import Image from "next/image";
import { logo_storage, storage } from "@omenai/appwrite-config/appwrite";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";
import { updateLogo } from "@omenai/shared-services/update/updateLogo";
import { AnimatePresence, motion } from "framer-motion";
import { galleryLogoUpdate } from "@omenai/shared-state-store/src/gallery/gallery_logo_upload/GalleryLogoUpload";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";

export default function LogoPickerModal() {
  const { modal, updateModal } = galleryLogoUpdate();
  const logoPickerRef = useRef<HTMLInputElement>(null);

  const { session } = useContext(SessionContext);

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [logo, setLogo] = useState<File | null>(null);

  const auth_url = auth_uri();
  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }

  async function handleLogoUpdate() {
    setLoading(true);

    try {
      if (logo) {
        const logoUpdated = await logo_storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_GALLERY_LOGO_BUCKET_ID!,
          ID.unique(),
          logo
        );

        if (logoUpdated) {
          let file: { bucketId: string; fileId: string } = {
            bucketId: logoUpdated.bucketId,
            fileId: logoUpdated.$id,
          };

          const { isOk, body } = await updateLogo({
            id: session?.gallery_id as string,
            url: file.fileId,
          });

          if (!isOk)
            toast.error("Error notification", {
              description: body.message,
              style: {
                background: "red",
                color: "white",
              },
              className: "class",
            });
          else {
            updateModal(false);
            await handleSignout();

            toast.success("Operation successful", {
              description: `${body.message}... Please log back in`,
              style: {
                background: "green",
                color: "white",
              },
              className: "class",
            });
            router.refresh();
          }
        }
      }
    } catch (error) {
      toast.error("Error notification", {
        description: "An error has occured, try again",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence key={8}>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              updateModal(false);
            }}
            className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: "12.5deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              exit={{ scale: 0, rotate: "0deg" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-dark p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative h-auto"
            >
              <div className="p-5">
                <p className="text-base font-normal">Upload logo image</p>
              </div>

              <div className="w-full flex justify-center h-full p-5">
                <div className="w-[300px] h-[200px]">
                  {logo ? (
                    <Image
                      src={URL.createObjectURL(logo)}
                      alt="uploaded image"
                      width={300}
                      height={200}
                      className="w-full h-[200px] object-cover mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
                      onClick={() => {
                        setLogo(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="w-full text-[14px] h-full border border-dark/10 rounded-md outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
                      onClick={() => {
                        logoPickerRef.current?.click();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-2 inline-block"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </button>
                  )}

                  <input
                    type="file"
                    hidden
                    ref={logoPickerRef}
                    onChange={(e) => {
                      // Check if input is actaully an image
                      if (!e.target.files![0].type.startsWith("image/")) return;
                      setLogo(e.target.files![0]);
                    }}
                  />
                </div>
              </div>
              <div className=" w-full px-5 py-8 text-[14px]">
                <div className="w-full items-center gap-x-2 flex">
                  <button
                    className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                    onClick={() => updateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoUpdate}
                    disabled={loading || !logo}
                    className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                  >
                    {loading ? <LoadSmall /> : "Upload logo"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
