// Local definition of the api/types enums and interfaces
// This helps us avoid dependency issues with the Joplin library

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

export enum SettingItemType {
  Int = 1,
  String = 2,
  Bool = 3,
  Array = 4,
  Object = 5,
  Button = 6
}

export interface ViewHandle {
  id: string;
}

export enum PanelSide {
  Left = 1,
  Right = 2
} 