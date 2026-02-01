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
      homeSection.style.display = 'block';
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
