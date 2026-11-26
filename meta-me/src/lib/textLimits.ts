/** 글자를 적는 칸의 공통 상한. 따로 더 작은 제한이 없는 칸은 모두 이 길이까지만 받는다. */
export const MAX_TEXT_LENGTH = 10000;

/** AI 대화(상담) 메시지 상한. 서버가 4000자를 넘는 메시지를 거절한다(SendMessageRequest @Size(max = 4000)). */
export const COUNSELING_MESSAGE_MAX_LENGTH = 4000;
