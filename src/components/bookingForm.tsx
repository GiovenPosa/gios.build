import './component-styles/bookingForm.css';
import { useBooking } from '../context/bookingContext';
import { IoCloseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useState, useEffect } from 'react';
import { GoArrowUpRight } from "react-icons/go";
import { supabase } from '../lib/supabaseClient';

const websiteTypes = [
  'Portfolio',
  'E-commerce',
  'Landing Page',
  'Blog',
  'SaaS',
  'Agency',
  'Startup',
  'Other'
];

const packages = [
  { id: 'starter', name: 'Starter Website', price: '£500-£800' },
  { id: 'redesign', name: 'Website Redesign', price: '£800-£1,500' },
  { id: 'lead-system', name: 'Lead System', price: '£1,500+' },
  { id: 'not-sure', name: "Not sure yet", price: '' }
];

export function BookingForm() {
  const { isBookingOpen, closeBooking } = useBooking();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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

  // Reset form state when modal closes (after animation)
  useEffect(() => {
    if (!isBookingOpen) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
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
      }, 300); // Match the CSS transition duration
      
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
      selectedTypes: formData.selectedTypes.length === 0 ? 'Please select at least one type' : '',
      selectedPackage: formData.selectedPackage === '' ? 'Please select a package' : '',
      budget: formData.budget.trim() === '' ? 'Please enter your budget' : ''
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        selected_types: formData.selectedTypes,
        selected_package: formData.selectedPackage || null,
        budget: formData.budget ? Number(formData.budget) : null,
        message: formData.message || null,
        user_agent: window.navigator.userAgent,
        source_page: window.location.pathname,
      };

      const { error } = await supabase
        .from('booking_inquiries')
        .insert(payload);

      if (error) {
        console.error('Error saving inquiry:', error);
        alert('Something went wrong. Please try again.');
        return;
      }

      // Show success panel
      setIsSuccess(true);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing - just close the modal, state resets via useEffect
  const handleClose = () => {
    closeBooking();
  };

  return (
    <>
      <div 
        className={`booking-overlay ${isBookingOpen ? 'open' : ''}`} 
        onClick={handleClose}
      />
      <div className={`booking-form ${isBookingOpen ? 'open' : ''}`}>
        {isSuccess ? (
          <div className='success-panel'>
            <button className='booking-close' onClick={handleClose}>
              <IoCloseOutline />
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
            <button className='booking-close' onClick={handleClose}>
              <IoCloseOutline />
            </button>
            
            <div className='booking-header'>
              <p className='booking-label'>gios.build</p>
              <h1 className='booking-title'>Start Your Project</h1>
              <p className='booking-subtitle'>
                Tell me a bit about your project and I'll get back to you within 24 hours.
              </p>
            </div>

            <form className='booking-form-content' onSubmit={handleSubmit} noValidate>
              <div className='form-group'>
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

              <div className='form-group'>
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
                <label>What type of website? <span className='required-asterisk'>*</span></label>
                <div className='type-tags'>
                  {websiteTypes.map((type) => (
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

              <div className='form-group'>
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
                <label htmlFor='budget'>Your budget <span className='required-asterisk'>*</span></label>
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
                  placeholder='Share any details about your project...'
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button type='submit' className='booking-submit' disabled={isSubmitting}>
                <p>{isSubmitting ? 'Sending...' : 'Send Request'}</p>
                <GoArrowUpRight />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}