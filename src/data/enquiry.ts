// The enquiry form's choices, shared by the form (components/bookingForm.tsx)
// and the endpoint that checks and saves it (worker/index.ts), so the two
// can't drift apart.
//
// Plain data only: the Worker imports this file too.

export const BUSINESS_TYPES = [
  'Trades & Home Services',
  'Food & Hospitality',
  'Health & Beauty',
  'Retail & E-commerce',
  'Professional Services',
  'Creative & Portfolio',
  'Startup',
  'Other',
];

// `id` is what's stored in booking_inquiries.selected_package
export const ENQUIRY_PACKAGES = [
  { id: 'starter', name: 'Starter Website', price: '£500-£800' },
  { id: 'redesign', name: 'Website Redesign', price: '£800-£1,500' },
  { id: 'lead-system', name: 'Growth Website', price: '£1,500+' },
  { id: 'not-sure', name: 'Not sure yet', price: '' },
];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
