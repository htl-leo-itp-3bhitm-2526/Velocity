let closeBtn = document.getElementById('closeBtn')
let sidebar = document.getElementById('sidebar')
let overlay = document.getElementById('overlay')
let navLinks = document.querySelectorAll('.nav-link')
let bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
let sections = document.querySelectorAll('.full-screen')
let chatRefreshInterval = null;

// ===== PHP API CONFIG =====
const API_BASE = '/Velocity/api';

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

document.addEventListener('click', (e) => {
  const darkModeBtn = e.target.closest('.dark-mode-toggle');
  if (darkModeBtn) {
    const enabled = !document.body.classList.contains('dark-mode');
    setDarkMode(enabled);
  }
});

// ===== AUTHENTICATION =====
let currentUser = null;

async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth.php?action=check`, { credentials: 'same-origin' });
    const data = await res.json();
    if (data.loggedIn && data.user) {
      currentUser = data.user;
      renderProfile();
      loadFriends();
      updatePointsDisplay();
      updateStreakDisplay();
      return true;
    }
    currentUser = null;
    return false;
  } catch (e) {
    console.error('Auth check failed:', e);
    currentUser = null;
    return false;
  }
}

function isLoggedIn() {
  return currentUser !== null;
}

// ----- API helpers for tasks/profile -----
async function apiAcceptTask(taskName, taskIcon, points = 0, isDaily = 0) {
  try {
    const res = await fetch(`${API_BASE}/tasks.php?action=accept`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_name: taskName, task_icon: taskIcon, points, is_daily: isDaily })
    });
    return await res.json();
  } catch (e) { console.error('apiAcceptTask failed', e); return { error: e.message }; }
}

async function apiUploadProof(serverTaskId, fileNames, fileDatas) {
  try {
    const res = await fetch(`${API_BASE}/tasks.php?action=upload_proof`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: serverTaskId, proof_images: fileDatas, file_names: fileNames })
    });
    return await res.json();
  } catch (e) { console.error('apiUploadProof failed', e); return { error: e.message }; }
}

async function apiCompleteTask(serverTaskId) {
  try {
    const res = await fetch(`${API_BASE}/tasks.php?action=complete`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: serverTaskId })
    });
    return await res.json();
  } catch (e) { console.error('apiCompleteTask failed', e); return { error: e.message }; }
}

async function refreshProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile.php?action=get`, { credentials: 'same-origin' });
    const data = await res.json();
    if (data && data.profile) {
      currentUser = data.profile;
      renderProfile();
      displayStreak();
      updatePointsDisplay();
    }
  } catch (e) { console.error('refreshProfile failed', e); }
}

function requireAuth(action) {
  if (!isLoggedIn()) {
    showAuthModal();
    showToast('Bitte melde dich zuerst an, um ' + action + '.', 'warning');
    return false;
  }
  return true;
}

