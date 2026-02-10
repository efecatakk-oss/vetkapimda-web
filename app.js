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

const form = document.getElementById("bookingForm");
const statusEl = document.getElementById("formStatus");
const catalogEl = document.getElementById("serviceCatalog");
const cartEl = document.getElementById("cartSummary");
const cartTotalEl = document.getElementById("cartTotal");
const cartTotalStickyEl = document.getElementById("cartTotalSticky");
const navCartCount = document.getElementById("navCartCount");
const navCartCountIcon = document.getElementById("navCartCountIcon");
const slides = document.querySelectorAll(".slider-track .slide");
const dots = document.querySelectorAll(".slider-dots .dot");
const shopGrid = document.getElementById("shopGrid");
const shopTabs = document.querySelectorAll(".shop-tabs .tab");
const loginGate = document.getElementById("loginGate");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginPasswordConfirm = document.getElementById("loginPasswordConfirm");
const loginCode = document.getElementById("loginCode");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const confirmCodeBtn = document.getElementById("confirmCodeBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginInfo = document.getElementById("loginInfo");
const loginStatus = document.getElementById("loginStatus");
const userEmailHidden = document.getElementById("userEmail");
const rememberMe = document.getElementById("rememberMe");
const acceptTerms = document.getElementById("acceptTerms");
const editInfoBtn = document.querySelector(".edit-info-btn");
const toastEl = document.getElementById("toast");
const loginTriggers = document.querySelectorAll(".login-trigger");
const loginTabs = document.querySelectorAll(".login-tabs .tab-btn");
const loginCard = document.querySelector(".login-card");
const signupName = document.getElementById("signupName");
const signupSurname = document.getElementById("signupSurname");
const signupPhone = document.getElementById("signupPhone");
const signupBirthdate = document.getElementById("signupBirthdate");
const navHamburger = document.getElementById("navHamburger");
const mobileNav = document.getElementById("mobileNav");
const authInlineErrors = Array.from(
  document.querySelectorAll(".field-inline-error[data-error-for]")
);
const userMenu = document.getElementById("userMenu");
const userMenuTrigger = document.querySelector(".user-menu-trigger");
const userMenuCloseButtons = document.querySelectorAll(".user-menu-close");
const userMenuName = document.getElementById("userMenuName");
const userMenuSubtitle = document.getElementById("userMenuSubtitle");
const userMenuEmail = document.getElementById("userMenuEmail");
const userMenuLoginBtn = document.getElementById("userMenuLoginBtn");
const userMenuLogoutBtn = document.getElementById("userMenuLogoutBtn");
const userMenuActiveLabel = document.getElementById("userMenuActiveLabel");
const userMenuFullName = document.getElementById("userMenuFullName");
const userMenuEmailText = document.getElementById("userMenuEmailText");
const userMenuPhone = document.getElementById("userMenuPhone");
const userMenuAddress = document.getElementById("userMenuAddress");
const userMenuNameInput = document.getElementById("userMenuNameInput");
const userMenuEmailInput = document.getElementById("userMenuEmailInput");
const userMenuPhoneInput = document.getElementById("userMenuPhoneInput");
const userMenuAccountForm = document.getElementById("userMenuAccountForm");
const userMenuAddressForm = document.getElementById("userMenuAddressForm");
const userMenuAccountStatus = document.getElementById("userMenuAccountStatus");
const userMenuAddressStatus = document.getElementById("userMenuAddressStatus");
const userAddressList = document.getElementById("userAddressList");
const addressAddBtn = document.querySelector(".address-add-btn");
const userAddressModal = document.getElementById("userAddressModal");
const addressTitleInput = document.getElementById("addressTitleInput");
const addressNameInput = document.getElementById("addressNameInput");
const addressSurnameInput = document.getElementById("addressSurnameInput");
const addressCityInput = document.getElementById("addressCityInput");
const addressDistrictInput = document.getElementById("addressDistrictInput");
const addressPhoneInput = document.getElementById("addressPhoneInput");
const addressTextInput = document.getElementById("addressTextInput");
const addressCancelBtn = document.getElementById("addressCancelBtn");
const addressIndexInput = document.getElementById("addressIndexInput");
let productToggleInit = false;
let heroPlaceholderTimer = null;
let heroPlaceholderIndex = 0;
let productSliderTimer = null;
let toastTimer = null;
const heroPlaceholderPhrases = [
  "Evde aşı randevusu",
  "Kedi tırnak kesimi",
  "Canlı video danışmanlık",
  "Acil veteriner sorusu",
];
let cachedAddressBook = [];
let editingAddressIndex = null;
const bookingNameInput = document.getElementById("name");
const bookingPhoneInput = document.getElementById("phone");
const bookingAddressInput = document.getElementById("address");
const defaultAddressCard = document.getElementById("defaultAddressCard");
const defaultAddressText = document.getElementById("defaultAddressText");
const addressSelect = document.getElementById("addressSelect");
const addressPicker = document.getElementById("addressPicker");
const serviceLastUpdatedEl = document.getElementById("serviceLastUpdated");
const refreshServiceBtn = document.getElementById("refreshServiceBtn");
const bookingReviewEl = document.getElementById("bookingReview");
const reviewItemCountEl = document.getElementById("reviewItemCount");
const reviewItemsEl = document.getElementById("reviewItems");
const reviewTotalEl = document.getElementById("reviewTotal");
const reviewPaymentEl = document.getElementById("reviewPayment");
let serviceVersion = localStorage.getItem("serviceItemsVersion") || "";
let serviceSnapshotInitialized = false;
const PROFILE_CACHE_KEY = "vk_profile_cache_v1";
let userProfileUnsub = null;
let userProfileUid = "";
let userProfileLoadTimer = null;

function getProfileCacheMap() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function getProfileCache(uid) {
  if (!uid) return null;
  const map = getProfileCacheMap();
  const value = map[uid];
  return value && typeof value === "object" ? value : null;
}

function setProfileCache(uid, patch = {}) {
  if (!uid) return;
  const map = getProfileCacheMap();
  const prev = map[uid] && typeof map[uid] === "object" ? map[uid] : {};
  map[uid] = { ...prev, ...patch, cachedAt: Date.now() };
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(map));
}

function buildAddressText(entry) {
  if (!entry) return "";
  const parts = [];
  if (entry.address) {
    parts.push(entry.address);
  }
  const cityLine = [entry.district, entry.city].filter(Boolean).join(" / ");
  if (cityLine) {
    parts.push(cityLine);
  }
  return parts.join(" - ");
}

function getDefaultAddressEntry(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  return list.find((entry) => entry.isDefault) || list[0];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toMillisSafe(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value === "number") return value;
  if (value.seconds) return Number(value.seconds) * 1000;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatUpdateTime(ms) {
  if (!ms) return "-";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function updateServiceLastUpdated(ms) {
  if (!serviceLastUpdatedEl) return;
  serviceLastUpdatedEl.textContent = `Son guncelleme: ${formatUpdateTime(ms)}`;
}

function renderAddressList(data = {}) {
  if (!userAddressList) return;
  let list = Array.isArray(data.addressBook) ? data.addressBook : [];
  if (list.length === 0 && data.address) {
    list = [
      {
        title: "Adres",
        address: data.address,
        phone: data.phone || "",
      },
    ];
  }
  cachedAddressBook = list;
  if (addressPicker && addressSelect) {
    addressPicker.style.display = "none";
    addressSelect.innerHTML = '<option value="">Adres seç</option>';
  }
  userAddressList.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "address-empty";
    empty.textContent = "Henüz kayıtlı adres yok.";
    userAddressList.appendChild(empty);
    return;
  }
  if (addressPicker && addressSelect) {
    addressPicker.style.display = "block";
    addressSelect.innerHTML = '<option value="">Adres seç</option>';
  }
  const defaultEntry = getDefaultAddressEntry(list);
  list.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "address-card";
    const title = document.createElement("strong");
    title.textContent = entry.title || `Adres ${index + 1}`;
    const addressLine = document.createElement("span");
    addressLine.textContent = buildAddressText(entry) || "Adres bilgisi yok.";
    card.appendChild(title);
    if (entry.isDefault) {
      const badge = document.createElement("span");
      badge.className = "address-badge";
      badge.textContent = "Varsayılan";
      card.appendChild(badge);
    }
    if (entry.name || entry.surname) {
      const nameLine = document.createElement("span");
      nameLine.textContent = `${entry.name || ""} ${entry.surname || ""}`.trim();
      card.appendChild(nameLine);
    }
    card.appendChild(addressLine);
    if (entry.phone) {
      const phoneLine = document.createElement("span");
      phoneLine.textContent = `Telefon: ${entry.phone}`;
      card.appendChild(phoneLine);
    }
    const actions = document.createElement("div");
    actions.className = "address-actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn ghost";
    editBtn.textContent = "Düzenle";
    editBtn.addEventListener("click", () => openAddressModal(index));
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn ghost";
    deleteBtn.textContent = "Sil";
    deleteBtn.addEventListener("click", () => deleteAddress(index));
    const defaultBtn = document.createElement("button");
    defaultBtn.type = "button";
    defaultBtn.className = "btn ghost";
    defaultBtn.textContent = entry.isDefault ? "Varsayılan" : "Varsayılan Yap";
    defaultBtn.disabled = entry.isDefault;
    defaultBtn.addEventListener("click", () => setDefaultAddress(index));
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(defaultBtn);
    card.appendChild(actions);
    userAddressList.appendChild(card);

    if (addressSelect) {
      const option = document.createElement("option");
      option.value = String(index);
      const label = entry.title || `Adres ${index + 1}`;
      option.textContent = `${label} - ${buildAddressText(entry) || ""}`.trim();
      if (entry.isDefault) {
        option.selected = true;
      }
      addressSelect.appendChild(option);
    }
  });

  if (defaultEntry) {
    if (userMenuAddress) {
      userMenuAddress.textContent = buildAddressText(defaultEntry);
    }
    if (defaultAddressCard && defaultAddressText) {
      defaultAddressCard.style.display = "block";
      defaultAddressText.textContent = buildAddressText(defaultEntry);
    }
    if (bookingAddressInput && !bookingAddressInput.value) {
      bookingAddressInput.value = buildAddressText(defaultEntry);
    }
    if (bookingPhoneInput && !bookingPhoneInput.value && defaultEntry.phone) {
      bookingPhoneInput.value = defaultEntry.phone;
    }
  } else if (defaultAddressCard && defaultAddressText) {
    defaultAddressCard.style.display = "none";
    defaultAddressText.textContent = "Adres seçilmedi.";
  }

  if (addressSelect) {
    addressSelect.onchange = () => {
      const idx = Number(addressSelect.value);
      if (!Number.isInteger(idx) || !cachedAddressBook[idx]) return;
      const selected = cachedAddressBook[idx];
      if (bookingAddressInput) {
        bookingAddressInput.value = buildAddressText(selected);
      }
      if (bookingPhoneInput && selected.phone) {
        bookingPhoneInput.value = selected.phone;
      }
      if (defaultAddressCard && defaultAddressText) {
        defaultAddressCard.style.display = "block";
        defaultAddressText.textContent = buildAddressText(selected);
      }
    };
  }
}

function fillAddressForm(entry) {
  if (!entry) return;
  if (addressTitleInput) addressTitleInput.value = entry.title || "";
  if (addressNameInput) addressNameInput.value = entry.name || "";
  if (addressSurnameInput) addressSurnameInput.value = entry.surname || "";
  if (addressCityInput) addressCityInput.value = entry.city || "";
  if (addressDistrictInput) addressDistrictInput.value = entry.district || "";
  if (addressPhoneInput) addressPhoneInput.value = entry.phone || "";
  if (addressTextInput) addressTextInput.value = entry.address || "";
}

