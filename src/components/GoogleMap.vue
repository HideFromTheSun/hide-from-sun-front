<template>
    <div ref="mapDiv" :id ="id" class="google-map"></div>    
</template>

<script>
export default {
    
    props: ["id"],

    mounted(){
        this.$store.commit('initMap', this.$refs.mapDiv);
        this.$store.commit('geolocate');
    }

}
</script>

<style scoped>
.google-map {
    /* position: absolute;
    height: 70%;
    width: 100%;
    margin: 0 auto; */
    position: absolute;
    float: left;
    width: 70%;
    height: 100%;
    background: gray;
    /* overflow: auto; */
}
</style>
