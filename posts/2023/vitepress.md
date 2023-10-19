---
sidebar: false
---

# 用 vitepress 快速幫專案建立文件

## 為什麼要用 vitepress

1. 底層技術是 vite，所以速度很快
2. 可以直接使用 vue 的單文件元件，可以製作元件 demo 來說明
3. 用檔案結構自動生成 route，連結方便


## 三步驟完成文件建立

### 第一步：安裝 vitepress

```bash
yarn add -D vitepress
```

### 第二步：建立 vitepress 專案

使用 setup wizard 來幫助快速建立專案

```bash
npx vitepress init
```

此時會在專案目錄會長這樣：

```
.
├─ 文件目錄名
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ 下略
```

### 第三步：啟動 vitepress

```bash
yarn docs:dev
```

這樣你就可以獲得一個精美的文件範本了，接下來可以參考 vitepress 的文件來進行修改：[vitepress docs](https://vitepress.vuejs.org/)


## 舊專案在引入 vitepress 可能會遇到的雷

### 編譯環境限制

vitepress 需要 node 18 以上的版本，如果跟原本專案的 node 版本不同，可能要分開進行編譯。

### vue 版本限制

vitepress 需要 vue 3，如果專案目前使用的是 vue 2，在 build 的時候會出現錯誤，提供一個解法是將 package 跟原本的專案分開管理，讓 vitepress 依賴 vue 的時候不會引入到 vue2 的版本。

```
.
├─ node_modules
├─ 文件目錄名
│  ├─ node_modules
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  ├─ index.md
│  └─ package.json
└─ package.json
```
