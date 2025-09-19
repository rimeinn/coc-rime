import {workspace} from 'coc.nvim';

const specialKeys = ['Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown'];

export class Keymap {
  private hasSetKeymaps = false;

  constructor(callback: (key: string, modifiers: string[]) => void) {
    for (const specialKey of specialKeys) {
      const keyname = specialKey.replace('Page', 'Page_');
      this.registerKeymap(keyname, [], callback);
      this.registerKeymap(keyname, ['Control'], callback);
      this.registerKeymap(keyname, ['Alt'], callback);
      this.registerKeymap(keyname, ['Alt', 'Control'], callback);
    }
    for (const number of Array.from(Array(35).keys())) {
      const num = number + 1;
      this.registerKeymap('F' + num, [], callback);
    }
    this.registerKeymap('Return', ['Control'], callback);
    this.registerKeymap('Return', ['Shift'], callback);
    this.registerKeymap('Tab', ['Shift'], callback);
    this.registerKeymap('BackSpace', [], callback);
    this.registerKeymap('space', ['Control'], callback);
    this.registerKeymap('BackSpace', ['Alt'], callback);
    this.registerKeymap('space', ['Alt', 'Control'], callback);
    for (const number of Array.from(Array(0x5d - 0x41).keys())) {
      const char = String.fromCharCode(0x41 + number).toLowerCase();
      this.registerKeymap(char, ['Control'], callback);
      this.registerKeymap(char, ['Alt', 'Control'], callback);
    }
    this.registerKeymap('6', ['Control'], callback);
    this.registerKeymap('6', ['Alt', 'Control'], callback);
    this.registerKeymap('minus', ['Control'], callback);
    this.registerKeymap('minus', ['Alt', 'Control'], callback);
    this.registerKeymap('space', ['Alt'], callback);
    for (const number of Array.from(Array(0x3b - 0x21).keys())) {
      const char = String.fromCharCode(0x21 + number);
      this.registerKeymap(char, ['Alt'], callback);
    }
    this.registerKeymap('less', [], callback);
    for (const number of Array.from(Array(0x7b - 0x3d).keys())) {
      const char = String.fromCharCode(0x3d + number);
      this.registerKeymap(char, ['Alt'], callback);
    }
    this.registerKeymap('bar', ['Alt'], callback);
    for (const number of Array.from(Array(0x7e - 0x7d).keys())) {
      const char = String.fromCharCode(0x7d + number);
      this.registerKeymap(char, ['Alt'], callback);
    }
  }

  registerKeymap(key: string, modifiers: string[], callback: (key: string, modifiers: string[]) => void) {
    workspace.registerKeymap(['i'], ['rime', ...modifiers, key].join('-'), async () => {
      callback(key, modifiers);
    });
  }

  async resetKeymaps(has_preedit: boolean): Promise<void> {
    if (has_preedit && this.hasSetKeymaps === false) {
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
    } else if (!has_preedit && this.hasSetKeymaps) {
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
}
