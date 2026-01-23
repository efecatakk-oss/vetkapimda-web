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

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("adminLoginForm");
const loginEmail = document.getElementById("adminEmail");
const loginPassword = document.getElementById("adminPassword");
const loginStatus = document.getElementById("adminLoginStatus");
const resetBtn = document.getElementById("adminResetBtn");
const createBtn = document.getElementById("adminCreateBtn");
const logoutBtn = document.getElementById("adminLogoutBtn");

const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const productTitle = document.getElementById("productTitle");
const productTag = document.getElementById("productTag");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productOrder = document.getElementById("productOrder");
const productActive = document.getElementById("productActive");
const productFormStatus = document.getElementById("productFormStatus");
const productFormTitle = document.getElementById("productFormTitle");
const productResetBtn = document.getElementById("productResetBtn");
const productList = document.getElementById("productList");
const productCount = document.getElementById("productCount");

const clean = (value) => (value || "").trim();
const formatPrice = (value) =>
  Number.isFinite(value) ? `${value} TL` : "-";

let productUnsub = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = clean(loginEmail.value);
  const password = clean(loginPassword.value);
  if (!email || !password) {
    setLoginStatus("E-posta ve sifre zorunlu.", true);
    return;
  }
  setLoginStatus("Giris yapiliyor...", false);
  auth
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      setLoginStatus(error.message || "Giris yapilamadi.", true);
    });
});

resetBtn.addEventListener("click", () => {
  const email = clean(loginEmail.value);
  if (!email) {
    setLoginStatus("Sifremi Unuttum icin e-posta girin.", true);
    return;
  }
  if (!isAdmin(email)) {
    setLoginStatus("Sadece admin e-postasi icin sifre sifirlanir.", true);
    return;
  }
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      setLoginStatus("Sifre sifirlama e-postasi gonderildi.", false);
    })
    .catch((error) => {
      setLoginStatus(error.message || "Sifre sifirlama basarisiz.", true);
    });
});

createBtn.addEventListener("click", () => {
  const email = clean(loginEmail.value);
  const password = clean(loginPassword.value);
  if (!email || !password) {
    setLoginStatus("Hesap olusturmak icin e-posta ve sifre girin.", true);
    return;
  }
  if (!isAdmin(email)) {
    setLoginStatus("Sadece admin e-postasi olusturulabilir.", true);
    return;
  }
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      setLoginStatus("Admin hesabi olusturuldu.", false);
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        setLoginStatus("Bu e-posta zaten kayitli. Giris yapin.", true);
        return;
      }
      setLoginStatus(error.message || "Hesap olusturulamadi.", true);
    });
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

auth.onAuthStateChanged((user) => {
  if (!user) {
    showLogin();
    return;
  }
  const email = user.email || "";
  if (!isAdmin(email)) {
    setLoginStatus("Bu hesap admin yetkisine sahip degil.", true);
    auth.signOut();
    return;
  }
  showAdmin(email);
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!auth.currentUser || !isAdmin(auth.currentUser.email || "")) {
    setProductStatus("Yetkisiz islem.", true);
    return;
  }
  const payload = {
    title: clean(productTitle.value),
    tag: clean(productTag.value),
    description: clean(productDescription.value),
    price: Number(productPrice.value || 0),
    order: Number(productOrder.value || 0),
    active: Boolean(productActive.checked),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (!payload.title) {
    setProductStatus("Urun adi zorunlu.", true);
    return;
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    setProductStatus("Fiyat pozitif olmalidir.", true);
    return;
  }

  const docId = clean(productId.value);
  const request = docId
    ? db.collection("shopProducts").doc(docId).set(payload, { merge: true })
    : db.collection("shopProducts").add({
        ...payload,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

  request
    .then(() => {
      setProductStatus("Urun kaydedildi.", false);
      resetProductForm();
    })
    .catch((error) => {
      setProductStatus(error.message || "Kayit sirasinda hata.", true);
    });
});

productResetBtn.addEventListener("click", () => resetProductForm());

function isAdmin(email) {
  return email.toLowerCase() === ADMIN_EMAIL;
}

function showLogin() {
  loginPanel.classList.remove("admin-hidden");
  adminPanel.classList.add("admin-hidden");
  if (productUnsub) {
    productUnsub();
    productUnsub = null;
  }
}

function showAdmin(email) {
  loginPanel.classList.add("admin-hidden");
  adminPanel.classList.remove("admin-hidden");
  setLoginStatus(`Giris yapildi: ${email}`, false);
  startProductListener();
}

function setLoginStatus(message, isError) {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function setProductStatus(message, isError) {
  if (!productFormStatus) return;
  productFormStatus.textContent = message;
  productFormStatus.classList.toggle("error", isError);
}

function resetProductForm() {
  productId.value = "";
  productTitle.value = "";
  productTag.value = "";
  productDescription.value = "";
  productPrice.value = "";
  productOrder.value = "0";
  productActive.checked = true;
  productFormTitle.textContent = "Yeni Urun";
}

function startProductListener() {
  if (productUnsub) return;
  productUnsub = db
    .collection("shopProducts")
    .orderBy("order")
    .onSnapshot(
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(items);
      },
      () => {
        if (productList) {
          productList.innerHTML =
            "<p class='admin-muted'>Urunler yuklenemedi.</p>";
        }
      }
    );
}

function renderProducts(items) {
  if (!productList) return;
  productList.innerHTML = "";
  productCount.textContent = `${items.length} urun`;
  if (items.length === 0) {
    productList.innerHTML =
      "<p class='admin-muted'>Henuz urun eklenmedi.</p>";
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row";

    const info = document.createElement("div");
    info.className = "admin-row-info";
    info.innerHTML = `
      <strong>${item.title || "-"}</strong>
      <span>${formatPrice(Number(item.price || 0))}</span>
      <span class="admin-tag">${item.tag || "Etiket yok"}</span>
      <span class="admin-pill ${
        item.active === false ? "off" : ""
      }">${item.active === false ? "Pasif" : "Aktif"}</span>
      <span class="admin-order">Sira: ${Number(item.order || 0)}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "admin-row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.textContent = "Duzenle";
    editBtn.addEventListener("click", () => fillForm(item));

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn ghost";
    toggleBtn.textContent = item.active === false ? "Aktif Et" : "Pasif Et";
    toggleBtn.addEventListener("click", () => toggleActive(item));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn primary";
    deleteBtn.textContent = "Sil";
    deleteBtn.addEventListener("click", () => deleteProduct(item));

    actions.appendChild(editBtn);
    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(info);
    row.appendChild(actions);
    productList.appendChild(row);
  });
}

function fillForm(item) {
  productId.value = item.id;
  productTitle.value = item.title || "";
  productTag.value = item.tag || "";
  productDescription.value = item.description || "";
  productPrice.value = item.price || "";
  productOrder.value = item.order || 0;
  productActive.checked = item.active !== false;
  productFormTitle.textContent = "Urun Duzenle";
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleActive(item) {
  db.collection("shopProducts")
    .doc(item.id)
    .set(
      {
        active: item.active === false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

function deleteProduct(item) {
  const confirmed = window.confirm(
    `"${item.title || "Urun"}" silinsin mi?`
  );
  if (!confirmed) return;
  db.collection("shopProducts").doc(item.id).delete();
}
