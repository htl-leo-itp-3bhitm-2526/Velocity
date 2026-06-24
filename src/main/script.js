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
      refreshVisualStats();
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
      refreshVisualStats();
    }
  } catch (e) { console.error('refreshProfile failed', e); }
}

function refreshVisualStats() {
  // Aktualisiert ALLE sichtbaren Stats auf Home + Profil Seite
  if (!currentUser) return;
  
  // Streak auf Homepage (Flamme + Zahl)
  var sc = document.getElementById('streakCount');
  if (sc) sc.textContent = currentUser.streak || 0;
  updateStreakFlameStage(currentUser.streak || 0);
  
  // "X TAGE" im Profil
  var sd = document.getElementById('streak-days');
  if (sd) sd.textContent = (currentUser.streak || 0) + ' TAGE';
  
  // Punkte
  var sp = document.getElementById('stat-points');
  if (sp) sp.textContent = currentUser.points || 0;
  
  // Müll + Wasser
  var st = document.getElementById('stat-trash');
  if (st) st.textContent = (currentUser.total_trash_kg || 0) + ' kg';
  var sw = document.getElementById('stat-water');
  if (sw) sw.textContent = (currentUser.total_water_l || 0) + ' L';
  
  // Level
  var pl = document.getElementById('profile-level');
  if (pl) pl.textContent = 'Level ' + (currentUser.level || 1);
  var plt = document.getElementById('profile-level-title');
  if (plt) plt.textContent = currentUser.level_title || 'Green Seed';
  
  // XP Fortschritt
  var xp = currentUser.xp || 0;
  var xpNeeded = (currentUser.level || 1) * 100;
  var lpt = document.getElementById('level-progress-text');
  if (lpt) lpt.textContent = xp + ' / ' + xpNeeded + ' XP';
  var lpf = document.getElementById('level-progress-fill');
  if (lpf) lpf.style.width = Math.min(100, (xp / xpNeeded) * 100) + '%';
}

// Fetch user's accepted tasks from API (server-backed)
async function fetchMyTasks() {
  acceptedTasks = [];
  if (!isLoggedIn()) {
    renderAcceptedTaskSection();
    renderTodayChallenges();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/tasks.php?action=my_tasks`, { credentials: 'same-origin' });
    const data = await res.json();
    if (data && Array.isArray(data.tasks)) {
      acceptedTasks = data.tasks.map(t => ({
        id: Date.now() + Math.floor(Math.random()*1000),
        serverId: t.id,
        task: t.task_name,
        icon: t.task_icon,
        points: t.points,
        isDaily: t.is_daily,
        status: t.status,
        acceptedDate: t.accepted_date,
        completedAt: t.completed_date,
        proofUploadedAt: t.proof_uploaded_at
      }));
    }
  } catch (e) { console.error('fetchMyTasks failed', e); }
  renderAcceptedTaskSection();
  renderTodayChallenges();
  loadRecentUploads();
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
  if (!email || !password) { showAuthError('Bitte alle Felder ausf\u00fcllen.'); return; }
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
      await refreshProfile();
      await fetchMyTasks();
      await loadTasks();
      loadFriends();
      showToast('Erfolgreich angemeldet!', 'success');
    }
  } catch (e) { showAuthError('Verbindungsfehler zum Server.'); }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  if (!name || !email || !password) { showAuthError('Bitte alle Felder ausf\u00fcllen.'); return; }
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
      await refreshProfile();
      await fetchMyTasks();
      await loadTasks();
      loadFriends();
      showToast('Registrierung erfolgreich!', 'success');
    }
  } catch (e) { showAuthError('Verbindungsfehler zum Server.'); }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth.php?action=logout`, { credentials: 'same-origin' });
    currentUser = null;
    acceptedTasks = [];
    renderAcceptedTaskSection();
    renderTodayChallenges();
    renderProfile();
    loadFriends();
    await loadTasks();
    showToast('Abgemeldet.', 'info');
  } catch (e) { console.error('Logout failed:', e); }
}

async function handleCredentialResponse(response) {
  let data = JSON.parse(atob(response.credential.split('.')[1]));
  try {
    const res = await fetch(`${API_BASE}/auth.php?action=login`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, name: data.name, picture: data.picture })
    });
    const result = await res.json();
    if (result.success) {
      currentUser = result.user;
      hideAuthModal();
      await refreshProfile();
      await fetchMyTasks();
      await loadTasks();
      loadFriends();
      showToast('Mit Google angemeldet!', 'success');
    }
  } catch (e) { showAuthError('Google-Login fehlgeschlagen.'); }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type) {
  if (!type) type = 'info';
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'badge-toast show';
  const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  const color = type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3';
  toast.innerHTML = '<div class="badge-toast-content"><div class="badge-toast-icon" style="color:' + color + '"><i class="fas fa-' + icon + '"></i></div><div class="badge-toast-text"><div class="badge-toast-name">' + escapeHtml(message) + '</div></div></div>';
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 4000);
}

// ===== USERS / FRIENDS (via PHP) =====
const GOOGLE_USERS = [
  { name: "Samuel", email: "samuel@google.com", online: true, streak: 18, vibe: "Plastikfrei-Profi", points: 940 },
  { name: "Lea", email: "lea@google.com", online: true, streak: 14, vibe: "Bike Hero", points: 810 },
  { name: "Noah", email: "noah@google.com", online: false, streak: 9, vibe: "Cleanup King", points: 620 },
  { name: "Mia", email: "mia@google.com", online: true, streak: 21, vibe: "Tree Planter", points: 1180 }
];

