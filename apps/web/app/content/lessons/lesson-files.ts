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

/** The address of a lesson: `/lessons/1`. */
export function lessonPath(number: number): string {
  return `/lessons/${number}`;
}

/** Whether an address is the lessons' corner of the site. */
export function isLessonPath(pathname: string): boolean {
  return pathname === "/lessons" || pathname.startsWith("/lessons/");
}
