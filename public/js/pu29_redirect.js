// PU-29 jurnali endi yangi interfeysda: /dashboard/pu29
// (haqiqiy o'lchovlar serverda saqlanadi, me'yorlar bo'yicha rang, Excel, chop etish).
// Eski interfeysdagi PU-29 tugmalari va kartochkalari shu yerga yo'naltiriladi.
// script.js'dan keyin yuklanadi, shuning uchun undagi eski funksiyalar ustidan yoziladi.
(function () {
    function openNewPU29() {
        window.location.assign('/dashboard/pu29');
    }
    window.openPU29Menu = openNewPU29;
    window.openPU29Window = openNewPU29;
    window.openPU29Modal = openNewPU29;
    window.openPU29EntryForSwitch = openNewPU29;
})();
