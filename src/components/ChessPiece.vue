<script setup>
defineProps({
  color: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="chess-piece" :class="color"></div>
</template>

<style scoped>
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

.chess-piece.black {
  background-color: #2c3e50;
  color: white;
}

.chess-piece.white {
  background-color: #ecf0f1;
  color: #2c3e50;
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
</style> 