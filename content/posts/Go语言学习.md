+++
date = '2026-11-19T19:20:17+08:00'
draft = false
title = 'Go语言学习'
tags = ['Go']
categories = ['学习笔记']
+++

虽然AI已经能写大部分代码了，但了解一些语言基础还是有必要的

## Go常用命令

```shell
go run .            # 编译到临时目录并立即运行，不产生文件（开发时用）
go build            # 生成可执行文件在当前目录
go fmt ./file.go    # 格式化代码
go vet ./file.go    # 静态检查常见错误
go mod tidy         # 按代码实际引用，增删依赖
go env              # 查看全部环境变量
```

## 第一个Go程序

```go
package main    // 可执行程序必须叫main包

import "fmt"    // 导入标准库的格式化输出包

func main() {   // 唯一入口
    fmt.Println("Hello, Go!")
}
```

运行

```shell
go run .
Hello, Go!
```

### 常用输出函数/格式化动词

| 函数 | 说明 |
| ---- | --- |
| Print | 极简输出, 非字符串类型之间加空格, 无格式化字符, 不会自动在末尾加换行符 |
| Printf | 不会自动加空格和换行符, 支持格式化字符, 类似于C的printf |
| Println | 会自动加空格和换行符, 但不支持格式化字符 |

| 分类 | 动词 | 说明与示例 |
| :--- | :--- | :--- |
| **通用** | `%v` | 默认格式的值（万能占位符） |
| | `%+v` | 类似 `%v`，但输出结构体时会添加字段名 |
| | `%#v` | Go 语法表示的值（常用于调试） |
| | `%T` | 打印变量的类型 |
| **布尔值** | `%t` | `true` 或 `false` |
| **整数** | `%d` | 十进制表示 |
| | `%b` | 二进制表示 |
| | `%o` | 八进制表示 |
| | `%x` | 十六进制表示（小写 a-f） |
| | `%X` | 十六进制表示（大写 A-F） |
| | `%c` | 对应 Unicode 码点的字符（例如 65 输出 'A'） |
| | `%U` | Unicode 格式（例如 U+0041） |
| | `%q` | 单引号包裹的字符字面量（例如 'A'） |
| **浮点数与复数** | `%f` | 十进制小数（默认精度 6 位，如 3.141593） |
| | `%.2f` | 保留 2 位小数的十进制小数（如 3.14） |
| | `%e` | 科学计数法（小写 e，如 3.141593e+00） |
| | `%E` | 科学计数法（大写 E） |
| | `%g` | 根据情况自动选择 `%e` 或 `%f`（最紧凑表示） |
| **字符串与字节切片** | `%s` | 原样输出字符串 |
| | `%q` | 双引号包裹的字符串（安全转义特殊字符，如 "你好"） |
| | `%x` | 每个字节输出为十六进制（小写） |
| | `%X` | 每个字节输出为十六进制（大写） |
| **指针** | `%p` | 十六进制表示的指针地址（带 0x 前缀） |
| **宽度与精度控制** | `%6d` | 宽度为 6 的整数，默认右对齐（不足补空格） |
| | `%-6d` | 宽度为 6 的整数，左对齐 |
| | `%06d` | 宽度为 6 的整数，不足补 0（如 000042） |
| | `%.3s` | 字符串截断，最多输出 3 个字符 |
| | `%*d` | 通过参数动态指定宽度（例如 `fmt.Printf("%*d", 5, 42)`） |

## 变量与类型

### 三种声明方式

```go
var a int = 42 // 完整写法：var 名字 类型 = 值
var b = 42     // 省略类型，字面量推导为 int
c := 42        // 短声明，:= 是"声明+赋值"，只能在函数内
```

| 写法 | 位置 | 说明 |
| --- | --- | --- |
| `var a int = 42` | 函数内/外 | 能显式指定类型 |
| `var b = 42` | 函数内/外 | 靠推导 |
| `c := 42` | **仅函数内** | 包级别（全局）不能用 |

一次声明多个：

