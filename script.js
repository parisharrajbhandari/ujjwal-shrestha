document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // POPULATE PAGE FROM CONFIG
    // ============================================================
    const cfg = BUSINESS_CONFIG;

    // --- Page Title ---
    document.title = `${cfg.company.name} | ${cfg.company.tagline}`;

    // --- Logo ---
    const logoEl = document.getElementById('logo');
    if (logoEl) {
        logoEl.src = cfg.logo.src;
        logoEl.alt = cfg.logo.alt;
    }


    // --- First Page: Company Name & Tagline (shown on logo page) ---
    const companyNameEl = document.getElementById('company-name');
    if (companyNameEl) companyNameEl.textContent = cfg.company.name;

    const companyTaglineEl = document.getElementById('company-tagline');
    if (companyTaglineEl) companyTaglineEl.textContent = cfg.company.tagline;

    // --- About Section ---
    const aboutHeadingEl = document.getElementById('about-heading');
    const aboutTextEl = document.getElementById('about-text');
    if (aboutHeadingEl) aboutHeadingEl.textContent = cfg.company.aboutHeading;
    if (aboutTextEl) aboutTextEl.textContent = cfg.company.aboutText;

    // --- Action Buttons ---
    const btnCall = document.getElementById('btn-call');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnEmail = document.getElementById('btn-email');
    const btnLocation = document.getElementById('btn-location');
    const btnReview = document.getElementById('btn-review');

    if (btnCall) btnCall.href = `tel:${cfg.contact.phones[0].number}`;
    if (btnWhatsapp) btnWhatsapp.href = `https://wa.me/${cfg.contact.whatsapp}`;
    if (btnEmail) btnEmail.href = `mailto:${cfg.contact.email}`;
    if (btnLocation) btnLocation.href = cfg.contact.locationUrl;
    if (btnReview) btnReview.href = cfg.contact.reviewUrl;

    // --- Profile Card (above social links) ---
    const profileImg = document.getElementById('profile-img');
    const profileName = document.getElementById('profile-name');
    const profileTitle = document.getElementById('profile-title');
    const profileCompany = document.getElementById('profile-company');
    if (profileImg) {
        profileImg.src = cfg.person.profilePhoto;
        profileImg.alt = cfg.person.fullName;
    }
    if (profileName) profileName.textContent = cfg.person.fullName;
    if (profileTitle) profileTitle.textContent = cfg.person.title;
    if (profileCompany) profileCompany.textContent = cfg.company.name;

    // --- Social Media Icons (dynamically generated) ---
    const socialBar = document.getElementById('social-bar');
    if (socialBar) {
        cfg.socials.forEach(social => {
            const a = document.createElement('a');
            a.href = social.url;
            a.target = '_blank';
            a.className = 'social-icon';
            a.setAttribute('aria-label', social.platform);

            const i = document.createElement('i');
            i.className = social.icon;
            a.appendChild(i);

            socialBar.appendChild(a);
        });
    }

    // ============================================================
    // SCROLL ANIMATIONS
    // ============================================================
    const header = document.getElementById('header');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const contactsSection = document.getElementById('contacts-section');

    // Threshold in pixels to trigger the animation
    const headerThreshold = 10;

    // Listen for scroll events on the window
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;

        // Step 1: Header Shrink & Initial Text Fade
        if (scrollPosition > headerThreshold) {
            header.classList.add('scrolled');
            if (companyNameEl) companyNameEl.classList.add('hidden');
            if (companyTaglineEl) companyTaglineEl.classList.add('hidden');
            if (scrollIndicator) scrollIndicator.classList.add('hidden');
        } else {
            header.classList.remove('scrolled');
            if (companyNameEl) companyNameEl.classList.remove('hidden');
            if (companyTaglineEl) companyTaglineEl.classList.remove('hidden');
            if (scrollIndicator) scrollIndicator.classList.remove('hidden');
        }

        // Step 2: Contacts Fade In
        if (scrollPosition > headerThreshold) {
            if (contactsSection) contactsSection.classList.add('visible');
        } else {
            if (contactsSection) contactsSection.classList.remove('visible');
        }
    });

    // ============================================================
    // vCARD DOWNLOAD (built from config)
    // ============================================================
    const saveContactBtn = document.getElementById('btn-save-contact');
    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Convert profile photo to base64 for vCard
            let photoBase64 = cfg.vcard.photoBase64 || '';
            let photoType = 'PNG';
            if (cfg.person.profilePhoto) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = cfg.person.profilePhoto;
                    });
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    photoBase64 = dataUrl.split(',')[1];
                    photoType = 'JPEG';
                } catch (err) {
                    console.warn('Could not convert profile photo for vCard:', err);
                }
            }

            // Build social URL lines dynamically
            const socialUrlLines = cfg.socials.map(s =>
                `URL;type=${s.platform}:${s.url}`
            ).join('\n');

            const socialProfileLines = cfg.socials.map(s =>
                `X-SOCIALPROFILE;type=${s.platform.toLowerCase()}:${s.url}`
            ).join('\n');

            // Build phone number lines dynamically (supports multiple numbers)
            const phoneLines = cfg.contact.phones.map(p =>
                `TEL;TYPE=${p.label.toUpperCase()},VOICE:${p.number}`
            ).join('\n');

            const vcardContent = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                // Personal name as the primary display name for the contact
                `FN:${cfg.person.fullName}`,
                `N:${cfg.person.lastName};${cfg.person.firstName};${cfg.person.middleName || ''};;`,
                `ORG:${cfg.company.name}`,
                `TITLE:${cfg.person.title}`,
                `NOTE:${cfg.vcard.contactNote}`,
                `PHOTO;ENCODING=b;TYPE=${photoType}:${photoBase64}`,
                phoneLines,
                `EMAIL;TYPE=PREF,INTERNET:${cfg.contact.email}`,
                `URL;type=Location:${cfg.contact.locationUrl}`,
                `URL;type=WhatsApp:https://wa.me/${cfg.contact.whatsapp}`,
                socialUrlLines,
                socialProfileLines,
                `ADR;TYPE=WORK:;;${cfg.vcard.addressStreet};${cfg.vcard.addressCity};${cfg.vcard.addressState};;${cfg.vcard.addressCountry}`,
                'END:VCARD',
            ].join('\n');

            const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${cfg.person.fullName.replace(/\s+/g, '_')}.vcf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        });
    }
});
