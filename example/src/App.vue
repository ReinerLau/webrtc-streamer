<script setup lang="ts">
import { SrsRtcPlayerAsync } from 'rtc-streamer'
import { onMounted, ref, type Ref } from 'vue'

const videoRef: Ref<HTMLVideoElement | undefined> = ref()

onMounted(() => {
  const srs = new SrsRtcPlayerAsync()
  if (videoRef.value) {
    videoRef.value.srcObject = srs.stream
  }
  srs.play(`webrtc://192.168.18.140/test/test`).catch((error) => {
    console.log(error)
  })
})
</script>

<template>
  <video ref="videoRef" style="width: 50%" autoplay muted controls loop></video>
</template>
