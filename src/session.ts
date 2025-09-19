import binding from './binding';
import {Traits, Context, Schema, Commit} from './binding';

export class Session {
  traits: Traits;
  id: bigint;

  constructor(traits: Traits | null) {
    this.traits = traits;
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
}
