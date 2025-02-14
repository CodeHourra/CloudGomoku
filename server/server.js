import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

// 存储游戏房间
const rooms = new Map();

// 等待配对的玩家
let waitingPlayer = null;

wss.on('connection', (ws) => {
  console.log('新玩家连接');

  // 为玩家生成唯一ID
  ws.playerId = Math.random().toString(36).substring(7);

  // 如果有等待的玩家，创建新房间
  if (waitingPlayer) {
    const roomId = Math.random().toString(36).substring(7);
    const room = {
      players: [waitingPlayer, ws],
      currentPlayer: waitingPlayer,
      board: Array(15).fill(null).map(() => Array(15).fill(null))
    };

    rooms.set(roomId, room);

    // 通知两个玩家游戏开始
    waitingPlayer.send(JSON.stringify({
      type: 'gameStart',
      roomId,
      color: 'black',
      opponentId: ws.playerId
    }));

    ws.send(JSON.stringify({
      type: 'gameStart',
      roomId,
      color: 'white',
      opponentId: waitingPlayer.playerId
    }));

    waitingPlayer = null;
  } else {
    waitingPlayer = ws;
    ws.send(JSON.stringify({ type: 'waiting' }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'move') {
        const room = rooms.get(data.roomId);
        if (!room) return;

        // 验证是否轮到该玩家
        if (room.currentPlayer !== ws) return;

        // 更新棋盘状态
        room.board[data.row][data.col] = {
          color: room.players[0] === ws ? 'black' : 'white'
        };

        // 广播移动信息给两个玩家
        room.players.forEach(player => {
          player.send(JSON.stringify({
            type: 'move',
            row: data.row,
            col: data.col,
            color: room.players[0] === ws ? 'black' : 'white'
          }));
        });

        // 切换当前玩家
        room.currentPlayer = room.players.find(p => p !== ws);
      }
    } catch (error) {
      console.error('处理消息时出错:', error);
    }
  });

  ws.on('close', () => {
    console.log('玩家断开连接');
    
    // 如果是等待的玩家断开连接
    if (waitingPlayer === ws) {
      waitingPlayer = null;
      return;
    }

    // 查找并通知对手
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.includes(ws)) {
        const opponent = room.players.find(p => p !== ws);
        if (opponent) {
          opponent.send(JSON.stringify({ type: 'opponentLeft' }));
        }
        rooms.delete(roomId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket服务器运行在端口 ${PORT}`);
});