```go
var x, y int = 1, 2
m, n := "hello", 3.14 // m 是 string，n 是 float64
```

### 零值

Python 里变量必须先赋值才能用，Go 里声明即有零值，不存在"未定义"：

| 类型 | 零值 |
| --- | --- |
| `int` / `float64` | `0` / `0` |
| `string` | `""` |
| `bool` | `false` |
| 指针 / slice / map / func / interface | `nil` |

```go
var zi int
var zs string
var zp *int
fmt.Printf("%d %q %v\n", zi, zs, zp) // 0 "" <nil>
```

### 整型家族

```go
var i8 int8 = 127   // -128 ~ 127，写 128 直接编译报错
var u8 uint8 = 255
var r rune = '中'   // rune = int32，一个 Unicode 码点；'x' 是字符字面量
var by byte = 'A'   // byte = uint8，一个字节
```

- 有符号：`int8 int16 int32 int64 int`
- 无符号：`uint8 uint16 uint32 uint64 uint`
- `int` 是 32 位还是 64 位取决于平台，**不要假设是 64 位**
- `byte` 和 `rune` 只是别名，实际就是 `uint8` / `int32`
- 没有 `char`，单引号 `'a'` 是 rune，双引号 `"a"` 是 string

### string 是只读字节序列

Go 的 string 底层是 UTF-8 字节数组，**`len()` 返回字节数不是字符数**：

```go
s := "上海 Go"
len(s)                        // 9（上=3 海=3 空格=1 G=1 o=1）
utf8.RuneCountInString(s)     // 5（字符数，需 import "unicode/utf8"）
s[0]                          // 228，取到的是第 1 个字节，不是"上"
string(s[0])                  // "ä"，乱码，因为它只是 UTF-8 的一个碎片
```

`for range` 按字符遍历，`i` 是字节偏移：

```go
for i, ch := range s {
    fmt.Printf("byte偏移=%d 字符=%c\n", i, ch)
}
// byte偏移=0 字符=上
// byte偏移=3 字符=海
// byte偏移=6 字符= 
```

### 类型转换必须显式

Go 没有隐式转换，`int` → `int64` 也要写出来：

```go
var n1 int = 10
f1 := float64(n1)   // int -> float64
var ff float64 = 3.99
n2 := int(ff)       // 3，直接截断小数，不是四舍五入
```

坑：字面常量直接转会编译失败，因为编译器编译期就知道要丢精度：

```go
int(3.99) // cannot convert 3.99 (untyped float constant) to type int
```

### 整数除法会截断

```go
7 / 2    // 3
7 / 2.0  // 3.5
7 % 2    // 1
```

### 常量与 iota

```go
const Pi = 3.14159 // 常量不能改，且必须是编译期可求值

/*
iota 是 Go 语言中的一个特殊常量，它只能在 const 声明块中使用。它的规则是：
- 每当遇到一个新的 const 行，iota 的值就会自动加 1。
- 每次遇到 const 关键字（开启一个新的常量块），iota 会重置为 0。
*/
const (
    _  = iota             // iota 在 const 块内从 0 开始，每行 +1
    KB = 1 << (10 * iota) // iota=1 → 1024(1向左移动10位, 2¹⁰)
    MB                    // 省略表达式 = 重复上一行 → 1<<20
    GB                    // 1<<30
)
```

### 其他小技巧

```go
p, q := 1, 2
p, q = q, p   // 多重赋值，交换不用临时变量

_, second := 100, 200 // _ 空白标识符：接收但丢弃
```

### 坑：声明了不用

```go
unused := 1 // 编译错误：declared and not used: unused
```

Go 强制要求变量和 import 都被使用，避免 Python 那种"残留死变量"。调试时临时不用可以加 `_ = unused`。

## 整数溢出

Go 的溢出规则取决于**是常量还是运行时变量**，这点必须分清。

### 常量表达式：编译期拦截

```go
var c int8 = 100 + 100
// cannot use 100 + 100 (untyped int constant 200) as int8 value in variable
// declaration (overflows)
```

