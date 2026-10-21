+++
date = '2026-10-21T15:56:26+08:00'
draft = false
title = '[PortSwigger]OAuth2.0认证漏洞'
tags = ["PortSwigger","Web安全","OAuth"]
+++

## OAuth认证流程

1. 客户端应用程序请求访问用户数据的子集，指定他们想使用的授权类型和访问类型。
2. 用户会被提示登录OAuth服务，并明确同意所请求的访问权限。
3. 客户端应用程序会获得一个独特的访问令牌，证明他们获得了用户访问请求数据的权限。具体如何实现会因实现类型而有很大差异。
4. 客户端应用程序使用该访问令牌进行 API 调用，从资源服务器获取相关数据。

## 靶场记录

### Lab: Authentication bypass via OAuth implicit flow

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB1-%E6%8F%8F%E8%BF%B0.avif)

使用wiener的凭据进行一次正常登录, 观察请求:

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB1-%E8%A7%82%E5%AF%9F%E8%AF%B7%E6%B1%82%E8%AE%B0%E5%BD%95.avif)

发现向/authentication发送了凭据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1authentication%E6%8F%90%E4%BA%A4.avif)

将email改为`carlos@carlos-montoya.net`,发送后得到一个cookie

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1%E4%BF%AE%E6%94%B9%E5%8F%82%E6%95%B0.avif)

使用新cookie请求carlos的页面, 成功登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1%E6%88%90%E5%8A%9F%E7%99%BB%E5%BD%95.avif)

### Lab: Forced OAuth profile linking

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%8F%8F%E8%BF%B0.avif)

访问靶场, 使用传统方式登录后, 点击 `Attach a social profile` 关联社交媒体账号, 之后退出登录再通过社交媒体账号重新登录, 注意到`/oauth-linking`没有防止CSRF的state参数  

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%97%A0State%E5%8F%82%E6%95%B0.avif)

打开BurpProxy, 点击Attach a social profile, 复制网址后再丢弃这个请求

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%8B%A6%E6%88%AA.avif)

在exploit-server中通过iframe触发CSRF

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E5%88%A9%E7%94%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%AE%BE%E7%BD%AE.avif)

点击Deliver exploit to victim, 即可将管理员的账户绑定到我们的社交媒体账号上, 使用社交媒体账号重新登录即可进入管理员面板, 删除carlos账号

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E8%A7%A3%E5%86%B3.avif)
