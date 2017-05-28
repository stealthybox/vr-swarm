<template lang='pug'>
  a-scene
    a-sky(
      color='midnightblue'
    )
    a-circle(
      position='0 0 -4'
      rotation='-90 0 0'
      color='grey'
      radius=30
    )
    a-box(
      v-for='(service, index) in services'
      :key='service.ID'
      :position='(index+0.5-services.length/2)*2 + " 2 -4"'
      rotation='0 45 0'
      color='blue'
    )
    a-text(
      v-for='(service, index) in services'
      :key='service.ID'
      :value='service.Spec.Name'
      :position='(index+0.1-services.length/2)*2 + " 2 -4"'
      rotation='0 -45 0'
      color='white'
    )
</template>

<script>
  import aframe from 'aframe'

  export default {
    data: () => ({
      services: [],
      serviceFetcher: null
    }),
    methods: {
      getServices() {
        fetch( 'docker/services' )
        .then( response => response.json() )
        .then( services =>
          this.services = services.sort(
            (a,b) =>  a.Spec.Name < b.Spec.Name
          )
        )
      }
    },
    created () {
      this.getServices()
      this.serviceFetcher = setInterval(
        this.getServices, 1000
      )
    },
    destroy () {
      clearInterval( this.serviceFetcher )
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  a-scene {
    height: 800px;
    width: 1024px;
  }
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