因为 `100 + 100` 是**无类型常量**，编译器在编译期就算出 200，发现超出 `int8` 上限 127，直接报错。同理：

```go
var x int = 3.99  // 拒绝：会丢小数
int(3.99)         // 拒绝：同上
```

### 运行时运算：静默回绕，不报错

一旦运算发生在**变量之间**，编译器不再检查，结果按二进制补码回绕：

```go
var score int8 = 100
score = score + 100
fmt.Println(score) // -56
```

为什么是 -56：`int8` 是 8 位补码，200 = `0b11001000`，最高位为 1 被解释成负数，取反加一得 56，所以是 -56。等价于 `(100+100) mod 256 = 200`，再映射到 -128~127 区间。

无符号类型同样回绕：

```go
var u uint8 = 200
u = u + 100        // 300 mod 256 → 44

var under uint8 = 0
under = under - 1  // 下溢 → 255
```

### 边界值常量

```go
math.MaxInt8   // 127
math.MinInt8   // -128
math.MaxUint8  // 255
math.MaxInt64  // 9223372036854775807
```

### 怎么防止

1. **优先用 `int`**：64 位平台上就是 `int64` 范围，日常业务几乎不可能溢出。`int8`/`int16` 只在处理二进制协议、图像像素时才用。
2. **用更大类型计算再判断**：
   ```go
   if int(a)+int(b) > math.MaxInt8 { /* 拒绝 */ }
   ```
3. **符号翻转检测**（有符号）：
   ```go
   if a > 0 && b > 0 && a+b < 0 { /* 溢出 */ }
   ```
4. 高精度/加密场景用 `math/big`，或 `math/bits` 的 `Add64`/`Mul64` 取进位标志。

### 对比

| | Python | C | Go |
| --- | --- | --- | --- |
| 整数溢出 | 自动转大整数，永不溢出 | 静默回绕（UB） | 静默回绕（**有定义**，不会 UB） |
| 常量溢出 | 不可能 | 编译器可能警告 | **编译错误** |
| 检查开关 | — | 无 | 无内建，需手写 |

## 控制流

### if

条件**不加括号**，但花括号**必须有**，且左花括号不能另起一行（Go 强制格式）：

```go
if score >= 90 {
    fmt.Println("A")
} else if score >= 80 {
    fmt.Println("B")
} else {
    fmt.Println("C")
}
```

`if` 可以带初始化语句，变量作用域只在这个 if-else 链内：

```go
if doubled := score * 2; doubled > 150 {
    fmt.Println(doubled)
}
// fmt.Println(doubled) // 编译错误：undefined: doubled
```

Go 最典型的错误处理形态（第 4 课反复出现）：

```go
if err := run(); err != nil {
    return err
}
```

条件**必须是 bool**，不能拿整数当真假（和 C 不同）：

```go
// if 1 { }      // 编译错误
// if score { }  // 编译错误
if score != 0 { } // 想表达"非零"必须显式写明
```

### for

Go 只有 `for` 一个循环关键字，Python 的 `for` 和 `while` 都由它承担。

| 形式 | 写法 | 等价于 |
| --- | --- | --- |
| 三段式 | `for i := 0; i < n; i++` | C 的 for |
| 仅条件 | `for n < 100` | `while` |
| 死循环 | `for { }` | `while(true)` |
| 遍历 | `for i, v := range xs` | `for x in xs` |

```go
sum := 0
for i := 0; i < 5; i++ { sum += i }   // 10

n := 1
for n < 100 { n *= 2 }                 // 128

for {
    count++
    if count == 3 { break }
}
```

`range` 的四种用法：

```go
fruits := []string{"apple", "banana", "cherry"}

for i, v := range fruits { }  // 下标 + 值
for _, v := range fruits { }  // 只要值
for i := range fruits { }     // 只要下标
for range fruits { }          // 都不要，只循环 n 次
```

**关键坑**：`v` 是副本，改它不影响原切片；要修改必须靠下标。

```go
nums := []int{1, 2, 3}
for _, v := range nums { v *= 10 }    // nums 仍是 [1 2 3]
for i := range nums { nums[i] *= 10 } // 变成 [10 20 30]
```

