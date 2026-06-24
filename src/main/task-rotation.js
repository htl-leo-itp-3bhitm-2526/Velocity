// ===== TASK ROTATION & DISPLAY SYSTEM =====
// Tasks kommen bereits vom Server aus task_definitions rotiert (wöchentlich/täglich)
// Dieses Modul rendert sie nur noch in die UI

var _amp = '&' + 'amp;';
var _lt = '&' + 'lt;';
var _gt = '&' + 'gt;';
var _quot = '&' + 'quot;';
var _apos = '&#' + '39;';
function escapeHtmlText(text) {
    var s = String(text || '');
    s = s.replace(/[&<>"']/g, function(m) {
        if (m === '&') return _amp;
        if (m === '<') return _lt;
        if (m === '>') return _gt;
        if (m === '"') return _quot;
        return _apos;
    });
    return s;
}

// Rendert die Tasks-Seite dynamisch
function renderTasksSection(allTasks) {
    var weeklyContainer = document.getElementById('weekly-tasks-container');
    var otherContainer = document.getElementById('other-tasks-container');
    if (!weeklyContainer || !otherContainer) return;

    // Weekly tasks kommen vom Server rotiert (8 Stück pro Woche)
    var weeklyTasks = allTasks.weekly || [];
    // Daily tasks kommen vom Server rotiert (7 Stück pro Tag)
    var dailyTasks = allTasks.daily || [];

    renderTaskList(weeklyContainer, weeklyTasks);
    renderTaskList(otherContainer, dailyTasks);
    renderTaskRefreshInfo(weeklyTasks.length + dailyTasks.length);

    // Bereits akzeptierte Aufgaben ausblenden
    syncAcceptedTasksToUI();
}

function renderTaskRefreshInfo(count) {
    var descEl = document.getElementById('taskRefreshDescription');
    var countdownEl = document.getElementById('taskRefreshCountdown');
    if (descEl) descEl.textContent = count + ' zufällige Aufgaben für heute';
    if (countdownEl) {
        var remaining = getTimeUntilMidnight();
        countdownEl.textContent = remaining.hours + 'h ' + remaining.minutes + 'm ' + remaining.seconds + 's bis zur Aktualisierung';
    }
}

function getTimeUntilMidnight() {
    var now = new Date();
    var endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    var diff = endOfDay - now;
    if (diff < 0) diff = 0;
    var hours = Math.floor(diff / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours: hours, minutes: minutes, seconds: seconds };
}

function updateTaskRefreshCountdown() {
    var countdownEl = document.getElementById('taskRefreshCountdown');
    if (!countdownEl) return;
    var remaining = getTimeUntilMidnight();
    countdownEl.textContent = remaining.hours + 'h ' + remaining.minutes + 'm ' + remaining.seconds + 's bis zur Aktualisierung';
}

function renderTaskList(container, tasks) {
    container.innerHTML = '';
    if (tasks.length === 0) {
        container.innerHTML = '<p class="today-challenges-empty">Keine Aufgaben verfügbar.</p>';
        return;
    }
    tasks.forEach(function(task) {
        var card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML =
            '<div class="task-icon">' +
                '<i class="' + (task.icon || 'fas fa-leaf') + '"></i>' +
            '</div>' +
            '<div class="task-content">' +
                '<h3 class="task-title">' + escapeHtmlText(task.task) + '</h3>' +
                '<p class="task-description">Erledige diese Aufgabe und helfe der Umwelt!</p>' +
                '<div class="task-footer">' +
                    '<span class="task-points"><i class="fas fa-star"></i> ' + (task.points || 20) + ' Punkte</span>' +
                    '<span class="task-time"><i class="fas fa-clock"></i> Bis Mitternacht</span>' +
                '</div>' +
            '</div>' +
            '<button class="task-accept-btn" data-task="' + escapeHtmlText(task.task) + '" data-icon="' + (task.icon || 'fas fa-leaf') + '">Akzeptieren</button>';
        container.appendChild(card);
    });
}

// ===== INTEGRATION: loadTasks patchen =====
// Hänge renderTasksSection an den vorhandenen loadTasks-Aufruf
document.addEventListener('DOMContentLoaded', function() {
    // Warte bis allTasks geladen ist, dann Rotation anwenden
    var _checkInterval = setInterval(function() {
        if ((allTasks.weekly || []).length > 0 || (allTasks.daily || []).length > 0) {
            clearInterval(_checkInterval);
            renderTasksSection(allTasks);
        }
    }, 100);

    // Fallback nach 3s
    setTimeout(function() {
        clearInterval(_checkInterval);
        if ((allTasks.weekly || []).length > 0 || (allTasks.daily || []).length > 0) renderTasksSection(allTasks);
    }, 3000);

    updateTaskRefreshCountdown();
    setInterval(updateTaskRefreshCountdown, 1000);
});