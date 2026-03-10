const API = "http://localhost:5000"

function adminLogin() {

    fetch(API + "/adminLogin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    })
        .then(res => res.json())
        .then(() => {
            window.location = "dashboard.html"
        })

}

function loadDashboard() {

    fetch(API + "/admin/totalCustomers")
        .then(res => res.json())
        .then(data => {
            document.getElementById("customers").innerText = data[0].total
        })

    fetch(API + "/admin/totalAccounts")
        .then(res => res.json())
        .then(data => {
            document.getElementById("accounts").innerText = data[0].total
        })

    fetch(API + "/admin/totalLoans")
        .then(res => res.json())
        .then(data => {
            document.getElementById("loans").innerText = data[0].total
        })

}

loadDashboard()