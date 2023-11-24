import { App, Container, ContainerConfigure } from "framework-socket-container";
import { GalaxyRush } from "../../galaxyRush";
import { GameEnum as GalaxyRushEnum } from "../../galaxyRush/enum/GameEnum";
import { logger } from "../libs/Logger";

let gamePack:GamePack;

export const useGamePack= ()=>{
  return gamePack
}

export const initGamePack = (_gamePack: GamePack) => {
  gamePack = _gamePack;
}

export class GamePack extends Container {
  galaxyRush: GalaxyRush

  constructor(opts: ContainerConfigure) {
    super(opts);

    this.galaxyRush = new GalaxyRush();
    gamePack = this;
  }

  public sendMessage(ev: string, payload: any) {
    this.emit(ev, payload);
  }

  public sendRequest(name: string, ev: string, payload: any) {
    this.request(name, ev, payload);
  }

  public async onCreated(app: App<Container>): Promise<void> {
    super.onCreated(app);

    logger.load('GamePack Containers Loaded')
  }

  public onLinkMessage(name: string, ev: string, payload: any): void {
    super.onLinkMessage(name, ev, payload);
    try {
      // galaxy rush message
      this.galaxyRush.message(ev, payload);
    } catch (e) {
      console.error(e);
    }
  }

  protected onRequest(name: string, ev: string, payload: any): void {
    super.onRequest(name, ev, payload);
    
    try {
      switch (payload.game) {
        case GalaxyRushEnum.Game.SYMBOL:
          this.galaxyRush.request(ev, payload);
          break;
        default:
          throw new Error('Not Exist Game');
      }
    } catch (e) {
      console.error(e);
    }
  }
}