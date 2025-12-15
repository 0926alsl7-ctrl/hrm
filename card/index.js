let member = [];

function list() {
  let ul = `<ul>`;
  for (let i = 0; i < member.length; i++) {
    ul += `<li>`;

    ul += `<p>${i + 1}</p>
    <p>${member[i][0]}</p>
    <p>${member[i][1]}</p>
    <p>${member[i][2]}</p>
    <p>${member[i][3]}</p>
    <p>${member[i][4]}</p>
    <p><a href='#' data-num='${i}' data-action ='view' >보기</a>
    <a href='#' data-num='${i}'  data-action ='edit'>수정</a> 
    <a href="#" data-num='${i}'  data-action ='del'>삭제</a>
    </p> `;

    ul += `</li>`;
  }
  ul += `</ul>`;

  document.querySelector(".list").innerHTML = ul;
}
function search() {}
function view() {}

document.querySelector("#btn").addEventListener("click", function (e) {
  let company = document.querySelector("#company").value;
  let name = document.querySelector("#name").value;
  let tel = document.querySelector("#tel").value;
  let addr = document.querySelector("#addr").value;
  let email = document.querySelector("#email").value;

  if (e.target.dataset.flag == "0") {
    member.push([]);
    let index = member.length;
    member[index - 1][0] = company;
    member[index - 1][1] = name;
    member[index - 1][2] = tel;
    member[index - 1][3] = addr;
    member[index - 1][4] = email;
    list();
  } else {
    let index = parseInt(document.querySelector("#seq").value);
    member[index][0] = company;
    member[index][1] = name;
    member[index][2] = tel;
    member[index][3] = addr;
    member[index][4] = email;
    document.querySelector("#btn").dataset.flag = "0";
    document.querySelector("#btn").innerText = "저장";
    list();
  }
});
document.querySelector(".list").addEventListener("click", function (e) {
  // console.log(e);
  let seq = e.target.dataset.num;
  let action = e.target.dataset.action;
  console.log(`${seq} ${action}`);
  document.querySelector("#seq").value = seq;
  if (action == "view") {
    document.querySelector("#company").value = member[seq][0];
    document.querySelector("#name").value = member[seq][1];
    document.querySelector("#tel").value = member[seq][2];
    document.querySelector("#addr").value = member[seq][3];
    document.querySelector("#email").value = member[seq][4];
  } else if (action == "edit") {
    document.querySelector("#company").value = member[seq][0];
    document.querySelector("#name").value = member[seq][1];
    document.querySelector("#tel").value = member[seq][2];
    document.querySelector("#addr").value = member[seq][3];
    document.querySelector("#email").value = member[seq][4];
    document.querySelector("#btn").innerText = "수정";
    document.querySelector("#btn").dataset.flag = "1";
  } else if (action == "del") {
    if (confirm("삭제하시겠습니까?")) {
      member.splice(seq, 1);
    }
    list();
  }
});
