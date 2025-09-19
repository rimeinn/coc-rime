import stringWidth from 'string-width';
import {workspace, NvimFloatOptions, Buffer, Window} from 'coc.nvim';

export class Win {
  buffer: Buffer | null = null
  window: Window | null = null
  lines: string[]
  config: NvimFloatOptions

  has_preedit(): boolean {
    return this.lines.length == 2;
  }

  async update(lines: string[] = [], col: number = 0) {
    let width = 0;
    for (const line of lines) {
      width = Math.max(stringWidth(line), width);
    }
    this.lines = lines;
    this.config = {
      relative: 'cursor',
      height: 2,
      // https://github.com/neoclide/coc.nvim/discussions/5053
      // @ts-ignore
      style: 'minimal',
      width: width,
      row: 1,
      col: col,
    };
    if (lines.length === 0) {
      if (this.window && await this.window.valid)
        await this.window.close(false);
    } else {
      if (this.buffer === null)
        this.buffer = await workspace.nvim.createNewBuffer(false, true);
      this.buffer.setLines(lines);
      this.window = await workspace.nvim.openFloatWindow(this.buffer, false, this.config);
    }
  }
}
