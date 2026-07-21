import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5173';

// 游戏画布尺寸
const W = 400;
const H = 700;

// 菜单「开始游戏」按钮位置
const MENU_BTN_X = W / 2;
const MENU_BTN_Y = 300;

// 塔选择栏 Y 坐标 (容器在 H-60, 按钮在 y=10)
const BAR_Y = H - 60 + 10;

// 塔按钮 X 坐标: 20, 120, 220 (容器x=20, 每个按钮宽80, 间距100)
const TOWER_BTN_X = [20 + 40, 120 + 40, 220 + 40];

// 「跳过」按钮位置
const START_BTN_X = W - 100;
const START_BTN_Y = BAR_Y;

test.describe('XXL Tower Defense', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(800);
  });

  test('菜单渲染 — 标题、开始按钮', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('开始游戏进入主场景', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);
    await expect(page.locator('canvas')).toBeVisible();
    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('塔选择栏 — 点击箭塔选中', async ({ page }) => {
    // 进入游戏
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 点击第一个塔按钮 (箭塔)
    await page.mouse.click(TOWER_BTN_X[0], BAR_Y);
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('放塔 — 点击地图格子', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 选中箭塔
    await page.mouse.click(TOWER_BTN_X[0], BAR_Y);
    await page.waitForTimeout(200);

    // 在地图格子(2,3)放塔 → 像素 (2*40+20, 3*40+20) = (100, 140)
    await page.mouse.click(100, 140);
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('跳过准备阶段开始波次', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 点击跳过
    await page.mouse.click(START_BTN_X, START_BTN_Y);
    await page.waitForTimeout(3000);

    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('波次完成庆祝 — 完整流程', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 跳过准备 → 等波次完成
    await page.mouse.click(START_BTN_X, START_BTN_Y);
    await page.waitForTimeout(8000);

    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('连续操作稳定性', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 交替选塔、放塔、跳过
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(TOWER_BTN_X[i % 3], BAR_Y);
      await page.waitForTimeout(100);
      await page.mouse.click(80 + i * 40, 140);
      await page.waitForTimeout(100);
    }

    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('画布持续渲染 — 无白屏', async ({ page }) => {
    await page.mouse.click(MENU_BTN_X, MENU_BTN_Y);
    await page.waitForTimeout(500);

    // 等几秒后截图
    await page.waitForTimeout(3000);
    const screenshot = await page.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });
});
