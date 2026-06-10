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
  loadRecentUploads() // Load recent uploads on page load
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
const CHAT_FRIENDS_KEY = 'ecoChatFriends';
const FRIEND_REQUESTS_KEY = 'ecoFriendRequests';
const container = document.getElementById('friends-list-container');
const friendRequestsContainer = document.getElementById('friend-requests-container');
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

function getChatFriends() {
    return JSON.parse(localStorage.getItem(CHAT_FRIENDS_KEY)) || [];
}

function saveChatFriends(friends) {
    localStorage.setItem(CHAT_FRIENDS_KEY, JSON.stringify(friends));
}

function getFriendRequests() {
    return JSON.parse(localStorage.getItem(FRIEND_REQUESTS_KEY)) || [];
}

function saveFriendRequests(requests) {
    localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests));
}

function getFriendRequestsForUser(email) {
    return getFriendRequests().filter(request => request.to === email && request.status === 'pending');
}

function addFriendRequest(request) {
    const requests = getFriendRequests();
    requests.push(request);
    saveFriendRequests(requests);
}

function updateFriendRequestStatus(requestId, status) {
    const requests = getFriendRequests();
    const index = requests.findIndex(request => request.id === requestId);
    if (index === -1) return null;
    requests[index].status = status;
    saveFriendRequests(requests);
    return requests[index];
}

function makeRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isEmail(value) {
    return /.+@.+\..+/.test(value);
}

function getDisplayNameFromEmail(email) {
    return email.split('@')[0].replace(/[._\d]+/g, '').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || email;
}

function getConversationKey(userA, userB) {
    return [userA, userB].sort().join('||');
}

function getSavedChatMessages() {
    return JSON.parse(localStorage.getItem('chatMessages')) || {};
}

function saveChatMessages(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function addLocalChatMessage(msgObj) {
    const messages = getSavedChatMessages();
    const key = getConversationKey(msgObj.sender, msgObj.receiver);
    messages[key] = messages[key] || [];
    messages[key].push(msgObj);
    saveChatMessages(messages);
}

function getConversationMessages(friendEmail) {
    const ecoUser = getLoggedInUser();
    if (!ecoUser) return [];
    const messages = getSavedChatMessages();
    return messages[getConversationKey(ecoUser.email, friendEmail)] || [];
}

function getAllKnownUsers() {
    const savedFriends = getSavedGoogleFriends();
    const loggedInUser = getLoggedInUser();
    const users = googleUsers.map(user => ({ ...user }));
    if (loggedInUser && !users.some(user => user.email.toLowerCase() === loggedInUser.email.toLowerCase())) {
        users.push({
            name: loggedInUser.name,
            email: loggedInUser.email,
            online: true,
            streak: 0,
            vibe: 'Du',
            points: 0
        });
    }
    savedFriends.forEach(friend => {
        if (!users.some(user => user.email.toLowerCase() === friend.email.toLowerCase())) {
            users.push(friend);
        }
    });
    return users;
}

function findRegisteredUser(identifier) {
    if (!identifier) return null;
    const normalized = identifier.trim().toLowerCase();
    return getAllKnownUsers().find(user => {
        return user.email?.toLowerCase() === normalized || user.name?.toLowerCase() === normalized;
    });
}

function isFriendWith(email) {
    return getChatFriends().some(friend => friend.email.toLowerCase() === email.toLowerCase());
}

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
    const availableUsers = getAllKnownUsers();
    const friendEmails = getChatFriends().map(friend => friend.email.toLowerCase());
    return availableUsers
        .filter(user => user.email && user.email.toLowerCase() !== getLoggedInUser()?.email?.toLowerCase())
        .map(user => ({
            ...user,
            isFriend: friendEmails.includes(user.email.toLowerCase())
        }));
}

function addGoogleFriend(email) {
    if (!isGoogleLoggedIn()) {
        updateActionInfo('Bitte melde dich zuerst mit Google an, um Freunde hinzuzufügen.');
        return;
    }

    const savedFriends = getSavedGoogleFriends();
    const existing = savedFriends.find(friend => friend.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        updateActionInfo(`${existing.name} ist bereits in deiner Kontaktliste.`);
        return;
    }

    const user = getAllKnownUsers().find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (!user) return;

    savedFriends.push(user);
    saveGoogleFriends(savedFriends);
    updateActionInfo(`${user.name} wurde als Freund hinzugefügt.`);
    loadFriends();
}

