// 1. 필터 상태 및 데이터 정의
let currentProcess = "all";
let currentFilter = "all";
let selectedId = null;

const requestPool = {
  "휴가 신청": [
    "오전 반차 (09:00-13:00)",
    "오후 반차 (13:00-18:00)",
    "연차 휴가",
    "병가 신청",
    "경조 휴가",
  ],
  "근무일정 변경": ["근무 시간 변경", "근무 일자 변경", "유연 근무제 신청"],
  "출장 신청": [
    "가맹점 현장 점검",
    "신규 점주 교육 지원",
    "지역 거점 오피스 출장",
    "본사 교육 연수",
    "지방 출장",
    "해외 출장",
  ],
  "연장근무 신청": [
    "평일 연장근무 (18:00-21:00)",
    "주말/휴일 연장근무",
    "긴급 시스템 점검 (21:00-23:00)",
  ],
  기타: [
    "비품 구매 요청",
    "출장비 정산 결재",
    "경비 정산 결재",
    "부서 이동 신청",
    "명함 제작 요청",
    "사원증 제작 요청",
    "수입결의서 제출",
    "지출결의서 제출",
    "업무 기안서 제출",
  ],
};

const rejectReasons = [
  "정책 미준수",
  "증빙 서류 누락",
  "일정 중복",
  "예산 초과",
  "사유 불분명",
  "기타",
];

const detailedReasons = [
  "본사 교육 참여를 위한 출장 신청입니다.",
  "업무 과다로 인한 연장 근무 협조 부탁드립니다.",
  "긴급 시스템 점검 요청입니다. 승인 부탁드립니다",
  "현장 점검 및 파트너사 미팅 일정입니다.",
  "가족 행사로 인한 급한 연차 신청입니다.",
  "개인사정으로 인한 근무 일정 변경 요청입니다.",
  "가족 행사로 인한 급한 연차 신청입니다.",
  "인원 부족으로 현장 지원 요청 받았습니다. 승인 부탁드립니다",
  "요청하신 결재 서류 입니다. 승인 부탁드립니다.",
];

// 2. 랜덤 데이터 생성 (현실적으로!)
const approvalData = Array.from({ length: 20 }, (_, i) => {
  const type = Object.keys(requestPool)[Math.floor(Math.random() * 5)];
  const content =
    requestPool[type][Math.floor(Math.random() * requestPool[type].length)];
  const dept = Object.keys(employeesData)[Math.floor(Math.random() * 6)];
  const requester =
    employeesData[dept][Math.floor(Math.random() * employeesData[dept].length)];
  // 상태에 'auto' 추가
  const status = ["pending", "approved", "rejected", "auto"][
    Math.floor(Math.random() * 4)
  ];

  return {
    id: i + 1,
    type,
    content,
    requester,
    dept,
    status,
    date: "2025-06-07",
    reason: detailedReasons[Math.floor(Math.random() * detailedReasons.length)],
    rejectReason:
      status === "rejected"
        ? rejectReasons[Math.floor(Math.random() * rejectReasons.length)]
        : "",
  };
});

