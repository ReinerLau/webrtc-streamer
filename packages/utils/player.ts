export class SrsRtcPlayerAsync {
  private __internal;
  private pc;
  public stream;

  constructor() {
    this.__internal = new SrsRtcPlayerAsyncInternal("/rtc/v1/play/");
    this.pc = new RTCPeerConnection();

    // Create a stream to add track to the stream, @see https://webrtc.org/getting-started/remote-streams
    this.stream = new MediaStream();

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
    this.pc.ontrack = (event) => {
      // https://webrtc.org/getting-started/remote-streams
      this.stream.addTrack(event.track);
    };
  }

  async play(url: any) {
    const conf = this.__internal.prepareUrl(url);
    this.pc.addTransceiver("audio", { direction: "recvonly" });
    this.pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    const session: any = await getSession(conf, offer, this.pc);

    return session;
  }
  // Close the player.
  close() {
    this.pc && this.pc.close();
    this.pc;
  }
}

// function SrsError(name: any, message: any) {
//   this.name = name;
//   this.message = message;
//   this.stack = new Error().stack;
// }
// SrsError.prototype = Object.create(Error.prototype);
// SrsError.prototype.constructor = SrsError;

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

class SrsRtcPlayerAsyncInternal {
  public defaultPath;
  constructor(defaultPath: any) {
    this.defaultPath = defaultPath;
  }
  prepareUrl(webrtcUrl: any) {
    const urlObject = this.parse(webrtcUrl);

    // If user specifies the schema, use it as API schema.
    let schema = urlObject.user_query.schema;
    schema = schema ? schema + ":" : window.location.protocol;

    let port = urlObject.port || 1985;
    if (schema === "https:") {
      port = urlObject.port || 443;
    }

    // @see https://github.com/rtcdn/rtcdn-draft
    let api = urlObject.user_query.play || this.defaultPath;
    if (api.lastIndexOf("/") !== api.length - 1) {
      api += "/";
    }

    // let apiUrl = schema + "//" + urlObject.server + ":" + port + api;
    let apiUrl = api;
    for (const key in urlObject.user_query) {
      if (key !== "api" && key !== "play") {
        apiUrl += "&" + key + "=" + urlObject.user_query[key];
      }
    }
    // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
    apiUrl = apiUrl.replace(api + "&", api + "?");

    const streamUrl = urlObject.url;

    return {
      apiUrl,
      streamUrl,
      schema,
      urlObject,
      port,
      tid: (new Date().getTime() * Math.random() * 100)
        .toString(16)
        .slice(0, 7),
    };
  }

  parse(url: any) {
    // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
    const a = document.createElement("a");
    a.href = url
      .replace("rtmp://", "http://")
      .replace("webrtc://", "http://")
      .replace("rtc://", "http://");

    let vhost = a.hostname;
    let app = a.pathname.substring(1, a.pathname.lastIndexOf("/"));
    const stream = a.pathname.slice(a.pathname.lastIndexOf("/") + 1);

    // parse the vhost in the params of app, that srs supports.
    app = app.replace("...vhost...", "?vhost=");
    if (app.indexOf("?") >= 0) {
      const params = app.slice(app.indexOf("?"));
      app = app.slice(0, app.indexOf("?"));

      if (params.indexOf("vhost=") > 0) {
        vhost = params.slice(params.indexOf("vhost=") + "vhost=".length);
        if (vhost.indexOf("&") > 0) {
          vhost = vhost.slice(0, vhost.indexOf("&"));
        }
      }
    }

    // when vhost equals to server, and server is ip,
    // the vhost is __defaultVhost__
    if (a.hostname === vhost) {
      const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
      if (re.test(a.hostname)) {
        vhost = "__defaultVhost__";
      }
    }

    // parse the schema
    let schema = "rtmp";
    if (url.indexOf("://") > 0) {
      schema = url.slice(0, url.indexOf("://"));
    }

    let port = Number(a.port);
    if (!port) {
      // Finger out by webrtc url, if contains http or https port, to overwrite default 1985.
      if (schema === "webrtc" && url.indexOf(`webrtc://${a.host}:`) === 0) {
        port = url.indexOf(`webrtc://${a.host}:80`) === 0 ? 80 : 443;
      }

      // Guess by schema.
      if (schema === "http") {
        port = 80;
      } else if (schema === "https") {
        port = 443;
      } else if (schema === "rtmp") {
        port = 1935;
      }
    }

    const ret: any = {
      url: url,
      schema: schema,
      server: a.hostname,
      port: port,
      vhost: vhost,
      app: app,
      stream: stream,
    };
    this.fill_query(a.search, ret);

    // For webrtc API, we use 443 if page is https, or schema specified it.
    if (!ret.port) {
      if (schema === "webrtc" || schema === "rtc") {
        if (ret.user_query.schema === "https") {
          ret.port = 443;
        } else if (window.location.href.indexOf("https://") === 0) {
          ret.port = 443;
        } else {
          // For WebRTC, SRS use 1985 as default API port.
          ret.port = 1985;
        }
      }
    }

    return ret;
  }

  fill_query(query_string: any, obj: any) {
    // pure user query object.
    obj.user_query = {};

    if (query_string.length === 0) {
      return;
    }

    // split again for angularjs.
    if (query_string.indexOf("?") >= 0) {
      query_string = query_string.split("?")[1];
    }

    const queries = query_string.split("&");
    for (let i = 0; i < queries.length; i++) {
      const elem = queries[i];

      const query = elem.split("=");
      obj[query[0]] = query[1];
      obj.user_query[query[0]] = query[1];
    }

    // alias domain for vhost.
    if (obj.domain) {
      obj.vhost = obj.domain;
    }
  }
}

async function getSession(conf: any, offer: any, pc: any) {
  const session: any = await new Promise((resolve, reject) => {
    // @see https://github.com/rtcdn/rtcdn-draft
    const data = {
      api: conf.apiUrl,
      tid: conf.tid,
      streamurl: conf.streamUrl,
      clientip: null,
      sdp: offer.sdp,
    };

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status !== 200) return reject(xhr);
      const data = JSON.parse(xhr.responseText);
      return data.code ? reject(xhr) : resolve(data);
    };
    xhr.open("POST", conf.apiUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  });
  await pc.setRemoteDescription(
    new RTCSessionDescription({ type: "answer", sdp: session.sdp })
  );
  session.simulator = `${conf.schema}//${conf.urlObject.server}:${conf.port}/rtc/v1/nack/`;
  return session;
}
