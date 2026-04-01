export const feedbackMessages = {
  createSuccess: "등록이 완료되었습니다.",
  updateSuccess: "수정이 완료되었습니다.",
  deleteConfirm: "정말 삭제하시겠습니까?",
  deleteSuccess: "삭제가 완료되었습니다.",
  listFetchError: "네트워크 오류입니다. 잠시 후 다시 시도해 주세요.",
  itemNotFound: "존재하지 않는 피드백입니다.",
  editForbidden: "수정 권한이 없습니다.",
  itemLoadError: "피드백을 불러오지 못했습니다.",
  formRequired: "제목과 내용을 입력해 주세요.",
  loginPending: "로그인 정보를 확인 중입니다. 잠시 후 다시 시도해 주세요.",
  guestEditForbidden: "체험 계정은 수정할 수 없습니다.",
  saveForbidden: "저장 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.",
  createFailure: "등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  updateFailure: "수정에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  deleteFailure: "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

export const feedbackValidationMessages = {
  titleMin: (min) => `제목은 ${min}글자 이상 입력해 주세요.`,
  titleMax: (max) => `제목은 ${max}글자 이하로 입력해 주세요.`,
  messageMin: (min) => `내용은 ${min}글자 이상 입력해 주세요.`,
  messageMax: (max) => `내용은 ${max}글자 이하로 입력해 주세요.`,
};