function loadFriends() {
    displayedFriends = getAvailableGoogleUsers();
    renderFriends(displayedFriends);
    renderFriendRequests();
    if (!isGoogleLoggedIn()) {
        updateActionInfo('Melde dich mit Google an, um anderen Nutzern Nachrichten und Anfragen zu senden.');
    } else {
        updateActionInfo('Wähle einen Kontakt oder eine Anfrage, um mit dem Chat zu starten.');
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
            <div class="friend-row ${friend.online ? 'is-online' : ''}" data-friend-email="${friend.email}">
                <div class="friend-avatar">${initials}</div>
                <div class="friend-meta">
                    <span class="friend-name">${friend.name}</span>
                    <span class="friend-vibe">${friend.vibe || 'Verbinde dich'}</span>
                </div>
                <div class="friend-stats">
                    <span class="friend-points">${friend.points || 0} pts</span>
                    <span class="friend-streak"><i class="fas fa-fire"></i> ${friend.streak || 0}</span>
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

function renderFriendRequests() {
    if (!friendRequestsContainer) return;
    const ecoUser = getLoggedInUser();
    if (!ecoUser) {
        friendRequestsContainer.innerHTML = '<p class="today-challenges-empty">Bitte melde dich an, um Freundschaftsanfragen zu sehen.</p>';
        return;
    }

    const requests = getFriendRequestsForUser(ecoUser.email);
    if (requests.length === 0) {
        friendRequestsContainer.innerHTML = '<p class="today-challenges-empty">Keine Anfragen.</p>';
        return;
    }

    friendRequestsContainer.innerHTML = requests.map(request => {
        return `
            <div class="friend-request-row" data-request-id="${request.id}">
                <div class="friend-request-meta">
                    <strong>${request.fromName}</strong> (${request.from}) möchte dein Freund sein.
                </div>
                <div class="friend-request-actions">
                    <button class="friend-request-action" data-action="accept" data-request-id="${request.id}">Annehmen</button>
                    <button class="friend-request-action" data-action="decline" data-request-id="${request.id}">Ablehnen</button>
                </div>
            </div>
        `;
    }).join('');
}

function handleFriendRequestAction(requestId, action) {
    const ecoUser = getLoggedInUser();
    if (!ecoUser) return;

    const request = updateFriendRequestStatus(requestId, action === 'accept' ? 'accepted' : 'declined');
    if (!request) return;

    if (action === 'accept') {
        const friends = getChatFriends();
        if (!friends.some(friend => friend.email.toLowerCase() === request.from.toLowerCase())) {
            friends.push({
                name: request.fromName,
                email: request.from,
                picture: '',
                online: false,
                streak: 0,
                vibe: 'Freund',
                points: 0,
                isFriend: true
            });
            saveChatFriends(friends);
        }

        sendToGoogleSheets({
            action: 'friend_request_response',
            sender: ecoUser.email,
            receiver: request.from,
            text: `${ecoUser.name} hat deine Freundschaftsanfrage angenommen.`,
            type: 'friend_request',
            istFreund: true,
            timestamp: new Date().toISOString()
        });

        updateActionInfo(`Du bist jetzt mit ${request.fromName} befreundet.`);
    } else {
        sendToGoogleSheets({
            action: 'friend_request_response',
            sender: ecoUser.email,
            receiver: request.from,
            text: `${ecoUser.name} hat deine Freundschaftsanfrage abgelehnt.`,
            type: 'friend_request',
            istFreund: false,
            timestamp: new Date().toISOString()
        });

        updateActionInfo(`Freundschaftsanfrage von ${request.fromName} abgelehnt.`);
    }

    renderFriendRequests();
    loadFriends();
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
            addUserBySearch(email);
            event.stopPropagation();
            return;
        }

        const row = event.target.closest('.friend-row');
        if (row) {
            const friendEmail = row.dataset.friendEmail;
            if (!isGoogleLoggedIn()) {
                updateActionInfo('Bitte melde dich mit Google an, um Nachrichten zu senden.');
                return;
            }
            openChat(friendEmail);
        }
    });
}

if (friendRequestsContainer) {
    friendRequestsContainer.addEventListener('click', (event) => {
        const requestButton = event.target.closest('.friend-request-action');
        if (!requestButton) return;

        const requestId = requestButton.dataset.requestId;
        const action = requestButton.dataset.action;
        handleFriendRequestAction(requestId, action);
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

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';
    renderConversationMessages();

    const url = `${WEB_APP_URL}?email=${encodeURIComponent(ecoUser.email)}&friend=${encodeURIComponent(currentChatFriend)}`;
    try {
        const response = await fetch(url);
        const remoteMessages = await response.json();
        if (Array.isArray(remoteMessages) && remoteMessages.length > 0) {
            messagesContainer.innerHTML = '';
            remoteMessages.forEach(msg => {
                const isOwn = (msg.sender === ecoUser.email);
                addMessageToChat(msg.text, isOwn);
            });
        }
    } catch (e) {
        console.error('Remote message polling failed:', e);
    }
}

function sendLoginToGoogleSheets(user) {
    if (!user || !user.email) return;

    const lastSentEmail = sessionStorage.getItem('ecoUserLoginSent');
    if (lastSentEmail === user.email) return;

    sessionStorage.setItem('ecoUserLoginSent', user.email);

    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            action: "register",
            name: user.name,
            email: user.email,
            picture: user.picture || '',
            timestamp: new Date().toISOString()
        })
    }).catch(error => {
        console.error('Login sheet send failed:', error);
    });
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
    sendLoginToGoogleSheets(userObj);
    renderProfile(userObj);
    loadFriends();
}

