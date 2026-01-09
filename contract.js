let currentAppProcess = "all",
  currentAppFilter = "all";
let currentConProcess = "all",
  currentConFilter = "contract-all";
let selectedId = null,
  selectedMode = null;
let approvalData = [],
  contractData = [];

function initHRData() {
  const depts = Object.keys(employeesData);
  approvalData = Array.from({ length: 20 }, (_, i) => {
    const type = Object.keys(requestPool)[Math.floor(Math.random() * 5)];
    const content =
      requestPool[type][Math.floor(Math.random() * requestPool[type].length)];
    const dept = depts[Math.floor(Math.random() * 6)];
    const requester =
      employeesData[dept][
        Math.floor(Math.random() * employeesData[dept].length)
      ];
    return {
      id: i + 1,
      type,
      content,
      requester,
      dept,
      status: ["pending", "approved", "rejected", "auto"][
        Math.floor(Math.random() * 4)
      ],
      date: "2026-06-07",
      reason:
        detailedReasons[Math.floor(Math.random() * detailedReasons.length)],
    };
  });
  contractData = Array.from({ length: 12 }, (_, i) => {
    const dept = depts[i % depts.length];
    const deptEmps = employeesData[dept];
    const isLeader = Math.random() > 0.7;
    const empName = isLeader
      ? deptEmps[0]
      : deptEmps[Math.floor(Math.random() * 5) + 1];
    let p1 = empName,
      p2 = "",
      turn = 2;
    if (!isLeader && Math.random() > 0.5) {
      p2 = deptEmps[0];
      turn = 3;
    }
    return {
      id: Date.now() + i,
      templateKey: Object.keys(templateFields)[i % 6],
      status: ["승인 대기", "승인 완료", "반려", "자동 승인"][
        Math.floor(Math.random() * 4)
      ],
      turn: turn,
      requester: `${empName}(${dept})`,
      p1,
      p2,
      dept,
      phone: getRandomPhone(),
      address: getRandomAddr(),
      usedDays: (Math.floor(Math.random() * 20) * 0.5).toFixed(1),
      startDate: `2026-05-${Math.floor(Math.random() * 20) + 10}`,
      saveBtnType: Math.random() > 0.5 ? "보관하기" : "보관함 이동",
    };
  });
}

function renderApprovalBoard() {
  const body = document.querySelector(".approval-board-body");
  if (!body) return;
  body.innerHTML = "";
  approvalData
    .filter((item) => {
      const pMatch =
        currentAppProcess === "all" ||
        (currentAppProcess === "pending" && item.status === "pending") ||
        (currentAppProcess === "approved" &&
          (item.status === "approved" || item.status === "auto")) ||
        (currentAppProcess === "rejected" && item.status === "rejected");
      const fMap = {
        vacation: "휴가",
        schedule: "근무일정",
        trip: "출장",
        payroll: "연장근무",
        etc: "기타",
      };
      return (
        pMatch &&
        (currentAppFilter === "all" ||
          item.type.includes(fMap[currentAppFilter]))
      );
    })
    .forEach((item) => {
      const row = document.createElement("div");
      row.className = "approval-board-body-row";
      row.onclick = (e) => {
        if (!e.target.closest("button")) openApprovalDetail(item.id);
      };
      const statusMap = {
        pending: ["승인 대기", "wait"],
        approved: ["승인 완료", "approved"],
        auto: ["자동 승인", "auto"],
        rejected: ["반려", "reject"],
      };
      const [txt, cls] = statusMap[item.status];
      let actionHtml =
        item.status === "pending"
          ? `<button class="approve-btn" onclick="openAction('approve', ${item.id}, 'approval')">승인</button><button class="reject-btn" onclick="openAction('reject', ${item.id}, 'approval')">거절</button>`
          : item.status === "rejected"
          ? `<button class="help-btn" onclick="alert('반려 사유: ${
              item.rejectReason || "정책 미준수"
            }')">반려사유 확인</button>`
          : "";
      row.innerHTML = `<div class="approval-item"><span>${item.type}</span></div><div class="approval-content"><span>${item.content}</span></div><div class="approval-status"><button class="approval-status-${cls}">${txt}</button></div><div class="approval-action">${actionHtml}</div>`;
      body.appendChild(row);
    });
}

