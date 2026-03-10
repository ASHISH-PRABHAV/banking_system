const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));
// ===============================
// DATABASE CONNECTION
// ===============================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "banking_system"
});

db.connect(err => {
    if (err) throw err;
    console.log("Database connected");
});


// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
    res.send("Banking API Running");
});


// ===============================
// CUSTOMER AUTH
// ===============================

app.post("/signup", (req, res) => {

    const { name, email, password, phone, address, dob } = req.body;

    const sql = `
    INSERT INTO Customer(name,email,password,phone,address,dob)
    VALUES (?,?,?,?,?,?)
    `;

    db.query(sql, [name, email, password, phone, address, dob], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Signup failed");
        }

        res.send("Customer registered successfully");
    });

});


app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM Customer WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) return res.send("Login error");

        if (result.length === 0) {
            res.send("Invalid credentials");
        } else {
            res.json(result);
        }

    });

});


// ===============================
// ADMIN LOGIN
// ===============================

app.post("/adminLogin", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM Admin WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) return res.send("Admin login error");

        if (result.length === 0) {
            res.send("Invalid admin credentials");
        } else {
            res.json(result);
        }

    });

});


// ===============================
// CUSTOMER MANAGEMENT (ADMIN)
// ===============================

app.get("/customers", (req, res) => {

    db.query("SELECT * FROM Customer", (err, result) => {
        if (err) return res.send("Error fetching customers");

        res.json(result);
    });

});


app.delete("/deleteCustomer/:id", (req, res) => {

    const id = req.params.id;

    db.query("DELETE FROM Customer WHERE id=?", [id], (err) => {

        if (err) return res.send("Delete failed");

        res.send("Customer deleted");

    });

});


// ===============================
// ACCOUNT MANAGEMENT
// ===============================

app.post("/createAccount", (req, res) => {

    const { customer_id, branch_id, account_type } = req.body;

    const sql = `
    INSERT INTO Account(customer_id,branch_id,account_type,balance)
    VALUES (?,?,?,0)
    `;

    db.query(sql, [customer_id, branch_id, account_type], (err) => {

        if (err) return res.send("Account creation failed");

        res.send("Account created successfully");

    });

});


app.get("/accounts", (req, res) => {

    db.query("SELECT * FROM Account", (err, result) => {
        if (err) return res.send("Error fetching accounts");

        res.json(result);
    });

});

// ===============================
// CHECK BALANCE WITH PASSWORD
// ===============================

app.post("/checkBalance", (req, res) => {

    const { customer_id, account_id, password } = req.body;

    const verifyUser = `
    SELECT * FROM Customer 
    WHERE customer_id=? AND password=?
    `;

    db.query(verifyUser, [customer_id, password], (err, result) => {

        if (err) return res.send("Verification error");

        if (result.length === 0) {
            return res.send("Incorrect password");
        }

        const sql = `
        SELECT balance 
        FROM Account 
        WHERE account_id=? AND customer_id=?
        `;

        db.query(sql, [account_id, customer_id], (err, acc) => {

            if (err) return res.send("Error fetching balance");

            if (acc.length === 0) {
                return res.send("Account not found");
            }

            res.json(acc[0]);

        });

    });

});

// ===============================
// TRANSACTION HISTORY WITH PASSWORD
// ===============================

// ===============================
// TRANSACTION HISTORY WITH PASSWORD
// ===============================

app.post("/accountTransactionsSecure", (req, res) => {

    const { customer_id, account_id, password } = req.body;

    const verify = `
    SELECT * FROM Customer
    WHERE customer_id=? AND password=?
    `;

    db.query(verify, [customer_id, password], (err, user) => {

        if (err) return res.send("Verification error");

        if (user.length === 0) {
            return res.send("Incorrect password");
        }

        const sql = `
        SELECT *
        FROM Transactions
        WHERE account_id=?
        ORDER BY transaction_date DESC
        `;

        db.query(sql, [account_id], (err, result) => {

            if (err) return res.send("Error fetching history");

            res.json(result);

        });

    });

});

