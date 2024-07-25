import { Api, getSession } from "./shared";

interface Constraints {
  audio: boolean;
  video: boolean;
}

export class SrsRtcPublisherAsync {
  private pc;
  public stream;
  private constraints: Constraints;
  constructor(constraints: Constraints = { audio: true, video: true }) {
    this.pc = new RTCPeerConnection();
    this.stream = new MediaStream();
    this.constraints = constraints;
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
      stream = await navigator.mediaDevices.getUserMedia(this.constraints);
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