const appUsers = ['Lena#308', 'Tom#114', 'Kira#889', 'David#221', 'Amir#664', 'Nora#450', 'Mila#740', 'Ben#932'];
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
    updateActionInfo('Melde dich an, um Freunde hinzuzuf\u00fcgen und zu chatten.');
    return;
  }
  try {
    const res = await fetch(API_BASE + '/friends.php?action=list', { credentials: 'same-origin' });
    const data = await res.json();
    const friends = data.friends || [];
    const res2 = await fetch(API_BASE + '/profile.php?action=users', { credentials: 'same-origin' });
    const data2 = await res2.json();
    var allUsers = (data2.users || []).map(function(u) {
      return Object.assign({}, u, { isFriend: friends.some(function(f) { return normalizeEmail(f.email) === normalizeEmail(u.email); }) });
    });
    GOOGLE_USERS.forEach(function(u) {
      if (!allUsers.some(function(x) { return normalizeEmail(x.email) === normalizeEmail(u.email); })) {
        allUsers.push(Object.assign({}, u, { isFriend: false }));
      }
    });
    displayedFriends = allUsers.filter(function(u) { return normalizeEmail(u.email) !== normalizeEmail(currentUser?.email); });
    renderFriends(displayedFriends);
    const res3 = await fetch(API_BASE + '/friends.php?action=requests', { credentials: 'same-origin' });
    const data3 = await res3.json();
    renderFriendRequests(data3.requests || []);
    updateActionInfo('W\u00e4hle einen Kontakt oder sende eine Freundschaftsanfrage.');
  } catch (e) { console.error('Load friends failed:', e); }
}

function renderFriends(list) {
  if (!container) return;
  const loggedIn = isLoggedIn();
  container.innerHTML = '';
  for (var i = 0; i < list.length; i++) {
    var f = list[i];
    const initials = (f.name || '??').slice(0, 2).toUpperCase();
    const isFriend = !!f.isFriend;
    const actionButton = isFriend ? '<span class="friend-badge">Freund</span>' : '<button class="add-friend-btn" data-friend-email="' + f.email + '" ' + (loggedIn ? '' : 'disabled') + '>Freund hinzuf\u00fcgen</button>';
    container.innerHTML += '<div class="friend-row ' + (f.online ? 'is-online' : '') + '" data-friend-email="' + f.email + '"><div class="friend-avatar">' + initials + '</div><div class="friend-meta"><span class="friend-name">' + escapeHtml(f.name) + '</span><span class="friend-vibe">' + escapeHtml(f.vibe || 'Verbinde dich') + '</span></div><div class="friend-stats"><span class="friend-points">' + (f.points || 0) + ' pts</span><span class="friend-streak"><i class="fas fa-fire"></i> ' + (f.streak || 0) + '</span></div><div class="friend-actions">' + actionButton + '</div><div class="online-indicator"></div></div>';
  }
}

function renderFriendRequests(requests) {
  if (!friendRequestsContainer) return;
  if (!requests || requests.length === 0) {
    friendRequestsContainer.innerHTML = '<p class="today-challenges-empty">Keine Anfragen.</p>';
    return;
  }
  var html = '';
  for (var i = 0; i < requests.length; i++) {
    var r = requests[i];
    html += '<div class="friend-request-row" data-request-id="' + r.id + '"><div class="friend-request-meta"><strong>' + escapeHtml(r.from_name) + '</strong> (' + escapeHtml(r.from_email) + ') m\u00f6chte dein Freund sein.</div><div class="friend-request-actions"><button class="friend-request-action" data-action="accept" data-request-id="' + r.id + '">Annehmen</button><button class="friend-request-action" data-action="decline" data-request-id="' + r.id + '">Ablehnen</button></div></div>';
  }
  friendRequestsContainer.innerHTML = html;
}

function updateActionInfo(text) {
  if (actionInfo) actionInfo.textContent = text;
}

async function addUserBySearch(presetEmail) {
  const input = document.getElementById('friend-search-input');
  const query = presetEmail || input.value.trim();
  if (!query) return;
  if (!requireAuth('Freunde hinzuzuf\u00fcgen')) return;
  try {
    const res = await fetch(API_BASE + '/friends.php?action=request', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: query })
    });
    const data = await res.json();
    if (data.error) { updateActionInfo(data.error); } else { updateActionInfo('Freundschaftsanfrage gesendet.'); }
  } catch (e) { updateActionInfo('Fehler beim Senden der Anfrage.'); }
  if (input) input.value = '';
}

async function handleFriendRequestAction(requestId, action) {
  if (!requireAuth('Anfragen zu beantworten')) return;
  try {
    const res = await fetch(API_BASE + '/friends.php?action=respond', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, action })
    });
    await res.json();
    loadFriends();
  } catch (e) { console.error(e); }
}