// ===== AUTH MODAL =====
function showAuthModal() {
  document.getElementById('authModal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('authModal').classList.remove('active');
  document.getElementById('authErrorMessage').style.display = 'none';
}

function showAuthError(msg) {
  const el = document.getElementById('authErrorMessage');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showAuthError('Bitte alle Felder ausfüllen.'); return; }
  try {
    const res = await fetch(`${API_BASE}/auth.php?action=login_email`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { showAuthError(data.error); return; }
    if (data.success) {
      currentUser = data.user;
      hideAuthModal();
      renderProfile();
      loadFriends();
      updatePointsDisplay();
      updateStreakDisplay();
      showToast('Erfolgreich angemeldet!', 'success');
    }
  } catch (e) { showAuthError('Verbindungsfehler zum Server.'); }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  if (!name || !email || !password) { showAuthError('Bitte alle Felder ausfüllen.'); return; }
  try {
    const res = await fetch(`${API_BASE}/auth.php?action=register_email`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.error) { showAuthError(data.error); return; }
    if (data.success) {
      currentUser = data.user;
      hideAuthModal();
      renderProfile();
      loadFriends();
      updatePointsDisplay();
      updateStreakDisplay();
      showToast('Registrierung erfolgreich!', 'success');
    }
  } catch (e) { showAuthError('Verbindungsfehler zum Server.'); }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth.php?action=logout`, { credentials: 'same-origin' });
    currentUser = null;
    renderProfile();
    loadFriends();
    showToast('Abgemeldet.', 'info');
  } catch (e) { console.error('Logout failed:', e); }
}

// Google login callback
async function handleCredentialResponse(response) {
  let data = JSON.parse(atob(response.credential.split('.')[1]));
  try {
    const res = await fetch(`${API_BASE}/auth.php?action=login`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        picture: data.picture
      })
    });
    const result = await res.json();
    if (result.success) {
      currentUser = result.user;
      hideAuthModal();
      renderProfile();
      loadFriends();
      updatePointsDisplay();
      updateStreakDisplay();
      showToast('Mit Google angemeldet!', 'success');
    }
  } catch (e) { showAuthError('Google-Login fehlgeschlagen.'); }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'badge-toast show';
  const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  const color = type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3';
  toast.innerHTML = `
    <div class="badge-toast-content">
      <div class="badge-toast-icon" style="color:${color}"><i class="fas fa-${icon}"></i></div>
      <div class="badge-toast-text">
        <div class="badge-toast-name">${escapeHtml(message)}</div>
      </div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

// ===== USERS / FRIENDS (via PHP) =====
const GOOGLE_USERS = [
  { name: "Samuel", email: "samuel@google.com", online: true, streak: 18, vibe: "Plastikfrei-Profi", points: 940 },
  { name: "Lea", email: "lea@google.com", online: true, streak: 14, vibe: "Bike Hero", points: 810 },
  { name: "Noah", email: "noah@google.com", online: false, streak: 9, vibe: "Cleanup King", points: 620 },
  { name: "Mia", email: "mia@google.com", online: true, streak: 21, vibe: "Tree Planter", points: 1180 }
];

const appUsers = [
  'Lena#308', 'Tom#114', 'Kira#889', 'David#221', 'Amir#664', 'Nora#450', 'Mila#740', 'Ben#932'
];
let lastQuickChatMatch = '';
let displayedFriends = [];
let currentChatFriend = null;

const container = document.getElementById('friends-list-container');
const friendRequestsContainer = document.getElementById('friend-requests-container');
const actionInfo = document.getElementById('friends-action-info');
const quickChatButton = document.getElementById('quick-chat-btn');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(value) {
  return /.+@.+\..+/.test(value);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadFriends() {
  if (!isLoggedIn()) {
    displayedFriends = GOOGLE_USERS.filter(u => u.email !== currentUser?.email).map(u => ({ ...u, isFriend: false }));
    renderFriends(displayedFriends);
    renderFriendRequests([]);
    updateActionInfo('Melde dich an, um Freunde hinzuzufügen und zu chatten.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/friends.php?action=list`, { credentials: 'same-origin' });
    const data = await res.json();
    const friends = data.friends || [];
    
    const res2 = await fetch(`${API_BASE}/profile.php?action=users`, { credentials: 'same-origin' });
    const data2 = await res2.json();
    let allUsers = (data2.users || []).map(u => ({
      ...u, isFriend: friends.some(f => normalizeEmail(f.email) === normalizeEmail(u.email))
    }));
    
    // Add hardcoded Google users
    GOOGLE_USERS.forEach(u => {
      if (!allUsers.some(x => normalizeEmail(x.email) === normalizeEmail(u.email))) {
        allUsers.push({ ...u, isFriend: false });
      }
    });
    
    displayedFriends = allUsers.filter(u => normalizeEmail(u.email) !== normalizeEmail(currentUser?.email));
    renderFriends(displayedFriends);
    
    const res3 = await fetch(`${API_BASE}/friends.php?action=requests`, { credentials: 'same-origin' });
    const data3 = await res3.json();
    renderFriendRequests(data3.requests || []);
    
    updateActionInfo('Wähle einen Kontakt oder sende eine Freundschaftsanfrage.');
  } catch (e) {
    console.error('Load friends failed:', e);
  }
}

function renderFriends(list) {
  if (!container) return;
  const loggedIn = isLoggedIn();
  container.innerHTML = '';
  list.forEach(friend => {
    const initials = (friend.name || '??').slice(0, 2).toUpperCase();
    const isFriend = !!friend.isFriend;
    const actionButton = isFriend
      ? '<span class="friend-badge">Freund</span>'
      : `<button class="add-friend-btn" data-friend-email="${friend.email}" ${loggedIn ? '' : 'disabled'}>Freund hinzufügen</button>`;
    const html = `
      <div class="friend-row ${friend.online ? 'is-online' : ''}" data-friend-email="${friend.email}">
        <div class="friend-avatar">${initials}</div>
        <div class="friend-meta">
          <span class="friend-name">${escapeHtml(friend.name)}</span>
          <span class="friend-vibe">${escapeHtml(friend.vibe || 'Verbinde dich')}</span>
        </div>
        <div class="friend-stats">
          <span class="friend-points">${friend.points || 0} pts</span>
          <span class="friend-streak"><i class="fas fa-fire"></i> ${friend.streak || 0}</span>
        </div>
        <div class="friend-actions">${actionButton}</div>
        <div class="online-indicator"></div>
      </div>`;
    container.innerHTML += html;
  });
}

function renderFriendRequests(requests) {
  if (!friendRequestsContainer) return;
  if (!requests || requests.length === 0) {
    friendRequestsContainer.innerHTML = '<p class="today-challenges-empty">Keine Anfragen.</p>';
    return;
  }
  friendRequestsContainer.innerHTML = requests.map(req => `
    <div class="friend-request-row" data-request-id="${req.id}">
      <div class="friend-request-meta">
        <strong>${escapeHtml(req.from_name)}</strong> (${escapeHtml(req.from_email)}) möchte dein Freund sein.
      </div>
      <div class="friend-request-actions">
        <button class="friend-request-action" data-action="accept" data-request-id="${req.id}">Annehmen</button>
        <button class="friend-request-action" data-action="decline" data-request-id="${req.id}">Ablehnen</button>
      </div>
    </div>
  `).join('');
}

function updateActionInfo(text) {
  if (actionInfo) actionInfo.textContent = text;
}

// Add friend by search
async function addUserBySearch(presetEmail) {
  const input = document.getElementById('friend-search-input');
  const query = presetEmail || input.value.trim();
  if (!query) return;
  if (!requireAuth('Freunde hinzuzufügen')) return;
  
  try {
    const res = await fetch(`${API_BASE}/friends.php?action=request`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: query })
    });
    const data = await res.json();
    if (data.error) { updateActionInfo(data.error); }
    else { updateActionInfo('Freundschaftsanfrage gesendet.'); }
  } catch (e) { updateActionInfo('Fehler beim Senden der Anfrage.'); }
  if (input) input.value = '';
}

// Handle friend request actions
async function handleFriendRequestAction(requestId, action) {
  if (!requireAuth('Anfragen zu beantworten')) return;
  try {
    const res = await fetch(`${API_BASE}/friends.php?action=respond`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, action })
    });
    await res.json();
    loadFriends();
  } catch (e) { console.error(e); }
}

// Quick chat
if (quickChatButton) {
  quickChatButton.addEventListener('click', () => {
    if (!requireAuth('den Schnellchat zu nutzen')) return;
    const randomUser = appUsers.filter(u => u !== lastQuickChatMatch);
    const pool = randomUser.length > 0 ? randomUser : appUsers;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastQuickChatMatch = picked;
    quickChatButton.classList.add('active');
    updateActionInfo(`Schnellchat: Verbunden mit ${picked}.`);
    openChat(picked);
  });
}

loadFriends();

// Friends click handlers
if (container) {
  container.addEventListener('click', async (event) => {
    const friendButton = event.target.closest('.add-friend-btn');
    if (friendButton) {
      addUserBySearch(friendButton.dataset.friendEmail);
      event.stopPropagation();
      return;
    }
    const row = event.target.closest('.friend-row');
    if (row) {
      const friendEmail = row.dataset.friendEmail;
      if (!requireAuth('Nachrichten zu senden')) return;
      openChat(friendEmail);
    }
  });
}

