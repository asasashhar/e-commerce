import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('');
  const [show, setShow] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    supabase
      .from('settings')
      .select('shop_phone')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.shop_phone) {
          // Strip non-digit chars for wa.me link
          setPhone(data.shop_phone.replace(/\D/g, ''));
        }
        setShow(true);
      });
  }, []);

  if (!show) return null;

  const waLink = `https://wa.me/${phone || '923001234567'}?text=Hi%20KINGWEAR!%20I%20have%20a%20question%20about%20a%20product%20%F0%9F%91%9F`;

  return (
    <>
      {/* Tooltip bubble */}
      {tooltip && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-in">
          <div className="relative rounded-2xl border border-white/10 bg-ink-800 px-4 py-3 shadow-xl">
            <button
              onClick={() => setTooltip(false)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink-700 text-ink-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-sm font-medium text-white">Chat with us on WhatsApp!</p>
            <p className="mt-0.5 text-xs text-ink-400">Typically replies within minutes</p>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-white/10 bg-ink-800" />
          </div>
        </div>
      )}

      {/* Main button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
        aria-label="Chat on WhatsApp"
        id="whatsapp-chat-button"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: '#25d366' }} />
        <MessageCircle className="relative h-7 w-7 text-white" fill="white" />
      </a>
    </>
  );
}
