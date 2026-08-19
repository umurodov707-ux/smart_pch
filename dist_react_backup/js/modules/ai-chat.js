/**
 * SMART PCH — AI Chat yordamchi (script.js dan ajratilgan)
 */
let globalSmartRecognition = null;

window.startSmartAssistantVoice = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        SmartUtils.showToast("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.", "error");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!globalSmartRecognition) {
        globalSmartRecognition = new SpeechRecognition();
        globalSmartRecognition.lang = 'uz-UZ';
        globalSmartRecognition.interimResults = false;

        globalSmartRecognition.onstart = function () {
            const btn = document.getElementById('smart-mic-btn');
            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        };

        globalSmartRecognition.onresult = function (event) {
            const text = event.results[0][0].transcript;
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = text;
                sendChat();
            }
        };

        globalSmartRecognition.onerror = function (event) {
            SmartUtils.showToast("Ovozni aniqlashda xatolik: " + event.error, "error");
            const btn = document.getElementById('smart-mic-btn');
            if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        globalSmartRecognition.onend = function () {
            const btn = document.getElementById('smart-mic-btn');
            if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }

    try {
        globalSmartRecognition.start();
    } catch (e) {
        globalSmartRecognition.stop();
        setTimeout(() => globalSmartRecognition.start(), 200);
    }
};

function toggleChat() {
    document.getElementById('chat-window')?.classList.toggle('active');
}
window.toggleChat = toggleChat;

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text) return;

    addChatMsg(text, 'user');
    input.value = '';

    const msgs = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.innerHTML = '<i class="fas fa-ellipsis-h fa-beat"></i>';
    typing.id = 'typing-indicator';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    const low = text.toLowerCase();

    if (low.includes('strelka') || low.includes('shablon') || low.includes('ustriq') || low.includes('o\'lchov') || low.includes('pu-29') || low.includes('pu 29')) {
        setTimeout(() => {
            typing.remove();
            addChatMsg("O'lchov ma'lumotlari aniqlandi! Tahlil qilib PU-29 jurnaliga yo'naltirmoqdaman...", 'bot');
            if (typeof window.openPU29Window === 'function') {
                window.openPU29Window('ishlab-chiqarish');
                setTimeout(() => {
                    if (typeof window.createNewPU29Record === 'function') {
                        window.createNewPU29Record();
                        setTimeout(() => {
                            if (typeof window.parseVoiceToForm === 'function') {
                                window.parseVoiceToForm(low);
                                const logEl = document.getElementById('pu29-voice-log');
                                if (logEl) {
                                    logEl.innerHTML = `<b style="color:#f1c40f;">Smart Assistant:</b><br/>"${text}"<br/><br/><span style="color:#2ecc71;"><i class="fas fa-check"></i> AI tahlil qildi. 'Saqlash' tugmasini bosing!</span>`;
                                }
                            }
                        }, 500);
                    }
                }, 300);
            }
        }, 1000);
        return;
    }

    if (low.includes('nuqson') || low.includes('kamchilik') || low.includes('piyoda') || low.includes('defektoskop') || low.includes('pu-28') || low.includes('pu 28') || low.includes('zveno')) {
        setTimeout(() => {
            typing.remove();
            addChatMsg("Yo'lda aniqlangan kamchilik qayd etildi! PU-28 jurnaliga yo'naltirmoqdaman...", 'bot');
            if (typeof window.openPU28Window === 'function') {
                window.openPU28Window('ishlab-chiqarish');
                setTimeout(() => {
                    if (typeof window.createNewPU28RecordVoice === 'function') {
                        window.createNewPU28RecordVoice();
                        setTimeout(() => {
                            if (typeof window.parsePU28VoiceToForm === 'function') {
                                window.parsePU28VoiceToForm(low);
                                const logEl = document.getElementById('pu28-voice-log');
                                if (logEl) {
                                    logEl.innerHTML = `<b style="color:#f1c40f;">Smart Assistant:</b><br/>"${text}"<br/><br/><span style="color:#2ecc71;"><i class="fas fa-check"></i> AI tahlil qildi. 'Saqlash' tugmasini bosing!</span>`;
                                }
                            }
                        }, 500);
                    }
                }, 300);
            }
        }, 1000);
        return;
    }

    SmartUtils.fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
    }).then(data => {
        typing.remove();
        if (data?.response) {
            addChatMsg(data.response, 'bot');
        } else {
            addChatMsg("Kechirasiz, aqlli yordamchi hozirda javob bera olmayapti.", 'bot');
        }
    }).catch(err => {
        typing.remove();
        addChatMsg("Server bilan bog'lanishda xatolik yuz berdi.", 'bot');
        console.error('Chat Error:', err);
    });
}
window.sendChat = sendChat;

function addChatMsg(text, type) {
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
    div.innerHTML = formattedText;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}
window.addChatMsg = addChatMsg;
