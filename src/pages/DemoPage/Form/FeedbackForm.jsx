import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import styled from "styled-components";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"]; // 슈퍼 배열 (프론트 UI용)

const FeedbackForm = ({ mode = "create" }) => {
  const nav = useNavigate();
  const { id } = useParams(); // edit일 때 사용

  const auth = getAuth();
  const meUid = auth.currentUser?.uid ?? null;

  // ✅ localStorage는 1회 읽기(현재 동작 유지)
  const meEmail = auth.currentUser?.email ?? null;
  const isGuest = useMemo(() => meEmail === "demo@disney.dev", [meEmail]);
  const isSuper = useMemo(
    () => (meUid ? SUPER_UIDS.includes(meUid) : false),
    [meUid]
  );

  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(isEdit);
  const [pending, setPending] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // 등록(create): 체험계정도 가능
  const canCreate = true;

  // 수정(edit): 로그인 + 비게스트 (본인/슈퍼 여부는 로드에서 가드)
  const canEdit = !!meUid && !isGuest;

  // ✅ edit인데 권한 때문에 폼이 잠기는 상태(중복 조건 제거용)
  const isEditLocked = isEdit && !canEdit;
  const isFormDisabled = pending || isEditLocked;

  // ✅ displayName 생성 규칙을 함수로 고정(중복/누락 방지)
  const getDisplayName = () =>
    isGuest ? "체험계정" : auth.currentUser?.displayName?.trim() || "익명";

  // edit 모드면 기존 문서 로드
  useEffect(() => {
    if (!isEdit) return;
    if (!id) return;

    const run = async () => {
      try {
        setLoading(true);

        const snap = await getDoc(doc(db, "feedback", id));
        if (!snap.exists()) {
          alert("존재하지 않는 피드백입니다.");
          nav("/feedback");
          return;
        }

        const data = snap.data();

        // ✅ 본인 or 슈퍼만 편집 페이지 접근 허용(프론트 가드)
        const isOwner = !!meUid && data.uid === meUid;
        if (!isOwner && !isSuper) {
          alert("수정 권한이 없습니다.");
          nav("/feedback");
          return;
        }

        setTitle(data.title ?? "");
        setMessage(data.message ?? "");
      } catch (e) {
        console.error("feedback load error:", e);
        alert("불러오기 실패");
        nav("/feedback");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isEdit, id, nav, meUid, isSuper]); // ✅ canEdit 제거: effect 내부에서 직접 사용하지 않음

  const onSubmit = async (e) => {
    e.preventDefault();

    const t = title.trim();
    const m = message.trim();

    if (!t || !m) {
      alert("제목/내용을 입력해 주세요.");
      return;
    }

    // ✅ 수정은 체험용/비로그인 불가 (create는 가능)
    if (isEdit && !canEdit) {
      alert("체험용 계정은 수정할 수 없습니다.");
      return;
    }

    try {
      setPending(true);

      if (mode === "create") {
        await addDoc(collection(db, "feedback"), {
          title: t,
          message: m,

          // ✅ 체험용도 등록 가능: uid는 있으면 넣고, 없으면 null
          uid: meUid ?? null,
          displayName: getDisplayName(),

          createdAt: serverTimestamp(),
        });
      } else {
        // edit
        await updateDoc(doc(db, "feedback", id), {
          title: t,
          message: m,
          updatedAt: serverTimestamp(),
          // uid / displayName은 수정하지 않음
        });
      }

      nav("/feedback"); // ✅ 제출 후 리스트로 복귀
    } catch (e) {
      console.error("feedback submit error:", e);
      alert("저장 실패 (권한/규칙 확인)");
    } finally {
      setPending(false);
    }
  };

  return (
    <Wrap>
      <HeadRow>
        <CrumbBlock>
          <Breadcrumb aria-label="현재 위치">
            <CrumbButton type="button" onClick={() => nav("/feedback")}>
              피드백
            </CrumbButton>
            <CrumbSep aria-hidden="true">›</CrumbSep>
            <CrumbCurrent aria-current="page">
              {mode === "create" ? "등록" : "수정"}
            </CrumbCurrent>
          </Breadcrumb>
        </CrumbBlock>

        <GhostButton type="button" onClick={() => nav("/feedback")}>
          목록으로
        </GhostButton>
      </HeadRow>

      {/* ✅ 리스트에서 쓰던 안내 문구 그대로 */}
      {isGuest && (
        <TrialBanner>
          <strong style={{ fontWeight: 900 }}>체험용 계정</strong>으로 이용 중입니다.
          <span style={{ opacity: 0.85 }}>
            {" "}
            피드백은 작성 가능하지만 수정/삭제는 제한됩니다.
          </span>
        </TrialBanner>
      )}

      {loading ? (
        <LoadingText>불러오는 중...</LoadingText>
      ) : (
        <FormCard onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="fb-title">제목</Label>
            <Input
              id="fb-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isFormDisabled} // ✅ 중복 조건 제거
              placeholder="제목을 입력해 주세요"
              autoComplete="off"
              inputMode="text"
            />
          </Field>

          <Field>
            <Label htmlFor="fb-message">내용</Label>
            <Textarea
              id="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isFormDisabled} // ✅ 중복 조건 제거
              placeholder="내용을 입력해주세요."
              rows={7}
            />
          </Field>

          <Actions>
            <PrimaryButton
              type="submit"
              disabled={pending || !canCreate || isEditLocked} // ✅ 읽기 쉬운 조건식
            >
              {pending ? "저장 중..." : mode === "create" ? "등록" : "수정"}
            </PrimaryButton>
          </Actions>
        </FormCard>
      )}
    </Wrap>
  );
};

export default FeedbackForm;

/* =========================
   Styled Components
========================= */

const Wrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: center;
  }
`;

const CrumbBlock = styled.div`
  min-width: 0;
`;

export const Breadcrumb = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
  @media (max-width: 640px) {
    font-size: 16px;
    gap: 6px;
  }
`;

export const CrumbButton = styled.button`
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.95);
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.35);
    text-underline-offset: 3px;
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
		font-size: 18px;
		gap: 6px;
  }
`;

export const CrumbSep = styled.span`
  opacity: 0.45;
`;

export const CrumbCurrent = styled.span`
  color: rgba(255, 255, 255, .95);
  font-weight: 600;
  display:inline-flex;
  height: 24px;
  align-items: center;

  @media (max-width: 640px) {
    font-size: 18px;
		gap: 6px;
  }
`;

// const TitleH2 = styled.h2`
//   margin: 0;
//   font-size: 22px;
//   letter-spacing: -0.2px;

//   @media (max-width: 640px) {
//     font-size: 20px;
//   }
// `;

const GhostButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;

  transition: filter 160ms ease, transform 160ms ease, background 160ms ease;

  &:hover {
    filter: brightness(1.06);
    background: rgba(255, 255, 255, 0.04);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }
`;

const TrialBanner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.4;
`;

const LoadingText = styled.div`
  opacity: 0.75;
  margin-top: 14px;
`;

const FormCard = styled.form`
  margin-top: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.18);
`;

const Field = styled.div`
  & + & {
    margin-top: 12px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 900;
  opacity: 0.8;
  margin-bottom: 8px;
`;

const placeholderStyle = `
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;

  /* iOS 줌 방지 */
  font-size: 16px;
  line-height: 1.4;

  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;

  &:focus {
    border-color: rgba(2, 214, 232, 0.6);
    box-shadow: 0 0 0 2px rgba(2, 214, 232, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    ${placeholderStyle}
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  resize: vertical;

  /* ✅ iOS 줌 방지 */
  font-size: 16px;
  line-height: 1.5;

  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;

  &:focus {
    border-color: rgba(2, 214, 232, 0.6);
    box-shadow: 0 0 0 2px rgba(2, 214, 232, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    ${placeholderStyle}
  }
`;

const Actions = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;

  transition: filter 160ms ease, transform 160ms ease, background 160ms ease;

  &:hover {
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }
`;
