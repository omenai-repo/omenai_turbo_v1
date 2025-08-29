import type { PaymentMethod } from "@stripe/stripe-js";

export function PaymentMethodBank({
  bank,
}: {
  bank: PaymentMethod.UsBankAccount;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">{bank.bank_name}</p>
        <p className="text-xs text-slate-500">
          {bank.account_type} •••• {bank.last4}
        </p>
      </div>
      <img
        src="/icons/bank.png"
        alt="Bank"
        className="h-8 w-auto object-contain"
      />
    </div>
  );
}
