"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { GoArrowRight } from "react-icons/go";
import { Form } from "@omenai/shared-types";
import { loginAdmin } from "@omenai/shared-services/auth/admin/login";
export default function FormInput() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { isOk, message } = await loginAdmin({ ...form });

      if (!isOk) {
        toast.error("Error notification", {
          description: message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      } else {
        toast.success("Operation successful", {
          description: message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        router.replace("/admin/dashboard/galleries");
      }
    } catch (error) {
      toast.error("Error notification", {
        description:
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="container flex flex-col gap-[1rem]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col">
        <label htmlFor={"email"} className="text-[14px] text-[#858585]">
          Email address
        </label>
        <input
          type="email"
          value={form.email}
          name="email"
          className="focus:ring-0 border-[1px] px-2 border-dark/20 outline-none focus:outline-none text-[14px] focus:border-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-gray-700/40 py-3"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={"password"} className="text-[14px] text-[#858585]">
          Password
        </label>
        <input
          value={form.password}
          type="password"
          name="password"
          className="focus:ring-0 border-[1px] p-2 border-dark/20 outline-none focus:outline-none text-[14px] focus:border-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-gray-700/40 py-3"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col mt-[1rem] gap-4 w-full">
        <div className="flex flex-col w-full gap-2 mt-[30px]">
          <button
            disabled={isLoading}
            type="submit"
            className="h-[35px] px-4 w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
          >
            {isLoading ? <LoadSmall /> : "Login"}{" "}
            {!isLoading && <GoArrowRight className="text-md opacity-70" />}
          </button>
        </div>
      </div>
    </form>
  );
}