function renderContractBoard() {
  const body = document.querySelector(".contract-board-body");
  if (!body) return;
  body.innerHTML = "";
  contractData
    .filter((item) => {
      const pMatch =
        currentConProcess === "all" ||
        (currentConProcess === "pending" && item.status === "승인 대기") ||
        (currentConProcess === "approved" &&
          (item.status === "승인 완료" || item.status === "자동 승인")) ||
        (currentConProcess === "rejected" && item.status === "반려");
      return (
        pMatch &&
        (currentConFilter === "contract-all" ||
          item.templateKey.includes(currentConFilter.replace("-all", "")))
      );
    })
    .forEach((item) => {
      const row = document.createElement("div");
      row.className = "contract-board-body-row";
      row.onclick = () => openContractDetail(item.id);
      const statusMap = {
        "승인 대기": "wait",
        "승인 완료": "approved",
        반려: "reject",
        "자동 승인": "auto",
      };
      const cls = statusMap[item.status];
      let actionHtml =
        item.status === "승인 대기"
          ? `<button class="approve-btn" onclick="event.stopPropagation(); window.openAction('approve', ${item.id}, 'contract')">승인</button><button class="reject-btn" onclick="event.stopPropagation(); openAction('reject', ${item.id}, 'contract')">거절</button>`
          : item.status === "반려"
          ? `<button class="help-btn" onclick="event.stopPropagation(); alert('반려 사유: ${
              item.rejectReason || "서류 미비"
            }')">반려사유 확인</button>`
          : `<button class="status-btn approved save" onclick="event.stopPropagation();">${item.saveBtnType}</button>`;
      row.innerHTML = `<div class="contract-name"><span>${
        templateMap[item.templateKey]
      }</span></div><div class="contract-status"><button class="status-btn contract-status-${cls}">${
        item.status
      }</button></div><div class="contract-turn"><span>${
        item.turn
      }</span></div><div class="contract-request"><span>${
        item.requester
      }</span></div><div class="contract-part"><span class="part-label">1차</span> ${
        item.p1
      } ${
        item.p2 ? `<span class="part-label">2차</span> ${item.p2}` : ""
      }</div><div class="contract-manage">${actionHtml}</div>`;
      body.appendChild(row);
    });
}
window.renderTemplateFields = function (
  templateKey,
  containerSelector,
  isDetail = false,
  itemData = null
) {
  const container = document.querySelector(containerSelector);
  if (!container || !templateFields[templateKey]) return;
  const config = templateFields[templateKey];
  let fieldHtml = "";

  if (isDetail && itemData && containerSelector.includes("detail")) {
    const statusArea = document.querySelector(
      ".contract-detail-modal .contract-detail-row:nth-child(3)"
    );
    if (statusArea) {
      const statusMap = {
        "승인 대기": "wait",
        "승인 완료": "approved",
        반려: "reject",
        "자동 승인": "auto",
      };
      statusArea.innerHTML = `<span class="contract-detail-row-title">승인 상태</span><button class="status-btn contract-status-${
        statusMap[itemData.status]
      }">${itemData.status}</button>`;
    }
  }

  config.fields.forEach((f) => {
    let val = f.defaultValue || "";
    if (itemData) {
      if (f.label.includes("성명") || f.label.includes("이름"))
        val = itemData.p1 || "";
      else if (f.label.includes("부서") || f.label.includes("소속"))
        val = itemData.dept || "";
      else if (f.label.includes("전화")) val = itemData.phone || "";
      else if (f.label.includes("주소")) val = itemData.address || "";
    }

    if (f.label === "발생일수") val = 15;
    if (f.label === "연봉계약기간") val = "2026.01.01 - 2026.12.31";
    if (f.label === "임금 지급일") val = "익월 19일";

    if (
      isDetail &&
      (f.label.includes("계약기간") || f.label.includes("신청기간"))
    ) {
      val = "2026.01.01 - 2026.12.31";
    }

    if (isDetail) {
      if (
        f.type === "date" ||
        f.label.includes("기간") ||
        f.label.includes("일")
      ) {
        const d = new Date();
        d.setDate(d.getDate() - 10);
        val = d.toISOString().split("T")[0];
      }
      if (f.label === "근무장소")
        val = ["본사", "여의도 지사", "강남 지사"][
          Math.floor(Math.random() * 3)
        ];
      if (f.label === "요청 제목")
        val = [
          "2026년도 근로계약 갱신 건",
          "연차 사용 계획서",
          "부서 이동 보안 서약",
        ][Math.floor(Math.random() * 3)];
      if (f.label === "담당자") {
        const allEmps = Object.values(employeesData).flat();
        val = allEmps[Math.floor(Math.random() * allEmps.length)];
      }
    }

    let inputHtml = "";
    if (isDetail) {
      inputHtml = `<input type="text" value="${val}" disabled>`;
    } else {
      let isForcedDisabled = false;

      if (f.label.includes("성명") || f.label.includes("이름"))
        isForcedDisabled = true;
      if (f.label.includes("부서") || f.label.includes("소속"))
        isForcedDisabled = true;

      if (templateKey === "contract-vacation") {
        if (f.label === "발생일수" || f.label === "잔여일수")
          isForcedDisabled = true;
      }
      if (templateKey === "contract-salary") {
        if (f.label === "연봉계약기간" || f.label === "임금 지급일")
          isForcedDisabled = true;
      }
      if (templateKey === "contract-security") {
        if (f.label === "전화" || f.label === "주소") isForcedDisabled = true;
      }
      if (templateKey === "contract-collaboration") {
        if (targetVal !== "Personal") isForcedDisabled = true;
      }
      if (templateKey === "contract-privacy") {
        if (f.label === "주소" || f.label === "전화") isForcedDisabled = true;
      }

      const disabledAttr = isForcedDisabled
        ? "disabled style='background:#f2f2f2; color:#888;'"
        : "";

      let inputType = f.type || "text";
      if (
        f.label.includes("기간") ||
        f.label.includes("날짜") ||
        f.label.includes("일시")
      ) {
        inputType = "date";
      }
      if (f.label === "사용한 연차") inputType = "number";

      if (f.type === "select" && f.options) {
        inputHtml = `<select name="${
          f.name
        }" ${disabledAttr}><option value="">선택</option>${f.options
          .map(
            (opt) =>
              `<option value="${opt}" ${
                val === opt ? "selected" : ""
              }>${opt}</option>`
          )
          .join("")}</select>`;
      } else if (f.type === "emp-select") {
        inputHtml = `<select name="${
          f.name
        }" ${disabledAttr} class="dynamic-emp-select"><option value="${val}">${
          val || "직원 선택"
        }</option></select>`;
      } else {
        const step =
          f.label === "사용한 연차" ? "step='0.5' min='0' max='15'" : "";
        inputHtml = `<input type="${inputType}" name="${f.name}" value="${val}" ${disabledAttr} ${step} placeholder="${f.label} 입력">`;
      }
    }
    fieldHtml += `<div class="contract-request-modal-row"><h5 class="modal-subtitle-text">${f.label}</h5>${inputHtml}</div>`;
  });

  container.innerHTML = fieldHtml;

  if (!isDetail) {
    const msgArea = document.getElementById("contract-request-message");
    if (msgArea) msgArea.value = config.msg;

    container.querySelectorAll(".dynamic-emp-select").forEach((sel) => {
      const currentVal = sel.value;
      sel.innerHTML = '<option value="">선택</option>';
      Object.keys(employeesData).forEach((dept) => {
        const group = document.createElement("optgroup");
        group.label = dept;
        employeesData[dept].forEach((name) => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          if (currentVal === name) opt.selected = true;
          group.appendChild(opt);
        });
        sel.appendChild(group);
      });
    });

    const tIn = container.querySelector('input[name="totalDays"]');
    const uIn = container.querySelector('input[name="usedDays"]');
    const rIn = container.querySelector('input[name="remainDays"]');

    if (uIn && rIn) {
      uIn.addEventListener("input", (e) => {
        let used = parseFloat(e.target.value) || 0;
        if (used > 15) {
          alert("연차 사용은 15일을 넘길 수 없습니다.");
          e.target.value = 15;
          used = 15;
        }
        if (used < 0) {
          e.target.value = 0;
          used = 0;
        }

        const total = 15; // 발생일수 고정
        rIn.value = (total - used).toFixed(1);
      });
    }
  }
};

