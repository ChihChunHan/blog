---
sidebar: false
lastUpdated: 2024-01-29
title: sass 模組化-1 @import vs @use
---

# {{ $frontmatter.title }}



## `@import`

複習一下 sass 模組化的基礎 `@import`
1. `@import` 可以在編譯的時候引用其他 scss 檔案，並且將其內容合併到當前檔案中。
2. 檔名前綴 `_*.scss`，不會被編譯成 css 檔案。

::: code-group

```bash [src]
.
├── _mixins.scss
├── _variables.scss
└── style.scss
```

```bash [dist]
.
└── style.css
```

:::


::: code-group

```scss
/* style.scss */
@import "./_variables.scss";
@import "./_mixins.scss";

div {
  color: $primary;
  @include h1;
  .box {
    background: $secondary;
    @include h2;
  }
}
```

```css
/* style.css */
div {
  color: #007bff;
  font-size: 2rem;
  color: red;
}
div .box {
  background: #6c757d;
  font-size: 1.5rem;
  color: blue;
}
```

:::

## `@use`

1. `@use` 跟 `@import` 一樣都可以在編譯的時候引用其他 scss 檔案，並且將其內容合併到當前檔案中。
2. `@use` 有 scope 的概念，必須要加上前綴 `檔名.變數名稱`。

::: code-group

```bash [src]
.
├── _mixins.scss
├── _variables.scss
└── style.scss
```

```bash [dist]
.
└── style.css
```

:::

::: code-group

```scss
/* style.scss */
@use "./_variables.scss";
@use "./_mixins.scss";

div {
  color: variables.$primary;
  @include mixins.h1;
  .box {
    background: variables.$secondary;
    @include mixins.h2;
  }
}
```

```css
/* style.css */
div {
  color: #007bff;
  font-size: 2rem;
  color: red;
}
div .box {
  background: #6c757d;
  font-size: 1.5rem;
  color: blue;
}
```

:::

檔案結構跟 `@import` 一樣，但是變數的使用方式不一樣，`@import` 是直接使用變數名稱，`@use` 則有 scope 的概念，必須要加上前綴 `檔名.變數名稱`。

## @use 的各種功能

繼續來看一下 @use 還有哪些功能

### private variable

 變數可以使用 `$_` 來設定 private variable

```scss
/* mixins.scss */
// private variables
$_font-size-h1: 1rem;

@mixin h1 {
  font-size: $_font-size-h1;
  color: red;
}

```

```scss
/* style.scss */
@use "./_mixins.scss";

div {
  font-size: mixins.$_font-size-h1; // [!code error] // Error: no variable $_font-size-h1 found. 
  @include mixins.h1;
}
```

可以看到在 style.scss 中無法使用 `_mixins.scss` 中的 private variable，但是可以使用 `_mixins.scss` 中的 mixin。

### namespace

`@use` 可以使用 `as` 重新命名 namespace

```scss
/* style.scss */
@use "./_variables.scss" as color;

div {
  color: color.$primary;
}
```

### configuration

`@use` 可以使用 `with` 複寫預設值

```scss
/* border.scss */
// configuration ans private variables
$_border-width: 1px !default;
$_border-color: #ccc !default;
$_border-style: solid !default;

@mixin border {
  border: $_border-width $_border-style $_border-color;
}
```

預設值

::: code-group

```scss
/* style.scss */
@use "./_border.scss";

div {
  @include border.border;
}
```

```css
/* style.css */
div {
  border: 1px solid #ccc;
}
```

:::

覆寫預設值

::: code-group

```scss
/* style.scss */
@use "./_border.scss" with (
  $_border-width: 2px,
  $_border-color: red
);

div {
  @include border.border;
}
```

```css
/* style.css */
div {
  border: 2px solid red;
}
```

:::

