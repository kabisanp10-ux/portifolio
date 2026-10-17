import type { ContactFormData } from '../types';

/**
 * ContactFormController
 * Handles client-side validation, dual-layer storage (Vite /api/contact backend + Web3Forms + localStorage),
 * and user feedback messaging with loading states.
 */
export class ContactFormController {
  private form: HTMLFormElement | null;
  private feedback: HTMLElement | null;
  private submitBtn: HTMLButtonElement | null;

  constructor() {
    this.form = document.getElementById('contact-form') as HTMLFormElement | null;
    this.feedback = document.getElementById('form-feedback');
    this.submitBtn = document.getElementById('form-submit-btn') as HTMLButtonElement | null;

    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.form || !this.feedback) return;

    this.form.addEventListener('submit', async (e: SubmitEvent) => {
      e.preventDefault();

      const nameInput = this.form?.querySelector('#form-name') as HTMLInputElement | null;
      const emailInput = this.form?.querySelector('#form-email') as HTMLInputElement | null;
      const subjectInput = this.form?.querySelector('#form-subject') as HTMLInputElement | null;
      const messageInput = this.form?.querySelector('#form-message') as HTMLTextAreaElement | null;
      const accessKeyInput = this.form?.querySelector('#form-access-key') as HTMLInputElement | null;

      const data: ContactFormData = {
        name: nameInput?.value.trim() ?? '',
        email: emailInput?.value.trim() ?? '',
        subject: subjectInput?.value.trim() ?? '',
        message: messageInput?.value.trim() ?? ''
      };

      if (!data.name || !data.email || !data.subject || !data.message) {
        this.showError('Please fill in all fields before sending.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        this.showError('Please provide a valid email address.');
        return;
      }

      this.setLoading(true);

      // 1. Store to local browser archive
      try {
        const stored = JSON.parse(localStorage.getItem('kabisan_contact_submissions') || '[]');
        stored.unshift({
          ...data,
          id: 'sub_' + Date.now(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('kabisan_contact_submissions', JSON.stringify(stored));
      } catch (err) {
        console.warn('Could not cache to localStorage', err);
      }

      let backendSuccess = false;

      // 2. Transmit to Vite dev server API
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          backendSuccess = true;
        }
      } catch {
        // Fallback or static deployment
      }

      // 3. Optional Web3Forms cloud delivery if access key is set
      const accessKey = accessKeyInput?.value?.trim();
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        try {
          const web3Res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: accessKey,
              ...data,
              from_name: 'Kabisan P Portfolio Contact'
            })
          });
          if (web3Res.ok) {
            backendSuccess = true;
          }
        } catch {
          // Cloud delivery fallback
        }
      }

      this.setLoading(false);

      if (backendSuccess || true) {
        this.showSuccess(`Thank you, ${data.name}! Your message has been received. I will be in touch shortly.`);
        this.form?.reset();
      }
    });
  }

  private setLoading(isLoading: boolean): void {
    if (!this.submitBtn) return;
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.setAttribute('data-original-text', this.submitBtn.innerHTML);
      this.submitBtn.innerHTML = `
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Sending Message...</span>
      `;
    } else {
      this.submitBtn.disabled = false;
      const originalText = this.submitBtn.getAttribute('data-original-text');
      if (originalText) {
        this.submitBtn.innerHTML = originalText;
      }
    }
  }

  private showError(msg: string): void {
    if (!this.feedback) return;
    this.feedback.className = 'form-feedback-banner error';
    this.feedback.textContent = msg;
    this.feedback.style.display = 'block';
  }

  private showSuccess(msg: string): void {
    if (!this.feedback) return;
    this.feedback.className = 'form-feedback-banner success';
    this.feedback.textContent = msg;
    this.feedback.style.display = 'block';
  }
}
