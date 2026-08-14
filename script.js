const DISCOVERY_CONFIG = {
  leadEndpoint: "https://josse35.app.n8n.cloud/webhook/frenchwithjo-lead",
  paymentUrl: "", // Add your Stripe Payment Link before launch.
  bookingUrl: ""  // Add your Calendly Discovery URL before launch.
};

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll(".q").forEach((q) => {
  q.addEventListener("click", () => {
    const a = q.nextElementSibling;
    const open = a.classList.contains("open");

    document.querySelectorAll(".a").forEach((x) => x.classList.remove("open"));
    document.querySelectorAll(".q b").forEach((x) => (x.textContent = "+"));

    if (!open) {
      a.classList.add("open");
      q.querySelector("b").textContent = "−";
    }
  });
});

const form = document.getElementById("discoveryForm");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const button = form.querySelector('button[type="submit"]');
  const originalButtonText = button.textContent;
  const data = Object.fromEntries(new FormData(form).entries());

  if (data.website) return;
  delete data.website;

  data.submitted_at = new Date().toISOString();
  data.status = "New";

  button.disabled = true;
  button.textContent = "Saving your details...";
  statusEl.textContent = "";

  try {
    const response = await fetch(DISCOVERY_CONFIG.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Lead capture failed");

    const params = new URLSearchParams({
      name: data.first_name,
      email: data.email
    });

    if (DISCOVERY_CONFIG.paymentUrl) {
      statusEl.textContent = "Thank you! Opening the secure payment page...";
      const separator = DISCOVERY_CONFIG.paymentUrl.includes("?") ? "&" : "?";
      window.location.href = DISCOVERY_CONFIG.paymentUrl + separator + params.toString();
      return;
    }

    if (DISCOVERY_CONFIG.bookingUrl) {
      statusEl.textContent = "Thank you! Opening the booking page...";
      const separator = DISCOVERY_CONFIG.bookingUrl.includes("?") ? "&" : "?";
      window.location.href = DISCOVERY_CONFIG.bookingUrl + separator + params.toString();
      return;
    }

    statusEl.textContent = "Your details were saved. Booking will open once payment is configured.";
    button.disabled = false;
    button.textContent = originalButtonText;
  } catch (error) {
    console.error(error);
    statusEl.textContent = "I couldn't save your request. Please try again in a moment.";
    button.disabled = false;
    button.textContent = originalButtonText;
  }
});
