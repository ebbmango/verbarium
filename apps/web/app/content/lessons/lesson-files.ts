/**
 * How lesson files are named: `001.mdx` is Lesson 1. The number in the file
 * name is the lesson's number and its address (`/lessons/1`). Shared by the
 * registry and the build's pre-render list, so they can never disagree; only
 * erasable TypeScript, since the build config imports it directly.
 */
export function lessonNumberFromFileName(fileName: string): number | null {
  const match = /^(\d+)\.mdx$/.exec(fileName);
  return match ? Number(match[1]) : null;
}

/** The lesson number of a lesson file's path (`…/content/lessons/001.mdx` is 1), or null for any other file. */
export function lessonNumberFromPath(path: string): number | null {
  const match = /[\\/]content[\\/]lessons[\\/]([^\\/]+)$/.exec(path);
  return match ? lessonNumberFromFileName(match[1]) : null;
}

/** Wieger's course has this many lessons; the course position counts up to it. */
export const lessonsInCourse = 177;

/** The address of the lesson index. */
export const lessonIndexPath = "/lessons";

/** The address of a lesson: `/lessons/1`. */
export function lessonPath(number: number): string {
  return `${lessonIndexPath}/${number}`;
}

/** Whether an address is the lesson index or a lesson. */
export function isLessonPath(pathname: string): boolean {
  return pathname === lessonIndexPath || pathname.startsWith(`${lessonIndexPath}/`);
}
