
//*===============Loader=================*//
document.body.style.overflow = "hidden";
window.addEventListener("load", () => {
    setTimeout(() => {
        document.querySelector(".loader").classList.add("loaded")
        document.body.style.overflowY = "visible"

    }, 1000);
})

//*==============Scroll===============*//
window.onscroll = getScrollPosition;

function getScrollPosition() {
    var scrollObject = {
        y: window.pageYOffset
    }
    var mainMenu = document.querySelector(".main_menu")
    if (scrollObject.y < 100) {
        mainMenu.classList.remove("menu_fixed")
    } else {
        mainMenu.classList.add("menu_fixed")
    }
}


//*=============Hamburger Change=============//
var hamburger = document.getElementById("hamburger")
var barsMobile = document.getElementById("bars-mobile")


hamburger.addEventListener("click", () => {
    if (barsMobile.className == "fas fa-bars") {
        barsMobile.className = "fas fa-times"
        document.body.style.overflowY = "hidden"
    } else {
        barsMobile.className = "fas fa-bars"
        document.body.style.overflowY = "visible"
    }

})

//*==============Carousel================*//
const swiperContainer = document.querySelector(".swiper-container")
if (swiperContainer) {
    var swiper = new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 3000,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

//*===============Option Extension===============*//
const optionList = document.querySelector(".select_option_list")
optionList.addEventListener("click", () => {
    const dropDown = document.querySelector(".select_option_dropdown")
    dropDown.classList.toggle("extended")
})