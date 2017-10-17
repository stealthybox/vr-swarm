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
    color='#5C4CFF'
    )
    a-sphere(
    position='40 30 -40'
    radius='10'
    color='yellow'
    )
    a-plane(
    position='-10 -10 -30'
    rotation='0 0 -40'
    color='#440044'
    width=60
    height=60
    )
    a-plane(
    position='10 -10 -40'
    rotation='0 0 -40'
    color='#440044'
    width=60
    height=60
    )
    a-entity(
    v-for='(cloudpos, index) in cloudpositions'
    :key='index'
    :position='cloudpos'
    :rotation='`0 ${index*360/cloudpositions.length} 0`'
    )
      a-sphere(
      :radius='(index/cloudpositions.length)*1.5+0.1'
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
    :position='(index+0.5-nodes.length/2)*2 + " .5a -4"'
    rotation='0 -33 0'
    )
      a-box(
      rotation='-30 0 0'
      color='#333'
      width=1.2
      height=1.2
      )
        a-text(
        :value='node.Description.Hostname'
        position='-0.5 0 0.5'
        color='#FF3F6A'
        side='double'
        )
      a-entity.clickable(
      v-for='(task, index) in tasks.filter(t => t.DesiredState !== "shutdown" && t.NodeID === node.ID)'
      :key='task.ID'
      :position='`0 ${index*1.5 + 1.6} 0`'
      @click='setSelectedService(task.ServiceID, task.ID)'
      )
        a-box(
        :color='getColor(task.serviceID)'
        @mouseenter='setServiceColor(task.ServiceID ,"#444444", $event)'
        )
        a-text(
        :value='services.find( s => s.ID === task.ServiceID ).Spec.Name'
        position='-.7 0 .5'
        color='#eee'
        side='double'
        )
    a-box(
    rotation='0 0 0'
    position='-5 5.5 -10'
    color='#333'
    width=5
    height=10
    )
      a-text(
      :value='log'
      position='-2 4.5 0.5'
      side='double'
      )
</template>

<script>
  import aframe from 'aframe'

  export default {
    data: () => ({
      cloudpositions: [...Array(50)].map( cloud =>
        `${Math.random()*50-25} ${Math.random()*40+20} ${Math.random()*50-25}`
      ),
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