// 3. 렌더링 함수 (프로세스 분류 및 짝대기 제거)
function renderBoard() {
  const boardBody = document.querySelector(".approval-board-body");
  boardBody.innerHTML = "";

  const filtered = approvalData.filter((item) => {
    // 프로세스 필터 (진행: 대기 / 완료: 승인완료, 자동승인)
    const processMatch =
      currentProcess === "all" ||
      (currentProcess === "pending" && item.status === "pending") ||
      (currentProcess === "approved" &&
        (item.status === "approved" || item.status === "auto")) ||
      (currentProcess === "rejected" && item.status === "rejected");

    const filterMap = {
      vacation: "휴가",
      schedule: "근무일정",
      trip: "출장",
      payroll: "연장근무",
      etc: "기타",
    };
    const filterMatch =
      currentFilter === "all" || item.type.includes(filterMap[currentFilter]);
    return processMatch && filterMatch;
  });

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "approval-board-body-row";

    // 상태 텍스트 및 클래스 매칭
    const statusMap = {
      pending: ["승인 대기", "wait"],
      approved: ["승인 완료", "approved"],
      auto: ["자동 승인", "auto"],
      rejected: ["반려", "reject"],
    };
    const [statusTxt, statusCls] = statusMap[item.status];

    // 액션 버튼 처리 (승인대기만 노출, 나머지는 공백)
    let actionHtml = "";
    if (item.status === "pending") {
      actionHtml = `
                <button class="approve-btn" onclick="openAction('approve', ${item.id})">승인</button>
                <button class="reject-btn" onclick="openAction('reject', ${item.id})">거절</button>`;
    } else if (item.status === "rejected") {
      actionHtml = `<button class="help-btn" style="font-size:11px; color:#8b95a1;" onclick="alert('반려사유: ${item.rejectReason}')">반려사유 확인</button>`;
    }

    row.innerHTML = `
            <div class="approval-item"><span class="approval-body-txt">${item.type}</span></div>
            <div class="approval-content" onclick="openDetailModal(${item.id})">
                <span class="approval-body-txt" style="font-weight:500; color:#333d4b;">${item.content}</span>
            </div>
            <div class="approval-status">
                <button class="approval-status-${statusCls}">${statusTxt}</button>
            </div>
            <div class="approval-action">${actionHtml}</div>
        `;
    boardBody.appendChild(row);
  });
}

// window.openDetailModal 함수 전체를 이 코드로 교체하세요
window.openDetailModal = function (id) {
  selectedId = id;
  const item = approvalData.find((d) => d.id === id);
  const modal = document.querySelector(".approval-detail-modal");

  // 1. 요청자 정보 및 부서 색상 태그 입히기
  modal.querySelector(".approval-employee-name").textContent = item.requester;
  const jobSpan = modal.querySelector(".approval-employee-job");
  jobSpan.textContent = `(${item.dept})`;

  // 기존 클래스 제거 후 부서별 클래스 추가 (Management -> dept-Management)
  jobSpan.className = "approval-employee-job dept-tag";
  const cleanDeptName = item.dept.replace("&", "");
  jobSpan.classList.add(`dept-${cleanDeptName}`);

  // 2. 승인권자 자동 선택
  modal.querySelector("#approver-select").value = item.dept;

  // 3. 요청 정보 매핑
  modal.querySelector("#approval-detail-reason").value = item.reason;
  modal.querySelector(".approval-detail-request-date").textContent = item.date;
  modal.querySelector(".approval-detail-request-content").textContent =
    item.content;

  // 4. [추가] 이미지 디자인처럼 하단 확인 버튼 클릭 시 닫기 기능 확실히 연결
  const confirmBtn = modal.querySelector(".approval");
  confirmBtn.onclick = closeModal;

  modal.classList.remove("is-hidden");
};

// 5. 액션 모달 (텍스트 자동 입력 기능 추가)
window.openAction = function (type, id) {
  selectedId = id;
  const item = approvalData.find((d) => d.id === id);
  const modalClass =
    type === "approve" ? ".approve-action-modal" : ".reject-action-modal";
  const targetModal = document.querySelector(modalClass);

  if (type === "approve") {
    const input = targetModal.querySelector("input");
    const autoText = `${item.type} (${item.content}) 요청 내용 확인했습니다.`;
    input.value = autoText; // Placeholder가 아니라 실제 값으로 넣어버림!
  }
  targetModal.classList.remove("is-hidden");
};

function updateStatus(newStatus) {
  const index = approvalData.findIndex((item) => item.id === selectedId);
  if (index !== -1) {
    approvalData[index].status = newStatus;
    closeModal();
    renderBoard();
  }
}

function closeModal() {
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.add("is-hidden"));
}

// 6. 초기 바인딩
document.addEventListener("DOMContentLoaded", () => {
  renderBoard();

  // 필터 버튼들
  document.querySelectorAll(".process-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".process-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentProcess = btn.dataset.process;
      renderBoard();
    };
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderBoard();
    };
  });

  // 모달 내 버튼들
  document.querySelector(".approve-action-modal .approval").onclick = () =>
    updateStatus("approved");
  document.querySelector(".reject-action-modal .approval").onclick = () =>
    updateStatus("rejected");
  document
    .querySelectorAll(".close, .cancel")
    .forEach((btn) => (btn.onclick = closeModal));
});
