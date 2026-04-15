let closeBtn = document.getElementById('closeBtn')
let sidebar = document.getElementById('sidebar')
let overlay = document.getElementById('overlay')
let navLinks = document.querySelectorAll('.nav-link')
let bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
let sections = document.querySelectorAll('.full-screen')

let toggleMenu = (isOpen) => {
  sidebar.classList.toggle('active', isOpen)
  overlay.classList.toggle('active', isOpen)
  document.body.style.overflow = isOpen ? 'hidden' : 'auto'
}

let navigateTo = (id) => {
  navLinks.forEach(el => el.classList.toggle('active', el.getAttribute('href') === `#${id}`))
  bottomNavLinks.forEach(el => el.classList.toggle('active', el.dataset.section === id))
  sections.forEach(s => s.classList.toggle('active', s.id === id))
  
  toggleMenu(false)
}


closeBtn.onclick = () => toggleMenu(false)
overlay.onclick = () => toggleMenu(false)

navLinks.forEach(link => {
  link.onclick = (e) => {
    e.preventDefault()
    navigateTo(link.getAttribute('href').slice(1))
  }
})

bottomNavLinks.forEach(link => {
  link.onclick = (e) => {
    e.preventDefault()
    navigateTo(link.dataset.section)
    updateActPage(link.dataset.section)
  }
})

document.onkeydown = (e) => {
  if (e.key === 'Escape') toggleMenu(false)
}

const streakFlameContainer = document.getElementById('streakFlameContainer')
const streakFlameImg = document.getElementById('streakFlameImg')
const streakCountEl = document.getElementById('streakCount')

function getFlameStage(count) {
  if (count >= 100) return 'amethyst'
  if (count >= 50) return 'diamond'
  if (count >= 20) return 'emerald'
  return 'normal'
}

function updateStreakFlameStage(count) {
  if (!streakFlameContainer || !streakFlameImg) return

  const stage = getFlameStage(count)
  streakFlameContainer.classList.remove('normal', 'emerald', 'diamond', 'amethyst')
  streakFlameContainer.classList.add(stage)
  streakFlameImg.src = `./img/${stage}.png`
  streakFlameImg.alt = `${stage} flame`
}

// Initialisiere Home-Section als aktiv beim Load
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('home')
  const initialCount = parseInt(streakCountEl?.textContent || '0', 10)
  updateStreakFlameStage(initialCount)
})

// Home js
let homeSection = document.getElementById('home')
let tasksSection = document.getElementById('tasks')
let friendsSection = document.getElementById('friends')
let profileSection = document.getElementById('profile')

function updateActPage(page){ 
  switch(page){
    case 'home':
      friendsSection.style.display = 'none'; 
      profileSection.style.display = 'none';     
      tasksSection.style.display = 'none';
      homeSection.style.display = 'flex';
      break;
      
      case 'tasks':
       homeSection.style.display = 'none';
       friendsSection.style.display = 'none';
       profileSection.style.display = 'none';
       tasksSection.style.display = 'block';
      break;
      case 'friends':
       homeSection.style.display = 'none';
      profileSection.style.display = 'none';
      tasksSection.style.display = 'none';
      friendsSection.style.display = 'block';
      break;
      case 'profile':
       homeSection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        profileSection.style.display='block';
      break;

      case 'profile':
    homeSection.style.display = 'none';
    friendsSection.style.display = 'none';
    tasksSection.style.display = 'none';
    profileSection.style.display = 'block';

    const user = JSON.parse(localStorage.getItem('ecoUser'));
    if (user) renderProfile(user);
    break;
  }
 
}

const friendsData = [
    { name: "Samuel", online: true, streak: 18, vibe: "Plastikfrei-Profi", points: 940 },
    { name: "Lea", online: true, streak: 14, vibe: "Bike Hero", points: 810 },
    { name: "Noah", online: false, streak: 9, vibe: "Cleanup King", points: 620 },
    { name: "Mia", online: true, streak: 21, vibe: "Tree Planter", points: 1180 }
]

