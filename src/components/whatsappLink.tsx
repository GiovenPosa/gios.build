import type { ReactNode } from 'react';
import { whatsappUrl, WHATSAPP_DISPLAY } from '../data/contact';
import { trackWhatsApp } from '../lib/whatsapp';
import './component-styles/whatsappLink.css';

/**
 * A link that opens a WhatsApp chat with me in a new tab (or the app, on
 * phones), with a first message already typed. Style it with className: the
 * black hero button, a footer link, a line of small print.
 *
 * With revealNumber, hovering it (or tabbing to it) swaps the label for my
 * number, for people on a computer who'd rather message from their phone.
 * Only where there's a mouse: on a phone the tap opens WhatsApp anyway.
 */
export function WhatsAppLink({
  from,
  message,
  className,
  onClick,
  revealNumber = false,
  children,
}: {
  /** where on the site it is, for the click count, e.g. 'Footer' */
  from: string;
  /** the first message; a general hello if left out */
  message?: string;
  className?: string;
  onClick?: () => void;
  /** show the number on hover, in place of the label */
  revealNumber?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      className={[className, revealNumber && 'wa-reveal'].filter(Boolean).join(' ') || undefined}
      href={whatsappUrl(message)}
      target='_blank'
      rel='noopener noreferrer'
      onClick={() => {
        trackWhatsApp(from);
        onClick?.();
      }}
    >
      {revealNumber ? (
        // the label and the number share one spot, so the link keeps its
        // width when they swap. The number is a <p> like the buttons' own
        // labels, so it gets the same trimmed line box (index.css) and sits
        // at exactly the label's height.
        <span className='wa-swap'>
          <span className='wa-label'>{children}</span>
          <p className='wa-number' aria-hidden>{WHATSAPP_DISPLAY}</p>
        </span>
      ) : (
        children
      )}
    </a>
  );
}
