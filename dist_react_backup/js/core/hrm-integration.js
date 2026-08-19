// HRM TIZIMI FUNKSIYALARI
window.openHRMNewTab = function() {
    window.open('https://hrm.railway.uz/hrm/dashboard', '_blank');
}

window.refreshHRM = function() {
    const iframe = document.getElementById('hrmFrame');
    if (iframe) {
        iframe.src = iframe.src;
    }
}

window.handleHRMError = function() {
    const fallback = document.getElementById('hrmFallback');
    const iframe = document.getElementById('hrmFrame');
    if (fallback && iframe) {
        iframe.style.display = 'none';
        fallback.style.display = 'flex';
    }
}

// Iframe yuklangandan keyin tekshirish (faqat HRM sahifasida)
setTimeout(() => {
    const iframe = document.getElementById('hrmFrame');
    if (!iframe) return; 
    iframe.onerror = window.handleHRMError;
    try {
        if (iframe.contentWindow && iframe.contentWindow.length === 0) {
            // handleHRMError();
        }
    } catch (e) {
        // Cross-origin xatosi - bu normal holat
    }
}, 3000);
