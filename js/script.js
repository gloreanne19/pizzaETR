window.addEventListener('scroll', function() {
    var header = document.getElementById('mainHeader');
    var scrollPosition = window.scrollY;

    if (scrollPosition > 0) {
        header.classList.add('scrolled');
        header.classList.remove('home-active');
    } else {
        header.classList.remove('scrolled');
        header.classList.add('home-active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    let navbar = document.querySelector('.header .flex .navbar');

    document.querySelector('#menu-btn').onclick = () => {
        navbar.classList.toggle('active');
    }

    let account = document.querySelector('.user-account');

    document.querySelector('#user-btn').onclick = () => {
        account.classList.add('active');
    }

    document.querySelector('#close-account').onclick = () => {
        account.classList.remove('active');
    }

    let myOrders = document.querySelector('.my-orders');

    document.querySelector('#order-btn').onclick = () => {
        myOrders.classList.add('active');
    }

    document.querySelector('#close-orders').onclick = () => {
        myOrders.classList.remove('active');
    }

    let cart = document.querySelector('.shopping-cart');

    document.querySelector('#cart-btn').onclick = () => {
        cart.classList.add('active');
    }

    document.querySelector('#close-cart').onclick = () => {
        cart.classList.remove('active');
    }

    window.onscroll = () => {
        navbar.classList.remove('active');
        myOrders.classList.remove('active');
        cart.classList.remove('active');
    };

    let slides = document.querySelectorAll('.home-bg .home .slide-container .slide');
    let index = 0;

    let accordion = document.querySelectorAll('.faq .accordion-container .accordion');

    accordion.forEach(acco => {
        acco.onclick = () => {
            accordion.forEach(remove => remove.classList.remove('active'));
            acco.classList.add('active');
        }
    });
});

// showcase
document.addEventListener('DOMContentLoaded', function() {
    let slides = document.querySelectorAll('.home-bg .home .slide-container .slide');
    let index = 0;

    function next() {
        slides[index].classList.remove('active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('active');
    }

    // function prev() {
    //     slides[index].classList.remove('active');
    //     index = (index - 1 + slides.length) % slides.length;
    //     slides[index].classList.add('active');
    // }


    setInterval(next, 2000);
});


let favoritesBtn = document.querySelector('#favorites-btn');
let favoritesDrawer = document.querySelector('.favorites-drawer');

favoritesBtn.onclick = () => {
    favoritesDrawer.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    cartItem.classList.remove('active');
    userAccount.classList.remove('active');
}

document.querySelector('#close-favorites').onclick = () => {
    favoritesDrawer.classList.remove('active');
}


//login and register

function switchForm(formType) {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const [loginBtn, registerBtn] = document.querySelectorAll('.tab-button');

    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginBtn.classList.add('primary');
        loginBtn.classList.remove('secondary');
        registerBtn.classList.add('secondary');
        registerBtn.classList.remove('primary');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerBtn.classList.add('primary');
        registerBtn.classList.remove('secondary');
        loginBtn.classList.add('secondary');
        loginBtn.classList.remove('primary');
    }
}