const container = document.getElementById('friends-list-container');
const actionInfo = document.getElementById('friends-action-info');
const quickChatButton = document.getElementById('quick-chat-btn');
const appUsers = [
    'Lena#308',
    'Tom#114',
    'Kira#889',
    'David#221',
    'Amir#664',
    'Nora#450',
    'Mila#740',
    'Ben#932'
];
let lastQuickChatMatch = '';
let displayedFriends = [...friendsData];

const bestStreak = Math.max(...friendsData.map(friend => friend.streak));
const streakLabel = document.getElementById('dynamic-streak');
if (streakLabel) {
    streakLabel.textContent = `DEINE STREAK: ${bestStreak} TAGE`;
}

function renderFriends(list) {
    if (!container) return;

    container.innerHTML = '';
    list.forEach(friend => {
        const initials = friend.name.slice(0, 2).toUpperCase();
        const html = `
            <div class="friend-row ${friend.online ? 'is-online' : ''}" onclick="openChat('${friend.name}')">
                <div class="friend-avatar">${initials}</div>
                <div class="friend-meta">
                    <span class="friend-name">${friend.name}</span>
                    <span class="friend-vibe">${friend.vibe}</span>
                </div>
                <div class="friend-stats">
                    <span class="friend-points">${friend.points} pts</span>
                    <span class="friend-streak"><i class="fas fa-fire"></i> ${friend.streak}</span>
                </div>
                <div class="online-indicator"></div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function updateActionInfo(text) {
    if (actionInfo) actionInfo.textContent = text;
}

function getRandomAppUser() {
    const candidates = appUsers.filter(user => user !== lastQuickChatMatch);
    const pool = candidates.length > 0 ? candidates : appUsers;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}

if (quickChatButton) {
    quickChatButton.addEventListener('click', () => {
        const randomUser = getRandomAppUser();
        lastQuickChatMatch = randomUser;

        quickChatButton.classList.add('active');
        updateActionInfo(`Schnellchat: Verbunden mit ${randomUser}.`);
        openChat(randomUser);
    });
}

renderFriends(displayedFriends);

// ===== CHAT FUNKTIONALITÄT (LOKAL) =====
let currentUsername = localStorage.getItem('chatUsername') || 'User' + Math.floor(Math.random() * 1000);
localStorage.setItem('chatUsername', currentUsername);
let currentChatFriend = null;
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || {};


function openChat(friendName) {
    currentChatFriend = friendName;
    document.getElementById('chat-friend-name').textContent = friendName;
    document.getElementById('chat-modal').style.display = 'flex';
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('chat-message-input').focus();

  
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || {};
    if (savedMessages[friendName]) {
        savedMessages[friendName].forEach(msg => {
            addMessageToChat(msg.text, msg.own, msg.user);
        });
    }
}

function closeChatModal() {
    document.getElementById('chat-modal').style.display = 'none';
    currentChatFriend = null;
}

function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();

    if (!message || !currentChatFriend) return;

    if (!chatMessages[currentChatFriend]) {
        chatMessages[currentChatFriend] = [];
    }

    chatMessages[currentChatFriend].push({
        text: message,
        own: true,
        user: currentUsername,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));

    addMessageToChat(message, true, currentUsername);

    input.value = '';
    input.focus();
}

function addMessageToChat(text, isOwn, username = '') {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${isOwn ? 'own' : ''}`;

    messageEl.innerHTML = `
        <div class="chat-bubble">${escapeHtml(text)}</div>
    `;

    messagesContainer.appendChild(messageEl);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && document.getElementById('chat-modal').style.display !== 'none') {
        e.preventDefault();
        sendChatMessage();
    }
});
// ===== ENDE CHAT FUNKTIONALITÄT =====

