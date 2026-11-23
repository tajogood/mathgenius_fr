import {test,expect} from '@playwright/test';

test('prime division is a meaningful experiment with exact remaining-dot counts',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=1');
  await expect(page.locator('.prime-experiment')).toBeVisible();
  await expect(page.locator('.prime-dot')).toHaveCount(26);
  await page.getByRole('button',{name:/26 ÷ 2 계산하기/}).click();
  await expect(page.locator('.prime-dot')).toHaveCount(13);
  await page.getByRole('button',{name:/13 ÷ 13 계산하기/}).click();
  await expect(page.getByText(/모든 인수가 소수/)).toBeVisible();
});
test('direct coordinate dragging updates the mathematics instead of only moving a decorative shape',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=1');
  await page.getByRole('button',{name:/좌표평면과 그래프/}).click();
  const svg=page.locator('svg.tactile-svg');
  await expect(svg).toBeVisible();
  const box=await svg.boundingBox();expect(box).not.toBeNull();
  const x=box!.x+(205-4*16)/412*box!.width;
  const y=box!.y+(136+3*16)/272*box!.height;
  await page.mouse.click(x,y);
  await expect(page.getByRole('img',{name:/점 P는 \(-4, -3\)/})).toBeVisible();
  await expect(page.locator('.tactile-answer')).toContainText('제3사분면');
});
test('exponents visually merge the actual number of factors',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=2');
  await page.getByRole('button',{name:/식의 계산/}).click();
  await expect(page.locator('.discovery-power-cards span')).toHaveCount(5);
  await page.getByRole('button',{name:/곱셈을 한 묶음으로/}).click();
  await expect(page.locator('.discovery-power-cards span.merged')).toHaveCount(5);
});
test('Pythagoras visualization places three true squares on corresponding triangle sides',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=2');
  await page.getByRole('group',{name:'학기 선택'}).getByRole('button',{name:'2학기'}).click();
  await page.getByRole('button',{name:/피타고라스 정리/}).click();
  const svg=page.getByRole('img',{name:/각 변에 정사각형/});
  await expect(svg).toBeVisible();
  await expect(svg.locator('polygon')).toHaveCount(4);
  await expect(svg.locator('text')).toContainText(['9','16','25']);
});
test('middle 3 boxplot changes its real box width when data spread changes',async({page})=>{
  await page.goto('/mathgenius_fr/?level=middle&grade=3');
  await page.getByRole('group',{name:'학기 선택'}).getByRole('button',{name:'2학기'}).click();
  await page.getByRole('button',{name:/상자그림/}).click();
  const box=page.locator('svg.middle-svg rect').first();
  const before=Number(await box.getAttribute('width'));
  await page.locator('#middle-control-a').focus();
  await page.keyboard.press('End');
  await expect.poll(async()=>Number(await box.getAttribute('width'))).toBeGreaterThan(before);
});
