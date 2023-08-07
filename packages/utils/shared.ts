export const enum Api {
  PLAYER = "/rtc/v1/play/",
  PUBLISHER = "/rtc/v1/publish/",
}

export async function getSession(
  api: string,
  streamurl: string,
  offer: RTCSessionDescriptionInit
) {
  const body = {
    streamurl,
    sdp: offer.sdp,
  };

  const res = await fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  return data;
}