function clearAddressForm() {
  if (addressTitleInput) addressTitleInput.value = "";
  if (addressNameInput) addressNameInput.value = "";
  if (addressSurnameInput) addressSurnameInput.value = "";
  if (addressCityInput) addressCityInput.value = "";
  if (addressDistrictInput) addressDistrictInput.value = "";
  if (addressPhoneInput) addressPhoneInput.value = "";
  if (addressTextInput) addressTextInput.value = "";
}

function showAddressModal() {
  if (!userAddressModal) return;
  userAddressModal.classList.add("show");
  userAddressModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  if (userMenuAddressStatus) {
    userMenuAddressStatus.textContent = "";
  }
}

function hideAddressModal() {
  if (!userAddressModal) return;
  userAddressModal.classList.remove("show");
  userAddressModal.setAttribute("aria-hidden", "true");
  if (!userMenu?.classList.contains("show")) {
    document.body.classList.remove("modal-open");
  }
  editingAddressIndex = null;
  if (addressIndexInput) addressIndexInput.value = "";
}

function openAddressModal(index = null) {
  editingAddressIndex = Number.isInteger(index) ? index : null;
  if (addressIndexInput) {
    addressIndexInput.value = editingAddressIndex !== null ? String(editingAddressIndex) : "";
  }
  clearAddressForm();
  if (editingAddressIndex !== null) {
    fillAddressForm(cachedAddressBook[editingAddressIndex]);
  } else {
    const fullName = (userMenuNameInput?.value || "").trim();
    if (fullName && addressNameInput && addressSurnameInput) {
      const parts = fullName.split(" ").filter(Boolean);
      addressNameInput.value = parts.shift() || "";
      addressSurnameInput.value = parts.join(" ");
    }
    if (addressPhoneInput && userMenuPhoneInput) {
      addressPhoneInput.value = userMenuPhoneInput.value || "";
    }
  }
  showAddressModal();
}

function deleteAddress(index) {
  if (!auth.currentUser || !db) return;
  if (!Number.isInteger(index)) return;
  if (!window.confirm("Adresi silmek istiyor musunuz?")) return;
  let updatedBook = cachedAddressBook.filter((_, i) => i !== index);
  if (updatedBook.length && !updatedBook.some((entry) => entry.isDefault)) {
    updatedBook = updatedBook.map((entry, idx) => ({
      ...entry,
      isDefault: idx === 0,
    }));
  }
  const primary = getDefaultAddressEntry(updatedBook);
  db.collection("users")
    .doc(auth.currentUser.uid)
    .set(
      {
        addressBook: updatedBook,
        address: primary ? buildAddressText(primary) : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .then(() => {
      renderAddressList({ addressBook: updatedBook, address: primary?.address || "" });
      if (userMenuAddressStatus) {
        userMenuAddressStatus.textContent = "Adres silindi.";
      }
      updateUserMenuUI(auth.currentUser);
    })
    .catch(() => {
      if (userMenuAddressStatus) {
        userMenuAddressStatus.textContent = "Adres silinemedi.";
      }
    });
}

function setDefaultAddress(index) {
  if (!auth.currentUser || !db) return;
  if (!Number.isInteger(index)) return;
  const updatedBook = cachedAddressBook.map((entry, idx) => ({
    ...entry,
    isDefault: idx === index,
  }));
  const primary = getDefaultAddressEntry(updatedBook);
  db.collection("users")
    .doc(auth.currentUser.uid)
    .set(
      {
        addressBook: updatedBook,
        address: primary ? buildAddressText(primary) : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .then(() => {
      renderAddressList({ addressBook: updatedBook });
      if (userMenuAddressStatus) {
        userMenuAddressStatus.textContent = "Varsayılan adres güncellendi.";
      }
      updateUserMenuUI(auth.currentUser);
    })
    .catch(() => {
      if (userMenuAddressStatus) {
        userMenuAddressStatus.textContent = "Varsayılan güncellenemedi.";
      }
    });
}

// Mobile-first UX: show booking section above shop on small screens, keep desktop sÄ±rayÄ± koru.
(() => {
  const mainEl = document.querySelector("main");
  const booking = document.getElementById("randevu");
  const shop = document.getElementById("shop");
  if (!mainEl || !booking || !shop) return;

  const reorder = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const bookingBeforeShop = shop.previousElementSibling === booking;

    if (isMobile && !bookingBeforeShop) {
      mainEl.insertBefore(booking, shop);
    } else if (!isMobile && bookingBeforeShop) {
      // MasaÃ¼stÃ¼nde eski sÄ±rayÄ± geri getir (shop, sonra booking)
      mainEl.insertBefore(shop, booking);
    }
  };

  reorder();
  window.addEventListener("resize", reorder);
})();

// Mobile sticky CTA: show when booking section out of view on small screens.
(() => {
  const bookingSection = document.getElementById("randevu");
  const bookingForm = document.getElementById("bookingForm");
  const stickyBar = document.getElementById("stickyCta");
  const stickyBtn = document.getElementById("stickyCtaSubmit");
  if (!bookingSection || !bookingForm || !stickyBar || !stickyBtn) return;

  const mql = window.matchMedia("(max-width: 720px)");

  const toggle = (entries) => {
    entries.forEach((entry) => {
      const shouldShow = !entry.isIntersecting && mql.matches;
      stickyBar.classList.toggle("visible", shouldShow);
    });
  };

  const observer = new IntersectionObserver(toggle, {
    rootMargin: "-20% 0px 0px 0px",
    threshold: 0,
  });

  observer.observe(bookingSection);

  mql.addEventListener("change", () => {
    if (!mql.matches) {
      stickyBar.classList.remove("visible");
    }
  });

  stickyBtn.addEventListener("click", () => {
    bookingForm.requestSubmit ? bookingForm.requestSubmit() : bookingForm.submit();
  });
})();

let isLoggedIn = false;
let isVerified = false;
let pendingToken = null;
let pendingAction = null;
let pendingProfile = null;
let lastCodeSentAt = Number(localStorage.getItem("otpLastSentAt") || "0");
const CODE_SEND_COOLDOWN_MS = 60000;
const defaultSendCodeLabel = sendCodeBtn ? sendCodeBtn.textContent : "Kod Gonder";
let serviceItemsUnsub = null;
let shopProductsUnsub = null;
let anonAuthInProgress = false;
let anonAuthDone = false;

const fallbackServices = [
  {
    title: "Evde Islemler",
    slug: "procedures",
    items: [
      { id: "proc_1", title: "Evin Yeni Uyesi Muayenesi", price: 1800 },
      { id: "proc_2", title: "Genel Muayene", price: 1800 },
      { id: "proc_3", title: "Tirnak Kesimi", price: 800 },
      { id: "proc_4", title: "Mikrocip ve Kimliklendirme", price: 1500 },
      { id: "proc_5", title: "Kuduz Titrasyon Testi", price: 14000 },
      { id: "proc_6", title: "Evde Serum Uygulamasi", price: 3000 },
    ],
  },
  {
    title: "Evde Kopek Asilari",
    slug: "vaccines",
    items: [
      { id: "vac_1", title: "Karma Asi", price: 2000 },
      { id: "vac_2", title: "Ic ve Dis Parazit 45 Gun", price: 1800 },
      { id: "vac_3", title: "Ic ve Dis Parazit 90 Gun", price: 3200 },
      { id: "vac_4", title: "Bronsin Asisi", price: 2000 },
      { id: "vac_5", title: "Corona Asisi", price: 2000 },
      { id: "vac_6", title: "Lyme Asisi", price: 2500 },
    ],
  },
];

const fallbackProducts = [
  {
    title: "Premium Kedi Mamasi 2 kg",
    tag: "Yeni",
    description: "Tavsiye edilen, hassas mide.",
    price: 540,
  },
  {
    title: "Kopek Vitamin Seti",
    tag: "Cok Satan",
    description: "Bagisiklik ve eklem destegi.",
    price: 320,
  },
  {
    title: "Hijyen Bakim Paketi",
    tag: "Firsat",
    description: "Sampuan + tarak + kulak solusyonu.",
    price: 410,
  },
  {
    title: "Kus Yem Karisimi",
    tag: "Populer",
    description: "Gunde 1 olcek, saglikli icerik.",
    price: 190,
  },
];

const services = [];
const shopProducts = [];
let shopItemsCache = [];
let activeShopFilter = "all";
const BOOKING_RATE_LIMIT_MS = 45000;

const selectedItems = new Map();

if (serviceVersion) {
  updateServiceLastUpdated(Number(serviceVersion));
}

renderCart();
bindServiceCards();
initSlider();
bindLoginGate();
startCooldownTicker();
bindShopTabs();
bindShopSearch();
bindHeroSearch();
compactBookingForm();
initBookingStepper();
bindPhoneMask();
bindPaymentSummary();
bindTestimonialsToggle();
startHeroPlaceholder();
bindTestimonialsToggle();
bindUserMenu();
bindMobileNav();
bindServiceRefresh();
bindBookingSectionView();

let firestoreBootstrapped = false;
function bootstrapFirestoreData(user) {
  if (firestoreBootstrapped) return;
  if (!user) return;
  firestoreBootstrapped = true;

  // Avoid empty/blank state while Firestore warms up.
  if (catalogEl && services.length === 0) {
    catalogEl.innerHTML = '<div class="cart-item">Fiyatlar yukleniyor...</div>';
  }
  loadServiceItems();
  loadShopProducts();
}

watchAuth();

(() => {
  const params = new URLSearchParams(window.location.search);
  const authParam = params.get("auth");
  if (authParam === "signup" || authParam === "login") {
    showLoginGate(authParam);
  }
})();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isLoggedIn || !isVerified) {
    showLoginGate();
    return;
  }

  const name = document.getElementById("name").value.trim();
  const rawPhone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const datetime = document.getElementById("datetime").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const paymentMethod =
    document.querySelector('input[name="paymentMethod"]:checked')?.value || "";
  const phone = normalizePhone(rawPhone);
  const items = Array.from(selectedItems.values());
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const hpValue = (document.getElementById("hpField")?.value || "").trim();
  const now = Date.now();
  const lastBooking = Number(localStorage.getItem("bookingLastSubmitAt") || "0");

  if (hpValue) {
    showStatus("Islem tamamlanamadi. Lutfen tekrar deneyin.", true);
    return;
  }

  if (now - lastBooking < BOOKING_RATE_LIMIT_MS) {
    showStatus("Lutfen biraz bekleyip tekrar deneyin.", true);
    return;
  }

  if (items.length === 0) {
    showStatus("Lutfen en az bir hizmet secin.", true);
    return;
  }

  if (name.length < 3) {
    showStatus("Lutfen ad soyad girin.", true);
    return;
  }

  if (address.length < 8) {
    showStatus("Lutfen adres bilginizi detaylandirin.", true);
    return;
  }

  if (!isValidPhone(phone)) {
    showStatus("Telefon numarasini +90 formatinda girin.", true);
    return;
  }

  if (!paymentMethod) {
    showStatus("Lutfen odeme yontemi secin.", true);
    return;
  }

  const serviceTip = serviceMessage(items);
  document.getElementById("selectedServices").value = items
    .map((item) => item.title)
    .join(", ");
  document.getElementById("totalPrice").value = `${total} TL`;
  document.getElementById("serviceNote").value = serviceTip;
  userEmailHidden.value = auth.currentUser?.email || "";

  const formData = new FormData(form);
  const payload = new URLSearchParams(formData).toString();

  if (auth.currentUser) {
    upsertUserProfile({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      name,
      phone,
      address,
    });
  }

  fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Talep gonderilemedi.");
      }
      if (auth.currentUser) {
        const bookingPayload = {
          name,
          phone,
          address,
          datetime,
          notes,
          paymentMethod,
          email: auth.currentUser?.email || "",
          services: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
          })),
          total,
          status: "new",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        db.collection("bookings").add(bookingPayload).catch(() => {});
      }
      form.reset();
      selectedItems.clear();
      renderCatalog();
      renderCart();
      bindPaymentSummary();
      localStorage.setItem("bookingLastSubmitAt", String(now));
      showStatus("Talebiniz alindi. Size en kisa surede donus yapacagiz.");
      trackEvent("booking_submit", {
        item_count: items.length,
        total_price: total,
        payment_method: paymentMethod,
      });
    })
    .catch((error) => {
      showStatus(error.message || "Bir hata olustu. Lutfen tekrar deneyin.", true);
    });
});

