// ===== TASK ROTATION & CLEANUP SYSTEM =====
// Füge diesen Block NACH der bestehenden loadTasks()-Funktion ein
// und ERSETZE die renderAcceptedTaskSection()-Logik

const TASK_ROTATION_KEY = 'ecoTaskRotation';

// Hole aktuelle Rotations-Metadaten
function getTaskRotationMeta() {
    return JSON.parse(localStorage.getItem(TASK_ROTATION_KEY)) || {
        weeklyTaskIds: [],
        dailyOtherTaskIds: [],
        lastWeeklyReset: null,   // ISO-String des letzten Montags
        lastDailyReset: null     // ISO-String des heutigen Tages
    };
}

function saveTaskRotationMeta(meta) {
    localStorage.setItem(TASK_ROTATION_KEY, JSON.stringify(meta));
}

// Gibt den Montag der aktuellen Woche als YYYY-MM-DD zurück
function getCurrentMondayKey() {
    const now = new Date();
    const day = now.getDay(); // 0=So, 1=Mo, ...
    const diff = (day === 0 ? -6 : 1 - day); // Rückwärts zum Montag
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().slice(0, 10);
}

// Gibt heute als YYYY-MM-DD zurück
function getTodayDateKey() {
    return new Date().toISOString().slice(0, 10);
}

// Zieht n zufällige eindeutige Indizes aus einem Array-Pool
function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Prüft ob Rotation nötig ist und gibt aktuelle Task-IDs zurück
function getRotatedTaskIds(allTasks) {
    const meta = getTaskRotationMeta();
    const todayKey = getTodayDateKey();
    const mondayKey = getCurrentMondayKey();
    let changed = false;

    // Wochenaufgaben: Reset jeden Montag
    if (meta.lastWeeklyReset !== mondayKey || meta.weeklyTaskIds.length === 0) {
        const weeklyPool = allTasks.weekly || [];
        meta.weeklyTaskIds = pickRandom(weeklyPool, Math.min(3, weeklyPool.length)).map(t => t.id);
        meta.lastWeeklyReset = mondayKey;
        changed = true;
    }

    // "Weitere Aufgaben": Reset täglich
    if (meta.lastDailyReset !== todayKey || meta.dailyOtherTaskIds.length === 0) {
        // Nutze weekly-Pool auch für "weitere", aber pick andere Aufgaben
        const weeklyPool = allTasks.weekly || [];
        const alreadyShown = new Set(meta.weeklyTaskIds);
        const remaining = weeklyPool.filter(t => !alreadyShown.has(t.id));
        meta.dailyOtherTaskIds = pickRandom(remaining, Math.min(5, remaining.length)).map(t => t.id);
        meta.lastDailyReset = todayKey;
        changed = true;
    }

    if (changed) saveTaskRotationMeta(meta);
    return meta;
}

// Gibt vollständige Task-Objekte für IDs zurück
function getTasksById(pool, ids) {
    return ids.map(id => pool.find(t => t.id === id)).filter(Boolean);
}

// ===== ERSETZE renderTasksSection() =====
// Diese Funktion rendert die Tasks-Seite dynamisch (statt statisches HTML)
function renderTasksSection(allTasks) {
    const weeklyContainer = document.getElementById('weekly-tasks-container');
    const otherContainer = document.getElementById('other-tasks-container');
    if (!weeklyContainer || !otherContainer) return;

    const meta = getRotatedTaskIds(allTasks);
    const weeklyPool = allTasks.weekly || [];

    const weeklyTasks = getTasksById(weeklyPool, meta.weeklyTaskIds);
    const otherTasks = getTasksById(weeklyPool, meta.dailyOtherTaskIds);

    renderTaskList(weeklyContainer, weeklyTasks);
    renderTaskList(otherContainer, otherTasks);

    // Abgeschlossene & akzeptierte Aufgaben sofort ausblenden
    syncAcceptedTasksToUI();
}

function renderTaskList(container, tasks) {
    container.innerHTML = '';
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
                    <span class="task-points"><i class="fas fa-star"></i> 50 Punkte</span>
                    <span class="task-time"><i class="fas fa-clock"></i> Diese Woche</span>
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
(function patchRenderAcceptedTaskSection() {
    const _original = window.renderAcceptedTaskSection;
    window.renderAcceptedTaskSection = function () {
        const taskSection = document.getElementById('tasks');
        if (!taskSection) return;

        // Alte Klone entfernen
        taskSection.querySelectorAll('.accepted-task-clone').forEach(el => el.remove());

        acceptedTasks.forEach(task => {
            // Abgeschlossene Aufgaben NICHT als Klon einblenden – einfach weglassen
            if (task.isCompleted) {
                removeTaskFromTaskSection(task.task);
                return;
            }

            const normalizedName = normalizeTaskName(task.task);
            const taskCards = document.querySelectorAll('#tasks .task-card:not(.accepted-task-clone)');

            taskCards.forEach(card => {
                const titleText = card.querySelector('.task-title')?.textContent || '';
                const buttonTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';

                if (normalizeTaskName(titleText) !== normalizedName &&
                    normalizeTaskName(buttonTask) !== normalizedName) return;

                const clone = document.createElement('div');
                clone.className = 'task-card task-card-accepted accepted-task-clone';
                clone.setAttribute('data-task-key', getAcceptedTaskKey(task));
                clone.innerHTML = buildAcceptedTaskCard(task);
                card.insertAdjacentElement('afterend', clone);
                card.style.display = 'none';
            });
        });
    };
})();

// ===== PATCH: confirmTaskProof =====
// Nach Bestätigung: Karte sofort ausblenden + Klon entfernen
(function patchConfirmTaskProof() {
    const _original = window.confirmTaskProof;
    window.confirmTaskProof = function (challengeKey) {
        const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
        if (taskIndex === -1) return;

        const task = acceptedTasks[taskIndex];
        if (!task.proofFileDatas || task.proofFileDatas.length === 0 || task.isCompleted) return;

        task.isCompleted = true;
        task.status = 'completed';
        task.completedAt = new Date().toISOString();

        // Punkte vergeben
        let points = task.points || 0;
        if (!points) {
            const foundTask = (allTasks.weekly || []).concat(allTasks.daily || [])
                .find(t => normalizeTaskName(t.task) === normalizeTaskName(task.task));
            if (foundTask) points = extractPointsFromTask(foundTask);
        }
        if (points > 0) addPoints(points, task.task);
        if (task.isDaily) incrementStreak();

        saveAcceptedTasks();

        // Klon sofort aus DOM entfernen
        const clone = document.querySelector(`.accepted-task-clone[data-task-key="${CSS.escape(challengeKey)}"]`);
        if (clone) {
            clone.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            clone.style.opacity = '0';
            clone.style.transform = 'scale(0.95)';
            setTimeout(() => clone.remove(), 360);
        }

        renderTodayChallenges();
        renderDailyChallengeCard();
    };
})();

// ===== INTEGRATION: loadTasks patchen =====
// Hänge renderTasksSection an den vorhandenen loadTasks-Aufruf
document.addEventListener('DOMContentLoaded', () => {
    // Warte bis allTasks geladen ist, dann Rotation anwenden
    const _checkInterval = setInterval(() => {
        if ((allTasks.weekly || []).length > 0) {
            clearInterval(_checkInterval);
            renderTasksSection(allTasks);
        }
    }, 100);

    // Fallback nach 3s
    setTimeout(() => {
        clearInterval(_checkInterval);
        if ((allTasks.weekly || []).length > 0) renderTasksSection(allTasks);
    }, 3000);
});
