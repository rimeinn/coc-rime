import {workspace} from 'coc.nvim';

import {Rime as IME} from '../rime';
import {Session} from '../session';
import {UI} from '../ui';
import {Win} from './win';
import {Keymap} from './keymap';

export async function feedkeys(text: string): Promise<void> {
  // don't use nvim_feedkeys() due to InsertCharPre recursively
  const [r, c] = await workspace.nvim.request('nvim_win_get_cursor', [0]);
  await workspace.nvim.request('nvim_buf_set_text', [0, r - 1, c, r - 1, c, [text]]);
  await workspace.nvim.request('nvim_win_set_cursor', [0, [r, c + Buffer.from(text).length]]);
}

export class Rime extends IME {
  keymap: Keymap;
  win: Win;
  private isRegisterd = false;

  constructor(session: Session, ui: UI) {
    super(session, ui);
    this.win = new Win();
    this.keymap = new Keymap(this.exe);
  }

  async exe(key: string, modifiers_: string[]): Promise<void> {
    const {text, lines, col} = this.process(key, modifiers_);
    this.keymap.resetKeymaps(this.win.has_preedit());
    this.win.update(lines, col);
    if (text !== '') {
      feedkeys(text);
    }
  }

  register(): Promise<void> {
    workspace.registerAutocmd({
      event: 'InsertCharPre',
      pattern: '<buffer>',
      arglist: ['v:char', 'execute("let v:char = \'\'")'],
      callback: async (character, _) => {
        this.exe(character, []);
      },
    });

    workspace.registerAutocmd({
      event: ['InsertLeave', 'WinLeave'],
      callback: async () => {
        this.session.clear_composition();
        this.win.update();
      },
    });

    workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<Space>', '<Space>', {noremap: true, nowait: true}]);
    for (const number of Array.from(Array(0x7b - 0x21).keys())) {
      const char = String.fromCharCode(0x21 + number);
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', char, char, {noremap: true, nowait: true}]);
    }
    workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<Bar>', '<Bar>', {noremap: true, nowait: true}]);
    for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
      const char = String.fromCharCode(0x7d + number);
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', char, char, {noremap: true, nowait: true}]);
    }

    this.isRegisterd = true;
    return;
  }

  unregister(): Promise<void> {
    // https://github.com/neoclide/coc.nvim/discussions/5054
    workspace.nvim.command('au! coc_dynamic_autocmd InsertCharPre');
    workspace.nvim.command('au! coc_dynamic_autocmd InsertLeave');
    workspace.nvim.command('au! coc_dynamic_autocmd WinLeave');
    workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<Space>']);
    for (const number of Array.from(Array(0x7b - 0x21).keys())) {
      const char = String.fromCharCode(0x21 + number);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', char]);
    }
    workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<Bar>']);
    for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
      const char = String.fromCharCode(0x7d + number);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', char]);
    }
    this.isRegisterd = false;
    return;
  }

  toggleRegister(): Promise<void> {
    if (this.isRegisterd) {
      this.unregister();
    } else {
      this.register();
    }
    return;
  }
}
