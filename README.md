# second-hand-platform
校园爱回收，打造的品质二手校园零售平台。


[github](git@github.com:hzs0623/second-hand-platform.git)

## Development

```bash
$ git clone git@github.com:hzs0623/second-hand-platform.git
```

## 用于二手交易平台服务器node

### api
api地址：` http://127.0.0.1:3333`

身份态： 请求头`authtoken`   校验登陆状态

#### 注册用户

`/register `post

| 参数     | 类型   | 是否必填 | 备注   |
| -------- | ------ | -------- | ------ |
| username | string | 是       | 用户名 |
| password | string | 是       | 密码   |

返回数据：

```javascript
{
  code: 1001
	data: "add user success"
	msg: "success!"
}
```



#### 用户登陆接口

`/login` post

| 参数     | 类型   | 是否必填 | 备注   |
| -------- | ------ | -------- | ------ |
| username | string | 是       | 用户名 |
| password | string | 是       | 密码   |

返回数据：

```javascript
{
  code: 1001
  data: {
    uid: 1,
		token: "xxxxx"
		user: "daes"
  		}
	msg: "success!"
}
```

#### 用户修改

`/user/edit` post

| 参数      | 类型          | 是否必填 | 备注     |
| --------- | ------------- | -------- | -------- |
| password  | string        | 否       | 密码     |
| phone     | number        | 否       | 手机号   |
| real_name | string        | 否       | 真实姓名 |
| sno       | number        | 否       | 学号     |
| gender    | number(0,1,2) | 否       | 性别     |
| avatar    | string        | 否       | 头像图片 |

```javascript
{
  code: 1001,
  data: 'sucess',
  msg: 'success'
}
```



#### 个人信息查找

`/user/find` post

| 参数 | 类型  | 是否必填 | 备注   |
| ---- | ----- | -------- | ------ |
| uid  | umber | 是       | 用户id |

```javascript
{
  data: {
    avatar: null
    create_time: "2021-02-12T14:29:19.000Z"
    gender: "0"
    phone: null
    real_name: null
    sno: null
    uid: 11
    update_time: null
    username: "daes1"
  }
  code: 1001,
  msg: 'success'
}
```

#### 映射map数据

`/init/map ` get

```javascript
{
  code: 1001,
  data: {
    sort_map: {
      -1: '其他',
       0: '电脑数码',
       1: '运动户外',
       2: '服饰鞋包',
       3: '个护化妆',
       4: '日用百货',
       5: '礼品钟表',
       6: '图书音像',
       7: '玩模乐器',
       8: '办公设备',
       9: '金融服务'
    }
  }
  msg: 'success!'
}
```



#### 获取所有商品

`/shop/list`  get

| 参数     | 类型   | 是否必填 | 备注     |
| -------- | ------ | -------- | -------- |
| pageSize | Number | 是       | 条数     |
| curPage  | Number | 是       | 当前页码 |

```javascript
{
  code: 1001
  data: {
    list: []
  	total: 0
  }
  msg: "success!"
}
```



#### 获取单个商品信息

`/shop/item` get

| 参数 | 类型   | 是否必填 | 备注   |
| ---- | ------ | -------- | ------ |
| id   | number | 是       | 商品id |

```javascript
{
  code: 1001,
  data: {
    browse_num: (...)
    count: (...)
    create_time: (...)
    display: (...)
    id: (...)
    image: (...)
    information: (...)
    level: (...)
    price: (...)
    sort: (...)
    title: (...)
    uid: (...)
    update_time: (...)
  },
  msg: 'success'
}
```

#### 添加商品

请求地址：`/shop/add`  

请求方式：**post**

| 字段名      | 字段类型 | 是否可为空 | 备注           |
| ----------- | -------- | ---------- | -------------- |
| title       | String   | 否         | 商品名称       |
| level       | Number   | 否         | 商品成色       |
| information | String   | 是         | 商品详细信息   |
| price       | Number   | 否         | 商品价格       |
| sort        | Number   | 否         | 商品类别       |
| count       | Number   | 否         | 商品数量       |
| uid         | Number   | 否         | 发表的用户id   |
| image       | String   | 否         | 商品的图片地址 |

#### 上传商品图片链接

请求地址:` /upload/image`

**注意请求头设置token**

```javascript
headers: {
  authtoken: `xxxx`
}
```

返回数据中可以拿到URL地址:

**path 就是上传服务器的image地址 **

```javascript
{
  code: 1001
  data: {_events: {}, _eventsCount: 0, size: 49781,…}
  hash: null
  lastModifiedDate: "2021-02-14T13:23:11.410Z"
  name: "证件照.png"
  path: "http://127.0.0.1:3333/public/upload/upload_0aabb338340d22e825d2846a427e4b2a.png"
  size: 49781
  type: "image/png"
  _events: {}
  _eventsCount: 0
  _writeStream: {,…}
  msg: "success!"
}
```



#### 删除商品

请求地址： `/shop/delete`

请求方式： post

| 参数名 | 类型   | 是否可空 | 备注   |
| ------ | ------ | -------- | ------ |
| id     | number | 否       | 商品id |

#### 添加商品留言

`shop/add/message`

请求方式： post

| 参数名  | 类型   | 是否可空 | 备注     |
| ------- | ------ | -------- | -------- |
| uid     | number | 否       | 用户id   |
| sid     | number | 否       | 商品id   |
| content | string | 否       | 留言内容 |

#### 获取商品留言

`shop/get/message` 

请求方式 get

| 参数名   | 类型   | 是否为空 | 备注   |
| -------- | ------ | -------- | ------ |
| sid      | number | 否       | 商品id |
| curPage  | number | 否       | 当前页 |
| pageSize | number | 否       | 条数   |

#### 删除商品留言

`shop/delete/message`

请求方式 post

| 参数名 | 类型   | 是否为空 | 备注   |
| ------ | ------ | -------- | ------ |
| sid    | number | 否       | 商品id |
| uid    | number | 否       | 用户id |
| id     | number | 否       | 留言id |

#### 当前用户发布的所有商品

`/shop/uid/list`

请求方式 get

| 参数名   | 类型   | 是否为空 | 备注   |
| -------- | ------ | -------- | ------ |
| uid      | number | 否       | 用户id |
| curPage  | number | 否       | 当前页 |
| pageSize | number | 否       | 条数   |

#### 修改商品

`/shop/edit`

请求方式post

| 字段名      | 字段类型 | 是否可为空 | 备注           |
| ----------- | -------- | ---------- | -------------- |
| id          | number   | 否         | 商品id         |
| title       | String   | 否         | 商品名称       |
| level       | Number   | 否         | 商品成色       |
| information | String   | 是         | 商品详细信息   |
| price       | Number   | 否         | 商品价格       |
| sort        | Number   | 否         | 商品类别       |
| count       | Number   | 否         | 商品数量       |
| uid         | Number   | 否         | 发表的用户id   |
| image       | String   | 否         | 商品的图片地址 |

