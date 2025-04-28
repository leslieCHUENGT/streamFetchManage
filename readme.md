- 该 SDK 是基于 `@microsoft/fetch-event-source` 二次开发的
- 主要是对取消请求和对各种类型的错误进行捕获处理进行封装处理

- 支持的捕获的错误类型

  - 网络错误
  - 服务器错误
  - 网络连接错误
  - 接口流式中途超时错误
  - json 解析错误

使用示例:

1. 简单的使用

```ts
import { StreamFetchClient } from "@leslie/stream-fetch-client";

```