if (friendRequestsContainer) {
  friendRequestsContainer.addEventListener('click', (event) => {
    const requestButton = event.target.closest('.friend-request-action');
    if (!requestButton) return;
    handleFriendRequestAction(requestButton.dataset.requestId, requestButton.dataset.action);
  });
}

// ===== CHAT =====
function openChat(friendEmail) {
  if (!isLoggedIn()) return;
  currentChatFriend = friendEmail;
  document.getElementById('chat-friend-name').textContent = friendEmail;
  document.getElementById('chat-modal').style.display = 'flex';
  const chatMessagesEl = document.getElementById('chat-messages');
  chatMessagesEl.innerHTML = '<p class="today-challenges-empty">Lade Nachrichten...</p>';
  loadChatMessages();
  if (chatRefreshInterval) clearInterval(chatRefreshInterval);
  chatRefreshInterval = setInterval(loadChatMessages, 3000);
}

async function loadChatMessages() {
  if (!currentChatFriend || !isLoggedIn()) return;
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  try {
    const res = await fetch(`${API_BASE}/friends.php?action=chat_messages&friend=${encodeURIComponent(currentChatFriend)}`, { credentials: 'same-origin' });
    const data = await res.json();
    messagesContainer.innerHTML = '';
    if (!data.messages || data.messages.length === 0) {
      messagesContainer.innerHTML = '<p class="today-challenges-empty">Noch keine Nachrichten.</p>';
      return;
    }
    data.messages.forEach(msg => {
      const isOwn = msg.sender === currentUser?.email;
      addMessageToChat(msg.text, isOwn);
    });
  } catch (e) { console.error('Chat load failed:', e); }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-message-input');
  const message = input.value.trim();
  if (!message || !currentChatFriend || !isLoggedIn()) return;
  try {
    const res = await fetch(`${API_BASE}/friends.php?action=chat`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver: currentChatFriend, message })
    });
    const data = await res.json();
    if (data.success) {
      addMessageToChat(message, true);
      input.value = '';
    } else {
      updateActionInfo(data.error || 'Fehler beim Senden.');
    }
  } catch (e) { console.error(e); }
}

