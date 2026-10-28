const btnBurger = document.querySelector('.btn-burger');
const nav = document.querySelector('.nav');
const navItems = document.querySelectorAll('.nav-item');
const header = document.querySelector('.header');

btnBurger.addEventListener('click', () => {
   const isOpen = nav.classList.toggle('nav--active');
   if (isOpen === true) {
      btnBurger.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
   }
   else {
      btnBurger.innerHTML = `<i class="fa-solid fa-bars"></i>`;
   }
});

navItems.forEach(item => {
   item.addEventListener('click', () => {
      navItems.forEach(el => el.classList.remove('nav-item--active'));
      item.classList.add('nav-item--active');
   })
})


function updateHeader() {
   header.classList.toggle('header--active', window.scrollY > 0);
}

window.addEventListener('scroll', updateHeader);

updateHeader();