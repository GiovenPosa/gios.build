/** WhatsApp number in international format, digits only (447… not 07…) */
export const WHATSAPP_NUMBER = '447443560432';

/** the same number the way people write it, shown on hover */
export const WHATSAPP_DISPLAY = '07443 560432';

/** the message already typed when the chat opens, unless a place sets its own */
export const WHATSAPP_GREETING = "Hi Gio, I'd like to chat about a website for my business.";

export function whatsappUrl(message: string = WHATSAPP_GREETING) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
