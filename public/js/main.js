//Loader

$('body').css({
    overflow: 'hidden'
});
$(window).on("load", function () {
    $(".loader").fadeOut("slow", function () {
        $('body').css({
            overflow: 'auto'
        });
    })
})

//* Scrolling
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

var review = $(".client_review_slider");
if (review.length) {
    review.owlCarousel({
        items: 1,
        loop: true,
        dots: true,
        autoplay: true,
        navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
        autoplayHoverPause: true,
        autoplayTimeout: 5000,
        nav: true,
        responsive: {
            0: {
                nav: false,
                dots: true
            },
            767: {
                nav: false,
                dots: true
            },
            992: {
                nav: true
            },
            1200: {
                nav: true
            },
            1600: {
                nav: true
            }
        }

    })
}

//video
$('.popup-youtube').magnificPopup({
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false
});


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

    $(".select_option_dropdown").hide()
    $(".select_option_list").click(function () {
        $(this).parent(".select_option").children(".select_option_dropdown").slideToggle('100')
        $(this).find(".right").toggleClass("fas fa-caret-down, fas fa-caret-up")
    })

    $(".wrapper .more").click(function (show) {
        var showMe = $(this)
            .closest(".product")
            .find(".container-prod");
        $(this)
            .closest(".wrapper")
            .find(".container-prod")
            .not(showMe)
            .removeClass("information");
        $(".container-prod").removeClass("social-sharing");
        showMe
            .stop(false, true)
            .toggleClass("information")
            .removeClass("social-sharing");
        show.preventDefault();
    });

    $(".wrapper .share").click(function (share) {
        var showMe = $(this)
            .closest(".product")
            .find(".container-prod");
        $(this)
            .closest(".wrapper")
            .find(".container-prod")
            .not(showMe)
            .removeClass("social-sharing");
        $(".container-prod").removeClass("information");
        showMe
            .stop(false, true)
            .toggleClass("social-sharing")
            .removeClass("information");
        share.preventDefault();
    });

    // $(".wrapper .add").click(function (share) {
    //     var showMe = $(this)
    //         .closest(".product")
    //         .find(".cart");
    //     showMe.stop(false, true).addClass("added");
    //     var showMe = $(this)
    //         .closest(".product")
    //         .find(".container-prod");
    //     showMe
    //         .stop(false, true)
    //         .removeClass("social-sharing")
    //         .removeClass("information");
    //     share.preventDefault();
    // });

}(jQuery));