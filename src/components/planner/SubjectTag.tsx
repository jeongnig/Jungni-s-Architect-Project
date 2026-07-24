import { classifySubject, subjectClassName } from "@/lib/types";

export default function SubjectTag({ text }: { text: string }) {
  const subject = classifySubject(text);
  return <span className={`subject-tag ${subjectClassName(subject)}`}>{subject}</span>;
}
