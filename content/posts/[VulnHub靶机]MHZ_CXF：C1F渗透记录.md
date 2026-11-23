+++
date = '2026-11-23T10:27:11+08:00'
draft = false
title = '[VulnHub靶机]MHZ_CXF：C1F渗透记录'
tags = ['渗透','Vulnhub','隐写']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.23

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.23     00:0c:29:cb:7f:0b       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.035 seconds (125.80 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.23                    
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-23 19:50 +0800
Nmap scan report for 10.10.10.23
Host is up (0.00045s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:CB:7F:0B (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.83 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.23                  
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-23 19:51 +0800
Nmap scan report for 10.10.10.23
Host is up (0.00047s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 38:d9:3f:98:15:9a:cc:3e:7a:44:8d:f9:4d:78:fe:2c (RSA)
|   256 89:4e:38:77:78:a4:c3:6d:dc:39:c4:00:f8:a5:67:ed (ECDSA)
|_  256 7c:15:b9:18:fc:5c:75:aa:30:96:15:46:08:a9:83:fb (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.29 (Ubuntu)
MAC Address: 00:0C:29:CB:7F:0B (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: OpenWrt 21.02 (Linux 5.4) (97%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (97%), Linux 4.15 - 5.19 (97%), Linux 6.0 (96%), Linux 4.19 (96%), Linux 5.0 - 5.14 (95%), Linux 5.4 - 5.10 (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Linux 5.14 - 6.8 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.57 seconds
```

漏洞扫描, 没有收获

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.23                  
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-23 19:52 +0800
Nmap scan report for 10.10.10.23
Host is up (0.00034s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
MAC Address: 00:0C:29:CB:7F:0B (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.46 seconds
```

UDP扫描

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]                                                                                                            
└─$ sudo nmap -sU --top-ports 20 10.10.10.23                                                                                               
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-23 19:55 +0800
Nmap scan report for 10.10.10.23                                     
Host is up (0.00041s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain                                       
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc                                        
69/udp    closed        tftp      
123/udp   closed        ntp                                                                                                                
135/udp   closed        msrpc                                        
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm                                  
139/udp   closed        netbios-ssn                              
161/udp   closed        snmp                                         
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds                                 
500/udp   closed        isakmp    
514/udp   closed        syslog
520/udp   closed        route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m                                     
1900/udp  closed        upnp                                         
4500/udp  closed        nat-t-ike                                    
49152/udp open|filtered unknown                                      
MAC Address: 00:0C:29:CB:7F:0B (VMware)                              
                                                                     
Nmap done: 1 IP address (1 host up) scanned in 8.07 seconds
```

## Web渗透

访问80端口, 是Apache在Ubuntu上的默认页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MHZ_CXF%EF%BC%9AC1F/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

目录爆破

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ gobuster dir -u http://10.10.10.23/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,htm,sql,zip   
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.23/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              txt,php,html,htm,sql,zip
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
index.html           (Status: 200) [Size: 10918]
notes.txt            (Status: 200) [Size: 86]
server-status        (Status: 403) [Size: 276]
Progress: 1543906 / 1543906 (100.00%)
===============================================================
Finished
===============================================================
```

发现notes.txt, 访问得到两个文件名`remb.txt`和`remb2.txt`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MHZ_CXF%EF%BC%9AC1F/notes.avif)

访问remb.txt, 得到一组凭据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MHZ_CXF%EF%BC%9AC1F/remb.avif)

访问remb2.txt, 404

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MHZ_CXF%EF%BC%9AC1F/remb2.avif)

尝试使用用户名`first_stage`, 密码`flagitifyoucan1234`登录ssh, 成功

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ ssh first_stage@10.10.10.23             
The authenticity of host '10.10.10.23 (10.10.10.23)' can't be established.
ED25519 key fingerprint is: SHA256:Jxm0b2xUhxb2N50E9UVsgn5u7Pow8xX6o12kZDGlTlg
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.23' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
first_stage@10.10.10.23's password: 
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-96-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon Nov 23 12:06:02 UTC 2026

  System load:  0.06              Processes:            149
  Usage of /:   40.5% of 9.74GB   Users logged in:      0
  Memory usage: 47%               IP address for ens33: 10.10.10.23
  Swap usage:   0%


23 packages can be updated.
0 updates are security updates.


Last login: Fri Apr 24 18:18:07 2020 from 192.168.5.253
$ 
```

读取user.txt, 获得第一面flag

```shell
$ ls
user.txt
$ cat user.txt
HEEEEEY , you did it 
that's amazing , good job man

so just keep it up and get the root bcz i hate low privileges ;)

#mhz_cyber
```

## 权限提升

当前Shell为sh, 进入bash

```shell
$ bash
```

查看/home目录, 发现mhz_c1f的家目录

```shell
first_stage@mhz_c1f:/home$ ls -lah
total 16K
drwxr-xr-x  4 root        root        4.0K Apr 24  2020 .
drwxr-xr-x 24 root        root        4.0K Apr 13  2020 ..
drwxr-xr-x  5 first_stage first_stage 4.0K Apr 24  2020 first_stage
drwxr-xr-x  5 mhz_c1f     mhz_c1f     4.0K Apr 24  2020 mhz_c1f
```

进入发现存在Paintings文件夹, 里面全是图片

```shell
first_stage@mhz_c1f:/home$ cd mhz_c1f/
first_stage@mhz_c1f:/home/mhz_c1f$ ls -lah
total 44K
drwxr-xr-x 5 mhz_c1f mhz_c1f 4.0K Apr 24  2020 .
drwxr-xr-x 4 root    root    4.0K Apr 24  2020 ..
-rw-r--r-- 1 mhz_c1f mhz_c1f  220 Apr  4  2018 .bash_logout
-rw-r--r-- 1 mhz_c1f mhz_c1f 3.7K Apr  4  2018 .bashrc
drwx------ 2 mhz_c1f mhz_c1f 4.0K Apr 13  2020 .cache
drwx------ 3 mhz_c1f mhz_c1f 4.0K Apr 13  2020 .gnupg
-rw-r--r-- 1 mhz_c1f mhz_c1f  807 Apr  4  2018 .profile
-rw-r--r-- 1 mhz_c1f mhz_c1f    0 Apr 13  2020 .sudo_as_admin_successful
-rw------- 1 mhz_c1f mhz_c1f 9.6K Apr 24  2020 .viminfo
drwxrwxr-x 2 mhz_c1f mhz_c1f 4.0K Apr 24  2020 Paintings
first_stage@mhz_c1f:/home/mhz_c1f$ cd Paintings/
first_stage@mhz_c1f:/home/mhz_c1f/Paintings$ ls -lah
total 2.2M
drwxrwxr-x 2 mhz_c1f mhz_c1f 4.0K Apr 24  2020  .
drwxr-xr-x 5 mhz_c1f mhz_c1f 4.0K Apr 24  2020  ..
-rw-rw-r-- 1 mhz_c1f mhz_c1f 438K Apr 24  2020 '19th century American.jpeg'
-rw-rw-r-- 1 mhz_c1f mhz_c1f 348K Apr 24  2020 'Frank McCarthy.jpeg'
-rw-rw-r-- 1 mhz_c1f mhz_c1f 508K Apr 24  2020 'Russian beauty.jpeg'
-rw-rw-r-- 1 mhz_c1f mhz_c1f 906K Apr 24  2020 'spinning the wool.jpeg'
```

使用`scp`命令, 通过SSH将图片从靶机下载到攻击机

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ scp first_stage@10.10.10.23:/home/mhz_c1f/Paintings/* ./
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
first_stage@10.10.10.23's password:
19th century American.jpeg         100%  437KB  64.5MB/s   00:00
Frank McCarthy.jpeg                100%  348KB  68.9MB/s   00:00
Russian beauty.jpeg                100%  507KB  32.8MB/s   00:00
spinning the wool.jpeg             100%  905KB 105.6MB/s   00:00
```

从视觉上看似乎没有什么信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MHZ_CXF%EF%BC%9AC1F/4%E5%BC%A0%E5%9B%BE.avif)

查看文件类型, 都是jpeg

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ file *.jpeg
19th century American.jpeg: JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, Exif Standard: [TIFF image data, little-endian, direntries=3, software=Google], baseline, precision 8, 1600x994, components 3
Frank McCarthy.jpeg:        JPEG image data, JFIF standard 1.01, resolution (DPI), density 300x300, segment length 16, Exif Standard: [TIFF image data, big-endian, direntries=4], baseline, precision 8, 1500x2049, components 3
Russian beauty.jpeg:        JPEG image data, JFIF standard 1.02, resolution (DPCM), density 0x0, segment length 16, comment: "ACD Systems Digital Imaging", baseline, precision 8, 810x1280, components 3
spinning the wool.jpeg:     JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, baseline, precision 8, 2000x2000, components 3
```

binwalk也没有任何发现

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ binwalk *.jpeg

Scan Time:     2026-11-23 20:39:03
Target File:   /home/kali/MHZ_CXF_C1F/19th century American.jpeg
MD5 Checksum:  5cafa72a6fe50328afaba3de8a8d2926
Signatures:    436

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
30            0x1E            TIFF image data, little-endian offset of first image directory: 8


Scan Time:     2026-11-23 20:39:03
Target File:   /home/kali/MHZ_CXF_C1F/Frank McCarthy.jpeg
MD5 Checksum:  764d621ded4a62d04137349d0947610d
Signatures:    436

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
30            0x1E            TIFF image data, big-endian, offset of first image directory: 8
4704          0x1260          Copyright string: "Copyright (c) 1998 Hewlett-Packard Company"


Scan Time:     2026-11-23 20:39:03
Target File:   /home/kali/MHZ_CXF_C1F/Russian beauty.jpeg
MD5 Checksum:  fded779eef067f984aea9ecb68a3deac
Signatures:    436

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.02


Scan Time:     2026-11-23 20:39:03
Target File:   /home/kali/MHZ_CXF_C1F/spinning the wool.jpeg
MD5 Checksum:  44d2017fcafaa9ed3c30a0224473eda7
Signatures:    436

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
798451        0xC2EF3         JBOOT STAG header, image id: 9, timestamp 0x27400682, image size: 2328253178 bytes, image JBOOT checksum: 0x12E0, header JBOOT checksum: 0x83DC
```

使用steghid查看隐写信息, 发现`spinning the wool.jpeg`存在remb2.txt文件, 密码短语是空字符串

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ steghide info spinning\ the\ wool.jpeg
"spinning the wool.jpeg":
  format: jpeg
  capacity: 60.0 KB
Try to get information about embedded data ? (y/n) y
Enter passphrase: 
  embedded file "remb2.txt":
    size: 85.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes
```

提取文件

```shell
┌──(kali㉿kali)-[~/MHZ_CXF_C1F]
└─$ steghide extract -sf spinning\ the\ wool.jpeg
Enter passphrase: 
wrote extracted data to "remb2.txt".
```

查看remb2.txt内容, 得到用户mhz_c1f的密码

```shell
ooh , i know should delete this , but i cant' remember it 
screw me 

mhz_c1f:1@ec1f
```

在靶机中切换用户

```shell
first_stage@mhz_c1f:/home/mhz_c1f/Paintings$ su mhz_c1f
Password: 
mhz_c1f@mhz_c1f:~/Paintings$
```

sudo -l, 发现能执行任何命令, 直接提权

```shell
mhz_c1f@mhz_c1f:~/Paintings$ sudo -l
[sudo] password for mhz_c1f: 
Matching Defaults entries for mhz_c1f on mhz_c1f:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User mhz_c1f may run the following commands on mhz_c1f:
    (ALL : ALL) ALL
mhz_c1f@mhz_c1f:~/Paintings$ sudo su
root@mhz_c1f:/home/mhz_c1f/Paintings# whoami
root
```

读取flag

```shell
root@mhz_c1f:/home/mhz_c1f/Paintings# cd /root
root@mhz_c1f:~# ls -lah
total 32K
drwx------  3 root root 4.0K Apr 24  2020 .
drwxr-xr-x 24 root root 4.0K Apr 13  2020 ..
-rw-------  1 root root   54 Apr 24  2020 .bash_history
-rw-r--r--  1 root root 3.1K Apr  9  2018 .bashrc
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-r--r--  1 root root  124 Apr 24  2020 .root.txt
drwx------  2 root root 4.0K Apr 13  2020 .ssh
-rw-------  1 root root  833 Apr 24  2020 .viminfo
root@mhz_c1f:~# cat .root.txt 
OwO HACKER MAN :D

Well done sir , you have successfully got the root flag.
I hope you enjoyed in this mission.

#mhz_cyber
```
