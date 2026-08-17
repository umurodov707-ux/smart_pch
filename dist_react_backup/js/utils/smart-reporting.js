/**
 * UTILS Layer: Premium Reporting & Excel Export
 */
const SmartReporting = {
    /**
     * Exports an array of objects to Excel
     * @param {Array} data - Array of objects
     * @param {String} fileName - Name of the file
     */
    exportToExcel: function(data, fileName = 'Hisobot.xlsx') {
        if (!window.XLSX) {
            // Load XLSX if missing (CDN fallback)
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
            script.onload = () => this.performExport(data, fileName);
            document.head.appendChild(script);
            return;
        }
        this.performExport(data, fileName);
    },

    performExport: function(data, fileName) {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Ma'lumotlar");
            XLSX.writeFile(workbook, fileName);
            if (window.showToast) window.showToast('Excel fayli yuklandi', 'success');
        } catch (e) {
            console.error('Excel export error:', e);
            alert('Excelga yuklashda xatolik yuz berdi');
        }
    }
};

window.SmartReporting = SmartReporting;
