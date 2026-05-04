let closeBtn = document.getElementById('closeBtn')
let sidebar = document.getElementById('sidebar')
let overlay = document.getElementById('overlay')
let navLinks = document.querySelectorAll('.nav-link')
let bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
let sections = document.querySelectorAll('.full-screen')
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxiib5KO8jUV9Ok2mYWkN_UqPe7pjibCAjcO12L8p2AGknv0YhUQshO7sXgBGP4kLn5xg/exec";
let chatRefreshInterval = null;

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

// Dark Mode Management
function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  const darkModeIcon = document.getElementById('darkModeIcon');
  if (darkModeIcon) {
    darkModeIcon.className = enabled ? 'fas fa-sun' : 'fas fa-moon';
  }
  localStorage.setItem('ecoDarkMode', enabled ? '1' : '0');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', enabled ? '#121212' : '#7AB66E');
  }
}

function initializeDarkMode(enabled) {
  setDarkMode(enabled);
}

// Event delegation für Dark Mode Toggle
document.addEventListener('click', (e) => {
  const darkModeBtn = e.target.closest('.dark-mode-toggle');
  if (darkModeBtn) {
    const enabled = !document.body.classList.contains('dark-mode');
    setDarkMode(enabled);
  }
});

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
  const appHeader = document.getElementById('appHeader');
  
  switch(page){
    case 'home':
      friendsSection.style.display = 'none'; 
      profileSection.style.display = 'none';     
      tasksSection.style.display = 'none';
      homeSection.style.display = 'flex';
      appHeader.innerHTML = `
        <div class="header-content">
            <div class="header-left">
                <button class="icon-btn dark-mode-toggle" id="darkModeToggle" title="Dark Mode">
                    <i class="fas fa-moon" id="darkModeIcon"></i>
                </button>
            </div>
            <div class="header-center">
                <img src="../main/img/logo.png" alt="Leaf Logo" class="logo-image">
            </div>
            <div class="header-right">
                <button class="icon-btn notification-btn" title="Benachrichtigungen">
                    <i class="fas fa-bell-slash notification-icon"></i>
                </button>
            </div>
        </div>
        <div class="bottom-bar"></div>
      `;
      break;
      
      case 'tasks':
       homeSection.style.display = 'none';
       friendsSection.style.display = 'none';
       profileSection.style.display = 'none';
       tasksSection.style.display = 'block';
       appHeader.innerHTML = '';
      break;
      case 'friends':
       homeSection.style.display = 'none';
      profileSection.style.display = 'none';
      tasksSection.style.display = 'none';
      friendsSection.style.display = 'block';
      appHeader.innerHTML = '';
      break;
      case 'profile':
       homeSection.style.display = 'none';
        friendsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        profileSection.style.display='block';
        appHeader.innerHTML = '';
      break;
  }
 
}

const googleUsers = [
    { name: "Samuel", email: "samuel@google.com", online: true, streak: 18, vibe: "Plastikfrei-Profi", points: 940 },
    { name: "Lea", email: "lea@google.com", online: true, streak: 14, vibe: "Bike Hero", points: 810 },
    { name: "Noah", email: "noah@google.com", online: false, streak: 9, vibe: "Cleanup King", points: 620 },
    { name: "Mia", email: "mia@google.com", online: true, streak: 21, vibe: "Tree Planter", points: 1180 }
];

const FRIENDS_STORAGE_KEY = 'googleFriends';
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
let displayedFriends = [];

function getSavedGoogleFriends() {
    return JSON.parse(localStorage.getItem(FRIENDS_STORAGE_KEY)) || [];
}

function saveGoogleFriends(friends) {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
}

function getLoggedInUser() {
    const savedUser = localStorage.getItem('ecoUser');
    return savedUser ? JSON.parse(savedUser) : null;
}

function isGoogleLoggedIn() {
    return !!getLoggedInUser();
}

function getAvailableGoogleUsers() {
    const savedFriends = getSavedGoogleFriends();
    return googleUsers.map(user => ({
        ...user,
        isFriend: savedFriends.some(friend => friend.email === user.email)
    }));
}

function addGoogleFriend(email) {
    if (!isGoogleLoggedIn()) {
        updateActionInfo('Bitte melde dich zuerst mit Google an, um Freunde hinzuzufügen.');
        return;
    }

    const savedFriends = getSavedGoogleFriends();
    const user = googleUsers.find(user => user.email === email);
    if (!user) return;

    if (savedFriends.some(friend => friend.email === email)) {
        updateActionInfo(`${user.name} ist bereits Freund.`);
        return;
    }

    savedFriends.push(user);
    saveGoogleFriends(savedFriends);
    updateActionInfo(`${user.name} wurde als Freund hinzugefügt.`);
    loadFriends();
}

