import { useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Send } from "lucide-react";

export default function ContactButtons({ listing }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-3">

      <button
        onClick={() =>
          navigate(`/messages/${listing.seller._id}`)
        }
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <MessageCircle size={20} />
        Chat Seller
      </button>

      {listing.phone && (
        <a
          href={`tel:${listing.phone}`}
          className="w-full border py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Phone size={18} />
          Call Seller
        </a>
      )}

      {listing.whatsapp && (
        <a
          href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Send size={18} />
          WhatsApp
        </a>
      )}
    </div>
  );
}