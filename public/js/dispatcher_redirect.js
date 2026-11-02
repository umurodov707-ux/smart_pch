// Dispetcherlik (kunlik hisobotlar) endi faqat yangi interfeysda: /dashboard/dispatcher
// (liniya sxemasi, qabul qilish / qaytarish, eslatma, yig'ma Excel; bo'linma uchun
// jadvalda tahrirlash va telefon ko'rinishi). Eski dispatcher.js olib tashlandi.
// Eski kodning dispetcherga tegishli barcha kirish nuqtalari shu yerda yangi sahifaga
// yo'naltiriladi. script.js'dan keyin yuklanadi.
(function () {
    var URL_ = '/dashboard/dispatcher';
    function go() {
        if (window.SmartEmbed) window.SmartEmbed.go(URL_);
        else window.location.assign(URL_);
    }

    // Bo'lim menyusidagi "Dispetcher bo'limi"
    var original = window.openDepartmentWindow;
    if (typeof original === 'function') {
        window.openDepartmentWindow = function (departmentId) {
            if (departmentId === 'dispetcher') return go();
            return original.apply(this, arguments);
        };
    }

    // Bo'linma profilidagi "DISPETCHER JURNALI" tugmasi (ilgari bu funksiya umuman
    // yo'q edi — tugma hech narsa qilmasdi), AI yordamchining "ogohlantirish/davomat kiritish"
    window.renderReportingSystem = go;
    window.openDispatcherModal = go;

    // Bo'linma oynasidagi hisobot bo'limi: eski forma o'rniga yangi sahifaga havola
    window.renderSubdivisionReportSection = function (winEl) {
        var content = winEl && winEl.querySelector('.window-content');
        if (!content) return go();
        var box = content.querySelector('#subdivision-report-view') || document.createElement('div');
        box.id = 'subdivision-report-view';
        box.style.cssText = 'display:block;padding:28px;margin:10px 0;border-radius:16px;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.3);color:#e2e8f0;';
        box.innerHTML = '<div style="font-size:1.1rem;font-weight:700;margin-bottom:6px;">Kunlik tezkor hisobot</div>' +
            '<div style="color:#94a3b8;margin-bottom:14px;">Hisobot endi yangi “Dispetcher” sahifasida to‘ldiriladi va yuboriladi.</div>' +
            '<button type="button" style="padding:10px 18px;border-radius:10px;border:0;background:#fbbf24;color:#000;font-weight:800;cursor:pointer;">Hisobotni ochish</button>';
        box.querySelector('button').addEventListener('click', go);
        if (!box.parentNode) content.insertBefore(box, content.firstChild);
    };

    // Bo'linma kartochkalaridagi "bugun yuborilganmi" belgisi uchun — serverdagi haqiqiy holat.
    // script.js window.subdivisionReports obyektiga havola saqlaydi, shuning uchun u
    // almashtirilmaydi, faqat ichi yangilanadi.
    window.initDispatcherData = function () {
        var store = window.subdivisionReports || (window.subdivisionReports = {});
        if (!window.SmartUtils || !window.SmartUtils.fetchAPI) return Promise.resolve();
        return window.SmartUtils.fetchAPI('/reports/today').then(function (list) {
            Object.keys(store).forEach(function (k) { delete store[k]; });
            (list || []).forEach(function (r) { store[r.bolinma_key || r.bolinma_id] = r; });
        }).catch(function () { /* tarmoq yo'q — belgi ko'rsatilmaydi */ });
    };
})();
