const SUPABASE_URL = "https://iweolsqpwyjwktihxeoo.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8N3-A4TBEhI5cLyyG27YA_kkR5Vb7Z";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const products = [
  {
    name: "Maillot Football",
    category: "football",
    price: 199,
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Western Shirt",
    category: "clothing",
    price: 249,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Vintage Watch",
    category: "watches",
    price: 299,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Classic Glasses",
    category: "accessories",
    price: 149,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
  }
];

const productsContainer = document.getElementById("products");
const modal = document.getElementById("orderModal");
const closeModal = document.getElementById("closeModal");
const orderForm = document.getElementById("orderForm");
const selectedProduct = document.getElementById("selectedProduct");
const success = document.getElementById("success");

let currentProduct = null;

function renderProducts(category = "all") {
  productsContainer.innerHTML = "";

  const filteredProducts =
    category === "all"
      ? products
      : products.filter(product => product.category === category);

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img
        class="product-image"
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
      >

      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">${product.price} DH</div>

        <button class="order-button">
          COMMANDER
        </button>
      </div>
    `;

    card
      .querySelector(".order-button")
      .addEventListener("click", () => openOrder(product));

    productsContainer.appendChild(card);
  });
}

function openOrder(product) {
  currentProduct = product;

  selectedProduct.textContent =
    `${product.name} — ${product.price} DH`;

  orderForm.hidden = false;
  success.hidden = true;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeOrder() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeOrder);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeOrder();
  }
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    renderProducts(button.dataset.category);
  });
});

orderForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentProduct) return;

  const formData = new FormData(orderForm);

  const name = formData.get("name").trim();
  const phone = formData.get("phone").trim();
  const city = formData.get("city").trim();
  const address = formData.get("address").trim();
  const size = formData.get("size");
  const quantity = Number(formData.get("quantity"));

  if (!name || !phone || !city || !address) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const total = currentProduct.price * quantity;

  const { error } = await supabaseClient
    .from("orders")
    .insert({
      customer_name: name,
      phone: phone,
      city: city,
      address: address,
      size: size,
      quantity: quantity,
      product_name: currentProduct.name,
      product_price: currentProduct.price,
      total: total,
      status: "new"
    });

  if (error) {
    console.error(error);
    alert(
      "Une erreur est survenue. Veuillez réessayer."
    );
    return;
  }

  orderForm.hidden = true;
  success.hidden = false;
});

renderProducts();
