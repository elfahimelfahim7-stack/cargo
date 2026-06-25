// --- JavaScript for Cargo Shorts Landing Page ---

// 1. Gallery Thumbnail Switcher
function changeImage(imageSrc, thumbnailElement) {
    const mainPreview = document.getElementById('main-preview');
    if (!mainPreview) return;

    // Fade out effect
    mainPreview.style.opacity = '0.3';
    
    setTimeout(() => {
        mainPreview.src = imageSrc;
        mainPreview.style.opacity = '1';
    }, 150);

    // Update active class on thumbnails
    const thumbnails = document.querySelectorAll('.thumb-item');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });

    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

// 2. FAQ Accordion Toggle
document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            const isActive = currentItem.classList.contains('active');
            
            // Close all items
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(item => {
                item.classList.remove('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = null;
                }
            });
            
            // If the clicked item was not active, open it
            if (!isActive) {
                currentItem.classList.add('active');
                const answer = currentItem.querySelector('.faq-answer');
                if (answer) {
                    // Set max-height to scrollHeight for smooth transition
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            }
        });
    });
});

// 3. Form Order Submission & Simulation
function handleOrderSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('checkout-form');
    const btnWhatsapp = document.getElementById('btn-submit-whatsapp');
    
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value.trim();
    const district = document.getElementById('district').value.trim();
    const size = document.querySelector('input[name="size"]:checked').value;
    const notes = '';

    // Simple Moroccan Phone Validation (starts with 0, total 10 digits)
    const phoneRegex = /^(05|06|07|08)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        alert('يرجى إدخال رقم هاتف مغربي صحيح (مثال: 0612345678)');
        document.getElementById('phone').focus();
        return;
    }

    // Disable button and show loader spinner
    if (btnWhatsapp) {
        btnWhatsapp.disabled = true;
        btnWhatsapp.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فتح الواتساب...';
    }

    const comboText = 'الباك القياسي (سروال أسود + رمادي + كحلي)';

    // 1. Send data to Google Sheets silently (CORS-friendly GET request with query params)
    const googleSheetUrl = 'https://script.google.com/macros/s/AKfycbwgPr2WbQ4ltMAhUc2B6mW_2m8KltQmcskI6MFZ6UCW/exec';
    const params = new URLSearchParams();
    params.append('date', new Date().toLocaleString('ar-MA'));
    params.append('fullname', fullname);
    params.append('phone', phone);
    params.append('city', city);
    params.append('district', district);
    params.append('size', size);
    params.append('colorCombo', comboText);
    params.append('notes', notes || 'لا توجد ملاحظات');
    params.append('submitType', 'WhatsApp');

    fetch(`${googleSheetUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors', // Bypasses CORS redirects blockages on local file testing
        cache: 'no-cache'
    })
    .then(() => console.log('Order sent to Google Sheet successfully via GET'))
    .catch(err => console.error('Error sending to Google Sheet:', err));

    // 2. Prepare WhatsApp Link
    const whatsappMessage = `السلام عليكم، أريد تأكيد طلبي لباك 3 سراويل كارغو نصاصين:
- الاسم الكامل: ${fullname}
- رقم الهاتف: ${phone}
- المدينة: ${city}
- الحي/المنطقة: ${district}
- المقاس: ${size}
- الألوان: ${comboText}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=212652683023&text=${encodeURIComponent(whatsappMessage)}`;

    // Populate Success Modal Fields
    document.getElementById('customer-name-modal').innerText = fullname;
    document.getElementById('customer-size-modal').innerText = size;
    document.getElementById('customer-phone-modal').innerText = phone;
    document.getElementById('customer-city-modal').innerText = city;
    document.getElementById('customer-district-modal').innerText = district;

    // Set WhatsApp link in Success Modal button
    const whatsappBtnModal = document.getElementById('whatsapp-confirm-btn');
    if (whatsappBtnModal) {
        whatsappBtnModal.style.display = 'flex';
        whatsappBtnModal.href = whatsappUrl;
    }

    // Save order to LocalStorage (as backup)
    const orderData = {
        id: 'ORD-' + Date.now(),
        fullname,
        phone,
        city,
        district,
        size,
        colorCombo: comboText,
        notes: notes || 'لا توجد ملاحظات',
        price: '199 DH',
        status: 'WhatsApp Redirect',
        date: new Date().toISOString()
    };
    
    let existingOrders = [];
    try {
        existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        existingOrders = [];
    }
    existingOrders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Reset Form
    form.reset();

    // Enable button back to normal
    if (btnWhatsapp) {
        btnWhatsapp.disabled = false;
        btnWhatsapp.innerHTML = '<i class="fa-brands fa-whatsapp" style="font-size: 1.5rem;"></i> تأكيد الطلب عبر الواتساب فوراً';
    }

    // Show Success Modal
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('open');
    }

    // Automatically open WhatsApp in new tab
    try {
        window.open(whatsappUrl, '_blank');
    } catch (e) {
        console.warn('WhatsApp auto-redirect blocked by pop-up blocker');
    }
}

// 4. Modal Closer
function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}
