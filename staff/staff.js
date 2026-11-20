/* Login Guard */

let loggedInUser = JSON.parse(localStorage.getItem("fuelflowLoggedInUser"));

if (!loggedInUser) {
  window.location.href = "../login/login.html";
}

/* Page Navigation */

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

/* Auto-set username from login */

function displayUsername() {
  document.getElementById("currentUsername").textContent = loggedInUser.username
    ? "Hello, " + loggedInUser.username
    : "";
}

displayUsername();

/* Fuel Sales System */

const saleForm = document.getElementById("saleForm");
const calculateBtn = document.getElementById("calculateBtn");
const billSummary = document.getElementById("billSummary");

function getSales() {
  return JSON.parse(localStorage.getItem("fuelflowStaffSales")) || [];
}

function showSales() {
  let sales = getSales();

  let list = document.getElementById("transactionList");

  list.innerHTML = "";

  if (sales.length === 0) {
    list.textContent = "No transactions yet.";

    return;
  }

  sales.forEach(function (sale, index) {
    let card = document.createElement("div");

    card.className = "transaction-card";

    let heading = document.createElement("h3");

    heading.textContent = "Transaction #" + (index + 1);

    card.appendChild(heading);

    let details = [
      ["Fuel Station", "ABC Fuel Station"],
      ["Fuel Type", sale.fuel],
      ["Quantity", sale.quantity + " Liters"],
      ["Price Per Liter", sale.price + " BDT"],
      ["Vehicle Number", sale.vehicle],
      ["Payment Method", sale.payment],
      ["Total Bill", sale.total + " BDT"],
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

  showDashboard();
}

/* Calculate Bill */

calculateBtn.addEventListener("click", function () {
  let price = parseFloat(document.getElementById("pricePerLiter").value);
  let quantity = parseFloat(document.getElementById("quantity").value);
  let billMessage = document.getElementById("billMessage");

  if (isNaN(price) || price < 0) {
    billMessage.textContent = "Please enter a valid price per liter.";
    billSummary.style.display = "none";
    return;
  }

  if (isNaN(quantity) || quantity <= 0) {
    billMessage.textContent = "Please enter a valid quantity.";
    billSummary.style.display = "none";
    return;
  }

  let total = price * quantity;

  document.getElementById("billFuel").textContent =
    document.getElementById("fuelType").value;
  document.getElementById("billPrice").textContent = price.toFixed(2);
  document.getElementById("billQty").textContent = quantity.toFixed(2);
  document.getElementById("billVehicle").textContent =
    document.getElementById("vehicleNumber").value;
  document.getElementById("billPayment").textContent =
    document.getElementById("paymentMethod").value;
  document.getElementById("billTotal").textContent = total.toFixed(2);

  billMessage.textContent = "";
  billSummary.style.display = "block";
});

/* Record Fuel Sale */

saleForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let price = parseFloat(document.getElementById("pricePerLiter").value);
  let quantity = parseFloat(document.getElementById("quantity").value);
  let total = price * quantity;

  let now = new Date();

  let sale = {
    id: getSales().length + 1,
    fuel: document.getElementById("fuelType").value,
    quantity: quantity.toFixed(2),
    price: price.toFixed(2),
    total: total.toFixed(2),
    vehicle: document.getElementById("vehicleNumber").value,
    payment: document.getElementById("paymentMethod").value,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  let sales = getSales();

  sales.push(sale);

  localStorage.setItem("fuelflowStaffSales", JSON.stringify(sales));

  document.getElementById("saleMessage").textContent =
    "Sale recorded successfully! Total Bill: " + total.toFixed(2) + " BDT";

  saleForm.reset();
  billSummary.style.display = "none";
  document.getElementById("billMessage").textContent = "";

  showSales();
});

/* Dashboard */

function showDashboard() {
  let sales = getSales();

  let today = new Date().toLocaleDateString();

  let todaySales = sales.filter(function (sale) {
    return sale.date === today;
  });

  let totalRevenue = 0;

  todaySales.forEach(function (sale) {
    totalRevenue += parseFloat(sale.total);
  });

  document.getElementById("salesCount").textContent = todaySales.length;
  document.getElementById("totalRevenue").textContent =
    totalRevenue.toFixed(2);
}

/* Update Password */

const passwordForm = document.getElementById("passwordForm");

passwordForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let currentPassword = document.getElementById("currentPassword").value;

  let newPassword = document.getElementById("newPassword").value;

  let confirmPassword = document.getElementById("confirmPassword").value;

  let message = document.getElementById("passwordMessage");

  if (newPassword.length < 8) {
    message.textContent = "Password must contain at least 8 characters.";
  } else if (newPassword !== confirmPassword) {
    message.textContent = "New passwords do not match.";
  } else if (newPassword === currentPassword) {
    message.textContent =
      "New password must be different from current password.";
  } else {
    message.textContent = "Password form validated successfully.";

    passwordForm.reset();
  }
});

/* Receipt System */

const receiptForm = document.getElementById("receiptForm");
const viewReceiptBtn = document.getElementById("viewReceiptBtn");
const receiptDisplay = document.getElementById("receiptDisplay");
const receiptMessage = document.getElementById("receiptMessage");

viewReceiptBtn.addEventListener("click", function () {
  let receiptId = parseInt(document.getElementById("receiptId").value);

  let sales = getSales();

  let sale = sales.find(function (s) {
    return s.id === receiptId;
  });

  if (!sale) {
    receiptDisplay.style.display = "none";
    receiptMessage.textContent = "Transaction #" + receiptId + " not found.";
    return;
  }

  receiptMessage.textContent = "";

  document.getElementById("rId").textContent = sale.id;
  document.getElementById("rDate").textContent = sale.date;
  document.getElementById("rFuel").textContent = sale.fuel;
  document.getElementById("rQty").textContent = sale.quantity;
  document.getElementById("rPrice").textContent = sale.price;
  document.getElementById("rVehicle").textContent = sale.vehicle;
  document.getElementById("rPayment").textContent = sale.payment;
  document.getElementById("rTotal").textContent = sale.total;

  receiptDisplay.style.display = "block";
});

/* Print Receipt */

document.getElementById("printReceiptBtn").addEventListener("click", function () {
  window.print();
});

/* Initialize */

showSales();

/* Logout */

document.getElementById("logoutBtn").addEventListener("click", function () {
  let confirmLogout = confirm("Are you sure you want to logout?");

  if (confirmLogout) {
    localStorage.removeItem("fuelflowLoggedInUser");

    window.location.href = "../login/login.html";
  }
});