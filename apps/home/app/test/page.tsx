import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";

export default function page() {
  return (
    <div className="h-[80vh] w-full grid place-items-center">
      <Load />
    </div>
  );
}

// "use client";

// import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
// import { useRef, useState } from "react";
// import { storage } from "@omenai/firebase-config/firebase";
// import {
//   getDownloadURL,
//   ref,
//   uploadBytesResumable,
//   UploadTaskSnapshot,
// } from "firebase/storage";
// export default function UploadArtworkImage() {
//   const imagePickerRef = useRef<HTMLInputElement>(null);
//   const [image, setImage] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = async () => {
//     setLoading(true);
//     if (image) {
//       const storageRef = ref(storage, `artworks/${image.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, image);
//       uploadTask.on("state_changed", (snapshot: UploadTaskSnapshot) => {
//         const progress =
//           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log(`Upload is ${progress}% done`);
//         switch (snapshot.state) {
//           case "paused":
//             console.log("Upload is paused");
//             break;
//           case "running":
//             console.log("Upload is running");
//             break;
//           case "success":
//             console.log("Upload is successful");
//         }

//         // After the upload is successful, retrieve the file's download URL and file identifier
//         uploadTask.then(async (snapshot) => {
//           // Get the file identifier (path, name, or any custom data you need)
//           const filePath = snapshot.ref.fullPath; // You can store this in your database
//           const fileName = snapshot.ref.name; // You can also use just the file name if you prefer

//           // Get the file's download URL for serving or displaying it
//           const fileUrl = await getDownloadURL(snapshot.ref);

//           console.log("File uploaded successfully:");
//           console.log("File Path:", filePath);
//           console.log("File URL:", fileUrl);

//           // Now you can save the `filePath` (or `fileName`) and `fileUrl` to your database
//           // For example, if you’re using a Firestore database, you can save it like this:

//           // Optionally, handle the file in other ways, such as displaying it in the UI or storing its reference.
//         });
//       });
//     }

//     setLoading(false);
//   };

//   return (
//     <div>
//       <div className="w-full h-[60vh] grid place-items-center">
//         {image ? (
//           <img
//             src={URL.createObjectURL(image)}
//             alt="uploaded image"
//             className="w-auto h-auto max-h-[60vh] max-w-full object-cover mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
//             onClick={() => {
//               setImage(null);
//             }}
//           />
//         ) : (
//           <button
//             type="button"
//             className="w-[400px] h-[400px] border border-[#E0E0E0] bg-white rounded-sm text-fluid-xs outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
//             onClick={() => {
//               imagePickerRef.current?.click();
//             }}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="w-6 h-6 mr-2 inline-block"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
//               />
//             </svg>
//             Upload image
//           </button>
//         )}

//         <input
//           type="file"
//           hidden
//           ref={imagePickerRef}
//           onChange={(e) => {
//             // Check if input is actaully an image
//             if (!e.target.files![0].type.startsWith("image/")) return;
//             setImage(e.target.files![0]);
//           }}
//         />
//       </div>
//       <div className="mt-4 flex w-full text-fluid-xs">
//         <button
//           disabled={loading || !image}
//           className={`h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal`}
//           type="button"
//           onClick={handleImageUpload}
//         >
//           {loading ? <LoadSmall /> : "Upload artwork"}
//         </button>
//       </div>
//     </div>
//   );
// }