if (quickChatButton) {
  quickChatButton.addEventListener('click', () => {
    if (!requireAuth('den Schnellchat zu nutzen')) return;
    const randomUser = appUsers.filter(u => u !== lastQuickChatMatch);
    const pool = randomUser.length > 0 ? randomUser : appUsers;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastQuickChatMatch = picked;
    quickChatButton.classList.add('active');
    updateActionInfo('Schnellchat: Verbunden mit ' + picked + '.');
    openChat(picked);
  });
}

loadFriends();

if (container) {
  container.addEventListener('click', async (event) => {
    const friendButton = event.target.closest('.add-friend-btn');
    if (friendButton) { addUserBySearch(friendButton.dataset.friendEmail); event.stopPropagation(); return; }
    const row = event.target.closest('.friend-row');
    if (row) { const friendEmail = row.dataset.friendEmail; if (!requireAuth('Nachrichten zu senden')) return; openChat(friendEmail); }
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
    const res = await fetch(API_BASE + '/friends.php?action=chat_messages&friend=' + encodeURIComponent(currentChatFriend), { credentials: 'same-origin' });
    const data = await res.json();
    messagesContainer.innerHTML = '';
    if (!data.messages || data.messages.length === 0) { messagesContainer.innerHTML = '<p class="today-challenges-empty">Noch keine Nachrichten.</p>'; return; }
    for (var i = 0; i < data.messages.length; i++) { var m = data.messages[i]; addMessageToChat(m.text, m.sender === currentUser?.email); }
  } catch (e) { console.error('Chat load failed:', e); }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-message-input');
  const message = input.value.trim();
  if (!message || !currentChatFriend || !isLoggedIn()) return;
  try {
    const res = await fetch(API_BASE + '/friends.php?action=chat', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver: currentChatFriend, message })
    });
    const data = await res.json();
    if (data.success) { addMessageToChat(message, true); input.value = ''; } else { updateActionInfo(data.error || 'Fehler beim Senden.'); }
  } catch (e) { console.error(e); }
}

function addMessageToChat(text, isOwn) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message ' + (isOwn ? 'own' : '');
  messageEl.innerHTML = '<div class="chat-bubble">' + escapeHtml(text) + '</div>';
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
let streakData = { count: 0, lastUpdated: null, lastUpdateDate: null, completedToday: false };

function getToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function isSameDay(d1, d2) { return d1 === d2; }

function isPreviousDay(d1, d2) {
  const date1 = new Date(d1), date2 = new Date(d2);
  const diff = (date2 - date1) / (1000 * 60 * 60 * 24);
  return diff >= 1 && diff < 2;
}

function displayStreak() {
  var el = document.getElementById('streakCount');
  var value = isLoggedIn() && currentUser ? (currentUser.streak || 0) : (streakData.count || 0);
  if (el) el.textContent = value;
  updateStreakFlameStage(value);
}

// ===== TASKS =====
let allTasks = { weekly: [], daily: [] };
let currentTask = null;
let acceptedTasks = [];
let taskCard = null;
let swipeStartX = 0, swipeCurrentX = 0, isDraggingTaskCard = false;
const SWIPE_THRESHOLD = 100, SWIPE_MAX_ROTATION = 12;
let decisionFeedbackTimeout = null;

function normalizeTaskName(taskName) { return (taskName || '').trim().toLowerCase(); }

function saveAcceptedTasks() {}

function loadRecentUploads() {
  const allUploads = [];
  for (var ti = 0; ti < acceptedTasks.length; ti++) {
    var task = acceptedTasks[ti];
    if (task.proofFileDatas && task.proofUploadedAt) {
      for (var ui = 0; ui < task.proofFileDatas.length; ui++) {
        allUploads.push({
          data: task.proofFileDatas[ui],
          name: task.proofFileNames ? task.proofFileNames[ui] : 'Upload',
          task: task.task,
          uploadedAt: task.proofUploadedAt,
          id: task.task + '_' + ui + '_' + task.proofUploadedAt
        });
      }
    }
  }
  allUploads.sort(function(a, b) { return new Date(b.uploadedAt) - new Date(a.uploadedAt); });
  var recent = allUploads.slice(0, 3);
  var proofGallery = document.querySelector('.proof-gallery');
  if (!proofGallery) return;
  proofGallery.innerHTML = '';
  if (recent.length === 0) {
    proofGallery.innerHTML = '<div class="proof-empty-state"><div class="proof-empty-icon"><i class="fas fa-image"></i></div><div class="proof-empty-message">Keine Beweise vorhanden</div><div class="proof-empty-subtitle">F\u00fcge ein Bild zu deinen Challenges hinzu</div></div>';
    return;
  }
  for (var ri = 0; ri < recent.length; ri++) {
    var item = document.createElement('div');
    item.className = 'proof-miniature';
    item.innerHTML = '<div class="proof-miniature-container"><img src="' + recent[ri].data + '" alt="User upload" class="proof-miniature-img"><button class="proof-remove-btn" data-upload-id="' + recent[ri].id + '" title="Entfernen"><i class="fas fa-times"></i></button></div>';
    proofGallery.appendChild(item);
  }
  // Remove old listener and add new one
  var oldClick = proofGallery._clickHandler;
  if (oldClick) proofGallery.removeEventListener('click', oldClick);
  var handler = function(e) {
    var btn = e.target.closest('.proof-remove-btn');
    if (btn) { e.preventDefault(); var id = btn.getAttribute('data-upload-id'); if (id) removeEvidence(id); }
  };
  proofGallery._clickHandler = handler;
  proofGallery.addEventListener('click', handler);
}

