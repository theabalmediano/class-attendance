import type { AttendanceRecord } from './firestoreService';

export interface StudentDirectoryProfile {
  username: string;
  fullName?: string;
  gender?: string;
  section?: string;
  subject?: string;
  role?: string;
}

const normalize = (value?: string) => value?.trim().toLowerCase() || '';
const groupKey = (name: string, section?: string, subject?: string) => (
  `${normalize(name)}|${normalize(section)}|${normalize(subject)}`
);

const readRegisteredStudents = (): StudentDirectoryProfile[] => {
  const stored = localStorage.getItem('attendanceUsers');
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StudentDirectoryProfile[];
    return parsed.filter((user) => user.role === 'student');
  } catch {
    return [];
  }
};

export const getDirectoryStudents = (records: AttendanceRecord[]): StudentDirectoryProfile[] => {
  const students = readRegisteredStudents();
  const byGroup = new Set<string>();

  students.forEach((student) => {
    [student.username, student.fullName].forEach((name) => {
      if (name) byGroup.add(groupKey(name, student.section, student.subject));
    });
  });

  records.forEach((record) => {
    const registeredStudent = students.find((student) => [student.fullName, student.username]
      .some((value) => normalize(value) === normalize(record.name)));
    const names = [record.name, registeredStudent?.username, registeredStudent?.fullName].filter(Boolean) as string[];
    const hasMatchingStudent = names.some((name) => byGroup.has(groupKey(name, record.section, record.subject)));
    if (!normalize(record.name) || !normalize(record.section) || !normalize(record.subject) || hasMatchingStudent) return;

    students.push({
      username: registeredStudent?.username || record.name,
      fullName: registeredStudent?.fullName || record.name,
      gender: registeredStudent?.gender,
      section: record.section,
      subject: record.subject,
      role: 'student'
    });
    names.forEach((name) => byGroup.add(groupKey(name, record.section, record.subject)));
  });

  return students;
};
