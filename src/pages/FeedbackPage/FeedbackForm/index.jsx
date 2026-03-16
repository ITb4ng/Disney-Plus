import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"]; // 관리자 UID 목록

const FeedbackForm = ({ mode = "create" }) => {
  const nav = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const from = location.state?.from || "/main";
  const fromScrollY = location.state?.scrollY;
  const feedbackListState = useMemo(
    () => (typeof fromScrollY === "number" ? { from, scrollY: fromScrollY } : { from }),
    [from, fromScrollY]
  );

  const auth = getAuth();
  const meUid = auth.currentUser?.uid ?? null;
  const meEmail = auth.currentUser?.email ?? null;
  const isGuest = useMemo(() => meEmail === "demo@disney.dev", [meEmail]);
  const isSuper = useMemo(() => (meUid ? SUPER_UIDS.includes(meUid) : false), [meUid]);

  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(isEdit);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // 등록은 체험 계정도 허용하고, 수정은 로그인 사용자만 허용합니다.
  const canCreate = true;
  const canEdit = !!meUid && !isGuest;
  const isEditLocked = isEdit && !canEdit;
  const isFormDisabled = pending || isEditLocked;

  const getDisplayName = () =>
    isGuest ? "체험계정" : auth.currentUser?.displayName?.trim() || "익명";

  useEffect(() => {
    if (!isEdit || !id) return;

    const run = async () => {
      try {
        setLoading(true);

        const snap = await getDoc(doc(db, "feedback", id));
        if (!snap.exists()) {
          alert("존재하지 않는 피드백입니다.");
          nav("/feedback", { replace: true, state: feedbackListState });
          return;
        }

        const data = snap.data();
        const isOwner = !!meUid && data.uid === meUid;

        if (!isOwner && !isSuper) {
          alert("수정 권한이 없습니다.");
          nav("/feedback", { replace: true, state: feedbackListState });
          return;
        }

        setTitle(data.title ?? "");
        setMessage(data.message ?? "");
      } catch (error) {
        console.error("feedback load error:", error);
        alert("불러오기에 실패했습니다.");
        nav("/feedback", { replace: true, state: feedbackListState });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [feedbackListState, id, isEdit, isSuper, meUid, nav]);

  const onSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }

    if (isEdit && !canEdit) {
      alert("체험 계정은 수정할 수 없습니다.");
      return;
    }

    try {
      setPending(true);

      if (mode === "create") {
        await addDoc(collection(db, "feedback"), {
          title: trimmedTitle,
          message: trimmedMessage,
          uid: meUid ?? null,
          displayName: getDisplayName(),
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "feedback", id), {
          title: trimmedTitle,
          message: trimmedMessage,
          updatedAt: serverTimestamp(),
        });
      }

      nav("/feedback", { replace: true, state: feedbackListState });
    } catch (error) {
      console.error("feedback submit error:", error);
      alert("저장에 실패했습니다. 권한이나 규칙을 확인해 주세요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Wrap>
      <HeadRow>
        <CrumbBlock>
          <Breadcrumb aria-label="현재 위치">
            <CrumbButton
              type="button"
              onClick={() => nav("/feedback", { state: feedbackListState })}
            >
              피드백
            </CrumbButton>
            <CrumbSep aria-hidden="true">/</CrumbSep>
            <CrumbCurrent aria-current="page">
              {mode === "create" ? "등록" : "수정"}
            </CrumbCurrent>
          </Breadcrumb>
        </CrumbBlock>

        <GhostButton
          type="button"
          onClick={() => nav("/feedback", { state: feedbackListState })}
        >
          목록으로
        </GhostButton>
      </HeadRow>

      {isGuest && (
        <TrialBanner>
          <TrialBannerStrong>체험 계정</TrialBannerStrong>으로 이용 중입니다.
          <TrialBannerSubtle>
            {" "}
            피드백 작성은 가능하지만 수정과 삭제는 제한됩니다.
          </TrialBannerSubtle>
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
              onChange={(event) => setTitle(event.target.value)}
              disabled={isFormDisabled}
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
              onChange={(event) => setMessage(event.target.value)}
              disabled={isFormDisabled}
              placeholder="내용을 입력해 주세요"
              rows={7}
            />
          </Field>

          <Actions>
            <PrimaryButton type="submit" disabled={pending || !canCreate || isEditLocked}>
              {pending ? "저장 중..." : mode === "create" ? "등록" : "수정"}
            </PrimaryButton>
          </Actions>
        </FormCard>
      )}
    </Wrap>
  );
};

export default FeedbackForm;
const Wrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;

  @media (max-width: 640px) {
    padding: calc(var(--nav-h, 72px) + 14px) 14px 24px;
  }
`;

const HeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
`;

const CrumbBlock = styled.div`
  min-width: 0;
`;

const Breadcrumb = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);

  @media (max-width: 640px) {
    gap: 6px;
    font-size: 15px;
  }
`;

const CrumbButton = styled.button`
  appearance: none;
  padding: 0;
  border: 0;
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
    font-size: 17px;
  }
`;

const CrumbSep = styled.span`
  opacity: 0.45;
`;

const CrumbCurrent = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;

  @media (max-width: 640px) {
    font-size: 17px;
  }
`;

const GhostButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
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

  @media (max-width: 640px) {
    min-height: 42px;
    font-size: 13px;
  }
`;

const TrialBanner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.4;

  @media (max-width: 640px) {
    margin-top: 10px;
    padding: 10px 11px;
    font-size: 11px;
    line-height: 1.55;
  }
`;

const TrialBannerStrong = styled.strong`
  font-weight: 900;
`;

const TrialBannerSubtle = styled.span`
  opacity: 0.85;
`;

const LoadingText = styled.div`
  margin-top: 14px;
  opacity: 0.75;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const FormCard = styled.form`
  margin-top: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);

  @media (max-width: 640px) {
    margin-top: 12px;
    padding: 14px;
    border-radius: 12px;
  }
`;

const Field = styled.div`
  & + & {
    margin-top: 12px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 900;
  opacity: 0.8;

  @media (max-width: 640px) {
    margin-bottom: 6px;
    font-size: 14px;
  }
`;

const placeholderStyle = `
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
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

  @media (max-width: 640px) {
    min-height: 44px;
    padding: 11px 12px;
    font-size: 15px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  resize: vertical;
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

  @media (max-width: 640px) {
    min-height: 180px;
    padding: 11px 12px;
    font-size: 15px;
    line-height: 1.55;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 640px) {
    margin-top: 12px;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
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
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    width: 100%;
    min-height: 44px;
    font-size: 13px;
  }
`;
