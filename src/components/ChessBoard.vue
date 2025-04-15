<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import GameStatus from './GameStatus.vue';
import BoardCell from './BoardCell.vue';

// 初始化WebSocket连接
const ws = ref(null);
const roomId = ref(null);
const playerColor = ref(null);
const isMyTurn = ref(false);
const isWaiting = ref(true);
const connectionStatus = ref('connecting'); // 'connecting', 'connected', 'disconnected'
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectTimeout = ref(null);
const heartbeatInterval = ref(null);

// 初始化棋盘状态
const board = ref(Array(15).fill(null).map(() => Array(15).fill(null)));
const currentPlayer = ref('black'); // 黑方先手
const winner = ref(null);

// 发送心跳包
const sendHeartbeat = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({ type: 'ping' }));
  }
};

// 连接WebSocket服务器
const connectWebSocket = () => {
  if (ws.value) {
    ws.value.close();
  }

  connectionStatus.value = 'connecting';
  ws.value = new WebSocket(`ws://${window.location.hostname}:3000`);

  ws.value.onopen = () => {
    console.log('WebSocket连接已建立');
    connectionStatus.value = 'connected';
    reconnectAttempts.value = 0;
    
    // 启动心跳检测
    heartbeatInterval.value = setInterval(sendHeartbeat, 30000);
  };

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'pong':
        // 收到心跳响应，连接正常
        break;
        
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
    console.log('WebSocket连接已关闭');
    connectionStatus.value = 'disconnected';
    clearInterval(heartbeatInterval.value);
    
    // 尝试重连
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000);
      console.log(`将在 ${delay/1000} 秒后尝试重连 (第 ${reconnectAttempts.value} 次)`);
      
      reconnectTimeout.value = setTimeout(() => {
        connectWebSocket();
      }, delay);
    } else {
      alert('无法连接到服务器，请刷新页面重试');
    }
  };

  ws.value.onerror = (error) => {
    console.error('WebSocket错误:', error);
  };
};

// 落子
const placePiece = (row, col) => {
  if (!isMyTurn.value || board.value[row][col] || winner.value) return;
  
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      type: 'move',
      roomId: roomId.value,
      row,
      col
    }));
  } else {
    alert('连接已断开，请等待重连...');
  }
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
  clearInterval(heartbeatInterval.value);
  clearTimeout(reconnectTimeout.value);
});
</script>

<template>
  <div class="chess-board">
    <div class="connection-status" :class="connectionStatus">
      {{ 
        connectionStatus === 'connecting' ? '正在连接...' :
        connectionStatus === 'connected' ? '已连接' :
        '连接已断开，正在重连...'
      }}
    </div>
    
    <GameStatus
      :is-waiting="isWaiting"
      :winner="winner"
      :player-color="playerColor"
      :is-my-turn="isMyTurn"
      @reset="resetGame"
    />
    
    <div v-if="!isWaiting" class="board-container">
      <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
        <BoardCell
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :cell="cell"
          :row="rowIndex"
          :col="colIndex"
          @place-piece="placePiece"
        />
      </div>
    </div>
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

.connection-status {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8em;
}

.connection-status.connecting {
  background-color: #f0ad4e;
  color: white;
}

.connection-status.connected {
  background-color: #5cb85c;
  color: white;
}

.connection-status.disconnected {
  background-color: #d9534f;
  color: white;
}

.board-container {
  display: flex;
  flex-direction: column;
}

.board-row {
  display: flex;
}
</style>