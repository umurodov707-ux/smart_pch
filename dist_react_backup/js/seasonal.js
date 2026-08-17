(function () {
    const month = new Date().getMonth(); // 0=Yanvar, 11=Dekabr
    const container = document.getElementById('seasonalContainer');
    if (!container) return;

    if (month >= 11 || month <= 1) {
        // Qish: Dekabr, Yanvar, Fevral — Qor
        container.className = 'snow-container';
        for (let i = 0; i < 10; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            container.appendChild(flake);
        }
    } else if (month >= 2 && month <= 4) {
        // Bahor: Mart, Aprel, May — Sakura gullari
        container.className = 'snow-container';
        for (let i = 0; i < 8; i++) {
            const petal = document.createElement('div');
            petal.className = 'snowflake';
            petal.style.cssText = 'background: linear-gradient(135deg, #ffb7c5, #ff69b4); border-radius: 50% 0 50% 50%; width: ' + (6 + Math.random() * 6) + 'px; height: ' + (6 + Math.random() * 6) + 'px; opacity: ' + (0.4 + Math.random() * 0.5);
            container.appendChild(petal);
        }
    }
    // Yoz va Kuz — animatsiya yo'q
})();
