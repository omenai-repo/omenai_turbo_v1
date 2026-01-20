export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="relative h-[100vh] w-[100vw]">{children}</main>;
}
