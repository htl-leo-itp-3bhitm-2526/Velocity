// ===== TASK ROTATION & CLEANUP SYSTEM =====
// Füge diesen Block NACH der bestehenden loadTasks()-Funktion ein
// und ERSETZE die renderAcceptedTaskSection()-Logik

// In-memory rotation meta (do not persist to localStorage)
let rotationMeta = { selectedTaskIds: [], lastRefresh: null };

function getTaskRotationMeta() {
    return rotationMeta;
}

function saveTaskRotationMeta(meta) {
    rotationMeta = meta;
}

// Gibt heute als YYYY-MM-DD zurück
function getTodayDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Zieht n zufällige eindeutige Einträge aus einem Array-Pool
function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Prüft ob Rotation nötig ist und gibt aktuelle Task-IDs zurück
function getRotatedTaskIds(allTasks) {
    const meta = getTaskRotationMeta();
    const todayKey = getTodayDateKey();
    let changed = false;

    const taskPool = [...(allTasks.weekly || []), ...(allTasks.daily || [])];
    if (taskPool.length === 0) {
        return { selectedTaskIds: [], lastRefresh: todayKey };
    }

    if (meta.lastRefresh !== todayKey || meta.selectedTaskIds.length === 0) {
        meta.selectedTaskIds = pickRandom(taskPool, Math.min(15, taskPool.length)).map(t => t.id);
        meta.lastRefresh = todayKey;
        changed = true;
    }

    if (changed) saveTaskRotationMeta(meta);
    return meta;
}

// Gibt vollständige Task-Objekte für IDs zurück
function getTasksById(pool, ids) {
    return ids.map(id => pool.find(t => t.id === id)).filter(Boolean);
}

function escapeHtmlText(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== ERSETZE renderTasksSection() =====
// Diese Funktion rendert die Tasks-Seite dynamisch (statt statisches HTML)
function renderTasksSection(allTasks) {
    const weeklyContainer = document.getElementById('weekly-tasks-container');
    const otherContainer = document.getElementById('other-tasks-container');
    if (!weeklyContainer || !otherContainer) return;

    const meta = getRotatedTaskIds(allTasks);
    const taskPool = [...(allTasks.weekly || []), ...(allTasks.daily || [])];
    const selectedTasks = getTasksById(taskPool, meta.selectedTaskIds);

    // Verteile die 15 Tasks auf zwei Bereiche
    const weeklyTasks = selectedTasks.slice(0, 8);
    const otherTasks = selectedTasks.slice(8);

    renderTaskList(weeklyContainer, weeklyTasks);
    renderTaskList(otherContainer, otherTasks);
    renderTaskRefreshInfo(selectedTasks.length);

    // Abgeschlossene & akzeptierte Aufgaben sofort ausblenden
    syncAcceptedTasksToUI();
}

function renderTaskRefreshInfo(count) {
    const descEl = document.getElementById('taskRefreshDescription');
    const countdownEl = document.getElementById('taskRefreshCountdown');
    if (descEl) descEl.textContent = `${count} zufällige Aufgaben für heute`;
    if (countdownEl) {
        const remaining = getTimeUntilMidnight();
        countdownEl.textContent = `${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s bis zur Aktualisierung`;
    }
}

function getTimeUntilMidnight() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    let diff = endOfDay - now;
    if (diff < 0) diff = 0;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
}

function updateTaskRefreshCountdown() {
    const countdownEl = document.getElementById('taskRefreshCountdown');
    if (!countdownEl) return;
    const remaining = getTimeUntilMidnight();
    countdownEl.textContent = `${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s bis zur Aktualisierung`;
}

function renderTaskList(container, tasks) {
    container.innerHTML = '';
    if (tasks.length === 0) {
        container.innerHTML = '<p class="today-challenges-empty">Keine Aufgaben verfügbar.</p>';
        return;
    }
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-icon">
                <i class="${task.icon || 'fas fa-leaf'}"></i>
            </div>
            <div class="task-content">
                <h3 class="task-title">${escapeHtmlText(task.task)}</h3>
                <p class="task-description">Erledige diese Aufgabe und helfe der Umwelt!</p>
                <div class="task-footer">
                    <span class="task-points"><i class="fas fa-star"></i> ${task.points || 20} Punkte</span>
                    <span class="task-time"><i class="fas fa-clock"></i> Bis Mitternacht</span>
                </div>
            </div>
            <button class="task-accept-btn"
                data-task="${escapeHtmlText(task.task)}"
                data-icon="${task.icon || 'fas fa-leaf'}">Akzeptieren</button>
        `;
        container.appendChild(card);
    });
}

// ===== PATCH: renderAcceptedTaskSection =====
// Überschreibe die bestehende Funktion so dass abgeschlossene Karten
// KOMPLETT verschwinden statt als grüner Block zu bleiben.
// Use the main app's renderAcceptedTaskSection implementation (no local override)

// ===== PATCH: confirmTaskProof =====
// Nach Bestätigung: Karte sofort ausblenden + Klon entfernen
// Use the main app's confirmTaskProof implementation (no local override)

// ===== INTEGRATION: loadTasks patchen =====
// Hänge renderTasksSection an den vorhandenen loadTasks-Aufruf
document.addEventListener('DOMContentLoaded', () => {
    // Warte bis allTasks geladen ist, dann Rotation anwenden
    const _checkInterval = setInterval(() => {
        if ((allTasks.weekly || []).length > 0 || (allTasks.daily || []).length > 0) {
            clearInterval(_checkInterval);
            renderTasksSection(allTasks);
        }
    }, 100);

    // Fallback nach 3s
    setTimeout(() => {
        clearInterval(_checkInterval);
        if ((allTasks.weekly || []).length > 0 || (allTasks.daily || []).length > 0) renderTasksSection(allTasks);
    }, 3000);

    updateTaskRefreshCountdown();
    setInterval(updateTaskRefreshCountdown, 1000);
});
