import {describe, expect, test} from '@jest/globals';

import {Context} from '../binding';
import {UI} from '../ui';

describe('UI', () => {
  test('draw UI', () => {
    const ui = new UI();
    const context: Context = {
      composition: {
        length: 1,
        cursor_pos: 1,
        sel_start: 0,
        sel_end: 1,
        preedit: "w",
      },
      menu: {
        page_size: 10,
        page_no: 0,
        is_last_page: false,
        highlighted_candidate_index: 0,
        num_candidates: 10,
        candidates: [
          {text: "我"},
          {text: "为"},
          {text: "玩"},
          {text: "问"},
          {text: "无"},
          {text: "万"},
          {text: "完"},
          {text: "网"},
          {text: "王"},
          {text: "外"},
        ],
      }
    };
    expect(ui.draw(context)).toEqual({
      lines: ["w|", "[① 我]② 为 ③ 玩 ④ 问 ⑤ 无 ⑥ 万 ⑦ 完 ⑧ 网 ⑨ 王 ⓪ 外 |>"],
      col: 0,
    });
  });
})