function addUserBySearch(presetEmail) {
    const input = document.getElementById('friend-search-input');
    const query = presetEmail || input.value.trim();
    if (!query) return;
    if (!isGoogleLoggedIn()) {
        updateActionInfo('Bitte melde dich mit Google an, um Freundschaftsanfragen zu verschicken.');
        return;
    }

    const ecoUser = getLoggedInUser();
    const normalizedQuery = query.trim();
    const target = findRegisteredUser(normalizedQuery) || (isEmail(normalizedQuery) ? {
        name: getDisplayNameFromEmail(normalizedQuery),
        email: normalizedQuery,
        online: false,
        streak: 0,
        vibe: 'Neu hinzugefügt',
        points: 0
    } : null);

    if (!target || !target.email) {
        updateActionInfo('Kein Nutzer gefunden. Bitte verwende eine gültige E-Mail oder einen bekannten Namen.');
        if (input) input.value = '';
        return;
    }

    if (target.email.toLowerCase() === ecoUser.email.toLowerCase()) {
        updateActionInfo('Du kannst dich nicht selbst hinzufügen.');
        if (input) input.value = '';
        return;
    }

    if (isFriendWith(target.email)) {
        updateActionInfo(`${target.name} ist bereits als Freund gespeichert.`);
        if (input) input.value = '';
        return;
    }

    const existingRequest = getFriendRequests().find(request => request.from.toLowerCase() === ecoUser.email.toLowerCase() && request.to.toLowerCase() === target.email.toLowerCase() && request.status === 'pending');
    if (existingRequest) {
        updateActionInfo('Eine Anfrage wurde bereits gesendet.');
        if (input) input.value = '';
        return;
    }

    const request = {
        id: makeRequestId(),
        from: ecoUser.email,
        fromName: ecoUser.name,
        to: target.email,
        toName: target.name,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    addFriendRequest(request);
    sendToGoogleSheets({
        action: 'friend_request',
        sender: ecoUser.email,
        receiver: target.email,
        text: `${ecoUser.name} hat dir eine Freundschaftsanfrage geschickt.`,
        type: 'friend_request',
        istFreund: false,
        timestamp: request.timestamp
    });

    updateActionInfo(`Freundschaftsanfrage an ${target.name} gesendet.`);
    if (input) input.value = '';
    renderFriendRequests();
}


function openChat(friendEmail) {
    if (!isGoogleLoggedIn()) return;

    const isEmailContact = friendEmail.includes('@');
    if (isEmailContact && !isFriendWith(friendEmail)) {
        updateActionInfo('Nur akzeptierte Freunde können chatten. Bitte sende zuerst eine Anfrage.');
        return;
    }

    currentChatFriend = friendEmail;
    document.getElementById('chat-friend-name').textContent = friendEmail;
    document.getElementById('chat-modal').style.display = 'flex';
    const chatMessagesEl = document.getElementById('chat-messages');
    if (chatMessagesEl) chatMessagesEl.innerHTML = 'Lade...';

    renderConversationMessages();
    loadMessagesFromGoogle();
    if (chatRefreshInterval) clearInterval(chatRefreshInterval);
    chatRefreshInterval = setInterval(loadMessagesFromGoogle, 3000);
}

function renderConversationMessages() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer || !currentChatFriend) return;

    const messages = getConversationMessages(currentChatFriend);
    messagesContainer.innerHTML = messages.length === 0 ? '<p class="today-challenges-empty">Noch keine Nachrichten.</p>' : '';
    messages.forEach(entry => {
        addMessageToChat(entry.text, entry.sender === getLoggedInUser()?.email);
    });
}

