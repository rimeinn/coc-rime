# coc-rime

[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/rimeinn/coc-rime/master.svg)](https://results.pre-commit.ci/latest/github/rimeinn/coc-rime/master)
[![github/workflow](https://github.com/rimeinn/coc-rime/actions/workflows/main.yml/badge.svg)](https://github.com/rimeinn/coc-rime/actions)

Rime input method integration of coc.nvim

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

![screenshot](https://user-images.githubusercontent.com/29998228/111900984-6c20ef00-8a70-11eb-9920-4d9da5102a48.gif)

![screencast](https://github.com/rimeinn/coc-rime/assets/32936898/2a31084e-b7a4-4d6a-a6da-e3e85ae83c33)

This project is consist of two parts:

- A nodejs binding of librime
- A librime frontend on coc.nvim

## Dependencies

- [librime](https://github.com/rime/librime)

For build, need extra them:

- [pkg-config](http://pkg-config.freedesktop.org/)
- [xmake](https://github.com/xmake-io/xmake)

```sh
# Ubuntu
sudo apt-get -y install pkg-config librime-dev librime1 xmake
sudo apt-mark auto librime-dev pkg-config xmake
# ArchLinux
sudo pacman -S pkg-config librime xmake
# Android Termux
apt-get -y install pkg-config librime xmake
# Nix
# without any extra operation
# homebrew
brew install pkg-config librime xmake
# Windows msys2
pacboy -S --noconfirm pkg-config librime gcc xmake
```

## Install

- [coc-marketplace](https://github.com/fannheyward/coc-marketplace)
- [npm](https://www.npmjs.com/package/coc-rime)
- vim:

```vim
" command line
CocInstall coc-rime
" or add the following code to your vimrc
let g:coc_global_extensions = ['coc-rime', 'other coc-plugins']
```

## Usage

### Binding

```javascript
import {
    Session
} from 'coc-rime/session';
import {
    UI
} from 'coc-rime/ui';

let session = new Session();
let ui = new UI();
if (not session.process_key('n'.charCodeAt(0), 0))
    throw Error;
let context = session.get_context();
if (context === null)
    throw Error;
let content, _ = ui.draw(context);
console.log(content.join("\n"));
```

```text
n|
[① 你]② 那 ③ 呢 ④ 能 ⑤ 年 ⑥ 您 ⑦ 内 ⑧ 拿 ⑨ 哪 ⓪ 弄 |>
```

### Frontend

#### Commands

1. `rime.source.enable`: enable this source temporarily.
2. `rime.source.disable`: disable this source temporarily.
3. `rime.source.toggle`: temporarily toggle the status of the source.
4. `rime.enable`: enable this IME temporarily.
5. `rime.disable`: disable this IME temporarily.
6. `rime.toggle`: toggle this IME temporarily.

#### Lists

You could use `CocList` to switch between schema.

```vim
:CocList rime_schema
```

#### User Configuration

1. `rime.enabled`: Whether to enable this source.
2. `rime.priority`: The priority of this completion source.
3. `rime.schemaId`: The `schemaId` selected when `coc-rime` start.
   You could get it from `rime_schema` list.
4. `rime.priority`: Priority of Rime completion source
5. `rime.traits.shared_data_dir`: Path(s) where rime data stores
6. `rime.traits.user_data_dir`: Path(s) where rime configuration stores
7. `rime.traits.*`: More rime traits
8. `rime.ui.*`: The symbols used for IME UI

#### Limitations

- It will break all `imap <Buffer>` created by other plugins, such as
  [vim-peekaboo](http://github.com/junegunn/vim-peekaboo)'s `<C-R>`.

## License

MIT

## Similar Projects

- [rime.nvim](https://github.com/rimeinn/rime.nvim): lua implementation.
  Active maintenance.
