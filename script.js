/* ======================================
   NexBot Landing Page — JavaScript
   ====================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- EmailJS Initialization ----
    // Config can be set from Admin Panel (Settings page) or hardcoded here
    // Get yours at https://www.emailjs.com
    const emailjsConfig = JSON.parse(localStorage.getItem('nexbot_emailjs_config') || '{}');
    const EMAILJS_PUBLIC_KEY = emailjsConfig.publicKey || 'YOUR_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = emailjsConfig.serviceId || 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = emailjsConfig.templateId || 'YOUR_TEMPLATE_ID';

    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile menu toggle ----
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ---- Scroll animations (Intersection Observer) ----
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    animatedElements.forEach(el => observer.observe(el));

    // ---- Counter animation ----
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smoothness
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ---- FAQ Accordion ----
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ---- Helper: Save lead to localStorage ----
    function saveLeadToStorage(leadData) {
        const leads = JSON.parse(localStorage.getItem('nexbot_leads') || '[]');
        leads.unshift(leadData);
        localStorage.setItem('nexbot_leads', JSON.stringify(leads));
    }

    // ---- Contact form with EmailJS ----
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const originalHTML = submitBtn.innerHTML;

            const name = document.getElementById('input-name').value.trim();
            const email = document.getElementById('input-email').value.trim();
            const phone = document.getElementById('input-phone').value.trim();
            const companySize = document.getElementById('input-company-size').value;
            const message = document.getElementById('input-message').value.trim();

            // Show loading state
            submitBtn.innerHTML = `
                <span style="display:inline-flex;align-items:center;gap:8px;">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation:spin 1s linear infinite">
                        <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                        <path d="M10 2A8 8 0 0 1 18 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Enviando...
                </span>
            `;
            submitBtn.disabled = true;

            // Prepare lead data
            const leadData = {
                id: 'lead_' + Date.now(),
                name: name,
                email: email,
                phone: phone || 'Não informado',
                companySize: companySize || 'Não informado',
                message: message || 'Solicitação de demonstração',
                status: 'novo',
                date: new Date().toISOString(),
                source: 'landing-page'
            };

            // Try to send email via EmailJS
            let emailSent = false;
            try {
                if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
                    const templateParams = {
                        from_name: name,
                        reply_to: email,
                        phone: phone || 'Não informado',
                        company_size: companySize || 'Não informado',
                        message: message || 'Solicitação de demonstração',
                        to_email: 'contatowesleyleopoldo@gmail.com'
                    };

                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                    emailSent = true;
                }
            } catch (error) {
                console.error('EmailJS error:', error);
            }

            // Always save lead to localStorage (for admin panel)
            saveLeadToStorage(leadData);

            // Show success state
            submitBtn.innerHTML = `
                <span style="display:inline-flex;align-items:center;gap:8px;">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10L8 14L16 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${emailSent ? 'Enviado com sucesso!' : 'Mensagem registrada!'}
                </span>
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id === '#') return;

            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

    // ---- Add CSS for spinner animation ----
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

});
