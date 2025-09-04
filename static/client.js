const socket = io("http://192.168.1.100:5000");

const userScoreSpan = document.querySelector("#user-score");
const computerScoreSpan = document.querySelector("#computer-score");
const resultDiv = document.querySelector(".result > p");

const rockDiv = document.querySelector("#r");
const paperDiv = document.querySelector("#p");
const scissorsDiv = document.querySelector("#s");

let userScore = 0;
let computerScore = 0;
let myRole = null;

// Gán vai trò khi server thông báo
socket.on('assign_role', (data) => {
  myRole = data.role;
  console.log("Vai trò của bạn:", myRole);
});

function setChoicesEnabled(enabled) {
  rockDiv.style.pointerEvents = enabled ? "auto" : "none";
  paperDiv.style.pointerEvents = enabled ? "auto" : "none";
  scissorsDiv.style.pointerEvents = enabled ? "auto" : "none";
}

// Khi đang chờ người chơi
socket.on('waiting', (data) => {
  document.getElementById("status").textContent = data.msg;
  setChoicesEnabled(false);
});

// Khi đã ghép cặp thành công
socket.on('start', (data) => {
  document.getElementById("status").textContent = data.msg;
  setChoicesEnabled(true);
});

// Khi đối thủ rời phòng
socket.on('player_left', (data) => {
  alert(data.msg);
  document.getElementById("status").textContent = "Đối thủ đã rời game. Đang chờ người mới...";
  setChoicesEnabled(false);
  userScore = 0;
  computerScore = 0;
  userScoreSpan.textContent = userScore;
  computerScoreSpan.textContent = computerScore;
});

// Gửi lựa chọn
function main() {
  rockDiv.addEventListener("click", () => sendChoice("r"));
  paperDiv.addEventListener("click", () => sendChoice("p"));
  scissorsDiv.addEventListener("click", () => sendChoice("s"));
}

main();

function sendChoice(choice) {
  socket.emit('player_choice', { choice: choice });
}

// Nhận kết quả từ server
socket.on('round_result', (data) => {
  let myChoice, opponentChoice;

  if (myRole === 'player1') {
    myChoice = convertKeyWords(data.p1_choice);
    opponentChoice = convertKeyWords(data.p2_choice);
  } else {
    myChoice = convertKeyWords(data.p2_choice);
    opponentChoice = convertKeyWords(data.p1_choice);
  }

  if (data.winner === myRole) {
    userScore++;
    resultDiv.innerHTML = `🔥 ${myChoice} VS ${opponentChoice} - Bạn Thắng! 🎉`;
  } else if (data.winner === "draw") {
    resultDiv.innerHTML = `🤝 ${myChoice} VS ${opponentChoice} - Hòa!`;
  } else {
    computerScore++;
    resultDiv.innerHTML = `😢 ${myChoice} VS ${opponentChoice} - Đối thủ Thắng!`;
  }

  userScoreSpan.textContent = userScore;
  computerScoreSpan.textContent = computerScore;
});

function convertKeyWords(letter) {
  if (letter === "r") return "Búa ✊";
  if (letter === "p") return "Bao 🖐️";
  return "Kéo ✌️";
}
