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
const productImage = document.getElementById("productImage");
const productImagePreview = document.getElementById("productImagePreview");
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
const productSearch = document.getElementById("productSearch");
const productStatusFilter = document.getElementById("productStatusFilter");
const bulkActionSelect = document.getElementById("bulkActionSelect");
const bulkApplyBtn = document.getElementById("bulkApplyBtn");
const bulkPriceMode = document.getElementById("bulkPriceMode");
const bulkPriceValue = document.getElementById("bulkPriceValue");
const bulkPriceApplyBtn = document.getElementById("bulkPriceApplyBtn");

const clean = (value) => (value || "").trim();
const formatPrice = (value) =>
  Number.isFinite(value) ? `${value} TL` : "-";

let productUnsub = null;
let allProducts = [];
const selectedIds = new Set();

const placeholderImage =
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=60";

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

productImage.addEventListener("input", () => {
  updateImagePreview(productImage.value);
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
    imageUrl: clean(productImage.value),
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

productSearch.addEventListener("input", () => renderProducts(allProducts));
productStatusFilter.addEventListener("change", () => renderProducts(allProducts));
bulkApplyBtn.addEventListener("click", () => handleBulkAction());
bulkPriceApplyBtn.addEventListener("click", () => handleBulkPriceUpdate());

if (productStatusFilter) {
  productStatusFilter.value = "all";
}

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
  selectedIds.clear();
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
  productImage.value = "";
  productTag.value = "";
  productDescription.value = "";
  productPrice.value = "";
  productOrder.value = "0";
  productActive.checked = true;
  productFormTitle.textContent = "Yeni Urun";
  updateImagePreview("");
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
        allProducts = items;
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
  const query = clean(productSearch.value).toLowerCase();
  const filterValue = productStatusFilter.value;
  const filtered = items.filter((item) => {
    const matchesQuery =
      !query ||
      (item.title || "").toLowerCase().includes(query) ||
      (item.tag || "").toLowerCase().includes(query);
    const isActive = item.active !== false;
    if (filterValue === "active" && !isActive) return false;
    if (filterValue === "inactive" && isActive) return false;
    return matchesQuery;
  });

  productList.innerHTML = "";
  productCount.textContent = `${filtered.length} urun`;
  if (filtered.length === 0) {
    productList.innerHTML =
      items.length === 0
        ? "<p class='admin-muted'>Henuz urun eklenmedi.</p>"
        : "<p class='admin-muted'>Aramaniza uyan urun bulunamadi.</p>";
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row";

    const selectWrap = document.createElement("label");
    selectWrap.className = "admin-select";
    const selectBox = document.createElement("input");
    selectBox.type = "checkbox";
    selectBox.checked = selectedIds.has(item.id);
    selectBox.addEventListener("change", () => {
      if (selectBox.checked) {
        selectedIds.add(item.id);
      } else {
        selectedIds.delete(item.id);
      }
    });
    selectWrap.appendChild(selectBox);

    const image = document.createElement("img");
    image.className = "admin-thumb";
    image.alt = item.title || "Urun";
    image.src = item.imageUrl || placeholderImage;

    const info = document.createElement("div");
    info.className = "admin-row-info";
    info.innerHTML = `
      <strong>${item.title || "-"}</strong>
      <div class="admin-inline-price">
        <input
          type="number"
          min="0"
          step="1"
          value="${Number(item.price || 0)}"
          aria-label="Fiyat guncelle"
        />
        <button type="button" class="btn ghost">Fiyati Kaydet</button>
      </div>
      <div class="admin-inline-image">
        <input
          type="url"
          placeholder="Resim URL"
          value="${item.imageUrl || ""}"
          aria-label="Resim URL guncelle"
        />
        <button type="button" class="btn ghost">Resmi Kaydet</button>
      </div>
      <span class="admin-tag">${item.tag || "Etiket yok"}</span>
      <span class="admin-pill ${
        item.active === false ? "off" : ""
      }">${item.active === false ? "Pasif" : "Aktif"}</span>
      <span class="admin-order">Sira: ${Number(item.order || 0)}</span>
    `;

    const inlineInput = info.querySelector(".admin-inline-price input");
    const inlineSave = info.querySelector(".admin-inline-price button");
    inlineSave.addEventListener("click", () => {
      const value = Number(inlineInput.value);
      if (!Number.isFinite(value) || value <= 0) {
        setProductStatus("Fiyat pozitif olmali.", true);
        return;
      }
      updatePrice(item.id, value);
    });

    const imageInput = info.querySelector(".admin-inline-image input");
    const imageSave = info.querySelector(".admin-inline-image button");
    imageSave.addEventListener("click", () => {
      updateImageUrl(item.id, imageInput.value);
    });

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

    row.appendChild(selectWrap);
    row.appendChild(image);
    row.appendChild(info);
    row.appendChild(actions);
    productList.appendChild(row);
  });
}

