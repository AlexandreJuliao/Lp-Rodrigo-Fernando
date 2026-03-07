document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.cursor-follower');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.1;
        cursorY += dy * 0.1;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
    }

    if (window.matchMedia("(min-width: 769px)").matches) {
        animateCursor();
    }

    // Parallax Effect & Navbar Scroll
    const parallaxImages = document.querySelectorAll('.parallax-img');
    const navbar = document.querySelector('.navbar');

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;

                if (navbar) {
                    if (scrolled > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }

                parallaxImages.forEach(img => {
                    const speed = 0.15;
                    const limit = img.parentElement.offsetTop;
                    const offset = (scrolled - limit) * speed;

                    // Only animate if in view (simple check)
                    if (scrolled + window.innerHeight > limit) {
                        img.style.transform = `translateY(${offset}px)`;
                    }
                });

                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-reveal attribute
    const elementsToAnimate = document.querySelectorAll('[data-reveal]');
    elementsToAnimate.forEach(el => observer.observe(el));

    // N8N Contact Form Integration
    const contactForm = document.getElementById('contactForm');
    const CONTACT_WEBHOOK_URL = 'https://n8n.digitalkeys.pt/webhook/leads'; // URL DO WEBHOOK DE PRODUCAO N8N PARA O CONTACTO

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name').value;
            const phoneInput = document.getElementById('phone').value;
            const emailInput = document.getElementById('email').value;

            // Feedback visual ao enviar
            const submitBtn = contactForm.querySelector('.submit-btn span');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'A Enviar...';

            const payload = {
                name: nameInput,
                phone: phoneInput,
                email: emailInput,
                timestamp: new Date().toISOString()
            };

            // Se ainda não houver Webhook (para testes)
            if (!CONTACT_WEBHOOK_URL) {
                console.log('Dados do formulário interceptados:', payload);
                alert('Tudo pronto do lado do site! (Configure o CONTACT_WEBHOOK_URL em script.js para enviar para o n8n)');
                submitBtn.innerText = originalText;
                contactForm.reset();
                return;
            }

            // Envio real
            try {
                const response = await fetch(CONTACT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('As suas informações foram recebidas. Entraremos em contacto brevemente.');
                    contactForm.reset();
                } else {
                    throw new Error('Ocorreu um problema.');
                }
            } catch (err) {
                console.error('Erro ao comunicar com o n8n no formulário:', err);
                alert('Infelizmente, ocorreu um erro. Por favor tente novamente mais tarde.');
            } finally {
                submitBtn.innerText = originalText;
            }
        });
    }
});
