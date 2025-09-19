// https://github.com/rime/librime/blob/master/src/rime/key_table.cc
import modifiers from './data/modifiers.json';
import keys from './data/keys.json';

export function key_to_rime(basic: string, modifiers_keys: string[]): number[] {
  let mask = 0;
  for (const modifier of modifiers_keys) {
    const index = modifiers.indexOf(modifier);
    if (index !== -1) {
      mask += 2 ** index;
    } else {
      throw Error;
    }
  }
  let code = basic.charCodeAt(0);
  if (basic in keys) {
    code = keys[basic];
  }
  return [code, mask]
}
