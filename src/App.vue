<template>
  <div id="app">
    <google-map id="simpleMap"/>
    <side-panell id="sidePanell"/>
  </div>
</template>

<script>
import GoogleMap from './components/GoogleMap.vue'
import SidePanell from './components/SidePanell.vue'

export default {
  name: 'app',
  components: {
    GoogleMap,
    SidePanell
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  /* -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50; */
}
</style>
