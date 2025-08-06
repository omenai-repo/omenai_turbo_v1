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
    <div className={`p-1 w-fit rounded-lg  ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
