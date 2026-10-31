// Dispetcherlik (kunlik hisobotlar) endi yangi interfeysda: /dashboard/dispatcher
// (liniya sxemasi, qabul qilish / qaytarish, eslatma, yig'ma Excel; bo'linma uchun
// jadvalda tahrirlash va telefon ko'rinishi). Ma'lumot formati bir xil.
// script.js'dan keyin yuklanadi va openDepartmentWindow('dispetcher') ni yo'naltiradi.
(function () {
    var original = window.openDepartmentWindow;
    if (typeof original !== 'function') return;
    window.openDepartmentWindow = function (departmentId) {
        if (departmentId === 'dispetcher') {
            window.location.assign('/dashboard/dispatcher');
            return;
        }
        return original.apply(this, arguments);
    };
})();
