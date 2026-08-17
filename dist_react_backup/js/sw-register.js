if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const CURRENT_CACHE = 'smart-pch-v20260528.6';
        caches.keys().then(names => {
            names.forEach(name => {
                if (name !== CURRENT_CACHE) caches.delete(name);
            });
        });
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW registered:', reg);

            const showUpdateBanner = () => {
                const banner = document.getElementById('pwa-update-banner');
                if (!banner) return;
                banner.style.display = 'flex';
                document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
                    reg.waiting?.postMessage('skipWaiting');
                    window.location.reload();
                }, { once: true });
                document.getElementById('pwa-update-dismiss')?.addEventListener('click', () => {
                    banner.style.display = 'none';
                }, { once: true });
            };

            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                };
            };

            if (reg.waiting) showUpdateBanner();
        }).catch(err => {
            console.error('SW registration failed:', err);
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    });
}
