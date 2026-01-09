// darkmode
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const lightImg = document.querySelector(".lightmode-img");
  const darkImg = document.querySelector(".darkmode-img");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (lightImg) lightImg.style.display = "none";
    if (darkImg) darkImg.style.display = "block";
  }
});
document.getElementById("darkmode").addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");

  const lightImg = document.querySelector(".lightmode-img");
  const darkImg = document.querySelector(".darkmode-img");

  if (isDark) {
    lightImg.style.display = "none";
    darkImg.style.display = "block";
    localStorage.setItem("theme", "dark");
  } else {
    lightImg.style.display = "block";
    darkImg.style.display = "none";
    localStorage.setItem("theme", "light");
  }
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
    resetViewMode(target);
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

document.querySelectorAll(".card .progress-bar").forEach((bar) => {
  const value = bar.dataset.value;
  if (bar) {
    bar.style.width = "0%";
    setTimeout(() => {
      bar.style.width = value + "%";
    }, 200);
  }
});

const currentUser = {
  id: localStorage.getItem("savedId") || "admin",
  pw: localStorage.getItem("savedPw") || "1234",
};
let currentEditTarget = "";

function openAccountModal(target) {
  currentEditTarget = target;
  const modal = document.getElementById("accountModal");
  if (!modal) return;

  resetAccountModal();

  document.getElementById("modalTitleText").innerText =
    target === "id" ? "아이디 변경" : "비밀번호 변경";
  document.getElementById("currentValTitle").innerText =
    target === "id" ? "현재 아이디" : "현재 비밀번호";
  document.getElementById("newValTitle").innerText =
    target === "id" ? "변경하실 아이디" : "변경하실 비밀번호";
  document.getElementById("forgetText").innerText =
    target === "id" ? "아이디" : "비밀번호";

  const currentInput = document.getElementById("currentValInput");
  const newInput = document.getElementById("newValInput");
  currentInput.type = target === "pw" ? "password" : "text";
  newInput.type = target === "pw" ? "password" : "text";

  modal.classList.remove("is-hidden");
}

function closeAccountModal() {
  const modal = document.getElementById("accountModal");
  if (modal) modal.classList.add("is-hidden");
}

function resetAccountModal() {
  document.getElementById("currentValInput").value = "";
  document.getElementById("currentValInput").disabled = false;
  document.getElementById("newValInput").value = "";
  document.getElementById("newValInput").disabled = true;
  document.getElementById("currentErrorMsg").innerHTML = "";
  document.getElementById("btnSaveChange").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnVerify = document.getElementById("btnVerify");
  if (btnVerify) {
    btnVerify.onclick = function () {
      const inputVal = document.getElementById("currentValInput").value.trim();
      const errorMsg = document.getElementById("currentErrorMsg");

      const isCorrect =
        currentEditTarget === "id"
          ? inputVal.toLowerCase() === currentUser.id.toLowerCase()
          : inputVal === currentUser.pw;

      if (isCorrect) {
        errorMsg.className = "modal-error-msg success";
        errorMsg.innerHTML = `<img src="images/check.svg"> 인증되었습니다.`;

        document.getElementById("currentValInput").disabled = true;
        document.getElementById("newValInput").disabled = false;
        document.getElementById("newValInput").focus();
        document.getElementById("btnSaveChange").disabled = false;
      } else {
        errorMsg.className = "modal-error-msg danger";
        errorMsg.innerHTML = `<img src="images/error.svg"> 일치하지 않습니다.`;
      }
    };
  }

  const btnSaveChange = document.getElementById("btnSaveChange");
  if (btnSaveChange) {
    btnSaveChange.onclick = function () {
      const newVal = document.getElementById("newValInput").value.trim();
      if (!newVal) return;

      if (currentEditTarget === "id") {
        currentUser.id = newVal;
        localStorage.setItem("savedId", newVal);
        document.getElementById("displayId").innerText = newVal;
      } else {
        currentUser.pw = newVal;
        localStorage.setItem("savedPw", newVal);
      }
      alert("성공적으로 변경되었습니다.");
      closeAccountModal();
    };
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.onclick = () => {
      if (confirm("로그아웃 하시겠습니까?")) location.href = "index.html";
    };
  }
});