function bindLoginGate() {
  if (!loginGate) return;
  const closeButton = loginGate.querySelector(".close-gate");
  const drawerClose = loginGate.querySelector(".drawer-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => hideLoginGate());
  }
  if (drawerClose) {
    drawerClose.addEventListener("click", () => hideLoginGate());
  }
  loginGate.addEventListener("click", (event) => {
    if (event.target === loginGate) {
      hideLoginGate();
    }
  });
  loginTriggers.forEach((trigger) =>
    trigger.addEventListener("click", () =>
      showLoginGate(trigger.dataset.tab || "login")
    )
  );
  loginTabs.forEach((tab) =>
    tab.addEventListener("click", () => switchLoginTab(tab))
  );
  loginBtn.addEventListener("click", handleLogin);
  signupBtn.addEventListener("click", handleSignup);
  sendCodeBtn.addEventListener("click", handleSendCode);
  confirmCodeBtn.addEventListener("click", handleConfirmCode);
  forgotPasswordBtn.addEventListener("click", handleForgotPassword);
  logoutBtn.addEventListener("click", handleLogout);
  editInfoBtn?.addEventListener("click", () => {
    setCodeStage(false);
    setLoginStatus("Bilgileri duzenleyebilirsiniz.", false);
    loginEmail?.focus();
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener("click", () => trackEvent("whatsapp_click"));
  });
}

function bindPhoneMask() {
  const phoneInput = document.getElementById("phone");
  if (!phoneInput) return;
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "");
    if (!digits) return;
    let formatted = digits;
    if (digits.startsWith("90")) {
      formatted = `+${digits}`;
    } else if (digits.startsWith("0")) {
      formatted = `+90${digits.slice(1)}`;
    } else if (digits.length === 10) {
      formatted = `+90${digits}`;
    }
    const cleaned = formatted.replace(/[^\d+]/g, "");
    const match = cleaned.match(/^(\+90)?(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      phoneInput.value = `${match[1] || "+90"} ${match[2]} ${match[3]} ${
        match[4]
      } ${match[5]}`;
    }
  });
}

function bindPaymentSummary() {
  const summaryEl = document.getElementById("paymentSummary");
  const radios = Array.from(document.querySelectorAll('input[name="paymentMethod"]'));
  if (!summaryEl || radios.length === 0) return;
  // Defensive default: if markup changes or browser restores state without a checked radio,
  // pick the first option so validation + UI stay consistent.
  if (!radios.some((radio) => radio.checked)) {
    radios[0].checked = true;
  }
  let lastSelected = radios.find((radio) => radio.checked)?.value || "";

  const update = () => {
    radios.forEach((radio) => {
      const label = radio.closest(".payment-option");
      if (label) {
        label.classList.toggle("active", radio.checked);
      }
    });
    const selected = radios.find((radio) => radio.checked)?.value;
    summaryEl.textContent = `Ödeme: ${selected || "Seçilmedi"}`;
    updateBookingReview();
    if (selected && selected !== lastSelected) {
      trackEvent("booking_payment_selected", { method: selected });
      lastSelected = selected;
    }
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", update);
  });

  update();
}

function updateBookingReview(totalOverride) {
  if (!bookingReviewEl) return;
  const items = Array.from(selectedItems.values());
  const total =
    typeof totalOverride === "number"
      ? totalOverride
      : items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const paymentMethod =
    document.querySelector('input[name="paymentMethod"]:checked')?.value || "-";

  if (reviewItemCountEl) {
    reviewItemCountEl.textContent = String(items.length);
  }
  if (reviewTotalEl) {
    reviewTotalEl.textContent = `${total} TL`;
  }
  if (reviewPaymentEl) {
    reviewPaymentEl.textContent = paymentMethod;
  }
  if (!reviewItemsEl) return;

  reviewItemsEl.innerHTML = "";
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "more";
    li.textContent = "Henüz hizmet seçilmedi.";
    reviewItemsEl.appendChild(li);
    return;
  }

  const maxItems = 4;
  items.slice(0, maxItems).forEach((item) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = item.title || "Hizmet";
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `${item.price} TL`;
    li.appendChild(name);
    li.appendChild(price);
    reviewItemsEl.appendChild(li);
  });
  if (items.length > maxItems) {
    const more = document.createElement("li");
    more.className = "more";
    more.textContent = `+${items.length - maxItems} diger hizmet`;
    reviewItemsEl.appendChild(more);
  }
}

function bindServiceRefresh() {
  if (!refreshServiceBtn) return;
  refreshServiceBtn.addEventListener("click", () => {
    refreshServiceBtn.disabled = true;
    refreshServiceBtn.textContent = "Yenileniyor...";
    trackEvent("service_prices_manual_refresh");
    db.collection("serviceItems")
      .get({ source: "server" })
      .then((snapshot) => {
        let newestUpdatedMs = 0;
        snapshot.forEach((doc) => {
          const item = doc.data() || {};
          newestUpdatedMs = Math.max(
            newestUpdatedMs,
            toMillisSafe(item.updatedAt),
            toMillisSafe(item.createdAt)
          );
        });
        updateServiceLastUpdated(newestUpdatedMs);
        showToast("Fiyatlar yenilendi.");
      })
      .catch(() => {
        showToast("Yenileme basarisiz. Tekrar deneyin.", true);
      })
      .finally(() => {
        refreshServiceBtn.disabled = false;
        refreshServiceBtn.textContent = "Fiyatlari Yenile";
      });
  });
}

function bindBookingSectionView() {
  const section = document.getElementById("randevu");
  if (!section || typeof IntersectionObserver === "undefined") return;
  let sent = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!sent && entry.isIntersecting) {
          sent = true;
          trackEvent("booking_section_view");
          observer.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(section);
}

let lastUserMenuTarget = "menuAccount";

function bindMobileNav() {
  if (!mobileNav || !navHamburger) return;
  const closeBtn = mobileNav.querySelector(".mobile-nav-close");

  const show = () => {
    mobileNav.classList.add("show");
    mobileNav.setAttribute("aria-hidden", "false");
    navHamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");
  };

  const hide = () => {
    mobileNav.classList.remove("show");
    mobileNav.setAttribute("aria-hidden", "true");
    navHamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
  };

  navHamburger.addEventListener("click", show);
  closeBtn?.addEventListener("click", hide);
  mobileNav.addEventListener("click", (event) => {
    if (event.target === mobileNav) {
      hide();
      return;
    }
    const actionBtn = event.target.closest("[data-mobile-action]");
    if (!actionBtn) return;
    const action = actionBtn.dataset.mobileAction || "";
    hide();
    if (action === "userMenu") {
      userMenuTrigger?.click();
      return;
    }
    if (action === "login") {
      showLoginGate("login");
      return;
    }
    if (action === "signup") {
      showLoginGate("signup");
    }
  });
  mobileNav.querySelectorAll("a.mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => hide());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (mobileNav.classList.contains("show")) {
      hide();
    }
  });
}

function bindUserMenu() {
  if (!userMenu || !userMenuTrigger) return;
  const menuItems = Array.from(userMenu.querySelectorAll(".menu-item"));
  const menuPanels = Array.from(userMenu.querySelectorAll(".menu-panel"));
  const setActivePanel = (targetId) => {
    if (!targetId) return;
    lastUserMenuTarget = targetId;
    menuPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
    menuItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.target === targetId);
    });
    if (userMenuActiveLabel) {
      const activeItem = menuItems.find((item) => item.dataset.target === targetId);
      userMenuActiveLabel.textContent = activeItem
        ? activeItem.textContent.trim()
        : "Hesap Bilgileri";
    }
    const activePanel = userMenu.querySelector(`#${targetId}`);
    if (activePanel) {
      activePanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };
  const show = () => {
    userMenu.classList.add("show");
    userMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (menuItems.length) {
      setActivePanel(lastUserMenuTarget || menuItems[0].dataset.target);
    }
  };
  const hide = () => {
    userMenu.classList.remove("show");
    userMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    hideAddressModal();
  };

  userMenuTrigger.addEventListener("click", show);
  userMenu.addEventListener("click", (event) => {
    if (event.target === userMenu) {
      hide();
    }
  });
  userMenuCloseButtons?.forEach((btn) => btn.addEventListener("click", hide));
  userMenuLoginBtn?.addEventListener("click", () => {
    hide();
    showLoginGate();
  });
  userMenuLogoutBtn?.addEventListener("click", () => {
    handleLogout();
    hide();
  });

  addressAddBtn?.addEventListener("click", () => {
    if (!auth.currentUser) {
      hide();
      showLoginGate();
      return;
    }
    openAddressModal(null);
  });

  userAddressModal?.addEventListener("click", (event) => {
    if (event.target === userAddressModal) {
      hideAddressModal();
    }
  });

  addressCancelBtn?.addEventListener("click", hideAddressModal);
  userAddressModal
    ?.querySelectorAll(".address-close")
    .forEach((btn) => btn.addEventListener("click", hideAddressModal));

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      setActivePanel(item.dataset.target);
    });
  });

  userMenuAccountForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!auth.currentUser) return;
    const fullName = (userMenuNameInput?.value || "").trim();
    const parts = fullName.split(" ").filter(Boolean);
    const name = parts.shift() || "";
    const surname = parts.join(" ");
    const phone = (userMenuPhoneInput?.value || "").trim();

    userMenuAccountStatus.textContent = "Kaydediliyor...";
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          name,
          surname,
          phone,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      .then(() => {
        setProfileCache(auth.currentUser.uid, {
          email: auth.currentUser.email || "",
          name,
          surname,
          phone,
        });
        userMenuAccountStatus.textContent = "Bilgiler güncellendi.";
        applyCachedUserProfile(auth.currentUser.uid, auth.currentUser.email || "");
      })
      .catch(() => {
        userMenuAccountStatus.textContent = "Kaydedilemedi.";
      });
  });

userMenuAddressForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!auth.currentUser) return;
  const title = (addressTitleInput?.value || "").trim();
  const name = (addressNameInput?.value || "").trim();
  const surname = (addressSurnameInput?.value || "").trim();
  const city = (addressCityInput?.value || "").trim();
  const district = (addressDistrictInput?.value || "").trim();
  const phone = (addressPhoneInput?.value || "").trim();
  const address = (addressTextInput?.value || "").trim();

  if (!address) {
    userMenuAddressStatus.textContent = "Adres boş olamaz.";
    return;
  }

  const addressEntry = {
    title: title || "Adres",
    name,
    surname,
    city,
    district,
    phone: phone ? normalizePhone(phone) : "",
    address,
    createdAt: Date.now(),
  };

  userMenuAddressStatus.textContent = "Kaydediliyor...";
  const docRef = db.collection("users").doc(auth.currentUser.uid);
  const book = Array.isArray(cachedAddressBook) ? cachedAddressBook : [];
  let updatedBook = [];
  if (editingAddressIndex !== null && book[editingAddressIndex]) {
    const existing = book[editingAddressIndex];
    const updated = {
      ...existing,
      ...addressEntry,
      createdAt: existing.createdAt || addressEntry.createdAt,
      updatedAt: Date.now(),
    };
    updatedBook = [...book];
    updatedBook[editingAddressIndex] = updated;
  } else {
    const hasDefault = book.some((entry) => entry.isDefault);
    updatedBook = [{ ...addressEntry, isDefault: !hasDefault }, ...book].slice(0, 5);
  }
  const primary = getDefaultAddressEntry(updatedBook);
  const primaryText = primary ? buildAddressText(primary) : "";
  const fallbackPhone = (userMenuPhoneInput?.value || "").trim() || addressEntry.phone || "";

  docRef
    .set(
      {
        address: primaryText,
        addressBook: updatedBook,
        phone: fallbackPhone,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .then(() => {
      cachedAddressBook = updatedBook;
      setProfileCache(auth.currentUser.uid, {
        email: auth.currentUser.email || "",
        address: primaryText,
        addressBook: updatedBook,
        phone: fallbackPhone,
      });
      renderAddressList({ addressBook: updatedBook, address: primaryText, phone: fallbackPhone });
      userMenuAddressStatus.textContent = "Adres kaydedildi.";
      hideAddressModal();
      if (userMenuAddressForm) {
        userMenuAddressForm.reset();
      }
      editingAddressIndex = null;
    })
    .catch(() => {
      userMenuAddressStatus.textContent = "Kaydedilemedi.";
    });
});
}

function initBookingStepper() {
  const formEl = document.getElementById("bookingForm");
  const steps = Array.from(document.querySelectorAll(".booking-step"));
  const dots = Array.from(document.querySelectorAll(".booking-stepper .step-dot"));
  const progressFill = document.getElementById("bookingProgressFill");
  if (!formEl || steps.length === 0) return;

  const mql = window.matchMedia("(max-width: 720px)");
  let current = 1;
  let lastTrackedStep = 0;

  const setRequired = (stepIndex) => {
    steps.forEach((step, idx) => {
      step.querySelectorAll("input, textarea, select").forEach((el) => {
        if (mql.matches) {
          if (idx + 1 === stepIndex) {
            if (el.dataset.req === "true") el.required = true;
          } else {
            if (el.required) {
              el.dataset.req = "true";
              el.required = false;
            }
          }
        } else {
          if (el.dataset.req === "true") el.required = true;
        }
      });
    });
  };

  const update = () => {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx + 1 === current);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx + 1 === current);
    });
    if (progressFill) {
      const total = Math.max(1, steps.length - 1);
      const pct = Math.round(((current - 1) / total) * 100);
      progressFill.style.width = `${pct}%`;
    }
    setRequired(current);
    if (current !== lastTrackedStep) {
      trackEvent("booking_step_view", { step: current });
      lastTrackedStep = current;
    }
  };

  formEl.addEventListener("click", (event) => {
    const next = event.target.closest(".next-step");
    const prev = event.target.closest(".prev-step");
    if (next) {
      const activeStep = steps[current - 1];
      const inputs = Array.from(activeStep.querySelectorAll("input, textarea, select"));
      const invalid = inputs.find((el) => el.required && !el.checkValidity());
      if (invalid) {
        trackEvent("booking_step_validation_error", {
          step: current,
          field: invalid.name || invalid.id || "unknown",
        });
        invalid.reportValidity();
        return;
      }
      const nextStep = Math.min(current + 1, steps.length);
      trackEvent("booking_step_next", { from: current, to: nextStep });
      current = Math.min(current + 1, steps.length);
      update();
    }
    if (prev) {
      const prevStep = Math.max(current - 1, 1);
      trackEvent("booking_step_back", { from: current, to: prevStep });
      current = Math.max(current - 1, 1);
      update();
    }
  });

  mql.addEventListener("change", () => {
    current = 1;
    update();
  });

  update();
}

function startHeroPlaceholder() {
  const inputEl = document.querySelector(".hero-search input");
  if (!inputEl) return;
  stopHeroPlaceholder();
  if (inputEl.dataset.userActive === "true") return;

  inputEl.placeholder = "";

  const phrase = heroPlaceholderPhrases[heroPlaceholderIndex % heroPlaceholderPhrases.length];
  let pos = 0;
  let deleting = false;

  const tick = () => {
    if (inputEl.dataset.userActive === "true") {
      stopHeroPlaceholder();
      return;
    }

    if (!deleting) {
      inputEl.placeholder = phrase.slice(0, pos + 1);
      pos += 1;
      if (pos === phrase.length) {
        deleting = true;
        heroPlaceholderTimer = setTimeout(tick, 1200);
        return;
      }
    } else {
      inputEl.placeholder = phrase.slice(0, Math.max(pos - 1, 0));
      pos -= 1;
      if (pos === 0) {
        deleting = false;
        heroPlaceholderIndex = (heroPlaceholderIndex + 1) % heroPlaceholderPhrases.length;
      }
    }
    heroPlaceholderTimer = setTimeout(tick, deleting ? 45 : 110);
  };

  tick();
}

function stopHeroPlaceholder() {
  if (heroPlaceholderTimer) {
    clearTimeout(heroPlaceholderTimer);
    heroPlaceholderTimer = null;
  }
}

function watchAuth() {
  auth.onAuthStateChanged((user) => {
    const isRealUser = Boolean(user && !user.isAnonymous);
    isLoggedIn = isRealUser;
    if (user && isRealUser && !isEmailVerified(user.email)) {
      markEmailVerified(user.email);
    }
    isVerified = Boolean(user && isRealUser && isEmailVerified(user.email));
    if (userEmailHidden) {
      userEmailHidden.value = user?.email || "";
    }
    if (user && isRealUser) {
      ensureUserProfile(user);
    }
    if (!user) {
      ensureAnonymousAuth();
    }
    updateLoginUI(isRealUser ? user : null);
    // Load Firestore-backed content only after auth is ready (real or anonymous).
    if (user) {
      bootstrapFirestoreData(user);
    }
  });
}

function ensureAnonymousAuth() {
  if (anonAuthDone || anonAuthInProgress) return Promise.resolve();
  anonAuthInProgress = true;
  return auth
    .signInAnonymously()
    .then(() => {
      anonAuthDone = true;
    })
    .catch((error) => {
      console.warn("anonymous auth failed", error);
      anonAuthDone = false;
    })
    .finally(() => {
      anonAuthInProgress = false;
    });
}

function handleLogin() {
  clearAuthFieldErrors();
  const email = loginEmail.value.trim().toLowerCase();
  if (loginEmail.value !== email) {
    loginEmail.value = email;
  }
  const password = loginPassword.value.trim();
  if (!email || !password) {
    if (!email) setAuthFieldError("email", "E-posta gerekli.");
    if (!password) setAuthFieldError("password", "Sifre gerekli.");
    setLoginStatus("E-posta ve sifre girin.", true);
    return;
  }
  pendingAction = "login";
  setLoginStatus("Giris yapiliyor...", false);
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      setLoginStatus("Giris basarili.", false);
      markEmailVerified(email);
      hideLoginGate();
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        setLoginStatus("Kullanici bulunamadi. Uye olun.", true);
        return;
      }
      if (error.code === "auth/wrong-password") {
        setLoginStatus("Sifre hatali.", true);
        return;
      }
      setLoginStatus(error.message || "Giris yapilamadi.", true);
    });
}

function handleSignup() {
  clearAuthFieldErrors();
  const email = loginEmail.value.trim().toLowerCase();
  if (loginEmail.value !== email) {
    loginEmail.value = email;
  }
  const password = loginPassword.value.trim();
  const passwordConfirm = loginPasswordConfirm.value.trim();
  const name = signupName.value.trim();
  const surname = signupSurname.value.trim();
  const phone = signupPhone.value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const birthdate = signupBirthdate ? signupBirthdate.value : "";
  if (!email || !password) {
    if (!email) setAuthFieldError("email", "E-posta gerekli.");
    if (!password) setAuthFieldError("password", "Sifre gerekli.");
    setLoginStatus("E-posta ve sifre girin.", true);
    return;
  }
  if (passwordConfirm && password !== passwordConfirm) {
    setAuthFieldError("passwordConfirm", "Sifreler eslesmiyor.");
    setLoginStatus("Sifreler eslesmiyor.", true);
    return;
  }
  if (!name || !surname) {
    if (!name) setAuthFieldError("name", "Ad gerekli.");
    if (!surname) setAuthFieldError("surname", "Soyad gerekli.");
    setLoginStatus("Ad ve soyad zorunlu.", true);
    return;
  }
  if (!phone) {
    setAuthFieldError("phone", "Telefon gerekli.");
    setLoginStatus("Telefon zorunlu.", true);
    return;
  }
  if (acceptTerms && !acceptTerms.checked) {
    setAuthFieldError("terms", "Devam etmek icin KVKK ve Hizmet Sartlari'ni kabul edin.");
    setLoginStatus("KVKK ve Hizmet Sartlari'ni kabul etmeniz gerekir.", true);
    return;
  }
  pendingAction = "signup";
  pendingProfile = { name, surname, phone, gender, birthdate };
  setLoginStatus("Onay kodu gonderiyoruz...", false);
  handleSendCode();
}

function setLoginStatus(message, isError) {
  if (loginStatus) {
    loginStatus.textContent = message;
    loginStatus.classList.toggle("error", isError);
  }
  showToast(message, isError);
}

function clearAuthFieldErrors() {
  authInlineErrors.forEach((el) => el.classList.remove("show"));
  authInlineErrors.forEach((el) => (el.textContent = ""));
  [
    loginEmail,
    loginPassword,
    loginPasswordConfirm,
    loginCode,
    signupName,
    signupSurname,
    signupPhone,
  ]
    .filter(Boolean)
    .forEach((input) => input.classList.remove("is-invalid"));
}

function setAuthFieldError(key, message) {
  const errorEl = authInlineErrors.find((el) => el.dataset.errorFor === key);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
  const inputMap = {
    email: loginEmail,
    password: loginPassword,
    passwordConfirm: loginPasswordConfirm,
    code: loginCode,
    name: signupName,
    surname: signupSurname,
    phone: signupPhone,
  };
  const input = inputMap[key];
  if (input) {
    input.classList.add("is-invalid");
  }
}

function startCooldownTicker() {
  updateCooldownUI();
  setInterval(updateCooldownUI, 1000);
}

function updateCooldownUI() {
  if (!sendCodeBtn) return;
  if (isLoggedIn) {
    sendCodeBtn.disabled = true;
    return;
  }
  const remaining = Math.max(
    0,
    CODE_SEND_COOLDOWN_MS - (Date.now() - lastCodeSentAt)
  );
  if (remaining === 0) {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = defaultSendCodeLabel;
    return;
  }
  const seconds = Math.ceil(remaining / 1000);
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = `Tekrar gonder (${seconds}s)`;
}

