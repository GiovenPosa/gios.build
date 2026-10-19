import './component-styles/bookingForm.css';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import { IoCloseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useState, useEffect, useRef } from 'react';
import { GoArrowUpRight } from "react-icons/go";

const businessTypes = [
  'Trades & Home Services',
  'Food & Hospitality',
  'Health & Beauty',
  'Retail & E-commerce',
  'Professional Services',
  'Creative & Portfolio',
  'Startup',
  'Other'
];

const packages = [
  { id: 'starter', name: 'Starter Website', price: '£500-£800' },
  { id: 'redesign', name: 'Website Redesign', price: '£800-£1,500' },
  { id: 'lead-system', name: 'Growth Website', price: '£1,500+' },
  { id: 'not-sure', name: "Not sure yet", price: '' }
];

export function BookingForm() {
  const { isBookingOpen, initialPackage, initialMessage, closeBooking } = useBooking();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentSite: '',
    selectedTypes: [] as string[],
    selectedPackage: '',
    budget: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    selectedTypes: '',
    selectedPackage: '',
    budget: ''
  });

  // Preselect the package the visitor clicked on, and start the message
  // with the build they priced up, if they came from the quote builder
  useEffect(() => {
    if (isBookingOpen && initialPackage) {
      setFormData(prev => ({ ...prev, selectedPackage: initialPackage }));
    }
    if (isBookingOpen && initialMessage) {
      setFormData(prev => ({ ...prev, message: initialMessage }));
    }
  }, [isBookingOpen, initialPackage, initialMessage]);

  // Lock the page behind the modal while it's open, so wheel, trackpad and
  // touch scrolling only ever move the form. The scrollbar's width is padded
  // back on so the page doesn't jump sideways when it disappears.
  useEffect(() => {
    if (!isBookingOpen) return;
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const previous = { html: html.style.overflow, body: document.body.style.overflow, padding: document.body.style.paddingRight };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
      document.body.style.paddingRight = previous.padding;
    };
  }, [isBookingOpen]);

  // Reset form state when modal closes (after animation)
  useEffect(() => {
    if (!isBookingOpen) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          currentSite: '',
          selectedTypes: [],
          selectedPackage: '',
          budget: '',
          message: ''
        });
        setErrors({
          name: '',
          email: '',
          selectedTypes: '',
          selectedPackage: '',
          budget: ''
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isBookingOpen]);

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
    if (errors.selectedTypes) {
      setErrors(prev => ({ ...prev, selectedTypes: '' }));
    }
  };

  const selectPackage = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPackage: prev.selectedPackage === packageId ? '' : packageId
    }));
    if (errors.selectedPackage) {
      setErrors(prev => ({ ...prev, selectedPackage: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() === '' ? 'Please enter your name' : '',
      email: formData.email.trim() === '' 
        ? 'Please enter your email' 
        : !validateEmail(formData.email) 
          ? 'Please enter a valid email' 
          : '',
      selectedTypes: formData.selectedTypes.length === 0 ? 'Please choose at least one' : '',
      selectedPackage: formData.selectedPackage === '' ? 'Please select a package' : '',
      budget: ''
    };
    
    setErrors(newErrors);

    // the first field, top to bottom, that needs attention (or null)
    const order = ['name', 'email', 'selectedTypes', 'selectedPackage'] as const;
    return order.find((field) => newErrors[field] !== '') ?? null;
  };

  // Glide the form's own scroll (not the page's) to a field that needs
  // attention, settle it about a third of the way down, focus it, and give
  // it a brief nudge so the eye lands on it.
  const showField = (field: string) => {
    const panel = document.querySelector<HTMLElement>('.booking-form');
    const group = panel?.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (!panel || !group) return;
    const offset = group.getBoundingClientRect().top - panel.getBoundingClientRect().top;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.scrollTo({ top: panel.scrollTop + offset - panel.clientHeight * 0.3, behavior: reduce ? 'auto' : 'smooth' });
    group.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
    group.classList.remove('needs-attention');
    void group.offsetWidth; // restart the nudge if it's already playing
    group.classList.add('needs-attention');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const firstInvalid = validateForm();
    if (firstInvalid) {
      showField(firstInvalid);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get honeypot value (bots fill this, humans don't see it)
      const honeypotValue = (document.getElementById("website") as HTMLInputElement)?.value || "";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-inquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            selected_types: formData.selectedTypes,
            selected_package: formData.selectedPackage,
            budget: formData.budget || null,
            // No dedicated column for the current site yet, so it travels in the message
            message: [
              formData.currentSite.trim() && `Current website: ${formData.currentSite.trim()}`,
              formData.message.trim(),
            ].filter(Boolean).join('\n\n') || null,
            source_page: window.location.pathname,
            user_agent: window.navigator.userAgent,
            // Honeypot field - bots fill this, real users won't see it
            website: honeypotValue,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited
          alert(result.error || "You've already submitted recently. Please wait a few minutes.");
        } else if (response.status === 400) {
          // Validation error from server
          alert(result.error || "Please check your form and try again.");
        } else {
          // Server error
          alert(result.error || "Something went wrong. Please try again.");
        }
        return;
      }

      // Show success panel
      setIsSuccess(true);
      track('Send enquiry', { package: formData.selectedPackage || 'none', business: formData.selectedTypes.join(', ') || 'none' });

    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeBooking();
  };

  // A real dialog: focus moves into it when it opens and back to whatever
  // opened it when it closes, and Escape closes it
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isBookingOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    // the panel fades in from visibility: hidden, which can't take focus, so
    // move focus in a beat later, once it's visible
    const focusTimer = window.setTimeout(() => formRef.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBooking();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [isBookingOpen, closeBooking]);

  return (
    <>
      <div 
        className={`booking-overlay ${isBookingOpen ? 'open' : ''}`} 
        onClick={handleClose}
      />
      <div
        className={`booking-form ${isBookingOpen ? 'open' : ''}`}
        ref={formRef}
        role='dialog'
        aria-modal='true'
        aria-label={isSuccess ? 'Enquiry sent' : 'Start your project'}
        tabIndex={-1}
      >
        {isSuccess ? (
          <div className='success-panel'>
            <button type='button' className='booking-close' onClick={handleClose} aria-label='Close'>
              <IoCloseOutline aria-hidden />
            </button>
            <div className='success-icon'>
              <IoCheckmarkCircle />
            </div>
            <h2 className='success-title'>You're all set!</h2>
            <p className='success-message'>
              Thanks for reaching out, {formData.name.split(' ')[0]}. I'll review your project details and get back to you within 24 hours.
            </p>
            <div className='success-details'>
              <div className='success-detail-item'>
                <span className='success-detail-label'>Email</span>
                <span className='success-detail-value'>{formData.email}</span>
              </div>
              {formData.selectedPackage && (
                <div className='success-detail-item'>
                  <span className='success-detail-label'>Package</span>
                  <span className='success-detail-value'>
                    {packages.find(p => p.id === formData.selectedPackage)?.name}
                  </span>
                </div>
              )}
            </div>
            <button className='success-button' onClick={handleClose}>
              <p>Done</p>
              <GoArrowUpRight />
            </button>
          </div>
        ) : (
          <>
            <button type='button' className='booking-close' onClick={handleClose} aria-label='Close'>
              <IoCloseOutline aria-hidden />
            </button>
            
            <div className='booking-header'>
              <p className='booking-label'>gios.build</p>
              <h2 className='booking-title'>Start Your Project</h2>
              <p className='booking-subtitle'>
                Tell me a bit about your project and I'll get back to you within 24 hours.
              </p>
            </div>

            <form className='booking-form-content' onSubmit={handleSubmit} noValidate>
              {/* Honeypot field - hidden from real users, bots will fill it */}
              <input
                type="text"
                name="website"
                id="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  height: 0,
                  width: 0,
                  pointerEvents: 'none',
                }}
              />

              <div className='form-group' data-field='name'>
                <label htmlFor='name'>Name <span className='required-asterisk'>*</span></label>
                <input
                  type='text'
                  id='name'
                  placeholder='Your name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <span className='error-message'>{errors.name}</span>}
              </div>

              <div className='form-group' data-field='email'>
                <label htmlFor='email'>Email <span className='required-asterisk'>*</span></label>
                <input
                  type='email'
                  id='email'
                  placeholder='your@email.com'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <span className='error-message'>{errors.email}</span>}
              </div>

              <div className='form-group'>
                <label htmlFor='phone'>Phone number</label>
                <input
                  type='tel'
                  id='phone'
                  placeholder='+44 7123 456789'
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='currentSite'>Current website (if you have one)</label>
                <input
                  type='text'
                  id='currentSite'
                  inputMode='url'
                  placeholder='yourbusiness.co.uk'
                  value={formData.currentSite}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentSite: e.target.value }))}
                />
              </div>

              <div className='form-group' data-field='selectedTypes'>
                <label>What kind of business? <span className='required-asterisk'>*</span></label>
                <div className='type-tags'>
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      type='button'
                      className={`type-tag ${formData.selectedTypes.includes(type) ? 'selected' : ''}`}
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.selectedTypes && <span className='error-message'>{errors.selectedTypes}</span>}
              </div>

              <div className='form-group' data-field='selectedPackage'>
                <label>Which package interests you? <span className='required-asterisk'>*</span></label>
                <div className='package-options'>
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type='button'
                      className={`package-option ${formData.selectedPackage === pkg.id ? 'selected' : ''}`}
                      onClick={() => selectPackage(pkg.id)}
                    >
                      <span className='package-option-name'>{pkg.name}</span>
                      {pkg.price && <span className='package-option-price'>{pkg.price}</span>}
                    </button>
                  ))}
                </div>
                {errors.selectedPackage && <span className='error-message'>{errors.selectedPackage}</span>}
              </div>

              <div className='form-group'>
                <label htmlFor='budget'>Rough budget (optional)</label>
                <div className='budget-input-wrapper'>
                  <span className='budget-prefix'>£</span>
                  <input
                    type='number'
                    id='budget'
                    placeholder='1000'
                    min='0'
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  />
                </div>
                {errors.budget && <span className='error-message'>{errors.budget}</span>}
              </div>

              <div className='form-group'>
                <label htmlFor='message'>Tell me more (optional)</label>
                <textarea
                  id='message'
                  placeholder="What does your business do, and what should the website help with?"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button type='submit' className='booking-submit' disabled={isSubmitting}>
                <p>{isSubmitting ? 'Sending...' : 'Send Request'}</p>
                <GoArrowUpRight />
              </button>
              <p className='booking-privacy'>
                I'll only use your details to reply and quote. <a href='/privacy' target='_blank' rel='noopener'>How I handle them</a>
              </p>
            </form>
          </>
        )}
      </div>
    </>
  )
}