import { createContext, useContext, useState, type ReactNode } from 'react';

interface BookingContextType {
  isBookingOpen: boolean;
  initialPackage: string;
  openBooking: (packageId?: string) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialPackage, setInitialPackage] = useState('');

  const openBooking = (packageId?: string) => {
    setInitialPackage(packageId ?? '');
    setIsBookingOpen(true);
  };
  const closeBooking = () => setIsBookingOpen(false);

  return (
    <BookingContext.Provider value={{ isBookingOpen, initialPackage, openBooking, closeBooking }}>
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