function updateLoginUI(user) {
  const loggedIn = Boolean(user);
  loginInfo.textContent = loggedIn ? `Giris yapildi: ${user.email}` : "";
  loginBtn.disabled = loggedIn;
  signupBtn.disabled = loggedIn;
  sendCodeBtn.disabled = loggedIn;
  confirmCodeBtn.disabled = loggedIn;
  loginEmail.disabled = loggedIn;
  loginPassword.disabled = loggedIn;
  loginCode.disabled = loggedIn;
  forgotPasswordBtn.style.display = loggedIn ? "none" : "inline-flex";
  logoutBtn.style.display = loggedIn ? "inline-flex" : "none";
  if (loggedIn && userMenuSubtitle) {
    userMenuSubtitle.textContent = "Yükleniyor...";
  }
  updateUserMenuUI(user);
}

function handleForgotPassword() {
  const email = loginEmail.value.trim();
  if (!email) {
    setLoginStatus("E-posta adresinizi girin.", true);
    return;
  }
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      setLoginStatus(
        "Sifre yenileme e-postasi gonderildi. Spam/Promosyon klasorunu kontrol edin.",
        false
      );
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        setLoginStatus(
          "Bu e-posta ile kayitli hesap bulunamadi. Uye ol ile kaydolabilirsiniz.",
          true
        );
        return;
      }
      if (error.code === "auth/invalid-email") {
        setLoginStatus("Gecersiz e-posta adresi.", true);
        return;
      }
      if (error.code === "auth/too-many-requests") {
        setLoginStatus("Cok fazla deneme. Biraz sonra tekrar deneyin.", true);
        return;
      }
      setLoginStatus("Sifre yenileme e-postasi gonderilemedi.", true);
    });
}

function handleLogout() {
  auth.signOut().finally(() => {
    isLoggedIn = false;
    isVerified = false;
    pendingAction = null;
    pendingToken = null;
    setLoginStatus("Cikis yapildi.", false);
  });
}

function handleSendCode() {
  clearAuthFieldErrors();
  if (pendingAction !== "signup") {
    setLoginStatus("Kod yalnizca uyelik icin gonderilir.", true);
    return;
  }
  const email = loginEmail.value.trim().toLowerCase();
  if (loginEmail.value !== email) {
    loginEmail.value = email;
  }
  if (!email) {
    setAuthFieldError("email", "E-posta gerekli.");
    setLoginStatus("E-posta adresinizi girin.", true);
    return;
  }
  const now = Date.now();
  if (now - lastCodeSentAt < CODE_SEND_COOLDOWN_MS) {
    setLoginStatus("Kod zaten gonderildi. Lutfen biraz bekleyin.", true);
    updateCooldownUI();
    return;
  }
  fetch("/api/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Kod gonderilemedi.");
      }
      pendingToken = data.token;
      lastCodeSentAt = now;
      localStorage.setItem("otpLastSentAt", String(now));
      updateCooldownUI();
      setCodeStage(true);
      setLoginStatus(
        "Onay kodu gonderildi. Kodu girip onaylayin.",
        false
      );
      loginCode.focus();
    })
    .catch((error) => {
      setLoginStatus(error.message, true);
    });
}

function handleConfirmCode() {
  clearAuthFieldErrors();
  const email = loginEmail.value.trim().toLowerCase();
  if (loginEmail.value !== email) {
    loginEmail.value = email;
  }
  const password = loginPassword.value.trim();
  const code = loginCode.value.trim();
  if (!email || !code || !pendingToken) {
    if (!email) setAuthFieldError("email", "E-posta gerekli.");
    if (!code) setAuthFieldError("code", "Kod gerekli.");
    setLoginStatus("E-posta, kod ve gecerli token gerekli.", true);
    return;
  }
  if (!password) {
    setAuthFieldError("password", "Sifre gerekli.");
    setLoginStatus("Sifre girin.", true);
    return;
  }
  if (pendingAction === "signup" && acceptTerms && !acceptTerms.checked) {
    setAuthFieldError("terms", "Devam etmek icin KVKK ve Hizmet Sartlari'ni kabul edin.");
    setLoginStatus(
      "Kayit icin KVKK ve Hizmet Sartlari'ni kabul etmeniz gerekir.",
      true
    );
    return;
  }
  fetch("/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, token: pendingToken }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Kod dogrulanamadi.");
      }
      markEmailVerified(email);
      const persistence =
        rememberMe && rememberMe.checked
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION;
      return auth.setPersistence(persistence).then(() => {
        if (pendingAction === "signup") {
          return auth
            .createUserWithEmailAndPassword(email, password)
            .catch((error) => {
              if (error.code === "auth/email-already-in-use") {
                return auth.signInWithEmailAndPassword(email, password);
              }
              throw error;
            });
        }
        if (pendingAction === "login") {
          return auth.signInWithEmailAndPassword(email, password);
        }
        return auth
          .signInWithEmailAndPassword(email, password)
          .catch((error) => {
            if (error.code === "auth/user-not-found") {
              return auth.createUserWithEmailAndPassword(email, password);
            }
            throw error;
          });
      });
    })
    .then(() => {
      if (pendingAction === "signup" && pendingProfile && auth.currentUser) {
        upsertUserProfile({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: pendingProfile.name,
          surname: pendingProfile.surname,
          phone: pendingProfile.phone,
          gender: pendingProfile.gender,
          birthdate: pendingProfile.birthdate,
        });
      }
      setLoginStatus("Dogrulama tamamlandi.", false);
      pendingAction = null;
      pendingProfile = null;
      hideLoginGate();
    })
    .catch((error) => {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setLoginStatus(
          "Sifre hatali veya hesap baska sifreyle kayitli. Dogru sifreyle tekrar deneyin.",
          true
        );
        return;
      }
      if (error.code === "auth/too-many-requests") {
        setLoginStatus("Cok fazla deneme. 30 dk sonra tekrar deneyin.", true);
        return;
      }
      setLoginStatus(error.message, true);
    });
}

function showLoginGate(tabName) {
  loginGate.classList.add("show");
  loginGate.setAttribute("aria-hidden", "false");
  setCodeStage(false);
  if (tabName) {
    const target = Array.from(loginTabs).find((tab) => tab.dataset.tab === tabName);
    if (target) {
      switchLoginTab(target);
    }
  }
}

function hideLoginGate() {
  loginGate.classList.remove("show");
  loginGate.setAttribute("aria-hidden", "true");
  setCodeStage(false);
}

function setCodeStage(active) {
  if (!loginCard) return;
  loginCard.classList.toggle("code-sent", Boolean(active));
  if (loginEmail) loginEmail.readOnly = Boolean(active);
  if (loginPassword) loginPassword.readOnly = Boolean(active);
  if (loginPasswordConfirm) loginPasswordConfirm.readOnly = Boolean(active);
  if (loginCode) {
    loginCode.disabled = !active;
    if (!active) loginCode.value = "";
  }
  if (confirmCodeBtn) {
    confirmCodeBtn.disabled = !active;
  }
  if (signupBtn) {
    signupBtn.textContent = "Uyeligini Tamamla";
  }
}

function switchLoginTab(tab) {
  loginTabs.forEach((btn) => btn.classList.remove("active"));
  tab.classList.add("active");
  if (loginCard) {
    loginCard.classList.toggle("signup-active", tab.dataset.tab === "signup");
  }
  pendingToken = null;
  clearAuthFieldErrors();
  setCodeStage(false);
  if (tab.dataset.tab === "signup") {
    pendingAction = "signup";
    setLoginStatus(
      "Uye olmak icin bilgileri doldurun ve Uyeligini Tamamla'ya basin.",
      false
    );
  } else {
    pendingAction = "login";
    setLoginStatus("", false);
  }
}

function getVerifiedEmails() {
  try {
    return JSON.parse(localStorage.getItem("verifiedEmails") || "{}");
  } catch (_) {
    return {};
  }
}

function markEmailVerified(email) {
  const verified = getVerifiedEmails();
  verified[email] = true;
  localStorage.setItem("verifiedEmails", JSON.stringify(verified));
  isVerified = true;
}

