/* ======================================================
   Notice (사내공지) 랜덤 데이터 생성
====================================================== */

// const noticeTitles = [
//   "2026년 설 연휴 휴무 안내", "개인정보 보호 교육 이수 필독", "사내 복지 제도 개편 안내",
//   "타운홀 미팅 일정 공유", "신규 프로젝트 킥오프 미팅", "주차장 이용 수칙 준수 요청",
//   "보안 점검 실시 공지", "워크샵 장소 투표 결과", "신규 입사자 환영 인사",
//   "연차 사용 권장 캠페인", "사내 동호회 지원금 신청", "탕비실 이용 에티켓 안내",
//   "건강검진 대상자 확인", "법정 의무교육 미이수자 안내", "사내 도서관 신규 도서 입고",
//   "시스템 정기 점검 안내", "동계 냉난방 가동 시간 안내", "직무 교육 신청 안내",
//   "연말 정산 서류 제출 안내", "사내 메신저 업데이트 공지", "업무 보고 양식 통일 안내",
//   "근로계약서 갱신 관련 공지", "비상 연락망 최신화 요청", "점심 시간 유연제 시범 운영"
// ];

/* ======================================================
   Notice (사내공지) 리스트 데이터 로직
====================================================== */
/* ======================================================
   Notice (사내공지) 로직 - 파트너님 픽 로직 유지
====================================================== */

// 1. 작성자 랜덤 (하미니님 + 전 직원 308명 합치기)
const allStaff = Object.values(employeesData).flat();
const authors = ["하미니(나)", ...allStaff];

// 2. 템플릿 데이터 (이걸로 모달 자동 입력을 할 거예요)
const noticeTemplates = {
  "notice-edu": {
    title: "[교육] 법정 의무 교육 이수 안내",
    content:
      "안녕하세요. 인사팀입니다. 금일부로 법정 의무 교육이 시작되었습니다.\n- 대상: 전 임직원\n- 기간: 당월 말일까지",
  },
  "notice-system": {
    title: "[점검] 사내 시스템 정기 점검 공지",
    content:
      "안정적인 서비스 제공을 위해 시스템 점검을 실시합니다.\n- 시간: 토요일 00:00 ~ 04:00\n- 영향: 사내 인트라넷 접속 불가",
  },
  "notice-vacation": {
    title: "[휴무] 공휴일 전사 휴무 안내",
    content:
      "다가오는 공휴일에는 전사 휴무입니다.\n급한 업무는 사전에 인수인계 부탁드립니다.\n즐거운 휴일 되세요!",
  },
  "notice-park": {
    title: "[안내] 주차장 이용 수칙 준수 요청",
    content:
      "주차 공간 협소로 인해 2부제를 실시합니다.\n차량 끝 번호를 확인하여 주차 부탁드립니다.",
  },
  "notice-campaign": {
    title: "[캠페인] 사내 환경 개선 캠페인 안내",
    content:
      "쾌적한 사무 환경을 위해 캠페인을 실시합니다.\n- 내용: 개인 자리 정리 및 텀블러 사용 권장",
  },
  "notice-submit": {
    title: "[제출] 연말 정산 서류 제출 기한 안내",
    content:
      "연말 정산 관련 증빙 서류를 기한 내에 제출해 주시기 바랍니다.\n- 마감일: 이번 주 금요일까지",
  },
};

// 3. 리스트 렌더링용 24개 데이터 생성 (전 직원 랜덤 적용)
const notices = Array.from({ length: 24 }, (_, i) => {
  const id = 24 - i;
  const randomTitle = noticeTitles[i % noticeTitles.length]; // 기존에 주신 제목 리스트 사용
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
  return {
    id,
    title: randomTitle,
    author: randomAuthor,
    date: `2025-12-${String(Math.max(1, 31 - i)).padStart(2, "0")}`,
    read: Math.floor(Math.random() * 50) + 250,
    total: 308,
  };
});

// 화면에 리스트 뿌리는 함수
function renderNoticeList() {
  const listBody = document.getElementById("noticeListBody");
  if (!listBody) return;

  listBody.innerHTML = notices
    .map(
      (notice) => `
    <tr>
      <td>${notice.id}</td>
      <td class="notice-t-title">${notice.title}</td>
      <td>${notice.author}</td>
      <td>${notice.date}</td>
      <td><span class="read-count">${notice.read}</span>/${notice.total}</td>
      <td style="text-align:center;"><input type="checkbox" class="notice-chk"></td>
    </tr>
  `
    )
    .join("");
}
