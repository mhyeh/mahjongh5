使用前必須先在這個目錄執行 `npm install`

# ImageSeparate
把DragonBones動畫的json及xml或是plist圖片切出來

node ImageSeparate.js 圖片路徑 texture.xml路徑
```
node ImageSeparate.js .\ng_background_down.png .\ng_background_down_texture.xml
```

# DragonBonesXml2Json
把DragonBones動畫的xml轉成json，版本還是2.3，需再用DragonBonesTools轉換

node DragonBonesXml2Json.js xml路徑
```
node DragonBonesXml2Json.js .\animation_tobg_skeleton.xml
```

# Plist2atlasJSONArray
把plist檔案直接轉成atlasJSONArray

node Plist2atlasJSONArray.js plist路徑
```
node Plist2atlasJSONArray.js .\common_jp1.plist
```

# BmfFNT2XML
把文字格式的fnt檔(非XML或JSON的明文格式)轉換成XML格式\
注意：並非所有副檔名為fnt的檔案皆為文字格式，也有可能是XML格式

node BmfFNT2XML.js fnt路徑
```
node BmfFNT2XML.js .\fg_totalwin_num.fnt
```

# DragonBonesTextureMixHelper
可以將DragonBones的圖片全部拆開，經由texture合併之後再重新產生texture.json

需要三個步驟：
1. 使用這個程式，第一個參數給b，然後給圖片與圖片描述的json，會在當前目錄產生分割出來的圖以及在圖片的json位置產生_map.json檔
2. 使用TexturePacker將圖片合併起來，可以與非DragonBones的圖合併，然後輸出atlas的圖與json檔
3. 使用這個程式，第一個參數給c，然後將第一步產生的_map.json檔與atlas的json檔輸入，會產生新的DragonBones的圖片的json(直接覆蓋)

第三步執行完後第一步產生的圖與json檔就可以刪掉了，執行第三步後將會覆蓋原有的texture.json，此動作為不可逆的，建議先備份一下

分割圖片：\
node DragonBonesTextureMixHelper.js b texture.png路徑 texture.json路徑
```
node DragonBonesTextureMixHelper.js b texture.png texture.json
```

更新texture.json：\
node DragonBonesTextureMixHelper.js c map.json路徑 atlas.json路徑
```
node DragonBonesTextureMixHelper.js c texture.json_map.json symbol.json
```