function removeEvidence(uploadId) {
  var parts = uploadId.split('_');
  if (parts.length < 3) return;
  var taskName = parts.slice(0, -2).join('_');
  var imageIndex = parseInt(parts[parts.length - 2]);
  var timestamp = parts[parts.length - 1];
  for (var i = 0; i < acceptedTasks.length; i++) {
    if (acceptedTasks[i].task === taskName && acceptedTasks[i].proofUploadedAt === timestamp) {
      var task = acceptedTasks[i];
      if (!task.proofFileDatas || task.proofFileDatas.length <= imageIndex) return;
      task.proofFileDatas.splice(imageIndex, 1);
      if (task.proofFileNames && task.proofFileNames.length > imageIndex) task.proofFileNames.splice(imageIndex, 1);
      if (task.proofFileDatas.length === 0) { delete task.proofUploadedAt; delete task.proofFileNames; delete task.proofFileDatas; }
      saveAcceptedTasks();
      loadRecentUploads();
      return;
    }
  }
}

function isTaskAlreadyAccepted(taskName) {
  var nn = normalizeTaskName(taskName);
  for (var i = 0; i < acceptedTasks.length; i++) {
    var t = acceptedTasks[i];
    if (normalizeTaskName(t.task) === nn && t.status !== 'completed' && t.status !== 'cancelled') return true;
  }
  return false;
}

function removeTaskFromTaskSection(taskName) {
  var nn = normalizeTaskName(taskName);
  document.querySelectorAll('#tasks .task-card').forEach(function(card) {
    var title = card.querySelector('.task-title')?.textContent || '';
    var btn = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
    if (normalizeTaskName(title) === nn || normalizeTaskName(btn) === nn) card.style.display = 'none';
  });
}

function buildAcceptedTaskCard(task) {
  var key = getAcceptedTaskKey(task);
  var pDatas = Array.isArray(task.proofFileDatas) ? task.proofFileDatas : [];
  var pNames = Array.isArray(task.proofFileNames) ? task.proofFileNames : [];
  var done = Boolean(task.isCompleted) || task.status === 'completed';
  var pts = task.points || 0;
  var state = pDatas.length > 0 ? '<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ' + (pNames.length || pDatas.length) + ' Beweis(e) hochgeladen</p>' : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
  var img = '';
  if (pDatas.length > 0) { img = '<div class="today-proof-image-container">'; for (var j = 0; j < pDatas.length; j++) { img += '<img src="' + pDatas[j] + '" alt="Beweis-Foto" class="today-proof-image">'; } img += '</div>'; }
  var upBtn = done ? '' : '<button class="accepted-task-btn task-proof-upload-btn" type="button" data-task-key="' + escapeHtml(key) + '"><i class="fas fa-upload"></i> Beweis hochladen</button>';
  var cfBtn = (pDatas.length > 0 && !done) ? '<button class="accepted-task-btn task-proof-confirm-btn" type="button" data-task-key="' + escapeHtml(key) + '"><i class="fas fa-check"></i> Punkte best\u00e4tigen</button>' : '';
  var pInp = done ? '' : '<input class="task-proof-upload-input" type="file" accept="image/*" multiple data-task-key="' + escapeHtml(key) + '">';
  var doneNote = done ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>' : '';
  return '<div class="accepted-task-inner"><div class="accepted-task-icon"><i class="' + (task.icon || 'fas fa-check') + '"></i></div><h3 class="accepted-task-title">' + escapeHtml(task.task) + '</h3><div class="accepted-task-proof-area">' + img + state + doneNote + upBtn + pInp + cfBtn + '</div><div class="accepted-task-actions"><span class="accepted-task-btn" role="note"><i class="fas fa-star"></i> ' + pts + ' Punkte warten auf Best\u00e4tigung</span></div></div>';
}

function getAcceptedTaskKey(task) {
  return normalizeTaskName(task.task) + '|' + (task.acceptedDate || '');
}

function renderAcceptedTaskSection() {
  var section = document.getElementById('tasks');
  if (!section) return;
  section.querySelectorAll('.accepted-task-clone').forEach(function(c) { c.remove(); });
  document.querySelectorAll('#tasks .task-card').forEach(function(c) { c.style.display = ''; });
  for (var ai = 0; ai < acceptedTasks.length; ai++) {
    var t = acceptedTasks[ai];
    if (t.isCompleted || t.status === 'completed' || t.status === 'cancelled') continue;
    var nn = normalizeTaskName(t.task);
    document.querySelectorAll('#tasks .task-card').forEach(function(card) {
      var title = card.querySelector('.task-title')?.textContent || '';
      var btnTask = card.querySelector('.task-accept-btn')?.getAttribute('data-task') || '';
      if (normalizeTaskName(title) !== nn && normalizeTaskName(btnTask) !== nn) return;
      card.style.display = 'none';
      var clone = document.createElement('div');
      clone.className = 'task-card task-card-accepted accepted-task-clone';
      clone.setAttribute('data-task-key', getAcceptedTaskKey(t));
      clone.innerHTML = buildAcceptedTaskCard(t);
      card.parentNode.insertBefore(clone, card.nextSibling);
    });
  }
}

