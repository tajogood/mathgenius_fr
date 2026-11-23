import {test,expect} from '@playwright/test';

test('무료판 첫 화면에서 학년을 골라 바로 수학을 시작할 수 있다',async({page})=>{
  await page.goto('/mathgenius_fr/');
  await expect(page.getByRole('heading',{name:/초등 수학/})).toBeVisible();
  await expect(page.getByRole('button',{name:/2학년 수학 시작하기/})).toBeVisible();
  await page.getByRole('button',{name:/2학년 수학 시작하기/}).click();
  await expect(page.locator('.grade-button--active')).toContainText('2');
  await expect(page.locator('.visual-card')).toBeVisible();
  expect(page.url()).toContain('guest=1');
  await page.getByRole('button',{name:/무료판 첫 화면/}).click();
  await expect(page.getByRole('heading',{name:/초등 수학/})).toBeVisible();
});

test('로그인 없이 직접 개념 교구를 조작하고 학습을 진행할 수 있다',async({page})=>{
  await page.goto('/mathgenius_fr/?guest=1&grade=5');
  await expect(page.locator('.grade-button--active')).toContainText('5');
  await expect(page.locator('.visual-card')).toBeVisible();
  await expect(page.getByRole('button',{name:/다음 단계/})).toBeVisible();
  await page.getByRole('button',{name:/다음 단계/}).click();
  await expect(page.getByText('STEP 2 / 3',{exact:false})).toBeVisible();
  await expect(page.locator('.free-study-banner')).toContainText('기기에만 저장');
});
