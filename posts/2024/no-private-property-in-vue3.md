---
sidebar: false
lastUpdated: 2024-03-15
title: 別在 Vue3 參考有 private class fields 的物件
---

# {{ $frontmatter.title }}


先說結論，vue3 使用 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 實作的 reactivity system，並沒有辦法處理 [Private class fields]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)。

## ref() & reactive() with private class fields

 `ref()` 或是 `reactive()` 在 vue3 很常見，但是這兩個方法都有一個共同的問題，就是當你參照到一個有私有屬性的物件時，會出現錯誤。

``` vue
<script setup>
class Secret {
  #secret
  constructor(secret) {
    this.#secret = secret
  }
  get secret() {
    return "[REDACTED]"
  }
}

const aSecret = ref(new Secret('I am a secret'))
</script>

<template>
  <div>{{ aSecret.secret }}</div>
</template>
```

console 會出現以下錯誤：

```
Uncaught TypeError: Cannot read private member {$privateProperty} // [!code error]
from an object whose class did not declare it  // [!code error]
```

::: tip
[Private class fields]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) 可以在 class 內部宣告私有屬性，這些屬性只能在 class 內部存取。
:::




## vue3 reactivity system

要探討為什麼會有這個問題，要先知道 vue3 的 reactivity system 是怎麼實作的。

vue3 使用 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 實作 reactivity system，Proxy 可以監聽物件的讀取、寫入、刪除等操作，並且可以在這些操作發生時觸發 callback。

`ref()` 和 `reactive()` 會將物件包裝成 Proxy 物件，當你對這個物件進行操作時，Proxy 會觸發 callback，然後通知 vue3 去更新畫面。

vuejs github:
- [`ref()` 的實作](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts#L287)
- [`reactive()` 的實作](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts#L273)

## Proxy & private issue

但是 Proxy 並沒有辦法直接處理 Private class fields

``` js
class Secret {
  #secret;
  constructor(secret) {
    this.#secret = secret;
  }
  get secret() {
    return this.#secret.replace(/\d+/, "[REDACTED]");
  }
}

const aSecret = new Secret("123456");
console.log(aSecret.secret); // [REDACTED]
// Looks like a no-op forwarding...
const proxy = new Proxy(aSecret, {});
console.log(proxy.secret); // TypeError: Cannot read private member #secret from an object whose class did not declare it
```


[MDN: Proxy#no_private_property_forwarding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#no_private_property_forwarding)

> This is because when the proxy's get trap is invoked, the this value is the proxy instead of the original secret, so #secret is not accessible.


根據 MDN 的說明，當 Proxy 的 get trap 被觸發時，`this` 會是 Proxy 物件，而不是原本的物件，所以 Proxy 無法存取到私有屬性。

## 讓 Proxy 可以存取 private class fields

透過 handler 的 get trap，可以讓 Proxy 存取到私有屬性。

```js
const proxy = new Proxy(aSecret, {
  get(target, prop, receiver) {
    // By default, it looks like Reflect.get(target, prop, receiver)
    // which has a different value of `this`
    return target[prop];
  },
});
console.log(proxy.secret); // [REDACTED]
```

但可惜的是 vue3 的 reactivity system 並沒有辦法這麼做，所以當你使用 `ref()` 或 `reactive()` 時，就會出現錯誤。

## 總結

[Error when property value is an instance of a class using private class fields #8149](https://github.com/vuejs/core/issues/8149#issuecomment-1521009456)

在 vuejs 的 issue 中，有人提到了這個問題。可以看看 evan 的回答：

> In general, we recommend using plain objects over class instances as data sources. If you really need encapsulation and only expose certain reactive state, consider using Composition API and using [Composables](https://vuejs.org/guide/reusability/composables.html).

總結來說，vue3 的 reactivity system 並沒有辦法處理 private class fields，如果真的有封裝的需求，evan 推薦使用 Composition API 和 Composables。