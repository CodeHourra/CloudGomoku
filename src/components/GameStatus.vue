<script setup>
defineProps({
  isWaiting: Boolean,
  winner: String,
  playerColor: String,
  isMyTurn: Boolean
});

const emit = defineEmits(['reset']);
</script>

<template>
  <div class="game-status">
    <div v-if="isWaiting" class="waiting-message">
      等待对手加入...
    </div>
    <template v-else>
      <div v-if="winner" class="winner-message">
        {{ winner === playerColor ? '你赢了！' : '对手赢了！' }}
        <button @click="emit('reset')" class="reset-button">重新开始</button>
      </div>
      <div class="game-info">
        <div>你的颜色: {{ playerColor === 'black' ? '黑方' : '白方' }}</div>
        <div class="current-player">
          {{ isMyTurn ? '轮到你下棋' : '等待对手下棋' }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.game-status {
  margin-bottom: 20px;
  text-align: center;
}

.waiting-message {
  font-size: 1.2em;
  color: #666;
  padding: 20px;
}

.winner-message {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.reset-button {
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #3aa876;
}

.game-info {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.current-player {
  font-weight: bold;
  color: #2c3e50;
}
</style> 