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

function normalizeTaskName(taskName) {
    return (taskName || '').trim().toLowerCase();
}

function getAcceptedTaskKey(task) {
    return normalizeTaskName(task.task) + '|' + (task.acceptedDate || '');
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

    renderTaskList(weeklyContainer, weeklyTasks, false);
    renderTaskList(otherContainer, dailyTasks, true);
    renderTaskRefreshInfo(weeklyTasks.length + dailyTasks.length);

    // Zeige bereits akzeptierte Aufgaben als erledigt an
    syncAcceptedTasksToUI();
}

function isTaskAlreadyAccepted(taskName) {
    var nn = normalizeTaskName(taskName);
    if (typeof acceptedTasks === 'undefined' || !acceptedTasks) return false;
    for (var i = 0; i < acceptedTasks.length; i++) {
        var t = acceptedTasks[i];
        if (normalizeTaskName(t.task) === nn && t.status !== 'completed' && t.status !== 'cancelled') return true;
    }
    return false;
}

function syncAcceptedTasksToUI() {
    if (typeof acceptedTasks === 'undefined' || !acceptedTasks) return;
    
    var acceptedKeys = [];
    for (var i = 0; i < acceptedTasks.length; i++) {
        var t = acceptedTasks[i];
        if (t.status !== 'completed' && t.status !== 'cancelled') {
            acceptedKeys.push(normalizeTaskName(t.task));
        }
    }
    
    document.querySelectorAll('#tasks .task-card').forEach(function(card) {
        var title = card.querySelector('.task-title')?.textContent || '';
        var btn = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
        var nn = normalizeTaskName(title || btn);
        
        if (acceptedKeys.indexOf(nn) !== -1) {
            card.style.display = 'none';
        } else {
            card.style.display = '';
        }
    });
        }

function renderTaskList(container, tasks, isDaily) {
    container.style.display = 'block';
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<p class="today-challenges-empty">Keine Aufgaben verfügbar.</p>';
        return;
    }
    container.innerHTML = '';
    tasks.forEach(function(task) {
        var accepted = isTaskAlreadyAccepted(task.task);
        var btnText = accepted ? '<i class="fas fa-check"></i> Akzeptiert' : 'Akzeptieren';
        var btnDisabled = accepted ? 'disabled' : '';
        var btnClass = accepted ? 'task-accept-btn-accepted' : '';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:block;width:100%;';
        var card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('data-task-name', task.task);
        card.innerHTML =
            '<div class="task-icon"><i class="' + (task.icon || 'fas fa-leaf') + '"></i></div>' +
            '<div class="task-content">' +
                '<h3 class="task-title">' + escapeHtmlText(task.task) + '</h3>' +
                '<p class="task-description">Erledige diese Aufgabe und helfe der Umwelt!</p>' +
                '<div class="task-footer">' +
                    '<span class="task-points"><i class="fas fa-star"></i> ' + (task.points || 20) + ' Punkte</span>' +
                    '<span class="task-time"><i class="fas fa-clock"></i> Bis Mitternacht</span>' +
                '</div>' +
            '</div>' +
            '<button class="task-accept-btn ' + btnClass + '" data-task="' + escapeHtmlText(task.task) + '" data-icon="' + (task.icon || 'fas fa-leaf') + '" data-points="' + (task.points || 20) + '" ' + btnDisabled + '>' + btnText + '</button>';
        wrapper.appendChild(card);
        container.appendChild(wrapper);
    });
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

// ===== INTEGRATION: loadTasks patchen =====
document.addEventListener('DOMContentLoaded', function() {
    updateTaskRefreshCountdown();
    setInterval(updateTaskRefreshCountdown, 1000);
    
    // Warte bis loadTasks fertig ist und acceptedTasks mit Updates verfügbar ist
    var maxWait = 0;
    var _checkInterval = setInterval(function() {
        maxWait++;
        if (typeof allTasks !== 'undefined' && ((allTasks.weekly && allTasks.weekly.length > 0) || (allTasks.daily && allTasks.daily.length > 0))) {
            clearInterval(_checkInterval);
            renderTasksSection(allTasks);
        }
        // Max 10 seconds wait
        if (maxWait >= 1000) {
            clearInterval(_checkInterval);
        }
    }, 100);
});