function isEmailVerified(email) {
  if (!email) return false;
  const verified = getVerifiedEmails();
  return Boolean(verified[email]);
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  if (digits.startsWith("90")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+90${digits}`;
  }
  return value;
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12;
}

function showToast(message, isError = false) {
  if (!toastEl || !message) return;
  toastEl.textContent = message;
  toastEl.classList.toggle("error", isError);
  toastEl.classList.add("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3200);
}

function stopUserProfileListener() {
  if (userProfileUnsub) {
    userProfileUnsub();
    userProfileUnsub = null;
  }
  userProfileUid = "";
  if (userProfileLoadTimer) {
    clearTimeout(userProfileLoadTimer);
    userProfileLoadTimer = null;
  }
}

function applyUserProfileData(user, data = {}) {
  const fullName = [data.name, data.surname].filter(Boolean).join(" ").trim();
  if (userMenuSubtitle) {
    userMenuSubtitle.textContent = fullName ? `Sn. ${fullName}` : user.email;
  }
  if (userMenuFullName) {
    userMenuFullName.textContent = fullName || "-";
  }
  if (userMenuPhone) {
    userMenuPhone.textContent = data.phone || "-";
  }
  if (userMenuAddress) {
    userMenuAddress.textContent = data.address || "Adres kaydı bulunamadı.";
  }
  if (userMenuNameInput) {
    userMenuNameInput.value = fullName || "";
  }
  if (userMenuPhoneInput) {
    userMenuPhoneInput.value = data.phone || "";
  }
  renderAddressList(data);
  if (bookingNameInput && !bookingNameInput.value) {
    bookingNameInput.value = fullName || "";
  }
  if (bookingPhoneInput && !bookingPhoneInput.value && data.phone) {
    bookingPhoneInput.value = data.phone;
  }
}

function applyCachedUserProfile(uid, fallbackEmail = "") {
  const cached = getProfileCache(uid);
  if (!cached) return;
  applyUserProfileData({ uid, email: fallbackEmail || cached.email || "" }, cached);
}

function startUserProfileListener(user) {
  if (!user?.uid || !db) return;
  if (userProfileUid === user.uid && userProfileUnsub) return;

  stopUserProfileListener();
  userProfileUid = user.uid;

  if (userMenuSubtitle) {
    userMenuSubtitle.textContent = "Yükleniyor...";
  }

  // Avoid "stuck loading" UX: fall back to cached data quickly if Firestore read stalls/denies.
  userProfileLoadTimer = setTimeout(() => {
    if (userMenuSubtitle && userMenuSubtitle.textContent === "Yükleniyor...") {
      userMenuSubtitle.textContent = user.email;
      if (userMenuAccountStatus) {
        userMenuAccountStatus.textContent =
          "Bilgiler yüklenemedi. Son kayitli bilgiler gosteriliyor.";
      }
      applyCachedUserProfile(user.uid, user.email || "");
    }
  }, 1500);

  const docRef = db.collection("users").doc(user.uid);
  userProfileUnsub = docRef.onSnapshot(
    (doc) => {
      if (userProfileLoadTimer) {
        clearTimeout(userProfileLoadTimer);
        userProfileLoadTimer = null;
      }
      if (!doc.exists) {
        // Document might be created slightly after auth; try creating and fall back to cache.
        ensureUserProfile(user);
        if (userMenuSubtitle) {
          userMenuSubtitle.textContent = user.email;
        }
        applyCachedUserProfile(user.uid, user.email || "");
        return;
      }
      const data = doc.data() || {};
      setProfileCache(user.uid, {
        email: user.email || data.email || "",
        name: data.name || "",
        surname: data.surname || "",
        phone: data.phone || "",
        address: data.address || "",
        addressBook: Array.isArray(data.addressBook) ? data.addressBook : [],
      });
      if (userMenuAccountStatus) {
        userMenuAccountStatus.textContent = "";
      }
      applyUserProfileData(user, data);
    },
    (error) => {
      if (userProfileLoadTimer) {
        clearTimeout(userProfileLoadTimer);
        userProfileLoadTimer = null;
      }
      console.warn("user profile load failed", error);
      // Even if reads are blocked by rules, try creating/updating the doc so admin can see it later.
      try {
        ensureUserProfile(user);
      } catch (_) {}
      if (userMenuSubtitle) {
        userMenuSubtitle.textContent = user.email;
      }
      if (userMenuAccountStatus) {
        if (error?.code === "permission-denied") {
          userMenuAccountStatus.textContent =
            "Bilgiler su an okunamiyor. (Izin) Bilgileri Kaydet'e basarak profil olusturabilirsiniz.";
        } else {
          userMenuAccountStatus.textContent =
            "Bilgiler su an yuklenemedi. Baglanti problemi olabilir. Bilgileri Kaydet ile devam edebilirsiniz.";
        }
      }
      applyCachedUserProfile(user.uid, user.email || "");
    }
  );
}

function updateUserMenuUI(user) {
  const loggedIn = Boolean(user);
  if (userMenuName) {
    userMenuName.textContent = "Hoş Geldiniz";
  }
  if (userMenuSubtitle) {
    userMenuSubtitle.textContent = loggedIn ? "Yükleniyor..." : "Giriş yapın / Üye olun";
  }
  if (userMenuEmail) {
    userMenuEmail.textContent = loggedIn ? user.email : "";
  }
  if (userMenuEmailText) {
    userMenuEmailText.textContent = loggedIn ? user.email : "-";
  }
  if (userMenuPhone) {
    userMenuPhone.textContent = "-";
  }
  if (userMenuAddress) {
    userMenuAddress.textContent = "Adres kaydı bulunamadı.";
  }
  if (userMenuNameInput) {
    userMenuNameInput.value = "";
  }
  if (userMenuEmailInput) {
    userMenuEmailInput.value = loggedIn ? user.email : "";
  }
  if (userMenuPhoneInput) {
    userMenuPhoneInput.value = "";
  }
  if (addressTitleInput) addressTitleInput.value = "";
  if (addressNameInput) addressNameInput.value = "";
  if (addressSurnameInput) addressSurnameInput.value = "";
  if (addressCityInput) addressCityInput.value = "";
  if (addressDistrictInput) addressDistrictInput.value = "";
  if (addressPhoneInput) addressPhoneInput.value = "";
  if (addressTextInput) addressTextInput.value = "";
  renderAddressList({});
  if (userMenuLoginBtn) {
    userMenuLoginBtn.style.display = loggedIn ? "none" : "inline-flex";
  }
  if (userMenuLogoutBtn) {
    userMenuLogoutBtn.style.display = loggedIn ? "inline-flex" : "none";
  }
  if (loggedIn && user?.uid && db) {
    startUserProfileListener(user);
  } else {
    stopUserProfileListener();
  }
}

function showStatus(message, isError = false) {
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", isError);
  }
  showToast(message, isError);
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function serviceMessage(items) {
  const hasVaccine = items.some((item) => item.id.startsWith("vac_"));
  if (hasVaccine) {
    return "Dostunuzun kimlik/asi bilgileri varsa hazir ediniz.";
  }
  return "Randevu saatinde dostunuz yaninizda olsun.";
}

function renderCatalog() {
  catalogEl.innerHTML = "";
  services.forEach((category) => {
    const wrapper = document.createElement("div");
    wrapper.className = "category";
    wrapper.dataset.category = category.slug;

    const title = document.createElement("h4");
    title.textContent = category.title;
    wrapper.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "service-grid";

    category.items.forEach((item) => {
      const title = (item.title || "").toLowerCase();
      let badgeLabel = "Evde";
      let badgeClass = "badge-home";
      if (title.includes("video")) {
        badgeLabel = "Video";
        badgeClass = "badge-video";
      } else if (category.slug === "vaccines") {
        badgeLabel = "Aşı";
        badgeClass = "badge-vaccine";
      }

      const card = document.createElement("div");
      card.className = "service-card";
      card.dataset.itemId = item.id;

      const badge = document.createElement("span");
      badge.className = `service-badge ${badgeClass}`;
      badge.textContent = badgeLabel;

      const name = document.createElement("h5");
      name.textContent = item.title;

      const price = document.createElement("span");
      price.className = "service-price";
      price.textContent = `${item.price} TL`;

      const button = document.createElement("button");
      button.textContent = selectedItems.has(item.id)
        ? "Sepetten Cikar"
        : "Sepete Ekle";
      if (selectedItems.has(item.id)) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => toggleItem(item));

      card.appendChild(badge);
      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(button);
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    catalogEl.appendChild(wrapper);
  });
}

function loadServiceItems() {
  const categories = new Map();
  if (serviceItemsUnsub) {
    serviceItemsUnsub();
  }

  const applySnapshot = (snapshot, metaSource = "snapshot") => {
    let newestUpdatedMs = 0;
    if (!snapshot || snapshot.empty) {
      services.splice(0, services.length, ...fallbackServices);
      renderCatalog();
      updateServiceLastUpdated(0);
      return;
    }

    categories.clear();
    snapshot.forEach((doc) => {
      const item = doc.data();
      newestUpdatedMs = Math.max(
        newestUpdatedMs,
        toMillisSafe(item.updatedAt),
        toMillisSafe(item.createdAt)
      );
      if (item.active === false) return;
      const slug = item.category || "procedures";
      if (!categories.has(slug)) {
        const title = slug === "vaccines" ? "Evde Kopek Asilari" : "Evde Islemler";
        categories.set(slug, { title, slug, items: [] });
      }
      categories.get(slug).items.push({
        id: doc.id,
        title: item.title,
        price: Number(item.price || 0),
      });
    });

    // If we already have a newer server version, avoid regressing UI with stale cache.
    const fromCache = Boolean(snapshot.metadata && snapshot.metadata.fromCache);
    const cachedMs = newestUpdatedMs || 0;
    const knownMs = Number(serviceVersion || "0") || 0;
    if (fromCache && knownMs && cachedMs && cachedMs < knownMs) {
      updateServiceLastUpdated(knownMs);
      return;
    }

    services.splice(0, services.length, ...Array.from(categories.values()));
    renderCatalog();
    updateServiceLastUpdated(newestUpdatedMs);
    const nextVersion = newestUpdatedMs ? String(newestUpdatedMs) : "";
    if (
      serviceSnapshotInitialized &&
      serviceVersion &&
      nextVersion &&
      serviceVersion !== nextVersion &&
      !fromCache
    ) {
      showToast("Hizmet fiyatlari guncellendi.");
      trackEvent("service_prices_updated", { source: metaSource });
    }
    serviceVersion = nextVersion || serviceVersion;
    if (serviceVersion) {
      localStorage.setItem("serviceItemsVersion", serviceVersion);
    }
    serviceSnapshotInitialized = true;
  };

  const fetchServerOnce = (retried = false) => {
    return db
      .collection("serviceItems")
      .orderBy("order")
      .get({ source: "server" })
      .then((snapshot) => {
        applySnapshot(snapshot, "server_get");
      })
      .catch((error) => {
        if (error?.code === "permission-denied" && !retried) {
          return ensureAnonymousAuth().then(() => fetchServerOnce(true));
        }
        // If server fetch fails, we still keep listener to recover later.
        console.warn("serviceItems server fetch failed", error);
      });
  };

  // Server-first: reduce browser-to-browser drift caused by stale cache/fallback.
  fetchServerOnce();

  serviceItemsUnsub = db
    .collection("serviceItems")
    .orderBy("order")
    .onSnapshot(
      (snapshot) => applySnapshot(snapshot, "snapshot"),
      (error) => {
        console.error("serviceItems snapshot error:", error);
        if (error?.code === "permission-denied") {
          ensureAnonymousAuth().then(() => {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
              loadServiceItems();
              return;
            }
            services.splice(0, services.length, ...fallbackServices);
            renderCatalog();
            updateServiceLastUpdated(0);
          });
          return;
        }
        services.splice(0, services.length, ...fallbackServices);
        renderCatalog();
        updateServiceLastUpdated(0);
      }
    );
}

function loadShopProducts() {
  if (!shopGrid) return;
  if (shopProductsUnsub) {
    shopProductsUnsub();
  }
  const applySnapshot = (snapshot) => {
    const items = [];
    if (!snapshot || snapshot.empty) {
      items.push(...fallbackProducts);
    } else {
      snapshot.forEach((doc) => {
        const item = doc.data();
        if (item.active === false) return;
        items.push({ id: doc.id, ...item });
      });
    }
    shopItemsCache = items;
    refreshShopView();
  };

  const fetchServerOnce = (retried = false) => {
    return db
      .collection("shopProducts")
      .where("active", "==", true)
      .orderBy("order")
      .get({ source: "server" })
      .then(applySnapshot)
      .catch((error) => {
        if (error?.code === "permission-denied" && !retried) {
          return ensureAnonymousAuth().then(() => fetchServerOnce(true));
        }
        console.warn("shopProducts server fetch failed", error);
      });
  };

  fetchServerOnce();

  shopProductsUnsub = db
    .collection("shopProducts")
    .where("active", "==", true)
    .orderBy("order")
    .onSnapshot(
      applySnapshot,
      (error) => {
        if (error?.code === "permission-denied") {
          ensureAnonymousAuth().then(() => {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
              loadShopProducts();
              return;
            }
            shopItemsCache = fallbackProducts;
            refreshShopView();
          });
          return;
        }
        shopItemsCache = fallbackProducts;
        refreshShopView();
      }
    );
}

function renderShopProducts(items) {
  shopGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const hasId = Boolean(item.id);
    const detailUrl = hasId
      ? `product.html?id=${encodeURIComponent(item.id)}`
      : `product.html?title=${encodeURIComponent(item.title || "")}`;
    const cartItem = mapShopItem(item);
    const isInCart = selectedItems.has(cartItem.id);
    card.dataset.cartId = cartItem.id;
    const tag = item.tag ? `<span class="tag">${item.tag}</span>` : "";
    let stockBadge = "";
    if (Number.isFinite(Number(item.stock))) {
      const stockValue = Number(item.stock);
      if (stockValue === 0) {
        stockBadge = `<span class="stock-badge out">⛔ Stokta yok</span>`;
      } else if (stockValue <= 5) {
        stockBadge = `<span class="stock-badge low">⚠️ Az kaldı</span>`;
      } else {
        stockBadge = `<span class="stock-badge ok">✓ Stokta</span>`;
      }
    }
    const media = item.imageUrl
      ? `<img class="product-image" src="${item.imageUrl}" alt="${item.title || "Urun"}" loading="lazy" decoding="async" width="240" height="180" />`
      : `<div class="product-placeholder">Gorsel yok</div>`;
    const description = item.description
      ? `<p class="product-desc">${item.description}</p>`
      : "";
    card.innerHTML = `
      <div class="product-media">
        ${tag}
        ${stockBadge}
        ${media}
      </div>
      <div class="product-content">
        <div class="product-chip-row">
          <span class="product-chip">VETKAPIMDA Shop</span>
        </div>
        <a class="product-title" href="${detailUrl}">${item.title}</a>
        <button type="button" class="product-toggle">Detayı Göster</button>
        ${description}
        <div class="product-actions">
          <div class="price-stack">
            <span>Fiyat</span>
            <strong>${item.price} TL</strong>
          </div>
          <button type="button" class="add-to-cart">
            ${isInCart ? "✓ Sepette" : "Sepete Ekle"}
          </button>
        </div>
        <a class="product-detail" href="${detailUrl}">Urun Detayi</a>
        <a class="quick-order" href="https://wa.me/905360340920">Hizli Siparis</a>
      </div>
    `;
    const addButton = card.querySelector(".add-to-cart");
    addButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleItem(cartItem);
      const nowInCart = selectedItems.has(cartItem.id);
      addButton.textContent = nowInCart ? "Sepetten Cikar" : "Sepete Ekle";
      addButton.classList.toggle("is-added", nowInCart);
    });
    shopGrid.appendChild(card);
  });
  ensureProductToggleControls();
}

function renderProductSlider(items) {
  const slider = document.getElementById("productSlider");
  const dots = document.getElementById("productDots");
  if (!slider || !dots) return;
  slider.innerHTML = "";
  dots.innerHTML = "";

  const list = items.slice(0, 10);
  const pages = [];
  for (let i = 0; i < list.length; i += 2) {
    pages.push(list.slice(i, i + 2));
  }

  const renderMini = (item) => {
    const tags = [];
    if (item.tag) tags.push(item.tag);
    tags.push("Hızlı Teslim");
    const description = item.description || "";
    return `
      <article class="product-mini">
        <div class="tag-stack">
          ${tags.map((t) => `<span class="tag-chip">${t}</span>`).join("")}
        </div>
        <button class="favorite-btn" type="button" aria-label="Favorilere ekle">♡</button>
        <div class="image-box">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.title}" loading="lazy" />`
              : `<div class="product-placeholder">Görsel yok</div>`
          }
        </div>
        <div class="slide-meta">
          <span class="brand">VETKAPIMDA Shop</span>
          <span class="rating">★★★★★ <em>8</em></span>
        </div>
        <h4>${item.title}</h4>
        <p class="slider-desc">${description}</p>
        <div class="price-row">
          <span class="price-new">${item.price} TL</span>
        </div>
        <a class="btn primary" href="#randevu">Sepete Ekle</a>
      </article>
    `;
  };

  pages.forEach((group, pageIndex) => {
    const page = document.createElement("div");
    page.className = "product-slide";
    page.dataset.index = pageIndex;
    page.innerHTML = group.map(renderMini).join("");
    slider.appendChild(page);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.dataset.index = pageIndex;
    dots.appendChild(dot);
  });

  const slides = Array.from(slider.children);
  const dotsArr = Array.from(dots.children);

  const activate = (idx) => {
    dotsArr.forEach((d, i) => d.classList.toggle("active", i === idx));
    const target = slides[idx];
    if (target) {
      slider.scrollTo({ left: target.offsetLeft - 12, behavior: "smooth" });
    }
  };

  dotsArr.forEach((dot) => {
    dot.addEventListener("click", () => activate(Number(dot.dataset.index)));
  });

  const updateActive = () => {
    const sliderRect = slider.getBoundingClientRect();
    let nearest = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const dist = Math.abs(rect.left - sliderRect.left);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    dotsArr.forEach((d, i) => d.classList.toggle("active", i === nearest));
  };

  slider.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateActive);
  });

  if (dotsArr[0]) dotsArr[0].classList.add("active");

  // auto-slide
  if (productSliderTimer) {
    clearInterval(productSliderTimer);
    productSliderTimer = null;
  }
  if (slides.length > 1) {
    let autoIndex = 0;
    productSliderTimer = setInterval(() => {
      autoIndex = (autoIndex + 1) % slides.length;
      activate(autoIndex);
    }, 1500);
  }
}

function normalizeShopText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesShopFilter(item, filter) {
  if (!filter || filter === "all") return true;
  const text = normalizeShopText(
    `${item.category || ""} ${item.tag || ""} ${item.title || ""}`
  );
  if (filter === "kedi") return text.includes("kedi") || text.includes("cat");
  if (filter === "kopek") return text.includes("kopek") || text.includes("dog");
  if (filter === "kus") return text.includes("kus") || text.includes("bird");
  if (filter === "cok-satanlar") {
    return (
      text.includes("cok satan") ||
      text.includes("bestseller") ||
      text.includes("populer") ||
      text.includes("popular") ||
      text.includes("best")
    );
  }
  if (filter === "firsatlar") {
    return (
      text.includes("firsat") ||
      text.includes("indirim") ||
      text.includes("kampanya") ||
      text.includes("deal")
    );
  }
  return text.includes(filter);
}

function refreshShopView() {
  if (!shopGrid) return;
  const filtered = applyShopFilter(shopItemsCache);
  if (!filtered.length && shopItemsCache.length && activeShopFilter !== "all") {
    const fallbackTab =
      Array.from(shopTabs).find((tab) => tab.dataset.filter === "kedi") ||
      shopTabs[0];
    if (fallbackTab && fallbackTab.dataset.filter !== activeShopFilter) {
      setActiveShopTab(fallbackTab);
      return;
    }
  }
  renderShopProducts(filtered);
  renderProductSlider(filtered);
}

function setActiveShopTab(tab, silent = false) {
  if (!tab) return;
  shopTabs.forEach((item) => item.classList.toggle("active", item === tab));
  activeShopFilter = tab.dataset.filter || normalizeShopText(tab.textContent);
  if (!silent) {
    refreshShopView();
  }
}

function bindShopTabs() {
  if (!shopTabs.length) return;
  const defaultTab =
    Array.from(shopTabs).find((tab) => tab.dataset.default === "true") ||
    shopTabs[0];
  setActiveShopTab(defaultTab, true);
  shopTabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveShopTab(tab));
  });
}

function bindShopSearch() {
  const shopSearch = document.querySelector(".shop-search input");
  if (!shopSearch) return;
  shopSearch.setAttribute("autocomplete", "off");
  if (shopSearch.value.includes("@")) {
    shopSearch.value = "";
  }
  shopSearch.addEventListener("focus", () => {
    if (!shopSearch.dataset.userModified && shopSearch.value.includes("@")) {
      shopSearch.value = "";
      refreshShopView();
    }
  });
  shopSearch.addEventListener("input", () => {
    shopSearch.dataset.userModified = "true";
    refreshShopView();
  });
}

function bindHeroSearch() {
  const heroSearch = document.querySelector(".hero-search input");
  if (!heroSearch) return;
  heroSearch.setAttribute("autocomplete", "off");
  const heroWrap = heroSearch.closest(".hero-search");
  const heroButton = heroWrap ? heroWrap.querySelector("button") : null;
  const resultsEl =
    document.getElementById("heroSearchResults") ||
    (heroWrap ? heroWrap.querySelector(".hero-search-results") : null);

  const normalizeTR = (value) => {
    return String(value || "")
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, " ")
      .trim();
  };

  const sectionResults = () => {
    return [
      { kind: "section", title: "Randevu Olustur", subtitle: "Hizmet secimi ve sepet", action: { type: "hash", value: "#randevu" }, pill: "Randevu", icon: "📅" },
      { kind: "section", title: "Hizmetler", subtitle: "Tum hizmetleri gor", action: { type: "hash", value: "#hizmetler" }, pill: "Sayfa", icon: "🩺" },
      { kind: "section", title: "Canli Video", subtitle: "Gorusme ile hizli yonlendirme", action: { type: "hash", value: "#canli-video" }, pill: "Sayfa", icon: "🎥" },
      { kind: "section", title: "Shop", subtitle: "Urunleri kesfet", action: { type: "hash", value: "#shop" }, pill: "Shop", icon: "🛍️" },
      { kind: "section", title: "Sepet", subtitle: "Secilen hizmetler", action: { type: "hash", value: "#randevu" }, pill: "Sepet", icon: "🛒" },
      { kind: "action", title: "Hesabim", subtitle: "Kullanici menusunu ac", action: { type: "userMenu" }, pill: "Hesap", icon: "👤" },
      { kind: "action", title: "Giris Yap", subtitle: "Hesabiniza girin", action: { type: "loginGate", value: "login" }, pill: "Hesap", icon: "🔐" },
      { kind: "action", title: "Uye Ol", subtitle: "Yeni hesap olusturun", action: { type: "loginGate", value: "signup" }, pill: "Hesap", icon: "✨" },
    ];
  };

  const collectServiceResults = () => {
    const flattened = [];
    services.forEach((category) => {
      (category.items || []).forEach((item) => {
        flattened.push({
          kind: "service",
          id: item.id,
          title: item.title || "",
          subtitle: `${category.title || "Hizmet"} • ${Number(item.price || 0)} TL`,
          pill: "Hizmet",
          icon: "🩺",
        });
      });
    });
    if (!flattened.length) {
      fallbackServices.forEach((category) => {
        (category.items || []).forEach((item) => {
          flattened.push({
            kind: "service",
            id: item.id,
            title: item.title || "",
            subtitle: `${category.title || "Hizmet"} • ${Number(item.price || 0)} TL`,
            pill: "Hizmet",
            icon: "🩺",
          });
        });
      });
    }
    return flattened;
  };

  const collectShopResults = () => {
    const source = shopItemsCache && shopItemsCache.length ? shopItemsCache : fallbackProducts;
    return (source || []).map((item) => {
      const title = item.title || "";
      return {
        kind: "product",
        id: item.id || title,
        title,
        subtitle: `${Number(item.price || 0)} TL`,
        pill: "Shop",
        icon: "🛍️",
      };
    });
  };

  const scoreMatch = (query, text) => {
    if (!query || !text) return 0;
    if (text.startsWith(query)) return 3;
    if (text.includes(query)) return 2;
    return 0;
  };

  const buildResults = (rawQuery) => {
    const query = normalizeTR(rawQuery);
    if (!query || query.length < 2) return [];

    const candidates = [
      ...sectionResults(),
      ...collectServiceResults(),
      ...collectShopResults(),
    ];

    const scored = candidates
      .map((item) => {
        const hay = normalizeTR(`${item.title} ${item.subtitle || ""}`);
        const score = scoreMatch(query, hay);
        return { item, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score);

    // Keep output small and useful.
    const out = [];
    const seen = new Set();
    scored.forEach((row) => {
      const key = `${row.item.kind}:${row.item.id || row.item.title}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(row.item);
    });
    return out.slice(0, 7);
  };

  const hideResults = () => {
    if (!resultsEl) return;
    resultsEl.classList.remove("show");
    resultsEl.setAttribute("aria-hidden", "true");
    resultsEl.innerHTML = "";
  };

  const renderResults = (items, query) => {
    if (!resultsEl) return;
    if (!items.length) {
      resultsEl.innerHTML = `
        <div class="result-head">
          <span class="result-title">Arama</span>
          <span class="result-hint">Enter: ilk sonuca git</span>
        </div>
        <div class="result-empty">Sonuc bulunamadi.</div>
      `;
      resultsEl.classList.add("show");
      resultsEl.setAttribute("aria-hidden", "false");
      return;
    }

    const list = items
      .map((item, idx) => {
        const safeTitle = escapeHtml(item.title);
        const safeSubtitle = escapeHtml(item.subtitle || "");
        const pill = escapeHtml(item.pill || "");
        const icon = escapeHtml(item.icon || "🔎");
        return `
          <button class="result-item" type="button" data-idx="${idx}">
            <span class="result-icon" aria-hidden="true">${icon}</span>
            <span class="result-main">
              <strong>${safeTitle}</strong>
              <span>${safeSubtitle}</span>
            </span>
            <span class="result-pill">${pill}</span>
          </button>
        `;
      })
      .join("");

    resultsEl.innerHTML = `
      <div class="result-head">
        <span class="result-title">Sonuclar</span>
        <span class="result-hint">${escapeHtml(query || "")}</span>
      </div>
      <div class="result-list" role="listbox">${list}</div>
    `;
    resultsEl.classList.add("show");
    resultsEl.setAttribute("aria-hidden", "false");
  };

  const scrollToServiceItem = (itemId) => {
    const bookingSection = document.getElementById("randevu");
    bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Wait for layout + possible async render.
    setTimeout(() => {
      const esc = window.CSS && typeof window.CSS.escape === "function"
        ? window.CSS.escape(itemId)
        : String(itemId).replace(/["\\]/g, "");
      const card = document.querySelector(`.service-card[data-item-id="${esc}"]`);
      if (!card) return;
      card.classList.add("is-highlight");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => card.classList.remove("is-highlight"), 1800);
    }, 220);
  };

  const openSearchResult = (item) => {
    if (!item) return;
    hideResults();
    stopHeroPlaceholder();
    trackEvent("hero_search_select", { kind: item.kind || "", title: item.title || "" });

    if (item.kind === "service") {
      scrollToServiceItem(item.id);
      return;
    }

    if (item.kind === "product") {
      const shopSection = document.getElementById("shop");
      shopSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Also apply query to shop search so user sees matching items.
      const shopSearch = document.querySelector(".shop-search input");
      if (shopSearch) {
        shopSearch.value = item.title || heroSearch.value || "";
        shopSearch.dataset.userModified = "true";
        refreshShopView();
      }
      return;
    }

    if (item.action?.type === "hash") {
      const target = document.querySelector(item.action.value);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.hash = item.action.value;
      }
      return;
    }

    if (item.action?.type === "userMenu") {
      userMenuTrigger?.click();
      return;
    }

    if (item.action?.type === "loginGate") {
      showLoginGate(item.action.value);
      return;
    }
  };

  const runSearch = () => {
    const query = heroSearch.value.trim();
    const items = buildResults(query);
    renderResults(items, query);
    if (!items.length) {
      showToast("Sonuc bulunamadi.", true);
      return;
    }
    openSearchResult(items[0]);
  };

  // Click outside should close result list.
  document.addEventListener("click", (evt) => {
    if (!resultsEl || !resultsEl.classList.contains("show")) return;
    const within = heroWrap && (heroWrap === evt.target || heroWrap.contains(evt.target));
    if (!within) hideResults();
  });

  resultsEl?.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".result-item");
    if (!btn) return;
    const idx = Number(btn.dataset.idx || "0");
    const query = heroSearch.value.trim();
    const items = buildResults(query);
    openSearchResult(items[idx]);
  });

  heroSearch.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      hideResults();
      return;
    }
    if (evt.key === "Enter") {
      evt.preventDefault();
      runSearch();
    }
  });

  heroButton?.addEventListener("click", () => runSearch());

  heroSearch.addEventListener("input", () => {
    heroSearch.dataset.userModified = "true";
    const query = heroSearch.value.trim();
    if (!query) {
      hideResults();
      return;
    }
    const items = buildResults(query);
    renderResults(items, query);
  });

  const clearEmail = () => {
    if (heroSearch.value.includes("@")) {
      heroSearch.value = "";
      delete heroSearch.dataset.userModified;
    }
  };
  clearEmail();
  setTimeout(clearEmail, 800);
  heroSearch.addEventListener("focus", () => {
    if (!heroSearch.dataset.userModified && heroSearch.value.includes("@")) {
      heroSearch.value = "";
    }
    stopHeroPlaceholder();
    heroSearch.dataset.userActive = "true";
  });
  heroSearch.addEventListener("blur", () => {
    heroSearch.dataset.userActive = "";
    if (!heroSearch.value.trim()) {
      startHeroPlaceholder(heroSearch);
    }
  });
  startHeroPlaceholder(heroSearch);
}

