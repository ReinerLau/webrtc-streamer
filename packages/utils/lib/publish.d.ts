export declare class SrsRtcPublisherAsync {
    private pc;
    stream: MediaStream;
    constructor();
    publish(url: string): Promise<boolean>;
    close(): void;
}