function loadFriends() {
    displayedFriends = getAvailableGoogleUsers();
    renderFriends(displayedFriends);
    if (!isGoogleLoggedIn()) {
        updateActionInfo('Melde dich mit Google an, um anderen Google-Nutzern zu schreiben.');
    } else {
        updateActionInfo('Wähle einen Kontakt, um mit einem Google-Nutzer zu chatten.');
    }
}

function getCurrentChatUsername() {
    const user = getLoggedInUser();
    return user ? user.email || user.name : localStorage.getItem('chatUsername');
}

function findGoogleUserByName(name) {
    return getAvailableGoogleUsers().find(user => user.name === name);
}

const bestStreak = Math.max(...googleUsers.map(friend => friend.streak));
const streakLabel = document.getElementById('dynamic-streak');
if (streakLabel) {
    streakLabel.textContent = `DEINE STREAK: ${bestStreak} TAGE`;
}

function renderFriends(list) {
    if (!container) return;

    const loggedIn = isGoogleLoggedIn();
    container.innerHTML = '';
    list.forEach(friend => {
        const initials = friend.name.slice(0, 2).toUpperCase();
        const isFriend = !!friend.isFriend;
        const actionButton = isFriend
            ? '<span class="friend-badge">Freund</span>'
            : `<button class="add-friend-btn" data-friend-email="${friend.email}" ${loggedIn ? '' : 'disabled'}>Freund hinzufügen</button>`;

        const html = `
            <div class="friend-row ${friend.online ? 'is-online' : ''}" data-friend-name="${friend.name}">
                <div class="friend-avatar">${initials}</div>
                <div class="friend-meta">
                    <span class="friend-name">${friend.name}</span>
                    <span class="friend-vibe">${friend.vibe}</span>
                </div>
                <div class="friend-stats">
                    <span class="friend-points">${friend.points} pts</span>
                    <span class="friend-streak"><i class="fas fa-fire"></i> ${friend.streak}</span>
                </div>
                <div class="friend-actions">
                    ${actionButton}
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
        if (!isGoogleLoggedIn()) {
            updateActionInfo('Bitte melde dich mit Google an, um den Schnellchat zu nutzen.');
            return;
        }

        const randomUser = getRandomAppUser();
        lastQuickChatMatch = randomUser;

        quickChatButton.classList.add('active');
        updateActionInfo(`Schnellchat: Verbunden mit ${randomUser}.`);
        openChat(randomUser);
    });
}

loadFriends();

if (container) {
    container.addEventListener('click', (event) => {
        const friendButton = event.target.closest('.add-friend-btn');
        if (friendButton) {
            const email = friendButton.dataset.friendEmail;
            addGoogleFriend(email);
            event.stopPropagation();
            return;
        }

        const row = event.target.closest('.friend-row');
        if (row) {
            const friendName = row.dataset.friendName;
            if (!isGoogleLoggedIn()) {
                updateActionInfo('Bitte melde dich mit Google an, um Nachrichten zu senden.');
                return;
            }
            openChat(friendName);
        }
    });
}

// ===== CHAT FUNKTIONALITÄT (LOKAL) =====
let currentUsername = getCurrentChatUsername() || 'User' + Math.floor(Math.random() * 1000);
localStorage.setItem('chatUsername', currentUsername);
let currentChatFriend = null;
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || {};


async function loadMessagesFromGoogle() {
    const ecoUser = JSON.parse(localStorage.getItem('ecoUser'));
    if (!currentChatFriend || !ecoUser) return;

    const url = `${WEB_APP_URL}?email=${encodeURIComponent(ecoUser.email)}&friend=${encodeURIComponent(currentChatFriend)}`;
    
    try {
        const response = await fetch(url);
        const remoteMessages = await response.json();
        const messagesContainer = document.getElementById('chat-messages');
        
        messagesContainer.innerHTML = ''; 
        remoteMessages.forEach(msg => {
            const isOwn = (msg.sender === ecoUser.email);
            addMessageToChat(msg.text, isOwn);
        });
    } catch (e) {
        console.error(e);
    }
}

function handleCredentialResponse(response) {
    let data = JSON.parse(atob(response.credential.split('.')[1]));
    
    let userObj = {
        name: data.name,
        email: data.email,
        picture: data.picture,
        isLoggedIn: true
    };

    localStorage.setItem('ecoUser', JSON.stringify(userObj));
    // An sheets melden
    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            action: "register", 
            name: data.name,
            email: data.email,
            picture: data.picture
        })
    });

    renderProfile(userObj);
}

function addUserBySearch() {
    const input = document.getElementById('friend-search-input');
    const email = input.value.trim().toLowerCase();
    if (!email) return;

    const savedFriends = getSavedGoogleFriends();
    if (savedFriends.some(f => f.email === email)) return alert("Schon in der Liste!");

    const newFriend = {
        name: email.split('@')[0],
        email: email,
        online: false,
        streak: 0,
        vibe: "Neu hinzugefügt",
        points: 0,
        isFriend: true
    };

    savedFriends.push(newFriend);
    saveGoogleFriends(savedFriends);
    loadFriends();
    input.value = '';
}


function openChat(friendEmail) {
    if (!isGoogleLoggedIn()) return;

    currentChatFriend = friendEmail; // Nutze die Email für die Datenbank-Abfrage
    document.getElementById('chat-friend-name').textContent = friendEmail;
    document.getElementById('chat-modal').style.display = 'flex';
    document.getElementById('chat-messages').innerHTML = 'Lade...';

    loadMessagesFromGoogle();
    if (chatRefreshInterval) clearInterval(chatRefreshInterval);
    chatRefreshInterval = setInterval(loadMessagesFromGoogle, 3000);
}
    

function closeChatModal() {
    document.getElementById('chat-modal').style.display = 'none';
    currentChatFriend = null;
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();
    const ecoUser = JSON.parse(localStorage.getItem('ecoUser'));

    if (!message || !currentChatFriend || !ecoUser) return;

    const msgObj = {
        sender: ecoUser.email,
        receiver: currentChatFriend,
        text: message,
        type: "text"
    };

    addMessageToChat(message, true);
    sendToGoogleSheets(msgObj);

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

function normalizeTaskName(taskName) {
    return (taskName || '').trim().toLowerCase();
}

function escapeHtmlText(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function saveAcceptedTasks() {
    localStorage.setItem('acceptedTasks', JSON.stringify(acceptedTasks));
}

function getAcceptedTaskKey(task) {
    return `${normalizeTaskName(task.task)}|${task.acceptedDate || ''}`;
}

function isTaskAlreadyAccepted(taskName) {
    const normalizedName = normalizeTaskName(taskName);
    return acceptedTasks.some(task => normalizeTaskName(task.task) === normalizedName);
}

function removeTaskFromTaskSection(taskName) {
    const normalizedName = normalizeTaskName(taskName);
    const taskCards = document.querySelectorAll('#tasks .task-card');

    taskCards.forEach(card => {
        const titleText = card.querySelector('.task-title')?.textContent || '';
        const buttonTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';

        if (normalizeTaskName(titleText) === normalizedName || normalizeTaskName(buttonTask) === normalizedName) {
            card.remove();
        }
    });
}

function renderTodayChallenges() {
    const list = document.getElementById('todayChallengesList');
    if (!list) return;

    const today = getToday();
    const todayTasks = acceptedTasks.filter(task => {
        if (!task.acceptedDate) return false;
        const acceptedDate = new Date(task.acceptedDate);
        if (Number.isNaN(acceptedDate.getTime())) return false;

        const dateKey = `${acceptedDate.getFullYear()}-${String(acceptedDate.getMonth() + 1).padStart(2, '0')}-${String(acceptedDate.getDate()).padStart(2, '0')}`;
        return dateKey === today;
    });

    if (todayTasks.length === 0) {
        list.innerHTML = '<p class="today-challenges-empty">Noch keine Aufgabe akzeptiert.</p>';
        return;
    }

    list.innerHTML = todayTasks.map((task, index) => {
        const challengeKey = getAcceptedTaskKey(task);
        const uploadState = task.proofFileName
            ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> Beweis hochgeladen: ${escapeHtmlText(task.proofFileName)}</p>`
            : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
        
        const proofImage = task.proofFileData 
            ? `<div class="today-proof-image-container"><img src="${task.proofFileData}" alt="Beweis-Foto" class="today-proof-image"></div>`
            : '';

        const uploadButton = task.isCompleted
            ? ''
            : `<button class="btn-primary btn-challenge today-challenge-upload-btn" type="button" data-challenge-index="${index}">
                    <i class="fas fa-upload"></i> Beweis hochladen
               </button>`;

        const confirmButton = task.proofFileData && !task.isCompleted
            ? `<button class="btn-primary btn-challenge today-challenge-confirm-btn" type="button" data-challenge-index="${index}" data-challenge-key="${escapeHtmlText(challengeKey)}">
                    <i class="fas fa-check"></i> Hochladen bestätigen
               </button>`
            : '';

        const acceptedButton = !task.isCompleted && !task.proofFileData
            ? `<button class="btn-primary btn-challenge today-challenge-accepted-btn" type="button" disabled>
                    <i class="fas fa-check"></i> Akzeptiert
               </button>`
            : '';

        const completionNotice = task.isCompleted
            ? `<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>`
            : '';

        const proofInput = task.isCompleted
            ? ''
            : `<input class="today-challenge-upload-input" type="file" accept="image/*" data-challenge-index="${index}" data-challenge-key="${escapeHtmlText(challengeKey)}">`;

        return `
        <div class="today-challenge-card glassmorphism">
            <div class="challenge-header">
                <div class="challenge-icon">
                    <i class="${task.icon || 'fas fa-recycle'}"></i>
                </div>
                <span class="challenge-label">Heutige Challenge</span>
            </div>

            <h2 class="challenge-title">${escapeHtmlText(task.task)}</h2>

            <div class="challenge-description">
                <p>Diese Aufgabe wurde von dir akzeptiert und wartet jetzt auf Erledigung.</p>
            </div>

            <div class="challenge-reward">
                <div class="reward-item">
                    <i class="fas fa-star"></i>
                    <span>50 Punkte</span>
                </div>
            </div>

            ${proofImage}
            ${uploadState}
            ${completionNotice}

            ${acceptedButton}
            ${uploadButton}
            ${proofInput}
            ${confirmButton}
        </div>
    `;
    }).join('');
}

