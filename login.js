document.querySelector(".login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = userId.value.trim();
  const pw = userPw.value.trim();
  const error = document.querySelector(".error-msg");

  if (!id && !pw) {
    error.textContent = "아이디와 비밀번호를 입력해주세요.";
    return;
  }

  if (!id) {
    error.textContent = "아이디를 입력해주세요.";
    return;
  }

  if (!pw) {
    error.textContent = "비밀번호를 입력해주세요.";
    return;
  }

  if (id === "admin" && pw === "1234") {
    location.href = "dashboard.html";
  } else {
    error.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
  }
});

const pwInput = document.querySelector("#userPw");
const eyeBtn = document.querySelector(".btn-eye");

eyeBtn.addEventListener("click", () => {
  const isHidden = pwInput.type === "password";

  pwInput.type = isHidden ? "text" : "password";
  eyeBtn.classList.toggle("is-active", isHidden);
});
