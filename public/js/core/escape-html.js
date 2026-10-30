/**
 * XSS himoyasi: foydalanuvchi kiritgan matnni HTML ichiga qo'yishdan oldin
 * maxsus belgilarni zararsizlantiradi.
 *
 *   el.innerHTML = `<b>${escapeHtml(m.employee_name)}</b>`;
 *
 * Bu fayl index.html da boshqa barcha skriptlardan OLDIN yuklanishi kerak.
 */
(function () {
    var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

    window.escapeHtml = function (value) {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>"'`]/g, function (ch) {
            return MAP[ch];
        });
    };
})();
