export default function Newsletter() {
  return (
    <div className="w-full h-[500px] flex items-center justify-center gap-x-4 bg-white">
      <iframe
        title="embed"
        src="https://omenai.substack.com/embed"
        style={{ background: "#fafafa" }}
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
