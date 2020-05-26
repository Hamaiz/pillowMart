//*============Materialize===========*//
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);

    const el = document.querySelector(".tabs")
    M.Tabs.init(el);
    M.Modal.init(document.querySelectorAll('.modal'));
});



//*============Loader===========*//
document.body.style.overflow = "hidden";
window.addEventListener("load", function () {
    setTimeout(() => {
        document.body.style.overflowY = "visible"
        document.querySelector(".loader").classList.add("loaded")
    }, 100);
})

//*============Chart===========*//
let ctx = document.getElementById('myChart')
if (ctx) {
    ctx.height = 300;
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["", 1, 2, 3, 4, 5],
            datasets: [{
                label: 'Products Success',

                data: [7, 4, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    let users = document.getElementById('myChartUsers')
    users.height = 300;
    var myLineChartUsers = new Chart(users, {
        type: 'line',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: 'Products Success',

                data: [1, 5, 4, 3, 2, 6],
                backgroundColor: [
                    'rgba(99, 193, 255, 0.2)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}


//*============CheckBox===========*//
const checkBoxSwitch = document.querySelectorAll(".checkBoxSwitch")
if (checkBoxSwitch) {
    checkBoxSwitch.forEach(e => {
        e.addEventListener("click", function (event) {
            event.preventDefault()

            fetch(`/cf5480873fae9cf6c5c9/edit-paid/${this.dataset.checkboxid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: this.dataset.checkboxid
                })
            })
                .then(r => {
                    window.location.reload()
                })

        })
    })
}
