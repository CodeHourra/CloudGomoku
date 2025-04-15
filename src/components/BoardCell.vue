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
  }
});

const emit = defineEmits(['place-piece']);
</script>

<template>
  <div 
    class="board-cell"
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