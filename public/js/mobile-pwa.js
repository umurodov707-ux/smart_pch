/**
 * SMART PCH: MOBILE & DESKTOP PWA INSTALLER + ULTRA-FAST ENGINE (60 FPS)
 * Yagona serverli Cross-Platform (Web + Desktop + Mobile) boshqaruv moduli
 */

(function () {
    let deferredPrompt = null;

    // Service Worker Ro'yxatdan o'tkazish (Offline & PWA - Force Update)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    reg.update();
                    console.log('✅ ServiceWorker PWA registered & updated:', reg.scope);
                })
                .catch(err => console.warn('⚠️ ServiceWorker error:', err));
        });
    }

    // PWA Install Prompt (Android/iOS & Windows Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showPWAInstallBanner();
    });

    function showPWAInstallBanner() {
        if (document.getElementById('smartpch-pwa-install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'smartpch-pwa-install-banner';
        banner.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
            border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 18px;
            padding: 12px 20px; z-index: 290000; display: flex; align-items: center; gap: 15px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.85); backdrop-filter: blur(16px);
            max-width: 90%; width: 440px; color: #fff;
            animation: pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        banner.innerHTML = `
            <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #0ea5e9, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);">
                <i class="fas fa-mobile-alt"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 900; font-size: 0.88rem; color: #38bdf8;">SMART PCH ILOVASINI O'RNATISH</div>
                <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">Telefon va Windows kompyuteriga ilova shaklida o'rnatish</div>
            </div>
            <button id="smartpch-pwa-install-btn" style="padding: 8px 14px; background: linear-gradient(135deg, #d4af37, #f59e0b); border: none; color: #000; font-weight: 900; border-radius: 10px; cursor: pointer; font-size: 0.78rem; whitespace: nowrap; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                O'rnatish
            </button>
            <button onclick="document.getElementById('smartpch-pwa-install-banner').remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 4px;">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(banner);

        document.getElementById('smartpch-pwa-install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`PWA install outcome: ${outcome}`);
                deferredPrompt = null;
            } else {
                if (window.SmartUtils) {
                    SmartUtils.showToast("Brauzer menyusidan 'Asosiy ekranga qo'shish' tugmasini bosing", "info");
                } else {
                    alert("Brauzeringiz menyusidan 'Asosiy ekranga qo'shish' yoki 'Install App' tugmasini bosing!");
                }
            }
            banner.remove();
        });
    }

    // ====================================================================
    // MOBILE BOTTOM NAVIGATION APP BAR (4 Exact Buttons: Bosh sahifa | Bo'limlar | Xizmatlar | Profil (Chiqish))
    // ====================================================================
    window.initMobileBottomBar = function () {
        if (document.getElementById('mobile-bottom-app-bar')) return;

        const bottomBar = document.createElement('div');
        bottomBar.id = 'mobile-bottom-app-bar';
        bottomBar.className = 'mobile-bottom-bar-container';

        bottomBar.innerHTML = `
            <button class="mobile-bar-btn active" onclick="window.switchMobileTab('home', this)">
                <i class="fas fa-home"></i>
                <span>Bosh sahifa</span>
            </button>
            <button class="mobile-bar-btn" onclick="window.switchMobileTab('subdivisions', this)">
                <i class="fas fa-sitemap"></i>
                <span>Bo'limlar</span>
            </button>
            <button class="mobile-bar-btn" onclick="window.switchMobileTab('services', this)">
                <i class="fas fa-cubes"></i>
                <span>Xizmatlar</span>
            </button>
            <button class="mobile-bar-btn" onclick="window.switchMobileTab('profile', this)">
                <i class="fas fa-user-circle"></i>
                <span>Profil</span>
            </button>
        `;

        document.body.appendChild(bottomBar);
    };

    window.closeAllMobileModals = function () {
        document.querySelectorAll('#mobile-services-modal, #mobile-profile-modal, #mobile-department-modal').forEach(m => m.remove());
        document.querySelectorAll('.modal.active, .department-window.active, .integration-window.active, .journal-modal.active, [class*="-modal"].active, [id*="-modal"].active').forEach(m => {
            m.classList.remove('active');
        });
        const overlay = document.querySelector('.sidebar-overlay, #department-overlay');
        if (overlay) overlay.classList.remove('active');
        if (window.syncMobileBottomBar) window.syncMobileBottomBar();
    };

    window.syncMobileBottomBar = function () {
        const bottomBar = document.getElementById('mobile-bottom-app-bar');
        if (!bottomBar) return;

        // Clear active class from all buttons
        bottomBar.querySelectorAll('.mobile-bar-btn').forEach(b => b.classList.remove('active'));

        // Check what is open
        const servicesModal = document.getElementById('mobile-services-modal');
        const profileModal = document.getElementById('mobile-profile-modal');
        const sidebar = document.querySelector('.sidebar');
        const sidebarActive = sidebar && sidebar.classList.contains('mobile-active');
        const deptActive = document.querySelector('.department-window.active, .integration-window.active');

        if (servicesModal) {
            const btn = bottomBar.querySelector('button[onclick*="services"]');
            if (btn) btn.classList.add('active');
        } else if (profileModal) {
            const btn = bottomBar.querySelector('button[onclick*="profile"]');
            if (btn) btn.classList.add('active');
        } else if (sidebarActive || deptActive) {
            const btn = bottomBar.querySelector('button[onclick*="subdivisions"]');
            if (btn) btn.classList.add('active');
        } else {
            // Check if dashboard is active or another page
            const dash = document.getElementById('dashboard');
            const activeSection = document.querySelector('.content-section.active');
            
            if (dash && dash.classList.contains('active') && activeSection === dash) {
                const btn = bottomBar.querySelector('button[onclick*="home"]');
                if (btn) btn.classList.add('active');
            } else {
                // If some other department/subdivision section is active, we highlight subdivisions
                const btn = bottomBar.querySelector('button[onclick*="subdivisions"]');
                if (btn) btn.classList.add('active');
            }
        }
    };

    window.switchMobileTab = function (tab, btnEl) {
        window.closeAllMobileModals();

        switch (tab) {
            case 'home':
                // Active content sections'ni tozalash va dashboard'ni yoqish
                document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                const dash = document.getElementById('dashboard');
                if (dash) dash.classList.add('active');
                
                // Sidebar active elementini ham yangilash
                document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
                const dashLi = document.querySelector('.sidebar-menu li[data-target="dashboard"]');
                if (dashLi) dashLi.classList.add('active');
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'subdivisions':
                // Bo'linmalar ro'yxati va menyu yon panelini (Sidebar) 1 ta bosish bilan ochish (Saytdagi kabi)
                const sb = document.querySelector('.sidebar');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sb) {
                    sb.classList.toggle('mobile-active');
                    if (overlay) overlay.classList.toggle('active');
                } else {
                    const menuToggle = document.querySelector('.mobile-menu-toggle');
                    if (menuToggle) menuToggle.click();
                    else if (window.toggleMobileSidebar) window.toggleMobileSidebar();
                }
                break;
            case 'services':
                window.openMobileServicesModal();
                break;
            case 'profile':
                window.openMobileProfileModal();
                break;
        }

        if (window.syncMobileBottomBar) window.syncMobileBottomBar();
    };

    // ====================================================================
    // MOBILE DEPARTMENT MODAL (Bo'linma foydalanuvchisi uchun)
    // ====================================================================
    window.openMobileDepartmentModal = function () {
        let modal = document.getElementById('mobile-department-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'mobile-department-modal';
        modal.className = 'active';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(2, 6, 23, 0.92); backdrop-filter: blur(20px);
            z-index: 300000; display: flex; align-items: center; justify-content: center; padding: 20px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const depts = [
            { icon: "🏭", name: "Ishlab chiqarish bo'limi", id: "ishlab-chiqarish", color: "linear-gradient(135deg, #0ea5e9, #2563eb)" },
            { icon: "👥", name: "Xodimlar bo'limi", id: "xodimlar", color: "linear-gradient(135deg, #f59e0b, #d97706)" },
            { icon: "⚙️", name: "Mexanika bo'limi", id: "mexanika", color: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
            { icon: "🧮", name: "Bugalteriya bo'limi", id: "bugalteriya", color: "linear-gradient(135deg, #10b981, #059669)" },
            { icon: "📈", name: "Iqtisod bo'limi", id: "iqtisod", color: "linear-gradient(135deg, #ec4899, #be185d)" },
            { icon: "⚖️", name: "Metrologiya va elektr", id: "metrologiya", color: "linear-gradient(135deg, #14b8a6, #0d9488)" }
        ];

        modal.innerHTML = `
            <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 24px; max-width: 480px; width: 100%; color: white; box-shadow: 0 30px 80px rgba(0,0,0,0.95);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 18px;">
                    <h3 style="margin: 0; color: #38bdf8; font-weight: 900; font-size: 1.15rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-sitemap" style="color: #f59e0b;"></i> BO'LIMLAR RO'YXATI
                    </h3>
                    <button onclick="document.getElementById('mobile-department-modal').remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
                    ${depts.map(d => `
                        <div onclick="document.getElementById('mobile-department-modal').remove(); if(window.openDepartmentWindow) openDepartmentWindow('${d.id}');"
                             style="background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 14px; cursor: pointer; text-align: center; transition: transform 0.2s;"
                             onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="width: 44px; height: 44px; border-radius: 12px; background: ${d.color}; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                                ${d.icon}
                            </div>
                            <div style="font-size: 0.82rem; font-weight: 800; color: #f8fafc; line-height: 1.2;">${d.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    };

    // ====================================================================
    // MOBILE SERVICES MODAL (EXACT MATCH TO USER SCREENSHOT)
    // ====================================================================
    window.openMobileServicesModal = function () {
        let modal = document.getElementById('mobile-services-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'mobile-services-modal';
        modal.className = 'active';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(2, 6, 23, 0.94); backdrop-filter: blur(20px);
            z-index: 300000; display: flex; align-items: center; justify-content: center; padding: 15px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        modal.innerHTML = `
            <div style="background: #020617; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 20px; max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto; color: white; box-shadow: 0 30px 80px rgba(0,0,0,0.95);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
                    <h3 style="margin: 0; color: #38bdf8; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-cubes" style="color: #f59e0b;"></i> XIZMATLAR VA TIZIM INTEGRATSIYALARI
                    </h3>
                    <button onclick="document.getElementById('mobile-services-modal').remove(); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- CATEGORY 1: MONITORING & XARITA -->
                    <div>
                        <div style="font-size: 0.8rem; font-weight: 900; color: #f59e0b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-map-marked-alt"></i> MONITORING & XARITA
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openPCHMap) window.openPCHMap(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-train"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">PCh Xaritasi</div><div style="font-size: 0.68rem; color: #94a3b8;">Hududlar onlayn monitoringi</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.ModernWarnings) window.ModernWarnings.open(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-bullhorn"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Ogohlantirishlar</div><div style="font-size: 0.68rem; color: #94a3b8;">Navbatchi (DU-61) jurnali</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.ModernClosedTracks) window.ModernClosedTracks.open(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-road-barrier"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Yopiq Yo'llar</div><div style="font-size: 0.68rem; color: #94a3b8;">Harakat cheklovlari (DU-61)</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openSmartMonter) window.openSmartMonter(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-hard-hat"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Smart-Monter</div><div style="font-size: 0.68rem; color: #94a3b8;">Ovozli oflayn mobil interfeys</div></div>
                            </div>
                        </div>
                    </div>

                    <!-- CATEGORY 2: TEXNIK NAZORAT -->
                    <div>
                        <div style="font-size: 0.8rem; font-weight: 900; color: #f59e0b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-microscope"></i> TEXNIK NAZORAT
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openDefectoscopeTracker) window.openDefectoscopeTracker(); else if(window.ModernDefects) window.ModernDefects.open(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-microscope"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Defektaskopiya</div><div style="font-size: 0.68rem; color: #94a3b8;">Nuqsonlar nazorati (Yangi AI)</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.ModernInfrastructure) window.ModernInfrastructure.open(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-database"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Infratuzilma</div><div style="font-size: 0.68rem; color: #94a3b8;">Raqamli pasport tizimi</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.ModernAnalytics) window.ModernAnalytics.open(); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-chart-pie"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Tahlil (BI)</div><div style="font-size: 0.68rem; color: #94a3b8;">Tizim ko'rsatkichlari tahlili</div></div>
                            </div>
                        </div>
                    </div>

                    <!-- CATEGORY 3: TIZIM INTEGRATSIYALARI -->
                    <div>
                        <div style="font-size: 0.8rem; font-weight: 900; color: #f59e0b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-network-wired"></i> TIZIM INTEGRATSIYALARI
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openIntegrations) window.openIntegrations('hrm'); else if(window.openDepartmentWindow) openDepartmentWindow('xodimlar'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-users-gear"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">HRM.UZ</div><div style="font-size: 0.68rem; color: #94a3b8;">Xodimlar boshqaruv tizimi</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openIntegrations) window.openIntegrations('kmo'); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-shield-halved"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">KMO Tizimi</div><div style="font-size: 0.68rem; color: #94a3b8;">Ko'rik monitoringi nazorati</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openIntegrations) window.openIntegrations('obs'); else if(window.openDepartmentWindow) openDepartmentWindow('ishlab-chiqarish'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-subway"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">OBS Tizimi</div><div style="font-size: 0.68rem; color: #94a3b8;">Ob'ektlar bazasi monitoringi</div></div>
                            </div>
                            <div onclick="document.getElementById('mobile-services-modal').remove(); if(window.openGeneralFaceIDAttendance) window.openGeneralFaceIDAttendance(); else if(window.openDepartmentWindow) openDepartmentWindow('xodimlar'); if(window.syncMobileBottomBar) window.syncMobileBottomBar();" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(139, 92, 246, 0.2); color: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;"><i class="fas fa-user-check"></i></div>
                                <div><div style="font-size: 0.82rem; font-weight: 800;">Face ID Davomat</div><div style="font-size: 0.68rem; color: #94a3b8;">Davomatni tekshirish</div></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        document.body.appendChild(modal);
    };

    // ====================================================================
    // MOBILE PROFILE & LOGOUT MODAL
    // ====================================================================
    window.openMobileProfileModal = function () {
        let modal = document.getElementById('mobile-profile-modal');
        if (modal) modal.remove();

        const user = window.Auth?.currentUser || { name: 'PCh Inspektor', role: 'Foydalanuvchi', department: 'PCh-16' };

        modal = document.createElement('div');
        modal.id = 'mobile-profile-modal';
        modal.className = 'active';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(2, 6, 23, 0.92); backdrop-filter: blur(20px);
            z-index: 300000; display: flex; align-items: center; justify-content: center; padding: 20px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        modal.innerHTML = `
            <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 24px; max-width: 420px; width: 100%; color: white; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.95);">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                    <button onclick="document.getElementById('mobile-profile-modal').remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Avatar -->
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9, #2563eb); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: white; box-shadow: 0 10px 25px rgba(14, 165, 233, 0.4); border: 3px solid #38bdf8;">
                    <i class="fas fa-user-shield"></i>
                </div>

                <h3 style="margin: 0 0 5px; font-size: 1.2rem; font-weight: 900; color: #fff;">${user.name || 'Foydalanuvchi'}</h3>
                <div style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; margin-bottom: 15px;">${user.role || 'Inspektor'} — ${user.department || 'PCh-16'}</div>

                <div style="background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; text-align: left; margin-bottom: 20px; font-size: 0.82rem; color: #94a3b8;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Tizim holati:</span> <strong style="color:#10b981;">Online (Baza ulandi)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Qurilma rejim:</span> <strong style="color:#38bdf8;">Mobil PWA Native</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Versiya:</span> <strong style="color:#f8fafc;">v2026.07.30 (Ultra-Fast)</strong>
                    </div>
                </div>

                <!-- TOGGLE DESKTOP VIEW BUTTON -->
                <button onclick="window.toggleDesktopView(); document.getElementById('mobile-profile-modal').remove();"
                        style="width: 100%; padding: 12px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 14px; font-weight: 900; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);">
                    <i class="fas fa-desktop"></i>
                    <span id="view-mode-toggle-text">${window.isDesktopViewActive() ? "📱 MOBIL REJIMGA O'TISH" : "💻 KOMPYUTER REJIMIGA O'TISH"}</span>
                </button>

                <!-- LOGOUT BUTTON -->
                <button onclick="document.getElementById('mobile-profile-modal').remove(); if(window.Auth && window.Auth.logout) window.Auth.logout(); else location.reload();"
                        style="width: 100%; padding: 14px; background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; border-radius: 14px; font-weight: 900; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                    <i class="fas fa-sign-out-alt"></i> TIZIMDAN CHIQISH (LOGOUT)
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    };

    // Desktop View Toggle (Kompyuter ko'rinishi va Mobil ko'rinish o'rtasida o'tish)
    window.isDesktopViewActive = function () {
        return localStorage.getItem('smartpch_view_mode') === 'desktop';
    };

    window.toggleDesktopView = function (forceMode) {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }

        const currentMode = window.isDesktopViewActive();
        const targetMode = forceMode || (currentMode ? 'mobile' : 'desktop');

        if (targetMode === 'desktop') {
            viewportMeta.setAttribute('content', 'width=1280, initial-scale=0.35, maximum-scale=3.0, user-scalable=yes');
            localStorage.setItem('smartpch_view_mode', 'desktop');
            document.body.classList.add('forced-desktop-view');
            if (window.SmartUtils) SmartUtils.showToast("💻 Kompyuter rejimi (Desktop View) yoqildi!", "success");
        } else {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            localStorage.setItem('smartpch_view_mode', 'mobile');
            document.body.classList.remove('forced-desktop-view');
            if (window.SmartUtils) SmartUtils.showToast("📱 Mobil rejim (Mobile View) yoqildi!", "info");
        }
    };

    // Auto apply saved mode on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        if (window.isDesktopViewActive()) {
            window.toggleDesktopView('desktop');
        }
    });

    // Auto-init on mobile DOM load
    document.addEventListener('DOMContentLoaded', () => {
        if (window.innerWidth <= 768) {
            window.initMobileBottomBar();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            window.initMobileBottomBar();
        } else {
            const bar = document.getElementById('mobile-bottom-app-bar');
            if (bar) bar.style.display = 'none';
        }
    });

})();
