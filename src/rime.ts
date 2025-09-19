import {Session} from './session';
import {UI} from './ui';

export class Rime {
  session: Session
  ui: UI
  constructor(session: Session, ui?: UI) {
    this.ui = ui || new UI();
    this.session = session || new Session();
  }
}