function addMessageToChat(text, isOwn) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${isOwn ? 'own' : ''}`;
  messageEl.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function closeChatModal() {
  document.getElementById('chat-modal').style.display = 'none';
  currentChatFriend = null;
  if (chatRefreshInterval) { clearInterval(chatRefreshInterval); chatRefreshInterval = null; }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey && document.getElementById('chat-modal').style.display !== 'none') {
    e.preventDefault();
    sendChatMessage();
  }
});

// ===== STREAK =====
let streakData = JSON.parse(localStorage.getItem('streakData')) || {
  count: 0, lastUpdated: null, lastUpdateDate: null, completedToday: false
};

function getToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function initializeStreakCounter() {
  const today = getToday();
  if (!streakData.lastUpdateDate) {
    streakData.count = isLoggedIn() && currentUser.streak ? currentUser.streak : 0;
    streakData.lastUpdateDate = today;
    streakData.completedToday = false;
    saveStreakData();
    return;
  }
  if (!isSameDay(streakData.lastUpdateDate, today) && !isPreviousDay(streakData.lastUpdateDate, today)) {
    streakData.count = isLoggedIn() && currentUser.streak ? currentUser.streak : 0;
    streakData.lastUpdateDate = today;
    streakData.completedToday = false;
    saveStreakData();
    return;
  }
  if (!isSameDay(streakData.lastUpdateDate, today)) {
    streakData.completedToday = false;
    saveStreakData();
  }
}

function isSameDay(d1, d2) { return d1 === d2; }
function isPreviousDay(d1, d2) {
  const date1 = new Date(d1), date2 = new Date(d2);
  const diff = (date2 - date1) / (1000 * 60 * 60 * 24);
  return diff >= 1 && diff < 2;
}

function saveStreakData() { localStorage.setItem('streakData', JSON.stringify(streakData)); }

function incrementStreak() {
  const today = getToday();
  if (streakData.completedToday && isSameDay(streakData.lastUpdateDate, today)) return false;
  streakData.count += 1;
  streakData.lastUpdated = new Date().toISOString();
  streakData.lastUpdateDate = today;
  streakData.completedToday = true;
  saveStreakData();
  displayStreak();
  return true;
}

function displayStreak() {
  const el = document.getElementById('streakCount');
  // Prefer server profile streak when logged in, otherwise use local streakData
  const value = isLoggedIn() ? (currentUser?.streak || 0) : (streakData.count || 0);
  if (el && value !== parseInt(el.textContent, 10)) {
    el.textContent = value;
    updateStreakFlameStage(value);
  }
}

// ===== POINTS =====
let userPoints = JSON.parse(localStorage.getItem('userPoints')) || { total: 0, completedTasks: [] };

function savePoints() { localStorage.setItem('userPoints', JSON.stringify(userPoints)); }

function addPoints(amount, taskName) {
  if (amount <= 0) return false;
  userPoints.total += amount;
  userPoints.completedTasks.push({ taskName, points: amount, completedAt: new Date().toISOString() });
  savePoints();
  updatePointsDisplay();
  return true;
}

function getPoints() { return userPoints.total; }

function updatePointsDisplay() {
  const pointsEl = document.getElementById('stat-points');
  if (pointsEl) {
    let pts = userPoints.total;
    if (isLoggedIn() && currentUser?.points > pts) {
      pts = currentUser.points;
      userPoints.total = pts;
      savePoints();
    }
    pointsEl.textContent = pts;
  }
}

function updateStreakDisplay() {
  if (isLoggedIn() && currentUser) {
    const el = document.getElementById('streak-days');
    if (el) el.textContent = (currentUser.streak || 0) + ' TAGE';
    document.getElementById('streakCount').textContent = currentUser.streak || 0;
    updateStreakFlameStage(currentUser.streak || 0);
  }
}

// ===== TASKS =====
let allTasks = { weekly: [], daily: [] };
let currentTask = null;
let acceptedTasks = JSON.parse(localStorage.getItem('acceptedTasks')) || [];
let taskCard = null;
let swipeStartX = 0, swipeCurrentX = 0, isDraggingTaskCard = false;
const SWIPE_THRESHOLD = 100, SWIPE_MAX_ROTATION = 12;
let decisionFeedbackTimeout = null;

function normalizeTaskName(taskName) { return (taskName || '').trim().toLowerCase(); }

function saveAcceptedTasks() { localStorage.setItem('acceptedTasks', JSON.stringify(acceptedTasks)); }

function removeEvidence(uploadId) {
  const parts = uploadId.split('_');
  if (parts.length < 3) return;
  const taskName = parts.slice(0, -2).join('_');
  const imageIndex = parseInt(parts[parts.length - 2]);
  const timestamp = parts[parts.length - 1];
  const taskIndex = acceptedTasks.findIndex(task => task.task === taskName && task.proofUploadedAt === timestamp);
  if (taskIndex === -1) return;
  const task = acceptedTasks[taskIndex];
  if (!task.proofFileDatas || task.proofFileDatas.length <= imageIndex) return;
  task.proofFileDatas.splice(imageIndex, 1);
  if (task.proofFileNames && task.proofFileNames.length > imageIndex) task.proofFileNames.splice(imageIndex, 1);
  if (task.proofFileDatas.length === 0) {
    delete task.proofUploadedAt; delete task.proofFileNames; delete task.proofFileDatas;
  }
  saveAcceptedTasks();
  loadRecentUploads();
}

function loadRecentUploads() {
  const allUploads = [];
  acceptedTasks.forEach(task => {
    if (task.proofFileDatas && task.proofUploadedAt) {
      task.proofFileDatas.forEach((data, index) => {
        allUploads.push({
          data, name: task.proofFileNames ? task.proofFileNames[index] : 'Upload',
          task: task.task, uploadedAt: task.proofUploadedAt,
          id: `${task.task}_${index}_${task.proofUploadedAt}`
        });
      });
    }
  });
  allUploads.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const recentUploads = allUploads.slice(0, 3);
  const proofGallery = document.querySelector('.proof-gallery');
  if (!proofGallery) return;
  proofGallery.innerHTML = '';
  if (recentUploads.length === 0) {
    proofGallery.innerHTML = `
      <div class="proof-empty-state">
        <div class="proof-empty-icon"><i class="fas fa-image"></i></div>
        <div class="proof-empty-message">Keine Beweise vorhanden</div>
        <div class="proof-empty-subtitle">Füge ein Bild zu deinen Challenges hinzu</div>
      </div>`;
    return;
  }
  recentUploads.forEach(upload => {
    const item = document.createElement('div');
    item.className = 'proof-miniature';
    item.innerHTML = `
      <div class="proof-miniature-container">
        <img src="${upload.data}" alt="User upload" class="proof-miniature-img">
        <button class="proof-remove-btn" data-upload-id="${upload.id}" title="Entfernen"><i class="fas fa-times"></i></button>
      </div>`;
    proofGallery.appendChild(item);
  });
  proofGallery.addEventListener('click', function(e) {
    const removeBtn = e.target.closest('.proof-remove-btn');
    if (removeBtn) { e.preventDefault(); const id = removeBtn.getAttribute('data-upload-id'); if (id) removeEvidence(id); }
  });
}

function isTaskAlreadyAccepted(taskName) {
  return acceptedTasks.some(task => normalizeTaskName(task.task) === normalizeTaskName(taskName));
}

function removeTaskFromTaskSection(taskName) {
  const normalizedName = normalizeTaskName(taskName);
  document.querySelectorAll('#tasks .task-card').forEach(card => {
    const title = card.querySelector('.task-title')?.textContent || '';
    const btnTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
    if (normalizeTaskName(title) === normalizedName || normalizeTaskName(btnTask) === normalizedName) {
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
    ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${proofFileNames.length || proofFileDatas.length} Beweis${proofFileDatas.length > 1 ? 'e' : ''} hochgeladen</p>`
    : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
  const proofImage = proofFileDatas.length > 0
    ? `<div class="today-proof-image-container">${proofFileDatas.map(d => `<img src="${d}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
    : '';
  const uploadButton = isCompleted ? '' : `<button class="accepted-task-btn task-proof-upload-btn" type="button" data-task-key="${escapeHtml(challengeKey)}"><i class="fas fa-upload"></i> Beweis hochladen</button>`;
  const confirmButton = proofFileDatas.length > 0 && !isCompleted
    ? `<button class="accepted-task-btn task-proof-confirm-btn" type="button" data-task-key="${escapeHtml(challengeKey)}"><i class="fas fa-check"></i> Punkte bestätigen</button>`
    : '';
  const proofInput = isCompleted ? '' : `<input class="task-proof-upload-input" type="file" accept="image/*" multiple data-task-key="${escapeHtml(challengeKey)}">`;
  const completionNotice = isCompleted ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>' : '';
  return `
    <div class="accepted-task-inner">
      <div class="accepted-task-icon"><i class="${task.icon || 'fas fa-check'}"></i></div>
      <h3 class="accepted-task-title">${escapeHtml(task.task)}</h3>
      <div class="accepted-task-proof-area">${proofImage}${uploadState}${completionNotice}${uploadButton}${proofInput}${confirmButton}</div>
      <div class="accepted-task-actions"><span class="accepted-task-btn" role="note"><i class="fas fa-star"></i> ${points} Punkte warten auf Bestätigung</span></div>
    </div>`;
}

function getAcceptedTaskKey(task) {
  return `${normalizeTaskName(task.task)}|${task.acceptedDate || ''}`;
}

