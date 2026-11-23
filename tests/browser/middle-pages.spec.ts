import {test,expect} from '@playwright/test';

test('Elementary math content stays identical and middle grade links open the new course',async({page})=>{
  await page.goto('/mathgenius_fr/');
  await expect(page.getByRole('group',{name:'학년 선택'})).toBeVisible();
  await expect(page.getByRole('group',{name:'중학교 수학 선택'})).toBeVisible();
  await page.getByRole('button',{name:/중2 수학 →/}).click();
  await expect(page.getByRole('heading',{name:/중2 수학을/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'원리를 먼저 알아봐요'})).toBeVisible();
  await expect(page.getByRole('group',{name:'중학교 학년 선택'})).toBeVisible();
});
test('Middle grade interactive lab changes result and practice is playable',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=1');
  await expect(page.getByRole('heading',{name:/중1 수학을/})).toBeVisible();
  await page.getByRole('button',{name:/움직이는 교구로 확인하기/}).click();
  await expect(page.getByRole('img',{name:/수량과 구성이 바뀌는 시각 교구/})).toBeVisible();
  const output=page.locator('.middle-live-result strong').first();
  await expect(output).toContainText('36');
  await page.locator('#middle-control-a').fill('48');
  await expect(output).toContainText('48');
  await page.getByRole('button',{name:/배운 개념으로 문제 풀기/}).click();
  await expect(page.locator('.middle-choice-grid button')).toHaveCount(4);
  await page.locator('.middle-choice-grid button').first().click();
  await expect(page.getByRole('status')).toBeVisible();
});
test('Middle 3 geometry and local-only progress remain available without accounts',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=3');
  await expect(page.getByRole('heading',{name:/중3 수학을/})).toBeVisible();
  await page.getByRole('group',{name:'학기 선택'}).getByRole('button',{name:'2학기'}).click();
  await page.getByRole('button',{name:/삼각비/}).click();
  await page.getByRole('button',{name:/움직이는 교구로 확인하기/}).click();
  await expect(page.getByRole('img',{name:/삼각형/})).toBeVisible();
  await expect(page.locator('#middle-control-a')).toBeVisible();
  await expect(page.locator('.middle-lab')).toContainText('sin');
});
