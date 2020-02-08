//* Scrolling
window.onscroll = getScrollPosition;

function getScrollPosition() {
    var scrollObject = {
        y: window.pageYOffset
    }
    var mainMenu = document.querySelector(".main_menu")
    if (scrollObject.y < 50) {
        mainMenu.classList.remove("menu_fixed")
    } else {
        mainMenu.classList.add("menu_fixed")
    }
}



//* Search Toggle


// (function ($) {
//     $("#search_input_box").hide();
//     $("#search_1").on("click", function () {
//         $("#search_input_box").slideToggle();
//         $("#search_input").focus();
//     });
//     $("#close_search").on("click", function (e) {
//         e.preventDefault()
//         $("#search_input_box").slideUp(500)
//     })
// }(jQuery))

$(document).ready(function () {
    $("#search_input_box").hide();
    $("#search_1").on("click", function () {
        $("#search_input_box").slideToggle();
        $("#search_input").focus();
    });
    $("#close_search").on("click", function (e) {
        e.preventDefault()
        $("#search_input_box").slideUp(500)
    })
}(jQuery));

//? Mycode
// const searchInputBox = document.getElementById("search_input_box")
// const searchInput = document.getElementById("search_input")
// const searchOne = document.getElementById("search_1")
// const closeSearch = document.getElementById("close_search");

// searchInputBox.style.display = "none"
// searchOne.addEventListener("click", () => {
//     searchInputBox.style.display = searchInputBox.style.display === "none" ? "" : "none"
// })

// closeSearch.addEventListener("click", (e) => {
//     e.preventDefault()
//     searchInputBox.style.display = "none"
// })



// *Hamburger Change
var hamburger = document.getElementById("hamburger")
var barsMobile = document.getElementById("bars-mobile");


hamburger.addEventListener("click", () => {
    if (barsMobile.className == "fas fa-bars") {
        barsMobile.className = "fas fa-times"
        document.body.style.overflowY = "hidden"
    } else {
        barsMobile.className = "fas fa-bars"
        document.body.style.overflowY = "visible"
    }

})
