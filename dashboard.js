// darkmode 토글
document.getElementById("darkmode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
// section 이동
const menuBtn = document.querySelector(".menu");
const aside = document.querySelector(".aside");
const wrap = document.querySelector(".wrap");

menuBtn.addEventListener("click", () => {
  aside.classList.toggle("open");
  wrap.classList.toggle("menu-open");
});

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.target;

    aside.classList.remove("open");
    wrap.classList.remove("menu-open");

    navItems.forEach((i) => i.classList.remove("is-active"));
    item.classList.add("is-active");

    sections.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.page === target);
    });
  });
});

const cards = document.querySelectorAll(".card[data-target]");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const target = card.dataset.target;

    sections.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.page === target);
    });

    navItems.forEach((nav) => {
      nav.classList.toggle("is-active", nav.dataset.target === target);
    });
  });
});

document.querySelectorAll(".progress-bar").forEach((bar) => {
  const value = bar.dataset.value;
  requestAnimationFrame(() => {
    bar.style.width = value + "%";
  });
});

