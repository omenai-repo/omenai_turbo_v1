// "use client";
// import { IndividualLogo } from "../logo/Logo";
// import LoginModalFormActions from "./LoginModalFormActions";

// import { useState, ChangeEvent, FormEvent } from "react";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
// import { useRouter } from "next/navigation";
// import { Form } from "@omenai/shared-types";

// export default function LoginModalForm() {
//   const queryClient = useQueryClient();

//   const { toggleLoginModal } = actionStore();

//   const [loading, setIsLoading] = useState(false);

//   const [form, setForm] = useState<Form>({ email: "", password: "" });
//   const router = useRouter();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };
//   const { mutateAsync: loginFromModal } = useMutation({
//     mutationFn: async () => handleSignIn(form),
//     onSuccess: async (data) => {
//       if (data?.isOk) {
//         await queryClient.invalidateQueries();

//         router.refresh();
//         if (data.message !== "") {
//           toast.success("Operation successful", {
//             description: data.message,
//             style: {
//               background: "green",
//               color: "white",
//             },
//             className: "class",
//           });
//         }

//         toggleLoginModal(false);
//       } else {
//         toast.error("Error notification", {
//           description: data?.message,
//           style: {
//             background: "red",
//             color: "white",
//           },
//           className: "class",
//         });
//       }
//     },
//   });

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       await loginFromModal();
//       setIsLoading(false);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <>
//       <div className="flex flex-col items-center justify-center gap-2 my-4">
//         <IndividualLogo />
//         <h1 className="text-xs text-dark font-normal mt-3 mb-5">
//           Login to your individual account
//         </h1>
//       </div>

//       <form
//         className="container flex flex-col gap-[1rem] my-4"
//         onSubmit={handleSubmit}
//       >
//         <div className="flex flex-col">
//           <label htmlFor={"email"} className="text-xs">
//             Email address
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             className="focus:ring-0 border-0 px-0 text-xs border-b-[1px] border-b-dark/30 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
//             required
//             onChange={handleChange}
//           />
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor={"email"} className="text-xs">
//             Password
//           </label>
//           <input
//             type="password"
//             name="password"
//             value={form.password}
//             className="focus:ring-0 border-0 px-0 border-b-[1px] text-xs border-b-dark/30 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
//             required
//             onChange={handleChange}
//           />
//         </div>
//         <LoginModalFormActions loading={loading} />
//       </form>
//     </>
//   );
// }
