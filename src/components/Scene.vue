<template lang='pug'>
  a-scene
    a-sky(
      color='midnightblue'
    )
    a-plane(
      position='0 0 -4'
      rotation='-90 0 0'
      color='grey'
      width=10
      height=10
    )
    a-entity(
      v-for='(service, index) in services'
      :position='(index+0.5-services.length/2)*2 + " .1 -4"'
    )
      a-plane(
        position='0 0 0'
        rotation='-90 0 0'
      )
      a-entity(position='0 1 0')
        a-box(
          rotation='0 45 0'
          color='indigo'
        )
        a-text(
          position='-.8 0 0'
          :value='service.Spec.Name'
          rotation='0 -45 0'
          color='yellow'
          side='double'
        )
</template>

<script>
  import aframe from 'aframe'

  export default {
    data: () => ({
      nodes: [],
      services: [],
      tasks: [],
      nodeFetcher: null,
      serviceFetcher: null,
      taskFetcher: null,
    }),
    computed: {
      vrNodes () {
        return nodes.map( node => ({}))
      }
    },
    methods: {
      getNodes() {
        return fetch( 'docker/nodes' )
        .then( response => response.json() )
        .then( nodes =>
          this.nodes = nodes.sort(
            (a,b) =>  a.Spec.Name < b.Spec.Name
          )
        )
      },
      getServices() {
        return fetch( 'docker/services' )
        .then( response => response.json() )
        .then( services =>
          this.services = services.sort(
            (a,b) =>  a.Spec.Name < b.Spec.Name
          )
        )
      },
      getTasks() {
        return fetch( 'docker/tasks' )
        .then( response => response.json() )
        .then( tasks =>
          this.tasks = tasks.sort(
            (a,b) =>  a.ServiceID < b.ServiceID
          )
        )
      },
    },
    created () {
      let getAll = () => Promise.All([
        this.getNodes(),
        this.getServices(),
        this.getTasks(),
      ])
      getAll()
      this.serviceFetcher = setInterval(
        getAll, 1000
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