window.openAction = (type, id, mode) => {
  selectedId = id;
  selectedMode = mode;
  const mSel =
    type === "approve" ? ".approve-action-modal" : ".reject-action-modal";
  if (type === "approve") {
    const item =
      mode === "approval"
        ? approvalData.find((d) => d.id === id)
        : contractData.find((d) => d.id === id);
    document.querySelector(`${mSel} input`).value =
      mode === "approval"
        ? `${item.type} 요청 내용 확인했습니다.`
        : `${templateMap[item.templateKey]} 내용 확인했습니다.`;
  }
  openModal(mSel);
};

window.handleFinalAction = (type) => {
  if (!selectedId || !selectedMode) return;

  const list = selectedMode === "approval" ? approvalData : contractData;
  const item = list.find((d) => d.id === selectedId);

  if (!item) return;

  if (type === "approve") {
    if (selectedMode === "contract") {
      item.saveBtnType = confirm(
        "해당 요청을 승인하시겠습니까?\n(확인 시 보관함으로 이동합니다.)"
      )
        ? "보관함 이동"
        : "보관하기";
    }
    item.status = selectedMode === "approval" ? "approved" : "승인 완료";
    alert("승인 처리 되었습니다.");
  } else {
    const rSel = document.getElementById("reject-modal-reason");
    const etcInput = document.getElementById("reject-modal-reason-etc");
    const etcVal = etcInput ? etcInput.value.trim() : "";

    if (rSel.selectedIndex === 0 && !etcVal) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    const fullReason = etcVal
      ? `${rSel.options[rSel.selectedIndex].text} ( ${etcVal} )`
      : rSel.options[rSel.selectedIndex].text;

    item.status = selectedMode === "approval" ? "rejected" : "반려";
    item.rejectReason = fullReason;
    alert(`반려 사유 : ${fullReason}\n반려 처리 되었습니다.`);
  }

  closeModal();
  renderApprovalBoard();
  renderContractBoard();
};

