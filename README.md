# InBrowser App

一个基于 **Astro** + **SolidJS** + **UnoCSS** 构建的浏览器端工具集合。所有工具均在浏览器本地运行，无需后端服务，数据不上传服务器。

## 🧰 工具列表

| 工具 | 说明 |
| --- | --- |
| [Color Converter](/colors) | 颜色格式转换，支持 HEX、RGB、HSL 等格式互转 |
| [Color Mix](/colors) | 颜色混合工具 |
| [Query String ↔ JSON](/query-to-json) | URL 查询字符串与 JSON 互转 |
| [URI Encode/Decode](/uri-tools) | URI 编解码 |
| [Format JSON](/format-json) | JSON 格式化与压缩 |
| [Escape Conversion](/escape-convert) | 转义字符转换 |
| [LaTeX Table Converter](/tex-table-to-other) | LaTeX 表格与其他格式互转 |
| [Hash Calculator](/hash) | 哈希计算（MD5） |
| [Image Steganography](/img-hide) | 图片隐写（光棱坦克），将图片隐藏到另一张图片中 |
| [Time Difference](/time-gap) | 时间差计算 |
| [Image Monochrome](/monochrome-image) | 图像去色与反色处理 |

## ✨ 特性

- **纯浏览器端运行** — 所有计算在本地完成，无后端依赖
- **隐私安全** — 数据不上传，图片、文本等均在本地处理
- **响应式设计** — 适配桌面与移动端
- **暗色主题支持** — 跟随系统主题自动切换

## 🚀 开发

```sh
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 本地预览生产构建
pnpm preview
```

## 🛠️ 技术栈

| 技术 | 用途 |
| --- | --- |
| [Astro](https://astro.build) | 静态站点框架 |
| [SolidJS](https://www.solidjs.com) | 交互式 UI 组件 |
| [UnoCSS](https://unocss.dev) | 原子化 CSS 引擎 |
| [TypeScript](https://www.typescriptlang.org) | 类型安全 |
| [Oxlint](https://oxc.rs) | 代码检查与格式化 |
| [Iconify](https://iconify.design) | 图标库（Remix Icons） |
