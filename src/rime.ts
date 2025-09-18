import {workspace, NvimFloatOptions, Window, window} from 'coc.nvim';
import stringWidth from 'string-width';

import {UI} from './config';
import {Traits} from './binding';
import {Context, Schema, Commit} from './binding';
import binding from './binding';
import modifiers from './modifiers.json';
import keys from './keys.json';

const specialKeys = ['Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown'];

export class Rime {
  private isEnabled = true;
  private hasSetKeymaps = false;
  private preedit = '';
  private isRegisterd = false;
  private readonly ui: UI;
  private sessionId: bigint;
  private schemaList: Schema[];
  private schemaId: string;
  private win: Window | null = null;

  constructor(traits: Traits, ui: UI) {
    this.ui = ui;
    binding.init(traits);
    this.sessionId = binding.create_session();
    for (const specialKey of specialKeys) {
      const keyname = specialKey.replace('Page', 'Page_');
      this.registerKeymap(keyname, []);
      this.registerKeymap(keyname, ['Control']);
      this.registerKeymap(keyname, ['Alt']);
      this.registerKeymap(keyname, ['Alt', 'Control']);
    }
    for (const number of Array.from(Array(35).keys())) {
      const num = number + 1;
      this.registerKeymap('F' + num, []);
    }
    this.registerKeymap('Return', ['Control']);
    this.registerKeymap('Return', ['Shift']);
    this.registerKeymap('Tab', ['Shift']);
    this.registerKeymap('BackSpace', []);
    this.registerKeymap('space', ['Control']);
    this.registerKeymap('BackSpace', ['Alt']);
    this.registerKeymap('space', ['Alt', 'Control']);
    for (const number of Array.from(Array(0x5d - 0x41).keys())) {
      const char = String.fromCharCode(0x41 + number).toLowerCase();
      this.registerKeymap(char, ['Control']);
      this.registerKeymap(char, ['Alt', 'Control']);
    }
    this.registerKeymap('6', ['Control']);
    this.registerKeymap('6', ['Alt', 'Control']);
    this.registerKeymap('minus', ['Control']);
    this.registerKeymap('minus', ['Alt', 'Control']);
    this.registerKeymap('space', ['Alt']);
    for (const number of Array.from(Array(0x3b - 0x21).keys())) {
      const char = String.fromCharCode(0x21 + number);
      this.registerKeymap(char, ['Alt']);
    }
    this.registerKeymap('less', []);
    for (const number of Array.from(Array(0x7b - 0x3d).keys())) {
      const char = String.fromCharCode(0x3d + number);
      this.registerKeymap(char, ['Alt']);
    }
    this.registerKeymap('bar', ['Alt']);
    for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
      const char = String.fromCharCode(0x7d + number);
      this.registerKeymap(char, ['Alt']);
    }
  }

  destroy() {
    binding.destroy_session(this.sessionId);
  }

  async setCompletionStatus(status: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.isEnabled = status;
        resolve(this.isEnabled);
      } catch (e) {
        reject(e);
      }
    });
  }

  async toggleCompletionStatus(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.isEnabled = !this.isEnabled;
        resolve(this.isEnabled);
      } catch (e) {
        reject(e);
      }
    });
  }

  getCompletionStatus(): boolean {
    return this.isEnabled;
  }

  async process_key(key: string, modifiers_: string[]): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let sum = 0;
        for (const modifier of modifiers_) {
          const mask = modifiers.indexOf(modifier);
          if (mask !== -1) {
            sum += 2 ** mask;
          } else {
            window.showErrorMessage(`${modifier} is not a legal modifier!`);
          }
        }
        let keycode = key.charCodeAt(0);
        if (key in keys) {
          keycode = keys[key];
        }
        try {
          binding.process_key(this.sessionId, keycode, sum);
        } catch (error) {
          reject(error);
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_context(): Promise<Context> {
    return new Promise<Context>((resolve, reject) => {
      try {
        resolve(binding.get_context(this.sessionId));
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_commit(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        let text = '';
        if (binding.commit_composition(this.sessionId)) {
          const commit: Commit = binding.get_commit(this.sessionId);
          text = commit.text;
        }
        resolve(text);
      } catch (e) {
        reject(e);
      }
    });
  }

  async clear_composition(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        binding.clear_composition(this.sessionId);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  registerKeymap(key: string, modifiers: string[]) {
    // https://github.com/rime/librime/blob/master/src/rime/key_table.cc
    workspace.registerKeymap(['i'], ['rime', ...modifiers, key].join('-'), async () => {
      this.drawUI(key, modifiers);
    });
  }

  async feedkeys(text: string): Promise<void> {
    // don't use nvim_feedkeys() due to InsertCharPre recursively
    const [r, c] = await workspace.nvim.request('nvim_win_get_cursor', [0]);
    await workspace.nvim.request('nvim_buf_set_text', [0, r - 1, c, r - 1, c, [text]]);
    await workspace.nvim.request('nvim_win_set_cursor', [0, [r, c + Buffer.from(text).length]]);
    if (this.win && (await this.win.valid)) {
      await this.win.close(false);
      this.win = null;
    }
    this.preedit = '';
    this.resetKeymaps();
  }

  async drawUI(key: string, modifiers_: string[]): Promise<void> {
    try {
      await this.process_key(key, modifiers_);
    } catch (_e) {
      // don't output text when any control key is pressed
      if (modifiers_.length == 0) this.feedkeys(key);
      return;
    }
    const context = await this.get_context();
    this.preedit = context.composition.preedit ?? '';
    let preedit =
      this.preedit.slice(0, context.composition.cursor_pos) +
      this.ui.cursor +
      this.preedit.slice(context.composition.cursor_pos);
    const candidates = context.menu.candidates ?? [];
    if (context.menu.num_candidates === 0) {
      const text = await this.get_commit();
      if (text !== '') {
        this.feedkeys(text);
        return;
      }
    }
    let candidates_ = '';
    const indices = this.ui.indices;
    for (const index in candidates) {
      const candidate = candidates[index];
      let text = indices[index] + ' ' + candidate.text;
      if (candidate.comment) {
        text = text + ' ' + candidate.comment;
      }
      if (context.menu.highlighted_candidate_index + '' === index) {
        text = this.ui.left_sep + text;
      } else if (context.menu.highlighted_candidate_index + 1 + '' === index) {
        text = this.ui.right_sep + text;
      } else {
        text = ' ' + text;
      }
      candidates_ = candidates_ + text;
    }
    if (context.menu.num_candidates === context.menu.highlighted_candidate_index + 1) {
      candidates_ = candidates_ + this.ui.right_sep;
    } else {
      candidates_ = candidates_ + ' ';
    }
    let col = 0;
    const left = this.ui.left;
    if (context.menu.page_no !== 0) {
      const num = stringWidth(left);
      candidates_ = left + candidates_;
      preedit = ' '.repeat(num) + preedit;
      col = col - num;
    }
    if (!context.menu.is_last_page && candidates.length) {
      candidates_ = candidates_ + this.ui.right;
    }
    const lines = [preedit, candidates_];

    let width = 0;
    for (const line of lines) {
      width = Math.max(stringWidth(line), width);
    }
    const config: NvimFloatOptions = {
      relative: 'cursor',
      height: 2,
      // https://github.com/neoclide/coc.nvim/discussions/5053
      // @ts-ignore
      style: 'minimal',
      width: width,
      row: 1,
      col: col,
    };
    if (this.win && (await this.win.valid)) {
      (await this.win.buffer).setLines(lines);
      await this.win.setConfig(config);
    } else {
      const buffer = await workspace.nvim.createNewBuffer(false, true);
      buffer.setLines(lines);
      this.win = await workspace.nvim.openFloatWindow(buffer, false, config);
    }
    this.resetKeymaps();
  }

  async resetKeymaps(): Promise<void> {
    if (this.preedit !== '' && this.hasSetKeymaps === false) {
      for (const specialKey of specialKeys) {
        const keyname = specialKey.replace('Page', 'Page_');
        let lhs = '<' + specialKey + '>';
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          lhs,
          '<Plug>(coc-rime-' + keyname + ')',
          {nowait: true},
        ]);
        lhs = '<C-' + specialKey + '>';
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          lhs,
          '<Plug>(coc-rime-Control-' + keyname + ')',
          {nowait: true},
        ]);
        lhs = '<M-' + specialKey + '>';
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          lhs,
          '<Plug>(coc-rime-Alt-' + keyname + ')',
          {nowait: true},
        ]);
        lhs = '<M-C-' + specialKey + '>';
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          lhs,
          '<Plug>(coc-rime-Alt-Control-' + keyname + ')',
          {nowait: true},
        ]);
      }
      for (const number of Array.from(Array(35).keys())) {
        const num = number + 1;
        const keyname = 'F' + num;
        const lhs = '<' + keyname + '>';
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          lhs,
          '<Plug>(coc-rime-' + keyname + ')',
          {nowait: true},
        ]);
      }
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<C-CR>',
        '<Plug>(coc-rime-Shift-Return)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<S-CR>',
        '<Plug>(coc-rime-Shift-Return)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<S-Tab>',
        '<Plug>(coc-rime-Shift-Tab)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<BS>', '<Plug>(coc-rime-BackSpace)', {nowait: true}]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<C-Space>',
        '<Plug>(coc-rime-Control-space)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<M-BS>',
        '<Plug>(coc-rime-Alt-BackSpace)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<M-C-Space>',
        '<Plug>(coc-rime-Alt-Control-space)',
        {nowait: true},
      ]);
      for (const number of Array.from(Array(0x5d - 0x41).keys())) {
        const char = String.fromCharCode(0x41 + number).toLowerCase();
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          '<C-' + char + '>',
          '<Plug>(coc-rime-Control-' + char + ')',
          {nowait: true},
        ]);
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          '<M-C-' + char + '>',
          '<Plug>(coc-rime-Alt-Control-' + char + ')',
          {nowait: true},
        ]);
      }
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<C-^>', '<Plug>(coc-rime-Control-6)', {nowait: true}]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<M-C-^>',
        '<Plug>(coc-rime-Alt-Control-6)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<C-_>',
        '<Plug>(coc-rime-Control-minus)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<M-C-_>',
        '<Plug>(coc-rime-Alt-Control-minus)',
        {nowait: true},
      ]);
      workspace.nvim.request('nvim_buf_set_keymap', [
        0,
        'i',
        '<M-Space>',
        '<Plug>(coc-rime-Alt-space)',
        {nowait: true},
      ]);
      for (const number of Array.from(Array(0x3b - 0x21).keys())) {
        const char = String.fromCharCode(0x21 + number);
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          '<M-' + char + '>',
          '<Plug>(coc-rime-Alt-' + char + ')',
          {nowait: true},
        ]);
      }
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<M-lt>', '<Plug>(coc-rime-Alt-less)', {nowait: true}]);
      for (const number of Array.from(Array(0x7b - 0x3d).keys())) {
        const char = String.fromCharCode(0x3d + number);
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          '<M-' + char + '>',
          '<Plug>(coc-rime-Alt-' + char + ')',
          {nowait: true},
        ]);
      }
      workspace.nvim.request('nvim_buf_set_keymap', [0, 'i', '<M-bar>', '<Plug>(coc-rime-Alt-bar)', {nowait: true}]);
      for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
        const char = String.fromCharCode(0x7d + number);
        workspace.nvim.request('nvim_buf_set_keymap', [
          0,
          'i',
          '<M-' + char + '>',
          '<Plug>(coc-rime-Alt-' + char + ')',
          {nowait: true},
        ]);
      }
      this.hasSetKeymaps = true;
    } else if (this.preedit === '' && this.hasSetKeymaps === true) {
      for (const specialKey of specialKeys) {
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<' + specialKey + '>']);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-' + specialKey + '>']);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-' + specialKey + '>']);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-C-' + specialKey + '>']);
      }
      for (const number of Array.from(Array(35).keys())) {
        const num = number + 1;
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<F' + num + '>']);
      }
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-CR>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<S-CR>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<S-Tab>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<BS>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-Space>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-BS>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-C-Space>']);
      for (const number of Array.from(Array(0x5d - 0x41).keys())) {
        const char = String.fromCharCode(0x41 + number).toLowerCase();
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-' + char + '>']);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-C-' + char + '>']);
      }
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-^>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-C-^>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<C-_>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-C-_>']);
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-Space>']);
      for (const number of Array.from(Array(0x3b - 0x21).keys())) {
        const char = String.fromCharCode(0x21 + number);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-' + char + '>']);
      }
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-lt>']);
      for (const number of Array.from(Array(0x7b - 0x3d).keys())) {
        const char = String.fromCharCode(0x3d + number);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-' + char + '>']);
      }
      workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-Bar>']);
      for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
        const char = String.fromCharCode(0x7d + number);
        workspace.nvim.request('nvim_buf_del_keymap', [0, 'i', '<M-' + char + '>']);
      }
      this.hasSetKeymaps = false;
    }
  }

  register(): Promise<void> {
    workspace.registerAutocmd({
      event: 'InsertCharPre',
      pattern: '<buffer>',
      arglist: ['v:char', 'execute("let v:char = \'\'")'],
      callback: async (character, _) => {
        this.drawUI(character, []);
      },
    });

    workspace.registerAutocmd({
      event: ['InsertLeave', 'WinLeave'],
      callback: async () => {
        this.clear_composition();
        if (this.win && (await this.win.valid)) {
          await this.win.close(false);
          this.win = null;
        }
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

  async getFullContext(input: string): Promise<Context> {
    return new Promise<Context>((resolve, reject) => {
      try {
        for (const singleChar of input) {
          this.process_key(singleChar, []);
        }
        let context = binding.get_context(this.sessionId);
        const result = context;
        if (input !== '')
          while (!context.menu.is_last_page) {
            this.process_key('=', []);
            context = binding.get_context(this.sessionId);
            result.menu.num_candidates += context.menu.num_candidates;
            if (result.menu?.select_keys && context.menu?.select_keys) {
              result.menu.select_keys.push(...context.menu.select_keys);
            }
            if (result.menu?.candidates && context.menu?.candidates) {
              result.menu.candidates.push(...context.menu.candidates);
            }
          }
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        binding.clear_composition(this.sessionId);
      }
    });
  }

  async get_schema_list(): Promise<Schema[]> {
    return new Promise<Schema[]>((resolve, reject) => {
      try {
        if (this.schemaList === undefined) this.schemaList = binding.get_schema_list();
        resolve(this.schemaList);
      } catch (e) {
        reject(e);
      }
    });
  }

  async getSchema(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        if (this.schemaId === undefined) this.schemaId = binding.get_current_schema(this.sessionId);
        resolve(this.schemaId);
      } catch (e) {
        reject(e);
      }
    });
  }

  async setSchema(schemaId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        resolve(binding.select_schema(this.sessionId, schemaId));
        this.schemaId = schemaId;
      } catch (e) {
        reject(e);
      }
    });
  }
}