function applyShopFilter(items) {
  const shopSearch = document.querySelector(".shop-search input");
  const query = shopSearch ? shopSearch.value.trim().toLowerCase() : "";
  let filtered = items;
  if (activeShopFilter && activeShopFilter !== "all") {
    filtered = items.filter((item) => matchesShopFilter(item, activeShopFilter));
  }
  if (!query) return filtered;
  return filtered.filter((item) => {
    return (
      (item.title || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query)
    );
  });
}

function mapShopItem(item) {
  const id = item.id || item.title || String(Date.now());
  return {
    id: `shop_${id}`,
    title: item.title || "",
    price: Number(item.price || 0),
    type: "shop",
  };
}

function ensureProductToggleControls() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const toggle = card.querySelector(".product-toggle");
    if (!toggle) return;
    card.classList.add("collapsed");
    toggle.hidden = false;
    toggle.textContent = "Detayı Göster";
  });

  if (productToggleInit) return;

  document.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".product-toggle");
    if (!btn) return;
    const card = btn.closest(".product-card");
    const collapsed = card.classList.toggle("collapsed");
    btn.textContent = collapsed ? "Detayı Göster" : "Detayı Gizle";
  });

  productToggleInit = true;
}

function compactBookingForm() {
  const mql = window.matchMedia("(max-width: 720px)");
  const formEl = document.getElementById("bookingForm");
  if (!formEl) return;
  const apply = () => {
    if (mql.matches) {
      formEl.classList.add("mobile-compact");
      formEl.querySelectorAll(".field").forEach((field) => {
        const label = field.querySelector("label");
        const input = field.querySelector("input, textarea");
        if (label && input && !input.placeholder) {
          input.placeholder = label.textContent.trim();
        }
      });
    } else {
      formEl.classList.remove("mobile-compact");
    }
  };
  apply();
  mql.addEventListener("change", apply);
}

