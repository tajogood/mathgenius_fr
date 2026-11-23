import {test,expect} from '@playwright/test';

test('Elementary math content stays identical and middle grade links open the new course',async({page})=>{
  await page.goto('/mathgenius_fr/');
  await expect(page.getByRole('group',{name:'학년 선택'})).toBeVisible();
  await expect(page.getByRole('group',{name:'중학교 수학 선택'})).toBeVisible();
  await page.getByRole('button',{name:/중2 수학 →/}).click();
  await expect(page.getByRole('heading',{name:/중2 수학을/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'숫자와 도형을 바꿔 보세요'})).toBeVisible();
  await expect(page.getByRole('group',{name:'학습 단계'}).getByRole('button')).toHaveCount(2);
  await expect(page.locator('.discovery-lab')).toBeVisible();
  await expect(page.getByRole('heading',{name:/나눗셈의 나머지가 반복되면/})).toBeVisible();
  await expect(page.getByRole('group',{name:'중학교 학년 선택'})).toBeVisible();
});
test('Middle grade interactive lab changes result and practice is playable',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=1');
  await expect(page.getByRole('heading',{name:/중1 수학을/})).toBeVisible();
  await expect(page.getByRole('img',{name:/26개의 점/})).toBeVisible();
  await expect(page.locator('.prime-dot')).toHaveCount(26);
  await page.getByRole('button',{name:/26 ÷ 2 계산하기/}).click();
  await expect(page.getByRole('img',{name:/13개의 점/})).toBeVisible();
  await expect(page.locator('.prime-dot')).toHaveCount(13);
  await page.getByRole('button',{name:/13 ÷ 13 계산하기/}).click();
  await expect(page.getByText(/모든 인수가 소수/)).toBeVisible();
  await page.getByRole('button',{name:/문제 풀어보기/}).click();
  await expect(page.locator('.middle-choice-grid button')).toHaveCount(4);
  await page.locator('.middle-choice-grid button').first().click();
  await expect(page.getByRole('status')).toBeVisible();
});
test('Middle 3 geometry and local-only progress remain available without accounts',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=3');
  await expect(page.getByRole('heading',{name:/중3 수학을/})).toBeVisible();
  await page.getByRole('group',{name:'학기 선택'}).getByRole('button',{name:'2학기'}).click();
  await page.getByRole('button',{name:/삼각비/}).click();
  await expect(page.getByRole('img',{name:/삼각형/})).toBeVisible();
  await expect(page.locator('#middle-control-a')).toBeVisible();
  await expect(page.locator('.middle-lab')).toContainText('sin');
});
