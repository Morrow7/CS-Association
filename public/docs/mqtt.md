# MQTT

**利用mqtt协议实现和mqtt服务端的通信或通过mqtt broker实现和其他mqtt客户端的通信**

**MQTT是一种轻量级的消息传输协议，专门未物联网设备设计**，我们的设备通过MQTT与其他设备或服务器通信

***主要特点：***

**1.发布/订阅模式：**设备可以发布消息到特定主题，其他设备订阅这些主题来接收消息

**2.轻量高效：**协议头很小，适合网络带宽有效的设备

**3.可靠传输：**支持三种消息质量等级，确保消息可靠送达

**4.低功耗：**适合电池供电的设备



***

**初始化mqtt相关属性并创建连接,需在worker里使用dxMqtt组件或使用简化函数dxMqtt.run**

**依赖于组件dxMap,dxLogger,dxDriver,dxCommon,dxEventBus,dxNet**

**mqtt服务地址，以tcp://开头，格式是tcp://ip:port**

通过broker通信的时候设备断开会自动触发一个mqtt遗嘱信息，这个是遗嘱信息的主题/内容；若初始化多个实例需要传入唯一id;不同的设备请使用不同的客户端id

缺省为空字符串，

@param {number} qos 0,1,2

缺省是1，0表示消息最多发送一次，发送后消息就被丢弃；1表示消息至少发送一次，可以保证消息被接收方收到，但是会存在接收方收到重复消息的情况；2表示消息发送成功且只发送一次，资源开销大



***

**获取mqtt数据，需要轮询去获取**

**判断是否有新的数据，一般先判断有数据后再调用receive去获取数据**

1.收到消息会触发给 dxEventBus发送一个事件，事件的主题是mqtt.RECEIVE_MQTT_MSG，内容是{topic:'',payload:''}格式

2.如果需要发送消息，直接使用 mqtt.send方法 mqtt发送的数据格式类似： { topic: "sendtopic1", payload: JSON.stringify({ a: i, b: "ssss" }) }

3.mqtt的连接状态发生变化会触发给 dxEventBus发送一个事件，事件的主题是mqtt.CONNECTED_CHANGED，内容是'connected'或者'disconnect'

4.mqtt需要有网络，所以必须在使用之前确保dxNet组件完成初始化



***

### 网络和通信模块

**TCP**  —TCP刻划断和服务器

**UDP**  —UDP通信

**HTTP**  —HTTP客户端和服务器

**MQTT**  —MQTT协议支持

**Web服务器**  —内置Web服务器

**OSDP** —开放监督设备协议

### GUI开发模块

**LVGL组件**  —UI组件库

**布局管理**  —屏幕布局工具

**事件处理**  —触摸和输入事件

**线程**  —多线程支持