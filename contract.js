/* === contract.js 최종 통합본 === */

// [데이터] 랜덤 생성용 초기 데이터
const contractTemplates = [
  "근로계약서",
  "정보보호 서약서",
  "연차휴가 사용 촉진서",
  "연차 휴가 사용 계획서",
  "연봉계약서",
  "사내 업무 협조 요청서",
];
const contractStatuses = ["진행", "완료", "반려"];
let contractData = [];

// [유틸] 1년 뒤 하루 전날 계산 (2026.01.01 -> 2026.12.31)
function getOneYearMinusOneDay(dateStr) {
  const start = new Date(dateStr);
  if (isNaN(start)) return "";
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return end.toISOString().split("T")[0];
}

// [유틸] 모달 초기화
function resetContractModal() {
  const tSelect = document.getElementById("contract-template-select");
  const targetSelect = document.getElementById("contract-target-select");
  const msgInput = document.getElementById("contract-request-message");
  const formContainer = document.getElementById("dynamic-form-fields");
  const chk1 = document.querySelector(".order-chk-1");
  const chk2 = document.querySelector(".order-chk-2");

  if (tSelect) tSelect.value = "";
  if (targetSelect) targetSelect.value = "";
  if (msgInput) msgInput.value = "";
  if (formContainer) formContainer.innerHTML = "";
  if (chk1) chk1.checked = false;
  if (chk2) chk2.checked = false;
}

// [기능] 게시판 데이터 랜덤 생성 (팀장 매칭 & 차수 계산 포함)
function generateRandomContracts() {
  const data = [];
  const depts = Object.keys(employeesData || {});
  if (depts.length === 0) return [];

  for (let i = 0; i < 10; i++) {
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const empList = employeesData[dept];
    const empName = empList[Math.floor(Math.random() * empList.length)];
    const leaderName = empList[0]; // 각 부서 첫 번째 사람을 팀장으로 간주

    // 서명 차수 로직: 체크박스 1개(2회차), 2개(3회차)
    const isBothChecked = Math.random() > 0.5;
    const turnCount = isBothChecked ? 3 : 2;

    data.push({
      id: Date.now() + i,
      title:
        contractTemplates[Math.floor(Math.random() * contractTemplates.length)],
      status:
        contractStatuses[Math.floor(Math.random() * contractStatuses.length)],
      turn: turnCount,
      requester: `${empName}(${dept})`,
      participants: isBothChecked
        ? `1차: ${empName}, 2차: ${leaderName}`
        : `1차: ${empName}`,
      dept: dept,
    });
  }
  return data;
}

// [기능] 게시판 렌더링
function renderContractBoard(filterStatus = "all") {
  const boardBody = document.querySelector(".contract-board-body");
  if (!boardBody) return;

  boardBody.innerHTML = "";
  const statusMap = { pending: "진행", approved: "완료", rejected: "반려" };

  const filtered = contractData.filter((item) => {
    return filterStatus === "all" || item.status === statusMap[filterStatus];
  });

  filtered.forEach((item) => {
    const statusClass =
      item.status === "진행"
        ? "status-ing"
        : item.status === "완료"
        ? "status-done"
        : "status-cancel";
    const row = document.createElement("div");
    row.className = "contract-board-row";
    row.innerHTML = `
      <div class="contract-name"><span>${item.title}</span></div>
      <div class="contract-status"><span class="badge ${statusClass}">${item.status}</span></div>
      <div class="contract-turn"><span>${item.turn}회차</span></div>
      <div class="contract-request"><span>${item.requester}</span></div>
      <div class="contract-part"><span>${item.participants}</span></div>
    `;
    boardBody.appendChild(row);
  });
}

