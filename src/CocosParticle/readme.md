# Cocos2dx Particle Phaser Usage
```ts
const a = new PhaserCocosEmitter(game, assets.effect.a.xml.key, assets.effect.a.image.key);
a.position.x = game.width / 2;
a.position.y = game.height / 4;
a.Play();
// a.Stop();
```

# History
* 2018/03/15 `fix gravity, start and stop function, other small bugs`