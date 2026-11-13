+++
date = '2026-11-13T19:52:05+08:00'
draft = true
title = '[VulnHub靶机]Fowsniff渗透记录'
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