// ===== STREAK COUNTER MANAGEMENT =====
let streakData = JSON.parse(localStorage.getItem('streakData')) || {
    count: 0,
    lastUpdated: null,
    lastUpdateDate: null,
    completedToday: false
};

function getToday() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isSameDay(date1Str, date2Str) {
    return date1Str === date2Str;
}

function isPreviousDay(date1Str, date2Str) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = date2 - date1;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 1 && diffDays < 2;
}

function initializeStreakCounter() {
    const today = getToday();
    
    // Erste Initialisierung oder verfallener Streak
    if (!streakData.lastUpdateDate) {
        streakData.count = 0;
        streakData.lastUpdateDate = today;
        streakData.completedToday = false;
        saveStreakData();
        return;
    }

    // Prüfe ob Streak verfallen ist (länger als 24h nicht aktualisiert)
    if (!isSameDay(streakData.lastUpdateDate, today) && !isPreviousDay(streakData.lastUpdateDate, today)) {
        // Mehr als 24h vergangen - Streak reset
        streakData.count = 0;
        streakData.lastUpdateDate = today;
        streakData.completedToday = false;
        saveStreakData();
        return;
    }

    // Neuer Tag - reset completedToday flag
    if (!isSameDay(streakData.lastUpdateDate, today)) {
        streakData.completedToday = false;
        saveStreakData();
    }
}

function saveStreakData() {
    localStorage.setItem('streakData', JSON.stringify(streakData));
}

function incrementStreak() {
    const today = getToday();
    
    // Prüfe ob bereits heute erhöht wurde
    if (streakData.completedToday && isSameDay(streakData.lastUpdateDate, today)) {
        return false; // Keine Erhöhung, da bereits heute schon erhöht
    }

    // Erhöhe Counter
    streakData.count += 1;
    streakData.lastUpdated = new Date().toISOString();
    streakData.lastUpdateDate = today;
    streakData.completedToday = true;
    
    saveStreakData();
    displayStreak();
    
    return true; // Counter wurde erhöht
}

function displayStreak() {
    const streakCountElement = document.getElementById('streakCount');
    if (streakCountElement && streakData.count !== parseInt(streakCountElement.textContent, 10)) {
        streakCountElement.textContent = streakData.count;
        updateStreakFlameStage(streakData.count);
    }
}

// ===== ENDE STREAK COUNTER MANAGEMENT =====

// Task management
let allTasks = { weekly: [], daily: [] };
let currentTask = null;
let acceptedTasks = JSON.parse(localStorage.getItem('acceptedTasks')) || [];
let taskCard = null;
let swipeStartX = 0;
let swipeCurrentX = 0;
let isDraggingTaskCard = false;
const SWIPE_THRESHOLD = 100;
const SWIPE_MAX_ROTATION = 12;
let decisionFeedbackTimeout = null;

// Load tasks from JSON
async function loadTasks() {
    try {
        const response = await fetch('../../assets/tasks.json');
        allTasks = await response.json();
        loadRandomTask();
    } catch (error) {
        console.error('Fehler beim Laden der Tasks:', error);
    }
}

// Get random task
function getRandomTask() {
    const weeklyTasks = allTasks.weekly || [];
    if (weeklyTasks.length === 0) return null;

    if (!currentTask || weeklyTasks.length === 1) {
        const randomIndex = Math.floor(Math.random() * weeklyTasks.length);
        return weeklyTasks[randomIndex];
    }

    let nextTask = currentTask;
    let safetyCounter = 0;

    while (nextTask?.task === currentTask?.task && safetyCounter < 10) {
        const randomIndex = Math.floor(Math.random() * weeklyTasks.length);
        nextTask = weeklyTasks[randomIndex];
        safetyCounter += 1;
    }

    return nextTask;
}

// Load and display random task
function loadRandomTask() {
    currentTask = getRandomTask();
    if (currentTask) {
        displayTask(currentTask);
    }
}

