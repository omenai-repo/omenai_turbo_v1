export default function IconWrapper({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`p-3 bg-[#44403D] text-white w-fit rounded-full  ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
