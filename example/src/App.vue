<script setup lang="ts">
import { SrsRtcPlayerAsync, SrsRtcPublisherAsync } from 'rtc-streamer'
import { onMounted, ref, type Ref } from 'vue'

const videoRef: Ref<HTMLVideoElement | undefined> = ref()

onMounted(() => {
  const srs = new SrsRtcPlayerAsync()
  if (videoRef.value) {
    videoRef.value.srcObject = srs.stream
  }
  srs.play(`webrtc://192.168.18.72/test/test?eip=192.168.18.72:7000`).catch((error) => {
    console.log(error)
  })
})

function handlePublish() {
  const srs = new SrsRtcPublisherAsync()
  srs.publish(`webrtc://192.168.18.72/test/test1?eip=192.168.18.72:7000`).catch((error: any) => {
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