// Display task in home section
function displayTask(task) {
    const homeContent = document.querySelector('.home-content h1');
    const taskText = document.querySelector('.home-content p');
    const taskImage = document.getElementById('template_img');
    
    if (homeContent) {
        homeContent.textContent = 'Deine neue Aufgabe!';
    }
    if (taskText) {
        taskText.textContent = task.task.toUpperCase();
    }
    if (taskImage) {
        taskImage.alt = task.task;
    }
}

function showTaskDecisionFeedback(type) {
    if (!taskCard) return;

    let feedback = document.getElementById('taskDecisionFeedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'taskDecisionFeedback';
        feedback.className = 'task-decision-feedback';
        taskCard.appendChild(feedback);
    }

    let flash = document.getElementById('taskDecisionFlash');
    if (!flash) {
        flash = document.createElement('div');
        flash.id = 'taskDecisionFlash';
        flash.className = 'task-decision-flash';
        taskCard.appendChild(flash);
    }

    const isAccept = type === 'accept';
    feedback.innerHTML = isAccept
        ? '<i class="fas fa-check-circle"></i> GEMACHT'
        : '<i class="fas fa-times-circle"></i> NICHT GEMACHT';

    feedback.classList.remove('accept', 'deny', 'show');
    flash.classList.remove('accept', 'deny', 'show');
    taskCard.classList.remove('decision-accept', 'decision-deny');

    void feedback.offsetWidth;
    void flash.offsetWidth;

    feedback.classList.add(isAccept ? 'accept' : 'deny', 'show');
    flash.classList.add(isAccept ? 'accept' : 'deny', 'show');
    taskCard.classList.add(isAccept ? 'decision-accept' : 'decision-deny');

    clearTimeout(decisionFeedbackTimeout);
    decisionFeedbackTimeout = setTimeout(() => {
        feedback.classList.remove('show');
        flash.classList.remove('show');
        taskCard.classList.remove('decision-accept', 'decision-deny');
    }, 900);
}

// Accept task
function acceptTask() {
    if (currentTask) {
        const alreadyAccepted = acceptedTasks.some(task =>
            task.task === currentTask.task && (task.status === 'active' || task.status === 'accepted')
        );

        if (alreadyAccepted) {
            alert('Diese Aufgabe hast du bereits angenommen. Hier kommt eine neue!');
            loadRandomTask();
            return;
        }

        const taskWithDate = {
            ...currentTask,
            acceptedDate: new Date().toISOString(),
            status: 'active'
        };
        
        acceptedTasks.push(taskWithDate);
        localStorage.setItem('acceptedTasks', JSON.stringify(acceptedTasks));

        // Streak Counter erhöhen
        const streakIncremented = incrementStreak();
        if (streakIncremented) {
            // Zeige optional eine Notification wenn Streak erhöht wurde
            console.log('Streak erhöht! Neuer Stand: ' + streakData.count);
        }

        showTaskDecisionFeedback('accept');
        setTimeout(loadRandomTask, 700);
    }
}

// Deny task
function denyTask() {
    showTaskDecisionFeedback('deny');
    setTimeout(loadRandomTask, 700);
}

function getClientXFromEvent(event) {
    if (event.touches && event.touches.length > 0) {
        return event.touches[0].clientX;
    }

    if (event.changedTouches && event.changedTouches.length > 0) {
        return event.changedTouches[0].clientX;
    }

    return event.clientX;
}

function updateSwipeVisuals(distanceX) {
    if (!taskCard) return;

    const rotation = Math.max(-SWIPE_MAX_ROTATION, Math.min(SWIPE_MAX_ROTATION, distanceX / 14));
    const opacity = Math.min(1, Math.abs(distanceX) / SWIPE_THRESHOLD);

    taskCard.style.transform = `translateX(${distanceX}px) rotate(${rotation}deg)`;
    taskCard.classList.toggle('swipe-right', distanceX > 20);
    taskCard.classList.toggle('swipe-left', distanceX < -20);
    taskCard.style.setProperty('--swipe-opacity', opacity.toString());
}

