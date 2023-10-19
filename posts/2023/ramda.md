---
sidebar: false
---

# 使用 ramda 和 functional programming 來格式化資料

從後端取得的資料，如果很複雜，可能會需要進行格式化，來指定一些預設值，或是將一些不需要的資料去除，這時候可以使用 ramda 來幫助我們。

## 取得資料

假如
```json
"response": {
  "data": {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "
  }
}
```

```js
R.path(['data', 'data'], response)
```

