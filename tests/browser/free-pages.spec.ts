import {test,expect} from '@playwright/test';
test('무료판은 원본 학습실을 홈에서 즉시 시작한다',async({page})=>{
  await page.goto('/mathgenius_fr/');
  await expect(page.getByRole('group',{name:'학년 선택'})).toBeVisible();
  await expect(page.locator('.grade-button--active')).toContainText('5');
  await expect(page.locator('.visual-card')).toBeVisible();
  await page.getByRole('group',{name:'학년 선택'}).getByRole('button',{name:'2학년'}).click();
  await expect(page.locator('.grade-button--active')).toContainText('2');
  await expect(page.locator('.visual-card')).toBeVisible();
});
test('학년별 링크에서도 동일한 수학 교구와 학습 단계가 열린다',async({page})=>{
  await page.goto('/mathgenius_fr/?guest=1&grade=1');
  await expect(page.locator('.grade-button--active')).toContainText('1');
  await expect(page.locator('.visual-card')).toBeVisible();
  await expect(page.getByRole('button',{name:/다음 단계/})).toBeVisible();
  await page.getByRole('button',{name:/다음 단계/}).click();
  await expect(page.getByText('STEP 2 / 3',{exact:false})).toBeVisible();
});
test('서버 로그인을 요청하지 않고 로컬 학습 데이터를 유지한다',async({page})=>{
  await page.goto('/mathgenius_fr/?guest=1&grade=5');
  await expect(page.getByText('학습 기록은 이 기기에만 저장됩니다.')).toBeVisible();
  await expect(page.getByRole('group',{name:'학년 선택'})).toBeVisible();
});
