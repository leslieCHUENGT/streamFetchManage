declare class CacheManager {
    messageCache: Map<number, {
        data: any;
        timestamp: number;
    }>;
    private maxCacheSize;
    private cacheTimeout;
    cleanupInterval: any;
    constructor(config?: {
        maxCacheSize?: number;
        cacheTimeout?: number;
    });
    private initCleanupCycle;
    private cleanup;
    private applyTimeBasedEviction;
    private applySizeBasedEviction;
    cacheMessage(seq: number, data: any): void;
    getCachedMessage(seq: number): {
        data: any;
        timestamp: number;
    } | undefined;
    deleteMessage(seq: number): void;
    clear(): void;
}

declare class MessageProcessor {
    private expectedSeq;
    private cacheManager;
    private handleAppMessage;
    private handleValidateMessageFormat;
    private getIndexValue;
    constructor(expectedSeq: number | undefined, cacheManager: CacheManager, handleAppMessage: (data: any) => void, handleValidateMessageFormat: (data: any) => void, getIndexValue: (data: any) => number);
    processMessage(data: any): void;
    private handleCurrentMessage;
    private checkCacheForNext;
}

interface ICurrentEventHandlers {
    onStreamConnectionError?: (data: any) => void;
    onConnectionError?: (data: any) => void;
    onServerError?: (data: any) => void;
    onParseError?: (data: any) => void;
    onMessage: (data: any) => void;
    onClose?: (data: any) => void;
}
interface IStreamFetchClientConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
    overErrorTimer?: number;
}
interface IProcessorConfig {
    maxCacheSize: number;
    cacheTimeout: number;
    expectedSeq: number;
    handleValidateMessageFormat: (data: any) => void;
    getIndexValue: (data: any) => number;
}
declare class StreamFetchClient {
    private currentMessage;
    private baseUrl;
    private headers;
    private streamTimer;
    private overErrorTimer;
    private abortController;
    private currentEventHandlers;
    private cacheManager;
    private messageProcessor;
    constructor(config: IStreamFetchClientConfig, eventHandles: ICurrentEventHandlers, processorConfig?: IProcessorConfig | null);
    sendStreamRequest(payload: Record<string, any>, eventHandlers?: ICurrentEventHandlers | null): Promise<void>;
    disconnect(): void;
    private executeFetchRequest;
    private handleServerMessage;
    private buildRequestPayload;
    private handleOpenResponse;
    private handleStreamClose;
    private handleStreamError;
    private handleRequestError;
    private startTimer;
    private resetTimer;
    private clearTimer;
}

declare class TypeWriterManage {
    private messageQueue;
    private delay;
    private onMessage;
    private onFinish;
    private isProcessing;
    private stopFlag;
    private timeoutId;
    constructor(delay: number, onMessage: (char: string) => void, onFinish: () => void, initialValue?: string);
    add(chunk: string): void;
    setOnComplete(callback: () => void): void;
    start(): void;
    processQueue(): void;
    stop(): void;
    immediatelyStop(): void;
}

export { CacheManager, MessageProcessor, StreamFetchClient, TypeWriterManage };