字符串用 `range` 按**字符（rune）**遍历，下标是字节偏移（第 1 课讲过）。

### switch

默认**不穿透**，不需要 `break`（和 C 完全相反）：

```go
switch day {
case 6, 7:              // 一个 case 多个值，用逗号
    fmt.Println("周末")
case 1:
    fmt.Println("周一")
default:
    fmt.Println("工作日")
}
```

无表达式 `switch`：把长 if-else 链写得更整齐，命中即退出：

```go
switch {
case score >= 90: fmt.Println("A")
case score >= 80: fmt.Println("B")
case score >= 60: fmt.Println("C")
default:          fmt.Println("不及格")
}
```

带初始化语句，变量只在 switch 内可见：

```go
switch x := 3; x {
case 3: fmt.Println("x 是 3")
}
```

`fallthrough` 强行穿透，必须是 case 的最后一条语句：

```go
switch 2 {
case 2:
    fmt.Println("2")
    fallthrough      // 继续执行 case 3
case 3:
    fmt.Println("3")
}
```

类型 switch，判断 interface 的具体类型（第 6 课详讲）：

```go
switch t := anything.(type) {
case int:    fmt.Println("int", t)
case string: fmt.Println("string", t)
default:     fmt.Println("其他")
}
```

### 标签：跳出多层循环

```go
outer:
for i := 0; i < 5; i++ {
    for j := 0; j < 5; j++ {
        if i*j == 6 {
            break outer      // 直接跳出外层
        }
    }
}
```

`continue outer` 同理：跳过整个内层、进入外层下一次迭代。标签必须紧贴循环语句上方。

### 同包多文件

同一目录下所有 `.go` 文件必须用**同一个包名**，编译时视为一体，互相调用不需要 import：

```text
02-control/
├── main.go    // package main: main() + demoIf/demoFor/demoSwitch/demoLabel
└── helper.go  // package main: run()、init()
```

`init()` 无需手动调用，包初始化时自动执行，且在 `main()` 之前。

## 数组与切片

### 数组 vs 切片

| | 数组 `[3]int` | 切片 `[]int` |
| --- | --- | --- |
| 长度 | 类型的一部分，`[3]int` ≠ `[4]int` | 运行时可变 |
| 赋值/传参 | **整体拷贝** | 只拷贝 header（指针+len+cap），底层数组共享 |
| 声明 | `var a [3]int` | `var s []int` |
| 使用频率 | 很少 | 几乎全部场景 |

```go
arr := [3]string{"a", "b", "c"}
arr2 := arr
arr2[0] = "X"        // arr 不变 —— 值类型

sl := []string{"a", "b", "c"}
sl2 := sl
sl2[0] = "X"         // sl 也变了 —— 共享底层数组
```

### 创建切片

```go
a := []int{1, 2, 3}          // 字面量，len=3 cap=3
b := make([]int, 3)          // [0 0 0]，已置零
c := make([]int, 3, 10)      // len=3 cap=10，预留容量
var d []int                  // nil 切片，len=0 cap=0
```

### len 和 cap

- `len`：当前能看到几个元素
- `cap`：底层数组从切片起点算，还能放几个

```go
s := make([]int, 2, 5)   // len=2 cap=5
s = append(s, 1, 2)      // len=4 cap=5（没扩容）
s = append(s, 3, 4, 5)   // len=7 cap=10（超了，重新分配）
```

访问 `s[i]` 时 i 必须 < len，即使 cap 还有空间，越界照样 panic。

### append

```go
var s []int              // nil 切片也能直接 append
s = append(s, 1)         // 必须接收返回值
s = append(s, 2, 3, 4)   // 一次追加多个
s = append(s, other...)  // 追加另一个切片，末尾三个点

append(t, 4)             // 编译错误：value of type []int is not used
```

Go 对 append 丢返回值会在编译期报错，这点比 Python 的 `list.append()` 更安全（不过也要注意 `append` 不是原地修改）。

