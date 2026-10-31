// PU-74 jurnali endi yangi interfeysda: /dashboard/pu74
// (oylar arxivi, tasdiqlash, Excel eksport, bo'limlardan to'ldirish).
// Eski oynadagi tugmalar va havolalar shu yerga yo'naltiriladi.
(function () {
    function openNewJournal() {
        window.location.assign('/dashboard/pu74');
    }
    window.openPU74Window = openNewJournal;
    window.PU74Dashboard = { open: openNewJournal };
})();
