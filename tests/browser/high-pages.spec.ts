import {test,expect} from '@playwright/test';

test('elementary portal opens the high-school course and subjects switch',async({page})=>{
  await page.goto('/mathgenius_fr/');
  await page.getByRole('button',{name:/고등 수학 →/}).click();
  await expect(page.getByRole('heading',{name:/공통수학1, 그래프로/})).toBeVisible();
  await expect(page.getByRole('group',{name:'고등학교 과목 선택'}).getByRole('button')).toHaveCount(5);
  await page.getByRole('group',{name:'고등학교 과목 선택'}).getByRole('button',{name:/확률과 통계/}).click();
  await expect(page.getByRole('heading',{name:/중복순열/})).toBeVisible();
  await expect(page).toHaveURL(/level=high&course=stat/);
});
test('high-school lab reacts to sliders and practice shows stacked fractions',async({page})=>{
  await page.goto('/mathgenius_fr/?level=high&course=calc');
  await expect(page.locator('.high-lab svg')).toBeVisible();
  await page.getByRole('button',{name:/정적분의 활용/}).click();
  await expect(page.locator('.middle-live-result')).toContainText('9');
  const slider=page.locator('.high-lab input[type=range]').first();
  await slider.fill('2');
  await expect(page.locator('.middle-live-result')).toContainText('4');
  await expect(page.locator('.middle-live-result .math-fraction').first()).toBeVisible();
  await page.getByRole('button',{name:/문제 풀어보기/}).click();
  await expect(page.locator('.middle-choice-grid button')).toHaveCount(4);
  await page.locator('.middle-choice-grid button').first().click();
  await expect(page.getByRole('status')).toBeVisible();
});
test('high-school pages fit a phone screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/mathgenius_fr/?level=high&course=alg');
  await expect(page.getByRole('heading',{name:/대수, 그래프로/})).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
