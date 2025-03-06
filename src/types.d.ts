declare module 'api' {
  const joplin: {
    plugins: {
      register: (options: any) => void;
    };
    commands: {
      register: (options: any) => Promise<void>;
    };
    settings: {
      registerSection: (name: string, section: any) => Promise<void>;
      registerSettings: (settings: any) => Promise<void>;
      value: (key: string) => Promise<any>;
      setValue: (key: string, value: any) => Promise<void>;
      onChange: (callback: Function) => Promise<void>;
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
      panels: {
        create: (id: string) => Promise<string>;
        setHtml: (handle: string, html: string) => Promise<string>;
        addScript: (handle: string, scriptPath: string) => Promise<void>;
        onMessage: (handle: string, callback: Function) => Promise<void>;
        postMessage: (handle: string, message: any) => void;
        show: (handle: string) => Promise<void>;
        hide: (handle: string) => Promise<void>;
      };
    };
    data: {
      get: (path: string[], query?: any) => Promise<any>;
    };
    interop: {
      registerExportModule: (options: any) => Promise<void>;
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

declare module 'path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function resolve(...paths: string[]): string;
} 