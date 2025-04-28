import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // 入口
  outDir: "dist", // 打包输出目录
  clean: true, // 每次打包前清空目录
  format: ["esm", "iife"], // 打包格式，iife 支持 script 标签直接引入
  globalName: "easyWebStore", // iife 模式下的全局变量名
  dts: true, // 输出 d.ts 文件
  minify: true, // 压缩代码
});
