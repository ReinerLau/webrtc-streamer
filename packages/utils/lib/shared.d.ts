export declare const enum Api {
    PLAYER = "/rtc/v1/play/",
    PUBLISHER = "/rtc/v1/publish/"
}
export declare function getSession(api: string, streamurl: string, offer: RTCSessionDescriptionInit): Promise<any>;