window.openApprovalDetail = (id) => {
  const item = approvalData.find((d) => d.id === id);
  const m = document.querySelector(".approval-detail-modal");
  m.querySelector(".approval-employee-name").textContent = item.requester;
  m.querySelector(".approval-employee-job").textContent = `(${item.dept})`;
  m.querySelector("#approver-select").value = item.dept;
  m.querySelector("#approval-detail-reason").value = item.reason;
  openModal(".approval-detail-modal");
};

window.openContractDetail = (id) => {
  const item = contractData.find((d) => d.id === id);
  const m = document.querySelector(".contract-detail-modal");
  m.querySelector(".contract-employee-name").textContent = item.p1;
  m.querySelector(".contract-employee-job").textContent = `(${item.dept})`;
  m.querySelector(".contract-name").textContent = templateMap[item.templateKey];
  m.querySelector(
    ".contract-detail-sign-first"
  ).innerHTML = `<span class="part-label">1차</span> ${item.p1}`;
  m.querySelector(".contract-detail-sign-second").innerHTML = item.p2
    ? `<span class="part-label">2차</span> ${item.p2}`
    : "";
  renderTemplateFields(
    item.templateKey,
    "#dynamic-form-fields-detail",
    true,
    item
  );
  openModal(".contract-detail-modal");
};

window.openModal = (sel) =>
  document.querySelector(sel)?.classList.remove("is-hidden");
window.closeModal = () =>
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.add("is-hidden"));

