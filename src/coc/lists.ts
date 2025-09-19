import {BasicList, ListAction, ListContext, ListItem, Neovim, window, StatusBarItem} from 'coc.nvim';

import {Rime} from './rime';

export default class SchemaList extends BasicList {
  public readonly name = 'rime_schema';
  public readonly description = 'Schema list of Rime';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];

  private rime: Rime;

  constructor(nvim: Neovim, rime: Rime, statusBarItem: StatusBarItem, shortcut: string) {
    super(nvim);
    this.rime = rime;
    this.addAction('open', (item: ListItem) => {
      if (this.rime.session.select_schema(item.data.schema_id))
        window.showMessage(`Changed to schema ${item.data.label}.`);
      else
        window.showMessage(`Set schema ${item.data.label} failed.`);
      statusBarItem.text =
        shortcut +
        ' ' +
        this.rime.session.get_schema_list().filter((schema) => {
          return schema.schema_id === item.data.schema_id;
        })[0].name;
    });
  }

  public async loadItems(_context: ListContext): Promise<ListItem[] | null> {
    return new Promise<ListItem[] | null>((resolve, _) => {
      const listItems: ListItem[] = this.rime.session.get_schema_list().map((schema) => {
        return {
          label: schema.name + ': ' + schema.schema_id,
          filterText: schema.name + schema.schema_id,
          data: schema,
        };
      });
      resolve(listItems);
    });
  }
}
