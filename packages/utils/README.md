- 支持 TypeScript
- 与 [SRS](https://ossrs.net/lts/zh-cn/) 服务结合使用

## 开始

### 安装

```sh
npm i rtc-streamer --save
```

### 使用

拉流

```js
import { SrsRtcPlayerAsync } from "rtc-streamer";
const srs = new SrsRtcPlayerAsync();
const video = document.getElementsByTagName("video");
video.srcObject = srs.stream;
srs.play(`webrtc://192.168.18.140/test/test`).catch((error) => {
  console.log(error);
});
```

推流

```js
import { SrsRtcPublisherAsync } from 'rtc-streamer'
const srs = new SrsRtcPublisherAsync()
srs.publish(`webrtc://192.168.18.140/test/test`).catch((error: any) => {
  console.log(error)
})
```