function renderAcceptedTaskSection() {
  const taskSection = document.getElementById('tasks');
  if (!taskSection) return;
  taskSection.querySelectorAll('.accepted-task-clone').forEach(c => c.remove());
  acceptedTasks.forEach(task => {
    const normalizedName = normalizeTaskName(task.task);
    document.querySelectorAll('#tasks .task-card:not(.accepted-task-clone)').forEach(card => {
      const title = card.querySelector('.task-title')?.textContent || '';
      const btnTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
      if (normalizeTaskName(title) !== normalizedName && normalizeTaskName(btnTask) !== normalizedName) return;
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
  document.querySelectorAll('#tasks .task-card[style*="display: none"]').forEach(card => {
    const title = card.querySelector('.task-title')?.textContent || '';
    const btnTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
    if (normalizeTaskName(title) === normalizedName || normalizeTaskName(btnTask) === normalizedName) {
      card.style.display = '';
    }
  });
}

function renderTodayChallenges() {
  const list = document.getElementById('todayChallengesList');
  if (!list) return;
  const today = getToday();
  const todayTasks = acceptedTasks.filter(task => {
    if (!task.acceptedDate) return false;
    const d = new Date(task.acceptedDate);
    if (Number.isNaN(d.getTime())) return false;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return key === today;
  });
  if (todayTasks.length === 0) { list.innerHTML = '<p class="today-challenges-empty">Noch keine Aufgabe akzeptiert.</p>'; return; }
  list.innerHTML = todayTasks.map((task, index) => {
    const challengeKey = getAcceptedTaskKey(task);
    const uploadState = task.proofFileNames && task.proofFileNames.length > 0
      ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${task.proofFileNames.length} Beweis${task.proofFileNames.length > 1 ? 'e' : ''} hochgeladen</p>`
      : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
    const proofImage = task.proofFileDatas && task.proofFileDatas.length > 0
      ? `<div class="today-proof-image-container">${task.proofFileDatas.map(d => `<img src="${d}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
      : '';
    const uploadButton = task.isCompleted ? '' : `<button class="btn-primary btn-challenge today-challenge-upload-btn" type="button" data-challenge-index="${index}"><i class="fas fa-upload"></i> Beweis hochladen</button>`;
    const confirmButton = task.proofFileData && !task.isCompleted
      ? `<button class="btn-primary btn-challenge today-challenge-confirm-btn" type="button" data-challenge-index="${index}" data-challenge-key="${escapeHtml(challengeKey)}"><i class="fas fa-check"></i> Hochladen bestätigen</button>`
      : '';
    const acceptedButton = !task.isCompleted && !task.proofFileData
      ? `<button class="btn-primary btn-challenge today-challenge-accepted-btn" type="button" disabled><i class="fas fa-check"></i> Akzeptiert</button>`
      : '';
    const completionNotice = task.isCompleted ? `<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>` : '';
    const proofInput = task.isCompleted ? '' : `<input class="today-challenge-upload-input" type="file" accept="image/*" multiple data-challenge-index="${index}" data-challenge-key="${escapeHtml(challengeKey)}">`;
    const displayPoints = task.points || 50;
    const isDailyClass = task.isDaily ? 'is-daily-challenge' : '';
    const dailyBadge = task.isDaily ? `<span class="streak-badge-label"><i class="fas fa-fire"></i> Streak-Erhaltung</span>` : '';
    return `<div class="today-challenge-card glassmorphism ${isDailyClass}">
      <div class="challenge-header"><div style="display:flex;align-items:center;gap:1rem;"><div class="challenge-icon"><i class="${task.icon || 'fas fa-recycle'}"></i></div><span class="challenge-label">Heutige Challenge</span></div>${dailyBadge}</div>
      <h2 class="challenge-title">${escapeHtml(task.task)}</h2>
      <div class="challenge-description"><p>Diese Aufgabe wurde von dir akzeptiert und wartet jetzt auf Erledigung.</p></div>
      <div class="challenge-reward"><div class="reward-item"><i class="fas fa-star"></i><span>${displayPoints} Punkte</span></div></div>
      ${proofImage}${uploadState}${completionNotice}${acceptedButton}${uploadButton}${proofInput}${confirmButton}
    </div>`;
  }).join('');
}

async function saveProofUpload(challengeKey, fileNames, fileDatas) {
  const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
  if (taskIndex === -1) return;
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  if (!Array.isArray(fileDatas)) fileDatas = [fileDatas];
  acceptedTasks[taskIndex].proofFileNames = fileNames;
  acceptedTasks[taskIndex].proofFileDatas = fileDatas;
  acceptedTasks[taskIndex].proofUploadedAt = new Date().toISOString();
  saveAcceptedTasks();
  loadRecentUploads();
  renderDailyChallengeCard();
  renderAcceptedTaskSection();

  // If logged in and task was created on server, upload proof to API
  const serverId = acceptedTasks[taskIndex].serverId || acceptedTasks[taskIndex].server_id || acceptedTasks[taskIndex].id;
  if (isLoggedIn() && serverId) {
    const res = await apiUploadProof(serverId, fileNames, fileDatas);
    if (res && res.success) {
      await refreshProfile();
    } else {
      console.error('Server proof upload failed', res);
    }
  }
}

async function confirmTaskProof(challengeKey) {
  const taskIndex = acceptedTasks.findIndex(task => getAcceptedTaskKey(task) === challengeKey);
  if (taskIndex === -1) return;
  const task = acceptedTasks[taskIndex];
  if (!task.proofFileDatas || task.proofFileDatas.length === 0 || task.isCompleted) return;

  // If logged in and task exists on server, call complete API
  const serverId = task.serverId || task.server_id || task.id;
  if (isLoggedIn() && serverId) {
    const res = await apiCompleteTask(serverId);
    if (res && res.success) {
      // server awarded points and updated streak; refresh profile
      await refreshProfile();
    } else {
      console.error('Server complete task failed', res);
      // don't block local update - fallback to local
    }
  }

  task.isCompleted = true;
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  let points = 0;
  if (task.points) points = parseInt(task.points, 10);
  else {
    const found = (allTasks.weekly || []).concat(allTasks.daily || []).find(t => normalizeTaskName(t.task) === normalizeTaskName(task.task));
    if (found) { const m = JSON.stringify(found).match(/(\d+)\s*(?:Punkte|points)/i); points = m ? parseInt(m[1], 10) : 0; }
  }
  if (points > 0) addPoints(points, task.task);
  if (task.isDaily) incrementStreak();
  saveAcceptedTasks();
  renderTodayChallenges();
  renderDailyChallengeCard();
  renderAcceptedTaskSection();
}

function syncAcceptedTasksToUI() {
  document.querySelectorAll('#tasks .task-card').forEach(c => c.style.display = '');
  document.querySelectorAll('#tasks .accepted-task-clone').forEach(c => c.remove());
  acceptedTasks.forEach(task => removeTaskFromTaskSection(task.task));
  renderAcceptedTaskSection();
  renderTodayChallenges();
}

async function loadTasks() {
  try {
    const response = await fetch(`${API_BASE}/tasks.php?action=available`);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error ${response.status}: ${errorBody}`);
    }
    allTasks = await response.json();
    loadDailyTask();
  } catch (error) {
    console.error('Fehler beim Laden der Tasks:', error);
    // Fallback to JSON file if API fails
    try {
      const response = await fetch('../../assets/tasks.json');
      allTasks = await response.json();
      loadDailyTask();
    } catch (error2) {
      console.error('Fallback zu JSON auch fehlgeschlagen:', error2);
    }
  }
  syncAcceptedTasksToUI();
}

function getDailyTask() {
  const dailyTasks = allTasks.daily || [];
  if (dailyTasks.length === 0) return null;
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const hash = hashCode(dateString);
  return dailyTasks[Math.abs(hash) % dailyTasks.length];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); hash = ((hash << 5) - hash) + c; hash = hash & hash; }
  return hash;
}

function loadDailyTask() { renderDailyChallengeCard(); }

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getAcceptedDailyTaskForToday() {
  const todayKey = getTodayKey();
  return acceptedTasks.find(task => task.isDaily && task.acceptedDate && task.acceptedDate.startsWith(todayKey)) || null;
}

function renderDailyChallengeCard() {
  const dailyTask = getDailyTask();
  if (!dailyTask) return;
  const accepted = getAcceptedDailyTaskForToday();
  displayDailyChallenge(accepted || dailyTask, !!accepted);
}

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
  if (descEl) descEl.textContent = isAccepted ? 'Lade jetzt ein Bild als Beweis hoch und bestätige die Tages-Challenge.' : 'Erledige diese tägliche Aufgabe und verdiene dir Punkte!';
  if (iconEl && task.icon) iconEl.className = task.icon;
  if (btnEl) {
    if (isCompleted) { btnEl.innerHTML = '<i class="fas fa-check"></i> Abgeschlossen'; btnEl.disabled = true; btnEl.classList.add('accepted'); }
    else if (isAccepted) { btnEl.innerHTML = '<i class="fas fa-check"></i> Akzeptiert'; btnEl.disabled = true; btnEl.classList.add('accepted'); }
    else { btnEl.innerHTML = '<i class="fas fa-arrow-right"></i> Challenge starten'; btnEl.disabled = false; btnEl.classList.remove('accepted'); }
  }
  if (!proofArea) return;
  if (!isAccepted) { proofArea.innerHTML = ''; return; }
  const uploadState = proofFileDatas.length > 0
    ? `<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ${proofFileNames.length || proofFileDatas.length} Beweis${proofFileDatas.length > 1 ? 'e' : ''} hochgeladen</p>`
    : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
  const proofImage = proofFileDatas.length > 0
    ? `<div class="today-proof-image-container">${proofFileDatas.map(d => `<img src="${d}" alt="Beweis-Foto" class="today-proof-image">`).join('')}</div>`
    : '';
  const uploadButton = isCompleted ? '' : `<button class="btn-primary btn-challenge today-challenge-upload-btn daily-challenge-upload-btn" type="button" data-challenge-key="${escapeHtml(challengeKey)}"><i class="fas fa-upload"></i> Beweis hochladen</button>`;
  const confirmButton = proofFileDatas.length > 0 && !isCompleted
    ? `<button class="btn-primary btn-challenge today-challenge-confirm-btn daily-challenge-confirm-btn" type="button" data-challenge-key="${escapeHtml(challengeKey)}"><i class="fas fa-check"></i> Hochladen bestätigen</button>`
    : '';
  const proofInput = isCompleted ? '' : `<input class="today-challenge-upload-input daily-challenge-upload-input" type="file" accept="image/*" multiple id="dailyChallengeUploadInput" data-challenge-key="${escapeHtml(challengeKey)}">`;
  const completionNotice = isCompleted ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>' : '';
  proofArea.innerHTML = `${proofImage}${uploadState}${completionNotice}${uploadButton}${proofInput}${confirmButton}`;
}

// ===== SWIPE TASK =====
function loadRandomTask() {
  // Swipe task functionality
}

function acceptTask() {
  if (currentTask) {
    if (isTaskAlreadyAccepted(currentTask.task)) {
      alert('Diese Aufgabe hast du bereits angenommen.');
      loadRandomTask();
      return;
    }
    const taskWithDate = { ...currentTask, acceptedDate: new Date().toISOString(), status: 'active' };
    acceptedTasks.push(taskWithDate);
    saveAcceptedTasks();
    removeTaskFromTaskSection(currentTask.task);
    renderTodayChallenges();
    showTaskDecisionFeedback('accept');
    setTimeout(loadRandomTask, 700);
  }
}

function denyTask() {
  showTaskDecisionFeedback('deny');
  setTimeout(loadRandomTask, 700);
}

function showTaskDecisionFeedback(type) {
  if (!taskCard) return;
  let feedback = document.getElementById('taskDecisionFeedback');
  if (!feedback) { feedback = document.createElement('div'); feedback.id = 'taskDecisionFeedback'; feedback.className = 'task-decision-feedback'; taskCard.appendChild(feedback); }
  let flash = document.getElementById('taskDecisionFlash');
  if (!flash) { flash = document.createElement('div'); flash.id = 'taskDecisionFlash'; flash.className = 'task-decision-flash'; taskCard.appendChild(flash); }
  const isAccept = type === 'accept';
  feedback.innerHTML = isAccept ? '<i class="fas fa-check-circle"></i> GEMACHT' : '<i class="fas fa-times-circle"></i> NICHT GEMACHT';
  feedback.classList.remove('accept', 'deny', 'show');
  flash.classList.remove('accept', 'deny', 'show');
  taskCard.classList.remove('decision-accept', 'decision-deny');
  void feedback.offsetWidth;
  feedback.classList.add(isAccept ? 'accept' : 'deny', 'show');
  flash.classList.add(isAccept ? 'accept' : 'deny', 'show');
  taskCard.classList.add(isAccept ? 'decision-accept' : 'decision-deny');
  clearTimeout(decisionFeedbackTimeout);
  decisionFeedbackTimeout = setTimeout(() => {
    feedback.classList.remove('show'); flash.classList.remove('show');
    taskCard.classList.remove('decision-accept', 'decision-deny');
  }, 900);
}

// ===== RENDER PROFILE =====
function renderProfile() {
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  const locationEl = document.getElementById('user-location');
  const loginBtn = document.getElementById('showLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const googleSignIn = document.querySelector('.g_id_signin');
  const googleOnload = document.getElementById('g_id_onload');
  
  if (!isLoggedIn()) {
    if (nameEl) nameEl.textContent = 'Nicht angemeldet';
    if (avatarEl) avatarEl.src = 'avatar.png';
    if (locationEl) locationEl.textContent = 'ORGANISATION';
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.disabled = true;
    if (googleSignIn) googleSignIn.style.display = 'none';
    if (googleOnload) googleOnload.style.display = 'none';
    document.getElementById('streak-days').textContent = '0 TAGE';
    return;
  }
  
  if (nameEl) nameEl.textContent = currentUser.name;
  if (avatarEl) avatarEl.src = currentUser.picture || 'avatar.png';
  if (locationEl) locationEl.textContent = currentUser.email;
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.disabled = false;
  if (googleSignIn) googleSignIn.style.display = 'none';
  if (googleOnload) googleOnload.style.display = 'none';
  document.getElementById('streak-days').textContent = (currentUser.streak || 0) + ' TAGE';
  
  // Update stats
  document.getElementById('stat-points').textContent = currentUser.points || 0;
  document.getElementById('stat-trash').textContent = (currentUser.total_trash_kg || 0) + ' kg';
  document.getElementById('stat-water').textContent = (currentUser.total_water_l || 0) + ' L';
  document.getElementById('profile-level').textContent = 'Level ' + (currentUser.level || 1);
  document.getElementById('profile-level-title').textContent = currentUser.level_title || 'Green Seed';
  
  // XP progress
  const xp = currentUser.xp || 0;
  const xpForNext = (currentUser.level || 1) * 100;
  document.getElementById('level-progress-text').textContent = xp + ' / ' + xpForNext + ' XP';
  document.getElementById('level-progress-fill').style.width = Math.min(100, (xp / xpForNext) * 100) + '%';
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', async () => {
  // Setup auth modal
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
      document.getElementById('authErrorMessage').style.display = 'none';
    });
  });
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('showLoginBtn').addEventListener('click', showAuthModal);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.querySelector('.logout-link').addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
  
  // Close auth modal on overlay click
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideAuthModal();
  });
  
  // Check auth status
  await checkAuth();
  
  // Initialize
  initializeStreakCounter();
  displayStreak();
  
  if (streakCountEl) animateCounter(streakCountEl, streakData.count, 2000);
  
  // Animate counters
  const globalWasteEl = document.getElementById('globalWaste');
  if (globalWasteEl) animateCounter(globalWasteEl, 2847, 2500);
  const activeUsersEl = document.getElementById('activeUsers');
  if (activeUsersEl) animateCounter(activeUsersEl, 1204, 2500);
  
  // Daily challenge start
  document.getElementById('startChallengeBtn')?.addEventListener('click', () => {
    if (!requireAuth('Challenges zu starten')) return;
    const dailyTask = getDailyTask();
    if (!dailyTask) return;
    const todayKey = getTodayKey();
    if (acceptedTasks.some(t => t.isDaily && t.acceptedDate && t.acceptedDate.startsWith(todayKey))) return;
    const task = { id: Date.now(), task: dailyTask.task, icon: dailyTask.icon, acceptedDate: new Date().toISOString(), status: 'accepted', isDaily: true };
    acceptedTasks.push(task);
    saveAcceptedTasks();
    localStorage.setItem('ecoLastDailyChallengeDate', todayKey);
    renderDailyChallengeCard();
    renderTodayChallenges();
  });
  
  updateTimer();
  setInterval(updateTimer, 60000);
  observeStatsAnimation();
  const savedDarkMode = localStorage.getItem('ecoDarkMode') === '1';
  initializeDarkMode(savedDarkMode);
});

