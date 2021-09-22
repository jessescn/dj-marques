import { Client } from "discord.js";
import { BotModule } from "../types/play";

export default class BotClient extends Client {
  modules: BotModule[];

  constructor(){
    super();
    this.modules = [];
  }

  addModule(newModule: BotModule): void {
    this.modules.push(newModule);
  }
}