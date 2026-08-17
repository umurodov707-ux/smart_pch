/**
 * SMART ASSISTANT — Gemini-powered AI Chat Widget
 * Foydalanuvchi har qanday savol bera oladi, Gemini javob beradi.
 * Server: /api/ai/chat (routes/ai.js)
 */

(function () {
    'use strict';

    // ── Holat ────────────────────────────────────────────────────
    let isOpen = false;
    let isTyping = false;
    let messageHistory = [];
    const KB_MODE = true; // Knowledge Base rejimi faol

    // ── CSS ───────────────────────────────────────────────────────
    const STYLE = `
        #sa-fab {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
            border: none;
            cursor: pointer;
            z-index: 99998;
            box-shadow: 0 8px 32px rgba(59,130,246,0.45), 0 0 0 0 rgba(59,130,246,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
            animation: sa-pulse 3s infinite;
        }
        #sa-fab.open {
            animation: none;
            transform: rotate(45deg) scale(1.05);
            box-shadow: 0 12px 40px rgba(59,130,246,0.6);
        }
        #sa-fab:hover { transform: scale(1.12); }
        #sa-fab.open:hover { transform: rotate(45deg) scale(1.15); }
        #sa-fab i { font-size: 1.5rem; color: #fff; pointer-events: none; }

        #sa-badge {
            position: absolute;
            top: -4px; right: -4px;
            background: #ef4444;
            color: #fff;
            font-size: 0.6rem;
            font-weight: 900;
            width: 18px; height: 18px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 2px solid #020617;
            display: none;
        }

        @keyframes sa-pulse {
            0%   { box-shadow: 0 8px 32px rgba(59,130,246,0.45), 0 0 0 0 rgba(59,130,246,0.4); }
            60%  { box-shadow: 0 8px 32px rgba(59,130,246,0.45), 0 0 0 14px rgba(59,130,246,0); }
            100% { box-shadow: 0 8px 32px rgba(59,130,246,0.45), 0 0 0 0 rgba(59,130,246,0); }
        }

        #sa-panel {
            position: fixed;
            bottom: 104px;
            right: 28px;
            width: 400px;
            height: 580px;
            background: rgba(10, 15, 30, 0.96);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(59,130,246,0.25);
            border-radius: 24px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(59,130,246,0.08);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
            transform: scale(0.85) translateY(30px);
            opacity: 0;
            pointer-events: none;
        }
        #sa-panel.open {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: all;
        }

        /* Header */
        #sa-header {
            padding: 18px 20px 14px;
            background: linear-gradient(135deg, rgba(30,58,138,0.8), rgba(6,182,212,0.15));
            border-bottom: 1px solid rgba(59,130,246,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }
        #sa-avatar {
            width: 42px; height: 42px;
            border-radius: 14px;
            background: linear-gradient(135deg, #d4af37, #b45309);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
        }
        #sa-avatar::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            animation: sa-shine 3s infinite;
        }
        @keyframes sa-shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        #sa-header-info { flex: 1; }
        #sa-header-info h4 {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.3px;
        }
        #sa-status {
            display: flex; align-items: center; gap: 5px;
            font-size: 0.7rem; color: #10b981; font-weight: 600; margin-top: 2px;
        }
        #sa-status-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 6px #10b981;
            animation: sa-blink 2s infinite;
        }
        @keyframes sa-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        #sa-close-btn {
            background: rgba(255,255,255,0.08);
            border: none;
            color: #94a3b8;
            width: 32px; height: 32px;
            border-radius: 10px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: 0.2s;
            flex-shrink: 0;
        }
        #sa-close-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

        /* Quick Chips */
        #sa-chips {
            padding: 10px 14px;
            display: flex;
            gap: 7px;
            overflow-x: auto;
            scrollbar-width: none;
            flex-shrink: 0;
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        #sa-chips::-webkit-scrollbar { display: none; }
        .sa-chip {
            white-space: nowrap;
            padding: 5px 12px;
            background: rgba(59,130,246,0.1);
            border: 1px solid rgba(59,130,246,0.2);
            border-radius: 20px;
            color: #93c5fd;
            font-size: 0.7rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .sa-chip:hover { background: rgba(59,130,246,0.25); color: #bfdbfe; border-color: rgba(59,130,246,0.4); }

        /* Messages */
        #sa-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            scrollbar-width: thin;
            scrollbar-color: rgba(59,130,246,0.2) transparent;
        }
        #sa-messages::-webkit-scrollbar { width: 4px; }
        #sa-messages::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 4px; }

        .sa-msg { display: flex; gap: 10px; animation: sa-msg-in 0.3s ease; }
        @keyframes sa-msg-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .sa-msg.user { flex-direction: row-reverse; }

        .sa-msg-icon {
            width: 30px; height: 30px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.8rem;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .sa-msg.bot .sa-msg-icon { background: linear-gradient(135deg,#1d4ed8,#0891b2); color: #fff; }
        .sa-msg.user .sa-msg-icon { background: rgba(30,41,59,0.8); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }

        .sa-bubble {
            max-width: 78%;
            padding: 11px 15px;
            border-radius: 16px;
            font-size: 0.85rem;
            line-height: 1.6;
            word-break: break-word;
        }
        .sa-msg.bot .sa-bubble {
            background: rgba(30,41,59,0.7);
            border: 1px solid rgba(59,130,246,0.15);
            color: #e2e8f0;
            border-bottom-left-radius: 4px;
        }
        .sa-msg.user .sa-bubble {
            background: linear-gradient(135deg,#1d4ed8,#1e40af);
            color: #fff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 14px rgba(29,78,216,0.3);
        }
        .sa-bubble strong { color: #93c5fd; }
        .sa-bubble code {
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #06b6d4;
        }

        /* Typing indicator */
        #sa-typing {
            display: none;
            padding: 0 16px 8px;
            flex-shrink: 0;
        }
        #sa-typing.visible { display: flex; align-items: center; gap: 6px; }
        .sa-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            background: #3b82f6;
            animation: sa-dot-bounce 1.2s infinite;
        }
        .sa-dot:nth-child(2) { animation-delay: 0.2s; }
        .sa-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes sa-dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        #sa-typing-label { font-size: 0.7rem; color: #64748b; }

        #sa-footer {
            padding: 12px 14px;
            background: rgba(15,23,42,0.8);
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            gap: 10px;
            align-items: center; /* Changed from flex-end for better mic alignment */
            flex-shrink: 0;
            position: relative;
        }
        #sa-input {
            flex: 1;
            background: rgba(30,41,59,0.7);
            border: 1px solid rgba(59,130,246,0.2);
            color: #fff;
            border-radius: 16px;
            padding: 12px 16px;
            padding-right: 40px; /* Space for mic icon */
            font-size: 0.875rem;
            resize: none;
            outline: none;
            font-family: inherit;
            line-height: 1.5;
            max-height: 110px;
            transition: border-color 0.2s, box-shadow 0.2s;
            scrollbar-width: thin;
        }
        #sa-mic-btn {
            position: absolute;
            right: 70px;
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
            transition: 0.3s;
        }
        #sa-mic-btn:hover { color: #3b82f6; background: rgba(59,130,246,0.1); }
        
        @keyframes sa-mic-pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); transform: scale(1); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); transform: scale(1.2); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
        }
        .sa-mic-active {
            color: #ef4444 !important;
            animation: sa-mic-pulse 1.5s infinite;
            background: rgba(239, 68, 68, 0.1) !important;
        }
        #sa-input::placeholder { color: #475569; }
        #sa-input:focus {
            border-color: rgba(59,130,246,0.5);
            box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        #sa-send-btn {
            width: 44px; height: 44px;
            border-radius: 14px;
            background: linear-gradient(135deg,#1d4ed8,#0891b2);
            border: none;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: 0.2s;
            flex-shrink: 0;
            box-shadow: 0 4px 14px rgba(29,78,216,0.3);
        }
        #sa-send-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(29,78,216,0.5); }
        #sa-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Powered by */
        #sa-powered {
            text-align: center;
            font-size: 0.6rem;
            color: #334155;
            padding: 0 0 10px;
            flex-shrink: 0;
        }
        #sa-powered span { color: #475569; }

        /* Mobile */
        @media (max-width: 500px) {
            #sa-panel { width: calc(100vw - 20px); right: 10px; bottom: 90px; height: 65vh; }
            #sa-fab { bottom: 18px; right: 16px; }
        }
    `;

    // ── HTML ──────────────────────────────────────────────────────
    const QUICK_CHIPS = [
        { label: '📏 Koleya o\'lchami', msg: 'Standart rels kengligi (koleya) qancha bo\'lishi kerak? Ruxsat etilgan og\'ishlar qancha?' },
        { label: '🔀 Strelka bo\'shlig\'i', msg: 'Ostryak va ramali rels orasidagi fly-gap (ochiqlik) qancha bo\'lishi kerak?' },
        { label: '🌡️ Harorat chegarasi', msg: 'Rels harorati necha darajada tezlik cheklovi beriladi?' },
        { label: '🛤️ Rels yeyilishi', msg: 'Asosiy yo\'llarda rels yon yeyilishi qancha mm dan oshsa almashtirish talab etiladi?' },
        { label: '🔩 Shpal soni', msg: '1 km yo\'lda qancha shpal bo\'lishi kerak?' },
        { label: '📋 PU-29 tartibi', msg: 'PU-29 formasi bo\'yicha strelkani ko\'rikdan o\'tkazish qancha vaqt oraliqda amalga oshiriladi?' },
        { label: '⚡ Tezlik me\'yori', msg: '120 km/soat tezlikda shablon qancha bo\'lishi kerak?' },
        { label: '🪨 Ballast qalinligi', msg: 'Ballast (sheben) qatlami qancha qalin bo\'lishi kerak?' },
    ];

    function buildHTML() {
        return `
        <button id="sa-fab" title="PCH-GPT: Texnik Bilim Markazi">
            <i class="fas fa-book-open-reader"></i>
            <span id="sa-badge">!</span>
        </button>

        <div id="sa-panel">
            <div id="sa-header">
                <div id="sa-avatar">
                    <i class="fas fa-brain" style="color:#fff; font-size:1.1rem;"></i>
                </div>
                <div id="sa-header-info">
                    <h4>PCH-GPT <span style="font-size:0.65rem; color:#d4af37; font-weight:700; background:rgba(212,175,55,0.1); padding:2px 8px; border-radius:6px; border:1px solid rgba(212,175,55,0.3);">TEXNIK BILIM MARKAZI</span></h4>
                    <div id="sa-status">
                        <div id="sa-status-dot"></div>
                        <span id="sa-status-text">Faol | Gemini AI · PTE me'yorlari</span>
                    </div>
                </div>
                <button id="sa-close-btn" title="Yopish">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="sa-chips">
                ${QUICK_CHIPS.map(c => `<div class="sa-chip" data-msg="${c.msg}">${c.label}</div>`).join('')}
            </div>

            <div id="sa-messages"></div>

            <div id="sa-typing">
                <div class="sa-dot"></div>
                <div class="sa-dot"></div>
                <div class="sa-dot"></div>
                <span id="sa-typing-label">Smart AI yozmoqda...</span>
            </div>

            <div id="sa-footer">
                <textarea id="sa-input" placeholder="Savol yozing... (Enter = yuborish)" rows="1"></textarea>
                <button id="sa-mic-btn" title="Ovozli kiritish">
                    <i class="fas fa-microphone"></i>
                </button>
                <button id="sa-send-btn" title="Yuborish">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div id="sa-powered">Powered by <span>Gemini AI ✦ Smart PCH</span></div>
        </div>
        `;
    }

    // ── DOM yaratish ──────────────────────────────────────────────
    function init() {
        // Inject style
        const styleEl = document.createElement('style');
        styleEl.id = 'sa-style';
        styleEl.textContent = STYLE;
        document.head.appendChild(styleEl);

        // Inject HTML
        const wrap = document.createElement('div');
        wrap.id = 'sa-root';
        wrap.innerHTML = buildHTML();
        document.body.appendChild(wrap);

        // Elements
        const fab = document.getElementById('sa-fab');
        const panel = document.getElementById('sa-panel');
        const closeBtn = document.getElementById('sa-close-btn');
        const input = document.getElementById('sa-input');
        const sendBtn = document.getElementById('sa-send-btn');
        const micBtn = document.getElementById('sa-mic-btn');
        const messages = document.getElementById('sa-messages');
        const typing = document.getElementById('sa-typing');
        const chips = document.querySelectorAll('.sa-chip');
        const statusText = document.getElementById('sa-status-text');
        const statusDot = document.getElementById('sa-status-dot');

        // ── Voice Assistant (Speech Recognition) ──────────
        let recognition = null;
        let isListening = false;

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'uz-UZ'; // Default: Uzbek

            recognition.onstart = () => {
                isListening = true;
                micBtn.classList.add('sa-mic-active');
                input.placeholder = "Sizni eshityapman...";
                setStatus('Sizni eshityapman...', '#ef4444');
            };

            recognition.onend = () => {
                isListening = false;
                micBtn.classList.remove('sa-mic-active');
                input.placeholder = "Savol yozing... (Enter = yuborish)";
                setStatus('Faol | Gemini AI', '#10b981');
            };

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                input.value = text;
                resizeTextarea();
                sendMessage(); // Auto send after voice input
            };

            recognition.onerror = (event) => {
                console.error('[Voice] Error:', event.error);
                micBtn.classList.remove('sa-mic-active');
                setStatus('Ovozli xatolik', '#ef4444');
                setTimeout(() => setStatus('Faol | Gemini AI', '#10b981'), 2000);
            };
        }

        micBtn.addEventListener('click', () => {
            if (!recognition) {
                alert("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.");
                return;
            }
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        // ── Voice Output (Text to Speech) ──────────
        function speak(text) {
            if (!window.speechSynthesis) return;

            // Remove markdown for speaking
            const cleanText = text.replace(/\*\*/g, '').replace(/`/g, '').replace(/#+/g, '');
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Try to find a good voice (Uzbek or Russian or Turkish as fallback)
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('tr') || v.lang.includes('uz') || v.lang.includes('ru'));
            if (preferredVoice) utterance.voice = preferredVoice;
            
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }

        // ── Open / Close ────────────────────────────────
        function openPanel() {
            isOpen = true;
            panel.classList.add('open');
            fab.classList.add('open');
            fab.querySelector('i').className = 'fas fa-times';
            document.getElementById('sa-badge').style.display = 'none';
            if (messageHistory.length === 0) addWelcome();
            setTimeout(() => input.focus(), 400);
        }

        function closePanel() {
            isOpen = false;
            panel.classList.remove('open');
            fab.classList.remove('open');
            fab.querySelector('i').className = 'fas fa-robot';
        }

        fab.addEventListener('click', () => isOpen ? closePanel() : openPanel());
        closeBtn.addEventListener('click', closePanel);

        // ── Welcome message ─────────────────────────────
        function addWelcome() {
            addMessage('bot', `Salom! 👋 Men **PCH-GPT** — Temir yo\'l texnik qoidalari va yo\'riqnomalari (PTE) asosida javob beradigan raqamli mutaxassis.\n\nMen quyidagi yo\'nalishlarda **aniq me\'yorlar** bilan javob beraman:\n\n📏 **Rels va koleya me\'yorlari** (PTE asosida)\n🔀 **Strelka va o\'tkazgichlar** (fly-gap, ostryak)\n🛤️ **Rels yeyilishi va almashtirish me\'yorlari**\n🌡️ **Harorat tartibi va razryadka qoidalari**\n📊 **Tizim statistikasi va hisobotlar**\n\nPastdagi tugmachalardan birini tanlang yoki o\'z texnik savolingizni yozing! 📋`);
        }

        // ── Render message ──────────────────────────────
        function addMessage(role, text) {
            const div = document.createElement('div');
            div.className = `sa-msg ${role}`;

            const icon = role === 'bot'
                ? '<i class="fas fa-robot"></i>'
                : '<i class="fas fa-user"></i>';

            div.innerHTML = `
                <div class="sa-msg-icon">${icon}</div>
                <div class="sa-bubble">${formatText(text)}</div>
            `;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            messageHistory.push({ role, text });
        }

        function formatText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        // ── Show / hide typing ──────────────────────────
        function showTyping() {
            typing.classList.add('visible');
            messages.scrollTop = messages.scrollHeight;
        }
        function hideTyping() {
            typing.classList.remove('visible');
        }

        // ── Set status ──────────────────────────────────
        function setStatus(text, color = '#10b981') {
            statusText.textContent = text;
            statusDot.style.background = color;
            statusDot.style.boxShadow = `0 0 6px ${color}`;
        }

        // ── Send message ────────────────────────────────
        async function sendMessage(msgText) {
            const text = (msgText || input.value).trim();
            if (!text || isTyping) return;

            isTyping = true;
            input.value = '';
            resizeTextarea();
            sendBtn.disabled = true;

            addMessage('user', text);
            showTyping();
            setStatus('Bajarilmoqda...', '#f59e0b');

            try {
                const token = localStorage.getItem('jwtToken') || '';

                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'SmartPCH-WebApp',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ message: text })
                });

                const data = await response.json();
                hideTyping();

                if (data && data.response) {
                    addMessage('bot', data.response);
                    setStatus('Faol | PCH-Agent', '#10b981');

                    // ── AGENT ACTION EXECUTOR ──────────────────────
                    if (data.action && data.action !== 'none') {
                        setTimeout(() => executeAction(data.action, data.params || {}), 600);
                    }
                } else {
                    addMessage('bot', 'Kechirasiz, javob olib bo\'lmadi. Server xatosi.');
                    setStatus('Xatolik yuz berdi', '#ef4444');
                    setTimeout(() => setStatus('Faol | PCH-Agent', '#10b981'), 3000);
                }
            } catch (err) {
                hideTyping();
                console.error('[PCH-Agent] Error:', err);
                if (err.message && err.message.includes('Failed to fetch')) {
                    addMessage('bot', '⚠️ Server bilan aloqa yo\'q. Server ishlamaypti yoki internet muammosi.\n\nServer ishlaganida qayta urinib ko\'ring.');
                } else {
                    addMessage('bot', 'Kechirasiz, texnik xatolik yuz berdi: ' + err.message);
                }
                setStatus('Aloqa yo\'q', '#ef4444');
                setTimeout(() => setStatus('Faol | PCH-Agent', '#10b981'), 4000);
            } finally {
                isTyping = false;
                sendBtn.disabled = false;
                input.focus();
            }
        }

        // ── AGENT ACTION EXECUTOR ──────────────────────────────────
        function executeAction(action, params) {
            const actionLabels = {
                navigate_dispatcher: { label: 'Dispetcher bo\'limiga o\'tildi', icon: 'fa-satellite-dish', color: '#3b82f6' },
                navigate_pu29: { label: 'PU-29 moduliga o\'tildi', icon: 'fa-search-location', color: '#10b981' },
                navigate_production: { label: 'Ishlab chiqarish bo\'limiga o\'tildi', icon: 'fa-industry', color: '#f59e0b' },
                navigate_defect: { label: 'Defektoskopiya moduliga o\'tildi', icon: 'fa-microscope', color: '#ef4444' },
                navigate_hr: { label: 'Kadrlar bo\'limiga o\'tildi', icon: 'fa-users', color: '#8b5cf6' },
                open_attendance: { label: 'Davomat oynasi ochildi', icon: 'fa-user-check', color: '#10b981' },
                open_warning: { label: 'Ogohlantirish oynasi ochildi', icon: 'fa-exclamation-triangle', color: '#f59e0b' },
                show_stats: { label: 'Statistika ko\'rsatilmoqda', icon: 'fa-chart-bar', color: '#3b82f6' },
            };

            const info = actionLabels[action];
            if (info) {
                // Show action card in chat
                const actionDiv = document.createElement('div');
                actionDiv.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 14px; background:rgba(${info.color === '#10b981' ? '16,185,129' : info.color === '#3b82f6' ? '59,130,246' : '245,158,11'},0.08); border:1px solid rgba(${info.color === '#10b981' ? '16,185,129' : info.color === '#3b82f6' ? '59,130,246' : '245,158,11'},0.2); border-radius:12px; color:${info.color}; font-size:0.8rem; font-weight:700; animation: sa-msg-in 0.3s ease;`;
                actionDiv.innerHTML = `<i class="fas ${info.icon}"></i> <span>Agent amali: ${info.label}</span> <i class="fas fa-check-circle" style="margin-left:auto;"></i>`;
                messages.appendChild(actionDiv);
                messages.scrollTop = messages.scrollHeight;
            }

            // Execute the action
            switch(action) {
                case 'navigate_dispatcher':
                    setTimeout(() => { if (typeof window.renderDispatcherMain === 'function') window.renderDispatcherMain(); else if (typeof window.showSection === 'function') window.showSection('dispatcher'); }, 1000);
                    break;
                case 'navigate_pu29':
                    setTimeout(() => { if (typeof window.showPU29Main === 'function') window.showPU29Main(); else if (typeof window.showSection === 'function') window.showSection('pu29'); }, 1000);
                    break;
                case 'navigate_production':
                    setTimeout(() => { if (typeof window.showSection === 'function') window.showSection('production'); }, 1000);
                    break;
                case 'navigate_defect':
                    setTimeout(() => { if (typeof window.showSection === 'function') window.showSection('defectoscope'); }, 1000);
                    break;
                case 'navigate_hr':
                    setTimeout(() => { if (typeof window.showSection === 'function') window.showSection('hr'); }, 1000);
                    break;
                case 'open_attendance':
                    setTimeout(() => { if (typeof window.openDispatcherModal === 'function') window.openDispatcherModal('attendance'); }, 1000);
                    break;
                case 'open_warning':
                    setTimeout(() => { if (typeof window.openDispatcherModal === 'function') window.openDispatcherModal('ogoh'); }, 1000);
                    break;
                case 'show_stats':
                    addMessage('bot', '📊 Tizim statistikasi:\n\n• Faol xodimlar: ma\'lumot yuklanmoqda...\n• Nuqsonlar: tekshirilmoqda...\n\n(Batafsil ko\'rish uchun tegishli bo\'limga o\'ting)');
                    break;
            }
        }

        // ── Auto-resize textarea ─────────────────────────
        function resizeTextarea() {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 110) + 'px';
        }

        input.addEventListener('input', resizeTextarea);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        sendBtn.addEventListener('click', () => sendMessage());

        // ── Quick chips ─────────────────────────────────
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const msg = chip.getAttribute('data-msg');
                if (!isOpen) openPanel();
                setTimeout(() => sendMessage(msg), 150);
            });
        });

        // ── Expose globally ──────────────────────────────
        window.SmartAssistant = {
            open: openPanel,
            close: closePanel,
            send: sendMessage,
            toggle: () => isOpen ? closePanel() : openPanel()
        };

        // ── Keyboard shortcut: Ctrl+Shift+A ─────────────
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                isOpen ? closePanel() : openPanel();
            }
        });

        console.log('✅ PCH-GPT (Texnik Bilim Markazi) yuklandi. Ctrl+Shift+A bilan ochish mumkin.');
    }

    // ── DOM tayyor bo'lgach ishga tushirish ───────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Birozdan keyin (boshqa skriptlar yuklanib bo'lsin)
        setTimeout(init, 500);
    }

})();