function renderTodayChallenges() {
  var list = document.getElementById('todayChallengesList');
  if (!list) return;
  var today = getToday();
  var items = [];
  for (var i = 0; i < acceptedTasks.length; i++) {
    var t = acceptedTasks[i];
    if (t.isCompleted || t.status === 'completed' || t.status === 'cancelled') continue;
    if (!t.acceptedDate) continue;
    var d = new Date(t.acceptedDate);
    if (isNaN(d.getTime())) continue;
    var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (key === today) items.push(t);
  }
  if (items.length === 0) { list.innerHTML = '<p class="today-challenges-empty">Noch keine Aufgabe akzeptiert.</p>'; return; }
  var html = '';
  for (var idx = 0; idx < items.length; idx++) {
    var task = items[idx];
    var ckey = getAcceptedTaskKey(task);
    var state = task.proofFileNames && task.proofFileNames.length > 0 ? '<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ' + task.proofFileNames.length + ' Beweis(e) hochgeladen</p>' : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
    var img = '';
    if (task.proofFileDatas && task.proofFileDatas.length > 0) { img = '<div class="today-proof-image-container">'; for (var pi = 0; pi < task.proofFileDatas.length; pi++) { img += '<img src="' + task.proofFileDatas[pi] + '" alt="Beweis-Foto" class="today-proof-image">'; } img += '</div>'; }
    var uploadBtn = '<button class="btn-primary btn-challenge today-challenge-upload-btn" type="button" data-challenge-index="' + idx + '"><i class="fas fa-upload"></i> Beweis hochladen</button>';
    var confirmBtn = (task.proofFileDatas && task.proofFileDatas.length > 0) ? '<button class="btn-primary btn-challenge today-challenge-confirm-btn" type="button" data-challenge-index="' + idx + '" data-challenge-key="' + escapeHtml(ckey) + '"><i class="fas fa-check"></i> Hochladen best\u00e4tigen</button>' : '';
    var inp = '<input class="today-challenge-upload-input" type="file" accept="image/*" multiple data-challenge-index="' + idx + '" data-challenge-key="' + escapeHtml(ckey) + '">';
    var pts = task.points || 50;
    var dc = task.isDaily ? 'is-daily-challenge' : '';
    var badge = task.isDaily ? '<span class="streak-badge-label"><i class="fas fa-fire"></i> Streak-Erhaltung</span>' : '';
    html += '<div class="today-challenge-card glassmorphism ' + dc + '"><div class="challenge-header"><div style="display:flex;align-items:center;gap:1rem;"><div class="challenge-icon"><i class="' + (task.icon || 'fas fa-recycle') + '"></i></div><span class="challenge-label">Heutige Challenge</span></div>' + badge + '</div><h2 class="challenge-title">' + escapeHtml(task.task) + '</h2><div class="challenge-description"><p>Diese Aufgabe wurde von dir akzeptiert und wartet jetzt auf Erledigung.</p></div><div class="challenge-reward"><div class="reward-item"><i class="fas fa-star"></i><span>' + pts + ' Punkte</span></div></div>' + img + state + uploadBtn + inp + confirmBtn + '</div>';
  }
  list.innerHTML = html;
}

async function saveProofUpload(challengeKey, fileNames, fileDatas) {
  var idx = -1;
  for (var i = 0; i < acceptedTasks.length; i++) { if (getAcceptedTaskKey(acceptedTasks[i]) === challengeKey) { idx = i; break; } }
  if (idx === -1) return;
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  if (!Array.isArray(fileDatas)) fileDatas = [fileDatas];
  acceptedTasks[idx].proofFileNames = fileNames;
  acceptedTasks[idx].proofFileDatas = fileDatas;
  acceptedTasks[idx].proofUploadedAt = new Date().toISOString();
  saveAcceptedTasks();
  loadRecentUploads();
  renderDailyChallengeCard();
  renderAcceptedTaskSection();
  var sid = acceptedTasks[idx].serverId || acceptedTasks[idx].server_id || acceptedTasks[idx].id;
  if (isLoggedIn() && sid) { var res = await apiUploadProof(sid, fileNames, fileDatas); if (res && res.success) { await refreshProfile(); } }
}

async function confirmTaskProof(challengeKey) {
  var idx = -1;
  for (var i = 0; i < acceptedTasks.length; i++) { if (getAcceptedTaskKey(acceptedTasks[i]) === challengeKey) { idx = i; break; } }
  if (idx === -1) return;
  var task = acceptedTasks[idx];
  if (!task.proofFileDatas || task.proofFileDatas.length === 0 || task.isCompleted) return;
  var sid = task.serverId || task.server_id || task.id;
  if (isLoggedIn() && sid) {
    var res = await apiCompleteTask(sid);
    if (res && res.success) {
      task.isCompleted = true;
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      await refreshProfile();
      saveAcceptedTasks();
      renderAcceptedTaskSection();
      renderTodayChallenges();
      renderDailyChallengeCard();
      loadRecentUploads();
      var msg = '+' + (res.points_awarded || 0) + ' Punkte erhalten!';
      if (res.water_saved > 0) msg += ' \u{1F4A7}+' + res.water_saved + 'L Wasser';
      if (res.trash_saved > 0) msg += ' \u{1F5D1}\uFE0F-' + res.trash_saved + 'kg M\u00fcll';
      if (res.new_level) msg += ' \u{1F389} Level ' + res.new_level + '!';
      showToast(msg, 'success');
      return;
    } else { console.error('Server complete failed', res); }
  }
  task.isCompleted = true;
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  saveAcceptedTasks();
  renderAcceptedTaskSection();
  renderTodayChallenges();
  renderDailyChallengeCard();
  loadRecentUploads();
}

