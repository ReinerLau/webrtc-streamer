<script setup lang="ts">
import { SrsRtcPlayerAsync, SrsRtcPublisherAsync } from 'rtc-streamer'
import { onMounted, ref, type Ref } from 'vue'

const videoRef: Ref<HTMLVideoElement | undefined> = ref()

onMounted(() => {
  const srs = new SrsRtcPlayerAsync()
  if (videoRef.value) {
    videoRef.value.srcObject = srs.stream
  }
  srs.play(`webrtc://119.91.145.64/live/test`).catch((error) => {
    console.log(error)
  })
})

function handlePublish() {
  const srs = new SrsRtcPublisherAsync({ audio: true, video: false })
  srs.publish(`webrtc://119.91.145.64/test/test1`).catch((error: any) => {
    console.log(error)
  })
}
</script>

<template>
  <div>
    <button @click="handlePublish">推流</button>
  </div>
  <video ref="videoRef" style="width: 50%" autoplay muted controls loop></video>
</template>
