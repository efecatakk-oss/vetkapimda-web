const firebaseConfig = {
  apiKey: "AIzaSyAl563jzr7ddmdaOEWXrm1Bx7hFEYXY-PI",
  authDomain: "vetkapim.firebaseapp.com",
  projectId: "vetkapim",
  storageBucket: "vetkapim.firebasestorage.app",
  messagingSenderId: "756311357966",
  appId: "1:756311357966:web:4d5442761899234de05a5f",
  measurementId: "G-QF8KPXNFDF",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAIL = "vetkapim@gmail.com";

const authPanel = document.getElementById("authPanel");
const servicePanel = document.getElementById("servicePanel");
const shopPanel = document.getElementById("shopPanel");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

const serviceList = document.getElementById("serviceList");
const addServiceBtn = document.getElementById("addServiceBtn");
const serviceDialog = document.getElementById("serviceDialog");
const serviceForm = document.getElementById("serviceForm");

const productList = document.getElementById("productList");
const addProductBtn = document.getElementById("addProductBtn");
const productDialog = document.getElementById("productDialog");
const productForm = document.getElementById("productForm");

let editingServiceId = null;
let editingProductId = null;

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  if (!email || !password) {
    authStatus.textContent = "E-posta ve şifre girin.";
    return;
  }
  auth.signInWithEmailAndPassword(email, password).catch((error) => {
    authStatus.textContent = error.message;
  });
});

logoutBtn.addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged((user) => {
  if (user && user.email === ADMIN_EMAIL) {
    authPanel.hidden = true;
    servicePanel.hidden = false;
    shopPanel.hidden = false;
    loadServiceItems();
    loadShopProducts();
  } else {
    if (user && user.email !== ADMIN_EMAIL) {
      auth.signOut();
    }
    authPanel.hidden = false;
    servicePanel.hidden = true;
    shopPanel.hidden = true;
  }
});

function loadServiceItems() {
  db.collection("serviceItems")
    .orderBy("order")
    .get()
    .then((snapshot) => {
      serviceList.innerHTML = "";
      snapshot.forEach((doc) => {
        const item = doc.data();
        if (item.active === false) return;
        const row = document.createElement("div");
        row.className = "list-item";
        row.innerHTML = `
          <strong>${item.title}</strong>
          <span>${item.category}</span>
          <span>${item.price} TL</span>
          <div class="item-actions">
            <button class="edit" data-id="${doc.id}">Düzenle</button>
            <button class="delete" data-id="${doc.id}">Sil</button>
          </div>
        `;
        serviceList.appendChild(row);
      });
      bindServiceActions();
    });
}

function bindServiceActions() {
  serviceList.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", () => openServiceDialog(btn.dataset.id));
  });
  serviceList.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      db.collection("serviceItems").doc(btn.dataset.id).delete();
      loadServiceItems();
    });
  });
}

addServiceBtn.addEventListener("click", () => openServiceDialog(null));
document.getElementById("serviceCancel").addEventListener("click", () => {
  serviceDialog.close();
});

function openServiceDialog(id) {
  editingServiceId = id;
  serviceForm.reset();
  if (id) {
    db.collection("serviceItems")
      .doc(id)
      .get()
      .then((doc) => {
        const item = doc.data();
        document.getElementById("serviceTitle").value = item.title || "";
        document.getElementById("serviceCategory").value = item.category || "procedures";
        document.getElementById("servicePrice").value = item.price || 0;
        document.getElementById("serviceOrder").value = item.order || 0;
        document.getElementById("serviceActive").checked = item.active !== false;
        serviceDialog.showModal();
      });
  } else {
    document.getElementById("serviceActive").checked = true;
    serviceDialog.showModal();
  }
}

serviceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    title: document.getElementById("serviceTitle").value.trim(),
    category: document.getElementById("serviceCategory").value,
    price: Number(document.getElementById("servicePrice").value),
    order: Number(document.getElementById("serviceOrder").value || 0),
    active: document.getElementById("serviceActive").checked,
  };
  const ref = db.collection("serviceItems");
  const action = editingServiceId ? ref.doc(editingServiceId).set(payload) : ref.add(payload);
  action.then(() => {
    serviceDialog.close();
    loadServiceItems();
  });
});

function loadShopProducts() {
  db.collection("shopProducts")
    .orderBy("order")
    .get()
    .then((snapshot) => {
      productList.innerHTML = "";
      snapshot.forEach((doc) => {
        const item = doc.data();
        if (item.active === false) return;
        const row = document.createElement("div");
        row.className = "list-item";
        row.innerHTML = `
          <strong>${item.title}</strong>
          <span>${item.tag || "-"}</span>
          <span>${item.price} TL</span>
          <div class="item-actions">
            <button class="edit" data-id="${doc.id}">Düzenle</button>
            <button class="delete" data-id="${doc.id}">Sil</button>
          </div>
        `;
        productList.appendChild(row);
      });
      bindProductActions();
    });
}

function bindProductActions() {
  productList.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", () => openProductDialog(btn.dataset.id));
  });
  productList.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      db.collection("shopProducts").doc(btn.dataset.id).delete();
      loadShopProducts();
    });
  });
}

addProductBtn.addEventListener("click", () => openProductDialog(null));
document.getElementById("productCancel").addEventListener("click", () => {
  productDialog.close();
});

function openProductDialog(id) {
  editingProductId = id;
  productForm.reset();
  if (id) {
    db.collection("shopProducts")
      .doc(id)
      .get()
      .then((doc) => {
        const item = doc.data();
        document.getElementById("productTitle").value = item.title || "";
        document.getElementById("productTag").value = item.tag || "";
        document.getElementById("productDescription").value = item.description || "";
        document.getElementById("productPrice").value = item.price || 0;
        document.getElementById("productOrder").value = item.order || 0;
        document.getElementById("productActive").checked = item.active !== false;
        productDialog.showModal();
      });
  } else {
    document.getElementById("productActive").checked = true;
    productDialog.showModal();
  }
}

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    title: document.getElementById("productTitle").value.trim(),
    tag: document.getElementById("productTag").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
    price: Number(document.getElementById("productPrice").value),
    order: Number(document.getElementById("productOrder").value || 0),
    active: document.getElementById("productActive").checked,
  };
  const ref = db.collection("shopProducts");
  const action = editingProductId ? ref.doc(editingProductId).set(payload) : ref.add(payload);
  action.then(() => {
    productDialog.close();
    loadShopProducts();
  });
});
