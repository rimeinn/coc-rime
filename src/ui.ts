import stringWidth from 'string-width';

import {Context} from './binding';

export interface ui {
  indices: string[];
  left: string;
  right: string;
  left_sep: string;
  right_sep: string;
  cursor: string;
}

export class UI implements ui {
  indices: string[];
  left: string;
  right: string;
  left_sep: string;
  right_sep: string;
  cursor: string;

  constructor(ui: ui = {
    indices: [
      "①",
      "②",
      "③",
      "④",
      "⑤",
      "⑥",
      "⑦",
      "⑧",
      "⑨",
      "⓪"
    ],
    left: "<|",
    right: "|>",
    left_sep: "[",
    right_sep: "]",
    cursor: "|",
  }) {
    this.indices = ui.indices;
    this.left = ui.left;
    this.right = ui.right;
    this.left_sep = ui.left_sep;
    this.right_sep = ui.right_sep;
    this.cursor = ui.cursor;
  }

  draw(context: Context): {lines: string[], col: number} {

    let preedit = context.composition.preedit ?? '';
    preedit =
      preedit.slice(0, context.composition.cursor_pos) +
      this.cursor +
      preedit.slice(context.composition.cursor_pos);
    const candidates = context.menu.candidates ?? [];
    let candidates_ = '';
    const indices = this.indices;
    for (const index in candidates) {
      const candidate = candidates[index];
      let text = indices[index] + ' ' + candidate.text;
      if (candidate.comment) {
        text = text + ' ' + candidate.comment;
      }
      if (context.menu.highlighted_candidate_index + '' === index) {
        text = this.left_sep + text;
      } else if (context.menu.highlighted_candidate_index + 1 + '' === index) {
        text = this.right_sep + text;
      } else {
        text = ' ' + text;
      }
      candidates_ = candidates_ + text;
    }
    if (context.menu.num_candidates === context.menu.highlighted_candidate_index + 1) {
      candidates_ = candidates_ + this.right_sep;
    } else {
      candidates_ = candidates_ + ' ';
    }
    let col = 0;
    const left = this.left;
    if (context.menu.page_no !== 0) {
      const num = stringWidth(left);
      candidates_ = left + candidates_;
      preedit = ' '.repeat(num) + preedit;
      col = col - num;
    }
    if (!context.menu.is_last_page && candidates.length) {
      candidates_ = candidates_ + this.right;
    }
    const lines = [preedit, candidates_];

    return {lines: lines, col: col}
  }
}
