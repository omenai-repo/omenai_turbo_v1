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
    <button className={`p-1 w-fit rounded  ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
