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
const productStock = document.getElementById("productStock");
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
const productImportFile = document.getElementById("productImportFile");
const productImportBtn = document.getElementById("productImportBtn");
const productImportStatus = document.getElementById("productImportStatus");

const servicePanel = document.getElementById("servicePanel");
const serviceForm = document.getElementById("serviceForm");
const serviceId = document.getElementById("serviceId");
const serviceTitle = document.getElementById("serviceTitle");
const serviceCategory = document.getElementById("serviceCategory");
const servicePrice = document.getElementById("servicePrice");
const serviceOrder = document.getElementById("serviceOrder");
const serviceActive = document.getElementById("serviceActive");
const serviceFormStatus = document.getElementById("serviceFormStatus");
const serviceFormTitle = document.getElementById("serviceFormTitle");
const serviceResetBtn = document.getElementById("serviceResetBtn");
const serviceList = document.getElementById("serviceList");
const serviceCount = document.getElementById("serviceCount");
const serviceSearch = document.getElementById("serviceSearch");
const serviceCategoryFilter = document.getElementById("serviceCategoryFilter");
const serviceStatusFilter = document.getElementById("serviceStatusFilter");
const serviceImportFile = document.getElementById("serviceImportFile");
const serviceImportBtn = document.getElementById("serviceImportBtn");
const serviceImportStatus = document.getElementById("serviceImportStatus");

const usersPanel = document.getElementById("usersPanel");
const userList = document.getElementById("userList");
const userCount = document.getElementById("userCount");
const userSearch = document.getElementById("userSearch");

const bookingsPanel = document.getElementById("bookingsPanel");
const bookingList = document.getElementById("bookingList");
const bookingCount = document.getElementById("bookingCount");
const bookingSearch = document.getElementById("bookingSearch");

const clean = (value) => (value || "").trim();
const formatPrice = (value) =>
  Number.isFinite(value) ? `${value} TL` : "-";
const serviceCategoryLabels = {
  procedures: "Evde Islemler",
  vaccines: "Evde Kopek Asilari",
  cat_vaccines: "Evde Kedi Asilari",
  exotics: "Egzotik Dostlar",
  care: "Bakim Paketleri",
};

let productUnsub = null;
let allProducts = [];
const selectedIds = new Set();
let serviceUnsub = null;
let allServices = [];
let userUnsub = null;
let allUsers = [];
let bookingUnsub = null;
let allBookings = [];
let productDragId = null;
let serviceDragId = null;

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
    stock: Number(productStock.value || 0),
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

productImportBtn?.addEventListener("click", () =>
  handleCsvImport("shopProducts")
);
serviceImportBtn?.addEventListener("click", () =>
  handleCsvImport("serviceItems")
);

if (productStatusFilter) {
  productStatusFilter.value = "all";
}

if (serviceCategoryFilter) {
  serviceCategoryFilter.value = "all";
}
if (serviceStatusFilter) {
  serviceStatusFilter.value = "all";
}

serviceSearch?.addEventListener("input", () => renderServices(allServices));
serviceCategoryFilter?.addEventListener("change", () => renderServices(allServices));
serviceStatusFilter?.addEventListener("change", () => renderServices(allServices));
serviceResetBtn?.addEventListener("click", () => resetServiceForm());
userSearch?.addEventListener("input", () => renderUsers(allUsers));
bookingSearch?.addEventListener("input", () => renderBookings(allBookings));

serviceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!auth.currentUser || !isAdmin(auth.currentUser.email || "")) {
    setServiceStatus("Yetkisiz islem.", true);
    return;
  }
  const payload = {
    title: clean(serviceTitle.value),
    category: serviceCategory.value || "procedures",
    price: Number(servicePrice.value || 0),
    order: Number(serviceOrder.value || 0),
    active: Boolean(serviceActive.checked),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (!payload.title) {
    setServiceStatus("Hizmet adi zorunlu.", true);
    return;
  }
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    setServiceStatus("Fiyat pozitif olmalidir.", true);
    return;
  }

  const docId = clean(serviceId.value);
  const request = docId
    ? db.collection("serviceItems").doc(docId).set(payload, { merge: true })
    : db.collection("serviceItems").add({
        ...payload,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

  request
    .then(() => {
      setServiceStatus("Hizmet kaydedildi.", false);
      resetServiceForm();
    })
    .catch((error) => {
      setServiceStatus(error.message || "Kayit sirasinda hata.", true);
    });
});

