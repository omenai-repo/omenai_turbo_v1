export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="relative h-[100vh] w-[100vw]">{children}</main>;
}
