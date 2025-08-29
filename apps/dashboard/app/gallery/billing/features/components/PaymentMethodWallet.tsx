export function PaymentMethodWallet({
  type,
}: {
  type: "apple_pay" | "google_pay";
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {type === "apple_pay" ? "Apple Pay" : "Google Pay"}
        </p>
        <p className="text-xs text-slate-500">Wallet Payment</p>
      </div>
      <img
        src={`/icons/${type}.png`}
        alt={type}
        className="h-8 w-auto object-contain"
      />
    </div>
  );
}
