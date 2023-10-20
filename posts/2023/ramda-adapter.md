---
sidebar: false
---

# 使用 ramda 的 applySpec 製作轉接器來初始化資料

## 在開始之前

先想像一個情境，我們從後端取得商品資訊，但是這個商品未來可能有多種不同的資料格式（單一商品、學生優惠商品、合購商品），來看一下範例：

## 第一個任務：type 1 單一商品規格

```json
"product": {
  "id": 1,
  "type": 1,
  "name": "iphone15 pro",
  "price": 30000,
  "description": "最新款的 iphone，超級貴",
}
```

我們的首要任務是在處理資料的時候讓規格有自己的預設值，或是想要將資料格式統一，這時候就可以使用 ramda 來幫助我們。

### 製作第一個轉接器

這裡我們會用到 ramda 的 [applySpec](https://ramdajs.com/docs/#applySpec) 和 [propOr](https://ramdajs.com/docs/#propOr) 來幫助我們製作轉接器。

```js
import R from 'ramda'

const toGeneralProduct = R.applySpec({
  id: R.propOr(0, 'id'),
  type: R.propOr(1, 'type'),
  name: R.propOr('', 'name'),
  price: R.propOr(0, 'price'),
  description: R.propOr('', 'description'),
})

console.log(toGeneralProduct({}))
/*
{
  id: 0,
  type: 1,
  name: '',
  price: 0,
  description: '',
}
*/
```

## 第二個任務：type 2 單一商品規格，包含學生方案的訊息

隔天，我們的後端同事跟我們說，這個商品有學生方案，可以打八折，所以會多一種型態，來看一下範例：

```json
"product": {
  "id": 2,
  "type": 2,
  "name": "mac book pro",
  "price": 50000,
  "description": "最新款的 mac book，超級貴",
  // 新增的部分
  "student": {
    "discount": 0.8,
    "description": "學生方案，打八折"
  }
}
```

可是兩個轉接器很像，不想要重寫，此時可以怎麼擴充比較好呢？

### 首先重構一下第一個轉接器
```js
import R from 'ramda'

// 將欄位的預設值處理抽出來，也可以當作是規格方便對照
const getId = R.propOr(0, 'id')
const getType = R.propOr(-1, 'type')
const getName = R.propOr('', 'name')
const getPrice = R.propOr(0, 'price')
const getDescription = R.propOr('', 'description')

// 將規格抽出方便等等共用
const generalProductSpec = { 
  id: getId,
  type: getType,
  name: getName,
  price: getPrice,
  description: getDescription,
}

const toGeneralProduct = 
  R.applySpec(generalProductSpec)

```

### 混合第一個轉接器，衍伸第二個轉接器

這裡會用到一個新的 ramda 方法 [pipe](https://ramdajs.com/docs/#pipe) 來幫助我們串接多個函式。

```js
import R from 'ramda'
/* ... */

const getDiscount = R.propOr(1, 'discount')
const getStudent = R.propOr({}, 'student')

/* ... */

// 剛剛的轉接器
const toGeneralProduct = 
  R.applySpec(generalProductSpec)


// 準備要新增的擴充欄位轉接器
const studentDiscountSpec = {
  discount: getDiscount,
  description: getDescription,
}

const toStudentDiscountDetail = R.applySpec(studentDiscountSpec)

// 將兩個轉接器合併
const toGeneralProductWithStudentDiscount = 
  R.applySpec({
  ...generalProductSpec,
  student: R.pipe(getStudent, toStudentDiscountDetail)
})

console.log(toGeneralProductWithStudentDiscount({}))
/*
{
  id: 0,
  type: 1,
  name: '',
  price: 0,
  description: '',
  student: {
    discount: 1,
    description: ''
  }
}
*/
```


## 第三個任務：type 3 合購商品規格，包含合購方案的訊息

突然，PM 大大跟我們說，我們要推出合購方案，可以一次買兩個商品，來看一下範例：

```json
"product": {
  "id": 3,
  "type": 3,
  "name": "iphone15 pro & apple watch",
  "price": 35000,
  "description": "我是合購方案，買兩個商品更優惠",
  // 新增的部分
  "contents": [
    {
      "name": "iphone15 pro",
      "price": 30000,
      "description": "最新款的 iphone，超級貴",
    },
    {
      "name": "apple watch",
      "price": 10000,
      "description": "最新款的 apple watch，超級貴",
    }
  ]
}
```

此時如法泡製，繼續利用規格擴充的方式來處理。

### 混合第一個轉接器，衍伸第三個轉接器

```js
import R from 'ramda'

/* ... */

const getContent = R.propOr([], 'content')

/* ... */

// 準備要新增的擴充欄位轉接器

const packageContentSpec = {
  name: getName,
  price: getPrice,
  description: getDescription,
}

const toPackageContentForList = R.map(
  R.applySpec(packageContentSpec)
)

// 將兩個規格合併
const toPackageProduct = R.applySpec({
  ...generalProductSpec,
  contents: R.pipe(getContent, toPackageContentForList),
})

console.log(toPackageProduct({}))
/*
{
  id: 0,
  type: 1,
  name: '',
  price: 0,
  description: '',
  contents: []
}
*/
```

## 最後一步：判斷商品型態，使用對應的轉接器

將轉接器包裝成一個函式，並且判斷商品型態，使用對應的轉接器。

```js

import R from 'ramda'

const getType = R.propOr(-1, 'type')

export const toProduct = product => {
  if(getType(product) === 1) {
    return toGeneralProduct(product)
  } else if (getType(product) === 2) {
    return toGeneralProductWithStudentDiscount(product)
  } else if (getType(product) === 3) {
    return toPackageProduct(product)
  } else {
    return false
  }
}
```

最終不管後端傳來什麼樣的型態的商品，這個轉接器都可以將資料轉換成我們想要的格式。

## 總結
使用 ramda 的 applySpec 來建立規格有幾點好處：
1. 可以將規格抽出來，方便維護
2. 可以將規格當作是文件，方便對照
3. 可以將規格當作是轉接器，方便擴充
4. 當規格異動時，只需要修改規格，不需要修改轉接器
5. 當前後端規格不同時，頁面不會直接報錯，而是會有預設值

## bonus: coding style : functional programming vs mixin

ramda 提供了很多 functional programming 的函式，可以自由選擇想要使用哪一種方法：

### functional programming

```js

import R from 'ramda'

// type 1

const toGeneralProduct = R.applySpec({
  id: R.propOr(0, 'id'),
  type: R.propOr(0, 'type'),
  name: R.propOr('', 'name'),
  price: R.propOr(0, 'price'),
  description: R.propOr('', 'description'),
})

// type 2

const toStudentDiscountDetail = R.applySpec({
  discount: R.propOr(1, 'discount'),
  description: R.propOr('', 'description'),
})

const toGeneralProductWithStudentDiscount = R.converge(
  R.mergeRight,
  [
    toGeneralProduct,
    R.applySpec({
      student: R.pipe(
        R.propOr({}, 'student'),
        toStudentDiscountDetail,
      ),
    }),
  ]
)

// type 3

const toPackageContentDetail = R.applySpec({
  name: R.propOr('', 'name'),
  price: R.propOr(0, 'price'),
  description: R.propOr('', 'description'),
})

const toPackageProduct = R.converge(
  R.mergeRight,
  [
    toGeneralProduct,
    R.applySpec({
      content: R.pipe(
        R.propOr([], 'content'),
        R.map(toPackageContentDetail),
      ),
    }),
  ]
)

export const toProduct = R.cond([
  [R.propEq('type', 1), toGeneralProduct],
  [R.propEq('type', 2), toGeneralProductWithStudentDiscount],
  [R.propEq('type', 3), toPackageProduct],
  [R.T, toGeneralProduct],
])

```

### mixin （本次範例使用）

```js
import R from 'ramda'

const getId = R.propOr(0, 'id')
const getType = R.propOr(-1, 'type')
const getName = R.propOr('', 'name')
const getPrice = R.propOr(0, 'price')
const getDiscount = R.propOr(1, 'discount')
const getDescription = R.propOr('', 'description')
const getStudent = R.propOr({}, 'student')
const getContent = R.propOr([], 'content')

// type 1

const generalProductSpec = { 
  id: getId,
  type: getType,
  name: getName,
  price: getPrice,
  description: getDescription,
}

const toGeneralProduct = 
  R.applySpec(generalProductSpec)

// type 2

const studentDiscountSpec = {
  discount: getDiscount,
  description: getDescription,
}

const toStudentDiscountDetail = R.applySpec(studentDiscountSpec)

const toGeneralProductWithStudentDiscount = 
  R.applySpec({
  ...generalProductSpec,
  student: R.pipe(
    getStudent,
    toStudentDiscountDetail
  )
})


// type 3

const packageContentSpec = {
  name: getName,
  price: getPrice,
  description: getDescription,
}

const toPackageContentForList = R.map(
  R.applySpec(packageContentSpec)
)

const toPackageProduct = R.applySpec({
  ...generalProductSpec,
  contents: R.pipe(getContent, toPackageContentForList),
})


export const toProduct = product => {
  if(getType(product) === 1) {
    return toGeneralProduct(product)
  } else if (getType(product) === 2) {
    return toGeneralProductWithStudentDiscount(product)
  } else if (getType(product) === 3) {
    return toPackageProduct(product)
  } else {
    return false
  }
}

```