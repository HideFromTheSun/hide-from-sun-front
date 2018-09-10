<template>
    <input ref="input" 
        :id="id" 
        :placeholder="placeholder"
    />
</template>

<script>
export default {
    
    data(){
        return{
            autocomplete: null,
        }
    },

    props: ["id", "placeholder"],

    mounted(){
        if (typeof (google.maps.places.Autocomplete) !== 'function') {
            throw new Error('google.maps.places.Autocomplete is undefined. Did you add \'places\' to libraries when loading Google Maps?')
        }
        this.autocomplete = new google.maps.places.Autocomplete(this.$refs.input, {})
        this.autocomplete.addListener('place_changed', this.onPlaceChanged);
    },

    methods: {
        onPlaceChanged() {
                let place = this.autocomplete.getPlace();
                if (!place.geometry) {
                  // User entered the name of a Place that was not suggested and
                  // pressed the Enter key, or the Place Details request failed.
                  this.$emit('no-results-found', place);
                  return;
                }
                if (place.address_components !== undefined) {
                    // return returnData object and PlaceResult object
                    this.$emit('placechanged', place);
                    // update autocompleteText then emit change event
                    // this.autocompleteText = this.$refs.input.value
                    // this.onChange()
                }
            },
    }
}
</script>