function isAdmin(email) {
  return email.toLowerCase() === ADMIN_EMAIL;
}

function showLogin() {
  loginPanel.classList.remove("admin-hidden");
  adminPanel.classList.add("admin-hidden");
  if (servicePanel) {
    servicePanel.classList.add("admin-hidden");
  }
  if (usersPanel) {
    usersPanel.classList.add("admin-hidden");
  }
  if (bookingsPanel) {
    bookingsPanel.classList.add("admin-hidden");
  }
  if (productUnsub) {
    productUnsub();
    productUnsub = null;
  }
  if (serviceUnsub) {
    serviceUnsub();
    serviceUnsub = null;
  }
  if (userUnsub) {
    userUnsub();
    userUnsub = null;
  }
  if (bookingUnsub) {
    bookingUnsub();
    bookingUnsub = null;
  }
  selectedIds.clear();
}

function showAdmin(email) {
  loginPanel.classList.add("admin-hidden");
  adminPanel.classList.remove("admin-hidden");
  if (servicePanel) {
    servicePanel.classList.remove("admin-hidden");
  }
  if (usersPanel) {
    usersPanel.classList.remove("admin-hidden");
  }
  if (bookingsPanel) {
    bookingsPanel.classList.remove("admin-hidden");
  }
  setLoginStatus(`Giris yapildi: ${email}`, false);
  startProductListener();
  startServiceListener();
  startUserListener();
  startBookingListener();
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

function setServiceStatus(message, isError) {
  if (!serviceFormStatus) return;
  serviceFormStatus.textContent = message;
  serviceFormStatus.classList.toggle("error", isError);
}

function resetProductForm() {
  productId.value = "";
  productTitle.value = "";
  productImage.value = "";
  productTag.value = "";
  productDescription.value = "";
  productStock.value = "";
  productPrice.value = "";
  productOrder.value = "0";
  productActive.checked = true;
  productFormTitle.textContent = "Yeni Urun";
  updateImagePreview("");
}

function resetServiceForm() {
  if (!serviceForm) return;
  serviceId.value = "";
  serviceTitle.value = "";
  serviceCategory.value = "procedures";
  servicePrice.value = "";
  serviceOrder.value = "0";
  serviceActive.checked = true;
  serviceFormTitle.textContent = "Yeni Hizmet";
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

function startServiceListener() {
  if (serviceUnsub) return;
  serviceUnsub = db
    .collection("serviceItems")
    .orderBy("order")
    .onSnapshot(
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        allServices = items;
        renderServices(items);
      },
      () => {
        if (serviceList) {
          serviceList.innerHTML =
            "<p class='admin-muted'>Hizmetler yuklenemedi.</p>";
        }
      }
    );
}

function startUserListener() {
  if (userUnsub) return;
  userUnsub = db
    .collection("users")
    .orderBy("createdAt")
    .onSnapshot(
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        allUsers = items;
        renderUsers(items);
      },
      () => {
        if (userList) {
          userList.innerHTML = "<p class='admin-muted'>Uyeler yuklenemedi.</p>";
        }
      }
    );
}

function startBookingListener() {
  if (bookingUnsub) return;
  bookingUnsub = db
    .collection("bookings")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        allBookings = items;
        renderBookings(items);
      },
      () => {
        if (bookingList) {
          bookingList.innerHTML =
            "<p class='admin-muted'>Randevular yuklenemedi.</p>";
        }
      }
    );
}

function renderProducts(items) {
  if (!productList) return;
  const query = clean(productSearch.value).toLowerCase();
  const filterValue = productStatusFilter.value;
  const isSortable = !query && filterValue === "all";
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
    row.dataset.id = item.id;
    row.draggable = isSortable;
    row.title = isSortable
      ? "Surukleyip birakabilirsiniz."
      : "Siralama icin arama ve filtreyi temizleyin.";

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

    if (isSortable) {
      row.addEventListener("dragstart", () => {
        productDragId = item.id;
        row.classList.add("dragging");
      });
      row.addEventListener("dragend", () => {
        productDragId = null;
        row.classList.remove("dragging");
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.classList.add("drag-over");
      });
      row.addEventListener("dragleave", () => {
        row.classList.remove("drag-over");
      });
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("drag-over");
        if (!productDragId || productDragId === item.id) return;
        const dragged = productList.querySelector(
          `[data-id="${productDragId}"]`
        );
        if (!dragged) return;
        productList.insertBefore(dragged, row);
        const orderedIds = Array.from(
          productList.querySelectorAll(".admin-row")
        ).map((node) => node.dataset.id);
        persistProductOrder(orderedIds);
      });
    }
  });
}

