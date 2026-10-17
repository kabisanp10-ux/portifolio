import type { ContactFormData } from './types';

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

      // 1. Store to local browser database (localStorage archive)
      try {
        const stored = JSON.parse(localStorage.getItem('kabisan_contact_submissions') || '[]');
        stored.unshift({
          ...data,
          id: 'sub_' + Date.now(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('kabisan_contact_submissions', JSON.stringify(stored));
      } catch (err) {
        console.warn('localStorage save warning:', err);
      }

      // 2. Post to Local Vite Backend (/api/contact)
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        // Backend not reachable on static CDN
      }

      // 3. Post to Web3Forms Cloud (if access key is configured)
      const accessKey = accessKeyInput?.value?.trim() || '';
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: accessKey,
              name: data.name,
              email: data.email,
              subject: `[Portfolio Inquiry] ${data.subject}`,
              message: data.message,
              from_name: 'Kabisan P Portfolio'
            })
          });
        } catch (err) {
          console.warn('Web3Forms dispatch warning:', err);
        }
      }

      this.setLoading(false);

      this.showSuccess(
        `Thank you, ${data.name}! Your message regarding "${data.subject}" has been received and stored. I look forward to speaking with you.`
      );
      this.form?.reset();
    });
  }

  private setLoading(isLoading: boolean): void {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    if (isLoading) {
      this.submitBtn.innerHTML = `
        <span>Sending...</span>
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>
      `;
    } else {
      this.submitBtn.innerHTML = `
        <span>Send</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      `;
    }
  }

  private showError(msg: string): void {
    if (!this.feedback) return;
    this.feedback.className = 'form-feedback';
    this.feedback.style.display = 'block';
    this.feedback.style.background = 'rgba(239, 68, 68, 0.15)';
    this.feedback.style.border = '1px solid rgba(239, 68, 68, 0.35)';
    this.feedback.style.color = '#b91c1c';
    this.feedback.textContent = msg;
  }

  private showSuccess(msg: string): void {
    if (!this.feedback) return;
    this.feedback.className = 'form-feedback success';
    this.feedback.style.display = 'block';
    this.feedback.textContent = msg;

    setTimeout(() => {
      if (this.feedback) {
        this.feedback.style.display = 'none';
      }
    }, 8000);
  }
}
