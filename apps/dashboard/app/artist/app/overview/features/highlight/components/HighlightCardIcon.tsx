export default function HighlightCardIcon({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-full bg-white grid place-items-center`}>
      {icon}
    </div>
  );
}
