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
    <div className={`p-2 w-fit rounded-md  ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
