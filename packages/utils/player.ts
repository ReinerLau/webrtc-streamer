import { Api, getSession } from "./shared";

export class SrsRtcPlayerAsync {
  private pc: RTCPeerConnection;
  public stream: MediaStream;

  constructor() {
    this.pc = new RTCPeerConnection();
    this.stream = new MediaStream();
    this.pc.ontrack = (event) => {
      this.stream.addTrack(event.track);
    };
  }

  async play(url: string) {
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      throw "向 127.0.0.1 或 localhost 请求视频流无效";
    }
    this.pc.addTransceiver("audio", { direction: "recvonly" });
    this.pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    try {
      const session = await getSession(Api.PLAYER, url, offer);
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: session.sdp })
      );
      return true;
    } catch {
      throw "拉流失败";
    }
  }
  close() {
    this.pc && this.pc.close();
  }
}