function fillForm(item) {
  productId.value = item.id;
  productTitle.value = item.title || "";
  productImage.value = item.imageUrl || "";
  productTag.value = item.tag || "";
  productDescription.value = item.description || "";
  productPrice.value = item.price || "";
  productOrder.value = item.order || 0;
  productActive.checked = item.active !== false;
  productFormTitle.textContent = "Urun Duzenle";
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
  updateImagePreview(item.imageUrl || "");
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

function updateImagePreview(url) {
  if (!productImagePreview) return;
  const value = clean(url);
  if (!value) {
    productImagePreview.src = placeholderImage;
    productImagePreview.classList.add("is-placeholder");
    return;
  }
  productImagePreview.src = value;
  productImagePreview.classList.remove("is-placeholder");
}

function handleBulkAction() {
  const action = bulkActionSelect.value;
  if (!action) {
    setProductStatus("Toplu islem secin.", true);
    return;
  }
  if (selectedIds.size === 0) {
    setProductStatus("Toplu islem icin urun secin.", true);
    return;
  }
  const ids = Array.from(selectedIds);
  if (action === "delete") {
    const confirmed = window.confirm(`${ids.length} urun silinsin mi?`);
    if (!confirmed) return;
  }

  const batch = db.batch();
  ids.forEach((id) => {
    const ref = db.collection("shopProducts").doc(id);
    if (action === "delete") {
      batch.delete(ref);
    } else if (action === "activate") {
      batch.set(
        ref,
        { active: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } else if (action === "deactivate") {
      batch.set(
        ref,
        { active: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }
  });

  batch
    .commit()
    .then(() => {
      setProductStatus("Toplu islem tamamlandi.", false);
      selectedIds.clear();
      bulkActionSelect.value = "";
    })
    .catch((error) => {
      setProductStatus(error.message || "Toplu islem hatasi.", true);
    });
}

function handleBulkPriceUpdate() {
  const mode = bulkPriceMode.value;
  const delta = Number(bulkPriceValue.value);
  if (!Number.isFinite(delta) || delta <= 0) {
    setProductStatus("Toplu fiyat icin pozitif deger girin.", true);
    return;
  }
  if (selectedIds.size === 0) {
    setProductStatus("Toplu fiyat icin urun secin.", true);
    return;
  }

  const ids = Array.from(selectedIds);
  const batch = db.batch();
  ids.forEach((id) => {
    const item = allProducts.find((product) => product.id === id);
    if (!item) return;
    const current = Number(item.price || 0);
    let next = current;
    if (mode === "percent_up") {
      next = current + (current * delta) / 100;
    } else if (mode === "percent_down") {
      next = current - (current * delta) / 100;
    } else if (mode === "amount_up") {
      next = current + delta;
    } else if (mode === "amount_down") {
      next = current - delta;
    }
    next = Math.max(0, Math.round(next));
    const ref = db.collection("shopProducts").doc(id);
    batch.set(
      ref,
      { price: next, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  });

  batch
    .commit()
    .then(() => {
      setProductStatus("Toplu fiyat guncellendi.", false);
      bulkPriceValue.value = "";
    })
    .catch((error) => {
      setProductStatus(error.message || "Toplu fiyat hatasi.", true);
    });
}

function updatePrice(id, price) {
  db.collection("shopProducts")
    .doc(id)
    .set(
      { price, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    )
    .then(() => {
      setProductStatus("Fiyat guncellendi.", false);
    })
    .catch((error) => {
      setProductStatus(error.message || "Fiyat guncellenemedi.", true);
    });
}

function updateImageUrl(id, imageUrl) {
  const value = clean(imageUrl);
  db.collection("shopProducts")
    .doc(id)
    .set(
      { imageUrl: value, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    )
    .then(() => {
      setProductStatus("Resim guncellendi.", false);
    })
    .catch((error) => {
      setProductStatus(error.message || "Resim guncellenemedi.", true);
    });
}

updateImagePreview("");
