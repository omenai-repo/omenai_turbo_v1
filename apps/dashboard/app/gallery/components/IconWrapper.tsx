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
    <button
      type="button"
      className={`p-2 w-fit rounded ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
