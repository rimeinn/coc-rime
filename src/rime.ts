import {Session} from './session';
import {UI} from './ui';
import {key_to_rime} from './key';

export class Rime {
  session: Session
  ui: UI
  constructor(session: Session, ui?: UI) {
    this.ui = ui || new UI();
    this.session = session || new Session();
  }

  dispose() {
    this.session.dispose();
  }

  draw(code: number, mask: number): {text: string, lines: string[], col: number} {
    if (!this.session.process_key(code, mask)) {
      let text = "";
      if (mask === 0)
        text = String.fromCharCode(code);
      return {text, lines: [], col: 0}
    }
    const context = this.session.get_context()
    if (context === null || context.menu.num_candidates === 0)
      return {text: this.session.get_commit_text(), lines: [], col: 0}
    const {lines, col} = this.ui.draw(context)
    return {text: "", lines, col}
  }

  process(basic: string, modifiers_keys: string[]): {text: string, lines: string[], col: number} {
    const [code, mask] = key_to_rime(basic, modifiers_keys);
    return this.draw(code, mask);
  }
}
