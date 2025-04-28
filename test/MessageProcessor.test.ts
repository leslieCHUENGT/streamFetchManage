// test/MessageProcessor.test.ts
import { MessageProcessor } from "../src/MessageProcessor";
import { CacheManager } from "../src/CacheManager";

describe("MessageProcessor", () => {
  let cacheManager: CacheManager;
  let handleAppMessageMock: jest.Mock;
  let handleValidateMessageFormatMock: jest.Mock;
  let getIndexValueMock: jest.Mock;
  let messageProcessor: MessageProcessor;

  beforeEach(() => {
    cacheManager = new CacheManager();
    handleAppMessageMock = jest.fn();
    handleValidateMessageFormatMock = jest.fn();
    getIndexValueMock = jest.fn();
    messageProcessor = new MessageProcessor(
      0,
      cacheManager,
      handleAppMessageMock,
      handleValidateMessageFormatMock,
      getIndexValueMock
    );
  });

  test("processMessage: 处理顺序消息", () => {
    const data = { seq: 0 };
    getIndexValueMock.mockReturnValue(0);

    messageProcessor.processMessage(data);

    expect(handleValidateMessageFormatMock).toHaveBeenCalledWith(data);
    expect(handleAppMessageMock).toHaveBeenCalledWith(data);
    expect(messageProcessor["expectedSeq"]).toBe(1);
  });

  test("processMessage: 处理乱序消息", () => {
    const data = { seq: 1 };
    getIndexValueMock.mockReturnValue(1);

    messageProcessor.processMessage(data);

    expect(handleValidateMessageFormatMock).toHaveBeenCalledWith(data);
    expect(handleAppMessageMock).not.toHaveBeenCalled();
    expect(cacheManager.getCachedMessage(1)).toBeDefined();
  });

  test("processMessage: 处理旧消息或重复消息", () => {
    const data = { seq: -1 };
    getIndexValueMock.mockReturnValue(-1);

    messageProcessor.processMessage(data);

    expect(handleValidateMessageFormatMock).toHaveBeenCalledWith(data);
    expect(handleAppMessageMock).not.toHaveBeenCalled();
    expect(cacheManager.getCachedMessage(-1)).toBeUndefined();
  });

  test("processMessage: 消息格式验证失败", () => {
    const data = { seq: "invalid" };
    handleValidateMessageFormatMock.mockImplementation(() => {
      throw new Error("Invalid message format");
    });

    console.error = jest.fn();

    messageProcessor.processMessage(data);

    expect(handleValidateMessageFormatMock).toHaveBeenCalledWith(data);
    expect(handleAppMessageMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "消息处理错误:",
      expect.any(Error)
    );
  });
});
