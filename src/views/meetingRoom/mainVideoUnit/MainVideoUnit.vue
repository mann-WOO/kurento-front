<template>
  <div>
    LocalVideo
    {{ mainParticipant.getVideoElement() }}
  </div>
</template>

<script>
// import "./template.scss";

export default {
  name: 'MainVideoUnit',
  components: {
  },
  // : props
  props: {
    mainParticipant: Object
  },
  // : data
  data() {
    return {
    }
  },
  // : computed
  computed: {
  },
  // : lifecycle hook
  mounted() {
  },
  // : updated
  updated() {
    console.log(this.mainParticipant)
  },
  // : methods
  methods: {
  }
}
</script>