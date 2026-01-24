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
const db = firebase.firestore();

const productImage = document.getElementById("productImage");
const productThumbs = document.getElementById("productThumbs");
const productTitle = document.getElementById("productTitle");
const breadcrumbTitle = document.getElementById("breadcrumbTitle");
const productSummary = document.getElementById("productSummary");
const productPrice = document.getElementById("productPrice");
const productTag = document.getElementById("productTag");
const productStock = document.getElementById("productStock");
const productStockText = document.getElementById("productStockText");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productIngredients = document.getElementById("productIngredients");
const productAnalysis = document.getElementById("productAnalysis");
const productAdditives = document.getElementById("productAdditives");
const productWhatsapp = document.getElementById("productWhatsapp");
const productTabs = document.getElementById("productTabs");
const similarProducts = document.getElementById("similarProducts");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const productTitleParam = params.get("title");

loadProduct();
loadSimilarProducts();

function loadProduct() {
  if (productId) {
    db.collection("shopProducts")
      .doc(productId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          renderNotFound();
          return;
        }
        renderProduct({ id: doc.id, ...doc.data() });
      })
      .catch(renderNotFound);
    return;
  }
  if (productTitleParam) {
    db.collection("shopProducts")
      .where("title", "==", productTitleParam)
      .limit(1)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          renderNotFound();
          return;
        }
        const doc = snapshot.docs[0];
        renderProduct({ id: doc.id, ...doc.data() });
      })
      .catch(renderNotFound);
    return;
  }
  renderNotFound();
}

function renderProduct(item) {
  const title = item.title || "Urun";
  const description = item.description || "";
  const price = Number(item.price || 0);
  const tag = item.tag || "";
  const stockValue = Number(item.stock);
  const category = item.category || "Shop";
  const imageUrl = item.imageUrl || "";
  const images = Array.isArray(item.images) && item.images.length
    ? item.images
    : imageUrl
    ? [imageUrl]
    : [];

  productTitle.textContent = title;
  breadcrumbTitle.textContent = title;
  productSummary.textContent = description.slice(0, 160);
  productPrice.textContent = price ? `${price} TL` : "-";
  productCategory.textContent = category;

  if (tag) {
    productTag.textContent = tag;
    productTag.setAttribute("aria-hidden", "false");
  } else {
    productTag.setAttribute("aria-hidden", "true");
  }

  if (Number.isFinite(stockValue)) {
    const stockLabel =
      stockValue === 0 ? "Stokta yok" : stockValue <= 5 ? "Az kaldi" : "Stokta";
    productStock.textContent = stockLabel;
    productStock.className = `stock-badge ${
      stockValue === 0 ? "out" : stockValue <= 5 ? "low" : "ok"
    }`;
    productStock.setAttribute("aria-hidden", "false");
    productStockText.textContent = `${stockValue} adet`;
  } else {
    productStock.setAttribute("aria-hidden", "true");
    productStockText.textContent = "-";
  }

  productDescription.textContent = description || "Bu urun icin aciklama eklenmemis.";
  productIngredients.textContent = item.ingredients || "";
  productAnalysis.textContent = item.analysis || "";
  productAdditives.textContent = item.additives || "";

  updateTabsVisibility();
  renderGallery(images);
  updateWhatsappLink(title);
}

function renderGallery(images) {
  const mainImageWrap = productImage?.closest(".product-main-image");
  if (!images.length) {
    if (mainImageWrap) {
      mainImageWrap.classList.add("is-placeholder");
    }
    productImage.src = "";
    productImage.alt = "Gorsel yok";
    productImage.classList.add("is-hidden");
    productThumbs.innerHTML = "";
    return;
  }
  if (mainImageWrap) {
    mainImageWrap.classList.remove("is-placeholder");
  }
  productImage.classList.remove("is-hidden");
  productImage.src = images[0];
  productImage.alt = "Urun gorseli";
  productThumbs.innerHTML = "";
  images.forEach((url, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `thumb ${index === 0 ? "active" : ""}`;
    button.innerHTML = `<img src="${url}" alt="Urun gorseli ${index + 1}" />`;
    button.addEventListener("click", () => {
      productImage.src = url;
      productThumbs.querySelectorAll(".thumb").forEach((thumb) => {
        thumb.classList.remove("active");
      });
      button.classList.add("active");
    });
    productThumbs.appendChild(button);
  });
}

function updateTabsVisibility() {
  const sections = [
    { key: "description", el: productDescription },
    { key: "ingredients", el: productIngredients },
    { key: "analysis", el: productAnalysis },
    { key: "additives", el: productAdditives },
  ];
  sections.forEach((section) => {
    const content = (section.el.textContent || "").trim();
    const sectionEl = document.querySelector(
      `.product-section[data-section="${section.key}"]`
    );
    const tabEl = productTabs.querySelector(
      `.tab-link[data-tab="${section.key}"]`
    );
    if (!content) {
      sectionEl?.classList.add("is-hidden");
      tabEl?.classList.add("is-hidden");
    }
  });
}

function loadSimilarProducts() {
  if (!similarProducts) return;
  db.collection("shopProducts")
    .where("active", "==", true)
    .orderBy("order")
    .limit(6)
    .get()
    .then((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        if (doc.id === productId) return;
        if (productTitleParam && doc.data().title === productTitleParam) return;
        items.push({ id: doc.id, ...doc.data() });
      });
      renderSimilar(items);
    })
    .catch(() => {
      similarProducts.innerHTML = "";
    });
}

function renderSimilar(items) {
  similarProducts.innerHTML = "";
  if (!items.length) {
    similarProducts.innerHTML =
      "<p class='fineprint'>Su an benzer urun bulunamadi.</p>";
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const tag = item.tag ? `<span class="tag">${item.tag}</span>` : "";
    const image = item.imageUrl
      ? `<img class="product-image" src="${item.imageUrl}" alt="${item.title || "Urun"}" loading="lazy" decoding="async" />`
      : `<div class="product-placeholder">Gorsel yok</div>`;
    const detailUrl = `product.html?id=${encodeURIComponent(item.id)}`;
    card.innerHTML = `
      <div class="product-media">
        ${tag}
        ${image}
      </div>
      <div class="product-content">
        <a class="product-title" href="${detailUrl}">${item.title || "Urun"}</a>
        <div class="product-actions">
          <div class="price-stack">
            <span>Fiyat</span>
            <strong>${Number(item.price || 0)} TL</strong>
          </div>
          <a class="btn ghost" href="${detailUrl}">Detay</a>
        </div>
      </div>
    `;
    similarProducts.appendChild(card);
  });
}

function updateWhatsappLink(title) {
  if (!productWhatsapp) return;
  const message = `Merhaba, ${title} urununu siparis etmek istiyorum.`;
  productWhatsapp.href = `https://wa.me/905360340920?text=${encodeURIComponent(message)}`;
}

function renderNotFound() {
  productTitle.textContent = "Urun bulunamadi";
  productSummary.textContent =
    "Bu urun yayindan kaldirilmis olabilir. Shop sayfasindan baska urunlere goz atabilirsiniz.";
  productPrice.textContent = "-";
  productDescription.textContent =
    "Urun bilgisi bulunamadi. Lutfen daha sonra tekrar deneyin.";
  productTabs?.classList.add("is-hidden");
}
