'use strict'

const cartButton = document.querySelector('#cart-button')
const modal = document.querySelector('.modal')
const close = document.querySelector('.close')
const buttonAuth = document.querySelector('.button-auth')
const modalAuth = document.querySelector('.modal-auth')
const closeAuth = document.querySelector('.close-auth')
const logInForm = document.querySelector('#logInForm')
const loginInput = document.querySelector('#login')
const userName = document.querySelector('.user-name')
const buttonOut = document.querySelector('.button-out')
const cardsRestaurants = document.querySelector('.cards-restaurants')
const containerPromo = document.querySelector('.container-promo')
const restaurants = document.querySelector('.restaurants')
const menu = document.querySelector('.menu')
const logo = document.querySelector('.logo')
const cardsMenu = document.querySelector('.cards-menu')

let login = localStorage.getItem('gloDelivery')

const getData = async function (url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`)
  }
  return await response.json()
}

function validName(str) {
  const regName = /^[a-zA-Z0-9-_\.]{1,20}$/
  return regName.test(str)
}

function toggleModal() {
  modal.classList.toggle('is-open')
}

function toggleModalAuth() {
  modalAuth.classList.toggle('is-open')
  if (modalAuth.classList.contains('is-open')) {
    disableScroll()
  } else {
    enableScroll()
  }
}

function authorized() {
  function logOut() {
    login = null
    localStorage.removeItem('gloDelivery')
    buttonAuth.style.display = ''
    userName.style.display = ''
    buttonOut.style.display = ''
    buttonOut.removeEventListener('click', logOut)
    checkAuth()
  }

  console.log('Авторизован')

  userName.textContent = login

  buttonAuth.style.display = 'none'
  userName.style.display = 'inline'
  buttonOut.style.display = 'block'

  buttonOut.addEventListener('click', logOut)
}

function notAuthorized() {
  console.log('Не авторизован')

  function logIn(event) {
    event.preventDefault()
    login = loginInput.value

    if (validName(login)) {
      localStorage.setItem('gloDelivery', login)

      toggleModalAuth()
      buttonAuth.removeEventListener('click', toggleModalAuth)
      closeAuth.removeEventListener('click', toggleModalAuth)
      logInForm.removeEventListener('submit', logIn)
      logInForm.reset()
      checkAuth()
    } else {
      alert('Введите логин')
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth)
  closeAuth.addEventListener('click', toggleModalAuth)
  logInForm.addEventListener('submit', logIn)
  modalAuth.addEventListener('click', function (event) {
    if (event.target.classList.contains('is-open')) {
      toggleModalAuth()
    }
  })
}

function checkAuth() {
  if (login) {
    authorized()
  } else {
    notAuthorized()
  }
}

function createCardRestaurant({
  image,
  name,
  kitchen,
  price,
  products,
  stars,
  time_of_delivery: timeOfDelivery,
}) {
  /* const {
    image,
    name,
    kitchen,
    price,
    products,
    stars,
    time_of_delivery: timeOfDelivery,
  } = restaurant */
  const card = `
    <a class="card card-restaurant" data-products="${products}" data-price="${price}" data-name="${name}" data-stars="${stars}" data-kitchen="${kitchen}">
      <img
        src="${image}"
        alt="image"
        class="card-image"
      />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин</span>
        </div>
        <div class="card-info">
          <div class="rating">${stars}</div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `

  cardsRestaurants.insertAdjacentHTML('beforeend', card)
}

function createCardGood({ description, id, image, name, price }) {
  //const { description, id, image, name, price } = goods

  const card = document.createElement('div')
  card.className = 'card'

  card.insertAdjacentHTML(
    'beforeend',
    `
      <img
        src="${image}"
        alt="image"
        class="card-image"
      />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>
        <div class="card-buttons">
          <button class="button button-primary button-add-cart">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} ₽</strong>
        </div>
      </div>
  `
  )

  cardsMenu.insertAdjacentElement('beforeend', card)
}

function createMenuSectioHeading(name, stars, price, kitchen) {
  menu.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="section-heading">
      <h2 class="section-title restaurant-title">${name}</h2>
      <div class="card-info">
        <div class="rating">${stars}</div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
      <!-- /.card-info -->
    </div>
  `
  )
}

function openGoods(event) {
  if (login) {
    const target = event.target

    const restaurant = target.closest('.card-restaurant')

    if (restaurant) {
      restaurant.dataset.products
      cardsMenu.textContent = ''
      containerPromo.classList.add('hide')
      restaurants.classList.add('hide')
      menu.classList.remove('hide')
      getData(`./db/${restaurant.dataset.products}`).then(function (data) {
        createMenuSectioHeading(
          restaurant.dataset.name,
          restaurant.dataset.stars,
          restaurant.dataset.price,
          restaurant.dataset.kitchen
        )
        data.forEach(createCardGood)
      })
    }
  } else {
    toggleModalAuth()
  }
}

function init() {
  getData('./db/partners.json').then(function (date) {
    date.forEach(createCardRestaurant)
  })

  cartButton.addEventListener('click', toggleModal)

  close.addEventListener('click', toggleModal)

  cardsRestaurants.addEventListener('click', openGoods)

  logo.addEventListener('click', function () {
    containerPromo.classList.remove('hide')
    restaurants.classList.remove('hide')
    menu.classList.add('hide')
    menu.children[0].remove()
  })

  checkAuth()

  createCardRestaurant()
}

init()

// slider

new Swiper('.swiper-container', {
  sliderPerView: 1,
  loop: true,
  autoplay: true,
  effect: 'flip',
  grabCursor: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
})
