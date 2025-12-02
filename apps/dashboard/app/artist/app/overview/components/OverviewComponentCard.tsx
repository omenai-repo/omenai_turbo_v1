export default function OverviewComponentCard({
  children,
  fullWidth,
  title,
  id,
}: {
  children: React.ReactNode;
  fullWidth: boolean;
  title: string;
  id?: string;
}) {
  return (
    <div className="pt-5 pb-2">
      <h4 className="text-dark text-fluid-base font-medium">{title}</h4>
      <div
        id={id}
        className={` ${
          fullWidth ? "px-1 py-2" : "px-5"
        } w-full min-h-[300px] grid place-items-center rounded-3xl ring-1 ring-[#eeeeee] mt-5 relative bg-white`}
      >
        {children}
      </div>
    </div>
  );
}
