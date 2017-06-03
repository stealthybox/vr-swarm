<template lang='pug'>
  a-scene
    a-sky(
    color='#5C4CFF'
    )
    a-entity(
    v-for='(cloudpos, index) in cloudpositions'
    :key='index'
    :position='cloudpos'
    :rotation='`0 ${index*360/cloudpositions.length} 0`'
    )
      a-sphere(
      :radius='(index/cloudpositions.length)+0.1'
      )
      a-sphere(
      position='0 0 -1'
      )
      a-sphere(
      position='-1 0 0'
      )
      a-sphere(
      position='-.5 .5 0'
      )
    a-plane(
    position='0 0 -4'
    rotation='-90 0 0'
    color='#3F9922'
    width=200
    height=200
    )
    a-circle(
    position='0 .01 -4'
    rotation='-90 0 0'
    color='grey'
    :radius='nodes.length*2 + 2'
    )
    a-entity(
    v-for='(node, index) in nodes'
    :key='node.ID'
    :position='(index+0.5-nodes.length/2)*2 + " .1 -4"'
    rotation='0 -33 0'
    )
      a-plane(
      rotation='-90 0 0'
      color='#333'
      )
      a-text(
      :value='node.Description.Hostname'
      position='-0.5 0 0'
      rotation='-90 0 0'
      color='#FF3F6A'
      side='double'
      )
      a-entity(
      v-for='(task, index) in tasks.filter(t => t.DesiredState !== "shutdown" && t.NodeID === node.ID)'
      :key='task.ID'
      :position='"0 " + (index*1.5 + 1) + " 0"'
      )
        a-box(
        color='#3A9BE8'
        )
        a-text(
        :value='services.find( s => s.ID === task.ServiceID ).Spec.Name'
        position='-.7 0 .5'
        color='#eee'
        side='double'
        )
</template>

<script>
  import aframe from 'aframe'

  export default {
    data: () => ({
      cloudpositions: [...Array(200)].map( cloud =>
        `${Math.random()*200-100} ${Math.random()*40+20} ${Math.random()*200-100}`
      ),
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
            (a,b) =>  a.Description.Hostname < b.Description.Hostname
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
      this.getNodes()
      this.getServices()
      this.getTasks()
      this.nodeFetcher = setInterval(
        this.getNodes, 1000
      )
      this.serviceFetcher = setInterval(
        this.getServices, 1000
      )
      this.taskFetcher = setInterval(
        this.getTasks, 1000
      )
    },
    destroy () {
      clearInterval( this.nodeFetcher )
      clearInterval( this.serviceFetcher )
      clearInterval( this.taskFetcher )
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  a-scene {
    height: 56px;
    width: 80px;
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
