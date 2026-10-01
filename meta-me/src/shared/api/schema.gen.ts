export interface paths {
    "/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login
         * @description 이메일과 비밀번호로 로그인하고 Access Token과 Refresh Token을 발급받습니다. 실패 시 AUTH_INVALID_CREDENTIALS 코드가 반환됩니다.
         */
        post: operations["Login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description 현재 Refresh Token을 Redis 블랙리스트에 등록해 로그아웃 처리합니다. 이후 해당 Refresh Token은 재사용할 수 없습니다.
         */
        post: operations["Logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetMyAccount
         * @description 현재 로그인한 사용자의 계정 기본 정보와 구독 등급을 조회합니다.
         */
        get: operations["GetMyAccount"];
        put?: never;
        post?: never;
        /**
         * WithdrawAccount
         * @description 현재 로그인한 계정을 탈퇴 처리합니다. 탈퇴 시 사용자 기록, AI 분석 결과, 성향 프로필 삭제 절차가 시작됩니다.
         */
        delete: operations["WithdrawAccount"];
        options?: never;
        head?: never;
        /**
         * UpdateMyAccount
         * @description 현재 로그인한 사용자의 계정 정보를 수정합니다. 구독 등급(subscription_tier)은 결제 승인 또는 관리자 처리 결과로만 변경되며, 이 API에서 직접 변경할 수 없습니다.
         */
        patch: operations["UpdateMyAccount"];
        trace?: never;
    };
    "/v1/auth/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * RequestPasswordReset
         * @description 비밀번호 재설정 요청을 생성합니다. 존재하지 않는 이메일도 보안상 동일한 성공 메시지를 반환할 수 있습니다.
         */
        post: operations["RequestPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * ConfirmPasswordReset
         * @description 비밀번호 재설정 토큰을 검증하고 새 비밀번호로 변경합니다. 토큰이 만료되었거나 유효하지 않으면 AUTH_PASSWORD_RESET_TOKEN_INVALID가 반환됩니다.
         */
        post: operations["ConfirmPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Signup
         * @description 이메일, 비밀번호, 생년월일로 회원가입합니다. 이메일이 이미 존재하면 409 AUTH_EMAIL_ALREADY_EXISTS를 반환합니다.
         */
        post: operations["Signup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/token/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * RefreshToken
         * @description Refresh Token으로 새로운 Access Token과 Refresh Token을 발급합니다. Redis에 저장된 토큰이 없거나 폐기된 경우 AUTH_REFRESH_TOKEN_INVALID가 반환됩니다. Refresh Token은 MVP에서 JSON body로 전달하지만, 운영 환경에서는 httpOnly Secure Cookie 전환을 권장합니다. 서버는 Redis에 저장된 토큰 상태를 기준으로 검증합니다.
         */
        post: operations["RefreshToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/onboarding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * SubmitOnboarding
         * @description Day 0 온보딩 답변을 제출하고 AI 첫 문장을 생성합니다. 온보딩은 한 번만 제출 가능하며 중복 제출 시 409 ONBOARDING_ALREADY_SUBMITTED가 반환됩니다.
         */
        post: operations["SubmitOnboarding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/onboarding/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetOnboardingResult
         * @description 내 온보딩 결과와 AI가 생성한 첫 문장, 초기 정확도 정보를 조회합니다.
         */
        get: operations["GetOnboardingResult"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/nicknames": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListMyNicknames
         * @description 내가 받은 별명 목록을 페이지 단위로 조회합니다. page는 모든 목록 API와 동일하게 1부터 시작합니다. type query로 SELF, AI, OTHERS 중 특정 거울 유형만 필터링할 수 있습니다. AI 별명은 서버 내부 생성 결과이며 클라이언트가 직접 만들 수 없습니다.
         */
        get: operations["ListMyNicknames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/notification-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetNotificationSettings
         * @description 현재 사용자의 알림 수신 설정을 조회합니다.
         */
        get: operations["GetNotificationSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * UpdateNotificationSettings
         * @description 현재 사용자의 알림 수신 설정을 부분 수정합니다. 푸시, 이메일 등 채널별 설정을 갱신합니다.
         */
        patch: operations["UpdateNotificationSettings"];
        trace?: never;
    };
    "/v1/users/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetMyProfile
         * @description 현재 사용자의 자기이해 프로필과 온보딩 기반 프로필 정보를 조회합니다.
         */
        get: operations["GetMyProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetTerms
         * @description 현재 사용자에게 적용되는 약관 및 개인정보 동의 상태를 조회합니다.
         */
        get: operations["GetTerms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{user_id}/nicknames": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateNickname
         * @description 특정 사용자에게 별명을 부여합니다. 일반 클라이언트는 SELF 또는 OTHERS 유형만 요청할 수 있고 AI 유형은 서버 내부에서만 생성됩니다.
         */
        post: operations["CreateNickname"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetMyAccuracy
         * @description 프로필 화면과 온보딩 이후 리텐션 훅에서 사용하는 현재 자기 이해 정확도를 조회합니다. accuracy_percent는 최신 AccuracyLog를 기준으로 계산되며, 기록 깊이 XP와 메타인지 편차 개선량이 반영됩니다.
         */
        get: operations["GetMyAccuracy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/device-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * RegisterDeviceToken
         * @description 현재 사용자의 푸시 디바이스 토큰을 등록합니다. 동일 token은 UNIQUE 제약으로 upsert 처리됩니다.
         */
        post: operations["RegisterDeviceToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/device-tokens/{device_token_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * DeleteDeviceToken
         * @description 등록된 디바이스 토큰을 해지합니다. 로그아웃/앱 삭제 시 호출합니다.
         */
        delete: operations["DeleteDeviceToken"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/brain-structures/weekly": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * GenerateWeeklyBrainStructure
         * @description 일주일 기록과 객관화 미러 데이터를 기반으로 주간 뇌구조 이미지를 생성합니다. 입력값은 request body의 target_week_start로 받으며, 생략하면 서버 현재 시각 기준 이번 주 월요일부터 일요일까지를 분석합니다.
         */
        post: operations["GenerateWeeklyBrainStructure"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/brain-structures/{brain_structure_id}/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * ShareBrainStructure
         * @description 생성된 주간 뇌구조 이미지를 공유 가능한 상태로 전환하거나 공유 URL을 발급합니다. 본인 소유 리소스만 공유할 수 있습니다.
         */
        post: operations["ShareBrainStructure"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/quests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListQuests
         * @description 현재 사용자에게 추천된 나다움 퀘스트 목록을 페이지네이션으로 조회합니다. 퀘스트는 서버의 AI 추천/배치 파이프라인이 사용자 프로필과 기록 데이터를 바탕으로 생성하며, 클라이언트는 조회와 완료 처리만 수행합니다.
         */
        get: operations["ListQuests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/quests/{quest_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetQuest
         * @description 단일 나다움 퀘스트의 내용, 추천 이유, 완료 상태를 조회합니다.
         */
        get: operations["GetQuest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/quests/{quest_id}/completion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CompleteQuest
         * @description 퀘스트 수행 후 회고와 만족도 점수를 제출합니다. satisfaction_score는 0~100 범위입니다.
         */
        post: operations["CompleteQuest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListReports
         * @description 내 리포트 목록을 유형과 페이지 조건으로 조회합니다. reportType을 생략하면 전체 유형을 대상으로 조회합니다.
         */
        get: operations["ListReports"];
        put?: never;
        /**
         * GenerateReport
         * @description 지정한 기간과 유형에 따라 주간, 월간, 자기이해 리포트를 생성합니다. 리포트 생성은 누적 기록이 부족하면 제한될 수 있습니다.
         */
        post: operations["GenerateReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/{report_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetReport
         * @description 단일 리포트의 구조화된 분석 내용을 조회합니다. 본인 소유 리포트만 접근할 수 있습니다.
         */
        get: operations["GetReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/daily-questions/{question_id}/tail-questions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateTailQuestion
         * @description 특정 데일리 질문에 대해 AI 후속 질문을 생성합니다. 생성 직후에는 아직 사용자가 답하지 않았으므로 user_answer는 null이며, 이후 PATCH 엔드포인트로 답변을 제출합니다.
         */
        post: operations["CreateTailQuestion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/daily-questions/{question_id}/tail-questions/{tail_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * UpdateTailQuestionAnswer
         * @description 부모 데일리 질문에 속한 꼬리 질문의 답변을 수정합니다. question_id와 tail_id의 소유 관계를 함께 검증합니다.
         */
        patch: operations["UpdateTailQuestionAnswer"];
        trace?: never;
    };
    "/v1/daily-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListDailyRecords
         * @description 기간과 페이지 조건으로 내 데일리 기록 목록을 조회합니다. startDate/endDate를 생략하면 기본 기간 정책에 따라 최신 기록을 반환합니다.
         */
        get: operations["ListDailyRecords"];
        put?: never;
        /**
         * CreateDailyRecord
         * @description 오늘의 데일리 기록을 생성합니다. 하루에 1건만 생성 가능하며, 같은 날 중복 요청 시 409 DIARY_RECORD_ALREADY_EXISTS가 반환됩니다.
         */
        post: operations["CreateDailyRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/daily-records/{record_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetDailyRecord
         * @description 단일 데일리 기록과 연결된 질문, 메타인지 트리거 정보를 조회합니다. 본인 소유 기록만 접근할 수 있습니다.
         */
        get: operations["GetDailyRecord"];
        put?: never;
        post?: never;
        /**
         * DeleteDailyRecord
         * @description 데일리 기록을 삭제합니다. 연결된 질문, 트리거, 분석 결과 처리 방식은 백엔드 삭제 정책을 따릅니다.
         */
        delete: operations["DeleteDailyRecord"];
        options?: never;
        head?: never;
        /**
         * UpdateDailyRecord
         * @description 기존 데일리 기록의 답변, 감정 태그, 장면 설명, 나다움 순간 정보를 부분 수정합니다.
         */
        patch: operations["UpdateDailyRecord"];
        trace?: never;
    };
    "/v1/metacog-bettings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateMetacogBetting
         * @description 메타인지 트리거의 예측 정확도에 코인을 베팅합니다. 정산은 실제 결과 제출 이후 수행됩니다.
         */
        post: operations["CreateMetacogBetting"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/metacog-bettings/{betting_id}/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * SubmitMetacogBettingResult
         * @description 베팅과 연결된 실제 결과를 제출하고 오차율, 파산 여부, 보상 코인을 정산합니다. 요청 body는 메타인지 트리거 결과 제출과 동일한 SubmitActualResultRequest 형식을 재사용합니다. 별도 트리거 결과 제출 없이 이 API 호출만으로 베팅 정산에 필요한 실제값이 저장됩니다.
         */
        patch: operations["SubmitMetacogBettingResult"];
        trace?: never;
    };
    "/v1/metacog-triggers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateMetacogTrigger
         * @description 데일리 기록에 연결된 메타인지 사전 예측값을 생성합니다. 점수와 만족도는 0~100, 예상 시간은 0 이상이어야 합니다.
         */
        post: operations["CreateMetacogTrigger"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/metacog-triggers/{trigger_id}/report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetMetacogTriggerReport
         * @description 특정 메타인지 트리거의 예측-실제 편차 분석 리포트를 조회합니다. 실제 결과가 없는 경우 분석 내용이 제한될 수 있습니다.
         */
        get: operations["GetMetacogTriggerReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/metacog-triggers/{trigger_id}/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * SubmitMetacogTriggerResult
         * @description 메타인지 트리거의 실제 점수, 실제 소요 시간, 실제 만족도를 제출합니다. 제출 후 MAE 편차와 인사이트가 계산됩니다.
         */
        patch: operations["SubmitMetacogTriggerResult"];
        trace?: never;
    };
    "/v1/daily-questions/today": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetTodayDailyQuestion
         * @description 오늘의 AI 데일리 질문을 반환합니다. 최초 요청 시 서버가 사용자의 최근 기록과 성장 맥락을 바탕으로 질문을 생성하고 Redis에 캐싱합니다. 오늘 기록이 이미 있으면 해당 기록의 질문을 반환합니다.
         */
        get: operations["GetTodayDailyQuestion"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mirror-monsters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListMirrorMonsters
         * @description 마스터 몬스터 도감 목록을 페이지 단위로 조회합니다. 각 몬스터는 인지 편향 또는 반복 패턴 감지 조건을 나타냅니다.
         */
        get: operations["ListMirrorMonsters"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/objective-mirrors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListObjectiveMirrors
         * @description 내 객관화 미러 히스토리를 페이지 단위로 조회합니다. 최신 변환 결과부터 반환합니다.
         */
        get: operations["ListObjectiveMirrors"];
        put?: never;
        /**
         * CreateObjectiveMirror
         * @description 감정적 원문 기록을 AI가 3인칭 관찰자 시점의 객관화 문장으로 변환합니다. 변환 과정에서 감지된 몬스터가 함께 반환됩니다.
         */
        post: operations["CreateObjectiveMirror"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/objective-mirrors/{mirror_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetObjectiveMirror
         * @description 단일 객관화 미러 결과와 해금된 몬스터 정보를 조회합니다. 본인 소유 리소스만 접근할 수 있습니다.
         */
        get: operations["GetObjectiveMirror"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/b2b/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListB2BReports
         * @description B2B 관리자 권한으로 소속 기관의 집계 리포트 목록을 조회합니다. 원문 기록은 반환하지 않으며 익명화된 통계/리포트만 제공합니다.
         */
        get: operations["ListB2BReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * SendNotification
         * @description 관리자가 특정 사용자에게 시스템 알림을 발송합니다. 일반 USER는 호출할 수 없으며 ADMIN 권한이 필요합니다.
         */
        post: operations["SendNotification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetAdminStatistics
         * @description 관리자가 서비스 운영 통계를 조회합니다. USER 권한으로는 호출할 수 없고 ADMIN 권한이 필요합니다.
         */
        get: operations["GetAdminStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ai-counseling/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateAiCounselingSession
         * @description AI 상담을 시작하기 위한 세션을 생성합니다. 서버는 사용자의 누적 기록, 최근 감정 흐름, 메타인지 패턴을 조회해 이 세션의 개인화 컨텍스트로 조립합니다. 이후 메시지는 session_id를 포함해 전송합니다.
         */
        post: operations["CreateAiCounselingSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ai-counseling/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CreateAiCounselingMessage
         * @description AI 상담 세션에 사용자 메시지를 추가하고 AI 응답을 생성합니다. 세션은 POST /v1/ai-counseling/sessions로 먼저 생성해야 하며, LLM 호출 실패 시 500 EXTERNAL_LLM_FAILED 또는 INTERNAL_SERVER_ERROR가 반환될 수 있습니다.
         */
        post: operations["CreateAiCounselingMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/crisis-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Crisis Logs
         * @description 모든 위기 감지 로그를 조회합니다. (관리자 전용)
         */
        get: operations["GetCrisisLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ai-counseling/sessions/{session_id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListAiCounselingMessages
         * @description 특정 AI 상담 세션의 메시지 목록을 페이지네이션으로 조회합니다. session_id가 현재 사용자 소유가 아니면 403 AI_COUNSELING_SESSION_FORBIDDEN을 반환하고, 존재하지 않으면 404를 반환합니다.
         */
        get: operations["ListAiCounselingMessages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/crisis-logs/{logId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Crisis Log Details
         * @description 특정 위기 로그의 상세 정보와 취한 액션들을 조회합니다.
         */
        get: operations["GetCrisisLogDetail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/crisis-logs/{logId}/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Crisis Actions
         * @description 특정 위기 로그에 대해 취해진 액션들을 조회합니다.
         */
        get: operations["GetCrisisActions"];
        put?: never;
        /**
         * Record Crisis Action
         * @description 위기 로그에 대해 취한 액션을 기록합니다.
         */
        post: operations["RecordCrisisAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/monsters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListMyMonsters
         * @description 현재 로그인한 사용자가 획득한 몬스터 도감 컬렉션을 페이지 단위로 조회합니다. 각 항목은 누적 개수(monster_count), 개수 기반 칭호 단계(title_stage), 최종 희귀도(effective_rarity)를 포함합니다.
         */
        get: operations["ListMyMonsters"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscription-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Subscription Plans
         * @description 모든 활성화된 구독 요금제를 조회합니다.
         */
        get: operations["GetSubscriptionPlans"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me/subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GetMySubscription
         * @description 현재 사용자의 활성 구독을 조회합니다. 활성 구독이 없으면 FREE 상태를 반환합니다.
         */
        get: operations["GetMySubscription"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Subscription
         * @description 현재 사용자의 활성 구독 정보를 조회합니다.
         */
        get: operations["GetUserSubscription"];
        put?: never;
        /**
         * Create Subscription
         * @description 새로운 구독을 생성하고 결제를 시작합니다.
         */
        post: operations["CreateSubscription"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscription_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * UpdateSubscription
         * @description 구독을 해지하거나 자동 갱신 설정을 변경합니다.
         */
        patch: operations["UpdateSubscription"];
        trace?: never;
    };
    "/v1/users/me/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ListMyPayments
         * @description 현재 사용자의 결제 내역을 조회합니다.
         */
        get: operations["ListMyPayments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscription-plans/{planId}/features": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Plan Features
         * @description 특정 요금제의 포함된 기능 목록을 조회합니다.
         */
        get: operations["GetPlanFeatures"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Subscription Details
         * @description 특정 구독의 상세 정보를 조회합니다.
         */
        get: operations["GetSubscription"];
        /**
         * Update Subscription
         * @description 구독을 수정합니다 (해지 또는 자동갱신 토글).
         */
        put: operations["UpdateSubscription_PUT"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Payments
         * @description 현재 사용자의 결제 이력을 조회합니다.
         */
        get: operations["GetPayments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/counseling-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Counseling Sessions
         * @description 현재 사용자의 모든 상담 세션을 조회합니다.
         */
        get: operations["GetUserSessions"];
        put?: never;
        /**
         * Create Counseling Session
         * @description 새로운 상담 세션을 생성합니다. 자동으로 main branch가 생성됩니다.
         */
        post: operations["CreateCounselingSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/counseling-sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Counseling Session
         * @description 특정 상담 세션의 상세 정보를 조회합니다.
         */
        get: operations["GetCounselingSession"];
        /**
         * Update Counseling Session
         * @description 상담 세션의 제목을 수정합니다.
         */
        put: operations["UpdateCounselingSession"];
        post?: never;
        /**
         * Delete Counseling Session
         * @description 상담 세션을 삭제합니다.
         */
        delete: operations["DeleteCounselingSession"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/counseling-sessions/{sessionId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Messages by Branch
         * @description 특정 branch의 모든 메시지를 시간 순서대로 조회합니다.
         */
        get: operations["GetMessages"];
        put?: never;
        /**
         * Create Message
         * @description 새로운 메시지(사용자 또는 AI)를 생성합니다. 첫 revision이 자동으로 생성됩니다.
         */
        post: operations["CreateMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/counseling-sessions/{sessionId}/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Message
         * @description 특정 메시지의 상세 정보를 조회합니다. (현재 revision과 선택된 generation 포함)
         */
        get: operations["GetMessage"];
        /**
         * Revise Message
         * @description 메시지를 수정합니다. 새로운 revision이 생성되고 활성화됩니다.
         */
        put: operations["ReviseMessage"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description User */
        User: {
            /**
             * Format: uuid
             * @description 유저 고유 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * Format: email
             * @description 로그인 이메일
             * @example user@example.com
             */
            email: string;
            /**
             * @description 유저 표시 이름
             * @example 메타미
             */
            username: string;
            /**
             * @description 유저 권한
             * @example USER
             * @enum {string}
             */
            role: "USER" | "ADMIN" | "B2B_MANAGER";
            /**
             * Format: date
             * @description 생년월일
             * @example 2026-05-10
             */
            birth_date: string;
            /**
             * @description 현재 구독 등급입니다. 읽기 전용 값이며 일반 계정 수정 API로 직접 변경할 수 없습니다.
             * @example FREE
             * @enum {string}
             */
            subscription_tier: "FREE" | "PREMIUM" | "SUPER";
            /**
             * Format: date-time
             * @description 계정 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description UserProfile */
        UserProfile: {
            /**
             * Format: uuid
             * @description 프로필 고유 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            profile_id: string;
            /**
             * Format: uuid
             * @description 유저 고유 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description Day0 온보딩에서 사용자가 작성한 장점
             * @example 문제를 끝까지 파고드는 점
             */
            self_strength: string;
            /**
             * @description Day0 온보딩에서 남에게 자주 듣는 말
             * @example 집중력이 좋다는 말을 자주 들어요
             */
            others_feedback: string;
            /**
             * @description Day0 온보딩에서 사용자가 좋아한다고 생각한 것
             * @example 새로운 기술을 배우는 것
             */
            favorite_thing: string;
            /**
             * @description AI가 생성한 나의 첫 문장
             * @example 나는 복잡한 문제를 구조화할 때 에너지를 얻는 사람입니다
             */
            ai_first_sentence: string;
        };
        /** @description 사용자 설정입니다. ERD USER_SETTINGS에 대응합니다. 푸시 수신 여부, 데일리 질문 알림 시각, 타임존, 마케팅 수신 동의를 포함합니다. */
        NotificationSetting: {
            /**
             * @description 푸시 알림 전체 on/off
             * @example true
             */
            push_enabled: boolean;
            /**
             * @description 데일리 질문 알림 시각입니다. 24시간제 HH:mm 형식입니다.
             * @example 21:00
             */
            daily_question_time: string;
            /**
             * @description recorded_date 판정 기준 타임존입니다. 기본값은 Asia/Seoul 입니다.
             * @default Asia/Seoul
             * @example Asia/Seoul
             */
            timezone: string;
            /**
             * @description 마케팅 정보 수신 동의 여부(선택 동의)입니다.
             * @example false
             */
            marketing_consent: boolean;
        };
        /** @description AccuracyLog */
        AccuracyLog: {
            /**
             * Format: uuid
             * @description 정확도 로그 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            log_id: string;
            /**
             * Format: uuid
             * @description 유저 고유 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 해당 시점의 객관화 정확도 스냅샷
             * @example 42
             */
            accuracy_percent: number;
            /**
             * @description 기록 깊이로 얻은 XP 변화량
             * @example 3.5
             */
            xp_delta: number;
            /**
             * @description 예측 편차 감소 보너스 변화량
             * @example 1.2
             */
            mae_delta: number;
            /**
             * @description 점수 산출 근거
             * @example BOTH
             * @enum {string}
             */
            score_basis: "RECORD_DEPTH" | "MAE_IMPROVE" | "BOTH";
            /**
             * Format: uuid
             * @description 점수 스냅샷의 근거가 된 일일 기록 ID입니다. 기록 기반이 아닐 경우 null입니다.
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id?: string | null;
            /**
             * Format: uuid
             * @description 점수 스냅샷의 근거가 된 메타인지 트리거 ID입니다. 트리거 기반이 아닐 경우 null입니다.
             * @example 11111111-1111-4111-8111-111111111111
             */
            trigger_id?: string | null;
            /**
             * Format: date-time
             * @description 정확도 로그 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description Nickname */
        Nickname: {
            /**
             * Format: uuid
             * @description 별명 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            nickname_id: string;
            /**
             * Format: uuid
             * @description 별명을 받은 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 별명 유형입니다. SELF는 본인 작성, AI는 서버 내부 AI 생성, OTHERS는 타 사용자가 작성한 별명입니다.
             * @example AI
             * @enum {string}
             */
            nickname_type: "SELF" | "AI" | "OTHERS";
            /**
             * Format: uuid
             * @description 도감에서 선택한 칭호의 몬스터 ID (MIRROR_MONSTERS 참조)입니다. 자유 텍스트가 아니라 도감 칭호를 선택합니다.
             * @example 11111111-1111-4111-8111-111111111111
             */
            monster_id: string;
            /**
             * @description 별명을 붙인 이유
             * @example 복잡한 상황에서도 핵심 문제를 먼저 찾기 때문입니다
             */
            reason: string;
            /**
             * Format: uuid
             * @description 별명을 작성한 유저 ID. AI 생성 시 null
             * @example 11111111-1111-4111-8111-111111111111
             */
            created_by?: string | null;
            /**
             * Format: date-time
             * @description 별명 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description 푸시 발송 대상 디바이스 토큰입니다. ERD DEVICE_TOKENS에 대응합니다. */
        DeviceToken: {
            /**
             * Format: uuid
             * @description 디바이스 토큰 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            device_token_id: string;
            /**
             * Format: uuid
             * @description 토큰 소유 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description FCM/APNs 푸시 토큰. 전체에서 유일합니다.
             * @example fcm_dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg
             */
            token: string;
            /**
             * @description 디바이스 플랫폼
             * @example IOS
             * @enum {string}
             */
            platform: "IOS" | "ANDROID" | "WEB";
            /**
             * Format: date-time
             * @description 마지막 사용 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            last_used_at: string;
        };
        /** @description SignUpRequest */
        SignUpRequest: {
            /**
             * Format: email
             * @description 가입할 이메일
             * @example user@example.com
             */
            email: string;
            /**
             * @description 가입할 비밀번호
             * @example SecurePass123!
             */
            password: string;
            /**
             * Format: date
             * @description 생년월일
             * @example 2026-05-10
             */
            birth_date: string;
        };
        /** @description LoginRequest */
        LoginRequest: {
            /**
             * Format: email
             * @description 로그인 이메일
             * @example user@example.com
             */
            email: string;
            /**
             * @description 로그인 비밀번호
             * @example SecurePass123!
             */
            password: string;
        };
        /** @description PasswordResetRequest */
        PasswordResetRequest: {
            /**
             * Format: email
             * @description 비밀번호 재설정 메일을 받을 이메일
             * @example user@example.com
             */
            email: string;
        };
        /** @description PasswordResetConfirmRequest */
        PasswordResetConfirmRequest: {
            /**
             * @description 비밀번호 재설정 토큰
             * @example reset-token-123
             */
            reset_token: string;
            /**
             * @description 새 비밀번호
             * @example NewSecurePass123!
             */
            new_password: string;
        };
        /** @description OnboardingRequest */
        OnboardingRequest: {
            /**
             * @description 사용자가 작성한 자신을 표현하는 한 문장
             * @example 나는 몰입할 때 가장 나다운 사람입니다
             */
            my_one_sentence: string;
            /**
             * @description 내가 생각하는 내 장점
             * @example 새로운 것을 빨리 이해합니다
             */
            self_strength: string;
            /**
             * @description 남에게 자주 듣는 말
             * @example 설명을 잘한다는 말을 들어요
             */
            others_feedback: string;
            /**
             * @description 내가 좋아한다고 생각하는 것
             * @example 프로그래밍과 문제 해결
             */
            favorite_thing: string;
        };
        /** @description 계정 기본 정보를 수정하는 요청입니다. subscription_tier는 결제/관리자 플로우에서만 변경되며, 일반 클라이언트가 PATCH /v1/users/me/account로 직접 변경할 수 없습니다. */
        UpdateAccountRequest: {
            /**
             * Format: email
             * @description 변경할 이메일
             * @example user@example.com
             */
            email?: string;
        };
        /** @description Access Token 재발급 요청입니다. Refresh Token은 Redis에 저장된 값과 비교됩니다. */
        RefreshTokenRequest: {
            /**
             * @description 재발급에 사용할 Refresh Token
             * @example eyJhbGciOiJIUzI1NiJ9.refresh-token
             */
            refresh_token: string;
        };
        /** @description 사용자에게 별명을 부여하는 요청입니다. */
        CreateNicknameRequest: {
            /**
             * @description 클라이언트가 생성할 수 있는 별명 유형입니다. 본인에게 직접 붙이는 별명은 SELF, 다른 사용자가 붙이는 별명은 OTHERS입니다. AI 유형은 서버 내부에서만 생성되며 요청값으로 보낼 수 없습니다.
             * @example OTHERS
             * @enum {string}
             */
            nickname_type: "SELF" | "OTHERS";
            /**
             * @description 도감에서 선택한 칭호 별명 번호
             * @example 봄날의 햇살
             */
            monster_id: string;
            /**
             * @description 별명을 붙인 이유입니다.
             * @example 조용하지만 주변 사람에게 따뜻한 에너지를 주기 때문입니다.
             */
            reason: string;
        };
        /** @description 디바이스 토큰 등록 요청입니다. */
        RegisterDeviceTokenRequest: {
            /**
             * @description FCM/APNs 푸시 토큰
             * @example fcm_dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg
             */
            token: string;
            /**
             * @description 디바이스 플랫폼
             * @example IOS
             * @enum {string}
             */
            platform: "IOS" | "ANDROID" | "WEB";
        };
        /** @description AuthResponse */
        AuthResponse: {
            /**
             * @description API 인증용 Access Token
             * @example access-token-value
             */
            access_token: string;
            /**
             * @description Access Token 재발급용 Refresh Token
             * @example refresh-token-value
             */
            refresh_token: string;
            /**
             * Format: uuid
             * @description 로그인한 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 로그인한 유저 권한
             * @example USER
             * @enum {string}
             */
            role: "USER" | "ADMIN" | "B2B_MANAGER";
        };
        /** @description UserProfileResponse */
        UserProfileResponse: {
            /** @description 유저 계정 정보 */
            user: components["schemas"]["User"];
            /** @description 유저 온보딩 프로필 */
            profile: components["schemas"]["UserProfile"];
            /** @description 최신 객관화 정확도 로그 */
            latest_accuracy: components["schemas"]["AccuracyLog"];
        };
        /** @description OnboardingResultResponse */
        OnboardingResultResponse: {
            /**
             * @description 초기 객관화 정확도
             * @example 12
             */
            accuracy_percent: number;
            /**
             * @description AI가 생성한 나의 첫 문장입니다. ERD의 USER_PROFILES.ai_first_sentence와 동일한 의미입니다.
             * @example 나는 문제를 구조화하며 성장하는 사람입니다
             */
            ai_first_sentence: string;
        };
        /** @description AccountResponse */
        AccountResponse: {
            /** @description 계정 정보 */
            user: components["schemas"]["User"];
        };
        /** @description TermsResponse */
        TermsResponse: {
            /**
             * @description 개인정보 처리방침 URL
             * @example https://cdn.metame.example.com/image.png
             */
            privacy_policy_url: string;
            /**
             * @description 서비스 이용약관 URL
             * @example https://cdn.metame.example.com/image.png
             */
            terms_url: string;
            /**
             * @description 약관 버전
             * @example 2026.05.10
             */
            version: string;
        };
        /** @description 별명 단건 응답입니다. */
        NicknameResponse: {
            /** @description nickname */
            nickname: components["schemas"]["Nickname"];
        };
        /** @description 별명 목록 응답입니다. */
        NicknameListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 별명 목록
             * @example []
             */
            nicknames: components["schemas"]["Nickname"][];
        };
        /** @description 현재 자기 이해 정확도와 최근 변화량 응답입니다. */
        CurrentAccuracyResponse: {
            /**
             * @description 현재 객관화 정확도 퍼센트
             * @example 37
             */
            accuracy_percent: number;
            /** @description 가장 최근 정확도 로그 */
            latest_log: components["schemas"]["AccuracyLog"];
        };
        /** @description 디바이스 토큰 단건 응답입니다. */
        DeviceTokenResponse: {
            /** @description device_token */
            device_token: components["schemas"]["DeviceToken"];
        };
        /** @description Report */
        Report: {
            /**
             * Format: uuid
             * @description 리포트 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            report_id: string;
            /**
             * Format: uuid
             * @description 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 리포트 유형
             * @example WEEK
             * @enum {string}
             */
            report_type: "WEEKLY" | "MONTHLY" | "LIFETIME";
            /**
             * @description 리포트 구조화 내용 JSON
             * @example {"strengths":["problem_solving"],"growth_index":12}
             */
            content: {
                [key: string]: unknown;
            };
            /**
             * Format: date
             * @description 집계 기간 시작일
             */
            period_start: string;
            /**
             * Format: date
             * @description 집계 기간 종료일
             */
            period_end: string;
            /**
             * Format: date-time
             * @description 리포트 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description Quest */
        Quest: {
            /**
             * Format: uuid
             * @description 나다움 퀘스트 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            quest_id: string;
            /**
             * @description 퀘스트 제목
             * @example 새로운 활동 30분 시도하기
             */
            title: string;
            /**
             * @description 퀘스트 설명
             * @example 최근 긍정 감정이 높았던 활동과 비슷한 경험을 시도합니다
             */
            description: string;
            /**
             * @description 데이터 기반 추천 근거
             * @example 혼자 창작할 때 긍정 어휘가 증가했습니다
             */
            recommendation_reason: string;
            /**
             * @description 퀘스트 상태
             * @example RECOMMENDED
             * @enum {string}
             */
            status: "RECOMMENDED" | "IN_PROGRESS" | "COMPLETED";
        };
        /** @description BrainStructure */
        BrainStructure: {
            /**
             * Format: uuid
             * @description 뇌구조 결과 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            brain_structure_id: string;
            /**
             * Format: uuid
             * @description 연결된 리포트 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            report_id: string;
            /**
             * @description 생성된 뇌구조 이미지 URL
             * @example https://cdn.metame.app/brain-structures/weekly-2026-05-04.png
             */
            image_url: string;
            /**
             * @description 뇌구조에 배치된 키워드 목록
             * @example [
             *       "프로젝트",
             *       "휴식",
             *       "인정"
             *     ]
             */
            keywords: string[];
            /**
             * Format: date-time
             * @description 뇌구조 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description GenerateReportRequest */
        GenerateReportRequest: {
            /**
             * @description 생성할 리포트 유형입니다. WEEK, MONTH, MY_REPORT는 ERD의 REPORTS.report_type과 대응합니다. OBJECTIVE_FEEDBACK은 객관화 미러 기반 피드백 리포트를 생성하기 위해 API 명세 v8 이후 추가된 확장 타입이며, DB 저장 시 REPORTS.content에 구조화해 저장합니다.
             * @example WEEKLY
             * @enum {string}
             */
            report_type: "WEEKLY" | "MONTHLY" | "LIFETIME";
            /**
             * Format: date
             * @description 분석 시작일
             * @example 2026-05-10
             */
            period_start: string;
            /**
             * Format: date
             * @description 분석 종료일
             * @example 2026-05-10
             */
            period_end: string;
        };
        /** @description CreateQuestCompletionRequest */
        CreateQuestCompletionRequest: {
            /**
             * @description 퀘스트 수행 후 회고
             * @example 생각보다 혼자 정리하는 시간이 잘 맞았습니다
             */
            completion_note: string;
            /**
             * @description 수행 만족도 점수 0~100 사이의 수행 만족도 점수입니다.
             * @example 85
             */
            satisfaction_score: number;
        };
        /** @description 주간 뇌구조 생성을 위한 요청입니다. target_week_start를 생략하면 서버 현재 시각 기준 이번 주 월요일을 사용합니다. */
        GenerateWeeklyBrainStructureRequest: {
            /**
             * Format: date
             * @description 생성할 주의 시작일입니다. YYYY-MM-DD 형식이며 월요일 날짜를 권장합니다. 생략하면 서버 현재 시각 기준 이번 주 월요일을 사용합니다.
             * @example 2026-05-04
             */
            target_week_start?: string;
        };
        /** @description ReportResponse */
        ReportResponse: {
            /** @description 리포트 */
            report: components["schemas"]["Report"];
        };
        /** @description ReportListResponse */
        ReportListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 리포트 목록
             * @example []
             */
            reports: components["schemas"]["Report"][];
        };
        /** @description QuestListResponse */
        QuestListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 추천 퀘스트 목록
             * @example []
             */
            quests: components["schemas"]["Quest"][];
        };
        /** @description QuestResponse */
        QuestResponse: {
            /** @description 퀘스트 상세 */
            quest: components["schemas"]["Quest"];
        };
        /** @description BrainStructureResponse */
        BrainStructureResponse: {
            /** @description 생성된 뇌구조 결과 */
            brain_structure: components["schemas"]["BrainStructure"];
        };
        /** @description ShareLinkResponse */
        ShareLinkResponse: {
            /**
             * @description SNS 공유용 링크
             * @example https://cdn.metame.example.com/image.png
             */
            share_url: string;
        };
        /** @description DailyRecord */
        DailyRecord: {
            /**
             * Format: uuid
             * @description 일일 기록 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * Format: uuid
             * @description 작성자 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * Format: date-time
             * @description 기록 시각입니다.
             * @example 2026-05-10T21:30:00+09:00
             */
            recorded_at: string;
            /**
             * Format: date
             * @description 기록 날짜입니다. 유저별 하루 1건 원칙의 기준값이며 timezone 설정에 따라 판정됩니다. UNIQUE(user_id, recorded_date).
             * @example 2026-05-10
             */
            recorded_date: string;
            /**
             * Format: date-time
             * @description 레코드 생성 일시(감사용)입니다.
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at?: string;
        };
        /** @description DailyQuestion */
        DailyQuestion: {
            /**
             * Format: uuid
             * @description 질문 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            question_id: string;
            /**
             * Format: uuid
             * @description 소속 일일 기록 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * @description 질문 생성 축
             * @example DISCOVERY_CONTEXT
             * @enum {string}
             */
            question_type: "TIME_CONTEXT" | "GROWTH_CONTEXT" | "DISCOVERY_CONTEXT";
            /**
             * @description AI가 생성한 오늘의 질문 본문
             * @example 오늘 가장 나답다고 느낀 순간은 언제였나요?
             */
            question_text: string;
            /**
             * @description 사용자 자유 서술 답변
             * @example 프로젝트 구조를 정리할 때 몰입했습니다
             */
            user_answer: string;
            /**
             * @description 감정 스냅샷 태그
             * @example 몰입
             */
            emotion_tag: string;
            /**
             * @description 오늘 가장 선명하게 기억나는 장면
             * @example 친구와 API 구조를 논의하던 장면
             */
            scene_description: string;
            /**
             * @description 나다움 발견 여부
             * @example true
             */
            is_myself_moment: boolean;
            /**
             * @description 나다움 발견 상세 서술
             * @example 복잡한 개념을 설명할 때 나답다고 느꼈습니다
             */
            myself_moment_desc: string;
            /**
             * @description 기록 깊이 점수 1=태그만 입력, 2=단답, 3=서술, 4=사고 과정 포함입니다.
             * @example 4
             */
            depth_score: number;
        };
        /** @description TailQuestion */
        TailQuestion: {
            /**
             * Format: uuid
             * @description 꼬리 질문 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            tail_id: string;
            /**
             * Format: uuid
             * @description 원본 질문 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            parent_question_id: string;
            /**
             * @description AI가 생성한 꼬리 질문
             * @example 왜 그 순간이 나답다고 느껴졌나요?
             */
            question_text: string;
            /**
             * @description 꼬리 질문에 대한 사용자 답변입니다. 생성 직후에는 null이며, PATCH로 답변 제출 후 문자열 값이 저장됩니다.
             * @example null
             */
            user_answer: string | null;
            /**
             * Format: date-time
             * @description 꼬리 질문 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description MetacogTrigger */
        MetacogTrigger: {
            /**
             * Format: uuid
             * @description 메타인지 트리거 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            trigger_id: string;
            /**
             * Format: uuid
             * @description 소속 일일 기록 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * @description 트리거 적용 영역
             * @example STUDY
             * @enum {string}
             */
            domain: "STUDY" | "WORK" | "HOBBY" | "RELATION";
            /**
             * @description 트리거 진행 상태입니다. 생성 시 PREDICTED, 사후 결과 입력 시 COMPLETED, 취소 시 CANCELED 입니다.
             * @example PREDICTED
             * @enum {string}
             */
            status: "PREDICTED" | "COMPLETED" | "CANCELED";
            /**
             * @description 사전 예상 점수 또는 이해도
             * @example 80
             */
            predicted_score: number;
            /**
             * @description 사전 예상 소요 시간 0~1440분 범위로 입력합니다.
             * @example 60
             */
            predicted_time_min: number;
            /**
             * @description 사전 예상 만족도 또는 에너지
             * @example 70
             */
            predicted_satisfaction: number;
            /**
             * @description 사후 실제 점수 또는 이해도 사후 입력 전에는 null 입니다.
             * @example 65
             */
            actual_score?: number | null;
            /**
             * @description 사후 실제 소요 시간 0~1440분 범위로 입력합니다. 사후 입력 전에는 null 입니다.
             * @example 95
             */
            actual_time_min?: number | null;
            /**
             * @description 사후 실제 만족도 또는 에너지 사후 입력 전에는 null 입니다.
             * @example 50
             */
            actual_satisfaction?: number | null;
            /**
             * @description 점수 예측 편차 절댓값입니다. actual 값 입력 전에는 null 입니다.
             * @example 15
             */
            mae_score?: number | null;
            /**
             * @description 시간 예측 편차 절댓값입니다. actual 값 입력 전에는 null 입니다.
             * @example 35
             */
            mae_time?: number | null;
            /**
             * @description 만족도 예측 편차 절댓값입니다. actual 값 입력 전에는 null 입니다.
             * @example 20
             */
            mae_satisfaction?: number | null;
            /**
             * Format: date-time
             * @description 트리거 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description MetacogBetting */
        MetacogBetting: {
            /**
             * Format: uuid
             * @description 메타인지 베팅 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            betting_id: string;
            /**
             * Format: uuid
             * @description 연결된 메타인지 트리거 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            trigger_id: string;
            /**
             * @description 예측에 베팅한 가상 코인 수량 최소 1코인부터 최대 100000코인까지 베팅할 수 있습니다.
             * @example 10
             */
            betting_coin: number;
            /**
             * @description AI가 판단한 예측과 실제의 오차율
             * @example 12.5
             */
            error_margin: number;
            /**
             * @description 오차 범위 초과로 베팅 실패 여부
             * @example true
             */
            is_bankrupt: boolean;
            /**
             * @description 정산 후 지급 코인 성공 시 베팅 코인의 최대 2배까지 지급됩니다.
             * @example 0
             */
            reward_coin: number;
            /**
             * Format: date-time
             * @description 베팅 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description 데일리 질문에 대한 답변과 오늘의 감정/장면/나다움 순간을 제출하는 요청입니다. answer_type=TEXT이면 user_answer를, answer_type=TAGS이면 user_answer_tags를 함께 보내야 합니다. is_myself_moment=true이면 myself_moment_desc가 조건부 필수입니다. */
        SubmitDailyRecordRequest: {
            /**
             * @description 답변 입력 방식
             * @example TEXT
             * @enum {string}
             */
            answer_type: "TEXT" | "TAGS";
            /**
             * @description 사용자 답변 본문
             * @example 오늘은 새로운 API 구조를 설계했습니다
             */
            user_answer?: string;
            /**
             * @description 사용자가 선택한 객관식 태그 목록
             * @example ["몰입", "성취"]
             */
            user_answer_tags?: string[];
            /**
             * @description 현재 감정 한 단어
             * @example 성취감
             */
            emotion_tag: string;
            /**
             * @description 가장 선명하게 기억나는 장면
             * @example ERD를 보며 aggregate를 나누던 순간
             */
            scene_description: string;
            /**
             * @description 나다움 발견 여부
             * @example true
             */
            is_myself_moment: boolean;
            /**
             * @description 나다움 발견 상세 서술입니다. is_myself_moment=true일 때 조건부 필수입니다.
             * @example 구조를 깔끔하게 만들 때 나답다고 느꼈습니다
             */
            myself_moment_desc?: string;
        };
        /** @description UpdateTailAnswerRequest */
        UpdateTailAnswerRequest: {
            /**
             * @description 꼬리 질문에 대한 최종 답변
             * @example 그 선택이 내가 중요하게 생각하는 기준과 맞았기 때문입니다
             */
            user_answer: string;
        };
        /** @description 메타인지 트리거를 생성하기 위한 사전 예측 요청입니다. 예측 대상의 구체 내용은 연결된 daily record의 장면/답변 문맥으로 판단하며, 별도 target_task 필드는 저장하지 않습니다. */
        CreateTriggerRequest: {
            /**
             * Format: uuid
             * @description 연결할 일일 기록 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * @description 트리거 적용 영역
             * @example STUDY
             * @enum {string}
             */
            domain: "STUDY" | "WORK" | "HOBBY" | "RELATION";
            /**
             * @description 예상 점수 또는 이해도
             * @example 85
             */
            predicted_score: number;
            /**
             * @description 예상 소요 시간 0~1440분 범위로 입력합니다.
             * @example 40
             */
            predicted_time_min: number;
            /**
             * @description 예상 만족도 또는 에너지
             * @example 75
             */
            predicted_satisfaction: number;
        };
        /** @description CreateBettingRequest */
        CreateBettingRequest: {
            /**
             * Format: uuid
             * @description 베팅할 메타인지 트리거 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            trigger_id: string;
            /**
             * @description 베팅할 코인 수량 최소 1코인부터 최대 100000코인까지 베팅할 수 있습니다.
             * @example 10
             */
            betting_coin: number;
        };
        /** @description 사후 실제 결과 입력 요청 */
        SubmitActualResultRequest: {
            /**
             * @description 실제 점수 또는 이해도
             * @example 70
             */
            actual_score: number;
            /**
             * @description 실제 소요 시간 0~1440분 범위로 입력합니다.
             * @example 65
             */
            actual_time_min: number;
            /**
             * @description 실제 만족도 또는 에너지
             * @example 60
             */
            actual_satisfaction: number;
        };
        /** @description DailyQuestionResponse */
        DailyQuestionResponse: {
            /** @description 오늘의 AI 질문 */
            question: components["schemas"]["DailyQuestion"];
        };
        /** @description DailyRecordResponse */
        DailyRecordResponse: {
            /** @description 일일 기록 기본 정보 */
            record: components["schemas"]["DailyRecord"];
            /**
             * @description 기록에 포함된 질문 목록
             * @example []
             */
            questions: components["schemas"]["DailyQuestion"][];
            /**
             * @description 기록에 포함된 메타인지 트리거 목록
             * @example []
             */
            triggers: components["schemas"]["MetacogTrigger"][];
        };
        /** @description DailyRecordListResponse */
        DailyRecordListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 일일 기록 목록
             * @example []
             */
            records: components["schemas"]["DailyRecord"][];
        };
        /** @description TailQuestionResponse */
        TailQuestionResponse: {
            /** @description 생성된 꼬리 질문 */
            tail_question: components["schemas"]["TailQuestion"];
        };
        /** @description TriggerAnalysisResponse */
        TriggerAnalysisResponse: {
            /** @description 메타인지 트리거 */
            trigger: components["schemas"]["MetacogTrigger"];
            /**
             * @description 예측과 실제 차이에 대한 AI 분석
             * @example 예상 시간보다 실제 시간이 반복적으로 길어지는 패턴이 있습니다
             */
            insight: string;
        };
        /** @description BettingResponse */
        BettingResponse: {
            /** @description 메타인지 베팅 결과 */
            betting: components["schemas"]["MetacogBetting"];
        };
        /** @description MonsterListResponse */
        MonsterListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 전체 몬스터 수
             * @example 24
             */
            total_count: number;
            /**
             * @description 몬스터 도감 목록
             * @example []
             */
            monsters: components["schemas"]["MirrorMonster"][];
        };
        /** @description ObjectiveMirror */
        ObjectiveMirror: {
            /**
             * Format: uuid
             * @description 객관화 미러 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            mirror_id: string;
            /**
             * Format: uuid
             * @description 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * Format: uuid
             * @description 원본 기록 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * @description 사용자의 원본 감정적 기록
             * @example 팀원이 아무것도 안 해서 너무 짜증났다
             */
            original_emotion: string;
            /**
             * @description AI가 변환한 3인칭 관찰자 문장
             * @example 팀 프로젝트에서 업무 분담 불균형으로 피로감을 경험했습니다
             */
            objective_fact: string;
            /**
             * Format: date-time
             * @description 객관화 결과 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description MonsterDetection */
        MonsterDetection: {
            /**
             * Format: uuid
             * @description 몬스터 감지 로그 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            monster_detection_id: string;
            /**
             * Format: uuid
             * @description 몬스터가 감지된 객관화 미러 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            mirror_id: string;
            /**
             * Format: uuid
             * @description 감지된 몬스터 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            monster_id: string;
            /** @description 이 미러에서 해당 몬스터가 감지된 개수 */
            detected_monster_count: number;
            /** @description 표시용 마스터 도감 정보(이름·아이콘·카테고리·stage_titles 등) */
            monster: components["schemas"]["MirrorMonster"];
        };
        /** @description CreateObjectiveMirrorRequest */
        CreateObjectiveMirrorRequest: {
            /**
             * Format: uuid
             * @description 객관화할 일일 기록 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            record_id: string;
            /**
             * @description 사용자의 감정적 원문
             * @example 오늘 공부했는데 하나도 머릿속에 안 들어온다
             */
            original_emotion: string;
        };
        /** @description ObjectiveMirrorResponse */
        ObjectiveMirrorResponse: {
            /** @description 객관화 미러 결과 */
            mirror: components["schemas"]["ObjectiveMirror"];
            /**
             * @description 이번 객관화에서 해금된 몬스터 목록
             * @example []
             */
            unlocked_monsters: components["schemas"]["MonsterDetection"][];
        };
        /** @description ObjectiveMirrorListResponse */
        ObjectiveMirrorListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 객관화 미러 히스토리
             * @example []
             */
            mirrors: components["schemas"]["ObjectiveMirror"][];
        };
        /** @description AiCounselingMessage */
        AiCounselingMessage: {
            /**
             * Format: uuid
             * @description 상담 메시지 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            message_id: string;
            /**
             * Format: uuid
             * @description 상담 세션 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            session_id: string;
            /**
             * @description 메시지 발신자 유형입니다. USER는 사용자가 보낸 메시지, AI는 AI가 생성한 응답입니다.
             * @example USER
             * @enum {string}
             */
            sender_type: "USER" | "AI";
            /**
             * @description 상담 메시지 내용입니다. USER 메시지는 요청 원문을 그대로 저장하고, AI 메시지는 누적 기록 컨텍스트를 반영한 응답입니다.
             * @example 요즘 내가 이 방향이 맞는지 모르겠어
             */
            content: string;
            /**
             * Format: date-time
             * @description 메시지 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description Notification */
        Notification: {
            /**
             * Format: uuid
             * @description 알림 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            notification_id: string;
            /**
             * Format: uuid
             * @description 수신 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 알림 제목
             * @example 오늘의 질문이 도착했어요
             */
            title: string;
            /**
             * @description 알림 본문
             * @example 3분만 기록하고 나를 더 알아가보세요
             */
            body: string;
            /**
             * Format: date-time
             * @description 알림 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description AI 상담 세션입니다. 세션 생성 시 서버는 사용자의 누적 기록, 메타인지 패턴, 최근 감정 흐름을 내부 컨텍스트로 조립합니다. */
        AiCounselingSession: {
            /**
             * Format: uuid
             * @description 상담 세션 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            session_id: string;
            /**
             * @description 상담 세션 제목. 첫 메시지 또는 사용자가 지정한 제목에서 생성됩니다.
             * @example 공부 방향 상담
             */
            title: string;
            /**
             * Format: date-time
             * @description 세션 생성 일시
             * @example 2026-05-10T09:00:00+09:00
             */
            created_at: string;
        };
        /** @description AI 상담 메시지를 전송하는 요청입니다. 세션은 POST /v1/ai-counseling/sessions로 먼저 생성하며, session_id는 현재 사용자 소유 세션이어야 합니다. */
        AiCounselingRequest: {
            /**
             * Format: uuid
             * @description 기존 상담 세션 ID. POST /v1/ai-counseling/sessions로 생성한 현재 사용자 소유 세션이어야 합니다.
             * @example 11111111-1111-4111-8111-111111111111
             */
            session_id: string | null;
            /**
             * @description 사용자가 입력한 상담 메시지
             * @example 요즘 공부 방향이 맞는지 모르겠어
             */
            message: string;
        };
        /** @description SendNotificationRequest */
        SendNotificationRequest: {
            /**
             * Format: uuid
             * @description 알림 수신 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * @description 알림 제목
             * @example 주간 리포트가 생성됐어요
             */
            title: string;
            /**
             * @description 알림 본문
             * @example 이번 주 패턴을 확인해보세요
             */
            body: string;
        };
        /** @description AdminCrisisSearchRequest */
        AdminCrisisSearchRequest: {
            /**
             * Format: date
             * @description 검색 시작일
             * @example 2026-05-10
             */
            start_date: string;
            /**
             * Format: date
             * @description 검색 종료일
             * @example 2026-05-10
             */
            end_date: string;
            /**
             * @description 위기 키워드 필터
             * @example 자해
             */
            keyword_filter: string;
            /**
             * @description 조회 페이지
             * @example 1
             */
            page: number;
            /**
             * @description 페이지 크기
             * @example 20
             */
            size: number;
        };
        /** @description AI 상담 세션을 시작하는 요청입니다. 첫 메시지를 보내기 전 이 API를 호출해 개인화 컨텍스트가 조립된 세션을 생성합니다. */
        CreateAiCounselingSessionRequest: {
            /**
             * @description 선택 입력 세션 제목입니다. 비우면 서버가 첫 메시지 기반으로 자동 생성할 수 있습니다.
             * @example 공부 방향 상담
             */
            title?: string;
        };
        CreateCrisisActionRequest: {
            /**
             * @description 기록할 액션 타입
             * @enum {string}
             */
            action_type: "POPUP_SHOWN" | "HOTLINE_SHOWN" | "AI_BLOCKED" | "SAFE_RESPONSE";
        };
        /** @description AiCounselingResponse */
        AiCounselingResponse: {
            /** @description 사용자 상담 메시지 */
            user_message: components["schemas"]["AiCounselingMessage"];
            /** @description AI 상담 응답 */
            ai_message: components["schemas"]["AiCounselingMessage"];
        };
        /** @description AiCounselingHistoryResponse */
        AiCounselingHistoryResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 상담 메시지 히스토리
             * @example []
             */
            messages: components["schemas"]["AiCounselingMessage"][];
        };
        CrisisLogListResponse: {
            logs: components["schemas"]["CrisisLog"][];
            /** @description 전체 로그 수 */
            total_count: number;
        };
        /** @description AdminStatsResponse */
        AdminStatsResponse: {
            /**
             * @description 전체 사용자 수
             * @example 500
             */
            total_users: number;
            /**
             * @description 일간 활성 사용자 수
             * @example 120
             */
            daily_active_users: number;
            /**
             * @description 누적 기록 수
             * @example 4200
             */
            records_count: number;
        };
        /** @description B2BReportResponse */
        B2BReportResponse: {
            /**
             * Format: uuid
             * @description 기관 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            organization_id: string;
            /**
             * @description 기관별 익명화 집계 리포트
             * @example {"average_growth_index":17}
             */
            anonymous_report: {
                [key: string]: unknown;
            };
        };
        /** @description AI 상담 세션 생성 응답입니다. */
        AiCounselingSessionResponse: {
            /** @description 생성된 상담 세션 */
            session: components["schemas"]["AiCounselingSession"];
        };
        CrisisLogDetailResponse: {
            log: components["schemas"]["CrisisLog"];
            /** @description 취해진 액션들 */
            actions: components["schemas"]["CrisisAction"][];
        };
        CrisisActionsResponse: {
            actions: components["schemas"]["CrisisAction"][];
        };
        /** @description 위기 감지 로그 */
        CrisisLog: {
            /**
             * Format: uuid
             * @description 로그 고유 ID
             */
            log_id: string;
            /**
             * Format: uuid
             * @description 감지된 사용자 ID
             */
            user_id: string;
            /**
             * Format: uuid
             * @description 상담 메시지 ID (상담 중 감지 시)
             */
            counseling_message_id?: string | null;
            /** @description 감지된 위기 키워드 (예: 자살, 자해) */
            detected_keyword: string;
            /**
             * @description 감지 단계 (입력 또는 출력)
             * @enum {string}
             */
            filter_stage: "INPUT" | "OUTPUT";
            /**
             * Format: date-time
             * @description 감지 시각
             */
            created_at: string;
        };
        /** @description 위기 로그에 대해 취한 액션 */
        CrisisAction: {
            /**
             * Format: uuid
             * @description 액션 고유 ID
             */
            crisis_action_id: string;
            /**
             * Format: uuid
             * @description 위기 로그 ID
             */
            log_id: string;
            /**
             * @description 취해진 액션 타입
             * @enum {string}
             */
            action_type: "POPUP_SHOWN" | "HOTLINE_SHOWN" | "AI_BLOCKED" | "SAFE_RESPONSE";
            /**
             * Format: date-time
             * @description 액션 기록 시각
             */
            created_at: string;
        };
        /** @description 사용자가 획득한 몬스터 도감 항목입니다. USER_MONSTERS(유저별 누적)와 표시용 마스터 정보(MIRROR_MONSTERS)를 함께 노출합니다. */
        UserMonster: {
            /**
             * Format: uuid
             * @description 유저 몬스터 획득 항목 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_monster_id: string;
            /**
             * Format: uuid
             * @description 몬스터를 획득한 유저 ID
             * @example 11111111-1111-4111-8111-111111111111
             */
            user_id: string;
            /**
             * Format: uuid
             * @description 획득한 몬스터 ID (MIRROR_MONSTERS 참조)
             * @example 11111111-1111-4111-8111-111111111111
             */
            monster_id: string;
            /**
             * @description 이 몬스터 누적 획득 개수
             * @example 37
             */
            monster_count: number;
            /**
             * @description 개수 기반 칭호 단계. 0-9=1, 10-99=2, 100-999=3, 1000+=4
             * @example 2
             */
            title_stage: number;
            /**
             * @description 최종 희귀도 = base_rarity_score + (title_stage-1) 를 등급화한 값
             * @example RARE
             * @enum {string|null}
             */
            effective_rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHICAL" | "DIVINE" | null;
            /**
             * @description 현재 단계의 칭호명. MIRROR_MONSTERS.stage_titles[title_stage-1]. 미설정 시 null
             * @example 관찰 견습생
             */
            current_title?: string | null;
            /** @description 표시용 마스터 도감 정보(이름·아이콘·카테고리·stage_titles 등) */
            monster: components["schemas"]["MirrorMonster"];
        };
        /** @description 내 도감 컬렉션 목록 응답입니다. */
        UserMonsterListResponse: {
            /** @description 페이지 정보 */
            page_info: components["schemas"]["PageInfo"];
            /**
             * @description 보유한 몬스터 종류 수
             * @example 12
             */
            total_count: number;
            /**
             * @description 획득한 몬스터 목록
             * @example []
             */
            monsters: components["schemas"]["UserMonster"][];
        };
        /** @description PageInfo */
        PageInfo: {
            /**
             * @description 현재 페이지 번호
             * @example 1
             */
            current_page: number;
            /**
             * @description 전체 페이지 수
             * @example 10
             */
            total_pages: number;
            /**
             * @description 전체 데이터 개수
             * @example 145
             */
            total_elements: number;
            /**
             * @description 페이지 크기
             * @example 20
             */
            size: number;
        };
        /**
         * @description 서비스 전역 애플리케이션 에러 코드입니다. 프론트엔드는 이 값을 기준으로 에러 분기 처리를 합니다.
         * @enum {string}
         */
        ErrorCode: "INVALID_REQUEST" | "VALIDATION_FAILED" | "UNAUTHORIZED" | "FORBIDDEN" | "RESOURCE_NOT_FOUND" | "INTERNAL_SERVER_ERROR" | "AUTH_EMAIL_ALREADY_EXISTS" | "AUTH_INVALID_CREDENTIALS" | "AUTH_REFRESH_TOKEN_INVALID" | "AUTH_PASSWORD_RESET_TOKEN_INVALID" | "USER_NOT_FOUND" | "USER_BIRTH_DATE_REQUIRED" | "ONBOARDING_ALREADY_SUBMITTED" | "ONBOARDING_NOT_FOUND" | "DIARY_RECORD_ALREADY_EXISTS" | "DIARY_RECORD_NOT_FOUND" | "DAILY_QUESTION_NOT_FOUND" | "TAIL_QUESTION_NOT_FOUND" | "METACOG_TRIGGER_NOT_FOUND" | "METACOG_BETTING_NOT_FOUND" | "OBJECTIVE_MIRROR_NOT_FOUND" | "MIRROR_MONSTER_NOT_FOUND" | "REPORT_NOT_FOUND" | "QUEST_NOT_FOUND" | "AI_COUNSELING_SESSION_NOT_FOUND" | "CRISIS_LOG_NOT_FOUND" | "ADMIN_ORGANIZATION_NOT_FOUND" | "AUTH_PASSWORD_RESET_TOKEN_EXPIRED" | "AI_COUNSELING_SESSION_FORBIDDEN" | "EXTERNAL_LLM_FAILED";
        /** @description MirrorMonster */
        MirrorMonster: {
            /**
             * Format: uuid
             * @description 몬스터 식별자
             * @example 11111111-1111-4111-8111-111111111111
             */
            monster_id: string;
            /**
             * @description 백엔드 enum 식별 코드
             * @example EXTERNAL_BLAME
             */
            monster_code: string;
            /**
             * @description 단계별 칭호 배열입니다. index = 단계-1 로 매핑됩니다. 예: ["1단계명", "2단계명", "3단계명", "4단계명"]
             * @example [
             *       "관찰 견습생",
             *       "관찰가",
             *       "관찰 마스터",
             *       "관찰 대현자"
             *     ]
             */
            stage_titles?: string[] | null;
            /** @description 자각 필요도 */
            awareness_level: number;
            /** @description 능동성 */
            activeness: number;
            /** @description 보편성 */
            universality: number;
            /** @description 성숙도/통합도 */
            maturity: number;
            /** @description 기본 점수 */
            base_rarity_score: number;
            /**
             * @description 몬스터 설명 및 해당 인지 편향 안내
             * @example 상황 원인을 외부 요인에만 돌리는 패턴입니다
             */
            monster_description: string;
            /** @enum {string} */
            category: "COGNITIVE" | "EMOTIONAL" | "BEHAVIORAL" | "RELATIONAL" | "GROWTH" | "SITUATIONAL";
            /**
             * @description 감지 조건 타입
             * @example PATTERN_COUNT
             * @enum {string}
             */
            condition_type: "PATTERN_COUNT" | "PATTERN_SCORE" | "STREAK" | "TOTAL_ACTIVITY";
            /**
             * @description 감지 조건 상세 JSON입니다. 예: tags 배열과 최소 감지 횟수 min_count를 포함합니다.
             * @example {
             *       "tags": [
             *         "EXTERNAL_BLAME"
             *       ],
             *       "min_count": 3
             *     }
             */
            condition_value: {
                [key: string]: unknown;
            };
            /**
             * @description 몬스터 기본 희귀도입니다. 단계 보너스 0을 기준으로 한 등급이며 effective_rarity와 동일한 7단계 enum을 사용합니다.
             * @example COMMON
             * @enum {string}
             */
            base_rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHICAL" | "DIVINE";
            /**
             * @description 몬스터 아이콘 URL
             * @example https://cdn.metame.app/monsters/external_blame.png
             */
            icon_url: string;
        };
        /** @description MessageResponse */
        MessageResponse: {
            /**
             * @description 처리 결과 메시지
             * @example Success
             */
            message: string;
        };
        /** @description ErrorResponse */
        ErrorResponse: {
            /**
             * @description 에러 메시지
             * @example Invalid request
             */
            message: string;
            /**
             * @description 애플리케이션 에러 코드
             * @example INVALID_REQUEST
             */
            code: components["schemas"]["ErrorCode"];
            /**
             * Format: date-time
             * @description 에러 발생 시각
             * @example 2026-05-10T09:00:00+09:00
             */
            timestamp: string;
            /**
             * @description 클라이언트가 사용자에게 안내하거나 내부적으로 처리할 권장 해결 방향입니다.
             * @example 잠시 후 다시 시도해주세요.
             */
            resolution?: string;
        };
        SubscriptionResponse: {
            subscription: components["schemas"]["Subscription"];
        };
        SubscriptionPlanListResponse: {
            plans: components["schemas"]["SubscriptionPlan"][];
        };
        PaymentListResponse: {
            payments: components["schemas"]["Payment"][];
            total_count: number;
        };
        PlanFeaturesResponse: {
            plan: components["schemas"]["SubscriptionPlan"];
            features: components["schemas"]["PlanFeature"][];
        };
        CreateSubscriptionRequest: {
            /**
             * Format: uuid
             * @description 구독할 요금제 ID
             */
            plan_id: string;
            /** @enum {string} */
            payment_method: "CARD" | "KAKAOPAY" | "TOSS" | "NAVERPAY";
            /** @default true */
            auto_renew: boolean;
        };
        UpdateSubscriptionRequest: {
            /** @enum {string} */
            status?: "ACTIVE" | "CANCELED" | "PAUSED";
            auto_renew?: boolean;
        };
        /** @description 구독 요금제 */
        SubscriptionPlan: {
            /** Format: uuid */
            plan_id: string;
            /** @enum {string} */
            plan_code: "FREE" | "PREMIUM" | "SUPER";
            name: string;
            /** @description 월 가격 (원 단위) */
            price: number;
            is_active: boolean;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
        };
        /** @description 사용자 구독 정보 */
        Subscription: {
            /** Format: uuid */
            subscription_id: string;
            /** Format: uuid */
            user_id: string;
            plan: components["schemas"]["SubscriptionPlan"];
            /** @enum {string} */
            status: "ACTIVE" | "CANCELED" | "EXPIRED" | "PAUSED";
            /** Format: date-time */
            started_at: string;
            /** Format: date-time */
            expires_at?: string;
            auto_renew?: boolean;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
        };
        /** @description 결제 기록 */
        Payment: {
            /** Format: uuid */
            payment_id: string;
            /** Format: uuid */
            subscription_id: string;
            /** @description 결제 금액 (원) */
            amount: number;
            /** @default KRW */
            currency: string;
            /** @enum {string} */
            payment_method?: "CARD" | "KAKAOPAY" | "TOSS" | "NAVERPAY";
            /** @description PG사 (결제게이트웨이사) */
            pg_provider?: string;
            /** @description PG 거래 고유 ID */
            pg_transaction_id?: string;
            /** @enum {string} */
            status: "PAID" | "FAILED" | "REFUNDED" | "PENDING";
            /** Format: date-time */
            paid_at?: string | null;
            /** Format: date-time */
            created_at: string;
        };
        /** @description 구독 기능 */
        Feature: {
            /**
             * Format: uuid
             * @description 기능 고유 ID
             */
            feature_id: string;
            /**
             * @description 기능 코드
             * @enum {string}
             */
            feature_code: "AI_QUESTION" | "REPORT" | "AI_COUNSELING" | "BRAIN_STRUCTURE" | "QUEST";
            /** @description 기능명 */
            name: string;
        };
        /** @description 요금제별 기능 설정 */
        PlanFeature: {
            /**
             * Format: uuid
             * @description 계획-기능 조합 고유 ID
             */
            plan_feature_id: string;
            feature: components["schemas"]["Feature"];
            /** @description 기능 활성화 여부 */
            enabled: boolean;
            /** @description 사용 제한 (null = 무제한) */
            usage_limit?: number | null;
            /**
             * @description 사용량 초기화 주기
             * @enum {string|null}
             */
            reset_period?: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE" | null;
        };
        CreateSessionRequest: {
            /**
             * @description 세션 제목
             * @example 진로 고민
             */
            title: string;
        };
        UpdateSessionRequest: {
            /** @description 변경할 세션 제목 */
            title: string;
        };
        CreateMessageRequest: {
            /**
             * Format: uuid
             * @description 메시지를 생성할 branch ID
             */
            branch_id: string;
            /**
             * @description 메시지 역할
             * @enum {string}
             */
            role: "USER" | "ASSISTANT";
            /** @description 메시지 내용 */
            content: string;
        };
        ReviseMessageRequest: {
            /** @description 변경할 메시지 내용 */
            content: string;
        };
        CreateSessionResponse: {
            /**
             * Format: uuid
             * @description 생성된 세션 ID
             */
            session_id: string;
            /** @description 세션 제목 */
            title: string;
        };
        SessionListResponse: {
            sessions?: {
                /** Format: uuid */
                session_id?: string;
                title?: string;
                /** Format: date-time */
                updated_at?: string;
            }[];
        };
        SessionDetailResponse: {
            /** Format: uuid */
            session_id?: string;
            /** Format: uuid */
            user_id?: string;
            title?: string;
            /** Format: uuid */
            active_branch_id?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
        };
        CreateMessageResponse: {
            /** Format: uuid */
            message_id?: string;
            role?: string;
        };
        MessageListResponse: {
            messages?: {
                /** Format: uuid */
                message_id?: string;
                role?: string;
                user_content?: string | null;
                assistant_content?: string | null;
                /** Format: date-time */
                created_at?: string;
            }[];
        };
        MessageDetailResponse: {
            /** Format: uuid */
            message_id?: string;
            role?: string;
            user_content?: string | null;
            assistant_content?: string | null;
            /** Format: date-time */
            created_at?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    Login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "user@example.com",
                 *       "password": "SecurePass123!"
                 *     }
                 */
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "access_token": "access-token-value",
                     *       "refresh_token": "refresh-token-value",
                     *       "user_id": "11111111-1111-4111-8111-111111111111",
                     *       "role": "USER"
                     *     }
                     */
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "이메일 또는 비밀번호가 일치하지 않습니다.",
                     *       "code": "AUTH_INVALID_CREDENTIALS",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "입력값을 다시 확인하고 로그인 실패가 반복되면 비밀번호 재설정을 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetMyAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user": {
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "email": "user@example.com",
                     *         "username": "메타미",
                     *         "role": "USER",
                     *         "birth_date": "2026-05-10",
                     *         "subscription_tier": "FREE",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AccountResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    WithdrawAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    UpdateMyAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "new-user@example.com"
                 *     }
                 */
                "application/json": components["schemas"]["UpdateAccountRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user": {
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "email": "user@example.com",
                     *         "username": "메타미",
                     *         "role": "USER",
                     *         "birth_date": "2026-05-10",
                     *         "subscription_tier": "FREE",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AccountResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    RequestPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "user@example.com"
                 *     }
                 */
                "application/json": components["schemas"]["PasswordResetRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ConfirmPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "reset_token": "reset-token-123",
                 *       "new_password": "NewSecurePass123!"
                 *     }
                 */
                "application/json": components["schemas"]["PasswordResetConfirmRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 처리할 수 없는 요청 */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "비밀번호 재설정 토큰이 만료되었습니다.",
                     *       "code": "AUTH_PASSWORD_RESET_TOKEN_EXPIRED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "새 비밀번호 재설정 메일 발송을 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Signup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "user@example.com",
                 *       "password": "SecurePass123!",
                 *       "birth_date": "2026-05-10"
                 *     }
                 */
                "application/json": components["schemas"]["SignUpRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "access_token": "access-token-value",
                     *       "refresh_token": "refresh-token-value",
                     *       "user_id": "11111111-1111-4111-8111-111111111111",
                     *       "role": "USER"
                     *     }
                     */
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "이미 사용 중인 이메일입니다.",
                     *       "code": "AUTH_EMAIL_ALREADY_EXISTS",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    RefreshToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "refresh_token": "eyJhbGciOiJIUzI1NiJ9.refresh-token"
                 *     }
                 */
                "application/json": components["schemas"]["RefreshTokenRequest"];
            };
        };
        responses: {
            /** @description Token refreshed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "access_token": "access-token-value",
                     *       "refresh_token": "refresh-token-value",
                     *       "user_id": "11111111-1111-4111-8111-111111111111",
                     *       "role": "USER"
                     *     }
                     */
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Refresh Token이 유효하지 않습니다.",
                     *       "code": "AUTH_REFRESH_TOKEN_INVALID",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "재로그인을 유도합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    SubmitOnboarding: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "my_one_sentence": "나는 몰입할 때 가장 나다운 사람입니다",
                 *       "self_strength": "새로운 것을 빨리 이해합니다",
                 *       "others_feedback": "설명을 잘한다는 말을 들어요",
                 *       "favorite_thing": "프로그래밍과 문제 해결"
                 *     }
                 */
                "application/json": components["schemas"]["OnboardingRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "accuracy_percent": 12,
                     *       "ai_first_sentence": "나는 문제를 구조화하며 성장하는 사람입니다"
                     *     }
                     */
                    "application/json": components["schemas"]["OnboardingResultResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "온보딩은 한 번만 제출할 수 있습니다.",
                     *       "code": "ONBOARDING_ALREADY_SUBMITTED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetOnboardingResult: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "accuracy_percent": 12,
                     *       "ai_first_sentence": "나는 문제를 구조화하며 성장하는 사람입니다"
                     *     }
                     */
                    "application/json": components["schemas"]["OnboardingResultResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 온보딩 미완료 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "온보딩을 완료하지 않은 사용자입니다.",
                     *       "code": "ONBOARDING_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "POST /v1/onboarding으로 온보딩을 먼저 제출합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListMyNicknames: {
        parameters: {
            query?: {
                /**
                 * @description 조회할 페이지 번호입니다. 모든 목록 API와 동일하게 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 한 페이지에 가져올 별명 수입니다.
                 * @example 20
                 */
                size?: number;
                /**
                 * @description 별명 유형 필터입니다. 생략하면 SELF, AI, OTHERS 전체를 반환합니다. AI 타입은 조회만 가능하며 생성은 서버 내부에서 수행됩니다.
                 * @example AI
                 */
                type?: "SELF" | "AI" | "OTHERS";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 1,
                     *         "total_elements": 1,
                     *         "size": 20
                     *       },
                     *       "nicknames": [
                     *         {
                     *           "nickname_id": "11111111-1111-4111-8111-111111111111",
                     *           "user_id": "11111111-1111-4111-8111-111111111111",
                     *           "nickname_type": "SELF",
                     *           "monster_id": "11111111-1111-4111-8111-111111111111",
                     *           "reason": "복잡한 상황에서도 핵심 문제를 먼저 찾기 때문입니다",
                     *           "created_by": "11111111-1111-4111-8111-111111111111",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["NicknameListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetNotificationSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "push_enabled": true,
                     *       "daily_question_time": "21:00",
                     *       "timezone": "Asia/Seoul",
                     *       "marketing_consent": false
                     *     }
                     */
                    "application/json": components["schemas"]["NotificationSetting"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    UpdateNotificationSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "push_enabled": true,
                 *       "daily_question_time": "21:00",
                 *       "timezone": "Asia/Seoul",
                 *       "marketing_consent": false
                 *     }
                 */
                "application/json": components["schemas"]["NotificationSetting"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "push_enabled": true,
                     *       "daily_question_time": "21:00",
                     *       "timezone": "Asia/Seoul",
                     *       "marketing_consent": false
                     *     }
                     */
                    "application/json": components["schemas"]["NotificationSetting"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetMyProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user": {
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "email": "user@example.com",
                     *         "username": "메타미",
                     *         "role": "USER",
                     *         "birth_date": "2026-05-10",
                     *         "subscription_tier": "FREE",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "profile": {
                     *         "profile_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "self_strength": "문제를 끝까지 파고드는 점",
                     *         "others_feedback": "집중력이 좋다는 말을 자주 들어요",
                     *         "favorite_thing": "새로운 기술을 배우는 것",
                     *         "ai_first_sentence": "나는 복잡한 문제를 구조화할 때 에너지를 얻는 사람입니다"
                     *       },
                     *       "latest_accuracy": {
                     *         "log_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "accuracy_percent": 42,
                     *         "xp_delta": 3.5,
                     *         "mae_delta": 1.2,
                     *         "score_basis": "RECORD_DEPTH",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserProfileResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetTerms: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "privacy_policy_url": "@url",
                     *       "terms_url": "@url",
                     *       "version": "2026.05.10"
                     *     }
                     */
                    "application/json": components["schemas"]["TermsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateNickname: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 별명을 받을 사용자 ID입니다.
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "nickname_type": "OTHERS",
                 *       "monster_id": "봄날의 햇살",
                 *       "reason": "조용하지만 주변 사람에게 따뜻한 에너지를 주기 때문입니다."
                 *     }
                 */
                "application/json": components["schemas"]["CreateNicknameRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "nickname": {
                     *         "nickname_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "nickname_type": "SELF",
                     *         "monster_id": "11111111-1111-4111-8111-111111111111",
                     *         "reason": "복잡한 상황에서도 핵심 문제를 먼저 찾기 때문입니다",
                     *         "created_by": "11111111-1111-4111-8111-111111111111",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["NicknameResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "AI 유형 별명 생성 또는 권한 없는 사용자에게 별명을 부여할 수 없습니다.",
                     *       "code": "FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "USER_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetMyAccuracy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 현재 정확도 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "accuracy_percent": 37,
                     *       "latest_log": {
                     *         "log_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "accuracy_percent": 37,
                     *         "xp_delta": 3.5,
                     *         "mae_delta": 1.2,
                     *         "score_basis": "BOTH",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["CurrentAccuracyResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "로그인 후 다시 시도합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "잠시 후 다시 시도합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    RegisterDeviceToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "token": "fcm_dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg",
                 *       "platform": "IOS"
                 *     }
                 */
                "application/json": components["schemas"]["RegisterDeviceTokenRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "device_token": {
                     *         "device_token_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "token": "fcm_dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg",
                     *         "platform": "IOS",
                     *         "last_used_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["DeviceTokenResponse"];
                };
            };
            /** @description VALIDATION_FAILED */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHORIZED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    DeleteDeviceToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 디바이스 토큰 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                device_token_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "디바이스 토큰이 해지되었습니다."
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description UNAUTHORIZED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "대상을 찾을 수 없습니다.",
                     *       "code": "NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GenerateWeeklyBrainStructure: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "target_week_start": "2026-05-04"
                 *     }
                 */
                "application/json": components["schemas"]["GenerateWeeklyBrainStructureRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "brain_structure": {
                     *         "brain_structure_id": "11111111-1111-4111-8111-111111111111",
                     *         "report_id": "11111111-1111-4111-8111-111111111111",
                     *         "image_url": "https://cdn.metame.app/brain-structures/weekly-2026-05-04.png",
                     *         "keywords": [
                     *           "공부 방향",
                     *           "휴식",
                     *           "인정 욕구"
                     *         ],
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BrainStructureResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ShareBrainStructure: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 공유할 뇌구조 결과 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                brain_structure_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "share_url": "@url"
                     *     }
                     */
                    "application/json": components["schemas"]["ShareLinkResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "RESOURCE_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListQuests: {
        parameters: {
            query?: {
                /**
                 * @description 조회할 페이지 번호입니다. 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지당 조회할 데이터 개수입니다.
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 1,
                     *         "total_elements": 1,
                     *         "size": 20
                     *       },
                     *       "quests": [
                     *         {
                     *           "quest_id": "11111111-1111-4111-8111-111111111111",
                     *           "title": "새로운 활동 30분 시도하기",
                     *           "description": "최근 긍정 감정이 높았던 활동과 비슷한 경험을 시도합니다",
                     *           "recommendation_reason": "혼자 창작할 때 긍정 어휘가 증가했습니다",
                     *           "status": "RECOMMENDED"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["QuestListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetQuest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 조회할 퀘스트 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                quest_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "quest": {
                     *         "quest_id": "11111111-1111-4111-8111-111111111111",
                     *         "title": "새로운 활동 30분 시도하기",
                     *         "description": "최근 긍정 감정이 높았던 활동과 비슷한 경험을 시도합니다",
                     *         "recommendation_reason": "혼자 창작할 때 긍정 어휘가 증가했습니다",
                     *         "status": "RECOMMENDED"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["QuestResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "QUEST_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CompleteQuest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 완료할 퀘스트 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                quest_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "completion_note": "생각보다 혼자 정리하는 시간이 잘 맞았습니다",
                 *       "satisfaction_score": 85
                 *     }
                 */
                "application/json": components["schemas"]["CreateQuestCompletionRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "quest": {
                     *         "quest_id": "11111111-1111-4111-8111-111111111111",
                     *         "title": "새로운 활동 30분 시도하기",
                     *         "description": "최근 긍정 감정이 높았던 활동과 비슷한 경험을 시도합니다",
                     *         "recommendation_reason": "혼자 창작할 때 긍정 어휘가 증가했습니다",
                     *         "status": "RECOMMENDED"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["QuestResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "QUEST_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListReports: {
        parameters: {
            query?: {
                /**
                 * @description 리포트 유형 필터
                 * @example WEEK
                 */
                report_type?: "WEEK" | "MONTH" | "MY_REPORT" | "OBJECTIVE_FEEDBACK";
                /**
                 * @description 페이지 번호
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지 크기
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 10,
                     *         "total_elements": 145,
                     *         "size": 20
                     *       },
                     *       "reports": [
                     *         {
                     *           "report_id": "11111111-1111-4111-8111-111111111111",
                     *           "user_id": "11111111-1111-4111-8111-111111111111",
                     *           "report_type": "WEEKLY",
                     *           "content": {},
                     *           "period_start": "2026-05-10",
                     *           "period_end": "2026-05-10",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ReportListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GenerateReport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "report_type": "WEEKLY",
                 *       "period_start": "2026-05-10",
                 *       "period_end": "2026-05-10"
                 *     }
                 */
                "application/json": components["schemas"]["GenerateReportRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "report": {
                     *         "report_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "report_type": "WEEKLY",
                     *         "content": {},
                     *         "period_start": "2026-05-10",
                     *         "period_end": "2026-05-10",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ReportResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 조회할 리포트 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                report_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "report": {
                     *         "report_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "report_type": "WEEKLY",
                     *         "content": {},
                     *         "period_start": "2026-05-10",
                     *         "period_end": "2026-05-10",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ReportResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "REPORT_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateTailQuestion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 원본 질문 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                question_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "tail_question": {
                     *         "tail_id": "11111111-1111-4111-8111-111111111111",
                     *         "parent_question_id": "11111111-1111-4111-8111-111111111111",
                     *         "question_text": "왜 그 순간이 나답다고 느껴졌나요?",
                     *         "user_answer": null,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TailQuestionResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "DAILY_QUESTION_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    UpdateTailQuestionAnswer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 부모 데일리 질문 ID입니다. 꼬리 질문이 이 질문에 속하는지 검증합니다.
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                question_id: string;
                /**
                 * @description 수정할 꼬리 질문 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                tail_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "user_answer": "그 선택이 내가 중요하게 생각하는 기준과 맞았기 때문입니다"
                 *     }
                 */
                "application/json": components["schemas"]["UpdateTailAnswerRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "tail_question": {
                     *         "tail_id": "11111111-1111-4111-8111-111111111111",
                     *         "parent_question_id": "11111111-1111-4111-8111-111111111111",
                     *         "question_text": "왜 그 순간이 나답다고 느껴졌나요?",
                     *         "user_answer": "내가 먼저 구조를 잡았기 때문입니다",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TailQuestionResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "TAIL_QUESTION_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListDailyRecords: {
        parameters: {
            query?: {
                /**
                 * @description 조회 시작일
                 * @example 2026-05-10
                 */
                start_date?: string;
                /**
                 * @description 조회 종료일
                 * @example 2026-05-10
                 */
                end_date?: string;
                /**
                 * @description 페이지 번호
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지 크기
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 10,
                     *         "total_elements": 145,
                     *         "size": 20
                     *       },
                     *       "records": [
                     *         {
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "user_id": "11111111-1111-4111-8111-111111111111",
                     *           "recorded_at": "2026-05-10T21:30:00+09:00",
                     *           "recorded_date": "2026-05-10",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["DailyRecordListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateDailyRecord: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "answer_type": "TEXT",
                 *       "user_answer": "오늘은 새로운 API 구조를 설계했습니다",
                 *       "user_answer_tags": [
                 *         "@sentence"
                 *       ],
                 *       "emotion_tag": "성취감",
                 *       "scene_description": "ERD를 보며 aggregate를 나누던 순간",
                 *       "is_myself_moment": false,
                 *       "myself_moment_desc": "구조를 깔끔하게 만들 때 나답다고 느꼈습니다"
                 *     }
                 */
                "application/json": components["schemas"]["SubmitDailyRecordRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "record": {
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "recorded_at": "2026-05-10T21:30:00+09:00",
                     *         "recorded_date": "2026-05-10",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "questions": [
                     *         {
                     *           "question_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "question_type": "TIME_CONTEXT",
                     *           "question_text": "오늘 가장 나답다고 느낀 순간은 언제였나요?",
                     *           "user_answer": "프로젝트 구조를 정리할 때 몰입했습니다",
                     *           "emotion_tag": "몰입",
                     *           "scene_description": "친구와 API 구조를 논의하던 장면",
                     *           "is_myself_moment": false,
                     *           "myself_moment_desc": "복잡한 개념을 설명할 때 나답다고 느꼈습니다",
                     *           "depth_score": 4
                     *         }
                     *       ],
                     *       "triggers": [
                     *         {
                     *           "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "domain": "STUDY",
                     *           "status": "PREDICTED",
                     *           "predicted_score": 80,
                     *           "predicted_time_min": 60,
                     *           "predicted_satisfaction": 70,
                     *           "actual_score": 65,
                     *           "actual_time_min": 95,
                     *           "actual_satisfaction": 50,
                     *           "mae_score": 15,
                     *           "mae_time": 35,
                     *           "mae_satisfaction": 20,
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["DailyRecordResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "오늘의 데일리 기록이 이미 존재합니다.",
                     *       "code": "DIARY_RECORD_ALREADY_EXISTS",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetDailyRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 조회할 일일 기록 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "record": {
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "recorded_at": "2026-05-10T21:30:00+09:00",
                     *         "recorded_date": "2026-05-10",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "questions": [
                     *         {
                     *           "question_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "question_type": "TIME_CONTEXT",
                     *           "question_text": "오늘 가장 나답다고 느낀 순간은 언제였나요?",
                     *           "user_answer": "프로젝트 구조를 정리할 때 몰입했습니다",
                     *           "emotion_tag": "몰입",
                     *           "scene_description": "친구와 API 구조를 논의하던 장면",
                     *           "is_myself_moment": false,
                     *           "myself_moment_desc": "복잡한 개념을 설명할 때 나답다고 느꼈습니다",
                     *           "depth_score": 4
                     *         }
                     *       ],
                     *       "triggers": [
                     *         {
                     *           "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "domain": "STUDY",
                     *           "status": "PREDICTED",
                     *           "predicted_score": 80,
                     *           "predicted_time_min": 60,
                     *           "predicted_satisfaction": 70,
                     *           "actual_score": 65,
                     *           "actual_time_min": 95,
                     *           "actual_satisfaction": 50,
                     *           "mae_score": 15,
                     *           "mae_time": 35,
                     *           "mae_satisfaction": 20,
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["DailyRecordResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "DIARY_RECORD_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    DeleteDailyRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 삭제할 일일 기록 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "DIARY_RECORD_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    UpdateDailyRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 수정할 일일 기록 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                record_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "answer_type": "TEXT",
                 *       "user_answer": "오늘은 새로운 API 구조를 설계했습니다",
                 *       "user_answer_tags": [
                 *         "@sentence"
                 *       ],
                 *       "emotion_tag": "성취감",
                 *       "scene_description": "ERD를 보며 aggregate를 나누던 순간",
                 *       "is_myself_moment": false,
                 *       "myself_moment_desc": "구조를 깔끔하게 만들 때 나답다고 느꼈습니다"
                 *     }
                 */
                "application/json": components["schemas"]["SubmitDailyRecordRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "record": {
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "recorded_at": "2026-05-10T21:30:00+09:00",
                     *         "recorded_date": "2026-05-10",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "questions": [
                     *         {
                     *           "question_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "question_type": "TIME_CONTEXT",
                     *           "question_text": "오늘 가장 나답다고 느낀 순간은 언제였나요?",
                     *           "user_answer": "프로젝트 구조를 정리할 때 몰입했습니다",
                     *           "emotion_tag": "몰입",
                     *           "scene_description": "친구와 API 구조를 논의하던 장면",
                     *           "is_myself_moment": false,
                     *           "myself_moment_desc": "복잡한 개념을 설명할 때 나답다고 느꼈습니다",
                     *           "depth_score": 4
                     *         }
                     *       ],
                     *       "triggers": [
                     *         {
                     *           "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "domain": "STUDY",
                     *           "status": "PREDICTED",
                     *           "predicted_score": 80,
                     *           "predicted_time_min": 60,
                     *           "predicted_satisfaction": 70,
                     *           "actual_score": 65,
                     *           "actual_time_min": 95,
                     *           "actual_satisfaction": 50,
                     *           "mae_score": 15,
                     *           "mae_time": 35,
                     *           "mae_satisfaction": 20,
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["DailyRecordResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "DIARY_RECORD_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateMetacogBetting: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "trigger_id": "11111111-1111-4111-8111-111111111111",
                 *       "betting_coin": 10
                 *     }
                 */
                "application/json": components["schemas"]["CreateBettingRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "betting": {
                     *         "betting_id": "11111111-1111-4111-8111-111111111111",
                     *         "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *         "betting_coin": 10,
                     *         "error_margin": 12.5,
                     *         "is_bankrupt": false,
                     *         "reward_coin": 0,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BettingResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    SubmitMetacogBettingResult: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 결과를 입력할 베팅 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                betting_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "actual_score": 70,
                 *       "actual_time_min": 65,
                 *       "actual_satisfaction": 60
                 *     }
                 */
                "application/json": components["schemas"]["SubmitActualResultRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "betting": {
                     *         "betting_id": "11111111-1111-4111-8111-111111111111",
                     *         "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *         "betting_coin": 10,
                     *         "error_margin": 12.5,
                     *         "is_bankrupt": false,
                     *         "reward_coin": 0,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BettingResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "METACOG_BETTING_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateMetacogTrigger: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "record_id": "11111111-1111-4111-8111-111111111111",
                 *       "domain": "STUDY",
                 *       "predicted_score": 85,
                 *       "predicted_time_min": 40,
                 *       "predicted_satisfaction": 75
                 *     }
                 */
                "application/json": components["schemas"]["CreateTriggerRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "trigger": {
                     *         "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "domain": "STUDY",
                     *         "status": "PREDICTED",
                     *         "predicted_score": 80,
                     *         "predicted_time_min": 60,
                     *         "predicted_satisfaction": 70,
                     *         "actual_score": 65,
                     *         "actual_time_min": 95,
                     *         "actual_satisfaction": 50,
                     *         "mae_score": 15,
                     *         "mae_time": 35,
                     *         "mae_satisfaction": 20,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "insight": "예상 시간보다 실제 시간이 반복적으로 길어지는 패턴이 있습니다"
                     *     }
                     */
                    "application/json": components["schemas"]["TriggerAnalysisResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetMetacogTriggerReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 분석할 트리거 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                trigger_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "trigger": {
                     *         "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "domain": "STUDY",
                     *         "status": "PREDICTED",
                     *         "predicted_score": 80,
                     *         "predicted_time_min": 60,
                     *         "predicted_satisfaction": 70,
                     *         "actual_score": 65,
                     *         "actual_time_min": 95,
                     *         "actual_satisfaction": 50,
                     *         "mae_score": 15,
                     *         "mae_time": 35,
                     *         "mae_satisfaction": 20,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "insight": "예상 시간보다 실제 시간이 반복적으로 길어지는 패턴이 있습니다"
                     *     }
                     */
                    "application/json": components["schemas"]["TriggerAnalysisResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "METACOG_TRIGGER_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    SubmitMetacogTriggerResult: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 결과를 입력할 트리거 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                trigger_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "actual_score": 70,
                 *       "actual_time_min": 65,
                 *       "actual_satisfaction": 60
                 *     }
                 */
                "application/json": components["schemas"]["SubmitActualResultRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "trigger": {
                     *         "trigger_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "domain": "STUDY",
                     *         "status": "PREDICTED",
                     *         "predicted_score": 80,
                     *         "predicted_time_min": 60,
                     *         "predicted_satisfaction": 70,
                     *         "actual_score": 65,
                     *         "actual_time_min": 95,
                     *         "actual_satisfaction": 50,
                     *         "mae_score": 15,
                     *         "mae_time": 35,
                     *         "mae_satisfaction": 20,
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "insight": "예상 시간보다 실제 시간이 반복적으로 길어지는 패턴이 있습니다"
                     *     }
                     */
                    "application/json": components["schemas"]["TriggerAnalysisResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "METACOG_TRIGGER_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetTodayDailyQuestion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "question": {
                     *         "question_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "question_type": "TIME_CONTEXT",
                     *         "question_text": "오늘 가장 나답다고 느낀 순간은 언제였나요?",
                     *         "user_answer": "프로젝트 구조를 정리할 때 몰입했습니다",
                     *         "emotion_tag": "몰입",
                     *         "scene_description": "친구와 API 구조를 논의하던 장면",
                     *         "is_myself_moment": false,
                     *         "myself_moment_desc": "복잡한 개념을 설명할 때 나답다고 느꼈습니다",
                     *         "depth_score": 4
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["DailyQuestionResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListMirrorMonsters: {
        parameters: {
            query?: {
                /**
                 * @description 조회할 페이지 번호입니다. 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지당 조회할 데이터 개수입니다.
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 1,
                     *         "total_elements": 1,
                     *         "size": 20
                     *       },
                     *       "total_count": 24,
                     *       "monsters": [
                     *         {
                     *           "monster_id": "11111111-1111-4111-8111-111111111111",
                     *           "monster_code": "EXTERNAL_BLAME",
                     *           "awareness_level": 0,
                     *           "activeness": 0,
                     *           "universality": 0,
                     *           "maturity": 0,
                     *           "base_rarity_score": 0,
                     *           "monster_description": "상황 원인을 외부 요인에만 돌리는 패턴입니다",
                     *           "category": "COGNITIVE",
                     *           "condition_type": "PATTERN_COUNT",
                     *           "condition_value": {},
                     *           "base_rarity": "COMMON",
                     *           "icon_url": "@url"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["MonsterListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListObjectiveMirrors: {
        parameters: {
            query?: {
                /**
                 * @description 페이지 번호
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지 크기
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 10,
                     *         "total_elements": 145,
                     *         "size": 20
                     *       },
                     *       "mirrors": [
                     *         {
                     *           "mirror_id": "11111111-1111-4111-8111-111111111111",
                     *           "user_id": "11111111-1111-4111-8111-111111111111",
                     *           "record_id": "11111111-1111-4111-8111-111111111111",
                     *           "original_emotion": "팀원이 아무것도 안 해서 너무 짜증났다",
                     *           "objective_fact": "팀 프로젝트에서 업무 분담 불균형으로 피로감을 경험했습니다",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectiveMirrorListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateObjectiveMirror: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "record_id": "11111111-1111-4111-8111-111111111111",
                 *       "original_emotion": "오늘 공부했는데 하나도 머릿속에 안 들어온다"
                 *     }
                 */
                "application/json": components["schemas"]["CreateObjectiveMirrorRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "mirror": {
                     *         "mirror_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "original_emotion": "팀원이 아무것도 안 해서 너무 짜증났다",
                     *         "objective_fact": "팀 프로젝트에서 업무 분담 불균형으로 피로감을 경험했습니다",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "unlocked_monsters": [
                     *         {
                     *           "monster_detection_id": "11111111-1111-4111-8111-111111111111",
                     *           "mirror_id": "11111111-1111-4111-8111-111111111111",
                     *           "monster_id": "11111111-1111-4111-8111-111111111111",
                     *           "detected_monster_count": 0,
                     *           "monster": {
                     *             "monster_id": "11111111-1111-4111-8111-111111111111",
                     *             "monster_code": "EXTERNAL_BLAME",
                     *             "awareness_level": 0,
                     *             "activeness": 0,
                     *             "universality": 0,
                     *             "maturity": 0,
                     *             "base_rarity_score": 0,
                     *             "monster_description": "상황 원인을 외부 요인에만 돌리는 패턴입니다",
                     *             "category": "COGNITIVE",
                     *             "condition_type": "PATTERN_COUNT",
                     *             "condition_value": {
                     *               "tags": [
                     *                 "EXTERNAL_BLAME"
                     *               ],
                     *               "min_count": 3
                     *             },
                     *             "base_rarity": "COMMON",
                     *             "icon_url": "https://cdn.metame.app/monsters/external_blame.png"
                     *           }
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectiveMirrorResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetObjectiveMirror: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 조회할 객관화 미러 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                mirror_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "mirror": {
                     *         "mirror_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "record_id": "11111111-1111-4111-8111-111111111111",
                     *         "original_emotion": "팀원이 아무것도 안 해서 너무 짜증났다",
                     *         "objective_fact": "팀 프로젝트에서 업무 분담 불균형으로 피로감을 경험했습니다",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "unlocked_monsters": [
                     *         {
                     *           "monster_detection_id": "11111111-1111-4111-8111-111111111111",
                     *           "mirror_id": "11111111-1111-4111-8111-111111111111",
                     *           "monster_id": "11111111-1111-4111-8111-111111111111",
                     *           "detected_monster_count": 0,
                     *           "monster": {
                     *             "monster_id": "11111111-1111-4111-8111-111111111111",
                     *             "monster_code": "EXTERNAL_BLAME",
                     *             "awareness_level": 0,
                     *             "activeness": 0,
                     *             "universality": 0,
                     *             "maturity": 0,
                     *             "base_rarity_score": 0,
                     *             "monster_description": "상황 원인을 외부 요인에만 돌리는 패턴입니다",
                     *             "category": "COGNITIVE",
                     *             "condition_type": "PATTERN_COUNT",
                     *             "condition_value": {
                     *               "tags": [
                     *                 "EXTERNAL_BLAME"
                     *               ],
                     *               "min_count": 3
                     *             },
                     *             "base_rarity": "COMMON",
                     *             "icon_url": "https://cdn.metame.app/monsters/external_blame.png"
                     *           }
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectiveMirrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "OBJECTIVE_MIRROR_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListB2BReports: {
        parameters: {
            query?: {
                /**
                 * @description 기관 ID 필터
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                organization_id?: string;
                /**
                 * @description 조회할 페이지 번호입니다. 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지당 조회할 데이터 개수입니다.
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "organization_id": "11111111-1111-4111-8111-111111111111",
                     *       "anonymous_report": {}
                     *     }
                     */
                    "application/json": components["schemas"]["B2BReportResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "관리자 권한이 필요합니다.",
                     *       "code": "FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    SendNotification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "user_id": "11111111-1111-4111-8111-111111111111",
                 *       "title": "주간 리포트가 생성됐어요",
                 *       "body": "이번 주 패턴을 확인해보세요"
                 *     }
                 */
                "application/json": components["schemas"]["SendNotificationRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "Success"
                     *     }
                     */
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "관리자 권한이 필요합니다.",
                     *       "code": "FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetAdminStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "total_users": 500,
                     *       "daily_active_users": 120,
                     *       "records_count": 4200
                     *     }
                     */
                    "application/json": components["schemas"]["AdminStatsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "관리자 권한이 필요합니다.",
                     *       "code": "FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateAiCounselingSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "title": "공부 방향 상담"
                 *     }
                 */
                "application/json": components["schemas"]["CreateAiCounselingSessionRequest"];
            };
        };
        responses: {
            /** @description 상담 세션 생성 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "session": {
                     *         "session_id": "11111111-1111-4111-8111-111111111111",
                     *         "title": "공부 방향 상담",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AiCounselingSessionResponse"];
                };
            };
            /** @description 잘못된 요청 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "세션 제목 형식이 올바르지 않습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "제목 길이를 80자 이하로 조정합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "로그인 후 다시 시도합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "잠시 후 다시 시도합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateAiCounselingMessage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "session_id": "11111111-1111-4111-8111-111111111111",
                 *       "message": "요즘 공부 방향이 맞는지 모르겠어"
                 *     }
                 */
                "application/json": components["schemas"]["AiCounselingRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user_message": {
                     *         "message_id": "11111111-1111-4111-8111-111111111111",
                     *         "session_id": "11111111-1111-4111-8111-111111111111",
                     *         "sender_type": "USER",
                     *         "content": "요즘 공부 방향이 맞는지 모르겠어",
                     *         "created_at": "2026-05-10T09:00:00+09:00"
                     *       },
                     *       "ai_message": {
                     *         "message_id": "22222222-2222-4222-8222-222222222222",
                     *         "session_id": "11111111-1111-4111-8111-111111111111",
                     *         "sender_type": "AI",
                     *         "content": "최근 기록을 보면 공부 방향에 대한 불확실성이 반복되고 있어요. 오늘은 목표를 더 작은 단위로 나누고, 예상 이해도와 실제 이해도를 비교해보는 것이 좋아 보여요.",
                     *         "created_at": "2026-05-10T09:00:03+09:00"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AiCounselingResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "현재 사용자의 상담 세션이 아닙니다.",
                     *       "code": "AI_COUNSELING_SESSION_FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "본인 세션을 생성하거나 조회한 뒤 다시 전송합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 리소스 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "상담 세션을 찾을 수 없습니다.",
                     *       "code": "AI_COUNSELING_SESSION_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "POST /v1/ai-counseling/sessions로 새 세션을 생성합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetCrisisLogs: {
        parameters: {
            query?: {
                /** @description 특정 사용자의 위기 로그만 조회 (선택) */
                user_id?: string;
                /** @description 필터 단계별 조회 (선택) */
                filter_stage?: "INPUT" | "OUTPUT";
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrisisLogListResponse"];
                };
            };
            /** @description Forbidden - Admin only */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListAiCounselingMessages: {
        parameters: {
            query?: {
                /**
                 * @description 조회할 페이지 번호입니다. 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지당 조회할 데이터 개수입니다.
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path: {
                /**
                 * @description 조회할 상담 세션 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 10,
                     *         "total_elements": 145,
                     *         "size": 20
                     *       },
                     *       "messages": [
                     *         {
                     *           "message_id": "11111111-1111-4111-8111-111111111111",
                     *           "session_id": "11111111-1111-4111-8111-111111111111",
                     *           "sender_type": "USER",
                     *           "content": "요즘 내가 이 방향이 맞는지 모르겠어",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["AiCounselingHistoryResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "현재 사용자의 상담 세션이 아닙니다.",
                     *       "code": "AI_COUNSELING_SESSION_FORBIDDEN",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "세션 목록을 다시 조회하거나 올바른 session_id를 사용합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청한 리소스를 찾을 수 없습니다.",
                     *       "code": "AI_COUNSELING_SESSION_NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetCrisisLogDetail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                logId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrisisLogDetailResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetCrisisActions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                logId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrisisActionsResponse"];
                };
            };
        };
    };
    RecordCrisisAction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                logId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCrisisActionRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrisisAction"];
                };
            };
        };
    };
    ListMyMonsters: {
        parameters: {
            query?: {
                /**
                 * @description 조회할 페이지 번호입니다. 1부터 시작합니다.
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지당 조회할 데이터 개수입니다.
                 * @example 20
                 */
                size?: number;
                /** @description 특정 패턴 카테고리로 필터링합니다. */
                category?: "COGNITIVE" | "EMOTIONAL" | "BEHAVIORAL" | "RELATIONAL" | "GROWTH" | "SITUATIONAL";
                /**
                 * @description 정렬 기준입니다.
                 * @example RARITY_DESC
                 */
                sort?: "RARITY_DESC" | "COUNT_DESC" | "RECENT";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserMonsterListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetSubscriptionPlans: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionPlanListResponse"];
                };
            };
        };
    };
    GetMySubscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "subscription": {
                     *         "subscription_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "plan_id": "11111111-1111-4111-8111-111111111111",
                     *         "status": "ACTIVE",
                     *         "started_at": "2026-05-10T09:00:00+09:00",
                     *         "expires_at": "2026-06-10T09:00:00+09:00",
                     *         "auto_renew": true,
                     *         "created_at": "2026-05-10T09:00:00+09:00",
                     *         "updated_at": "2026-05-10T09:00:00+09:00",
                     *         "plan": {
                     *           "plan_id": "11111111-1111-4111-8111-111111111111",
                     *           "plan_code": "PREMIUM",
                     *           "name": "프리미엄",
                     *           "price": 4900,
                     *           "max_ai_questions": 100,
                     *           "report_enabled": true,
                     *           "is_active": true,
                     *           "created_at": "2026-05-10T09:00:00+09:00",
                     *           "updated_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
            /** @description UNAUTHORIZED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "대상을 찾을 수 없습니다.",
                     *       "code": "NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetUserSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    CreateSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSubscriptionRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    UpdateSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 구독 ID
                 * @example 11111111-1111-4111-8111-111111111111
                 */
                subscription_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "status": "CANCELED",
                 *       "auto_renew": false
                 *     }
                 */
                "application/json": components["schemas"]["UpdateSubscriptionRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "subscription": {
                     *         "subscription_id": "11111111-1111-4111-8111-111111111111",
                     *         "user_id": "11111111-1111-4111-8111-111111111111",
                     *         "plan_id": "11111111-1111-4111-8111-111111111111",
                     *         "status": "CANCELED",
                     *         "started_at": "2026-05-10T09:00:00+09:00",
                     *         "expires_at": "2026-06-10T09:00:00+09:00",
                     *         "auto_renew": false,
                     *         "created_at": "2026-05-10T09:00:00+09:00",
                     *         "updated_at": "2026-05-10T09:00:00+09:00",
                     *         "plan": {
                     *           "plan_id": "11111111-1111-4111-8111-111111111111",
                     *           "plan_code": "PREMIUM",
                     *           "name": "프리미엄",
                     *           "price": 4900,
                     *           "max_ai_questions": 100,
                     *           "report_enabled": true,
                     *           "is_active": true,
                     *           "created_at": "2026-05-10T09:00:00+09:00",
                     *           "updated_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
            /** @description VALIDATION_FAILED */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "요청 값 검증에 실패했습니다.",
                     *       "code": "VALIDATION_FAILED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNAUTHORIZED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "대상을 찾을 수 없습니다.",
                     *       "code": "NOT_FOUND",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListMyPayments: {
        parameters: {
            query?: {
                /**
                 * @description 페이지 번호(1부터)
                 * @example 1
                 */
                page?: number;
                /**
                 * @description 페이지 크기
                 * @example 20
                 */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "page_info": {
                     *         "current_page": 1,
                     *         "total_pages": 1,
                     *         "total_elements": 1,
                     *         "size": 20
                     *       },
                     *       "payments": [
                     *         {
                     *           "payment_id": "11111111-1111-4111-8111-111111111111",
                     *           "subscription_id": "11111111-1111-4111-8111-111111111111",
                     *           "amount": 4900,
                     *           "currency": "KRW",
                     *           "payment_method": "KAKAOPAY",
                     *           "pg_provider": "tosspayments",
                     *           "pg_transaction_id": "tx_20260510_0001",
                     *           "status": "PAID",
                     *           "paid_at": "2026-05-10T09:00:00+09:00",
                     *           "created_at": "2026-05-10T09:00:00+09:00"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["PaymentListResponse"];
                };
            };
            /** @description UNAUTHORIZED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "인증이 필요합니다. Access Token을 확인해주세요.",
                     *       "code": "UNAUTHORIZED",
                     *       "timestamp": "2026-05-10T09:00:00+09:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description 서버 내부 오류 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "서버 내부 오류가 발생했습니다.",
                     *       "code": "INTERNAL_SERVER_ERROR",
                     *       "timestamp": "2026-05-10T09:00:00+09:00",
                     *       "resolution": "사용자에게 잠시 후 다시 시도하라고 안내합니다."
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetPlanFeatures: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                planId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlanFeaturesResponse"];
                };
            };
        };
    };
    GetSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                subscriptionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    UpdateSubscription_PUT: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                subscriptionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSubscriptionRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    GetPayments: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentListResponse"];
                };
            };
        };
    };
    GetUserSessions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CreateCounselingSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "title": "진로 고민"
                 *     }
                 */
                "application/json": components["schemas"]["CreateSessionRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "session_id": "11111111-1111-4111-8111-111111111111",
                     *       "title": "진로 고민"
                     *     }
                     */
                    "application/json": components["schemas"]["CreateSessionResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GetCounselingSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 11111111-1111-4111-8111-111111111111 */
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionDetailResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    UpdateCounselingSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "title": "진로 고민 (수정)"
                 *     }
                 */
                "application/json": components["schemas"]["UpdateSessionRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DeleteCounselingSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GetMessages: {
        parameters: {
            query: {
                branchId: string;
            };
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageListResponse"];
                };
            };
        };
    };
    CreateMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "branchId": "22222222-2222-4222-8222-222222222222",
                 *       "role": "USER",
                 *       "content": "개발자가 되고 싶은데 어떻게 시작해야 할까요?"
                 *     }
                 */
                "application/json": components["schemas"]["CreateMessageRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateMessageResponse"];
                };
            };
        };
    };
    GetMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
                /** @example  */
                messageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDetailResponse"];
                };
            };
        };
    };
    ReviseMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example  */
                sessionId: string;
                /** @example  */
                messageId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "content": "개발자가 되고 싶어요. (수정)"
                 *     }
                 */
                "application/json": components["schemas"]["ReviseMessageRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
