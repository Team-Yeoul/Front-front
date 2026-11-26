/*
 * 예전 경로 호환: 약관 내용은 lib/terms/content, 본문 화면은 ./TermsBody로 옮겼다.
 * 화면을 앱에서 다시 옮길 때 '@/components/ui/TermsBody'와 '@/lib/terms/content'를 직접 쓰고 이 파일은 지운다.
 */
export { TermsBody } from './TermsBody';
export { TERMS_CONTENT, isTermsKey, type TermsBlock, type TermsDoc, type TermsKey } from '@/lib/terms/content';
