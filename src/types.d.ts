declare module 'api' {
  const joplin: {
    plugins: {
      register: (options: any) => void;
    };
    commands: {
      register: (options: any) => Promise<void>;
    };
    views: {
      menuItems: {
        create: (id: string, commandName: string, location: number) => Promise<void>;
      };
      toolbarButtons: {
        create: (id: string, commandName: string, location: number) => Promise<void>;
      };
      dialogs: {
        create: (id: string) => Promise<number>;
        setHtml: (dialogHandle: number, html: string) => Promise<void>;
        setButtons: (dialogHandle: number, buttons: { id: string, title: string }[]) => Promise<void>;
        open: (dialogHandle: number) => Promise<any>;
        showMessageBox: (message: string) => Promise<void>;
      };
    };
    data: {
      get: (path: string[], query?: any) => Promise<any>;
    };
  };
  export default joplin;
}

declare module 'api/types' {
  export enum MenuItemLocation {
    File = 1,
    Edit = 2,
    View = 3,
    Note = 4,
    Tools = 5,
    Help = 6
  }

  export enum ToolbarButtonLocation {
    NoteToolbar = 1,
    EditorToolbar = 2
  }
}

declare module 'edn-data' {
  export function encode(data: any): string;
  export function parse(data: string): any;
} 