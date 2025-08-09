#### 原理

对于原图片 `I1` 和隐藏图片 `I2`，其对应的每个像素点的坐标 `(x, y)`，有

```py
# 亮度调整
def brightness(pixel, factor):
    pixel.rgb = pixel.rgb * factor
    return pixel
```


```py
# 对比度调整
def contrast(pixel, factor):
    pixel.rgb = (v - 128) * factor + 128
    return pixel
```


```py
if (x + y) % 2 == 0:
    res = brightness(I1[x, y], 1 + I1_Br_Boosting) # 原图亮度提升示例值为 100%
    res = contrast(res, I1_Co_Factor)              # 原图对比度示例值为 20%
else:
    res = brightness(I2[x, y], 1 - I2_Br_Reducing) # 隐藏图亮度降低示例值为 90%
    res = contrast(res, I2_Co_Factor)              # 隐藏图对比度示例值为 100%
```
