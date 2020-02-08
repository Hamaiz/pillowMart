//* Scrolling
window.onscroll = getScrollPosition;

function getScrollPosition() {
    const scrollObject = {
        y: window.pageYOffset
    }
    const mainMenu = document.querySelector(".main_menu")
    if (scrollObject.y < 50) {
        mainMenu.classList.remove("menu_fixed")
    } else {
        mainMenu.classList.add("menu_fixed")
    }
}

//* Search Toggle
const searchInputBox = document.getElementById("search_input_box")
const searchOne = document.getElementById("search_1")
const closeSearch = document.getElementById("close_search");

searchInputBox.style.display = "none"

searchOne.addEventListener("click", () => {
    searchInputBox.style.display = searchInputBox.style.display === "none" ? "" : "none"
})
closeSearch.addEventListener("click", (e) => {
    e.preventDefault()
    searchInputBox.style.display = "none"
})

// *Hamburger Change
const hamburger = document.getElementById("hamburger")
const barsMobile = document.getElementById("bars-mobile");


hamburger.addEventListener("click", () => {
    if (barsMobile.className == "fas fa-bars") {
        barsMobile.className = "fas fa-times"
        document.body.style.overflowY = "hidden"
    } else {
        barsMobile.className = "fas fa-bars"
        document.body.style.overflowY = "visible"
    }

})
