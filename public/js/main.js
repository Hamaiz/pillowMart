console.log = function () { }
//*===============Loader=================*//
document.body.style.overflow = "hidden";
window.addEventListener("load", () => {
    setTimeout(() => {
        document.querySelector(".loader").classList.add("loaded")
        document.body.style.overflowY = "visible"
    }, 100);
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


//*===============ABOUT VIDEO================*//
const iframeClose = document.querySelector(".iframeClose")
const iframeYT = document.querySelector(".iframeYT")
if (iframeYT) {
    iframeClose.addEventListener("click", () => {
        const iframeSrc = iframeYT.src
        iframeYT.src = iframeSrc
    })
}


//*===============Option Extension===============*//
const optionList = document.querySelector(".select_option_list")
if (optionList) {
    optionList.addEventListener("click", () => {
        const dropDown = document.querySelector(".select_option_dropdown")
        dropDown.classList.toggle("extended")
    })
}


//*============Increment============*//
const incrementInput = document.getElementById("addOne")
const decrementInput = document.getElementById("removeOne")
const itemInput = document.querySelector(".detail_count_item_input")
const cartBtn = document.querySelector(".detail_cart_btn")
if (itemInput) {
    incrementInput.addEventListener("click", () => {
        let value = itemInput.value
        value++
        itemInput.value = value

        // const urlId = window.location.pathname.substring(5)
        let urlId = cartBtn.href
        if (urlId.match(/([?]qty=\d)/g)) {
            urlId = urlId.replace(/([?]qty=\d)/g, "")
            const btnAnchor = urlId + "?qty=" + itemInput.value
            cartBtn.href = btnAnchor
        } else {
            const btnAnchor = urlId + "?qty=" + itemInput.value
            cartBtn.href = btnAnchor
        }

    })
    decrementInput.addEventListener("click", () => {
        let value = itemInput.value
        if (value > 1) value--
        itemInput.value = value

        // const urlId = window.location.pathname.substring(5)
        // const btnAnchor = "/cart/add" + urlId + "?qty=" + itemInput.value
        // cartBtn.href = btnAnchor
        let urlId = cartBtn.href
        if (urlId.match(/([?]qty=\d)/g)) {
            urlId = urlId.replace(/([?]qty=\d)/g, "")
            const btnAnchor = urlId + "?qty=" + itemInput.value
            cartBtn.href = btnAnchor
        } else {
            const btnAnchor = urlId + "?qty=" + itemInput.value
            cartBtn.href = btnAnchor
        }
    })
}


//*=============Quantity Cart===============*//
const numIn = document.querySelectorAll(".num-in span")
if (numIn) {
    numIn.forEach(element => {
        if (element.classList.contains("minus")) {
            element.addEventListener("click", e => {
                const numIn = e.target.parentElement.children[1]
                let count = parseFloat(numIn.value) - 1
                count = count < 1 ? 1 : count
                numIn.value = count
            })
        } else {
            element.addEventListener("click", e => {
                const numIn = e.target.parentElement.children[1]
                let count = parseFloat(numIn.value) + 1
                numIn.value = count
            })
        }
    })
}


//*============Clear Cart=============*//
const clearCart = document.querySelector(".cartItem_product_all")
if (clearCart) {
    clearCart.addEventListener("click", e => {
        if (!confirm('Are you sure?')) e.preventDefault();
    }, false)
}


//*=========Confirmation========*//
const eliminate = document.querySelectorAll("a.eliminating")
if (eliminate) {
    eliminate.forEach(element => {
        element.addEventListener("click", e => {
            if (!confirm('Are you sure?')) e.preventDefault();
        }, false)
    })
}

//*=========Delete Image========*//
const pressDisable = document.querySelectorAll(".pressDisable")
pressDisable.forEach(e => {
    e.addEventListener("click", function () {
        this.classList.add("disabled")
    })
})

//*=========Disable========*//
const eliminateAnchor = document.querySelectorAll("a.eliminate")
if (eliminateAnchor) {
    eliminateAnchor.forEach(element => {
        element.addEventListener("click", e => {
            if (!confirm('Are you sure?')) {
                e.preventDefault();

                const pressDisable = document.querySelectorAll(".pressDisable")
                pressDisable.forEach(e => {
                    e.classList.remove("disabled")
                })
            }
        }, false)
    })
}

//*=========Dropzzone========*//
const dropZone = document.querySelector('.dropzone')
if (dropZone) {
    Dropzone.options.dropzoneForm = {
        acceptedFiles: "image/*",
        init: function () {
            this.on("addedfile", function (file) {
                alert("Please Wait a few minutes for the page to restart ")
            })
            this.on("queuecomplete", function (file) {
                setTimeout(() => {
                    location.reload()
                }, 1000);
            })
        }
    }
}


//Copy Image
let copyText = document.querySelectorAll('.copyText')
if (copyText) {
    copyText.forEach(element => {
        element.addEventListener('click', function (e) {
            e.preventDefault()
            const copiedText = this.href

            document.addEventListener('copy', function (e) {
                e.clipboardData.setData('text/plain', copiedText)
                e.preventDefault()
            }, true)

            document.execCommand('copy')
            alert('Image link copied');

        })
    })
}