function renderServices(items) {
  if (!serviceList) return;
  const query = clean(serviceSearch.value).toLowerCase();
  const categoryValue = serviceCategoryFilter.value;
  const statusValue = serviceStatusFilter.value;
  const isSortable =
    !query && categoryValue === "all" && statusValue === "all";

  const filtered = items.filter((item) => {
    const matchesQuery =
      !query || (item.title || "").toLowerCase().includes(query);
    const matchesCategory =
      categoryValue === "all" || item.category === categoryValue;
    const isActive = item.active !== false;
    const matchesStatus =
      statusValue === "all" ||
      (statusValue === "active" && isActive) ||
      (statusValue === "inactive" && !isActive);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  serviceList.innerHTML = "";
  serviceCount.textContent = `${filtered.length} hizmet`;
  if (filtered.length === 0) {
    serviceList.innerHTML =
      items.length === 0
        ? "<p class='admin-muted'>Henuz hizmet eklenmedi.</p>"
        : "<p class='admin-muted'>Aramaniza uyan hizmet bulunamadi.</p>";
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.dataset.id = item.id;
    row.draggable = isSortable;
    row.title = isSortable
      ? "Surukleyip birakabilirsiniz."
      : "Siralama icin arama ve filtreyi temizleyin.";

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
      <span class="admin-tag">${
        serviceCategoryLabels[item.category] || item.category || "procedures"
      }</span>
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
        setServiceStatus("Fiyat pozitif olmali.", true);
        return;
      }
      updateServicePrice(item.id, value);
    });

    const actions = document.createElement("div");
    actions.className = "admin-row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.textContent = "Duzenle";
    editBtn.addEventListener("click", () => fillServiceForm(item));

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn ghost";
    toggleBtn.textContent = item.active === false ? "Aktif Et" : "Pasif Et";
    toggleBtn.addEventListener("click", () => toggleServiceActive(item));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn primary";
    deleteBtn.textContent = "Sil";
    deleteBtn.addEventListener("click", () => deleteService(item));

    actions.appendChild(editBtn);
    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(info);
    row.appendChild(actions);
    serviceList.appendChild(row);

    if (isSortable) {
      row.addEventListener("dragstart", () => {
        serviceDragId = item.id;
        row.classList.add("dragging");
      });
      row.addEventListener("dragend", () => {
        serviceDragId = null;
        row.classList.remove("dragging");
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.classList.add("drag-over");
      });
      row.addEventListener("dragleave", () => {
        row.classList.remove("drag-over");
      });
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("drag-over");
        if (!serviceDragId || serviceDragId === item.id) return;
        const dragged = serviceList.querySelector(
          `[data-id="${serviceDragId}"]`
        );
        if (!dragged) return;
        serviceList.insertBefore(dragged, row);
        const orderedIds = Array.from(
          serviceList.querySelectorAll(".admin-row")
        ).map((node) => node.dataset.id);
        persistServiceOrder(orderedIds);
      });
    }
  });
}

