import { CacheManager } from "./CacheManager";

export class MessageProcessor {
  private expectedSeq: number = 0;
  private cacheManager: CacheManager;
  private handleAppMessage: (data: any) => void;
  private handleValidateMessageFormat: (data: any) => void;
  private getIndexValue: (data: any) => number;

  constructor(
    expectedSeq: number = 0,
    cacheManager: CacheManager,
    handleAppMessage: (data: any) => void,
    handleValidateMessageFormat: (data: any) => void,
    getIndexValue: (data: any) => number
  ) {
    this.expectedSeq = expectedSeq;
    this.cacheManager = cacheManager;
    this.handleAppMessage = handleAppMessage;
    this.handleValidateMessageFormat = handleValidateMessageFormat;
    this.getIndexValue = getIndexValue;
  }

  public processMessage(data: any): void {
    try {
      this.handleValidateMessageFormat(data);
      const seq = this.getIndexValue(data);

      if (seq === this.expectedSeq) {
        this.handleCurrentMessage(data);
      } else if (seq > this.expectedSeq) {
        this.cacheManager.cacheMessage(seq, data);
      } else {
        // 忽略旧消息或重复消息
      }
    } catch (error) {
      console.error("消息处理错误:", error);
    }
  }

  private handleCurrentMessage(data: any): void {
    this.handleAppMessage(data);
    this.expectedSeq++;
    this.checkCacheForNext();
  }

  private checkCacheForNext(): void {
    while (this.cacheManager.messageCache.has(this.expectedSeq)) {
      const cachedEntry = this.cacheManager.getCachedMessage(this.expectedSeq);
      if (cachedEntry) {
        this.handleAppMessage(cachedEntry.data);
        this.cacheManager.deleteMessage(this.expectedSeq);
        this.expectedSeq++;
      }
    }
  }
}
