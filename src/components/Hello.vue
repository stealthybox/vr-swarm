<template lang='pug'>
  a-scene
    a-box(
      position='0 0.5 -3'
      rotation='0 45 0'
      color='gray'
    )
    a-plane(
      position='0 0 -4'
      rotation='-90 0 0'
      color='blue'
      height=5
      width=5
    )
    a-sky(
      color='indigo'
    )
</template>

<script>
import aframe from 'aframe'

export default {
  name: 'hello',
  data () {
    return {
      offsets: [-10,0,3],
      msg: 'Welcome to Swarm we r ready to dev y3ahhh'
    }
  },
  computed: {
    positions() {
      this.offsets.map(n => `${n} 0.5 -3`)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
