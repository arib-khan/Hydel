'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components';
import styles from './Contact.module.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';


export default function ContactPage() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // honeypot - real users never fill this in
  });
  const [privacyConsent, setPrivacyConsent] = useState(false); // unchecked by default
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
    privacy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      message: '',
      privacy: ''
    };

    if (!privacyConsent) {
      newErrors.privacy = 'Please agree to the Privacy Policy to send your message';
      valid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      valid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors] !== undefined && errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, privacyConsent }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', website: '' });
        setPrivacyConsent(false);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.contactContainer}>
        <div className={styles.contactForm}>
          <div className={styles.formHeader}>
            <h1>Get in Touch</h1>
            <p className={styles.formSubtitle}>
              Have questions or need assistance? Reach out to us and our team will respond promptly.
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className={styles.successMessage}>
              <FaCheckCircle className={styles.statusIcon} />
              Thank you! Your message has been sent successfully.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className={styles.errorMessage}>
              <FaExclamationTriangle className={styles.statusIcon} />
              Something went wrong. Please try again later or contact us directly.
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`${styles.formInput} ${errors.name ? styles.errorInput : ''}`}
                required
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`${styles.formInput} ${errors.email ? styles.errorInput : ''}`}
                required
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows={5}
                className={`${styles.formTextarea} ${errors.message ? styles.errorInput : ''}`}
                required
              ></textarea>
              {errors.message && <span className={styles.errorText}>{errors.message}</span>}
            </div>

            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className={styles.honeypot}
            />

            <p className={styles.formSubtitle} id="privacy-notice">
              We collect the information you provide to respond to your enquiry and provide our services.
              Your name, email address and message are emailed to our team, and an acknowledgement is sent to your email.
              Please see our <Link href="/privacy-policy">Privacy Policy</Link> for information about how your data is collected, used, and protected.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="privacyConsent" className={styles.consentLabel}>
                <input
                  type="checkbox"
                  id="privacyConsent"
                  name="privacyConsent"
                  checked={privacyConsent}
                  onChange={(e) => {
                    setPrivacyConsent(e.target.checked);
                    if (e.target.checked) setErrors(prev => ({ ...prev, privacy: '' }));
                  }}
                  aria-required="true"
                  aria-describedby="privacy-notice"
                  aria-invalid={!!errors.privacy}
                  className={styles.consentCheckbox}
                />
                <span>I have read and agree to the <Link href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</Link>. *</span>
              </label>
              {errors.privacy && <span className={styles.errorText} role="alert">{errors.privacy}</span>}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              <FaPaperPlane className={styles.buttonIcon} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className={styles.contactInfo}>
          <div className={styles.infoHeader}>
            <h2>Contact Information</h2>
            <p className={styles.infoSubtitle}>
              Find us at our office or reach out through any of these channels
            </p>
          </div>

          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d7360.241097238493!2d75.84932849999998!3d22.723760333333345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sin!4v1750689645886!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
              title="Our Location on Google Maps"
              className={styles.map}
            ></iframe>
          </div>

          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div>
                <h3>Address</h3>
                <p>Indore, Madhya Pradesh, India</p>
              </div>
            </div>

            {/* <div className={styles.contactItem}>
              <FaPhoneAlt className={styles.contactIcon} />
              <div>
                <h3>Phone</h3>
                <p>+91-9827059392</p>
                <p className={styles.contactNote}>Available 9AM-6PM, Monday to Saturday</p>
              </div>
            </div> */}

            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <div>
                <h3>Email</h3>
                <p>info@hydel.co.in</p>
                <p className={styles.contactNote}>Typically respond within 24 hours</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <FaClock className={styles.contactIcon} />
              <div>
                <h3>Working Hours</h3>
                <p>Monday - Saturday: 9AM - 6PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}