import {
  Actions,
  Field,
  FormCard,
  Input,
  Label,
  LoadingText,
  PrimaryButton,
  Textarea,
} from "./styles";

function FeedbackFormFields({
  loading,
  title,
  message,
  isFormDisabled,
  pending,
  canCreate,
  isEditLocked,
  submitLabel,
  pendingLabel,
  onTitleChange,
  onMessageChange,
  onSubmit,
}) {
  if (loading) {
    return <LoadingText>불러오는 중...</LoadingText>;
  }

  return (
    <FormCard onSubmit={onSubmit}>
      <Field>
        <Label htmlFor="fb-title">제목</Label>
        <Input
          id="fb-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={isFormDisabled}
          placeholder="제목을 입력해 주세요."
          autoComplete="off"
          inputMode="text"
        />
      </Field>

      <Field>
        <Label htmlFor="fb-message">내용</Label>
        <Textarea
          id="fb-message"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          disabled={isFormDisabled}
          placeholder="내용을 입력해 주세요."
          rows={7}
        />
      </Field>

      <Actions>
        <PrimaryButton type="submit" disabled={pending || !canCreate || isEditLocked}>
          {pending ? pendingLabel : submitLabel}
        </PrimaryButton>
      </Actions>
    </FormCard>
  );
}

export default FeedbackFormFields;
