import './component-styles/bookingForm.css';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import { BUSINESS_TYPES, ENQUIRY_PACKAGES, EMAIL_PATTERN } from '../data/enquiry';
import { IoCloseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useState, useEffect, useRef } from 'react';
import { GoArrowUpRight } from "react-icons/go";

// The form is a three-step wizard. Each step is saved as the visitor moves on
// (worker/enquiry.ts), so their contact details are kept from step 1 even if
// they never finish.
const STEPS = ['Your details', 'Your project', 'Anything else'] as const;

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  currentSite: '',
  selectedTypes: [] as string[],
  selectedPackage: '',
  budget: '',
  message: ''
};

const NO_ERRORS = { name: '', email: '', selectedTypes: '', selectedPackage: '' };

type Field = keyof typeof NO_ERRORS;

/** Calls the enquiry endpoint; throws with a message fit to show the visitor. */
async function callEnquiry(path: string, method: 'POST' | 'PATCH', body: object) {
  let response: Response;
  try {
    response = await fetch(`/api/enquiry${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
  return result as { id?: string };
}

export function BookingForm() {
  const { isBookingOpen, initialPackage, initialMessage, closeBooking } = useBooking();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [step, setStep] = useState(0);
  // the saved draft, once step 1 has gone through
  const [draftId, setDraftId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState(NO_ERRORS);
  // a problem saving, shown above the buttons
  const [formError, setFormError] = useState('');

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

  // Start afresh once the modal has closed (after its animation). A draft
  // that was saved stays saved; reopening starts a new one.
  useEffect(() => {
    if (!isBookingOpen) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setFormData(EMPTY_FORM);
        setErrors(NO_ERRORS);
        setFormError('');
        setStep(0);
        setDraftId(null);
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

  const handleInputChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as Field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Checks the current step's required fields; returns the first one, top
  // to bottom, that needs attention (or null)
  const validateStep = (): Field | null => {
    const newErrors = { ...NO_ERRORS };
    if (step === 0) {
      newErrors.name = formData.name.trim() === '' ? 'Please enter your name' : '';
      newErrors.email = formData.email.trim() === ''
        ? 'Please enter your email'
        : !EMAIL_PATTERN.test(formData.email.trim())
          ? 'Please enter a valid email'
          : '';
    }
    if (step === 1) {
      newErrors.selectedTypes = formData.selectedTypes.length === 0 ? 'Please choose at least one' : '';
      newErrors.selectedPackage = formData.selectedPackage === '' ? 'Please select a package' : '';
    }
    setErrors(newErrors);
    const order: Field[] = ['name', 'email', 'selectedTypes', 'selectedPackage'];
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

  // On a new step, start at the top of the form with its first field focused
  const stepRef = useRef<HTMLDivElement>(null);
  const goToStep = (next: number) => {
    setStep(next);
    setErrors(NO_ERRORS);
    setFormError('');
    requestAnimationFrame(() => {
      document.querySelector('.booking-form')?.scrollTo({ top: 0 });
      stepRef.current?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true });
    });
  };

  // Saves the current step, then moves on (or, on the last step, sends)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const firstInvalid = validateStep();
    if (firstInvalid) {
      showField(firstInvalid);
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (step === 0) {
        const contact = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
        };
        if (draftId) {
          // back on step 1 after going on: update the same draft
          await callEnquiry(`/${draftId}`, 'PATCH', contact);
        } else {
          // the hidden "website" field: people never see it, bots fill it in
          const honeypot = (document.getElementById('website') as HTMLInputElement)?.value || '';
          const { id } = await callEnquiry('', 'POST', { ...contact, source_page: window.location.pathname, website: honeypot });
          setDraftId(id ?? null);
        }
        track('Enquiry step', { step: STEPS[0] });
        goToStep(1);
      } else if (step === 1) {
        await callEnquiry(`/${draftId}`, 'PATCH', {
          current_site: formData.currentSite.trim() || null,
          selected_types: formData.selectedTypes,
          selected_package: formData.selectedPackage,
        });
        track('Enquiry step', { step: STEPS[1] });
        goToStep(2);
      } else {
        await callEnquiry(`/${draftId}/send`, 'POST', {
          budget: formData.budget || null,
          message: formData.message.trim() || null,
        });
        setIsSuccess(true);
        track('Send enquiry', { package: formData.selectedPackage || 'none', business: formData.selectedTypes.join(', ') || 'none' });
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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

  const isLastStep = step === STEPS.length - 1;
  const nextLabel = isSubmitting
    ? (isLastStep ? 'Sending...' : 'Saving...')
    : (isLastStep ? 'Send Request' : 'Next');

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
                    {ENQUIRY_PACKAGES.find(p => p.id === formData.selectedPackage)?.name}
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

            {/* where the visitor is: one segment per step, filled up to this one */}
            <div className='booking-progress'>
              <ol className='booking-progress-bar' aria-hidden>
                {STEPS.map((name, i) => <li key={name} className={i <= step ? 'is-done' : ''} />)}
              </ol>
              <p className='booking-progress-label' aria-live='polite'>
                Step {step + 1} of {STEPS.length} <span>{STEPS[step]}</span>
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

              <div className='booking-step' ref={stepRef} key={step}>
                {step === 0 && (
                  <>
                    <div className='form-group' data-field='name'>
                      <label htmlFor='name'>Name <span className='required-asterisk'>*</span></label>
                      <input
                        type='text'
                        id='name'
                        autoComplete='name'
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
                        autoComplete='email'
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
                        autoComplete='tel'
                        placeholder='+44 7123 456789'
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className='form-group' data-field='selectedTypes'>
                      <label>What kind of business? <span className='required-asterisk'>*</span></label>
                      <div className='type-tags'>
                        {BUSINESS_TYPES.map((type) => (
                          <button
                            key={type}
                            type='button'
                            className={`type-tag ${formData.selectedTypes.includes(type) ? 'selected' : ''}`}
                            aria-pressed={formData.selectedTypes.includes(type)}
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
                        {ENQUIRY_PACKAGES.map((pkg) => (
                          <button
                            key={pkg.id}
                            type='button'
                            className={`package-option ${formData.selectedPackage === pkg.id ? 'selected' : ''}`}
                            aria-pressed={formData.selectedPackage === pkg.id}
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
                      <label htmlFor='currentSite'>Current website (if you have one)</label>
                      <input
                        type='text'
                        id='currentSite'
                        inputMode='url'
                        placeholder='yourbusiness.co.uk'
                        value={formData.currentSite}
                        onChange={(e) => handleInputChange('currentSite', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
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
                    </div>

                    <div className='form-group'>
                      <label htmlFor='message'>Tell me more (optional)</label>
                      <textarea
                        id='message'
                        placeholder="What does your business do, and what should the website help with?"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {formError && <p className='booking-error' role='alert'>{formError}</p>}

              <div className='booking-actions'>
                {step > 0 && (
                  <button type='button' className='booking-back' onClick={() => goToStep(step - 1)} disabled={isSubmitting}>
                    Back
                  </button>
                )}
                <button type='submit' className='booking-submit' disabled={isSubmitting}>
                  <p>{nextLabel}</p>
                  <GoArrowUpRight />
                </button>
              </div>
              <p className='booking-privacy'>
                {step === 0
                  ? "Your details are saved when you press Next, so I can reply even if you don't finish. "
                  : "I'll only use your details to reply and quote. "}
                <a href='/privacy' target='_blank' rel='noopener'>How I handle them</a>
              </p>
            </form>
          </>
        )}
      </div>
    </>
  )
}
