/* Login Guard - Protect admin pages by redirecting unauthenticated users to login */

let loggedInUser = JSON.parse(localStorage.getItem("fuelflowLoggedInUser"));

if (!loggedInUser) {
  window.location.href = "../login/login.html";
}

/* Page Navigation - Handle sidebar button clicks to switch between admin pages */

const navButtons = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    pages.forEach(function (page) {
      page.classList.remove("active-page");
    });

    navButtons.forEach(function (nav) {
      nav.classList.remove("active");
    });

    document.getElementById(button.dataset.page).classList.add("active-page");

    button.classList.add("active");
  });
});

/* Display Username - Show the logged-in admin's name in the top-right corner */

function displayUsername() {
  document.getElementById("currentUsername").textContent = loggedInUser.username
    ? "Welcome, " + loggedInUser.username
    : "";
}

displayUsername();

/* Get Users - Retrieve all registered users from browser localStorage */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("fuelflowUsers")) || [];
  } catch (e) {
    return [];
  }
}

/* Show Users - Display filtered user cards based on role and/or username search */

function showUsers(filterRole, filterUsername) {
  let users = getUsers();

  if (filterRole || filterUsername) {
    users = users.filter(function (user) {
      let match = true;

      if (filterRole && user.role !== filterRole) {
        match = false;
      }

      if (filterUsername && user.username !== filterUsername) {
        match = false;
      }

      return match;
    });
  }

  let list = document.getElementById("userList");

  list.innerHTML = "";

  if (users.length === 0) {
    list.textContent = "No users found.";

    return;
  }

  users.forEach(function (user) {
    let card = document.createElement("div");

    card.className = "user-card";

    let details = [
      ["Username", user.username],
      ["Password", user.password],
      ["Role", user.role],
    ];

    details.forEach(function (item) {
      let p = document.createElement("p");

      let strong = document.createElement("strong");

      strong.textContent = item[0] + ": ";

      p.appendChild(strong);

      p.appendChild(document.createTextNode(item[1]));

      card.appendChild(p);
    });

    list.appendChild(card);
  });
}

/* Search Users - Filter and display users when admin submits the search form */

const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let role = document.getElementById("searchRole").value.trim();
  let username = document.getElementById("searchUsername").value.trim();

  showUsers(role || null, username || null);
});

/* Add User Form - Create a new user account with username, password, and role */

const addUserForm = document.getElementById("addUserForm");
const addUserMessage = document.getElementById("addUserMessage");

addUserForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let addUsername = document.getElementById("addUsername").value.trim();
  let addPassword = document.getElementById("addPassword").value;
  let addRole = document.getElementById("addRole").value;

  addUserMessage.textContent = "";

  let users = [];

  try {
    users = JSON.parse(localStorage.getItem("fuelflowUsers")) || [];
  } catch (e) {
    console.error("Error reading users:", e);
    addUserMessage.textContent = "System error. Please try again.";
    addUserMessage.style.color = "#a94442";
    return;
  }

  if (!Array.isArray(users)) {
    users = [];
  }

  /* Check if username already exists to prevent duplicates */
  let userExists = users.find(function (u) {
    return u.username === addUsername;
  });

  if (userExists) {
    addUserMessage.textContent = "Username already exists.";
    addUserMessage.style.color = "#a94442";
    return;
  }

  let newUser = {
    name: addUsername,
    username: addUsername,
    password: addPassword,
    role: addRole,
  };

  users.push(newUser);

  try {
    localStorage.setItem("fuelflowUsers", JSON.stringify(users));
    addUserMessage.textContent = "User has been added.";
    addUserMessage.style.color = "#47734b";
    addUserForm.reset();
  } catch (e) {
    console.error("Error saving user:", e);
    addUserMessage.textContent = "System error. Please try again.";
    addUserMessage.style.color = "#a94442";
  }
});

/* Get Staff Sales - Retrieve all fuel sale transactions from staff module */

function getStaffSales() {
  try {
    return JSON.parse(localStorage.getItem("fuelflowStaffSales")) || [];
  } catch (e) {
    return [];
  }
}

/* Show Transactions - Display all staff sales as transaction cards with totals */

function showTransactions() {
  let sales = getStaffSales();

  let totalRevenue = 0;

  sales.forEach(function (sale) {
    totalRevenue += parseFloat(sale.total);
  });

  document.getElementById("transactionCount").textContent = sales.length;
  document.getElementById("transactionRevenue").textContent =
    totalRevenue.toFixed(2);

  let list = document.getElementById("transactionList");

  list.innerHTML = "";

  if (sales.length === 0) {
    list.textContent = "No transactions found.";

    return;
  }

  sales.forEach(function (sale) {
    let card = document.createElement("div");

    card.className = "transaction-card";

    let heading = document.createElement("h3");

    heading.textContent = "Transaction #" + sale.id;

    card.appendChild(heading);

    let details = [
      ["Fuel Type", sale.fuel],
      ["Quantity", sale.quantity + " Liters"],
      ["Price Per Liter", sale.price + " BDT"],
      ["Total Bill", sale.total + " BDT"],
      ["Vehicle Number", sale.vehicle],
      ["Payment Method", sale.payment],
      ["Date", sale.date],
      ["Time", sale.time],
    ];

    details.forEach(function (item) {
      let p = document.createElement("p");

      let strong = document.createElement("strong");

      strong.textContent = item[0] + ": ";

      p.appendChild(strong);

      p.appendChild(document.createTextNode(item[1]));

      card.appendChild(p);
    });

    list.appendChild(card);
  });
}

/* Dashboard - Display admin dashboard with user count, transaction count, and transaction list */

function showDashboard() {
  let users = getUsers();
  let sales = getStaffSales();

  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("totalTransactions").textContent = sales.length;

  showTransactions();
}

/* Logout - Clear admin session and redirect back to login page */

document.getElementById("logoutBtn").addEventListener("click", function () {
  let confirmLogout = confirm("Are you sure you want to logout?");

  if (confirmLogout) {
    localStorage.removeItem("fuelflowLoggedInUser");

    window.location.href = "../login/login.html";
  }
});

/* Initialize - Load dashboard content when admin page first loads */

showDashboard();