function saveProofUpload(challengeKey, fileName, fileData) {
    const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
    if (taskIndex === -1) return;

    acceptedTasks[taskIndex].proofFileName = fileName;
    acceptedTasks[taskIndex].proofFileData = fileData; // Speichere die Bilddaten als Data URL
    acceptedTasks[taskIndex].proofUploadedAt = new Date().toISOString();
    saveAcceptedTasks();
}

function confirmTaskProof(challengeKey) {
    const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
    if (taskIndex === -1) return;

    const task = acceptedTasks[taskIndex];
    if (!task.proofFileData || task.isCompleted) return;

    task.isCompleted = true;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();

    if (task.isDaily) {
        incrementStreak();
    }

    saveAcceptedTasks();
    renderTodayChallenges();
}

function syncAcceptedTasksToUI() {
    acceptedTasks.forEach(task => removeTaskFromTaskSection(task.task));
    renderTodayChallenges();
}

// Load tasks from JSON
async function loadTasks() {
    try {
        const response = await fetch('../../assets/tasks.json');
        allTasks = await response.json();
        loadDailyTask(); // Tägliche Challenge laden
        syncAcceptedTasksToUI();
    } catch (error) {
        console.error('Fehler beim Laden der Tasks:', error);
    }
}

// Get daily task based on date (changes every day)
function getDailyTask() {
    const dailyTasks = allTasks.daily || [];
    if (dailyTasks.length === 0) return null;

    // Verwende das Datum als Seed für konsistente tägliche Auswahl
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const hash = hashCode(dateString);
    const index = Math.abs(hash) % dailyTasks.length;
    
    return dailyTasks[index];
}

