const DISCOVERY_CONFIG = {
  leadEndpoint: "https://josse35.app.n8n.cloud/webhook/frenchwithjo-lead",
  bookingUrl: "https://calendly.com/contact-frenchwithjo/30min"
};


// Current year in footer
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// FAQ accordion
document.querySelectorAll(".q").forEach((q) => {
  q.addEventListener("click", () => {
    const answer = q.nextElementSibling;
    const isOpen = answer.classList.contains("open");

    document.querySelectorAll(".a").forEach((item) => {
      item.classList.remove("open");
    });

    document.querySelectorAll(".q b").forEach((icon) => {
      icon.textContent = "+";
    });

    if (!isOpen) {
      answer.classList.add("open");

      const icon = q.querySelector("b");

      if (icon) {
        icon.textContent = "−";
      }
    }
  });
});


// Discovery form → n8n → Calendly
const form = document.getElementById("discoveryForm");
const statusEl = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalButtonText = button ? button.textContent : "";

    const data = Object.fromEntries(
      new FormData(form).entries()
    );


    // Honeypot anti-spam
    if (data.website) {
      return;
    }

    delete data.website;


    // Extra information sent to n8n
    data.submitted_at = new Date().toISOString();
    data.status = "New";


    if (button) {
      button.disabled = true;
      button.textContent = "Saving your details...";
    }

    if (statusEl) {
      statusEl.textContent = "";
    }


    try {

      // Send lead to n8n
      const response = await fetch(
        DISCOVERY_CONFIG.leadEndpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(data)
        }
      );


      if (!response.ok) {
        throw new Error(
          `Lead capture failed with status ${response.status}`
        );
      }


      // Build Calendly URL
      const calendlyUrl = new URL(
        DISCOVERY_CONFIG.bookingUrl
      );


      // Prefill Calendly
      calendlyUrl.searchParams.set(
        "name",
        data.first_name || ""
      );

      calendlyUrl.searchParams.set(
        "email",
        data.email || ""
      );


      // Tracking
      calendlyUrl.searchParams.set(
        "utm_source",
        "frenchwithjo"
      );

      calendlyUrl.searchParams.set(
        "utm_medium",
        "website"
      );

      calendlyUrl.searchParams.set(
        "utm_campaign",
        "discovery_call"
      );


      if (statusEl) {
        statusEl.textContent =
          "Thank you! Opening the booking page...";
      }


      // Redirect to Calendly
      window.location.href =
        calendlyUrl.toString();


    } catch (error) {

      console.error(error);

      if (statusEl) {
        statusEl.textContent =
          "I couldn't save your request. Please try again in a moment.";
      }

      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
    }
  });
}