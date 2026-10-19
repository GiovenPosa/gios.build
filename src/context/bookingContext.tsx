import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { track } from '../lib/analytics';

interface BookingContextType {
  isBookingOpen: boolean;
  initialPackage: string;
  /** Text to start the message with, e.g. the build a visitor priced up. */
  initialMessage: string;
  openBooking: (packageId?: string, message?: string) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialPackage, setInitialPackage] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const openBooking = (packageId?: string, message?: string) => {
    // every "Get a free mockup" button comes through here
    track('Open enquiry form', { package: packageId || 'none', page: window.location.pathname });
    setInitialPackage(packageId ?? '');
    setInitialMessage(message ?? '');
    setIsBookingOpen(true);
  };
  // stable, so effects that close the form don't re-run on every render
  const closeBooking = useCallback(() => setIsBookingOpen(false), []);

  return (
    <BookingContext.Provider value={{ isBookingOpen, initialPackage, initialMessage, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