document.addEventListener("DOMContentLoaded", () => {
  initHRData();
  renderApprovalBoard();
  renderContractBoard();

  document.addEventListener("click", (e) => {
    if (e.target.closest(".close") || e.target.closest(".cancel")) closeModal();
    if (
      e.target.closest(".approval") &&
      (e.target.closest(".approval-detail-modal") ||
        e.target.closest(".contract-detail-modal"))
    )
      closeModal();
  });
  const updateActiveState = (targetBtn, selector) => {
    const parent = targetBtn.parentElement;
    document
      .querySelectorAll(selector)
      .forEach((btn) => btn.classList.remove("active"));
    targetBtn.classList.add("active");
  };
  document.querySelectorAll(".process-btn, .filter-btn").forEach((b) => {
    b.onclick = () => {
      const selector = b.classList.contains("process-btn")
        ? ".process-btn"
        : ".filter-btn";
      updateActiveState(b, selector);

      if (b.dataset.process) currentAppProcess = b.dataset.process;
      if (b.dataset.filter) currentAppFilter = b.dataset.filter;
      renderApprovalBoard();
    };
  });

  document
    .querySelectorAll(".contract-process-btn, .contract-filter-btn")
    .forEach((b) => {
      b.onclick = () => {
        const selector = b.classList.contains("contract-process-btn")
          ? ".contract-process-btn"
          : ".contract-filter-btn";
        updateActiveState(b, selector);

        const deptSel = document.getElementById("target-dept-select");
        const empSel = document.getElementById("target-emp-select");
        const msgArea = document.getElementById("contract-request-message");

        if (deptSel) deptSel.selectedIndex = 0;
        if (empSel) empSel.innerHTML = '<option value="">직원 선택</option>';
        if (msgArea) msgArea.value = "";

        const row = document.querySelector(".target-personal-row");
        if (row) row.classList.add("is-hidden");

        const dynamicFields = document.getElementById(
          "dynamic-form-fields-request"
        );
        if (dynamicFields) dynamicFields.innerHTML = "";

        if (b.dataset.process) currentConProcess = b.dataset.process;
        if (b.dataset.item) currentConFilter = b.dataset.item;
        renderContractBoard();
      };
    });

  const targetSel = document.getElementById("contract-target-select");
  const deptSel = document.getElementById("target-dept-select");
  const empSel = document.getElementById("target-emp-select");
  const templateSel = document.getElementById("contract-template-select");

  if (deptSel) {
    deptSel.innerHTML = '<option value="">부서 선택</option>';
    Object.keys(employeesData).forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      deptSel.appendChild(opt);
    });
  }

  targetSel.onchange = (e) => {
    const val = e.target.value;
    const personalRow = document.querySelector(".target-personal-row");
    if (personalRow) {
      if (val === "Personal") {
        personalRow.classList.remove("is-hidden");
        personalRow.style.display = "flex";
      } else {
        personalRow.classList.add("is-hidden");
        personalRow.style.display = "none";
      }
    }
    document.querySelector(".order-chk-1").checked =
      val === "All" || val === "Personal";
    document.querySelector(".order-chk-2").checked = val === "leader";
    templateSel.value = "";
    document.getElementById("dynamic-form-fields-request").innerHTML = "";
  };

  deptSel.onchange = (e) => {
    const dept = e.target.value;
    empSel.innerHTML = '<option value="">직원 선택</option>';
    if (employeesData[dept]) {
      employeesData[dept].forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        empSel.appendChild(opt);
      });
    }
    if (templateSel.value) {
      renderTemplateFields(
        templateSel.value,
        "#dynamic-form-fields-request",
        false,
        { dept: dept }
      );
    }
  };

  empSel.onchange = () => {
    const selectedName = empSel.value;
    const selectedDept = deptSel.value;

    if (selectedName && templateSel.value) {
      renderTemplateFields(
        templateSel.value,
        "#dynamic-form-fields-request",
        false,
        {
          p1: selectedName,
          dept: selectedDept,
          phone: getRandomPhone(),
          address: getRandomAddr(),
        }
      );

      const formEmpSelect = document.querySelector(
        "#dynamic-form-fields-request .dynamic-emp-select"
      );
      if (formEmpSelect) {
        formEmpSelect.innerHTML = `<option value="${selectedName}" selected>${selectedName}</option>`;
        formEmpSelect.value = selectedName;
      }
    }
  };

  templateSel.onchange = (e) => {
    renderTemplateFields(
      e.target.value,
      "#dynamic-form-fields-request",
      false,
      {
        p1: empSel.value,
        dept: deptSel.value,
        phone: getRandomPhone(),
        address: getRandomAddr(),
      }
    );
  };

  document
    .querySelectorAll(".contract-request-btn, .contract-add-btn")
    .forEach((btn) => {
      btn.onclick = () => {
        const isAdd = btn.classList.contains("contract-add-btn");
        const m = document.querySelector(".contract-request-modal");
        const submitBtn = m.querySelector(".approval");

        templateSel.value = "";
        targetSel.value = "";
        deptSel.value = "";
        empSel.innerHTML = '<option value="">직원 선택</option>';
        document.getElementById("dynamic-form-fields-request").innerHTML = "";
        document
          .querySelector(".target-personal-row")
          .classList.add("is-hidden");
        document.querySelector(".target-personal-row").style.display = "none";

        const p1 = m.querySelector("option[value='contract-vacation-plan1']"),
          p2 = m.querySelector("option[value='contract-vacation-plan2']"),
          v = m.querySelector("option[value='contract-vacation']");
        if (p1) p1.disabled = !isAdd;
        if (p2) p2.disabled = !isAdd;
        if (v) v.disabled = false;

        m.querySelector(".modal-title-text").textContent = isAdd
          ? "전자계약서 추가"
          : "전자계약 요청";
        submitBtn.textContent = isAdd ? "추가하기" : "요청하기";

        submitBtn.onclick = () => {
          const dynamicFields = document
            .getElementById("dynamic-form-fields-request")
            .querySelectorAll("input, select");
          let allFilled = true;

          if (!templateSel.value) {
            alert("템플릿을 선택해 주세요.");
            return;
          }

          dynamicFields.forEach((f) => {
            if (!f.disabled && !f.value.trim() && f.type !== "checkbox") {
              allFilled = false;
              f.style.border = "1px solid #64a8ff";
            } else {
              f.style.border = "";
            }
          });

          if (!allFilled) {
            alert("모든 내용을 입력해 주세요.");
          } else {
            alert(isAdd ? "추가 완료 되었습니다." : "요청 완료 되었습니다.");
            closeModal();
            renderContractBoard();
          }
        };
        openModal(".contract-request-modal");
      };
    });
});
