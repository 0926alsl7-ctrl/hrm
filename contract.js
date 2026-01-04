/* === 통합 시스템 핵심 로직 === */

// 1. 기초 데이터 및 상태 정의
let currentAppProcess = "all";
let currentAppFilter = "all";
let currentConProcess = "all";
let currentConFilter = "contract-all";
let selectedId = null;

const templateMap = {
  "contract-work": "근로계약서",
  "contract-protect": "정보보호 서약서",
  "contract-vacation": "연차휴가 사용 촉진서",
  "contract-salary": "연봉계약서",
  "contract-internal": "사내 업무 협조 요청서",
  "contract-personal-info": "근로자 개인정보 수집/활용 동의서",
  "contract-vacation-plan": "연차 휴가 사용 계획서",
};

const appContents = [
  "연차 휴가 신청",
  "오전 반차 (09:00-13:00)",
  "근무 시간 변경 요청",
  "지방 출장 (부산)",
  "비품 구매 요청",
];
const appReasons = [
  "가족 행사로 인한 연차입니다.",
  "개인 사정으로 인한 반차 신청입니다.",
  "업무 과다로 인한 시간 변경입니다.",
  "현장 점검을 위한 출장입니다.",
];

let approvalData = [];
let contractData = [];

// 2. 데이터 초기화 (요청사유, 부서, 참여자 로직 반영)
function initHRData() {
  const depts = Object.keys(employeesData);

  // 전자결재 데이터
  approvalData = Array.from({ length: 15 }, (_, i) => {
    const dept = depts[i % depts.length];
    const status = ["pending", "approved", "rejected", "auto"][i % 4];
    return {
      id: i + 1,
      type: [
        "휴가 신청",
        "근무일정 변경",
        "출장 신청",
        "연장근무 신청",
        "기타",
      ][i % 5],
      content: appContents[i % 5],
      requester: employeesData[dept][0],
      dept: dept,
      status: status,
      date: "2026-06-07",
      reason: appReasons[i % appReasons.length],
      rejectReason: status === "rejected" ? "정책 미준수 및 서류 미비" : "",
    };
  });

  // 전자계약 데이터 (참여자 1차/2차 로직)
  contractData = Array.from({ length: 12 }, (_, i) => {
    const dept = depts[i % depts.length];
    const emp = employeesData[dept][0];
    const status = ["승인 대기", "승인 완료", "반려", "자동 승인"][i % 4];
    return {
      id: Date.now() + i,
      templateKey: Object.keys(templateMap)[i % 7],
      title: templateMap[Object.keys(templateMap)[i % 7]],
      status: status,
      turn: (i % 2) + 1,
      requester: `${emp}(${dept})`,
      p1: emp,
      p2: "하미니", // 리더
      dept: dept,
    };
  });
}

// 3. 전자결재 렌더링 (필터 & 관리버튼 로직)
function renderApprovalBoard() {
  const body = document.querySelector(".approval-board-body");
  if (!body) return;
  body.innerHTML = "";

  const filtered = approvalData.filter((item) => {
    const processMatch =
      currentAppProcess === "all" ||
      (currentAppProcess === "pending" && item.status === "pending") ||
      (currentAppProcess === "approved" &&
        (item.status === "approved" || item.status === "auto")) ||
      (currentAppProcess === "rejected" && item.status === "rejected");

    const filterMap = {
      vacation: "휴가",
      schedule: "근무일정",
      trip: "출장",
      payroll: "연장근무",
      etc: "기타",
    };
    const filterMatch =
      currentAppFilter === "all" ||
      item.type.includes(filterMap[currentAppFilter]);
    return processMatch && filterMatch;
  });

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "approval-board-body-row";
    const statusMap = {
      pending: ["승인 대기", "wait"],
      approved: ["승인 완료", "approved"],
      auto: ["자동 승인", "auto"],
      rejected: ["반려", "reject"],
    };
    const [txt, cls] = statusMap[item.status];

    let actionHtml = "";
    if (item.status === "pending") {
      actionHtml = `<button class="approve-btn" onclick="openAction('approve', ${item.id})">승인</button>
                          <button class="reject-btn" onclick="openAction('reject', ${item.id})">거절</button>`;
    } else if (item.status === "rejected") {
      actionHtml = `<button class="help-btn" onclick="alert('반려 사유: ${item.rejectReason}')">반려사유 확인</button>`;
    }

    row.innerHTML = `
            <div class="approval-item"><span>${item.type}</span></div>
            <div class="approval-content" onclick="openApprovalDetail(${item.id})"><span>${item.content}</span></div>
            <div class="approval-status"><button class="approval-status-${cls}">${txt}</button></div>
            <div class="approval-action">${actionHtml}</div>
        `;
    body.appendChild(row);
  });
}

