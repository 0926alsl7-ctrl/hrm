/* === 전자계약 & 결재 통합 관리 시스템 === */

let contractData = [];
let selectedId = null;
let activeMode = "contract";

// --- [공통] 모달 제어 ---
function openModal(selector) {
  const modal = document.querySelector(selector);
  if (modal) {
    modal.classList.remove("is-hidden");
    modal.classList.add("is-active");
  }
}

function closeModal() {
  document.querySelectorAll(".modal").forEach((m) => {
    m.classList.add("is-hidden");
    m.classList.remove("is-active");
  });
}

// --- [전자계약] 데이터 생성기 (기능 복구) ---
function generateRandomContracts() {
  const data = [];
  const depts = Object.keys(employeesData || {});
  const keys = Object.keys(templateFields);

  for (let i = 0; i < 12; i++) {
    const templateKey = keys[Math.floor(Math.random() * keys.length)];
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const empList = employeesData[dept];
    const empName = empList[Math.floor(Math.random() * empList.length)];
    const leaderName = empList[0];

    const statuses = ["반려", "승인 대기", "자동 승인", "승인 완료"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasSecondStep = empName !== leaderName && Math.random() > 0.5;

    data.push({
      id: Date.now() + i,
      templateKey: templateKey,
      title: templateMap[templateKey],
      status: status,
      turn: hasSecondStep ? 3 : 2,
      requester: `${empName}(${dept})`,
      p1: empName,
      p2: hasSecondStep ? leaderName : null,
    });
  }
  return data;
}

// --- [전자계약] 게시판 렌더링 ---
function renderContractBoard() {
  const boardBody = document.querySelector(".contract-board-body");
  if (!boardBody) return;

  boardBody.innerHTML = "";
  contractData.forEach((item) => {
    const row = document.createElement("div");
    row.className = "contract-board-row";
    row.onclick = (e) => {
      if (!e.target.closest("button")) openContractDetail(item.id);
    };

    const statusCls = {
      "승인 대기": "contract-status-wait",
      "승인 완료": "contract-status-approved",
      "자동 승인": "contract-status-auto",
      반려: "contract-status-reject",
    }[item.status];

    let manageHtml = "";
    if (item.status === "승인 대기") {
      manageHtml = `
        <button class="manage-btn-approve" onclick="openAction('approve', ${item.id}, 'contract')">승인</button>
        <button class="manage-btn-reject" onclick="openAction('reject', ${item.id}, 'contract')">거절</button>`;
    } else if (item.status === "반려") {
      manageHtml = `<button class="manage-btn-reason" onclick="alert('반려 사유: 서류 미비')"><img src="images/info.svg" style="width:14px; margin-right:4px;">사유 확인</button>`;
    } else {
      manageHtml = `<button class="manage-btn-go" onclick="alert('보관함으로 이동합니다.')"><img src="images/archive.svg" style="width:14px; margin-right:4px;">보관함으로 이동</button>`;
    }

    row.innerHTML = `
      <div class="contract-name"><span>${item.title}</span></div>
      <div class="contract-status"><button class="status-btn ${statusCls}">${
      item.status
    }</button></div>
      <div class="contract-turn"><span>${item.turn}</span></div>
      <div class="contract-request"><span>${item.requester}</span></div>
      <div class="contract-part">
        <div class="part-item"><span class="part-label">1차</span><span class="part-name">${
          item.p1
        }</span></div>
        ${
          item.p2
            ? `<div class="part-item"><span class="part-label">2차</span><span class="part-name">${item.p2}</span></div>`
            : ""
        }
      </div>
      <div class="contract-manage">${manageHtml}</div>
    `;
    boardBody.appendChild(row);
  });
}

// --- [전자계약] 상세 검토 모달 오픈 ---
function openContractDetail(id) {
  const item = contractData.find((d) => d.id === id);
  if (!item) return;
  selectedId = id;

  const modal = document.querySelector(".contract-detail-modal");
  const [name, dept] = item.requester.replace(")", "").split("(");

  modal.querySelector(".contract-employee-name").textContent = name;
  modal.querySelector(".contract-employee-job").textContent = dept;
  modal.querySelector(".contract-name").textContent = item.title;
  modal.querySelector(
    ".contract-detail-sign-first"
  ).textContent = `1차: ${item.p1}`;
  modal.querySelector(".contract-detail-sign-second").textContent = item.p2
    ? `2차: ${item.p2}`
    : "-";

  // 상세 모달 우측 폼 렌더링
  renderTemplateFields(item.templateKey, "#dynamic-form-fields-detail");
  openModal(".contract-detail-modal");
}

// --- [기능 복구] 동적 폼 필드 렌더링 (핵심!) ---
function renderTemplateFields(templateKey, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const config = templateFields[templateKey];
  if (!config) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `<h6 class="modal-subtitle-text">${config.msg}</h6>`;

  config.fields.forEach((field) => {
    const wrap = document.createElement("div");
    wrap.className = "contract-request-modal-row";
    let inputHtml = "";

    if (field.type === "emp-select") {
      inputHtml = `<select class="emp-auto-select"><option value="">직원 선택</option>`;
      Object.keys(employeesData).forEach((d) => {
        employeesData[d].forEach((name) => {
          inputHtml += `<option value="${name}" data-dept="${d}">${name} (${d})</option>`;
        });
      });
      inputHtml += `</select>`;
    } else if (field.type === "select") {
      inputHtml = `<select>${field.options
        .map((o) => `<option>${o}</option>`)
        .join("")}</select>`;
    } else {
      inputHtml = `<input type="${field.type}" value="${
        field.defaultValue || ""
      }" ${field.readonly ? "readonly" : ""}>`;
    }

    wrap.innerHTML = `<h5 class="modal-subtitle-text">${field.label}</h5>${inputHtml}`;
    container.appendChild(wrap);
  });
}

// --- [공통] 승인/반려 액션 ---
window.openAction = function (type, id, mode) {
  selectedId = id;
  activeMode = mode;
  const modalSelector =
    type === "approve" ? ".approve-action-modal" : ".reject-action-modal";

  if (type === "approve" && mode === "contract") {
    const item = contractData.find((d) => d.id === id);
    const input = document.querySelector(`${modalSelector} input`);
    if (input) input.value = `${item.title} 내용 확인했습니다.`;
  }
  openModal(modalSelector);
};

function processApproval() {
  if (activeMode === "contract") {
    const item = contractData.find((d) => d.id === selectedId);
    if (item) {
      item.status = "승인 완료";
      alert("승인되었습니다. 보관함으로 이동합니다.");
      renderContractBoard();
      closeModal();
    }
  }
}

// --- [이벤트 바인딩] ---
document.addEventListener("DOMContentLoaded", () => {
  contractData = generateRandomContracts();
  renderContractBoard();

  // 1. 템플릿 선택 이벤트
  const tSelect = document.getElementById("contract-template-select");
  if (tSelect) {
    tSelect.onchange = (e) => {
      renderTemplateFields(e.target.value, "#dynamic-form-fields");
    };
  }

  // 2. 대상 선택 (개인 선택 시 row 노출)
  const targetSelect = document.getElementById("contract-target-select");
  const personalRow = document.getElementById("target-personal-row");
  if (targetSelect && personalRow) {
    targetSelect.onchange = (e) => {
      if (e.target.value === "Personal")
        personalRow.classList.remove("is-hidden");
      else personalRow.classList.add("is-hidden");
    };
  }

  // 3. 승인/반려 버튼 바인딩
  const approveBtn = document.querySelector(".approve-action-modal .approval");
  if (approveBtn) approveBtn.onclick = processApproval;

  const rejectBtn = document.querySelector(".reject-action-modal .approval");
  if (rejectBtn) {
    rejectBtn.onclick = () => {
      if (activeMode === "contract") {
        const item = contractData.find((d) => d.id === selectedId);
        item.status = "반려";
        renderContractBoard();
        closeModal();
      }
    };
  }

  // 4. 모달 열기/닫기
  document
    .querySelectorAll(".contract-request-btn, .contract-add-btn")
    .forEach((btn) => {
      btn.onclick = () => openModal(".contract-request-modal");
    });

  document.querySelectorAll(".close, .cancel").forEach((btn) => {
    btn.onclick = closeModal;
  });
});