function compactBookingForm() {
  const mql = window.matchMedia("(max-width: 720px)");
  const formEl = document.getElementById("bookingForm");
  if (!formEl) return;
  const apply = () => {
    if (mql.matches) {
      formEl.classList.add("mobile-compact");
      formEl.querySelectorAll(".field").forEach((field) => {
        const label = field.querySelector("label");
        const input = field.querySelector("input, textarea");
        if (label && input && !input.placeholder) {
          input.placeholder = label.textContent.trim();
        }
      });
    } else {
      formEl.classList.remove("mobile-compact");
    }
  };
  apply();
  mql.addEventListener("change", apply);
}


function ensureUserProfile(user) {
  const docRef = db.collection("users").doc(user.uid);
  setProfileCache(user.uid, { email: user.email || "" });
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        return docRef.set(
          {
            email: user.email || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      return docRef.set({
        email: user.email || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    })
    .catch(() => {
      // If reads are not allowed by rules, still try a merge write so admin can see the user later.
      docRef
        .set(
          {
            email: user.email || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
        .catch(() => {});
    });
}

function upsertUserProfile({ uid, email, name, surname, phone, address, gender, birthdate }) {
  if (!uid) return;
  setProfileCache(uid, {
    email: email || "",
    name: name || "",
    surname: surname || "",
    phone: phone || "",
    address: address || "",
  });
  db.collection("users")
    .doc(uid)
    .set(
      {
        email: email || "",
        name: name || "",
        surname: surname || "",
        phone: phone || "",
        address: address || "",
        gender: gender || "",
        birthdate: birthdate || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .catch(() => {});
}
function renderCart() {
  cartEl.innerHTML = "";
  if (selectedItems.size === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.textContent = "Sepetiniz bos.";
    cartEl.appendChild(empty);
    updateBookingSummary(0, 0);
    cartTotalEl.textContent = "0 TL";
    if (cartTotalStickyEl) {
      cartTotalStickyEl.textContent = "0 TL";
    }
    if (navCartCount) {
      navCartCount.textContent = "0";
    }
    if (navCartCountIcon) {
      navCartCountIcon.textContent = "0";
    }
    updateShopButtons();
    updateBookingReview(0);
    return;
  }

  let total = 0;
  selectedItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const label = document.createElement("span");
    label.textContent = item.title;

    const price = document.createElement("strong");
    price.textContent = `${item.price} TL`;

    const remove = document.createElement("button");
    remove.textContent = "Kaldir";
    remove.addEventListener("click", () => toggleItem(item));

    row.appendChild(label);
    row.appendChild(price);
    row.appendChild(remove);
    cartEl.appendChild(row);
    total += item.price;
  });
  updateBookingSummary(total, selectedItems.size);
  updateBookingReview(total);
  cartTotalEl.textContent = `${total} TL`;
  if (cartTotalStickyEl) {
    cartTotalStickyEl.textContent = `${total} TL`;
  }
  if (navCartCount) {
    navCartCount.textContent = String(selectedItems.size);
  }
  if (navCartCountIcon) {
    navCartCountIcon.textContent = String(selectedItems.size);
  }
  updateShopButtons();
}

function toggleItem(item) {
  if (!isLoggedIn || !isVerified) {
    showLoginGate();
    trackEvent("booking_requires_login");
    return;
  }
  if (selectedItems.has(item.id)) {
    selectedItems.delete(item.id);
    trackEvent("booking_service_removed", { service_id: item.id, price: item.price });
  } else {
    selectedItems.set(item.id, item);
    trackEvent("booking_service_added", { service_id: item.id, price: item.price });
  }
  renderCatalog();
  renderCart();
}

function updateShopButtons() {
  if (!shopGrid) return;
  shopGrid.querySelectorAll(".product-card").forEach((card) => {
    const cartId = card.dataset.cartId;
    if (!cartId) return;
    const inCart = selectedItems.has(cartId);
    const button = card.querySelector(".add-to-cart");
    if (!button) return;
    button.textContent = inCart ? "✓ Sepette" : "Sepete Ekle";
    button.classList.toggle("is-added", inCart);
  });
}

function bindTestimonialsToggle() {
  const grid = document.getElementById("testimonialGrid");
  const toggle = document.getElementById("testimonialToggle");
  if (!grid || !toggle) return;
  const apply = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    grid.classList.toggle("compact", isMobile && !toggle.dataset.expanded);
    toggle.textContent = toggle.dataset.expanded ? "Daha az yorum" : "Daha fazla yorum";
  };
  toggle.addEventListener("click", () => {
    toggle.dataset.expanded = toggle.dataset.expanded ? "" : "true";
    apply();
  });
  apply();
  window.addEventListener("resize", apply);
}

function updateBookingSummary(total, count) {
  const el = document.getElementById("bookingSummary");
  if (!el) return;
  if (!count) {
    el.classList.add("is-empty");
    el.innerHTML = `
      <span class="summary-text">Sepetiniz boş.</span>
      <a class="btn ghost summary-action" href="#serviceCatalog">Hizmet Seç</a>
    `;
    return;
  }
  el.classList.remove("is-empty");
  el.innerHTML = `
    <span class="summary-text">${count} kalem</span>
    <span class="summary-pill">${total} TL</span>
    <a class="btn ghost summary-action" href="#serviceCatalog">Hizmet Ekle</a>
  `;
}

function bindServiceCards() {
  const cards = document.querySelectorAll(".card-link");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      if (category === "evde") {
        highlightCategories(["procedures", "vaccines"]);
      } else {
        highlightCategories([]);
      }
    });
  });
}

function highlightCategories(slugs) {
  const categories = document.querySelectorAll(".category");
  categories.forEach((category) => {
    if (slugs.includes(category.dataset.category)) {
      category.classList.add("highlight");
    } else {
      category.classList.remove("highlight");
    }
  });
  if (slugs.length === 0) return;
  setTimeout(() => {
    categories.forEach((category) => category.classList.remove("highlight"));
  }, 1600);
}

function initSlider() {
  if (!slides.length) return;
  let index = 0;

  const setActive = (nextIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === nextIndex);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === nextIndex);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      index = Number(dot.dataset.index || 0);
      setActive(index);
    });
  });

  setInterval(() => {
    index = (index + 1) % slides.length;
    setActive(index);
  }, 4500);
}

