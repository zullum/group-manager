export interface Student {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  students: Student[];
}

export type DragTypes = 'group' | 'student';

export interface DragData {
  type: DragTypes;
  groupId?: string;
  studentId?: string;
}