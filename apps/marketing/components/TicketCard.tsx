import Image from "next/image";
import { Calendar, Clock, Users, MapPin, CheckCircle2 } from "lucide-react";

interface TicketCardProps {
  ticketRef: string;
  bookingRef: string;
  activity: string;
  provider: string;
  date: string;
  time: string;
  travelers: number;
  totalPrice: string;
  currency: string;
  qrDataUri: string;
  status?: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TicketCard({
  ticketRef,
  bookingRef,
  activity,
  provider,
  date,
  time,
  travelers,
  totalPrice,
  currency,
  qrDataUri,
  status,
}: TicketCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gyg-border shadow-card overflow-hidden">
      <div className="bg-gyg-navy text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/70">Booking reference</div>
            <div className="font-bold text-lg">{bookingRef}</div>
          </div>
          {status === "confirmed" && (
            <div className="flex items-center gap-1 text-success-green bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Confirmed
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="text-center mb-6">
          <div className="relative w-56 h-56 mx-auto mb-4 bg-white p-3 rounded-xl border border-gyg-border">
            <Image
              src={qrDataUri}
              alt="Ticket QR code"
              fill
              className="object-contain p-2"
              sizes="224px"
            />
          </div>
          <div className="text-xs text-gyg-muted">Ticket reference: {ticketRef}</div>
          <p className="text-sm text-gyg-muted mt-2">Present this QR code at the meeting point</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gyg-muted">Tour</span>
            <span className="font-medium text-gyg-text text-right max-w-[60%]">{activity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gyg-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="font-medium text-gyg-text">{formatDate(date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gyg-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Time
            </span>
            <span className="font-medium text-gyg-text">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gyg-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Travelers
            </span>
            <span className="font-medium text-gyg-text">{travelers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gyg-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Provider
            </span>
            <span className="font-medium text-gyg-text">{provider}</span>
          </div>
          <div className="pt-3 border-t border-gyg-border flex justify-between items-center">
            <span className="text-gyg-muted">Total paid</span>
            <span className="text-lg font-bold text-angkor-orange">
              ${Number(totalPrice).toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
