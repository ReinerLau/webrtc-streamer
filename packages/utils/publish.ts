import { Api, getSession } from "./shared";

export class SrsRtcPublisherAsync {
  private pc;
  public stream;
  constructor() {
    this.pc = new RTCPeerConnection();
    this.stream = new MediaStream();
  }
  async publish(url: string) {
    if (errorType.noMediaDevices.validator()) {
      throw errorType.noMediaDevices.message;
    } else if (errorType.notAllowedURL.validator()) {
      throw errorType.notAllowedURL.message;
    }

    this.pc.addTransceiver("audio", { direction: "sendonly" });
    this.pc.addTransceiver("video", { direction: "sendonly" });

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
    } catch {
      console.error(errorType.noMediaDevices.message);
    }

    stream?.getTracks().forEach((track) => {
      this.pc.addTrack(track);
      this.stream.addTrack(track);
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    try {
      const session = await getSession(Api.PUBLISHER, url, offer);
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: session.sdp })
      );
      return true;
    } catch {
      throw "推流失败";
    }
  }
  close() {
    this.pc && this.pc.close();
  }
}

const errorType = {
  noMediaDevices: {
    validator() {
      return !navigator.mediaDevices;
    },
    message: "请连接麦克风",
  },
  notAllowedURL: {
    validator() {
      return (
        window.location.protocol === "http:" &&
        window.location.hostname !== "localhost"
      );
    },
    message: "不允许协议为非https",
  },
};
