<script setup>
import ChessPiece from './ChessPiece.vue';

defineProps({
  cell: {
    type: Object,
    default: null
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  isLastMove: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['place-piece']);
</script>

<template>
  <div 
    class="board-cell"
    :class="{ 'last-move': isLastMove }"
    @click="emit('place-piece', row, col)"
  >
    <ChessPiece v-if="cell" :color="cell.color" />
  </div>
</template>

<style scoped>
.board-cell {
  width: min(4vw, 40px);
  height: min(4vw, 40px);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: crosshair;
}

.board-cell:hover {
  background-color: rgba(139, 69, 19, 0.1);
}

.board-cell.last-move .chess-piece {
  animation: blink 0.8s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
    transform: scale(1.1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
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
</style> 