// Einfache Hash-Funktion für konsistente Tagesauswahl
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

// Load and display daily task
function loadDailyTask() {
    const dailyTask = getDailyTask();
    if (!dailyTask) return;

    // Prüfen ob heute schon eine Challenge gestartet wurde
    const todayKey = getTodayKey();
    const lastDailyChallenge = localStorage.getItem('ecoLastDailyChallengeDate');
    
    if (lastDailyChallenge !== todayKey) {
        // Neuer Tag - neue Challenge anzeigen
        displayDailyChallenge(dailyTask);
    } else {
        // Gleicher Tag - prüfen ob bereits akzeptiert
        const existingTask = acceptedTasks.find(t => t.isDaily && t.acceptedDate.startsWith(todayKey));
        if (existingTask) {
            displayDailyChallenge(existingTask, true);
        } else {
            displayDailyChallenge(dailyTask);
        }
    }
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Display daily challenge in the card
function displayDailyChallenge(task, isAccepted = false) {
    const titleEl = document.getElementById('dailyChallengeTitle');
    const descEl = document.getElementById('dailyChallengeDesc');
    const iconEl = document.getElementById('dailyChallengeIcon');
    const btnEl = document.getElementById('startChallengeBtn');

    if (titleEl) titleEl.textContent = task.task;
    if (descEl) descEl.textContent = "Erledige diese tägliche Aufgabe und verdiene dir Punkte!";
    if (iconEl && task.icon) iconEl.className = task.icon;

    if (btnEl) {
        if (isAccepted) {
            btnEl.innerHTML = '<i class="fas fa-check"></i> Akzeptiert';
            btnEl.disabled = true;
            btnEl.classList.add('accepted');
        } else {
            btnEl.innerHTML = '<i class="fas fa-arrow-right"></i> Challenge starten';
            btnEl.disabled = false;
            btnEl.classList.remove('accepted');
        }
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
        if (isTaskAlreadyAccepted(currentTask.task)) {
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
        saveAcceptedTasks();
        removeTaskFromTaskSection(currentTask.task);
        renderTodayChallenges();

        // Nur Punkte bei Annahme — kein Streak mehr

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
            const dailyTask = getDailyTask();
            if (!dailyTask) return;

            const todayKey = getTodayKey();
            
            // Prüfen ob heute schon akzeptiert
            const alreadyAccepted = acceptedTasks.some(t => t.isDaily && t.acceptedDate && t.acceptedDate.startsWith(todayKey));
            if (alreadyAccepted) return;

            // Task zur acceptedTasks hinzufügen
            const task = {
                id: Date.now(),
                task: dailyTask.task,
                icon: dailyTask.icon,
                acceptedDate: new Date().toISOString(),
                status: 'accepted',
                isDaily: true // Markierung für tägliche Challenge
            };
            
            acceptedTasks.push(task);
            saveAcceptedTasks();
            
            // Speichern dass heute eine Challenge gestartet wurde
            localStorage.setItem('ecoLastDailyChallengeDate', todayKey);
            
            // UI aktualisieren
            displayDailyChallenge(dailyTask, true);
            renderTodayChallenges();
            
            console.log('Tägliche Challenge gestartet:', dailyTask.task);
        });
    }

    updateTimer();
    setInterval(updateTimer, 60000);

    observeStatsAnimation();

    const savedDarkMode = localStorage.getItem('ecoDarkMode') === '1';
    initializeDarkMode(savedDarkMode);
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


// Google send -- WEBHOOK
async function sendToGoogleSheets(msgObj) {
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(msgObj)
        });
    } catch (error) {
        console.error(error);
    }
}

