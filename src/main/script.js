let menuBtn = document.getElementById('menuBtn')
let closeBtn = document.getElementById('closeBtn')
let sidebar = document.getElementById('sidebar')
let overlay = document.getElementById('overlay')
let navLinks = document.querySelectorAll('.nav-link')
let bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
let sections = document.querySelectorAll('.content-section')

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

menuBtn.onclick = () => toggleMenu(true)
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
  }
 
}

const friendsData = [
    { name: "Samuel", img: "samuel.png", online: true },
    { name: "XYZ", img: "xyz.png", online: false }
]

const container = document.getElementById('friends-list-container');

friendsData.forEach(friend => {
    const html = `
        <div class="friend-row ${friend.online ? 'is-online' : ''}">
            <div class="friend-avatar" style="background-image: url(${friend.img})"></div>
            <span class="friend-name">${friend.name}</span>
            <div class="online-indicator"></div>
        </div>
    `
    container.innerHTML += html;
})

// Task management
let allTasks = { weekly: [], daily: [] };
let currentTask = null;
let acceptedTasks = JSON.parse(localStorage.getItem('acceptedTasks')) || [];

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
    
    const randomIndex = Math.floor(Math.random() * weeklyTasks.length);
    return weeklyTasks[randomIndex];
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

// Accept task
function acceptTask() {
    if (currentTask) {
        const taskWithDate = {
            ...currentTask,
            acceptedDate: new Date().toISOString(),
            status: 'active'
        };
        
        acceptedTasks.push(taskWithDate);
        localStorage.setItem('acceptedTasks', JSON.stringify(acceptedTasks));
        
        // Show success message
        alert('Aufgabe angenommen! Du findest sie in deiner Aufgabenübersicht.');
        
        // Load new random task
        loadRandomTask();
    }
}

// Deny task
function denyTask() {
    // Just load a new random task
    loadRandomTask();
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

// Load tasks on page load
loadTasks();

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
        
        // Transform the task card to accepted style
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            taskCard.innerHTML = `
                <div class="accepted-task-inner">
                    <div class="accepted-task-icon">
                        <i class="${taskIcon}"></i>
                    </div>
                    <h3 class="accepted-task-title">${taskName}</h3>
                    <button class="accepted-task-btn">Akzeptiert</button>
                </div>
            `;
            taskCard.classList.add('task-card-accepted');
        }
    }
});