function renderUsers(items) {
  if (!userList) return;
  const query = clean(userSearch.value).toLowerCase();
  const filtered = items.filter((item) => {
    if (!query) return true;
    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.email || "").toLowerCase().includes(query) ||
      (item.phone || "").toLowerCase().includes(query)
    );
  });

  userList.innerHTML = "";
  userCount.textContent = `${filtered.length} uye`;
  if (filtered.length === 0) {
    userList.innerHTML =
      items.length === 0
        ? "<p class='admin-muted'>Henuz uye yok.</p>"
        : "<p class='admin-muted'>Aramaniza uyan uye bulunamadi.</p>";
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row user-row";

    const info = document.createElement("div");
    info.className = "admin-row-info";
    info.innerHTML = `
      <strong>${item.name || "Isim yok"}</strong>
      <span>${item.email || "-"}</span>
      <span>${item.phone || "-"}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "admin-row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.textContent = "Duzenle";
    editBtn.addEventListener("click", () => editUserInline(item));

    actions.appendChild(editBtn);

    row.appendChild(info);
    row.appendChild(actions);
    userList.appendChild(row);
  });
}

function editUserInline(item) {
  const name = window.prompt("Uye adi", item.name || "");
  if (name === null) return;
  const phone = window.prompt("Telefon", item.phone || "");
  if (phone === null) return;
  db.collection("users")
    .doc(item.id)
    .set(
      {
        name: clean(name),
        phone: clean(phone),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .then(() => {
      if (userSearch) userSearch.value = "";
    });
}

function renderBookings(items) {
  if (!bookingList) return;
  const query = clean(bookingSearch.value).toLowerCase();
  const filtered = items.filter((item) => {
    if (!query) return true;
    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.email || "").toLowerCase().includes(query) ||
      (item.phone || "").toLowerCase().includes(query)
    );
  });

  bookingList.innerHTML = "";
  bookingCount.textContent = `${filtered.length} randevu`;
  if (filtered.length === 0) {
    bookingList.innerHTML =
      items.length === 0
        ? "<p class='admin-muted'>Henuz randevu yok.</p>"
        : "<p class='admin-muted'>Aramaniza uyan randevu bulunamadi.</p>";
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row booking-row";

    const info = document.createElement("div");
    info.className = "admin-row-info";

    const services = Array.isArray(item.services)
      ? item.services.map((s) => s.title || s.name || s).join(", ")
      : item.services || "-";

    const totalText = item.total ? `${item.total} TL` : "-";

    info.innerHTML = `
      <strong>${item.name || "Isim yok"}</strong>
      <span>${item.email || "-"}</span>
      <span>${item.phone || "-"}</span>
      <span>${item.datetime || "-"}</span>
      <span>${services}</span>
      <span>${totalText}</span>
      <span class="booking-status ${item.status || "new"}">${
        statusLabel(item.status)
      }</span>
    `;

    const actions = document.createElement("div");
    actions.className = "admin-row-actions";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn ghost";
    confirmBtn.textContent = "Onayla";
    confirmBtn.addEventListener("click", () => updateBookingStatus(item.id, "confirmed"));

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn ghost";
    doneBtn.textContent = "Tamamlandı";
    doneBtn.addEventListener("click", () => updateBookingStatus(item.id, "closed"));

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn primary";
    cancelBtn.textContent = "İptal";
    cancelBtn.addEventListener("click", () => updateBookingStatus(item.id, "cancelled"));

    actions.appendChild(confirmBtn);
    actions.appendChild(doneBtn);
    actions.appendChild(cancelBtn);

    row.appendChild(info);
    row.appendChild(actions);
    bookingList.appendChild(row);
  });
}

function updateBookingStatus(id, status) {
  db.collection("bookings")
    .doc(id)
    .set(
      { status, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    )
    .catch(() => {});
}

function statusLabel(status) {
  if (status === "confirmed") return "Onaylandı";
  if (status === "closed") return "Tamamlandı";
  if (status === "cancelled") return "İptal";
  return "Yeni";
}

function fillForm(item) {
  productId.value = item.id;
  productTitle.value = item.title || "";
  productImage.value = item.imageUrl || "";
  productTag.value = item.tag || "";
  productDescription.value = item.description || "";
  productStock.value = item.stock || 0;
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

function fillServiceForm(item) {
  serviceId.value = item.id;
  serviceTitle.value = item.title || "";
  serviceCategory.value = item.category || "procedures";
  servicePrice.value = item.price || "";
  serviceOrder.value = item.order || 0;
  serviceActive.checked = item.active !== false;
  serviceFormTitle.textContent = "Hizmet Duzenle";
  serviceForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleServiceActive(item) {
  db.collection("serviceItems")
    .doc(item.id)
    .set(
      {
        active: item.active === false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

function deleteService(item) {
  const confirmed = window.confirm(
    `"${item.title || "Hizmet"}" silinsin mi?`
  );
  if (!confirmed) return;
  db.collection("serviceItems").doc(item.id).delete();
}

function updateServicePrice(id, price) {
  db.collection("serviceItems")
    .doc(id)
    .set(
      { price, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    )
    .then(() => {
      setServiceStatus("Fiyat guncellendi.", false);
    })
    .catch((error) => {
      setServiceStatus(error.message || "Fiyat guncellenemedi.", true);
    });
}

function persistProductOrder(ids) {
  if (!ids.length) return;
  const batch = db.batch();
  ids.forEach((id, index) => {
    const ref = db.collection("shopProducts").doc(id);
    batch.set(
      ref,
      { order: index + 1, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  });
  batch
    .commit()
    .then(() => {
      setProductStatus("Siralama guncellendi.", false);
    })
    .catch((error) => {
      setProductStatus(error.message || "Siralama guncellenemedi.", true);
    });
}

function persistServiceOrder(ids) {
  if (!ids.length) return;
  const batch = db.batch();
  ids.forEach((id, index) => {
    const ref = db.collection("serviceItems").doc(id);
    batch.set(
      ref,
      { order: index + 1, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  });
  batch
    .commit()
    .then(() => {
      setServiceStatus("Siralama guncellendi.", false);
    })
    .catch((error) => {
      setServiceStatus(error.message || "Siralama guncellenemedi.", true);
    });
}

function handleCsvImport(collection) {
  const fileInput =
    collection === "shopProducts" ? productImportFile : serviceImportFile;
  const statusEl =
    collection === "shopProducts" ? productImportStatus : serviceImportStatus;

  if (!fileInput || !fileInput.files?.length) {
    statusEl.textContent = "CSV dosyasi secin.";
    statusEl.classList.add("error");
    return;
  }
  if (!auth.currentUser || !isAdmin(auth.currentUser.email || "")) {
    statusEl.textContent = "Yetkisiz islem.";
    statusEl.classList.add("error");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const { headers, rows } = parseCsv(text);
      const docs = rows
        .map((row) => mapCsvRow(headers, row, collection))
        .filter(Boolean);
      if (!docs.length) {
        statusEl.textContent = "Uygun veri bulunamadi.";
        statusEl.classList.add("error");
        return;
      }
      uploadCsvDocs(collection, docs, statusEl);
    } catch (error) {
      statusEl.textContent = error.message || "CSV okunamadi.";
      statusEl.classList.add("error");
    }
  };
  reader.readAsText(file);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && next === '"') {
      field += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (char === "," || char === ";")) {
      row.push(field.trim());
      field = "";
      continue;
    }
    if (!inQuotes && char === "\n") {
      row.push(field.trim());
      field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      continue;
    }
    if (!inQuotes && char === "\r") continue;
    field += char;
  }
  if (field.length || row.length) {
    row.push(field.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  if (!rows.length) {
    return { headers: [], rows: [] };
  }
  const headers = rows.shift().map((h) => h.toLowerCase());
  return { headers, rows };
}

function mapCsvRow(headers, row, collection) {
  const data = {};
  headers.forEach((key, index) => {
    data[key] = row[index] || "";
  });

  const title = clean(data.title);
  const price = Number(data.price || 0);
  const order = Number(data.order || 0);
  const active = parseBoolean(data.active, true);

  if (!title || !Number.isFinite(price) || price <= 0) return null;

  if (collection === "shopProducts") {
    return {
      title,
      price,
      order,
      active,
      stock: Number(data.stock || 0),
      tag: clean(data.tag),
      description: clean(data.description),
      imageUrl: clean(data.imageurl || data.imageUrl),
    };
  }

  return {
    title,
    price,
    order,
    active,
    category: clean(data.category) || "procedures",
  };
}

function parseBoolean(value, fallback) {
  const normalized = String(value || "").toLowerCase().trim();
  if (!normalized) return fallback;
  if (["true", "1", "yes", "evet"].includes(normalized)) return true;
  if (["false", "0", "no", "hayir", "hayır"].includes(normalized)) return false;
  return fallback;
}

function uploadCsvDocs(collection, docs, statusEl) {
  const chunks = [];
  for (let i = 0; i < docs.length; i += 450) {
    chunks.push(docs.slice(i, i + 450));
  }

  statusEl.textContent = `${docs.length} kayit yukleniyor...`;
  statusEl.classList.remove("error");

  const runChunk = (index) => {
    if (index >= chunks.length) {
      statusEl.textContent = "CSV yukleme tamamlandi.";
      return Promise.resolve();
    }
    const batch = db.batch();
    chunks[index].forEach((docData) => {
      const ref = db.collection(collection).doc();
      batch.set(ref, {
        ...docData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    return batch.commit().then(() => runChunk(index + 1));
  };

  runChunk(0).catch((error) => {
    statusEl.textContent = error.message || "CSV yukleme basarisiz.";
    statusEl.classList.add("error");
  });
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