// ===============================
// CUSTOMER ACCOUNTS (ONLY THEIR DATA)
// ===============================

app.get("/customerAccounts/:customer_id", (req, res) => {

    const customer_id = req.params.customer_id;

    const sql = "SELECT * FROM Account WHERE customer_id=?";

    db.query(sql, [customer_id], (err, result) => {

        if (err) return res.send("Error fetching accounts");

        res.json(result);

    });

});


// ===============================
// DEPOSIT
// ===============================

app.post("/deposit", (req, res) => {

    const { account_id, amount } = req.body;

    const updateBalance = `
    UPDATE Account
    SET balance = balance + ?
    WHERE account_id = ?
    `;

    db.query(updateBalance, [amount, account_id], (err) => {

        if (err) return res.send("Deposit failed");

        const recordTransaction = `
        INSERT INTO Transactions(account_id,transaction_type,amount)
        VALUES (?, 'DEPOSIT', ?)
        `;

        db.query(recordTransaction, [account_id, amount]);

        res.send("Deposit successful");

    });

});


// ===============================
// WITHDRAW
// ===============================

app.post("/withdraw", (req, res) => {

    const { account_id, amount } = req.body;

    const checkBalance = "SELECT balance FROM Account WHERE account_id=?";

    db.query(checkBalance, [account_id], (err, result) => {

        if (err) return res.send("Error checking balance");

        if (result[0].balance < amount) {
            return res.send("Insufficient balance");
        }

        const withdraw = `
        UPDATE Account
        SET balance = balance - ?
        WHERE account_id = ?
        `;

        db.query(withdraw, [amount, account_id], (err) => {

            if (err) return res.send("Withdrawal failed");

            const record = `
            INSERT INTO Transactions(account_id,transaction_type,amount)
            VALUES (?, 'WITHDRAW', ?)
            `;

            db.query(record, [account_id, amount]);

            res.send("Withdrawal successful");

        });

    });

});


// ===============================
// TRANSFER
// ===============================

// ===============================
// TRANSFER
// ===============================

app.post("/transfer", (req, res) => {

    const { from_account, to_account, amount } = req.body;

    db.beginTransaction(err => {

        if (err) throw err;

        const withdraw = "UPDATE Account SET balance = balance - ? WHERE account_id=?";

        db.query(withdraw, [amount, from_account], err => {

            if (err) {
                return db.rollback(() => res.send("Transfer failed"));
            }

            const deposit = "UPDATE Account SET balance = balance + ? WHERE account_id=?";

            db.query(deposit, [amount, to_account], err => {

                if (err) {
                    return db.rollback(() => res.send("Transfer failed"));
                }

                // RECORD SENDER TRANSACTION
                const recordSender = `
                INSERT INTO Transactions(account_id,transaction_type,amount)
                VALUES (?, 'TRANSFER_OUT', ?)
                `;

                db.query(recordSender, [from_account, amount], err => {

                    if (err) {
                        return db.rollback(() => res.send("Transaction logging failed"));
                    }

                    // RECORD RECEIVER TRANSACTION
                    const recordReceiver = `
                    INSERT INTO Transactions(account_id,transaction_type,amount)
                    VALUES (?, 'TRANSFER_IN', ?)
                    `;

                    db.query(recordReceiver, [to_account, amount], err => {

                        if (err) {
                            return db.rollback(() => res.send("Transaction logging failed"));
                        }

                        db.commit(err => {

                            if (err) {
                                return db.rollback(() => res.send("Transfer failed"));
                            }

                            res.send("Transfer successful");

                        });

                    });

                });

            });

        });

    });

});


// ===============================
// CUSTOMER TRANSACTION HISTORY
// ===============================

app.get("/accountTransactions/:account_id", (req, res) => {

    const account_id = req.params.account_id;

    const sql = "SELECT * FROM Transactions WHERE account_id=?";

    db.query(sql, [account_id], (err, result) => {

        if (err) return res.send("Error fetching transactions");

        res.json(result);

    });

});