// 4. 전자계약 렌더링 (원래 클래스명 & 관리 로직 복구)
function renderContractBoard() {
  const body = document.querySelector(".contract-board-body");
  if (!body) return;
  body.innerHTML = "";

  const filtered = contractData.filter((item) => {
    const processMatch =
      currentConProcess === "all" ||
      (currentConProcess === "pending" && item.status === "승인 대기") ||
      (currentConProcess === "approved" &&
        (item.status === "승인 완료" || item.status === "자동 승인")) ||
      (currentConProcess === "rejected" && item.status === "반려");
    const filterMatch =
      currentConFilter === "contract-all" ||
      item.templateKey.includes(currentConFilter.replace("-all", ""));
    return processMatch && filterMatch;
  });

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "contract-board-body-row";
    row.style.display = "flex"; // 구조 유지
    row.onclick = (e) => {
      if (!e.target.closest("button")) openContractDetail(item.id);
    };

    const statusClassMap = {
      "승인 대기": "wait",
      "승인 완료": "approved",
      반려: "reject",
      "자동 승인": "auto",
    };
    const cls = statusClassMap[item.status];

    let actionHtml = "";
    if (item.status === "승인 대기") {
      actionHtml = `<button class="approve-btn" onclick="openAction('approve', ${item.id})">승인</button>
                          <button class="reject-btn" onclick="openAction('reject', ${item.id})">거절</button>`;
    } else if (item.status === "반려") {
      actionHtml = `<button class="help-btn" onclick="alert('반려 사유: 서명 거부')">반려사유 확인</button>`;
    } else {
      const btnTxt = Math.random() > 0.5 ? "보관하기" : "보관함 이동";
      actionHtml = `<button class="status-btn approved">${btnTxt}</button>`;
    }

    row.innerHTML = `
            <div class="contract-name"><span>${item.title}</span></div>
            <div class="contract-status"><button class="status-btn contract-status-${cls}">${
      item.status
    }</button></div>
            <div class="contract-turn"><span>${item.turn}</span></div>
            <div class="contract-request"><span>${item.requester}</span></div>
            <div class="contract-part"><span>1차: ${item.p1}${
      item.turn === 2 ? `<br>2차: ${item.p2}` : ""
    }</span></div>
            <div class="contract-manage">${actionHtml}</div>
        `;
    body.appendChild(row);
  });
}

// 5. 모달 상세 연결 (부서, 사유, 폼 연결)
window.openApprovalDetail = function (id) {
  const item = approvalData.find((d) => d.id === id);
  const modal = document.querySelector(".approval-detail-modal");
  modal.querySelector(".approval-employee-name").textContent = item.requester;
  modal.querySelector(".approval-employee-job").textContent = `(${item.dept})`;
  modal.querySelector("#approver-select").value = item.dept;
  modal.querySelector("#approval-detail-reason").value = item.reason;
  modal.querySelector(".approval-detail-request-content").textContent =
    item.content;
  openModal(".approval-detail-modal");
};

window.openContractDetail = function (id) {
  const item = contractData.find((d) => d.id === id);
  const modal = document.querySelector(".contract-detail-modal");
  modal.querySelector(".contract-employee-name").textContent = item.p1;
  modal.querySelector(".contract-employee-job").textContent = `(${item.dept})`;
  modal.querySelector(".contract-name").textContent = item.title;
  modal.querySelector(
    ".contract-detail-sign-first"
  ).textContent = `1차: ${item.p1}`;
  modal.querySelector(
    ".contract-detail-sign-second"
  ).textContent = `2차: ${item.p2}`;

  renderTemplateFields(item.templateKey, "#dynamic-form-fields-detail");
  openModal(".contract-detail-modal");
};

// 6. 폼 동적 생성
window.renderTemplateFields = function (templateKey, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const config = templateFields[templateKey] || templateFields["contract-work"];
  container.innerHTML = `<h6 class="modal-subtitle-text">${config.msg}</h6>`;
  config.fields.forEach((f) => {
    container.innerHTML += `
            <div class="contract-request-modal-row">
                <h5 class="modal-subtitle-text">${f.label}</h5>
                <input type="${f.type}" value="${
      f.defaultValue || ""
    }" style="width:100%">
            </div>`;
  });
};

// 7. 액션 모달 연결 (승인/거절 모달 띄우기)
window.openAction = function (type, id) {
  selectedId = id;
  const modalSelector =
    type === "approve" ? ".approve-action-modal" : ".reject-action-modal";
  openModal(modalSelector);
};

window.openModal = (sel) =>
  document.querySelector(sel).classList.remove("is-hidden");
window.closeModal = () =>
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.add("is-hidden"));

// 8. 이벤트 바인딩
document.addEventListener("DOMContentLoaded", () => {
  initHRData();
  renderApprovalBoard();
  renderContractBoard();

  // 전자결재 필터
  document.querySelectorAll(".process-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".process-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentAppProcess = btn.dataset.process;
      renderApprovalBoard();
    };
  });
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentAppFilter = btn.dataset.filter;
      renderApprovalBoard();
    };
  });

  // 전자계약 필터
  document.querySelectorAll(".contract-process-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".contract-process-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentConProcess = btn.dataset.process;
      renderContractBoard();
    };
  });
  document.querySelectorAll(".contract-filter-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".contract-filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentConFilter = btn.dataset.item;
      renderContractBoard();
    };
  });

  // 버튼 연동
  document
    .querySelectorAll(".close, .cancel, .approval-detail-action .approval")
    .forEach((btn) => (btn.onclick = closeModal));

  // 계약서 요청 모달 제어
  document
    .querySelectorAll(".contract-request-btn, .contract-add-btn")
    .forEach((btn) => {
      btn.onclick = () => {
        openModal(".contract-request-modal");
        document.getElementById("contract-request-message").value =
          "전자서명 요청드립니다. 확인 후 서명 부탁드립니다.";
        document.querySelector(".order-chk-1").checked = true;
        document.querySelector(".order-chk-2").checked = true;
      };
    });

  const tSelect = document.getElementById("contract-template-select");
  if (tSelect)
    tSelect.onchange = (e) =>
      renderTemplateFields(e.target.value, "#dynamic-form-fields-detail");
});
