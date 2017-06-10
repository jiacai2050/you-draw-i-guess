## 你画我猜 on LeanCloud

本项目使用 [LeanCloud](https://leancloud.cn/) 产品来实现你画我猜游戏。

在线演示地址：

> http://you-draw-i-guess.leanapp.cn/

用到的产品（按照依赖程度）：

- [实时通信](https://leancloud.cn/docs/realtime_v2.html)，用来同步画板、聊天状态
- [数据存储](https://leancloud.cn/docs/storage_overview.html)，用来存储房间、用户相关信息
- [云引擎](https://leancloud.cn/docs/leanengine_overview.html)，用来托管本应用，也可采用自建服务器


## 本地开发

1. 参照 [config.js](config.js) 设置相关环境变量
2. `npm install`
3. `npm start`

## TODO

- [x] 多设备同步画板状态
- [x] 圈定房间内人员，上下线提醒 (2017-6-10)
- [ ] 按照成员加入房间顺序，依次绘画