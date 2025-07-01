## Language

- [English](#english)
- [中文](#中文)

### English

Due to the requirement of making POST requests without an XMLHttpRequest-based library, I opted for the **@microsoft/fetch-event-source** library, an open-source solution by Microsoft that wraps the `fetch` API. On top of this, I've created a secondary encapsulation to enhance request controllability and robustness in error handling. The specific encapsulation features are as follows:

1. **Request Cancellation Mechanism**: Implemented active cancellation of requests to ensure timely interruption when necessary, preventing unnecessary resource consumption.

2. **Error Capture and Handling**: Unified capture and handling of various errors, covering the following scenarios:
   - **Network Errors**: Capture and handle issues when network connectivity is abnormal or requests cannot be sent.
   - **Server Errors**: Handle HTTP 5xx or 4xx status codes returned by the server.
   - **Connection Errors**: Capture errors when network connections are interrupted or requests time out.
   - **Streaming Interface Timeout Errors**: Detect and handle timeouts during streaming data requests.
   - **JSON Parsing Errors**: Manage exceptions that occur during JSON parsing of response data.

These enhancements significantly improve request reliability and stability, ensuring effective error handling and recovery under various exceptional conditions.

**Usage Example:**

```ts
import { StreamFetchClient } from '@lesliechueng/stream-fetch-manage'

const streamFetchApp = new StreamFetchClient(
  {
    baseUrl: "",
    headers: {
      "Content-Type": "application/json",
    },
    overErrorTimer: 60 * 1000, // Streaming intermediate timeout in milliseconds
  },
  {
    onMessage: (_data) => {
      // Process streaming messages
    },
    onClose: (_lastData: any) => {
      // Callback for connection closure
    },
    onServerError: (_lastData: any) => {
      // Callback for server errors
    },
    onStreamConnectionError: (_lastData: any) => {
      // Callback for streaming timeout errors
    },
    onConnectionError: (_lastData: any) => {
      // Callback for connection errors
    },
    onParseError: (_lastData: any) => {
      // Callback for JSON parsing errors
    },
  }
);

// Initiate the request with specific parameters
streamFetchApp.sendStreamRequest({
  // Streaming request parameters
});

// Pause the request
// streamFetchApp.disconnect();
```

* **Addressing Packet Sequence Jitter Caused by Server Issues**: Implemented caching time and data count limits in requests.

```ts
import { StreamFetchClient } from '@lesliechueng/stream-fetch-manage'

const streamFetchApp1 = new StreamFetchClient(
  {
    baseUrl: "",
    headers: {
      "Content-Type": "application/json",
    },
    overErrorTimer: 60 * 1000, // Streaming intermediate timeout in milliseconds
  },
  {
    onMessage: (_data) => {
      // Process messages with a handler
      console.log(_data);
    },
    onClose: () => {
      // Callback for connection closure
    },
    onServerError: () => {
      // Callback for server errors
    },
    onStreamConnectionError: () => {
      // Callback for streaming timeout errors
    },
    onConnectionError: () => {
      // Callback for connection errors
    },
    onParseError: () => {
      // Callback for JSON parsing errors
    },
  },
  {
    maxCacheSize: 6, // Maximum cache size (number of entries)
    cacheTimeout: 5000, // Cache timeout in milliseconds
    expectedSeq: 0, // Expected message sequence number
    handleValidateMessageFormat: (data: any) => {
      // Validate message format
      if (typeof data.seq !== "number") {
        throw new Error("Message must have a numeric seq field");
      }
    },
    getIndexValue: (data: any) => data.seq, // Retrieve message sequence number
  }
);

// Initiate the request with specific parameters
streamFetchApp1.sendStreamRequest({
  // Streaming request parameters
});
```

### 中文

由于需要进行post请求，而没有基于XMLHttpRequest封装的类库，于是使用基于fetch封装的类库，微软开源的 **@microsoft/fetch-event-source**请求库，该库基于`fetch`进行了封装。在此基础上，我对其进行了二次封装，主要目的是增强请求的可控性，并提升错误处理的健壮性。具体封装功能如下：

1.  **请求取消机制**：实现了对请求的主动取消功能，确保在需要时能够及时中断请求，避免不必要的资源消耗。

2.  **错误捕获与处理**：对各类错误进行了统一的捕获与处理，涵盖以下场景：

    -   **网络错误**：当网络连接异常或请求无法发送时，捕获并处理相关错误。
    -   **服务器错误**：针对服务器返回的5xx或4xx状态码进行错误处理。
    -   **网络连接错误**：在网络连接中断或请求超时时，进行相应的错误捕获。
    -   **流式接口超时错误**：在请求流式数据的过程中，若出现超时情况，能够及时捕获并处理。
    -   **JSON解析错误**：对返回的数据进行JSON解析时，若解析失败，能够捕获并处理异常。

通过上述封装，显著提升了请求的可靠性与稳定性，确保在各种异常情况下能够进行有效的错误处理与恢复。

使用示例：

```ts
import { StreamFetchClient } from '@lesliechueng/stream-fetch-manage'

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
// 开始发起请求，下面是具体的参数
streamFetchApp.sendStreamRequest({
  // 流式中间请求参数
});

// 暂停请求
// streamFetchApp.disconnect();
```

*   解决可能因为服务端问题导致数据包序号抖动：通过在请求中设置缓存时间和 data个数。

```ts
import { StreamFetchClient } from '@lesliechueng/stream-fetch-manage'

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

// 开始发起请求，下面是具体的参数
streamFetchApp1.sendStreamRequest({
  // 流式中间请求参数
});
