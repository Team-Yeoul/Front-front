// /v1/counseling-sessions 응답 모양. 백엔드 코드(backend-server, counseling/presentation/dto)를 기준으로 작성했다.
// 명세 파일의 해당 스키마는 실제 응답과 달라서 생성 타입 대신 이 타입을 쓴다.

export interface CounselingSession {
  session_id: string;
  user_id: string;
  title: string;
  active_branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface CounselingMessage {
  message_id: string;
  session_id: string;
  branch_id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  active_revision_id: string | null;
  selected_generation_id: string | null;
  created_at: string;
}

/** USER 메시지를 보내면 AI 답변(assistant_message)이 함께 온다. 생성에 실패하면 reply_status=FAILED. */
export interface SendCounselingMessageResponse extends CounselingMessage {
  assistant_message: CounselingMessage | null;
  reply_status: 'CREATED' | 'FAILED' | 'NOT_REQUESTED';
}
