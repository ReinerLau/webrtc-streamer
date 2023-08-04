export declare class SrsRtcPlayerAsync {
    private pc;
    stream: MediaStream;
    constructor();
    play(url: string): Promise<boolean>;
    close(): void;
}
