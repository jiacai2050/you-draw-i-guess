## 通信协议

本游戏基于 LeanCloud 实时通信来实现游戏所有数据的互通，为了简便，使用 JSON 数据格式，有如下几种类型：

1. 聊天内容（弹幕）
```
{"type": "msg", "value": "your message"}
```

2. 绘图
```
[{"x": "", "y": ""}]  // 画笔坐标，为了在不同设备兼容，采用的是当前坐标相对当前画板的百分比

{"type": "event", "src": "pencil/eraser/rollback/color", "color": "仅当src=color有效"} //用于控制画板状态，画笔颜色
```

3. 系统控制
```
{"type": "system", "cmd": "draw", "drawer": "userName 表示谁来画"} // 开始比赛
```

## 实现思路

每一个房间对应一个 LeanCloud 实时通信中的 [普通对话](https://leancloud.cn/docs/realtime_v2.html#普通对话_Normal_Conversation_)。 
利用该对话的 [成员变更事件](https://leancloud.cn/docs/realtime_guide-js.html#成员变更事件) 来实现成员的上下线。为了监控成员意外掉线（例如：断网），每个进入房间的用户与 Server 端建立一个 Websocket 长连接，当该连接意外中断时，系统会主动把该用户从本房间内移除。

每一个房间内，除了普通用户外，系统内置一个`__admin__${roomName}`用户用以控制比赛流程，比如踢掉异常用户的操作就是由内置用户触发。