// Apidog에서 내보낸 OpenAPI(latest.openapi.json)로 src/shared/api/schema.gen.ts를 만든다.
// 명세에 같은 operationId가 둘 이상 있으면(예: UpdateSubscription) 타입이 중복 선언돼
// 컴파일이 깨지므로, 생성 전에 뒤에 나온 것에 메서드 이름을 붙여 구분한다.
import { readFileSync, writeFileSync } from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const SRC = new URL('../latest.openapi.json', import.meta.url);
const OUT = new URL('../src/shared/api/schema.gen.ts', import.meta.url);

const spec = JSON.parse(readFileSync(SRC, 'utf8'));
const seen = new Set();
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const [method, op] of Object.entries(item)) {
    if (!op || typeof op !== 'object' || !op.operationId) continue;
    if (seen.has(op.operationId)) {
      const renamed = `${op.operationId}_${method.toUpperCase()}`;
      console.warn(`duplicate operationId "${op.operationId}" at ${method.toUpperCase()} ${path} → ${renamed}`);
      op.operationId = renamed;
    }
    seen.add(op.operationId);
  }
}

const ast = await openapiTS(spec);
writeFileSync(OUT, astToString(ast));
console.log('✓ src/shared/api/schema.gen.ts');
