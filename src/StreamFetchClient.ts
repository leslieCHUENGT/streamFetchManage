import { CacheManager } from "./CacheManager";
import { MessageProcessor } from "./MessageProcessor";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export interface ICurrentEventHandlers {
  onStreamConnectionError?: (data: any) => void;
  onConnectionError?: (data: any) => void;
  onServerError?: (data: any) => void;
  onParseError?: (data: any) => void;
  onMessage: (data: any) => void;
  onClose?: (data: any) => void;
}

export interface IStreamFetchClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  overErrorTimer?: number;
}

export interface IProcessorConfig {
  maxCacheSize: number;
  cacheTimeout: number;
  expectedSeq: number;
  handleValidateMessageFormat: (data: any) => void;
  getIndexValue: (data: any) => number;
}

export class StreamFetchClient {
  private currentMessage: any;
  private baseUrl: string;
  private headers: Record<string, string>;
  private streamTimer: ReturnType<typeof setTimeout> | null;
  private overErrorTimer: number;
  private abortController: AbortController | null;
  private currentEventHandlers: ICurrentEventHandlers;
  private cacheManager: CacheManager | null = null;
  private messageProcessor: MessageProcessor | null = null;

  constructor(
    config: IStreamFetchClientConfig,
    eventHandles: ICurrentEventHandlers,
    processorConfig?: IProcessorConfig | null
  ) {
    this.baseUrl = config.baseUrl || "";
    this.headers = config.headers || {
      "Content-Type": "application/json",
    };
    this.overErrorTimer = config.overErrorTimer || 60 * 1000;
    this.currentEventHandlers = eventHandles || {
      onMessage: () => {},
    };
    this.abortController = null;
    this.streamTimer = null;
    if (processorConfig) {
      this.cacheManager = new CacheManager({
        maxCacheSize: processorConfig.maxCacheSize,
        cacheTimeout: processorConfig.cacheTimeout,
      });
      this.messageProcessor = new MessageProcessor(
        processorConfig.expectedSeq,
        this.cacheManager,
        this.currentEventHandlers.onMessage,
        processorConfig.handleValidateMessageFormat,
        processorConfig.getIndexValue
      );
    }
  }

  public async sendStreamRequest(
    payload: Record<string, any>,
    eventHandlers?: ICurrentEventHandlers | null
  ) {
    this.currentEventHandlers = eventHandlers || this.currentEventHandlers;
    this.abortController = new AbortController();

    try {
      this.startTimer();
      await this.executeFetchRequest(payload);
    } catch (error) {
      this.handleRequestError();
    } finally {
      this.clearTimer();
    }
  }

  public disconnect() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.clearTimer();
  }

  private async executeFetchRequest(payload: Record<string, any>) {
    await fetchEventSource(this.baseUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(this.buildRequestPayload(payload)),
      openWhenHidden: true,
      signal: this.abortController?.signal,
      onopen: async (response) => {
        this.handleOpenResponse(response);
      },
      onmessage: (event) => this.handleServerMessage(event),
      onclose: () => this.handleStreamClose(),
      onerror: () => this.handleStreamError(),
    });
  }

  private handleServerMessage(event: any) {
    this.resetTimer();
    try {
      const message = JSON.parse(event.data);
      if (this.messageProcessor) {
        this.messageProcessor.processMessage(message);
        return;
      }
      this.currentEventHandlers?.onMessage?.(message);
      this.currentMessage = message; // 存储最新的消息
    } catch (error) {
      this.currentEventHandlers?.onParseError?.(this.currentMessage);
    }
  }

  private buildRequestPayload(payload: Record<string, any>) {
    return {
      ...payload,
    };
  }

  private handleOpenResponse(response: Response) {
    const EventStreamContentType = "text/event-stream";
    if (
      response.ok &&
      response.headers.get("content-type") === EventStreamContentType
    ) {
      return;
    }

    if (
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 429
    ) {
      this.currentEventHandlers?.onServerError?.(this.currentMessage);
    }
    this.currentEventHandlers?.onConnectionError?.(this.currentMessage);
  }

  private handleStreamClose() {
    this.currentEventHandlers?.onClose?.(this.currentMessage);
    this.clearTimer();
  }

  private handleStreamError() {
    this.currentEventHandlers?.onServerError?.(this.currentMessage);
    this.clearTimer();
  }

  private handleRequestError() {
    this.currentEventHandlers?.onServerError?.(this.currentMessage);
    this.clearTimer();
  }

  private startTimer() {
    this.streamTimer = setTimeout(() => {
      this.currentEventHandlers?.onStreamConnectionError?.(this.currentMessage);
      this.disconnect();
    }, this.overErrorTimer);
  }

  private resetTimer() {
    this.clearTimer();
    this.startTimer();
  }

  private clearTimer() {
    if (this.streamTimer) {
      clearTimeout(this.streamTimer);
      this.streamTimer = null;
    }
  }
}