// ===== TASK LOADING =====
async function loadTasks() {
  try {
    const response = await fetch(API_BASE + '/tasks.php?action=available');
    if (!response.ok) { throw new Error('API error ' + response.status); }
    allTasks = await response.json();
    renderDailyChallengeCard();
    if (typeof renderTasksSection === 'function') { renderTasksSection(allTasks); }
  } catch (error) {
    console.error('Fehler beim Laden der Tasks:', error);
    allTasks = { weekly: [], daily: [] };
    renderDailyChallengeCard();
  }
  renderAcceptedTaskSection();
}

function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); hash = ((hash << 5) - hash) + c; hash = hash & hash; }
  return hash;
}

function getDailyTask() {
  var dailyTasks = allTasks.daily || [];
  if (dailyTasks.length === 0) return null;
  var today = new Date();
  var key = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate();
  var h = hashCode(key);
  return dailyTasks[Math.abs(h) % dailyTasks.length];
}

function renderDailyChallengeCard() {
  var dt = getDailyTask();
  if (!dt) return;
  var todayKey = getToday();
  var accepted = null;
  for (var i = 0; i < acceptedTasks.length; i++) {
    var t = acceptedTasks[i];
    if (t.isDaily && t.acceptedDate && t.acceptedDate.indexOf(todayKey) === 0 && t.status !== 'completed' && !t.isCompleted) { accepted = t; break; }
  }
  displayDailyChallenge(accepted || dt, !!accepted);
}

function displayDailyChallenge(task, isAccepted) {
  if (!isAccepted) isAccepted = false;
  var titleEl = document.getElementById('dailyChallengeTitle');
  var descEl = document.getElementById('dailyChallengeDesc');
  var iconEl = document.getElementById('dailyChallengeIcon');
  var btnEl = document.getElementById('startChallengeBtn');
  var proofArea = document.getElementById('dailyChallengeProofArea');
  var ckey = isAccepted ? getAcceptedTaskKey(task) : '';
  var pDatas = Array.isArray(task.proofFileDatas) ? task.proofFileDatas : [];
  var pNames = Array.isArray(task.proofFileNames) ? task.proofFileNames : [];
  var done = Boolean(task.isCompleted) || task.status === 'completed';
  if (titleEl) titleEl.textContent = task.task;
  if (descEl) descEl.textContent = isAccepted ? 'Lade jetzt ein Bild als Beweis hoch und best\u00e4tige die Tages-Challenge.' : 'Erledige diese t\u00e4gliche Aufgabe und verdiene dir Punkte!';
  if (iconEl && task.icon) iconEl.className = task.icon;
  if (btnEl) {
    if (done) { btnEl.innerHTML = '<i class="fas fa-check"></i> Abgeschlossen'; btnEl.disabled = true; btnEl.classList.add('accepted'); }
    else if (isAccepted) { btnEl.innerHTML = '<i class="fas fa-check"></i> Akzeptiert'; btnEl.disabled = true; btnEl.classList.add('accepted'); }
    else { btnEl.innerHTML = '<i class="fas fa-arrow-right"></i> Challenge starten'; btnEl.disabled = false; btnEl.classList.remove('accepted'); }
  }
  if (!proofArea) return;
  if (!isAccepted) { proofArea.innerHTML = ''; return; }
  var state = pDatas.length > 0 ? '<p class="today-proof-state uploaded"><i class="fas fa-check-circle"></i> ' + (pNames.length || pDatas.length) + ' Beweis(e) hochgeladen</p>' : '<p class="today-proof-state"><i class="fas fa-image"></i> Noch kein Beweis hochgeladen</p>';
  var img = '';
  if (pDatas.length > 0) { img = '<div class="today-proof-image-container">'; for (var j = 0; j < pDatas.length; j++) { img += '<img src="' + pDatas[j] + '" alt="Beweis-Foto" class="today-proof-image">'; } img += '</div>'; }
  var up = done ? '' : '<button class="btn-primary btn-challenge today-challenge-upload-btn daily-challenge-upload-btn" type="button" data-challenge-key="' + escapeHtml(ckey) + '"><i class="fas fa-upload"></i> Beweis hochladen</button>';
  var cf = (pDatas.length > 0 && !done) ? '<button class="btn-primary btn-challenge today-challenge-confirm-btn daily-challenge-confirm-btn" type="button" data-challenge-key="' + escapeHtml(ckey) + '"><i class="fas fa-check"></i> Hochladen best\u00e4tigen</button>' : '';
  var inp = done ? '' : '<input class="today-challenge-upload-input daily-challenge-upload-input" type="file" accept="image/*" multiple id="dailyChallengeUploadInput" data-challenge-key="' + escapeHtml(ckey) + '">';
  var note = done ? '<p class="today-proof-state completed"><i class="fas fa-check-circle"></i> Aufgabe abgeschlossen</p>' : '';
  proofArea.innerHTML = img + state + note + up + inp + cf;
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
    var sd = document.getElementById('streak-days');
    if (sd) sd.textContent = '0 TAGE';
    return;
  }
  
  if (nameEl) nameEl.textContent = currentUser.name;
  if (avatarEl) avatarEl.src = currentUser.picture || 'avatar.png';
  if (locationEl) locationEl.textContent = currentUser.email;
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.disabled = false;
  if (googleSignIn) googleSignIn.style.display = 'none';
  if (googleOnload) googleOnload.style.display = 'none';
  
  refreshVisualStats();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', async () => {
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
  document.getElementById('authModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) hideAuthModal(); });
  
  await checkAuth();
  displayStreak();
  if (streakCountEl) animateCounter(streakCountEl, parseInt(streakCountEl.textContent) || 0, 2000);
  
  var gw = document.getElementById('globalWaste');
  if (gw) animateCounter(gw, 2847, 2500);
  var au = document.getElementById('activeUsers');
  if (au) animateCounter(au, 1204, 2500);
  
  // Daily challenge start button
  var startBtn = document.getElementById('startChallengeBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async function() {
      if (!requireAuth('Challenges zu starten')) return;
      var dailyTask = getDailyTask();
      if (!dailyTask) return;
      var todayKey = getToday();
      var already = false;
      for (var i = 0; i < acceptedTasks.length; i++) {
        var t = acceptedTasks[i];
        if (t.isDaily && t.acceptedDate && t.acceptedDate.indexOf(todayKey) === 0 && t.status !== 'completed' && !t.isCompleted) { already = true; break; }
      }
      if (already) return;
      
      var taskIcon = dailyTask.icon || 'fas fa-recycle';
      var points = dailyTask.points || 50;
      if (isLoggedIn()) {
        var res = await apiAcceptTask(dailyTask.task, taskIcon, points, 1);
        if (res && !res.error && res.task && res.task.id) {
          acceptedTasks.push({ id: Date.now(), serverId: res.task.id, task: dailyTask.task, icon: taskIcon, points: points, acceptedDate: new Date().toISOString(), status: 'accepted', isDaily: true });
        } else {
          acceptedTasks.push({ id: Date.now(), task: dailyTask.task, icon: taskIcon, points: points, acceptedDate: new Date().toISOString(), status: 'accepted', isDaily: true });
        }
      } else {
        acceptedTasks.push({ id: Date.now(), task: dailyTask.task, icon: taskIcon, points: points, acceptedDate: new Date().toISOString(), status: 'accepted', isDaily: true });
      }
      saveAcceptedTasks();
      renderDailyChallengeCard();
      renderTodayChallenges();
    });
  }
  
  updateTimer();
  setInterval(updateTimer, 60000);
  observeStatsAnimation();
  var savedDarkMode = localStorage.getItem('ecoDarkMode') === '1';
  initializeDarkMode(savedDarkMode);
});

