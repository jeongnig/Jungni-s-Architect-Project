import ExamReviewTracker from "./ExamReviewTracker";

type Props = { active: boolean };

export default function ExamsTab({ active }: Props) {
  return (
    <section className={`section-exams${active ? " block" : " hidden"}`}>
      <div className="panel-card">
        <h2>과년도 기출문제</h2>
        <div className="exam-links">
          <a
            className="exam-link-card"
            href="https://ikais.com/architecture/data.php?tabNo=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="exam-link-icon violet">카</span>
            <span className="exam-link-text">
              <span className="exam-link-name">카이스</span>
              <span className="exam-link-desc">ikais.com 기출문제 자료실 바로가기</span>
            </span>
            <span className="exam-link-arrow">→</span>
          </a>
          <a
            className="exam-link-card"
            href="https://pa.inup.co.kr/board/index.jsp?code=question"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="exam-link-icon amber">한</span>
            <span className="exam-link-text">
              <span className="exam-link-name">한솔</span>
              <span className="exam-link-desc">pa.inup.co.kr 기출문제 게시판 바로가기</span>
            </span>
            <span className="exam-link-arrow">→</span>
          </a>
        </div>
      </div>
      <ExamReviewTracker />
    </section>
  );
}
