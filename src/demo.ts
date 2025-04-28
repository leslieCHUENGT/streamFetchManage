import { StreamFetchClient } from "./index";

const streamFetchApp = new StreamFetchClient(
  {
    baseUrl: "",
    headers: {
      "Content-Type": "application/json",
    },
    overErrorTimer: 60 * 1000, // 流式中间超时时间，单位为毫秒
  },
  {
    onMessage: (_data) => {
      // 处理流式消息
    },
    onClose: (_lastData: any) => {
      // 处理关闭时的回调
    },
    onServerError: (_lastData: any) => {
      // 处理服务器错误时的回调
    },
    onStreamConnectionError: (_lastData: any) => {
      // 处理流式中间超时错误时的回调
    },
    onConnectionError: (_lastData: any) => {
      // 处理连接错误时的回调
    },
    onParseError: (_lastData: any) => {
      // 处理 JSON解析错误时的回调
    },
  }
);

streamFetchApp.sendStreamRequest({
  // 流式中间请求参数
});

const streamFetchApp1 = new StreamFetchClient(
  {
    baseUrl: "",
    headers: {
      "Content-Type": "application/json",
    },
    overErrorTimer: 60 * 1000, // 流式中间超时时间，单位为毫秒
  },
  {
    onMessage: (_data) => {
      // 调用消息处理器处理消息
      console.log(_data);
    },
    onClose: () => {
      // 处理关闭时的回调
    },
    onServerError: () => {
      // 处理服务器错误时的回调
    },
    onStreamConnectionError: () => {
      // 处理流式中间超时错误时的回调
    },
    onConnectionError: () => {
      // 处理连接错误时的回调
    },
    onParseError: () => {
      // 处理 JSON解析错误时的回调
    },
  },
  {
    maxCacheSize: 6, // 最大缓存大小，单位为条
    cacheTimeout: 5000, // 缓存超时时间，单位为毫秒
    expectedSeq: 0, // 期望的消息索引值
    handleValidateMessageFormat: (data: any) => {
      // 校验消息格式的回调
      if (typeof data.seq !== "number") {
        throw new Error("Message must have a numeric seq field");
      }
    },
    getIndexValue: (data: any) => data.seq, // 使得消息处理器获取消息索引值
  }
);

streamFetchApp1.sendStreamRequest({
  // 流式中间请求参数
});
