+++
date = '2026-10-17T15:31:48+08:00'
draft = false
title = '【CTFSHOW】无字母数字命令执行'
tags = ["Web安全","CTFSHOW","CTF"]
+++

打开题目，直接输入命令发现无法执行，使用之前的字符串取反方法也无法绕过

![不允许字母](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/不允许字母.png)

![反转无效](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/反转无效.png)

## 题目分析
以Form表单形式提交，使用curl -F "code=ls" [题目地址]，发现可以正常处理

![接受form表单](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/发现接受form表单.png)

尝试上传文件，网页仍然可以正常返回，意味着目标可能会接收这个文件，即使页面中没有文件上传功能

![上传文件正常返回](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/上传文件正常返回.png)

可以考虑使用文件上传+通配符注入来执行代码

1.在php中，上传的文件会临时保存在/tmp/phpXXXXXX，其中XXXXXX是随机大小写字母，如果上传后没有使用move_uploaded_file()移动位置，那么就会在脚本运行结束后自动删除上传的文件，即HTTP 请求返回后文件就会被删除

2.在Bash中，.(点)等于source，即在当前终端进程中执行文件中的代码，例如 . test.sh就相当于source test.sh，意思是在当前终端内执行test.sh文件中的代码

3.在Linux中，可以使用以下统配来匹配文件：

? 代表1个任意字符

\* 代表任意数量的任意字符

[^x] 代表这个位置不是字符x

[a-z] 代表这个位置的字符在a-z范围内（ASCII码）

我们使用Form表单的形式同时提交code参数并上传bash脚本文件，code参数通过使用.（句点）加通配符来匹配并运行我们上传的脚本

我们可以通过/???/?????????来匹配文件，前三个?用来匹配字符tmp，后九个?用来匹配phpXXXXXX，但是这样通常会有多个匹配的文件，必须缩小范围，使其刚好能够匹配到我们上传的文件

![通配符示例](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/通配符示例.png)

最后使用的通配符为/???/????????[@-[] 意思是匹配以大写字母结尾的文件（大写字母的ASCII码范围在@和[中间），由于上传的文件名称是随机生成的，实际操作中可能无法一次成功，需要反复调整并尝试

## 漏洞利用
创建一个文件list.sh，内容就是 ls，然后通过curl以表单形式同时提交code参数并上传文件：

```bash
curl -F "code=. /???/????????[@-[]" -F "file=@list.sh" [题目地址]
```

在返回结果中可以看到当前目录中存在flag.php

![发现flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/发现Flag文件.png)

修改list.sh内容为 cat flag.php 再执行一遍相同的命令，即可得到flag：

![读取flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/无字母数字命令执行/读取flag.png)
> ## 参考资料
> [无字母数字webshell之提高篇 | 离别歌](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
>
> [AI渗透测试：只用3个符号就拿下了服务器！揭秘无字母数字RCE的终极玩法_wx68fc435ee4240的技术博客_51CTO博客](https://blog.51cto.com/u_17561223/14703704)