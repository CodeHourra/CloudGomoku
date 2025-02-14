<script setup>
import ChessBoard from './components/ChessBoard.vue'
</script>

<template>
  <div class="container">
    <h1>五子棋</h1>
    <ChessBoard />
  </div>
</template>

<style scoped>
.container {
  max-width: 90vw;
  margin: 0 auto;
  padding: 2vh;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
