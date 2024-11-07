import { Group } from '../types';

export const reorderGroups = (groups: Group[], activeIndex: number, overIndex: number): Group[] => {
  const newGroups = [...groups];
  const [removed] = newGroups.splice(activeIndex, 1);
  newGroups.splice(overIndex, 0, removed);
  return newGroups;
};

export const moveStudent = (
  groups: Group[],
  sourceGroupId: string,
  destinationGroupId: string,
  studentId: string
): Group[] => {
  const sourceGroupIndex = groups.findIndex(g => g.id === sourceGroupId);
  const destGroupIndex = groups.findIndex(g => g.id === destinationGroupId);
  
  if (sourceGroupIndex === -1 || destGroupIndex === -1) return groups;
  
  const sourceGroup = groups[sourceGroupIndex];
  const studentIndex = sourceGroup.students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) return groups;
  
  const newGroups = [...groups];
  const [student] = newGroups[sourceGroupIndex].students.splice(studentIndex, 1);
  newGroups[destGroupIndex].students.push(student);
  
  return newGroups;
};

export const reorderStudentsInGroup = (
  groups: Group[],
  groupId: string,
  oldIndex: number,
  newIndex: number
): Group[] => {
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) return groups;
  
  const newGroups = [...groups];
  const group = { ...newGroups[groupIndex] };
  const students = [...group.students];
  const [removed] = students.splice(oldIndex, 1);
  students.splice(newIndex, 0, removed);
  group.students = students;
  newGroups[groupIndex] = group;
  
  return newGroups;
};