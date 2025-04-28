export class TypeWriterManage {
  private messageQueue: string[];
  private delay: number;
  private onMessage: (char: string) => void;
  private onFinish: () => void;
  private isProcessing: boolean;
  private stopFlag: boolean;
  private timeoutId: ReturnType<typeof setTimeout> | null;

  constructor(
    delay: number,
    onMessage: (char: string) => void,
    onFinish: () => void,
    initialValue: string = ""
  ) {
    this.messageQueue = []; // 字符队列
    this.delay = delay; // 字符间隔时间
    this.onMessage = onMessage; // 单字回调
    this.onFinish = onFinish; // 完成回调
    this.isProcessing = false; // 处理状态
    this.stopFlag = false; // 停止标志
    this.timeoutId = null; // 定时器ID

    // 初始化时直接添加初始值
    if (initialValue) {
      this.add(initialValue);
    }
  }

  add(chunk: string): void {
    if (typeof chunk !== "string" || this.stopFlag) return;

    // 拆解数据块为单字并加入队列
    const chars = chunk.split("");
    this.messageQueue.push(...chars);

    // 自动启动处理流程
    if (!this.isProcessing) {
      this.start();
    }
  }

  setOnComplete(callback: () => void): void {
    this.onFinish = callback;
  }

  start(): void {
    this.processQueue();
  }

  processQueue(): void {
    if (this.stopFlag || this.messageQueue.length === 0) {
      this.isProcessing = false;
      if (this.messageQueue.length === 0) this.onFinish();
      return;
    }

    this.isProcessing = true;
    const char = this.messageQueue.shift() as string;
    this.onMessage(char);

    this.timeoutId = setTimeout(() => {
      this.processQueue();
    }, this.delay);
  }

  stop(): void {
    this.stopFlag = true;
  }

  immediatelyStop(): void {
    clearTimeout(this.timeoutId as ReturnType<typeof setTimeout>);
    this.messageQueue = [];
    this.isProcessing = false;
    this.stopFlag = false;
    this.onFinish();
  }
}
