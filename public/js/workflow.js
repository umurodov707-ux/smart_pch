/**
 * SMART WORKFLOW - Universal Approval System
 */

const SmartWorkflow = {
    // 1. Initialize or Refresh status for a document
    async getStatus(docType, docId) {
        try {
            return await SmartUtils.fetchAPI(`/workflow/${docType}/${docId}`);
        } catch (e) {
            console.error('Workflow fetch error:', e);
            return { status: 'error' };
        }
    },

    // 2. Submit document to workflow
    async submit(docType, docId, path = ['bolinma', 'xodimlar', 'iqtisod', 'rahbar']) {
        try {
            return await SmartUtils.fetchAPI('/workflow/submit', {
                method: 'POST',
                body: JSON.stringify({ doc_type: docType, doc_id: docId, workflow_path: path })
            });
        } catch (e) {
            console.error('Workflow submit error:', e);
            return null;
        }
    },

    // 3. Approve / Sign current step
    async sign(docType, docId, signature = '', comment = '') {
        try {
            return await SmartUtils.fetchAPI('/workflow/sign', {
                method: 'POST',
                body: JSON.stringify({ doc_type: docType, doc_id: docId, signature, comment })
            });
        } catch (e) {
            console.error('Workflow sign error:', e);
            showToast('Tasdiqlashda xatolik yuz berdi', 'error');
            return null;
        }
    },

    // 3.5. Reject / Return document
    async reject(docType, docId, comment) {
        if (!comment) {
            showToast('Rad etish sababini kiriting', 'warning');
            return null;
        }
        try {
            return await SmartUtils.fetchAPI('/workflow/reject', {
                method: 'POST',
                body: JSON.stringify({ doc_type: docType, doc_id: docId, comment })
            });
        } catch (e) {
            console.error('Workflow reject error:', e);
            showToast('Rad etishda xatolik yuz berdi', 'error');
            return null;
        }
    },

    // 4. Render Timeline UI
    renderTimeline(containerId, workflowData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!workflowData || workflowData.status === 'not_started') {
            container.innerHTML = '<div style="color: #64748b; font-style: italic; padding: 10px;">Workflow hali boshlanmagan.</div>';
            return;
        }

        const path = workflowData.workflow_path || [];
        const history = workflowData.history || [];
        const currentIndex = workflowData.current_step_index;

        let html = '<div class="workflow-timeline">';
        
        path.forEach((role, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const event = history.find(h => h.step === index);
            
            const roleLabels = {
                'bolinma': 'Bo\'linma',
                'xodimlar': 'HR Bo\'limi',
                'iqtisod': 'Iqtisod Bo\'limi',
                'rahbar': 'Rahbar (Viza)',
                'buxgalteriya': 'Buxgalteriya'
            };

            const isRejected = (workflowData.status === 'rejected' && index === currentIndex);

            html += `
                <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isRejected ? 'rejected' : ''}">
                    <div class="step-icon">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : (isRejected ? '<i class="fas fa-times"></i>' : (index + 1))}
                    </div>
                    <div class="step-info">
                        <div class="step-role">${roleLabels[role] || role.toUpperCase()}</div>
                        ${event ? `
                            <div class="step-user">${escapeHtml(event.user_name)}</div>
                            <div class="step-date">${new Date(event.date).toLocaleString()}</div>
                            ${event.signature === 'REJECTED' ? `<div class="step-comment" style="color: #ef4444; font-size: 0.7rem; margin-top: 4px;">Sabab: ${escapeHtml(event.comment || 'Izohsiz')}</div>` : ''}
                        ` : `
                            <div class="step-status" style="${isRejected ? 'color:#ef4444' : ''}">${isRejected ? 'Rad etilgan' : (isCurrent ? 'Kutilmoqda...' : 'Navbat kutilmoqda')}</div>
                        `}
                    </div>
                    ${index < path.length - 1 ? '<div class="step-connector"></div>' : ''}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        this.applyStyles();
    },

    applyStyles() {
        const styleId = 'workflow-ui-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .workflow-timeline {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 20px 0;
                width: 100%;
                overflow-x: auto;
            }
            .timeline-step {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 120px;
                text-align: center;
            }
            .step-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #f1f5f9;
                border: 2px solid #cbd5e1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #64748b;
                z-index: 2;
                margin-bottom: 10px;
                transition: all 0.3s;
            }
            .timeline-step.completed .step-icon {
                background: #10b981;
                border-color: #059669;
                color: white;
            }
            .timeline-step.rejected .step-icon {
                background: #ef4444;
                border-color: #b91c1c;
                color: white;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
                animation: shake 0.5s;
            }
            .timeline-step.active:not(.rejected) .step-icon {
                background: #3b82f6;
                border-color: #2563eb;
                color: white;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                animation: pulse 2s infinite;
            }
            .step-role {
                font-size: 0.85rem;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 4px;
            }
            .step-user {
                font-size: 0.75rem;
                color: #475569;
                font-weight: 500;
            }
            .step-date {
                font-size: 0.65rem;
                color: #94a3b8;
            }
            .step-status {
                font-size: 0.7rem;
                color: #94a3b8;
                font-style: italic;
            }
            .step-connector {
                position: absolute;
                top: 18px;
                left: 50%;
                width: 100%;
                height: 2px;
                background: #e2e8f0;
                z-index: 1;
            }
            .timeline-step.completed .step-connector {
                background: #10b981;
            }
            .timeline-step.rejected .step-connector {
                background: #ef4444;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }
        `;
        document.head.appendChild(style);
    }
};

window.SmartWorkflow = SmartWorkflow;