function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();
    const ecoUser = JSON.parse(localStorage.getItem('ecoUser'));

    if (!message || !currentChatFriend || !ecoUser) return;
    if (currentChatFriend.includes('@') && !isFriendWith(currentChatFriend)) {
        updateActionInfo('Du kannst nur mit bestätigten Freunden schreiben.');
        return;
    }

    const msgObj = {
        sender: ecoUser.email,
        receiver: currentChatFriend,
        text: message,
        type: 'text',
        istFreund: isFriendWith(currentChatFriend),
        timestamp: new Date().toISOString()
    };

    addLocalChatMessage(msgObj);
    addMessageToChat(message, true);
    sendToGoogleSheets(msgObj);

    input.value = '';
    input.focus();
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

// ===== POINTS MANAGEMENT =====
let userPoints = JSON.parse(localStorage.getItem('userPoints')) || {
    total: 0,
    completedTasks: []
};

const POINTS_STORAGE_KEY = 'userPoints';

function savePoints() {
    localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(userPoints));
}

function addPoints(amount, taskName) {
    if (amount <= 0) return false;
    
    userPoints.total += amount;
    userPoints.completedTasks.push({
        taskName: taskName,
        points: amount,
        completedAt: new Date().toISOString()
    });
    
    savePoints();
    updatePointsDisplay();
    return true;
}

function getPoints() {
    return userPoints.total;
}

function extractPointsFromTask(task) {
    if (!task) return 0;
    
    // Suche nach der Punkte-Information im Task-Objekt oder HTML-Struktur
    // Format: z.B. "50 Punkte", "40 Punkte", etc.
    const taskStr = JSON.stringify(task);
    const match = taskStr.match(/(\d+)\s*(?:Punkte|points)/i);
    return match ? parseInt(match[1], 10) : 0;
}

function updatePointsDisplay() {
    const pointsEl = document.getElementById('stat-points');
    if (pointsEl) {
        pointsEl.textContent = userPoints.total;
    }
}

// ===== ENDE POINTS MANAGEMENT =====

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

function removeEvidence(uploadId) {
    // Parse uploadId to find the corresponding task and image index
    // uploadId format: "taskName_index_timestamp"
    const parts = uploadId.split('_');
    if (parts.length < 3) return;

    const taskName = parts.slice(0, -2).join('_'); // Everything except last 2 parts
    const imageIndex = parseInt(parts[parts.length - 2]);
    const timestamp = parts[parts.length - 1];

    // Find the task
    const taskIndex = acceptedTasks.findIndex(task => 
        task.task === taskName && task.proofUploadedAt === timestamp
    );

    if (taskIndex === -1) return;

    const task = acceptedTasks[taskIndex];
    if (!task.proofFileDatas || task.proofFileDatas.length <= imageIndex) return;

    // Remove the specific image
    task.proofFileDatas.splice(imageIndex, 1);
    if (task.proofFileNames && task.proofFileNames.length > imageIndex) {
        task.proofFileNames.splice(imageIndex, 1);
    }

    // If no images left, remove the upload timestamp
    if (task.proofFileDatas.length === 0) {
        delete task.proofUploadedAt;
        delete task.proofFileNames;
        delete task.proofFileDatas;
    }

    saveAcceptedTasks();
    loadRecentUploads();
}

