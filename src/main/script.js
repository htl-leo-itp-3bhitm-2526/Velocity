const menuBtn = document.getElementById('menuBtn')
const closeBtn = document.getElementById('closeBtn')
const sidebar = document.getElementById('sidebar')
const overlay = document.getElementById('overlay')
const navLinks = document.querySelectorAll('.nav-link')
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
const sections = document.querySelectorAll('.content-section')

const toggleMenu = (isOpen) => {
  sidebar.classList.toggle('active', isOpen)
  overlay.classList.toggle('active', isOpen)
  document.body.style.overflow = isOpen ? 'hidden' : 'auto'
}

const navigateTo = (id) => {
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
  }
})

document.onkeydown = (e) => {
  if (e.key === 'Escape') toggleMenu(false)
}