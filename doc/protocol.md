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