function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const inc = target / (duration / 16);
  const timer = setInterval(() => {
    current += inc;
    if (current >= target) { current = target; clearInterval(timer); }
    element.textContent = Math.floor(current);
  }, 16);
}

function updateTimer() {
  const timerFill = document.querySelector('.timer-fill');
  const timerTime = document.querySelector('.timer-time');
  if (timerFill && timerTime) {
    const now = new Date();
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59);
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
      if (entry.isIntersecting) { entry.target.style.animation = 'slideInUp 0.6s ease-out'; observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  observer.observe(statsCounter);
}

// ===== HOME JS =====
let homeSection = document.getElementById('home');
let tasksSection = document.getElementById('tasks');
let friendsSection = document.getElementById('friends');
let profileSection = document.getElementById('profile');

function updateActPage(page) {
  const appHeader = document.getElementById('appHeader');
  switch(page) {
    case 'home':
      friendsSection.style.display = 'none'; profileSection.style.display = 'none'; tasksSection.style.display = 'none';
      homeSection.style.display = 'flex';
      appHeader.innerHTML = `
        <div class="header-content">
          <div class="header-left"><button class="icon-btn dark-mode-toggle" id="darkModeToggle" title="Dark Mode"><i class="fas fa-moon" id="darkModeIcon"></i></button></div>
          <div class="header-center"><img src="../main/img/logo.png" alt="Leaf Logo" class="logo-image"></div>
          <div class="header-right"><button class="icon-btn notification-btn" title="Benachrichtigungen"><i class="fas fa-bell-slash notification-icon"></i></button></div>
        </div>
        <div class="bottom-bar"></div>`;
      break;
    case 'tasks':
      homeSection.style.display = 'none'; friendsSection.style.display = 'none'; profileSection.style.display = 'none';
      tasksSection.style.display = 'block'; appHeader.innerHTML = '';
      break;
    case 'friends':
      homeSection.style.display = 'none'; profileSection.style.display = 'none'; tasksSection.style.display = 'none';
      friendsSection.style.display = 'block'; appHeader.innerHTML = '';
      break;
    case 'profile':
      homeSection.style.display = 'none'; friendsSection.style.display = 'none'; tasksSection.style.display = 'none';
      profileSection.style.display = 'block'; appHeader.innerHTML = '';
      break;
  }
}

// ===== EVENT DELEGATION =====
document.addEventListener('click', function(e) {
  // Upload buttons
  const dailyUploadBtn = e.target.closest('.daily-challenge-upload-btn');
  if (dailyUploadBtn) { if (!requireAuth('Beweise hochzuladen')) return; const input = document.getElementById('dailyChallengeUploadInput'); if (input) input.click(); return; }
  
  const dailyConfirmBtn = e.target.closest('.daily-challenge-confirm-btn');
  if (dailyConfirmBtn) { if (!requireAuth('Aufgaben zu bestätigen')) return; const key = dailyConfirmBtn.getAttribute('data-challenge-key'); if (key) confirmTaskProof(key); return; }
  
  const taskUploadBtn = e.target.closest('.task-proof-upload-btn');
  if (taskUploadBtn) { if (!requireAuth('Beweise hochzuladen')) return; const key = taskUploadBtn.getAttribute('data-task-key'); const input = taskUploadBtn.closest('.accepted-task-clone')?.querySelector(`.task-proof-upload-input[data-task-key="${key}"]`); if (input) input.click(); return; }
  
  const taskConfirmBtn = e.target.closest('.task-proof-confirm-btn');
  if (taskConfirmBtn) { if (!requireAuth('Aufgaben zu bestätigen')) return; const key = taskConfirmBtn.getAttribute('data-task-key'); if (key) confirmTaskProof(key); return; }
  
  const uploadBtn = e.target.closest('.today-challenge-upload-btn');
  if (uploadBtn) { if (!requireAuth('Beweise hochzuladen')) return; const idx = uploadBtn.getAttribute('data-challenge-index'); const input = document.querySelector(`.today-challenge-upload-input[data-challenge-index="${idx}"]`); if (input) input.click(); return; }
  
  const confirmBtn = e.target.closest('.today-challenge-confirm-btn');
  if (confirmBtn) { if (!requireAuth('Aufgaben zu bestätigen')) return; const key = confirmBtn.getAttribute('data-challenge-key'); if (key) confirmTaskProof(key); return; }
  
  // Task accept button - requires auth!
  const btn = e.target.closest('.task-accept-btn');
  if (btn) {
    (async () => {
      if (!requireAuth('Aufgaben anzunehmen')) return;
      const taskName = btn.getAttribute('data-task');
      const taskIcon = btn.getAttribute('data-icon');
      if (isTaskAlreadyAccepted(taskName)) {
        removeTaskFromTaskSection(taskName);
        renderAcceptedTaskSection();
        renderTodayChallenges();
        return;
      }
      const taskCard = btn.closest('.task-card');
      let points = 0;
      if (taskCard) {
        const pointsText = taskCard.querySelector('.task-points')?.textContent || '';
        const m = pointsText.match(/(\d+)\s*Punkte/);
        if (m) points = parseInt(m[1], 10);
      }

      if (isLoggedIn()) {
        const res = await apiAcceptTask(taskName, taskIcon, points, 0);
        if (res && !res.error && res.task && res.task.id) {
          const serverId = res.task.id;
          const task = { id: Date.now(), serverId, task: taskName, icon: taskIcon, points, acceptedDate: new Date().toISOString(), status: 'accepted' };
          acceptedTasks.push(task);
          saveAcceptedTasks();
          renderAcceptedTaskSection();
          renderTodayChallenges();
          await refreshProfile();
          return;
        } else {
          console.error('API accept failed', res);
          // fallback to local accept
        }
      }

      // Local fallback (not logged in or API failed)
      const task = { id: Date.now(), task: taskName, icon: taskIcon, points, acceptedDate: new Date().toISOString(), status: 'accepted' };
      acceptedTasks.push(task);
      saveAcceptedTasks();
      renderAcceptedTaskSection();
      renderTodayChallenges();
    })();
  }
});

document.addEventListener('change', function(e) {
  const taskUploadInput = e.target.closest('.task-proof-upload-input');
  if (taskUploadInput) { handleFileUpload(taskUploadInput); return; }
  const dailyUploadInput = e.target.closest('.daily-challenge-upload-input');
  if (dailyUploadInput) { handleFileUpload(dailyUploadInput); return; }
  const uploadInput = e.target.closest('.today-challenge-upload-input');
  if (uploadInput) { handleFileUpload(uploadInput); }
});

function handleFileUpload(input) {
  const files = input.files;
  if (!files || files.length === 0) return;
  const challengeKey = input.getAttribute('data-task-key') || input.getAttribute('data-challenge-key') || '';
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
        renderDailyChallengeCard();
        renderTodayChallenges();
        loadRecentUploads();
      }
    };
    reader.readAsDataURL(file);
  }
}

// ===== INIT =====
loadTasks();
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('home');
  updateActPage('home');
});