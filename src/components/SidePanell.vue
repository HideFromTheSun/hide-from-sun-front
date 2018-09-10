<template>
    <div :id="id" class=sidePanell>
        <div class="inputContainer">
            <map-autocomplete id="originInput" placeholder="Start typing" v-on:placechanged="setOrigin"/>
        </div>
        <div class="inputContainer">
            <map-autocomplete id="destInput" placeholder="Start typing" v-on:placechanged="setDestination"/>
        <button v-on:click="searchRoute">Search</button>
        </div>
<div ref="directionsPanel" class="directionsPanel"></div>
</div>
</template>

<script>
import VueGoogleAutocomplete from 'vue-google-autocomplete'
import MapAutocomplete from './MapAutocomplete.vue'

export default {
    components: {
        VueGoogleAutocomplete,
        MapAutocomplete
    },
    props: ["id"],

    mounted(){
        this.initPanel();
    },

    methods: {
        setOrigin(place){
            this.$store.commit('setOrigin', place);
        },
        setDestination(place){
            this.$store.commit('setDestination', place);
            this.$store.commit('searchRoute');
        },
        searchRoute(){
            this.$store.commit('searchRoute');
        },
        initPanel(){
            this.$store.commit('initPanel', this.$refs.directionsPanel);
        }
    }
}
</script>

<style>
.sidePanell {
    float:right;
    width:30%;
    height:100%;
}
.inputContainer {   
    margin: 3%;
}
.directionsPanel{
    float: right;
    width: 100%;
    height: auto;
    /* overflow-y: scroll; */
}
</style>