function resetSwipeCard() {
    if (!taskCard) return;

    taskCard.style.transform = '';
    taskCard.style.removeProperty('--swipe-opacity');
    taskCard.classList.remove('swipe-left', 'swipe-right', 'swipe-accept-anim', 'swipe-deny-anim');
}

function finalizeSwipe(distanceX) {
    if (!taskCard) return;

    if (distanceX > SWIPE_THRESHOLD) {
        taskCard.classList.add('swipe-accept-anim');
        setTimeout(() => {
            acceptTask();
            resetSwipeCard();
        }, 160);
        return;
    }

    if (distanceX < -SWIPE_THRESHOLD) {
        taskCard.classList.add('swipe-deny-anim');
        setTimeout(() => {
            denyTask();
            resetSwipeCard();
        }, 160);
        return;
    }

    resetSwipeCard();
}

function handleSwipeStart(event) {
    if (!taskCard || !currentTask) return;

    isDraggingTaskCard = true;
    swipeStartX = getClientXFromEvent(event);
    swipeCurrentX = swipeStartX;
    taskCard.classList.add('is-swiping');
}

function handleSwipeMove(event) {
    if (!isDraggingTaskCard || !taskCard) return;

    swipeCurrentX = getClientXFromEvent(event);
    const distanceX = swipeCurrentX - swipeStartX;

    updateSwipeVisuals(distanceX);
}

function handleSwipeEnd() {
    if (!isDraggingTaskCard || !taskCard) return;

    isDraggingTaskCard = false;
    taskCard.classList.remove('is-swiping');

    const distanceX = swipeCurrentX - swipeStartX;
    finalizeSwipe(distanceX);
}

function setupTaskSwipe() {
    taskCard = document.querySelector('.home-content');
    if (!taskCard) return;

    taskCard.addEventListener('touchstart', handleSwipeStart, { passive: true });
    taskCard.addEventListener('touchmove', handleSwipeMove, { passive: true });
    taskCard.addEventListener('touchend', handleSwipeEnd);
    taskCard.addEventListener('mousedown', handleSwipeStart);
    window.addEventListener('mousemove', handleSwipeMove);
    window.addEventListener('mouseup', handleSwipeEnd);
}

// Event listeners for accept/deny buttons
const acceptBtn = document.getElementById('acceptBtn');
const deniedBtn = document.getElementById('deniedBtn');

if (acceptBtn) {
    acceptBtn.addEventListener('click', acceptTask);
}

if (deniedBtn) {
    deniedBtn.addEventListener('click', denyTask);
}

/* ===== HERO SECTION JAVASCRIPT ===== */


function animateCounter(element, targetValue, duration = 2000) {
    let currentValue = 0;
    const increment = targetValue / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 16);
}


document.addEventListener('DOMContentLoaded', () => {
    // Streak Counter initialisieren
    initializeStreakCounter();
    displayStreak();

    const streakCountElement = document.getElementById('streakCount');
    if (streakCountElement) {
        animateCounter(streakCountElement, streakData.count, 2000);
    }

    
    const globalWasteElement = document.getElementById('globalWaste');
    if (globalWasteElement) {
        const initialValue = 2847;
        animateCounter(globalWasteElement, initialValue, 2500);
    }

    const activeUsersElement = document.getElementById('activeUsers');
    if (activeUsersElement) {
        const initialValue = 1204;
        animateCounter(activeUsersElement, initialValue, 2500);
    }

    const startChallengeBtn = document.getElementById('startChallengeBtn');
    if (startChallengeBtn) {
        startChallengeBtn.addEventListener('click', () => {
            console.log('Challenge gestartet!');
            alert('Challenge "Sammle 0,5kg Müll" wurde gestartet!');
        });
    }

    updateTimer();
    setInterval(updateTimer, 60000);

    observeStatsAnimation();
});

