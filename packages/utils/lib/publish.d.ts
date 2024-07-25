interface Constraints {
    audio: boolean;
    video: boolean;
}
export declare class SrsRtcPublisherAsync {
    private pc;
    stream: MediaStream;
    private constraints;
    constructor(constraints?: Constraints);
    publish(url: string): Promise<boolean>;
    close(): void;
}
export {};