// Load tasks on page load
loadTasks();
setupTaskSwipe();

// Handle task accept buttons
document.addEventListener('click', function(e) {
    const uploadBtn = e.target.closest('.today-challenge-upload-btn');
    if (uploadBtn) {
        const index = uploadBtn.getAttribute('data-challenge-index');
        const input = document.querySelector(`.today-challenge-upload-input[data-challenge-index="${index}"]`);
        if (input) input.click();
        return;
    }

    const confirmBtn = e.target.closest('.today-challenge-confirm-btn');
    if (confirmBtn) {
        const challengeKey = confirmBtn.getAttribute('data-challenge-key');
        if (challengeKey) confirmTaskProof(challengeKey);
        return;
    }

    const btn = e.target.closest('.task-accept-btn');
    if (btn) {
        const taskName = btn.getAttribute('data-task');
        const taskIcon = btn.getAttribute('data-icon');

        if (isTaskAlreadyAccepted(taskName)) {
            removeTaskFromTaskSection(taskName);
            renderTodayChallenges();
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            task: taskName,
            icon: taskIcon,
            acceptedDate: new Date().toISOString(),
            status: 'accepted'
        };
        
        // Add new task
        acceptedTasks.push(task);
        
        // Save to localStorage
        saveAcceptedTasks();

        // Nur Punkte bei Annahme — kein Streak mehr
        
        removeTaskFromTaskSection(taskName);
        renderTodayChallenges();
    }
});

document.addEventListener('change', function(e) {
    const uploadInput = e.target.closest('.today-challenge-upload-input');
    if (!uploadInput) return;

    const file = uploadInput.files && uploadInput.files[0];
    if (!file) return;

    const challengeKey = uploadInput.getAttribute('data-challenge-key') || '';
    
    // Bild als Data URL lesen für Vorschau
    const reader = new FileReader();
    reader.onload = function(event) {
        const fileData = event.target.result; // Data URL des Bildes
        saveProofUpload(challengeKey, file.name, fileData);
        renderTodayChallenges();
    };
    reader.readAsDataURL(file);
});

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