function animateCounter(element, target, duration) {
  if (!duration) duration = 2000;
  var current = 0;
  var inc = target / (duration / 16);
  var timer = setInterval(function() {
    current += inc;
    if (current >= target) { current = target; clearInterval(timer); }
    element.textContent = Math.floor(current);
  }, 16);
}

function updateTimer() {
  var tf = document.querySelector('.timer-fill');
  var tt = document.querySelector('.timer-time');
  if (tf && tt) {
    var now = new Date();
    var eod = new Date(); eod.setHours(23, 59, 59);
    var diff = eod - now;
    var h = Math.floor(diff / (1000 * 60 * 60));
    var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var pct = (diff / (24 * 60 * 60 * 1000)) * 100;
    tf.style.width = pct + '%';
    tt.textContent = h + 'h ' + m + 'm verbleibend';
  }
}

function observeStatsAnimation() {
  var sc = document.querySelector('.stats-counter');
  if (!sc) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.style.animation = 'slideInUp 0.6s ease-out'; obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  obs.observe(sc);
}

// ===== SECTION MANAGEMENT =====
var homeSection = document.getElementById('home');
var tasksSection = document.getElementById('tasks');
var friendsSection = document.getElementById('friends');
var profileSection = document.getElementById('profile');

function updateActPage(page) {
  var hdr = document.getElementById('appHeader');
  switch(page) {
    case 'home':
      friendsSection.style.display = 'none'; profileSection.style.display = 'none'; tasksSection.style.display = 'none';
      homeSection.style.display = 'flex';
      hdr.innerHTML = '<div class="header-content"><div class="header-left"><button class="icon-btn dark-mode-toggle" id="darkModeToggle" title="Dark Mode"><i class="fas fa-moon" id="darkModeIcon"></i></button></div><div class="header-center"><img src="../main/img/logo.png" alt="Leaf Logo" class="logo-image"></div><div class="header-right"><button class="icon-btn notification-btn" title="Benachrichtigungen"><i class="fas fa-bell-slash notification-icon"></i></button></div></div><div class="bottom-bar"></div>';
      break;
    case 'tasks':
      homeSection.style.display = 'none'; friendsSection.style.display = 'none'; profileSection.style.display = 'none';
      tasksSection.style.display = 'block'; hdr.innerHTML = '';
      break;
    case 'friends':
      homeSection.style.display = 'none'; profileSection.style.display = 'none'; tasksSection.style.display = 'none';
      friendsSection.style.display = 'block'; hdr.innerHTML = '';
      break;
    case 'profile':
      homeSection.style.display = 'none'; friendsSection.style.display = 'none'; tasksSection.style.display = 'none';
      profileSection.style.display = 'block'; hdr.innerHTML = '';
      break;
  }
}

