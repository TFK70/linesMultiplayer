const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const randomize = (from, to) => {
  return Math.floor(Math.random() * (to - from) + from);
};

const PORT = 4000;

const app = express();
const httpServer = http.createServer(app);

const io = socketIo(httpServer);

app.use(express.static("../"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

//
let playground = [];
let size = 50;
let currentX = 0;
let currentY = 0;
let currentX2;
let currentY2;
let currentDirectionP1 = "right";
let currentDirectionP2 = "left";
let player1_score = 0;
let player2_score = 0;

const fillMatrix = () => {
  for (let i = 0; i < size; i++) {
    playground.push([]);
  }
};

const resetPlayground = () => {
  for (let i = 0; i < playground.length; i++) {
    for (let j = 0; j < size; j++) {
      playground[i][j] = 0;
    }
  }
};

const tickPlayer1 = () => {
    playground[currentY][currentX] = 1;

    if (currentDirectionP1 == "right") {
      currentX++;
    }

    if (currentDirectionP1 == "left") {
      currentX--;
    }

    if (currentDirectionP1 == "down") {
      currentY++;
    }

    if (currentDirectionP1 == "up") {
      currentY--;
    }

    if (currentX > playground[0].length - 1) {
      currentX = 0;
    } else if (currentY > playground.length - 1) {
      currentY = 0;
    } else if (currentX < 0) {
      currentX = playground[0].length - 1;
    } else if (currentY < 0) {
      currentY = playground.length - 1;
    }

    if (playground[currentY][currentX]!==0) {
      currentY = 0;
      currentX = 0;
      player2_score++;
      resetPlayground();
    }

    playground[currentY][currentX] = 1;
}

const tickPlayer2 = () => {
    playground[currentY2][currentX2] = 2;

    if (currentDirectionP2 == "right") {
      currentX2++;
    }

    if (currentDirectionP2 == "left") {
      currentX2--;
    }

    if (currentDirectionP2 == "down") {
      currentY2++;
    }

    if (currentDirectionP2 == "up") {
      currentY2--;
    }

    if (currentX2 > playground[0].length - 1) {
      currentX2 = 0;
    } else if (currentY2 > playground.length - 1) {
      currentY2 = 0;
    } else if (currentX2 < 0) {
      currentX2 = playground[0].length - 1;
    } else if (currentY2 < 0) {
      currentY2 = playground.length - 1;
    }

    if (playground[currentY2][currentX2]!==0) {
      currentY2 = playground.length - 1;
      currentX2 = playground[0].length - 1;
      player1_score++;
      resetPlayground();
    }

    playground[currentY2][currentX2] = 2;
}

fillMatrix();
resetPlayground();
currentY2 = playground.length - 1;
currentX2 = playground[0].length - 1;
//

io.on("connection", (socket) => {
  console.log("Player connected");

  const tick = () => {
    tickPlayer1();
    tickPlayer2();

    socket.broadcast.emit("renderGround", playground, player1_score, player2_score);
    socket.emit("renderGround", playground, player1_score, player2_score);
  };

  setInterval(tick, 100);

  socket.on("setPlayer", (playerNumber) => {
    socket.broadcast.emit("updatePlayer", playerNumber);
  });

  socket.on("arrowPressed", (key, player) => {
      player===1 ? currentDirectionP1 = key : currentDirectionP2 = key;
  })

  socket.on("disconnect", () => {
    console.log("Player disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
