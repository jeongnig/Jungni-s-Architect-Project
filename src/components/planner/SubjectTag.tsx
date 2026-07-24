import { TaskSubject } from "@/lib/types";

export default function SubjectTag({ subject }: { subject: TaskSubject }) {
  return (
    <span className={`subject-tag ${subject === "구조" ? "subject-gu" : "subject-dan"}`}>
      {subject}
    </span>
  );
}
