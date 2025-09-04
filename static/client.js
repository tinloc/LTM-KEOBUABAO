const socket = io("http://192.168.1.100:5000"); 

const userScoreSpan = document.querySelector("#user-score");
const computerScoreSpan = document.querySelector("#computer-score");
const resultDiv = document.querySelector(".result > p");

const rockDiv = document.querySelector("#r");
const paperDiv = document.querySelector("#p");
const scissorsDiv = document.querySelector("#s");

let userScore = 0;
let computerScore = 0;

// Hiển thị trạng thái ghép cặp
socket.on('waiting', (data) => {
  document.getElementById("status").textContent = data.msg;
});

socket.on('start', (data) => {
  document.getElementById("status").textContent = data.msg;
});

// Gửi sự kiện khi người chơi chọn
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
  const user = convertKeyWords(data.p1_choice);
  const computer = convertKeyWords(data.p2_choice);

  if (data.winner === 'player1') {
    userScore++;
    resultDiv.innerHTML = `🔥 ${user} VS ${computer} - Bạn Thắng! 🎉`;
  } else if (data.winner === 'player2') {
    computerScore++;
    resultDiv.innerHTML = `😢 ${user} VS ${computer} - Máy Thắng!`;
  } else {
    resultDiv.innerHTML = `🤝 ${user} VS ${computer} - Hòa!`;
  }

  userScoreSpan.textContent = userScore;
  computerScoreSpan.textContent = computerScore;
});

function convertKeyWords(letter) {
  if (letter === "r") return "Búa ✊";
  if (letter === "p") return "Bao 🖐️";
  return "Kéo ✌️";
}