// [기능] 템플릿 필드 생성 (연차 15일 고정 및 자동 계산 포함)
function renderTemplateFields(templateId) {
  const formContainer = document.getElementById("dynamic-form-fields");
  const msgInput = document.getElementById("contract-request-message");
  if (!formContainer) return;

  const config = templateFields[templateId];
  if (!config) {
    formContainer.innerHTML = "";
    return;
  }

  formContainer.innerHTML =
    '<h6 class="modal-subtitle-text">문서 내용 연결</h6>';
  if (msgInput) msgInput.value = config.msg;

  config.fields.forEach((field) => {
    const fieldWrap = document.createElement("div");
    fieldWrap.className = "contract-request-modal-row";
    let inputHtml = "";

    if (field.type === "emp-select") {
      inputHtml = `<select name="${field.name}" class="emp-auto-select"><option value="">직원 선택</option>`;
      Object.keys(employeesData).forEach((dept) => {
        employeesData[dept].forEach((name) => {
          inputHtml += `<option value="${name}" data-dept="${dept}">${name} (${dept})</option>`;
        });
      });
      inputHtml += `</select>`;
    } else {
      const isDays = field.name.includes("Days");
      inputHtml = `<input type="${isDays ? "number" : field.type}" name="${
        field.name
      }" value="${field.defaultValue || ""}" ${
        field.readonly ? "readonly" : ""
      }>`;
    }

    fieldWrap.innerHTML = `<h5 class="modal-subtitle-text">${field.label}</h5>${inputHtml}`;
    formContainer.appendChild(fieldWrap);
  });

  // 연차 계산 로직 연결
  const vacStart = formContainer.querySelector('input[name="vacStart"]');
  const totalInput = formContainer.querySelector('input[name="totalDays"]');
  const usedInput = formContainer.querySelector('input[name="usedDays"]');
  const remainInput = formContainer.querySelector('input[name="remainDays"]');

  if (vacStart) {
    vacStart.onchange = () => {
      formContainer.querySelector('input[name="vacEnd"]').value =
        getOneYearMinusOneDay(vacStart.value);
      if (totalInput) totalInput.value = 15; // 15일 고정
      if (remainInput)
        remainInput.value = 15 - (parseFloat(usedInput?.value) || 0);
    };
  }
  if (usedInput) {
    usedInput.oninput = () => {
      const total = parseFloat(totalInput?.value) || 15;
      const used = parseFloat(usedInput.value) || 0;
      if (remainInput)
        remainInput.value = (total - used).toFixed(1).replace(/\.0$/, "");
    };
  }
}

// [이벤트] 페이지 초기화
document.addEventListener("DOMContentLoaded", () => {
  contractData = generateRandomContracts();
  renderContractBoard();

  const tSelect = document.getElementById("contract-template-select");
  const targetSelect = document.getElementById("contract-target-select");
  const chk1 = document.querySelector(".order-chk-1");
  const chk2 = document.querySelector(".order-chk-2");

  // 필터 버튼 클릭
  document.querySelectorAll(".contract-process-btn").forEach((btn) => {
    btn.onclick = (e) => {
      document
        .querySelectorAll(".contract-process-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderContractBoard(btn.dataset.process);
    };
  });

  // 요청 모달 열기
  const reqBtn = document.querySelector(".contract-request-btn");
  if (reqBtn) {
    reqBtn.onclick = () =>
      document
        .querySelector(".contract-request-modal")
        ?.classList.remove("is-hidden");
  }

  if (tSelect) tSelect.onchange = (e) => renderTemplateFields(e.target.value);

  if (targetSelect) {
    targetSelect.onchange = (e) => {
      const val = e.target.value;
      if (chk1) chk1.checked = val === "Personal" || val === "All";
      if (chk2) chk2.checked = val === "leader";
    };
  }

  // 최종 요청 버튼
  const approvalBtn = document.querySelector(
    ".contract-request-action .approval"
  );
  if (approvalBtn) {
    approvalBtn.onclick = () => {
      if (!tSelect.value || !targetSelect.value) {
        alert("템플릿과 대상을 선택해주세요.");
        return;
      }
      alert("전자계약 요청이 완료되었습니다!");
      resetContractModal();
      document
        .querySelector(".contract-request-modal")
        .classList.add("is-hidden");
    };
  }

  document
    .querySelectorAll(
      ".contract-request-modal .close, .contract-request-modal .cancel"
    )
    .forEach((btn) => {
      btn.onclick = resetContractModal;
    });
});
