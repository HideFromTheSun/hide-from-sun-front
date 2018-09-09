<template>
    <div :id="id" class=sidePanell>
        <div class="inputContainer">
            <vue-google-autocomplete 
                id="originInput" 
                classname="form-control" 
                placeholder="Start typing"
                v-on:placechanged="setOrigin"/>
        </div>
        <div class="inputContainer">
            <vue-google-autocomplete 
                id="destInput" 
                classname="form-control" 
                placeholder="Start typing"
                v-on:placechanged="setDestination"/>
        <button v-on:click="searchRoute">Search</button>
        </div>
<div ref="directionsPanel" class="directionsPanel"></div>
</div>
</template>

<script>
import VueGoogleAutocomplete from 'vue-google-autocomplete'

export default {
    components: {
        VueGoogleAutocomplete
    },
    props: ["id"],

    mounted(){
        this.initPanel();
    },

    methods: {
        setOrigin(addressData, placeResultData){
            this.$store.commit('setOrigin', {addressData, placeResultData});
        },
        setDestination(addressData, placeResultData){
            this.$store.commit('setDestination', {addressData, placeResultData});
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
