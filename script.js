
 // Learn French with Jo — Main JavaScript

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
