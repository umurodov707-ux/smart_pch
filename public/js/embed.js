/**
 * BITTA SAYT: eski bo'lim oynalarini yangi saytning ichida ko'rsatish.
 *
 * Yangi sayt (/dashboard/bolim/:id) shu sahifani iframe'da ochadi:
 *   /index.html?embed=<bo'lim id>   masalan: ishlab-chiqarish, bugalteriya, bolinma3
 *
 * Bu rejimda eski saytning o'z menyusi, sarlavhasi, login va bosh sahifasi yashiriladi;
 * faqat so'ralgan bo'lim oynasi butun maydonni egallab ochiladi. Kirish (token) umumiy —
 * localStorage bitta, shuning uchun qayta kirish so'ralmaydi.
 *
 * Yangi saytga yuboriladigan xabarlar: klassik-ready, klassik-close, klassik-navigate, klassik-auth.
 * script.js va boshqa modullardan KEYIN yuklanadi.
 */
(function () {
    var params = new URLSearchParams(window.location.search);
    var target = params.get('embed');
    var inFrame = window.parent && window.parent !== window;
    if (!target) return;

    function tell(msg) {
        try { if (inFrame) window.parent.postMessage(msg, window.location.origin); } catch (e) { /* yo'q */ }
    }
    window.SmartEmbed = { active: true, target: target, tell: tell };

    document.documentElement.classList.add('embed-mode');
    var css = document.createElement('style');
    // Eslatma: script.js #mainSystem ga inline "visibility: visible !important" yozadi,
    // shuning uchun uning o'zi emas, ichidagi qismlar yashiriladi.
    css.textContent = [
        // eski saytning o'z "qobig'i" ko'rinmaydi
        'html.embed-mode #landingPage, html.embed-mode #loginPage, html.embed-mode #department-overlay,',
        'html.embed-mode #mobile-bottom-app-bar, html.embed-mode #sa-fab, html.embed-mode .ai-floating-btn, html.embed-mode .sidebar-floating-toggle,',
        'html.embed-mode #mainSystem .navbar, html.embed-mode #mainSystem .rail-top, html.embed-mode #mainSystem aside.sidebar { display: none !important; }',
        // bo'lim oynasi rejimi: asosiy sahifaning qolgan qismi ham ko'rinmaydi
        'html.embed-mode.embed-window #mainSystem > * { display: none !important; }',
        // o'z bo'linmasi rejimi: asosiy sahifa (bo'linma profili) menyusiz, to'liq kenglikda
        'html.embed-mode.embed-own #mainContent, html.embed-mode.embed-own .main-content { margin-left: 0 !important; width: 100% !important; max-width: none !important; }',
        // boshqa bo'linmani kuzatish oynasi butun maydonda
        'html.embed-mode #admin-sub-modal > div { background: #0b1220 !important; backdrop-filter: none !important; }',
        'html.embed-mode #admin-sub-modal > div > div { width: 100% !important; height: 100% !important; border-radius: 0 !important; border: 0 !important; }',
        'html.embed-mode body { background: #0b1220 !important; }',
        'html.embed-mode.embed-window body { overflow: hidden !important; }',
        // ochilgan bo'lim oynasi butun maydonni egallaydi
        'html.embed-mode .department-window.active { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important;',
        '  max-width: none !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; transform: none !important; visibility: visible !important; pointer-events: auto !important; }'
    ].join('\n');
    document.head.appendChild(css);

    // Eski kod yangi sahifaga yo'naltirsa (PU-74, PU-29, Dispetcher) — butun sayt o'tadi, iframe ichida emas
    var assign = window.location.assign.bind(window.location);
    window.SmartEmbed.go = function (to) {
        if (inFrame && /^\/dashboard/.test(to)) tell({ type: 'klassik-navigate', to: to });
        else assign(to);
    };

    // Bo'lim oynasining "orqaga" tugmasi — yangi saytning asosiy paneliga qaytish
    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest && e.target.closest('.close-window');
        if (!btn) return;
        var win = btn.closest('.department-window');
        if (win && win.id === target + '-window') {
            e.preventDefault(); e.stopPropagation();
            tell({ type: 'klassik-close' });
        }
    }, true);

    var tries = 0;
    function open() {
        tries += 1;
        var loggedIn = !!localStorage.getItem('jwtToken') && !!localStorage.getItem('currentUser');
        if (!loggedIn) { tell({ type: 'klassik-auth' }); return; }
        if (typeof window.openDepartmentWindow !== 'function' || typeof currentUser === 'undefined' || !currentUser) {
            if (tries < 100) return setTimeout(open, 100);
            tell({ type: 'klassik-auth' });
            return;
        }
        try {
            var bol = /^bolinma(\d{1,2})$/.exec(target);
            if (bol) {
                var mine = (currentUser.bolinmalar || []).some(function (b) {
                    var m = /(\d{1,3})/.exec(String(b)); return m && Number(m[1]) === Number(bol[1]);
                });
                if (currentUser.role === 'bolinma' && mine) {
                    // o'z bo'linmasi — eski saytning bosh sahifasi (bo'linma profili)
                    document.documentElement.classList.add('embed-own');
                } else if (typeof window.openAdminSubdivisionView === 'function') {
                    document.documentElement.classList.add('embed-window');
                    window.openAdminSubdivisionView(target);
                    var closeBtn = document.querySelector('#admin-sub-modal button[onclick]');
                    if (closeBtn) closeBtn.addEventListener('click', function () { tell({ type: 'klassik-close' }); });
                }
            } else {
                document.documentElement.classList.add('embed-window');
                window.openDepartmentWindow(target);
            }
            tell({ type: 'klassik-ready', id: target });
        } catch (err) {
            console.error('embed:', err);
            tell({ type: 'klassik-ready', id: target, error: String(err && err.message || err) });
        }
    }
    if (document.readyState === 'complete') setTimeout(open, 50);
    else window.addEventListener('load', function () { setTimeout(open, 50); });
})();