扩容规律（实测）：起点 cap 0 → 1 → 4 → 8，小切片大约翻倍，大切片约 1.25 倍，具体依实现而定，**不要依赖精确数值**。

### 切片表达式

```go
s := []int{0, 1, 2, 3, 4, 5}
s[1:4]    // [1 2 3]，左闭右开，不复制数据
s[:3]     // [0 1 2]
s[3:]     // [3 4 5]
```

三索引形式 `s[low:high:max]` 把新切片的 cap 限制为 `max-low`：

```go
t := s[1:4:4]   // len=3 cap=3
u := s[1:4]     // len=3 cap=5（一直延伸到原数组末尾）
```

### 坑：共享底层数组

这是切片最容易出事的地方。

**坑 1：切片表达式不复制，改子切片会改原切片**

```go
original := []int{1, 2, 3, 4, 5}
sub := original[1:3]
sub[0] = 999
// original 变成 [1 999 3 4 5]
```

**坑 2：append 可能踩坏原切片**

```go
a := make([]int, 3, 5)      // len=3 cap=5
a[0], a[1], a[2] = 1, 2, 3
b := a[0:2]                 // len=2 cap=5
b = append(b, 100)          // cap 够，直接写进 a[2]
// a 变成 [1 2 100]！
```

**解决：用三索引限制 cap**

```go
c := make([]int, 3, 5)
c[0], c[1], c[2] = 1, 2, 3
d := c[0:2:2]               // len=2 cap=2
d = append(d, 100)          // cap 不足，重新分配
// c 仍是 [1 2 3]
```

**要完全独立就 copy**

```go
e := []int{1, 2, 3}
f := make([]int, len(e))
copy(f, e)  // 返回实际复制个数
```

### nil 切片 vs 空切片

```go
var nilSlice []int      // == nil
emptySlice := []int{}   // != nil, len=0
madeEmpty := make([]int, 0)
```

len / append / range 中三者行为一致，差别在于：

- `nil == nil` 判断为 true，其余为 false
- JSON 编码时 **nil → `null`，空切片 → `[]`**（写 API 时常踩）

### 二维切片

```go
grid := [][]int{
    {1, 2, 3},
    {4, 5, 6},
}
```

每行长度可以不同（锯齿）。用 make 创建时要**逐行分配**，否则 panic：

```go
m := make([][]int, 2)          // 内层还是 nil
for i := range m {
    m[i] = make([]int, 3)      // 必须逐行分配
}
m[1][2] = 9

bad := make([][]int, 2)
bad[0][0] = 1                  // panic: index out of range
```

### 常用操作（slices 包，Go 1.21+）

```go
import (
    "sort"
    "slices"
)

s := []int{5, 2, 8, 1, 9, 3}
sort.Ints(s)                // 原地排序（无返回值）
slices.Reverse(s)           // 原地反转
slices.Contains(s, 8)       // true
slices.Index(s, 8)          // 下标
slices.Max(s) / slices.Min(s)
```

切片没有内建的删/插，用 append 拼：

```go
nums := []int{10, 20, 30, 40, 50}

nums = append(nums[:2], nums[3:]...)   // 删除下标 2
nums = slices.Insert(nums, 1, 15)      // 在下标 1 处插入
```

去重：

```go
slices.Sort(dup)              // 先排序
uniq := slices.Compact(dup)   // 去掉相邻重复
```

### 和 Python list 对比

| 操作 | Python | Go |
| --- | --- | --- |
| 创建 | `[1, 2, 3]` | `[]int{1, 2, 3}` |
| 追加 | `xs.append(4)` 原地 | `xs = append(xs, 4)` 返回新 |
| 长度 | `len(xs)` | `len(xs)` |
| 删除下标 | `del xs[2]` | `xs = append(xs[:2], xs[3:]...)` |
| 切片 | `xs[1:4]` 复制 | `xs[1:4]` **不复制，共享底层** |
| 判断包含 | `x in xs` | `slices.Contains(xs, x)` |
| 类型 | 可混合类型 | **元素类型必须一致** |