function loadRecentUploads() {
    // Collect all uploaded images from all tasks
    const allUploads = [];
    acceptedTasks.forEach(task => {
        if (task.proofFileDatas && task.proofUploadedAt) {
            task.proofFileDatas.forEach((data, index) => {
                allUploads.push({
                    data: data,
                    name: task.proofFileNames ? task.proofFileNames[index] : 'Upload',
                    task: task.task,
                    uploadedAt: task.proofUploadedAt,
                    id: `${task.task}_${index}_${task.proofUploadedAt}`
                });
            });
        }
    });

    // Sort by upload date descending, take first 3
    allUploads.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const recentUploads = allUploads.slice(0, 3);

    const proofGallery = document.querySelector('.proof-gallery');
    if (!proofGallery) return;

    // Clear existing items
    proofGallery.innerHTML = '';

    if (recentUploads.length === 0) {
        // Show central empty state box
        proofGallery.innerHTML = `
            <div class="proof-empty-state">
                <div class="proof-empty-icon">
                    <i class="fas fa-image"></i>
                </div>
                <div class="proof-empty-message">Keine Beweise vorhanden</div>
                <div class="proof-empty-subtitle">Füge ein Bild zu deinen Challenges hinzu</div>
            </div>
        `;
        return;
    }

    // Add recent uploads as miniatures
    recentUploads.forEach(upload => {
        const item = document.createElement('div');
        item.className = 'proof-miniature';
        item.innerHTML = `
            <div class="proof-miniature-container">
                <img src="${upload.data}" alt="User upload" class="proof-miniature-img">
                <button class="proof-remove-btn" data-upload-id="${upload.id}" title="Entfernen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        proofGallery.appendChild(item);
    });

    // Add event listeners for remove buttons
    proofGallery.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.proof-remove-btn');
        if (removeBtn) {
            e.preventDefault();
            const uploadId = removeBtn.getAttribute('data-upload-id');
            if (uploadId) {
                removeEvidence(uploadId);
            }
        }
    });
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
            card.style.display = 'none';
        }
    });
}

function buildAcceptedTaskCard(task) {
    const challengeKey = getAcceptedTaskKey(task);
    const proofFileDatas = Array.isArray(task.proofFileDatas) ? task.proofFileDatas : [];
    const proofFileNames = Array.isArray(task.proofFileNames) ? task.proofFileNames : [];
    const isCompleted = Boolean(task.isCompleted);
    const points = task.points || 0;

    const uploadState = proofFileDatas.length > 0
        ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${proofFileNames.length > 0 ? proofFileNames.length : proofFileDatas.length} Beweis${proofFileDatas.length > 1 ? 'e' : ''} hochgeladen</p>`
        : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';

    const proofImage = proofFileDatas.length > 0
        ? `<div class="today-proof-image-container">${proofFileDatas.map(data => `<img src="${data}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
        : '';

    const uploadButton = isCompleted
        ? ''
        : `<button class="accepted-task-btn task-proof-upload-btn" type="button" data-task-key="${escapeHtmlText(challengeKey)}">
                <i class="fas fa-upload"></i> Beweis hochladen
           </button>`;

    const confirmButton = proofFileDatas.length > 0 && !isCompleted
        ? `<button class="accepted-task-btn task-proof-confirm-btn" type="button" data-task-key="${escapeHtmlText(challengeKey)}">
                <i class="fas fa-check"></i> Punkte bestätigen
           </button>`
        : '';

    const proofInput = isCompleted
        ? ''
        : `<input class="task-proof-upload-input" type="file" accept="image/*" multiple data-task-key="${escapeHtmlText(challengeKey)}">`;

    const completionNotice = isCompleted
        ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>'
        : '';

    return `
        <div class="accepted-task-inner">
            <div class="accepted-task-icon">
                <i class="${task.icon || 'fas fa-check'}"></i>
            </div>
            <h3 class="accepted-task-title">${escapeHtmlText(task.task)}</h3>
            <div class="accepted-task-proof-area">
                ${proofImage}
                ${uploadState}
                ${completionNotice}
                ${uploadButton}
                ${proofInput}
                ${confirmButton}
            </div>
            <div class="accepted-task-actions">
                <span class="accepted-task-btn" role="note">
                    <i class="fas fa-star"></i> ${points} Punkte warten auf Bestätigung
                </span>
            </div>
        </div>
    `;
}

function renderAcceptedTaskSection() {
    const taskSection = document.getElementById('tasks');
    if (!taskSection) return;

    taskSection.querySelectorAll('.accepted-task-clone').forEach(clone => clone.remove());

    acceptedTasks.forEach(task => {
        const normalizedName = normalizeTaskName(task.task);
        const taskCards = document.querySelectorAll('#tasks .task-card:not(.accepted-task-clone)');

        taskCards.forEach(card => {
            const titleText = card.querySelector('.task-title')?.textContent || '';
            const buttonTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';

            if (normalizeTaskName(titleText) !== normalizedName && normalizeTaskName(buttonTask) !== normalizedName) {
                return;
            }

            const clone = document.createElement('div');
            clone.className = 'task-card task-card-accepted accepted-task-clone';
            clone.setAttribute('data-task-key', getAcceptedTaskKey(task));
            clone.innerHTML = buildAcceptedTaskCard(task);
            card.insertAdjacentElement('afterend', clone);
            card.style.display = 'none';
        });
    });
}

function restoreTaskInTaskSection(taskName) {
    const normalizedName = normalizeTaskName(taskName);
    const taskCards = document.querySelectorAll('#tasks .task-card[style*="display: none"]');

    taskCards.forEach(card => {
        const titleText = card.querySelector('.task-title')?.textContent || '';
        const buttonTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';

        if (normalizeTaskName(titleText) === normalizedName || normalizeTaskName(buttonTask) === normalizedName) {
            card.style.display = '';
        }
    });
}

function renderTodayChallenges() {
    const list = document.getElementById('todayChallengesList');
    if (!list) return;

    const today = getToday();
    const todayTasks = acceptedTasks.filter(task => {
        if (task.acceptedDate) return false;
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
        const uploadState = task.proofFileNames && task.proofFileNames.length > 0
            ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${task.proofFileNames.length} Beweis${task.proofFileNames.length > 1 ? 'e' : ''} hochgeladen</p>`
            : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
        
        const proofImage = task.proofFileDatas && task.proofFileDatas.length > 0
            ? `<div class="today-proof-image-container">${task.proofFileDatas.map(data => `<img src="${data}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
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
            : `<input class="today-challenge-upload-input" type="file" accept="image/*" multiple data-challenge-index="${index}" data-challenge-key="${escapeHtmlText(challengeKey)}">`;

        // Display correct points from task
        const displayPoints = task.points || 50;

        const isDailyClass = task.isDaily ? 'is-daily-challenge' : '';
        const dailyBadge = task.isDaily 
            ? `<span class="streak-badge-label">
                    <i class="fas fa-fire"></i> Streak-Erhaltung
               </span>`
            : '';

        return `
        <div class="today-challenge-card glassmorphism ${isDailyClass}">
            <div class="challenge-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="challenge-icon">
                        <i class="${task.icon || 'fas fa-recycle'}"></i>
                    </div>
                    <span class="challenge-label">Heutige Challenge</span>
                </div>
                ${dailyBadge}
            </div>

            <h2 class="challenge-title">${escapeHtmlText(task.task)}</h2>

            <div class="challenge-description">
                <p>Diese Aufgabe wurde von dir akzeptiert und wartet jetzt auf Erledigung.</p>
            </div>

            <div class="challenge-reward">
                <div class="reward-item">
                    <i class="fas fa-star"></i>
                    <span>${displayPoints} Punkte</span>
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

function saveProofUpload(challengeKey, fileNames, fileDatas) {
    const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
    if (taskIndex === -1) return;

    // Ensure arrays
    if (!Array.isArray(fileNames)) fileNames = [fileNames];
    if (!Array.isArray(fileDatas)) fileDatas = [fileDatas];

    acceptedTasks[taskIndex].proofFileNames = fileNames;
    acceptedTasks[taskIndex].proofFileDatas = fileDatas; // Speichere die Bilddaten als Data URLs
    acceptedTasks[taskIndex].proofUploadedAt = new Date().toISOString();
    saveAcceptedTasks();
    loadRecentUploads(); // Update recent uploads display
    renderDailyChallengeCard();
    renderAcceptedTaskSection();
}

function confirmTaskProof(challengeKey) {
    const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
    if (taskIndex === -1) return;

    const task = acceptedTasks[taskIndex];
    if (!task.proofFileDatas || task.proofFileDatas.length === 0 || task.isCompleted) return;

    task.isCompleted = true;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();

    // Extract points from task and award them
    let points = 0;
    
    // Try to extract points from accepted tasks data
    if (task.points) {
        points = parseInt(task.points, 10);
    } else {
        // Try to find the task in allTasks and extract points
        const foundTask = (allTasks.weekly || []).concat(allTasks.daily || []).find(t => 
            normalizeTaskName(t.task) === normalizeTaskName(task.task)
        );
        if (foundTask) {
            points = extractPointsFromTask(foundTask);
        }
    }
    
    // Award points if any were found
    if (points > 0) {
        addPoints(points, task.task);
    }

    if (task.isDaily) {
        incrementStreak();
    }

    saveAcceptedTasks();
    renderTodayChallenges();
    renderDailyChallengeCard();
    renderAcceptedTaskSection();
}

function syncAcceptedTasksToUI() {
    // Alle Aufgaben wieder anzeigen
    const allTaskCards = document.querySelectorAll('#tasks .task-card');
    allTaskCards.forEach(card => {
        card.style.display = '';
    });
    document.querySelectorAll('#tasks .accepted-task-clone').forEach(clone => clone.remove());
    
    // Akzeptierte Aufgaben verstecken
    acceptedTasks.forEach(task => removeTaskFromTaskSection(task.task));
    renderAcceptedTaskSection();
    
    // Laufende Challenges anzeigen
    renderTodayChallenges();
}

// Load tasks from JSON
async function loadTasks() {
    try {
        const response = await fetch('../../assets/tasks.json');
        allTasks = await response.json();
        loadDailyTask(); // Tägliche Challenge laden
    } catch (error) {
        console.error('Fehler beim Laden der Tasks:', error);
    } finally {
        // Always sync tasks to UI, even if JSON load fails
        syncAcceptedTasksToUI();
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
    renderDailyChallengeCard();
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getAcceptedDailyTaskForToday() {
    const todayKey = getTodayKey();
    return acceptedTasks.find(task => task.isDaily && task.acceptedDate && task.acceptedDate.startsWith(todayKey)) || null;
}

function renderDailyChallengeCard() {
    const dailyTask = getDailyTask();
    if (!dailyTask) return;

    const acceptedDailyTask = getAcceptedDailyTaskForToday();
    if (acceptedDailyTask) {
        displayDailyChallenge(acceptedDailyTask, true);
        return;
    }

    displayDailyChallenge(dailyTask, false);
}

// Display daily challenge in the card
function displayDailyChallenge(task, isAccepted = false) {
    const titleEl = document.getElementById('dailyChallengeTitle');
    const descEl = document.getElementById('dailyChallengeDesc');
    const iconEl = document.getElementById('dailyChallengeIcon');
    const btnEl = document.getElementById('startChallengeBtn');
    const proofArea = document.getElementById('dailyChallengeProofArea');
    const challengeKey = isAccepted ? getAcceptedTaskKey(task) : '';
    const proofFileDatas = Array.isArray(task.proofFileDatas) ? task.proofFileDatas : [];
    const proofFileNames = Array.isArray(task.proofFileNames) ? task.proofFileNames : [];
    const isCompleted = Boolean(task.isCompleted);

    if (titleEl) titleEl.textContent = task.task;
    if (descEl) {
        descEl.textContent = isAccepted
            ? 'Lade jetzt ein Bild als Beweis hoch und bestätige die Tages-Challenge.'
            : 'Erledige diese tägliche Aufgabe und verdiene dir Punkte!';
    }
    if (iconEl && task.icon) iconEl.className = task.icon;

    if (btnEl) {
        if (isCompleted) {
            btnEl.innerHTML = '<i class="fas fa-check"></i> Abgeschlossen';
            btnEl.disabled = true;
            btnEl.classList.add('accepted');
        } else if (isAccepted) {
            btnEl.innerHTML = '<i class="fas fa-check"></i> Akzeptiert';
            btnEl.disabled = true;
            btnEl.classList.add('accepted');
        } else {
            btnEl.innerHTML = '<i class="fas fa-arrow-right"></i> Challenge starten';
            btnEl.disabled = false;
            btnEl.classList.remove('accepted');
        }
    }

    if (!proofArea) return;

    if (!isAccepted) {
        proofArea.innerHTML = '';
        return;
    }

    const uploadState = proofFileDatas.length > 0
        ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${proofFileNames.length > 0 ? proofFileNames.length : proofFileDatas.length} Beweis${proofFileDatas.length > 1 ? 'e' : ''} hochgeladen</p>`
        : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';

    const proofImage = proofFileDatas.length > 0
        ? `<div class="today-proof-image-container">${proofFileDatas.map(data => `<img src="${data}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
        : '';

    const uploadButton = isCompleted
        ? ''
        : `<button class="btn-primary btn-challenge today-challenge-upload-btn daily-challenge-upload-btn" type="button" data-challenge-key="${escapeHtmlText(challengeKey)}">
                <i class="fas fa-upload"></i> Beweis hochladen
           </button>`;

    const confirmButton = proofFileDatas.length > 0 && !isCompleted
        ? `<button class="btn-primary btn-challenge today-challenge-confirm-btn daily-challenge-confirm-btn" type="button" data-challenge-key="${escapeHtmlText(challengeKey)}">
                <i class="fas fa-check"></i> Hochladen bestätigen
           </button>`
        : '';

    const proofInput = isCompleted
        ? ''
        : `<input class="today-challenge-upload-input daily-challenge-upload-input" type="file" accept="image/*" multiple id="dailyChallengeUploadInput" data-challenge-key="${escapeHtmlText(challengeKey)}">`;

    const completionNotice = isCompleted
        ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>'
        : '';

    proofArea.innerHTML = `
        ${proofImage}
        ${uploadState}
        ${completionNotice}
        ${uploadButton}
        ${proofInput}
        ${confirmButton}
    `;
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
            renderDailyChallengeCard();
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
    const payload = {
        action: msgObj.action || 'message',
        ...msgObj
    };

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
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
    const dailyUploadBtn = e.target.closest('.daily-challenge-upload-btn');
    if (dailyUploadBtn) {
        const input = document.getElementById('dailyChallengeUploadInput');
        if (input) input.click();
        return;
    }

    const dailyConfirmBtn = e.target.closest('.daily-challenge-confirm-btn');
    if (dailyConfirmBtn) {
        const challengeKey = dailyConfirmBtn.getAttribute('data-challenge-key');
        if (challengeKey) confirmTaskProof(challengeKey);
        return;
    }

    const taskUploadBtn = e.target.closest('.task-proof-upload-btn');
    if (taskUploadBtn) {
        const taskKey = taskUploadBtn.getAttribute('data-task-key');
        const input = taskUploadBtn.closest('.accepted-task-clone')?.querySelector(`.task-proof-upload-input[data-task-key="${taskKey}"]`);
        if (input) input.click();
        return;
    }

    const taskConfirmBtn = e.target.closest('.task-proof-confirm-btn');
    if (taskConfirmBtn) {
        const taskKey = taskConfirmBtn.getAttribute('data-task-key');
        if (taskKey) confirmTaskProof(taskKey);
        return;
    }

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
            renderAcceptedTaskSection();
            renderTodayChallenges();
            return;
        }
        
        // Find the task card to extract points
        const taskCard = btn.closest('.task-card');
        let points = 0;
        
        if (taskCard) {
            const pointsText = taskCard.querySelector('.task-points')?.textContent || '';
            const pointsMatch = pointsText.match(/(\d+)\s*Punkte/);
            if (pointsMatch) {
                points = parseInt(pointsMatch[1], 10);
            }
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            task: taskName,
            icon: taskIcon,
            points: points,
            acceptedDate: new Date().toISOString(),
            status: 'accepted'
        };
        
        // Add new task
        acceptedTasks.push(task);
        
        // Save to localStorage
        saveAcceptedTasks();

        renderAcceptedTaskSection();
        renderTodayChallenges();
    }
});

document.addEventListener('change', function(e) {
    const taskUploadInput = e.target.closest('.task-proof-upload-input');
    if (taskUploadInput) {
        const files = taskUploadInput.files;
        if (!files || files.length === 0) return;

        const challengeKey = taskUploadInput.getAttribute('data-task-key') || '';
        const fileNames = [];
        const fileDatas = [];
        let loadedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function(event) {
                fileNames.push(file.name);
                fileDatas.push(event.target.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    saveProofUpload(challengeKey, fileNames, fileDatas);
                    renderAcceptedTaskSection();
                }
            };
            reader.readAsDataURL(file);
        }
        return;
    }

    const dailyUploadInput = e.target.closest('.daily-challenge-upload-input');
    if (dailyUploadInput) {
        const files = dailyUploadInput.files;
        if (!files || files.length === 0) return;

        const challengeKey = dailyUploadInput.getAttribute('data-challenge-key') || '';
        const fileNames = [];
        const fileDatas = [];
        let loadedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function(event) {
                fileNames.push(file.name);
                fileDatas.push(event.target.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    saveProofUpload(challengeKey, fileNames, fileDatas);
                    renderDailyChallengeCard();
                }
            };
            reader.readAsDataURL(file);
        }
        return;
    }

    const uploadInput = e.target.closest('.today-challenge-upload-input');
    if (!uploadInput) return;

    const files = uploadInput.files;
    if (!files || files.length === 0) return;

    const challengeKey = uploadInput.getAttribute('data-challenge-key') || '';
    
    const fileNames = [];
    const fileDatas = [];
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(event) {
            fileNames.push(file.name);
            fileDatas.push(event.target.result); // Data URL des Bildes
            loadedCount++;
            if (loadedCount === files.length) {
                saveProofUpload(challengeKey, fileNames, fileDatas);
                renderTodayChallenges();
            }
        };
        reader.readAsDataURL(file);
    }
});

function renderProfile(user) {
    if (!user) return;

    let nameEl = document.getElementById('user-name')
    let avatarEl = document.getElementById('user-avatar')
    let locationEl = document.getElementById('user-location')
    let loginBtn = document.querySelector('.g_id_signin');
    let logoutBtn = document.getElementById('logoutBtn');

    if (nameEl) nameEl.textContent = user.name
    if (avatarEl) avatarEl.src = user.picture
    if (locationEl) locationEl.textContent = user.email
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.disabled = false;
}

function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('ecoUser');
    
    // Sign out from Google
    google.accounts.id.disableAutoSelect();
    
    // Disable logout button and show Google sign-in button
    let loginBtn = document.querySelector('.g_id_signin');
    let logoutBtn = document.getElementById('logoutBtn');
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.disabled = true;
    
    // Clear profile information
    let nameEl = document.getElementById('user-name')
    let avatarEl = document.getElementById('user-avatar')
    let locationEl = document.getElementById('user-location')
    if (nameEl) nameEl.textContent = 'LÄDT...'
    if (avatarEl) avatarEl.src = 'avatar.png'
    if (locationEl) locationEl.textContent = 'ORGANISATION'

    loadFriends();
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    const savedUser = localStorage.getItem('ecoUser')
    if (savedUser) {
        const user = JSON.parse(savedUser)
        renderProfile(user)
        sendLoginToGoogleSheets(user)
    }
    
    // Initialize points display
    updatePointsDisplay();
})

window.onload = () => {
    navigateTo('home');
    updateActPage('home');
};