function updateTimer() {
    const timerFill = document.querySelector('.timer-fill');
    const timerTime = document.querySelector('.timer-time');
    
    if (timerFill && timerTime) {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59);
        
        const timeLeft = endOfDay - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const percentageLeft = (timeLeft / (24 * 60 * 60 * 1000)) * 100;
        timerFill.style.width = percentageLeft + '%';
        timerTime.textContent = `${hoursLeft}h ${minutesLeft}m verbleibend`;
    }
}

function observeStatsAnimation() {
    const statsCounter = document.querySelector('.stats-counter');
    
    if (!statsCounter) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsCounter);
}


function simulateLiveUpdates() {
    setInterval(() => {
        const globalWasteElement = document.getElementById('globalWaste');
        const activeUsersElement = document.getElementById('activeUsers');
        
        if (globalWasteElement && activeUsersElement) {
            const currentWaste = parseInt(globalWasteElement.textContent);
            const currentUsers = parseInt(activeUsersElement.textContent);
            
            if (Math.random() > 0.5) {
                globalWasteElement.textContent = currentWaste + Math.floor(Math.random() * 10);
            }
            if (Math.random() > 0.7) {
                activeUsersElement.textContent = currentUsers + Math.floor(Math.random() * 3);
            }
        }
    }, 5000);
}


    deniedBtn.addEventListener('click', denyTask);


// Load tasks on page load
loadTasks();
setupTaskSwipe();

// Handle task accept buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('task-accept-btn')) {
        const taskName = e.target.getAttribute('data-task');
        const taskIcon = e.target.getAttribute('data-icon');
        
        // Create task object
        const task = {
            id: Date.now(),
            task: taskName,
            icon: taskIcon,
            acceptedDate: new Date().toISOString(),
            status: 'accepted'
        };
        
        // Get existing tasks
        let acceptedTasks = JSON.parse(localStorage.getItem('acceptedTasks')) || [];
        
        // Add new task
        acceptedTasks.push(task);
        
        // Save to localStorage
        localStorage.setItem('acceptedTasks', JSON.stringify(acceptedTasks));

        // Streak Counter erhöhen
        const streakIncremented = incrementStreak();
        if (streakIncremented) {
            console.log('Streak erhöht! Neuer Stand: ' + streakData.count);
        }
        
        // Transform the task card to accepted style
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            // Add animation class first
            taskCard.classList.add('task-card-accepted');
            
            // Animate the button first
            e.target.style.opacity = '0.7';
            e.target.style.transform = 'scale(0.95)';
            
            // Then transform after brief delay
            setTimeout(() => {
                taskCard.innerHTML = `
                    <div class="accepted-task-inner">
                        <div class="accepted-task-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 class="accepted-task-title">Aufgabe akzeptiert!</h3>
                        <button class="accepted-task-btn">
                            <i class="fas fa-star"></i> +Streak
                        </button>
                    </div>
                `;
            }, 100);
        }
    }
});

function handleCredentialResponse(response) {
    let data = JSON.parse(atob(response.credential.split('.')[1]))
    
    let userObj = {
        name: data.name,
        email: data.email,
        picture: data.picture,
        isLoggedIn: true
    }

    localStorage.setItem('ecoUser', JSON.stringify(userObj))
    renderProfile(userObj)
}

function renderProfile(user) {
    if (!user) return;

    let nameEl = document.getElementById('user-name')
    let avatarEl = document.getElementById('user-avatar')
    let locationEl = document.getElementById('user-location')
    let loginBtn = document.querySelector('.g_id_signin');

    if (nameEl) nameEl.textContent = user.name
    if (avatarEl) avatarEl.src = user.picture
    if (locationEl) locationEl.textContent = user.email
    if (loginBtn) loginBtn.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('ecoUser')
    if (savedUser) {
        renderProfile(JSON.parse(savedUser))
    }
})

window.onload = () => {
    navigateTo('home');
    updateActPage('home');
};
