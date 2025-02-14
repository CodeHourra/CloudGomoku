<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 初始化WebSocket连接
const ws = ref(null);
const roomId = ref(null);
const playerColor = ref(null);
const isMyTurn = ref(false);
const isWaiting = ref(true);

// 初始化棋盘状态
const board = ref(Array(15).fill(null).map(() => Array(15).fill(null)));
const currentPlayer = ref('black'); // 黑方先手
const winner = ref(null);

// 连接WebSocket服务器
const connectWebSocket = () => {
  ws.value = new WebSocket(`ws://${window.location.hostname}:3000`);

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'waiting':
        isWaiting.value = true;
        break;
      
      case 'gameStart':
        isWaiting.value = false;
        roomId.value = data.roomId;
        playerColor.value = data.color;
        isMyTurn.value = data.color === 'black';
        break;
      
      case 'move':
        board.value[data.row][data.col] = { color: data.color };
        currentPlayer.value = data.color === 'black' ? 'white' : 'black';
        isMyTurn.value = currentPlayer.value === playerColor.value;
        checkWin(data.row, data.col);
        break;
      
      case 'opponentLeft':
        alert('对手已离开游戏');
        resetGame();
        break;
    }
  };

  ws.value.onclose = () => {
    alert('与服务器的连接已断开');
    resetGame();
  };
};

// 落子
const placePiece = (row, col) => {
  if (!isMyTurn.value || board.value[row][col] || winner.value) return;
  
  ws.value.send(JSON.stringify({
    type: 'move',
    roomId: roomId.value,
    row,
    col
  }));
};

// 检查是否获胜
const checkWin = (row, col) => {
  const directions = [
    [1, 0],   // 垂直
    [0, 1],   // 水平
    [1, 1],   // 右下斜
    [1, -1]   // 左下斜
  ];
  
  const color = board.value[row][col].color;
  
  const hasWon = directions.some(([dx, dy]) => {
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        !board.value[newRow][newCol] ||
        board.value[newRow][newCol].color !== color
      ) break;
      
      count++;
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        !board.value[newRow][newCol] ||
        board.value[newRow][newCol].color !== color
      ) break;
      
      count++;
    }
    
    return count >= 5;
  });

  if (hasWon) {
    winner.value = color;
  }
};

// 重新开始游戏
const resetGame = () => {
  board.value = Array(15).fill(null).map(() => Array(15).fill(null));
  currentPlayer.value = 'black';
  winner.value = null;
  roomId.value = null;
  playerColor.value = null;
  isMyTurn.value = false;
  isWaiting.value = true;
  
  // 重新连接WebSocket
  if (ws.value) {
    ws.value.close();
  }
  connectWebSocket();
};

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>

<template>
  <div class="chess-board">
    <div v-if="isWaiting" class="waiting-message">
      等待对手加入...
    </div>
    <template v-else>
      <div v-if="winner" class="winner-message">
        {{ winner === playerColor ? '你赢了！' : '对手赢了！' }}
        <button @click="resetGame" class="reset-button">重新开始</button>
      </div>
      <div class="game-info">
        <div>你的颜色: {{ playerColor === 'black' ? '黑方' : '白方' }}</div>
        <div class="current-player">
          {{ isMyTurn ? '轮到你下棋' : '等待对手下棋' }}
        </div>
      </div>
      <div class="board-container">
        <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="board-cell"
            @click="placePiece(rowIndex, colIndex)"
          >
            <div v-if="cell" class="chess-piece" :class="cell.color"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chess-board {
  display: flex;
  flex-direction: column;
  border: 2px solid #8b4513;
  width: fit-content;
  margin: 20px auto;
  background-color: #deb887;
  position: relative;
  padding: 20px;
}

.board-row {
  display: flex;
}

.board-cell {
  width: min(4vw, 40px);
  height: min(4vw, 40px);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: crosshair;
}

.board-cell::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #8b4513;
  top: 50%;
  transform: translateY(-50%);
}

.board-cell::after {
  content: '';
  position: absolute;
  height: 100%;
  width: 1px;
  background-color: #8b4513;
  left: 50%;
  transform: translateX(-50%);
}

.chess-piece {
  width: min(3.5vw, 35px);
  height: min(3.5vw, 35px);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: min(2.4vw, 24px);
  border: 2px solid #8b4513;
  background-color: #f4d03f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  z-index: 1;
  animation: dropIn 0.3s ease-out;
  transition: transform 0.2s ease;
}

.chess-piece:hover {
  transform: scale(1.1);
}

@keyframes dropIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.winner .chess-piece {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.board-cell {
  width: min(4vw, 40px);
  height: min(4vw, 40px);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.red {
  background-color: #ff6b6b;
  color: #fff;
}

.black {
  background-color: #2f3542;
  color: #fff;
}

.selected {
  background-color: rgba(255, 255, 0, 0.3);
}

.valid-move {
  background-color: rgba(0, 255, 0, 0.2);
}

.waiting-message {
  font-size: 1.5em;
  color: #666;
  margin: 20px 0;
}

.game-info {
  margin-bottom: 20px;
  font-size: 1.2em;
  color: #333;
}

.winner-message {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.reset-button {
  margin-top: 10px;
  padding: 8px 16px;
  font-size: 1em;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-button:hover {
  background-color: #3aa876;
}
</style>