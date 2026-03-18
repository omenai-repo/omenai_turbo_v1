import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <section className="min-h-screen w-full bg-[#FAFAFA] bg-dot-pattern flex items-center justify-center p-4 overflow-x-hidden relative">
      {/* This is a pure CSS mesh dot background. 
        Ensure you add the corresponding style to your global CSS (below).
      */}

      {/* Premium centered card layout */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 relative z-10">
        <AdminLoginForm />
      </div>
    </section>
  );
}
