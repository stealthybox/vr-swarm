<template lang='pug'>
  a-scene
    a-camera
      a-entity(
        cursor='fuse: true;'
        raycaster='far: 20; objects: .clickable'
        position='0 0 -1'
        geometry='primitive: ring; radiusInner: 0.02; radiusOuter: 0.03'
        material='color: white; shader: flat'
      )
        a-animation(
          begin='click'
          easing='ease-in'
          attribute='scale'
          dur='150'
          fill='forwards'
          from='0.1 0.1 0.1'
          to='1 1 1'
        )
        a-animation(
          begin='cursor-fusing'
          easing='ease-in'
          attribute='scale'
          dur='1500'
          fill='backwards'
          from='1 1 1' to='0.1 0.1 0.1'
        )
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
      v-for='(node, index) in nodes'
      :position='(index+0.5-nodes.length/2)*2 + " .1 -4"'
      rotation='0 -33 0'
    )
      a-plane(
        rotation='-90 0 0'
      )
      a-text(
        :value='node.Description.Hostname'
        position='-0.5 0 0'
        rotation='-90 0 0'
        color='black'
        side='double'
        )
      a-entity.clickable(
      v-for='(task, index) in tasks.filter(t => t.DesiredState !== "shutdown" && t.NodeID === node.ID)'
      :key='task.ID'
      :position='`0 ${index*1.5 + 1.6} 0`'
      @click='setSelectedService(task.ServiceID, task.ID)'
      )
        a-box(
        color='indigo'
        @mouseenter='setServiceColor(task.ServiceID ,"#444444", $event)'
        )
        a-text(
          :value='services.find( s => s.ID === task.ServiceID ).Spec.Name'
          position='-.7 0 .5'
          color='yellow'
          side='double'
        )
    a-box(
    rotation='0 0 0'
    position='-5 5.5 -10'
    color='#333'
    width=6
    height=12
    )
      a-text(
      :value='log'
      position='-2.4 4.4 0.5'
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
      decoder: new TextDecoder(),
      log: 'test',
      logReader: null,
      selectedService: null,
      serviceColors: {},
      selectedNetwork: null,
    }),
    computed: {
      vrNodes () {
        return this.nodes.map( node => ({}) )
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
      getLogs(serviceId) {
        // this.log = 'reset'
        return fetch(`/docker/services/${serviceId}/logs?stdout=true&stderr=true&follow=true`)
        .then( response => {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          // const setLog = val => { this.logs = val }
          const processLogs = (stream) => {
            if (stream.done) {
              return this.log
            } else {
              let text = decoder.decode(stream.value, {stream:true})
              let lines = text
                .split('\n')
                .map( s => s.substring(38) )
                .join('\n')
              console.log('hi')
              this.log = lines
              return reader.read()
              .then( processLogs )
            }
          }
          return reader.read()
          .then( processLogs )
        })
      },
      fetchLogStream(serviceId) {
        // this.log = 'reset'
        fetch(`/docker/services/${serviceId}/logs?stdout=true&stderr=true&follow=true`)
        .then( response => {
          this.logReader = response.body.getReader()
          // const setLog = val => { this.logs = val }
          console.log('START READER', this.logReader)
          return this.logReader.read()
        })
        .then( this.processLogs )
      },
      processLogs(logData) {
        console.log('call', logData)
        if (logData.done) {
          console.log('END', logData)
          return this.log
        } else {
          console.log('logDataValue', logData)
          let text = this.decoder.decode(logData.value, {stream:true})
          let lines = text
            .split('\n')
            .map( s => s.substring(38) )
            .join('\n')
          this.log += '\n'+ lines
          return this.logReader.read()
          .then( this.processLogs )
        }
      },
      setSelectedService(serviceId, taskId) {
        console.log('set service:', serviceId, 'from task:', taskId )
        this.selectedService = serviceId
        console.log('BEFORE', this.logReader)
        this.logReader && this.logReader.cancel()
        console.log('CANCEL', this.logReader)
        this.fetchLogStream( serviceId )
        console.log('AFTER', this.logReader)
        return serviceId
      },
      setSelectedNetwork(networkId) {
        console.log('set network:', networkId)
        this.selectedNetwork = networkId
        return networkId
      },
      setServiceColor(serviceId, color, e) {
        this.serviceColors[serviceId] = color
        console.log(serviceId, color, e.target)
      },
      getColor(serviceId) {
        console.log(serviceId, this.serviceColors[serviceId])
        return `hsl(197, 100%, ${this.selectedService === serviceId ? 20:60}%)`
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
