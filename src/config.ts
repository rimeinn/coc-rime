import { realpath, mkdir } from 'fs/promises';
import { workspace, WorkspaceConfiguration, ExtensionContext } from 'coc.nvim';
import { Traits } from './binding';

async function get_dir(...dirs: string[]): Promise<string> {
  for (const dir of dirs) {
    try {
      return await realpath(eval('`' + dir + '`'));
    } catch (e) {}
  }
  return '';
}

export interface UI {
  indices: string[];
  left: string;
  right: string;
  left_sep: string;
  right_sep: string;
  cursor: string;
}

export interface Keymap {
  modifiers: string[];
  key: string;
  lhs: string;
}

export class Config {
  private cfg: WorkspaceConfiguration;
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.cfg = workspace.getConfiguration('rime');
    this.context = context;
  }
  get enabled() {
    return this.cfg.get<boolean>('enabled');
  }
  get priority() {
    return this.cfg.get<number>('priority');
  }
  get schemaId() {
    return this.cfg.get<string>('schemaId');
  }
  get shortcut() {
    return this.cfg.get<string>('shortcut');
  }
  get traits() {
    return new Promise<Traits>(async (res, reject) => {
      let shared_data_dir = this.cfg.get<string | string[] | null>('traits.shared_data_dir');
      let user_data_dir = this.cfg.get<string | string[] | null>('traits.user_data_dir');
      let log_dir = this.cfg.get<string | null>('traits.log_dir');
      if (log_dir === '') log_dir = this.context.storagePath;
      if (log_dir !== null) {
        // if logDir doesn't exist:
        // In GNU/Linux, log will be disabled
        // In Android, an ::__fs::filesystem::filesystem_error will be threw
        try {
          await mkdir(log_dir);
        } catch (e) {}
      }
      if (typeof shared_data_dir === 'object') shared_data_dir = await get_dir(...shared_data_dir);
      if (typeof user_data_dir === 'object') user_data_dir = await get_dir(...user_data_dir);
      let traits = {
        shared_data_dir: shared_data_dir,
        user_data_dir: user_data_dir,
        log_dir: log_dir,
        distribution_name: this.cfg.get<string | null>('traits.distribution_name'),
        distribution_code_name: this.cfg.get<string>('traits.distribution_code_name'),
        distribution_version: this.cfg.get<string>('traits.distribution_version'),
        app_name: this.cfg.get<string | null>('traits.app_name'),
        min_log_level: this.cfg.get<0 | 1 | 2 | 3>('traits.min_log_level'),
      };
      try {
        res(traits);
      } catch (e) {
        reject(e);
      }
    });
  }
  get ui() {
    return {
      indices: this.cfg.get<string[]>('ui.indices'),
      left: this.cfg.get<string>('ui.left'),
      right: this.cfg.get<string>('ui.right'),
      left_sep: this.cfg.get<string>('ui.left_sep'),
      right_sep: this.cfg.get<string>('ui.right_sep'),
      cursor: this.cfg.get<string>('ui.cursor'),
    };
  }
  get keymaps() {
    return this.cfg.get<Keymap[]>('keymaps');
  }
}
