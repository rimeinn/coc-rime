import {existsSync} from 'fs';
import {resolve} from 'path';
import {Options} from 'pkg-prebuilds';
import build from 'pkg-prebuilds';
import {execSync} from 'child_process';

export interface traits {
  shared_data_dir?: string | null;
  user_data_dir?: string | null;
  log_dir?: string | null;
  distribution_name?: string | null;
  distribution_code_name: string;
  distribution_version: string;
  app_name?: string | null;
  min_log_level?: 0 | 1 | 2 | 3;
}

export declare class Traits implements traits {
  shared_data_dir?: string | null;
  user_data_dir?: string | null;
  log_dir?: string | null;
  distribution_name?: string | null;
  distribution_code_name: string;
  distribution_version: string;
  app_name?: string | null;
  min_log_level?: 0 | 1 | 2 | 3;
  constructor(traits: traits);
}

export interface Composition {
  length: number;
  cursor_pos: number;
  sel_start: number;
  sel_end: number;
  preedit?: string;
}

export interface Candidate {
  text: string;
  comment?: string;
}

export interface Menu {
  page_size: number;
  page_no: number;
  is_last_page: boolean;
  highlighted_candidate_index: number;
  num_candidates: number;
  candidates?: Candidate[];
  select_keys?: string[];
}

export interface Context {
  composition: Composition;
  menu: Menu;
}

export interface Schema {
  schema_id: string;
  name: string;
}

export interface Commit {
  text: string;
}

export interface Binding {
  Traits: typeof Traits;
  create_session: () => bigint;
  destroy_session: (id: bigint) => void;
  get_current_schema: (id: bigint) => string;
  get_schema_list: () => Schema[];
  select_schema: (id: bigint, schema_id: string) => boolean;
  process_key: (id: bigint, code: number, mask: number) => boolean;
  get_context: (id: bigint) => Context;
  get_commit: (id: bigint) => Commit;
  commit_composition: (id: bigint) => boolean;
  clear_composition: (id: bigint) => void;
}

let binding: Binding;
const root = resolve(__dirname, '..');
const options: Options = {name: 'rime', napi_versions: [7]};
try {
  binding = build(root, options);
} catch (_e) {
  let cmd = 'npm rebuild';
  if (existsSync('/run/current-system/nixos-version')) {
    cmd = `nix-shell --pure --run "${cmd}"`;
  }
  execSync(cmd, {cwd: resolve(__dirname, '..')});
  binding = build(root, options);
}
export default binding;
