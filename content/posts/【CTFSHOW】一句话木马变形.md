+++
date = '2026-10-17T15:15:42+08:00'
draft = false
title = '【CTFSHOW】一句话木马变形'
tags = ["Web安全","CTFSHOW","CTF","编码","php"]
+++

## 观察题目
开局一个输入框，可以执行php代码

![输入框](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/开局.png)

输入echo 'HelloWord'; 提示只有字母，数组，下划线，括号，分号允许

![输入echo](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/输入echo.png)

输入system(ls )，发现当前目录中存在flag.php

![发现flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/发现flag文件.png)

尝试访问flag.php，结果一片空白

![尝试访问](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/尝试访问flag.png)

## 解法
### 方法一：base64编码命令

将cat flag.php编码成base64：Y2F0IGZsYWcucGhw

system(base64_decode(Y2F0IGZsYWcucGhw));

php的eval ()会从内向外解析，所以会先调用base64_decode()将命令还原成字符串，再通过system()执行，得到flag

![法1](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/法1base64编码命令.png)

### 方法二：show_source()

使用函数：

getcwd()：获取当前路径，也可以使用常量__DIR__

scandir(path)：列出path内的所有文件，返回一个数组

print_r(Array)：打印数组

array_reverse(Array)：反转数组

next(Array)：将指针向后挪动一个单位并返回其值，从第一个元素开始

show_source(file_path)：读取并打印php文件源码

首先查看当前目录结构在数组中的样子，我们需要把flag.php移动到第二个位置（即[1]处），这样next()才能读到它

![法2查看目录结构](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/法2查看目录结构.png)

使用array_reverse()将数组反转，让flag.php位于第二个位置

![反转数组](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/法2反转数组.png)

next()将指针向后挪动一个单位并返回其值，就能得到字符串flag.php

![移动指针](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/法2获得字符串flag.php.png)

最后再使用show_source()就可以查看flag.php的源码，得到flag

![读取flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/一句话木马变形/法2使用show_source读取flag.png)