import { CacheManager } from "../src/CacheManager";
import { jest } from "@jest/globals";

describe("CacheManager", () => {
  let cache: CacheManager;
  let mockDateNow: any;

  beforeEach(() => {
    jest.useFakeTimers();
    // 固定初始时间并允许后续修改
    mockDateNow = jest.spyOn(Date, "now").mockReturnValue(1000);
    cache = new CacheManager({ maxCacheSize: 3, cacheTimeout: 5000 });
  });

  afterEach(() => {
    mockDateNow.mockRestore();
    jest.useRealTimers();
  });

  test("should evict old entries by size", () => {
    // 测试顺序改为明确插入顺序
    [1, 2, 3].forEach((n) => cache.cacheMessage(n, `data${n}`));
    expect(cache.getCachedMessage(1)).toBeDefined(); // 前3个存在

    // 插入第4个触发淘汰
    cache.cacheMessage(4, "data4");

    expect(cache.getCachedMessage(1)).toBeUndefined(); // 1被淘汰
    expect(cache.getCachedMessage(4)).toBeDefined(); // 4保留
  });

  test("should evict entries by timeout", () => {
    cache.cacheMessage(1, "data1");
    // 快进时间并更新Date.now模拟值
    jest.advanceTimersByTime(6000);
    mockDateNow.mockReturnValue(7000); // 1000 + 6000 = 7000ms

    expect(cache.getCachedMessage(1)).toBeUndefined();
  });
});
