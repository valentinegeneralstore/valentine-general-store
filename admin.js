const SUPABASE_URL = "https://iweolsqpwyjwktihxeoo.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8N3-A4TBEhI5cLyyG27YA_kkR5Vb7Z";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const ordersContainer = document.getElementById("ordersContainer");
const refreshOrders = document.getElementById("refreshOrders");
const logout = document.getElementById("logout");

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    loginSection.hidden = true;
    dashboard.hidden = false;
    loadOrders();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginError.textContent =
      "Email ou mot de passe incorrect.";
    return;
  }

  loginSection.hidden = true;
  dashboard.hidden = false;

  loadOrders();
});

async function loadOrders() {
  ordersContainer.innerHTML =
    "<p>Chargement des commandes...</p>";

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    ordersContainer.innerHTML =
      "<p>Impossible de charger les commandes.</p>";

    return;
  }

  if (!data || data.length === 0) {
    ordersContainer.innerHTML =
      "<p>Aucune commande pour le moment.</p>";

    return;
  }

  ordersContainer.innerHTML = "";

  data.forEach((order) => {
    const card = document.createElement("div");

    card.className = "product-card";

    card.innerHTML = `
      <div class="product-info">

        <div class="product-category">
          ${new Date(order.created_at).toLocaleString("fr-FR")}
        </div>

        <h3 class="product-name">
          ${escapeHtml(order.product_name)}
        </h3>

        <p>
          <strong>Client:</strong>
          ${escapeHtml(order.customer_name)}
        </p>

        <p>
          <strong>Téléphone:</strong>
          ${escapeHtml(order.phone)}
        </p>

        <p>
          <strong>Ville:</strong>
          ${escapeHtml(order.city)}
        </p>

        <p>
          <strong>Adresse:</strong>
          ${escapeHtml(order.address)}
        </p>

        <p>
          <strong>Taille:</strong>
          ${escapeHtml(order.size || "-")}
        </p>

        <p>
          <strong>Quantité:</strong>
          ${order.quantity}
        </p>

        <p>
          <strong>Total:</strong>
          ${Number(order.total).toFixed(2)} DH
        </p>

        <label>
          Statut

          <select class="status-select" data-id="${order.id}">
            <option value="new" ${order.status === "new" ? "selected" : ""}>
              Nouvelle
            </option>

            <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>
              Confirmée
            </option>

            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>
              Expédiée
            </option>

            <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>
              Livrée
            </option>

            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>
              Annulée
            </option>
          </select>
        </label>

      </div>
    `;

    ordersContainer.appendChild(card);
  });

  document
    .querySelectorAll(".status-select")
    .forEach((select) => {
      select.addEventListener("change", updateStatus);
    });
}

async function updateStatus(event) {
  const orderId = event.target.dataset.id;
  const newStatus = event.target.value;

  const { error } = await supabaseClient
    .from("orders")
    .update({
      status: newStatus
    })
    .eq("id", orderId);

  if (error) {
    console.error(error);

    alert("Erreur lors de la mise à jour.");

    return;
  }

  alert("Statut mis à jour.");
}

refreshOrders.addEventListener("click", loadOrders);

logout.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();

  dashboard.hidden = true;
  loginSection.hidden = false;
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

checkSession();
