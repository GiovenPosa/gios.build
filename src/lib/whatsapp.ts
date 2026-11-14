import { whatsappUrl } from '../data/contact';
import { track } from './analytics';

/** Counts a WhatsApp click, the same way the footer counts email and
 *  Instagram: one 'Contact link' event, with where on the site it came from. */
export function trackWhatsApp(from: string) {
  track('Contact link', { to: 'whatsapp', from });
}

/** Opens a WhatsApp chat from code (for buttons that can't be links). */
export function openWhatsApp(from: string, message?: string) {
  trackWhatsApp(from);
  window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
}
