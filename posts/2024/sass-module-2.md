---
sidebar: false
lastUpdated: 2024-01-29
title: sass 模組化-2 巢狀引用 @use & @forward
---

# {{ $frontmatter.title }}



這一章討論巢狀檔案應該如何處理引入的問題。

## `@import`

檔案結構
```bash
.
├── constant
│   └── defaultColors.scss
├── lightColors.scss
└── style.scss
```

```scss
/* defaultColors.scss */
$primary: #007bff;
$secondary: #6c757d;
$success: #28a745;
$info: #17a2b8;
$warning: #ffc107;
$danger: #dc3545;
```

```scss
/* lightColors.scss */
@import "./constant/defaultColors";

$primary-light: lighten($primary, 30%);
$secondary-light: lighten($secondary, 30%);
$success-light: lighten($success, 30%);
$info-light: lighten($info, 30%);
$warning-light: lighten($warning, 30%);
$danger-light: lighten($danger, 30%);
```

```scss
/* style.scss */
@import "./lightColors";

div {
  color: $primary;
  background-color: $primary-light;
  .box {
    color: $secondary;
    background-color: $secondary-light;
  }
}
```

使用 `@import` 引入巢狀檔案，所有的變數都會被合併到當前檔案中，等於是全域變數，所以可以在任何地方使用。

## `@use`

```scss
/* lightColors.scss */
@use "./constant/defaultColors";

$primary-light: lighten(defaultColors.$primary, 30%);
$secondary-light: lighten(defaultColors.$secondary, 30%);
$success-light: lighten(defaultColors.$success, 30%);
$info-light: lighten(defaultColors.$info, 30%);
$warning-light: lighten(defaultColors.$warning, 30%);
$danger-light: lighten(defaultColors.$danger, 30%);
```

```scss
/* style.scss */
@use "./lightColors";

div {
  background-color: lightColors.$primary-light;
  .box {
    background-color: lightColors.$secondary-light;
  }
}
```

到這邊，跟前一小節的 @import 沒有太大的差異

### ISSUE

問題來了，如果我們想要在 `style.scss` 中使用 `defaultColors` 的變數，你覺得哪一種寫法比較好？

#### 選項A

```scss{5}
/* style.scss */
@use "./lightColors";

div {
  color: lightColors.$primary;
  background-color: lightColors.$primary-light;
  .box {
    background-color: lightColors.$secondary-light;
  }
}
```

#### 選項B

```scss{2,6}
/* style.scss */
@use "./constant/defaultColors";
@use "./lightColors";

div {
  color: defaultColors.$primary;
  background-color: lightColors.$primary-light;
  .box {
    background-color: lightColors.$secondary-light;
  }
}
```

實際在編譯的時候，選項A會報錯，因為 `defaultColors` 沒有被引入，所以無法使用。選項B則可以正常編譯，但是這樣的寫法在想要讓變數單一進入點的時候，不方便管理。下一個小結會介紹`@forward`，讓我們可以使用選項A的寫法。

## `@forward`

呈上一個小節的問題，如果我們想要用建立一個單一入口的檔案，讓所有的變數都可以在這個檔案中使用，該怎麼做呢？

答案是使用 `@forward` 我們可以將 `defaultColors` 的變數匯出，讓 `style.scss` 可以使用，類似 `export` 的概念。

### 改寫檔案

```scss{3}
/* lightColors.scss */
@use "./constant/defaultColors";
@forward "./constant/defaultColors";

$primary-light: lighten(defaultColors.$primary, 30%);
$secondary-light: lighten(defaultColors.$secondary, 30%);
$success-light: lighten(defaultColors.$success, 30%);
$info-light: lighten(defaultColors.$info, 30%);
$warning-light: lighten(defaultColors.$warning, 30%);
$danger-light: lighten(defaultColors.$danger, 30%);
```

```scss
/* style.scss */
@use "./lightColors";

div {
  color: lightColors.$primary;
  background-color: lightColors.$primary-light;
  .box {
    background-color: lightColors.$secondary-light;
  }
}
```

透過 `@use` `@forward` 的搭配，可以讓我們建立類似 `@import` 的檔案結構，但是又保持 `@use` 的優點
