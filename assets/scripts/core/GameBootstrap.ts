import { _decorator, Component, Node, UITransform, Canvas } from 'cc';
import { GameScene } from './GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/GameConfig';

const { ccclass } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
  start(): void {
    const gameScene = new Node('GameScene');
    gameScene.addComponent(GameScene);
    this.node.addChild(gameScene);

    // Set canvas size
    const canvas = this.node.getComponent(Canvas);
    if (canvas) {
      const designRes = canvas.getComponent(UITransform);
      if (designRes) {
        designRes.setContentSize(GAME_WIDTH, GAME_HEIGHT);
      }
    }
  }
}
