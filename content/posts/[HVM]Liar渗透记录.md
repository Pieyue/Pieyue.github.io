+++
date = '2026-11-07T20:34:13+08:00'
draft = true
title = '[HVM]Liar渗透记录'
+++

## 信息收集

攻击机IP: 10.10.10.3
靶机IP: 10.10.10.12

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ sudo arp-scan -l
Interface: eth0, type: EN10MB, MAC: 00:0c:29:5f:ca:d5, IPv4: 10.10.10.3
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
10.10.10.1      00:50:56:c0:00:08       VMware, Inc.
10.10.10.2      00:50:56:fc:41:2a       VMware, Inc.
10.10.10.12     00:0c:29:c6:a0:8e       VMware, Inc.
10.10.10.254    00:50:56:e0:f0:a6       VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.116 seconds (120.98 hosts/sec). 4 responded
```

探测端口开放情况

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ sudo nmap --min-rate 10000 -p- 10.10.10.12 -oA nmapscan/ports
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 22:44 +0800
Warning: 10.10.10.12 giving up on port because retransmission cap hit (10).
Nmap scan report for 10.10.10.12
Host is up (0.00042s latency).
Not shown: 65506 closed tcp ports (reset)
PORT      STATE    SERVICE
80/tcp    open     http
135/tcp   open     msrpc
139/tcp   open     netbios-ssn
445/tcp   open     microsoft-ds
3327/tcp  filtered bbars
5985/tcp  open     wsman
15017/tcp filtered unknown
17129/tcp filtered unknown
19801/tcp filtered unknown
26193/tcp filtered unknown
26822/tcp filtered unknown
27659/tcp filtered unknown
28982/tcp filtered unknown
32230/tcp filtered unknown
40248/tcp filtered unknown
40902/tcp filtered unknown
40912/tcp filtered unknown
47001/tcp open     winrm
47220/tcp filtered unknown
49664/tcp open     unknown
49665/tcp open     unknown
49666/tcp open     unknown
49667/tcp open     unknown
49668/tcp open     unknown
49673/tcp open     unknown
56406/tcp filtered unknown
58911/tcp filtered unknown
59434/tcp filtered unknown
59577/tcp filtered unknown
MAC Address: 00:0C:29:C6:A0:8E (VMware)

Nmap done: 1 IP address (1 host up) scanned in 14.78 seconds
```

因为端口较多, 所以提取开放的端口并存入变量

```shell
ports=$(grep open nmapscan/ports.nmap | awk -F'/' '{print $1}' | paste -sd ',')
```

详细扫描

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ sudo nmap -sT -sV -sC -O -p$ports 10.10.10.12 -oA nmapscan/detail
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 22:49 +0800
Nmap scan report for 10.10.10.12
Host is up (0.00094s latency).

PORT      STATE SERVICE       VERSION
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-title: Site doesn't have a title (text/html).
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49673/tcp open  msrpc         Microsoft Windows RPC
MAC Address: 00:0C:29:C6:A0:8E (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Microsoft Windows Server 2019 (96%), Microsoft Windows 10 1709 - 22H2 (94%), Microsoft Windows 11 24H2 (93%), Microsoft Windows Server 2016 (93%), Microsoft Windows 10 21H2 (92%), Microsoft Windows 10 20H2 (91%), Microsoft Windows 10 1709 - 1803 (91%), Microsoft Windows 10 1909 (91%), Microsoft Windows 10 1809 (90%), Microsoft Windows 10 1903 (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_nbstat: NetBIOS name: WIN-IURF14RBVGV, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:c6:a0:8e (VMware)
| smb2-time:
|   date: 2026-11-07T14:50:41
|_  start_date: N/A
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 63.22 seconds
```
