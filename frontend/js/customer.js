const API = "http://localhost:5000"


// ===============================
// SIGNUP
// ===============================

function signup() {

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const phone = document.getElementById("phone").value
    const address = document.getElementById("address").value
    const dob = document.getElementById("dob").value

    console.log("Signup Data:", name, email, phone)

    fetch(API + "/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password,
            phone,
            address,
            dob
        })
    })
        .then(res => res.text())
        .then(data => {
            console.log("Signup response:", data)
            alert(data)
        })
        .catch(err => {
            console.error("Signup Error:", err)
        })

}



// ===============================
// LOGIN
// ===============================

function login() {

    fetch(API + "/login", {
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
        .then(data => {

            console.log("Login response:", data)

            if (!data || data.length === 0) {
                alert("Invalid login credentials")
                return
            }

            localStorage.setItem("customer_id", data[0].customer_id)

            window.location = "dashboard.html"

        })

}



// ===============================
// CREATE ACCOUNT
// ===============================

function createAccount() {

    const customer = localStorage.getItem("customer_id")
    const branch = document.getElementById("branch_id").value
    const type = document.getElementById("account_type").value

    console.log("Create Account Attempt")
    console.log("Customer:", customer)
    console.log("Branch:", branch)
    console.log("Type:", type)

    if (!customer) {
        alert("Customer not logged in")
        return
    }

    if (!branch || !type) {
        alert("Please fill branch and account type")
        return
    }

    fetch(API + "/createAccount", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            customer_id: customer,
            branch_id: branch,
            account_type: type
        })

    })

        .then(res => res.text())
        .then(data => {

            console.log("Create Account Response:", data)

            alert(data)

            loadAccounts()

        })
        .catch(err => {

            console.error("Create Account Error:", err)

        })

}



// ===============================
// LOAD CUSTOMER ACCOUNTS
// ===============================

function loadAccounts() {

    const id = localStorage.getItem("customer_id")

    console.log("Loading accounts for customer:", id)

    if (!id) {
        console.log("Customer ID missing")
        return
    }

    fetch(API + "/customerAccounts/" + id)

        .then(res => res.json())

        .then(data => {

            console.log("Accounts data:", data)

            let table = document.getElementById("accountsTable")

            table.innerHTML = `
            <tr>
            <th>Account ID</th>
            <th>Branch</th>
            <th>Balance</th>
            </tr>
            `

            data.forEach(acc => {

                table.innerHTML += `
<tr>
<td>${acc.account_id}</td>
<td>${acc.branch_id}</td>
<td>${acc.balance}</td>
</tr>
`

            })

        })
        .catch(err => {
            console.error("Load Accounts Error:", err)
        })

}



// ===============================
// CHECK BALANCE
// ===============================

function checkBalance() {

    const account = document.getElementById("balanceAccount").value
    const customer = localStorage.getItem("customer_id")

    const password = prompt("Enter password to check balance")

    if (!password) {
        alert("Verification cancelled")
        return
    }

    fetch(API + "/checkBalance", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            customer_id: customer,
            account_id: account,
            password: password
        })

    })

    .then(res => res.json())
    .then(data => {

        document.getElementById("balanceResult").innerText =
            "Current Balance: ₹" + data.balance

    })
}


// ===============================
// DEPOSIT MONEY
// ===============================

function deposit() {

    const account = document.getElementById("depositAccount").value
    const amount = document.getElementById("depositAmount").value
    const customer = localStorage.getItem("customer_id")

    const password = prompt("Enter your password to confirm deposit")

    if (!password) {
        alert("Transaction cancelled")
        return
    }

    console.log("Deposit:", account, amount, "Customer:", customer)

    fetch(API + "/deposit", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            account_id: account,
            amount: amount,
            customer_id: customer,
            password: password
        })

    })

        .then(res => res.text())
        .then(data => {

            console.log("Deposit Response:", data)

            alert(data)

            loadAccounts()   // refresh balance

        })
        .catch(err => {
            console.error("Deposit Error:", err)
        })

}



// ===============================
// WITHDRAW MONEY
// ===============================

function withdraw() {

    const account = document.getElementById("withdrawAccount").value
    const amount = document.getElementById("withdrawAmount").value
    const customer = localStorage.getItem("customer_id")

    const password = prompt("Enter your password to confirm withdrawal")

    if (!password) {
        alert("Transaction cancelled")
        return
    }

    console.log("Withdraw:", account, amount, "Customer:", customer)

    fetch(API + "/withdraw", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            account_id: account,
            amount: amount,
            customer_id: customer,
            password: password
        })

    })

        .then(res => res.text())
        .then(data => {

            console.log("Withdraw Response:", data)

            alert(data)

            loadAccounts()   // refresh balance

        })
        .catch(err => {
            console.error("Withdraw Error:", err)
        })

}



// ===============================
// SEND MONEY (TRANSFER)
// ===============================

function transfer() {

    const from = document.getElementById("fromAccount").value
    const to = document.getElementById("toAccount").value
    const amount = document.getElementById("transferAmount").value
    const customer = localStorage.getItem("customer_id")

    const password = prompt("Enter your password to confirm transfer")

    if (!password) {
        alert("Transaction cancelled")
        return
    }

    console.log("Transfer:", from, to, amount, "Customer:", customer)

    fetch(API + "/transfer", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            from_account: from,
            to_account: to,
            amount: amount,
            customer_id: customer,
            password: password
        })

    })

        .then(res => res.text())
        .then(data => {

            console.log("Transfer Response:", data)

            alert(data)

            loadAccounts()   // refresh balance

        })
        .catch(err => {
            console.error("Transfer Error:", err)
        })

}



// ===============================
// REDIRECT TO HISTORY PAGE
// ===============================

function goHistory() {

    window.location = "history.html"

}



// ===============================
// LOAD TRANSACTION HISTORY
// ===============================

function loadHistory() {

    const account = document.getElementById("historyAccount").value
    const customer = localStorage.getItem("customer_id")

    const password = prompt("Enter password to view transaction history")

    if (!password) {
        alert("Verification cancelled")
        return
    }

    fetch(API + "/accountTransactionsSecure", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            customer_id: customer,
            account_id: account,
            password: password
        })

    })

    .then(res => res.json())
    .then(data => {

        let table = document.getElementById("historyTable")

        table.innerHTML = `
        <tr>
        <th>ID</th>
        <th>Account</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Date</th>
        </tr>
        `

        data.forEach(tx => {

            table.innerHTML += `
<tr>
<td>${tx.transaction_id}</td>
<td>${tx.account_id}</td>
<td>${tx.transaction_type}</td>
<td>${tx.amount}</td>
<td>${new Date(tx.transaction_date).toLocaleString()}</td>
</tr>
`

        })

    })

}

// ===============================
// ADMIN ACCESS SECURITY
// ===============================

function adminAccess(){

    const code = prompt("Enter Admin Security Code")

    if(code === "987654321"){

        window.location = "../admin/dashboard.html"

    }
    else{

        alert("Invalid Admin Security Code")

    }

}