"use client";
export function DownloadPDF({ pdfBase64 }: { pdfBase64: string }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = "dhl_label.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button
        className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
        onClick={handleDownload}
      >
        Download PDF
      </button>
    </div>
  );
}
