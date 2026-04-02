import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import FeedbackFormFields from "./FeedbackFormFields";
import FeedbackFormHeader from "./FeedbackFormHeader";
import { Wrap } from "./styles";
import { useFormNotice } from "./useFormNotice";
import {
  getFeedbackDisplayName,
  getFeedbackFormText,
  validateFeedbackForm,
} from "./viewModel";
import { FeedbackNoticeOverlay, FEEDBACK_NOTICE_VARIANTS } from "../notice";
import { feedbackMessages } from "../messages";
import { NOTICE_TYPES } from "../state";

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"];

const FeedbackForm = ({ mode = "create" }) => {
  const nav = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { userData } = useAuth();

  const from = location.state?.from || "/main";
  const fromScrollY = location.state?.scrollY;
  const feedbackListState = useMemo(
    () => (typeof fromScrollY === "number" ? { from, scrollY: fromScrollY } : { from }),
    [from, fromScrollY]
  );

  const withFeedbackNotice = useCallback(
    (notice) => ({
      ...feedbackListState,
      feedbackNotice: {
        ...notice,
        timestamp: Date.now(),
      },
    }),
    [feedbackListState]
  );

  const meUid = userData?.uid ?? null;
  const meEmail = userData?.email ?? null;
  const isGuest = useMemo(() => meEmail === "demo@disney.dev", [meEmail]);
  const isSuper = useMemo(() => (meUid ? SUPER_UIDS.includes(meUid) : false), [meUid]);
  const displayName = useMemo(
    () => getFeedbackDisplayName(userData, isGuest),
    [isGuest, userData]
  );

  const isEdit = mode === "edit";
  const canCreate = !!meUid;
  const canEdit = !!meUid && !isGuest;
  const isEditLocked = isEdit && !canEdit;
  const isFormDisabled = isEditLocked;
  const formText = getFeedbackFormText(mode);

  const [loading, setLoading] = useState(isEdit);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { noticeBox, showFormNotice } = useFormNotice();

  const goBackToList = useCallback(() => {
    nav("/feedback", { state: feedbackListState });
  }, [feedbackListState, nav]);

  useEffect(() => {
    if (!isEdit || !id) return;

    const run = async () => {
      try {
        setLoading(true);

        const snap = await getDoc(doc(db, "feedback", id));
        if (!snap.exists()) {
          nav("/feedback", {
            replace: true,
            state: withFeedbackNotice({
              variant: FEEDBACK_NOTICE_VARIANTS.ERROR,
              message: feedbackMessages.itemNotFound,
            }),
          });
          return;
        }

        const data = snap.data();
        const isOwner = !!meUid && data.uid === meUid;

        if (!isOwner && !isSuper) {
          nav("/feedback", {
            replace: true,
            state: withFeedbackNotice({
              variant: FEEDBACK_NOTICE_VARIANTS.ERROR,
              message: feedbackMessages.editForbidden,
            }),
          });
          return;
        }

        setTitle(data.title ?? "");
        setMessage(data.message ?? "");
      } catch (error) {
        console.error("feedback load error:", error);
        nav("/feedback", {
          replace: true,
          state: withFeedbackNotice({
            variant: FEEDBACK_NOTICE_VARIANTS.ERROR,
            message: feedbackMessages.itemLoadError,
          }),
        });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, isEdit, isSuper, meUid, nav, withFeedbackNotice]);

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const validationMessage = validateFeedbackForm({
        title,
        message,
        meUid,
        isEdit,
        canEdit,
      });

      if (validationMessage) {
        showFormNotice(validationMessage);
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedMessage = message.trim();

      try {
        setPending(true);

        if (mode === "create") {
          await addDoc(collection(db, "feedback"), {
            title: trimmedTitle,
            message: trimmedMessage,
            uid: meUid,
            displayName,
            createdAt: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, "feedback", id), {
            title: trimmedTitle,
            message: trimmedMessage,
            updatedAt: serverTimestamp(),
          });
        }

        nav("/feedback", {
          replace: true,
          state: withFeedbackNotice({
            type: mode === "create" ? NOTICE_TYPES.CREATE_SUCCESS : NOTICE_TYPES.UPDATE_SUCCESS,
            variant: FEEDBACK_NOTICE_VARIANTS.SUCCESS,
            message:
              mode === "create"
                ? feedbackMessages.createSuccess
                : feedbackMessages.updateSuccess,
          }),
        });
      } catch (error) {
        console.error("feedback submit error:", error);

        if (error?.code === "permission-denied") {
          showFormNotice(feedbackMessages.saveForbidden);
          return;
        }

        showFormNotice(
          mode === "create" ? feedbackMessages.createFailure : feedbackMessages.updateFailure
        );
      } finally {
        setPending(false);
      }
    },
    [canEdit, displayName, id, isEdit, meUid, message, mode, nav, showFormNotice, title, withFeedbackNotice]
  );

  return (
    <Wrap>
      <FeedbackNoticeOverlay notice={noticeBox} />

      <FeedbackFormHeader mode={mode} isGuest={isGuest} onBackToList={goBackToList} />

      <FeedbackFormFields
        loading={loading}
        title={title}
        message={message}
        isFormDisabled={pending || isFormDisabled}
        pending={pending}
        canCreate={canCreate}
        isEditLocked={isEditLocked}
        submitLabel={formText.submitLabel}
        pendingLabel={formText.pendingLabel}
        onTitleChange={setTitle}
        onMessageChange={setMessage}
        onSubmit={onSubmit}
      />
    </Wrap>
  );
};

export default FeedbackForm;