// ===============================
// ALL TRANSACTIONS (ADMIN)
// ===============================

app.get("/transactions", (req, res) => {

    db.query("SELECT * FROM Transactions", (err, result) => {

        if (err) return res.send("Error fetching transactions");

        res.json(result);

    });

});


// ===============================
// LOAN APPLICATION
// ===============================

app.post("/applyLoan", (req, res) => {

    const { customer_id, amount, loan_type } = req.body;

    const sql = `
    INSERT INTO Loan(customer_id,amount,loan_type,status)
    VALUES (?,?,?, 'PENDING')
    `;

    db.query(sql, [customer_id, amount, loan_type], (err) => {

        if (err) return res.send("Loan application failed");

        res.send("Loan applied successfully");

    });

});


// ===============================
// CUSTOMER LOANS
// ===============================

app.get("/customerLoans/:customer_id", (req, res) => {

    const customer_id = req.params.customer_id;

    const sql = "SELECT * FROM Loan WHERE customer_id=?";

    db.query(sql, [customer_id], (err, result) => {

        if (err) return res.send("Error fetching loans");

        res.json(result);

    });

});


// ===============================
// ADMIN PENDING LOANS
// ===============================

app.get("/admin/pendingLoans", (req, res) => {

    const sql = "SELECT * FROM Loan WHERE status='PENDING'";

    db.query(sql, (err, result) => {

        if (err) return res.send("Error fetching pending loans");

        res.json(result);

    });

});


// ===============================
// ADMIN APPROVE LOAN
// ===============================

app.post("/approveLoan", (req, res) => {

    const { loan_id } = req.body;

    const sql = "UPDATE Loan SET status='APPROVED' WHERE loan_id=?";

    db.query(sql, [loan_id], (err) => {

        if (err) return res.send("Loan approval failed");

        res.send("Loan approved");

    });

});


// ===============================
// LOAN PAYMENT
// ===============================

app.post("/payLoan", (req, res) => {

    const { loan_id, amount } = req.body;

    const sql = `
    INSERT INTO LoanPayment(loan_id,amount)
    VALUES (?,?)
    `;

    db.query(sql, [loan_id, amount], (err) => {

        if (err) return res.send("Loan payment failed");

        res.send("Loan payment successful");

    });

});


// ===============================
// LOAN PAYMENT HISTORY
// ===============================

app.get("/loanPayments/:loan_id", (req, res) => {

    const loan_id = req.params.loan_id;

    const sql = "SELECT * FROM LoanPayment WHERE loan_id=?";

    db.query(sql, [loan_id], (err, result) => {

        if (err) return res.send("Error fetching payments");

        res.json(result);

    });

});


// ===============================
// BRANCHES
// ===============================

app.get("/branches", (req, res) => {

    db.query("SELECT * FROM Branch", (err, result) => {

        if (err) return res.send("Error fetching branches");

        res.json(result);

    });

});


app.post("/addBranch", (req, res) => {

    const { branch_name, location } = req.body;

    const sql = `
    INSERT INTO Branch(branch_name,location)
    VALUES (?,?)
    `;

    db.query(sql, [branch_name, location], (err) => {

        if (err) return res.send("Branch creation failed");

        res.send("Branch added successfully");

    });

});


// ===============================
// ADMIN DASHBOARD STATS
// ===============================

app.get("/admin/totalCustomers", (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM Customer", (err, result) => {
        res.json(result);
    });

});

app.get("/admin/totalAccounts", (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM Account", (err, result) => {
        res.json(result);
    });

});

app.get("/admin/totalLoans", (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM Loan", (err, result) => {
        res.json(result);
    });

});

app.get("/admin/totalTransactions", (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM Transactions", (err, result) => {
        res.json(result);
    });

});


// ===============================
// SERVER START
// ===============================

app.listen(5000, () => {
    console.log("Server running on port 5000");
});