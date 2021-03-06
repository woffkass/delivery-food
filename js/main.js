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
const inputSearch = document.querySelector('.input-search')
const modalBody = document.querySelector('.modal-body')
const modalPrice = document.querySelector('.modal-pricetag')
const buttonClearCart = document.querySelector('.clear-cart')

let login = localStorage.getItem('gloDelivery')

const cart = JSON.parse(localStorage.getItem('cart')) || []

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
    cartButton.style.display = ''
    buttonOut.removeEventListener('click', logOut)
    checkAuth()
  }

  console.log('Авторизован')

  userName.textContent = login

  buttonAuth.style.display = 'none'
  userName.style.display = 'inline'
  buttonOut.style.display = 'flex'
  cartButton.style.display = 'flex'

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
          <button class="button button-primary button-add-cart" id="${id}">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price card-price-bold">${price} ₽</strong>
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

function addToCart(event) {
  const target = event.target

  const buttonAddToCart = target.closest('.button-add-cart')

  if (buttonAddToCart) {
    const card = target.closest('.card')
    const title = card.querySelector('.card-title-reg').textContent
    const cost = card.querySelector('.card-price').textContent
    const id = buttonAddToCart.id

    const food = cart.find(function (item) {
      return item.id === id
    })

    if (food) {
      food.count += 1
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      })
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart))
}

function renderCart() {
  modalBody.textContent = ''

  cart.forEach(function ({ title, cost, count, id }) {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `

    modalBody.insertAdjacentHTML('afterbegin', itemCart)
  })

  const totalPrice = cart.reduce(function (result, item) {
    return result + parseFloat(item.cost) * item.count
  }, 0)

  localStorage.setItem('cart', JSON.stringify(cart))

  modalPrice.textContent = totalPrice + ' ₽'
}

function changeCount(event) {
  const target = event.target

  if (target.classList.contains('counter-button')) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id
    })

    if (target.classList.contains('counter-minus')) {
      food.count--
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1)
      }
    }
    if (target.classList.contains('counter-plus')) food.count++

    renderCart()
  }
}

function init() {
  getData('./db/partners.json').then(function (date) {
    date.forEach(createCardRestaurant)
  })

  cartButton.addEventListener('click', function () {
    renderCart()
    toggleModal()
  })

  buttonClearCart.addEventListener('click', function () {
    cart.length = 0
    renderCart()
    localStorage.removeItem('cart')
  })

  modalBody.addEventListener('click', changeCount)

  cardsMenu.addEventListener('click', addToCart)

  close.addEventListener('click', toggleModal)

  cardsRestaurants.addEventListener('click', openGoods)

  logo.addEventListener('click', function () {
    containerPromo.classList.remove('hide')
    restaurants.classList.remove('hide')
    menu.classList.add('hide')
    menu.children[0].remove()
  })

  checkAuth()

  inputSearch.addEventListener('keypress', function (event) {
    if (event.charCode === 13) {
      const value = event.target.value.trim()

      if (!value) {
        event.target.style.backgroundColor = 'red'
        event.target.value = ''
        setTimeout(function () {
          event.target.style.backgroundColor = ''
        }, 1500)
        return
      }

      getData('./db/partners.json')
        .then(function (data) {
          return data.map(function (partner) {
            return partner.products
          })
        })
        .then(function (linksProduct) {
          cardsMenu.textContent = ''

          linksProduct.forEach(function (link) {
            getData(`./db/${link}`).then(function (data) {
              const resultSearch = data.filter(function (item) {
                const name = item.name.toLowerCase()
                return name.includes(value.toLowerCase())
              })
              containerPromo.classList.add('hide')
              restaurants.classList.add('hide')
              menu.classList.remove('hide')
              resultSearch.forEach(createCardGood)
            })
          })
        })
    }
  })
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