// ===== EVENT DELEGATION =====
document.addEventListener('click', function(e) {
  var dub = e.target.closest('.daily-challenge-upload-btn');
  if (dub) { if (!requireAuth('Beweise hochzuladen')) return; var inp = document.getElementById('dailyChallengeUploadInput'); if (inp) inp.click(); return; }
  
  var dcb = e.target.closest('.daily-challenge-confirm-btn');
  if (dcb) { if (!requireAuth('Aufgaben zu best\u00e4tigen')) return; var k = dcb.getAttribute('data-challenge-key'); if (k) confirmTaskProof(k); return; }
  
  var tub = e.target.closest('.task-proof-upload-btn');
  if (tub) { if (!requireAuth('Beweise hochzuladen')) return; var k2 = tub.getAttribute('data-task-key'); var inp2 = tub.closest('.accepted-task-clone')?.querySelector('.task-proof-upload-input[data-task-key="' + k2 + '"]'); if (inp2) inp2.click(); return; }
  
  var tcb = e.target.closest('.task-proof-confirm-btn');
  if (tcb) { if (!requireAuth('Aufgaben zu best\u00e4tigen')) return; var k3 = tcb.getAttribute('data-task-key'); if (k3) confirmTaskProof(k3); return; }
  
  var ub = e.target.closest('.today-challenge-upload-btn');
  if (ub) { if (!requireAuth('Beweise hochzuladen')) return; var idx = ub.getAttribute('data-challenge-index'); var inp3 = document.querySelector('.today-challenge-upload-input[data-challenge-index="' + idx + '"]'); if (inp3) inp3.click(); return; }
  
  var cb = e.target.closest('.today-challenge-confirm-btn');
  if (cb) { if (!requireAuth('Aufgaben zu best\u00e4tigen')) return; var k4 = cb.getAttribute('data-challenge-key'); if (k4) confirmTaskProof(k4); return; }
  
  var btn = e.target.closest('.task-accept-btn');
  if (btn) {
    (async function() {
      if (!requireAuth('Aufgaben anzunehmen')) return;
      var taskName = btn.getAttribute('data-task');
      var taskIcon = btn.getAttribute('data-icon');
      if (isTaskAlreadyAccepted(taskName)) {
        removeTaskFromTaskSection(taskName);
        renderAcceptedTaskSection();
        renderTodayChallenges();
        return;
      }
      var card = btn.closest('.task-card');
      var pts = 0;
      if (card) { var ptsText = card.querySelector('.task-points')?.textContent || ''; var m = ptsText.match(/(\d+)\s*Punkte/); if (m) pts = parseInt(m[1], 10); }
      if (isLoggedIn()) {
        var res = await apiAcceptTask(taskName, taskIcon, pts, 0);
        if (res && !res.error && res.task && res.task.id) {
          acceptedTasks.push({ id: Date.now(), serverId: res.task.id, task: taskName, icon: taskIcon, points: pts, acceptedDate: new Date().toISOString(), status: 'accepted' });
          saveAcceptedTasks();
          renderAcceptedTaskSection();
          renderTodayChallenges();
          await refreshProfile();
          return;
        }
      }
      acceptedTasks.push({ id: Date.now(), task: taskName, icon: taskIcon, points: pts, acceptedDate: new Date().toISOString(), status: 'accepted' });
      saveAcceptedTasks();
      renderAcceptedTaskSection();
      renderTodayChallenges();
    })();
  }
});

document.addEventListener('change', function(e) {
  var tui = e.target.closest('.task-proof-upload-input');
  if (tui) { handleFileUpload(tui); return; }
  var dui = e.target.closest('.daily-challenge-upload-input');
  if (dui) { handleFileUpload(dui); return; }
  var ui = e.target.closest('.today-challenge-upload-input');
  if (ui) { handleFileUpload(ui); }
});

function handleFileUpload(input) {
  var files = input.files;
  if (!files || files.length === 0) return;
  var ckey = input.getAttribute('data-task-key') || input.getAttribute('data-challenge-key') || '';
  var fnames = [];
  var fdatas = [];
  var loaded = 0;
  for (var fi = 0; fi < files.length; fi++) {
    (function(file) {
      var reader = new FileReader();
      reader.onload = function(event) {
        fnames.push(file.name);
        fdatas.push(event.target.result);
        loaded++;
        if (loaded === files.length) {
          saveProofUpload(ckey, fnames, fdatas);
          renderAcceptedTaskSection();
          renderDailyChallengeCard();
          renderTodayChallenges();
          loadRecentUploads();
        }
      };
      reader.readAsDataURL(file);
    })(files[fi]);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
  try {
    await checkAuth();
    if (isLoggedIn()) { await refreshProfile(); await fetchMyTasks(); }
    await loadTasks();
  } catch (e) { console.error('Initialization failed:', e); }
  navigateTo('home');
  updateActPage('home');
});