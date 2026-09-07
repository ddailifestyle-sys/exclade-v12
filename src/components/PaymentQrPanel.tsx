import { QrCode } from "lucide-react";

import { CLICKS_PER_QR, type PaymentQr } from "@/lib/paymentQr";
import type { EventDay } from "@/data/eventCatalog";

export function PaymentQrPanel({ qr, clicks, day }: { qr: PaymentQr; clicks: number; day: EventDay }) {
  const remaining = CLICKS_PER_QR - (clicks % CLICKS_PER_QR);

  return (
    <div className="payment-qr-panel">
      <div className="payment-qr-head">
        <span><QrCode aria-hidden="true" size={13} /> DAY {day} PAYMENT CHANNEL</span>
        <span>SLOT {clicks % CLICKS_PER_QR} / {CLICKS_PER_QR}</span>
      </div>
      <img
        className="payment-qr-image"
        src={qr.url}
        alt={`UPI payment QR code for ${qr.holder} (${qr.upiId})`}
        width={320}
        height={320}
        loading="lazy"
      />
      <dl className="file-facts">
        <div><dt>PAY TO</dt><dd>{qr.holder}</dd></div>
        <div><dt>UPI ID</dt><dd>{qr.upiId}</dd></div>
      </dl>
      <p className="register-hint">
        Scan with any UPI app to pay the registration fee for your Day {day} event(s). This channel rotates after{" "}
        {remaining} more registration{remaining === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
