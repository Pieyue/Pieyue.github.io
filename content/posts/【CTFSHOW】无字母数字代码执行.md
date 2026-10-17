+++
date = '2026-10-17T15:25:24+08:00'
draft = false
title = '【CTFSHOW】无字母数字代码执行'
tags = ["Web安全","CTFSHOW","CTF","编码","WAF绕过"]
+++

打开题目，是一个输入框

![输入框](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/开局.png)

输入包含字母或数字的代码时，会出现提示Error: Invalid shell code!

![不允许出现字母或数字](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/不允许出现字母或数字.png)

我们可以通过按位反转字符串的方式绕过

在php中，运算符  ~ 可以将字符串按位反转，举个例子：字符"A"的二进制表示是01000001，那么~"A"就是10111110，不过反转后的字符串可能不是可打印字符，我们需要对其进行url编码

![反转字符](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/反转字符.png)

在执行时，我们再进行一次反转，就可以复原字符串，从而绕过WAF

![反转字符结果](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/反转字符结果.png)

分别编码system和ls，即可执行ls命令，发现flag.php在当前目录中（第一个括号是被编码的函数名，第二个是被编码的参数）

![反转system和ls](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/反转system和ls.png)

![发送编码后的system和ls](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/发送编码后的system和ls.png)

继续编码cat flag.php，执行获得flag

![反转cat](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/编码cat.png)

![获得flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字代码执行/获得flag.png)