import {realpathSync, mkdirSync} from 'fs';
import {homedir} from 'os';

import expandTilde from 'expand-tilde';
import expandenv from 'expandenv';

import binding from './binding';
import {traits, Traits, Context, Schema, Commit} from './binding';
import pkg from '../package.json';
import {key_to_rime} from './key';

const properties = pkg.contributes.configuration.properties;

export function get_dir(...dirs: string[]): string {
  for (const dir of dirs) {
    try {
      return realpathSync(expandTilde(expandenv(dir)));
    } catch (_e) {}
  }
  return '';
}

export const default_traits: traits = {
  shared_data_dir: get_dir(...properties["rime.traits.shared_data_dir"].default),
  user_data_dir: get_dir(...properties["rime.traits.user_data_dir"].default),
  log_dir: homedir() + "/.config/coc/extensions/coc-rime-data",
  distribution_name: properties["rime.traits.distribution_name"].default,
  distribution_code_name: properties["rime.traits.distribution_code_name"].default,
  distribution_version: properties["rime.traits.distribution_version"].default,
  app_name: properties["rime.traits.app_name"].default,
  // @ts-ignore
  min_log_level: properties["rime.traits.min_log_level"].default,
}

export class Session {
  traits: Traits;
  id: bigint;

  constructor(traits?: Traits) {
    this.traits = traits || new binding.Traits(default_traits);
    if (this.traits.log_dir !== null) {
      // if logDir doesn't exist:
      // In GNU/Linux, log will be disabled
      // In Android, an ::__fs::filesystem::filesystem_error will be threw
      mkdirSync(this.traits.log_dir, {recursive: true})
    }
    this.id = binding.create_session();
  }

  dispose() {
    binding.destroy_session(this.id);
  }

  get_schema_list(): Schema[] {
    return binding.get_schema_list();
  }

  get_current_schema(): string {
    return binding.get_current_schema(this.id);
  }

  select_schema(id: string): boolean {
    return binding.select_schema(this.id, id);
  }

  process_key(code: number, mask: number): boolean {
    return binding.process_key(this.id, code, mask);
  }

  get_context(): Context | null {
    return binding.get_context(this.id);
  }

  get_commit(): Commit | null {
    return binding.get_commit(this.id);
  }

  commit_composition(): boolean {
    return binding.commit_composition(this.id);
  }

  clear_composition() {
    binding.clear_composition(this.id);
  }

  get_commit_text(): string {
    let text = '';
    if (this.commit_composition()) {
      const commit = this.get_commit();
      if (commit !== null) {
        text = commit.text;
      }
    }
    return text;
  }

  parse_key(basic: string, modifiers_keys: string[]): boolean {
    const [code, mask] = key_to_rime(basic, modifiers_keys);
    return this.process_key(code, mask);
  }

  getFullContext(input: string): Context {
    for (const singleChar of input) {
      this.parse_key(singleChar, []);
    }
    let context = this.get_context();
    const result = context;
    if (input !== '')
      while (!context.menu.is_last_page) {
        this.parse_key('=', []);
        context = this.get_context();
        result.menu.num_candidates += context.menu.num_candidates;
        if (result.menu?.select_keys && context.menu?.select_keys) {
          result.menu.select_keys.push(...context.menu.select_keys);
        }
        if (result.menu?.candidates && context.menu?.candidates) {
          result.menu.candidates.push(...context.menu.candidates);
        }
      }
    this.clear_composition()
    return result;
  }
}
