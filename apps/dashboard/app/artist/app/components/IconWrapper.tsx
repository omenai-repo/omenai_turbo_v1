export default function IconWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`p-2 w-fit rounded  ${className}`}>{children}</span>;
}
