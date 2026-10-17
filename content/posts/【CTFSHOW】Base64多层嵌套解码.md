+++
date = '2026-10-17T14:05:36+08:00'
draft = false
title = '【CTFSHOW】Base64多层嵌套解码'
tags = ["Web安全","CTFSHOW","CTF","编码"]
+++

开局一个登录框

![登录框](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/Base64%E5%A4%9A%E5%B1%82%E5%B5%8C%E5%A5%97%E8%A7%A3%E7%A0%81/%E7%99%BB%E5%BD%95%E6%A1%86.png)

打开开发者工具 ，发现被Base64编码的正确密码（correctPassword）和编码逻辑（validatePassword），那么只需要逆向编码算法 就可以了

![前端代码](https://raw.githubusercontent.com/Pieyue/blog_images/main/CTFSHOW/Base64%E5%A4%9A%E5%B1%82%E5%B5%8C%E5%A5%97%E8%A7%A3%E7%A0%81/%E5%89%8D%E7%AB%AF%E4%BB%A3%E7%A0%81.png)

从下往上逆向：
```javascript
return btoa(encoded) === correctPassword;
```
第一层很简单，直接解就好了
```python
from string import ascii_letters
from base64 import b64decode
from itertools import product
import requests
 
encoded = b'SXpVRlF4TTFVelJtdFNSazB3VTJ4U1UwNXFSWGRVVlZrOWNWYzU='
print("原始base64: ", encoded)
 
res = b64decode(encoded)
print("解码原始b64，得：", res)
```
解得：IzUFQxM1UzRmtSRk0wU2xSU05qRXdUVVk9cVc5

接下来是第二层
```javascript
encoded = btoa('aB3' + encoded + 'qW9').substr(2);
```
想要解开这一层，必须要在第一层的结果的开头加上2个字符，使其解码后以aB3开头，以qW9结尾，最后再去掉首尾字符，我们使用暴力破解：
```python
alpha_tab = ascii_letters + '0123456789+/'  # 所有合法字符
 
char_sets = [''.join(p) for p in product(alpha_tab, repeat=2)]  # 所有可能的组合
 
# 遍历每一种可能，直到找出符合的结果
for char_set in char_sets:
    decoded = b64decode(char_set.encode() + res)
 
    if decoded.startswith(b'aB3') and decoded.endswith(b'qW9'):
        res = decoded
        print("找到以aB3开头，qW9结尾的结果：", res)
        break
 
res = res[3:-3]
print("去掉首部aB3和尾部qW9后：", res)
 
res = b64decode(res)
 
print("去掉首位后再解码得：", res)
```
解得：==wSqdDS4JTR610MF

第三层
```javascript
encoded = btoa(encoded.split('').reverse().join(''));
```
反转字符串
```python
res = res[::-1] # FM016RTJ4SDdqSw==
print("反转字符串得：", res)
```
解得：FM016RTJ4SDdqSw==

第四层
```javascript
encoded = btoa(encoded + 'xH7jK').slice(3);
```
我们需要找到一个在开头补上3个字符再解码后，结尾是xH7jK的字符串，我们使用暴力破解，注意会有多个结果
```python
char_sets = [''.join(p) for p in product(alpha_tab, repeat=3)]
 
password_list = []  # 存储所有符合的结果
 
for char_set in char_sets:
    decoded = b64decode(char_set.encode() + res)
    if decoded.endswith(b'xH7jK'):
        try:
            password_list.append(b64decode(decoded[:-5]))
        except:
            continue
 
print(f"有{len(password_list)}个密码符合")
```
最后得到4096个符合的结果，使用requests库进行密码爆破，注意需要加上User-Agent参数绕过浏览器检测，否则会提示必须使用ctf-show-brower浏览器访问：
```python
for password in password_list:
    response = requests.post("https://1e2fc9aa-50dd-4f39-a660-d73db045a14f.challenge.ctf.show/check.php",
                  data={
                      "username":"admin",
                      "password":password
                  },
                  verify=False,
                  headers={"User-Agent": "ctf-show-brower"})
    if "Incorrect password" not in response.text:
        print("正确密码：", password)
        print(response.text)
        break
```
最终得到正确密码为 \x8f\xe17316，flag为CTF{base64_brute_force_success}

![flag](https://raw.githubusercontent.com/Pieyue/blog_images/main/CTFSHOW/Base64%E5%A4%9A%E5%B1%82%E5%B5%8C%E5%A5%97%E8%A7%A3%E7%A0%81/flag.png)

完整解题代码：
```python
from string import ascii_letters
from base64 import b64decode
from itertools import product
import requests
 
encoded = b'SXpVRlF4TTFVelJtdFNSazB3VTJ4U1UwNXFSWGRVVlZrOWNWYzU='
print("原始base64: ", encoded)
 
res = b64decode(encoded)
print("解码原始b64，得：", res)
 
alpha_tab = ascii_letters + '0123456789+/'  # 所有合法字符
 
char_sets = [''.join(p) for p in product(alpha_tab, repeat=2)]  # 所有可能的组合
 
# 遍历每一种可能，直到找出符合的结果
for char_set in char_sets:
    decoded = b64decode(char_set.encode() + res)
 
    if decoded.startswith(b'aB3') and decoded.endswith(b'qW9'):
        res = decoded
        print("找到以aB3开头，qW9结尾的结果：", res)
        break
 
res = res[3:-3]
print("去掉首部aB3和尾部qW9后：", res)
 
res = b64decode(res)
 
print("去掉首位后再解码得：", res)
 
res = res[::-1]
 
print("反转字符串得：", res)
 
char_sets = [''.join(p) for p in product(alpha_tab, repeat=3)]
 
password_list = []  # 存储所有符合的结果
 
for char_set in char_sets:
    decoded = b64decode(char_set.encode() + res)
    if decoded.endswith(b'xH7jK'):
        try:
            password_list.append(b64decode(decoded[:-5]))
        except:
            continue
 
print(f"有{len(password_list)}个密码符合")
 
for password in password_list:
    response = requests.post("https://1e2fc9aa-50dd-4f39-a660-d73db045a14f.challenge.ctf.show/check.php",
                  data={
                      "username":"admin",
                      "password":password
                  },
                  verify=False,
                  headers={"User-Agent": "ctf-show-brower"})
    if "Incorrect password" not in response.text:
        print("正确密码：", password)
        print(response.text)
        break
```