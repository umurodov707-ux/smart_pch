/**
 * SMART PCH — Bo'limlar kanban doskasi (script.js dan ajratilgan)
 */
let kanbanTasks = {
    todo: [],
    inprogress: [],
    done: []
};

function createTasksSection() {
    const section = document.createElement('section');
    section.id = 'tasks-section';
    section.className = 'content-section';
    section.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <h2><i class="fas fa-tasks"></i> Vazifalar Boshqaruvi</h2>
                <button class="action-btn" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:white;" onclick="initKanban()"><i class="fas fa-sync"></i></button>
            </div>
            <div class="kanban-board">
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>BAJARILISHI KERAK</span>
                        <button onclick="addKanbanTask('todo')" class="action-btn view" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-todo" class="kanban-items" ondrop="kanbanDrop(event, 'todo')" ondragover="kanbanAllowDrop(event)"></div>
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>JARAYONDA</span>
                        <button onclick="addKanbanTask('inprogress')" class="action-btn check" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-inprogress" class="kanban-items" ondrop="kanbanDrop(event, 'inprogress')" ondragover="kanbanAllowDrop(event)"></div>
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>BAJARILDI</span>
                        <button onclick="addKanbanTask('done')" class="action-btn delete" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-done" class="kanban-items" ondrop="kanbanDrop(event, 'done')" ondragover="kanbanAllowDrop(event)"></div>
                </div>
            </div>
        `;
    setTimeout(initKanban, 100);
    return section;
}
window.createTasksSection = createTasksSection;

async function initKanban() {
    try {
        const tasks = await SmartUtils.fetchAPI('/tasks?bolinma_id=' + (window.currentDepartmentId || 'all'));
        kanbanTasks = { todo: [], inprogress: [], done: [] };
        if (tasks && Array.isArray(tasks)) {
            tasks.forEach(t => {
                const s = t.status || 'todo';
                if (kanbanTasks[s]) {
                    kanbanTasks[s].push({ id: t.id, text: t.title });
                }
            });
        }
    } catch (e) {
        console.error("Failed to fetch kanban tasks", e);
    }
    renderKanbanList('todo');
    renderKanbanList('inprogress');
    renderKanbanList('done');
}
window.initKanban = initKanban;

function renderKanbanList(status) {
    const el = document.getElementById(`kanban-${status}`);
    if (!el) return;
    el.innerHTML = '';
    kanbanTasks[status].forEach(task => {
        const div = document.createElement('div');
        div.className = 'kanban-item';
        div.draggable = true;
        div.id = `task-${task.id}`;
        div.innerHTML = `
                <div>${escapeHtml(task.text)}</div>
                <div style="margin-top:0.5rem; display:flex; justify-content:flex-end;">
                    <i class="fas fa-trash" style="color:#e74c3c; cursor:pointer; font-size:0.8rem;" onclick="deleteKanbanTask(${task.id}, '${status}')"></i>
                </div>
            `;
        div.ondragstart = (event) => kanbanDrag(event, task.id, status);
        el.appendChild(div);
    });
}

function kanbanAllowDrop(ev) { ev.preventDefault(); }
window.kanbanAllowDrop = kanbanAllowDrop;

function kanbanDrag(ev, id, status) {
    ev.dataTransfer.setData("text", JSON.stringify({ id: id, origin: status }));
}

async function kanbanDrop(ev, targetStatus) {
    ev.preventDefault();
    try {
        const data = JSON.parse(ev.dataTransfer.getData("text"));
        if (data.origin !== targetStatus) {
            await SmartUtils.fetchAPI('/tasks/' + data.id + '/status', {
                method: 'PUT',
                body: JSON.stringify({ status: targetStatus })
            });
            initKanban();
            if (typeof showNotification === 'function') showNotification("Vazifa ko'chirildi!", "success");
        }
    } catch (e) {
        console.error("Drop failed", e);
    }
}
window.kanbanDrop = kanbanDrop;

async function addKanbanTask(status) {
    const text = prompt("Vazifa matnini kiriting:");
    if (text) {
        try {
            await SmartUtils.fetchAPI('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    bolinma_id: window.currentDepartmentId || 'all',
                    title: text,
                    status: status
                })
            });
            initKanban();
            if (typeof showNotification === 'function') showNotification("Vazifa qo'shildi", "success");
        } catch (e) {
            console.error("Add task failed", e);
        }
    }
}
window.addKanbanTask = addKanbanTask;

async function deleteKanbanTask(id, status) {
    if (confirm("Vazifani o'chirmoqchimisiz?")) {
        try {
            await SmartUtils.fetchAPI('/tasks/' + id, { method: 'DELETE' });
            initKanban();
        } catch (e) {
            console.error("Delete task failed", e);
        }
    }
}
window.deleteKanbanTask = deleteKanbanTask;
