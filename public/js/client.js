let stripe;

//Functions For Enabling and Disabling Checkout Btn
function disablingCheckout() {
    const checkoutBtn = document.querySelector(".checkoutBtn")
    checkoutBtn.classList.add("dis")
    checkoutBtn.disabled = true
}
function enablingCheckout() {
    const checkoutBtn = document.querySelector(".checkoutBtn")
    checkoutBtn.classList.remove("dis")
    checkoutBtn.disabled = false
}

disablingCheckout()



//GET Stripe KEy
fetch("/checkout/stripe-key")
    .then(result => result.json())
    .then(data => setupElements(data))
    .then(({ stripe, card, cardNumber }) => {
        enablingCheckout()
        let form = document.querySelector(".checkout_form form");
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            pay(stripe, card, cardNumber);
        });
    })



//*===============SETTING UP ELEMENTS=================*//
function setupElements(data) {
    stripe = Stripe(data.publishableKey)
    let elements = stripe.elements({
        locale: window.__exampleLocale
    });

    // Floating labels
    let inputs = document.querySelectorAll('.checkout_form .input');

    Array.prototype.forEach.call(inputs, function (input) {
        input.addEventListener('focus', function () {
            input.classList.add('focused');
        });
        input.addEventListener('blur', function () {
            input.classList.remove('focused');
        });
        input.addEventListener('keyup', function () {
            if (input.value.length === 0) {
                input.classList.add('empty');
            } else {
                input.classList.remove('empty');
            }
        });
    });

    const elementStyles = {
        base: {
            color: '#32325D',
            fontWeight: 500,
            fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
            fontSize: '16px',
            fontSmoothing: 'antialiased',

            '::placeholder': {
                color: '#CFD7DF',
            },
            ':-webkit-autofill': {
                color: '#e39f48',
            },
        },
        invalid: {
            color: '#E25950',

            '::placeholder': {
                color: '#FFCCA5',
            },
        },
    };

    const elementClasses = {
        focus: 'focused',
        empty: 'empty',
        invalid: 'invalid',
    };

    var cardNumber = elements.create('cardNumber', {
        style: elementStyles,
        classes: elementClasses,
    });
    cardNumber.mount('#example2-card-number');

    let cardExpiry = elements.create('cardExpiry', {
        style: elementStyles,
        classes: elementClasses,
    });
    cardExpiry.mount('#example2-card-expiry');

    let cardCvc = elements.create('cardCvc', {
        style: elementStyles,
        classes: elementClasses,
    });

    cardCvc.mount('#example2-card-cvc');


    registerElements([cardNumber, cardExpiry, cardCvc]);

    return {
        stripe,
        card: cardCvc,
        cardNumber
    };
}

//Error Handling
function registerElements(elements) {
    let example = document.querySelector(".checkout_form")
    let form = example.querySelector("form")
    let error = form.querySelector(".error")
    let errorMessage = error.querySelector('.message')

    //ERROR
    let savedErrors = {}
    elements.forEach((element, idx) => {
        element.on("change", (event) => {
            if (event.error) {
                error.classList.remove('d-none')
                savedErrors[idx] = event.error.message
                errorMessage.innerText = event.error.message;
            } else {
                savedErrors[idx] = null

                let nextError = Object.keys(savedErrors)
                    .sort()
                    .reduce(function (maybeFoundError, key) {
                        return maybeFoundError || savedErrors[key];
                    }, null);

                if (nextError) {
                    errorMessage.innerText = nextError;
                } else {
                    error.classList.add('d-none');
                }
            }
        })
    })
}



//*===============PAYMENT=================*//

//Authentication
function handleAction(clientSecret) {
    stripe
        .handleCardAction(clientSecret)
        .then(data => {
            if (data.error) {
                showError("Your card was not authenticated, please try again");
            } else {

                fetch("/checkout/pay", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        paymentIntentId: data.paymentIntent.id
                    })
                })
                    .then(r => r.json())
                    .then((json) => {
                        if (json.error) {
                            showError(json.error);
                        } else {
                            orderComplete()

                        }
                    })

            }
        })
}


//PAY
function pay(stripe, card, cardNumber) {
    changeLoadingState(true);

    let orderData = {};
    stripe
        .createPaymentMethod("card", card)
        .then(result => {
            if (result.error) {
                showError(result.error.message)
            } else {
                const address = document.querySelector('#example2-address')
                const city = document.querySelector('#example2-city')
                const state = document.querySelector('#example2-state')
                const zip = document.querySelector('#example2-zip');

                const addititionalData = {
                    address_line1: address ? address.value : undefined,
                    address_city: city ? city.value : undefined,
                    address_state: state ? state.value : undefined,
                    address_zip: zip ? zip.value : undefined
                }

                orderData.paymentMethodId = result.paymentMethod.id

                return stripe.createToken(cardNumber, addititionalData)
            }
        })
        .then((otherData) => {
            if (otherData.token) {
                orderData.token = otherData.token.id
            }

            return fetch("/checkout/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            })
        })
        .then(res => { return res.json() })
        .then(response => {
            if (response.error) {
                showError(response.error)

            } else if (response.requiresAction) {

                const { clientSecret } = response
                handleAction(clientSecret)

            } else {
                orderComplete()
            }
        })
}



//*===============Messages=================*//
function orderComplete() {
    disablingCheckout()
    document.querySelector(".spinner").classList.remove("displayGone")
    document.querySelector(".checkout_form form").classList.remove("displayGone")
    document.querySelector(".checkout_form .success").classList.add("showUp")


    var i = 0;
    var txt = 'You are being redirected to homepage . . .';
    var speed = 100;
    (function typeWriter() {
        if (i < txt.length) {
            document.querySelector(".checkout_form .redirect").innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    })()

    setTimeout(() => {
        window.location.href = "/"
    }, 5000)
}


//ERROR
function showError(errorMsgText) {
    changeLoadingState(false);

    let error = document.querySelector(".checkout_form .error")
    error.classList.remove("d-none")

    let errorMsg = document.querySelector(".checkout_form .message");
    errorMsg.textContent = errorMsgText;

    setTimeout(function () {
        errorMsg.textContent = "";
        error.classList.add("d-none")
    }, 6000);

}


//*===============LOADING=================*//
function changeLoadingState(isLoading) {
    if (isLoading) {
        disablingCheckout()
        document.querySelector(".spinner").classList.add("displayGone")
        document.querySelector(".checkout_form form").classList.remove("displayGone")
    } else {
        enablingCheckout()
        document.querySelector(".spinner").classList.remove("displayGone")
        document.querySelector(".checkout_form form").classList.add("displayGone")
    }
}
