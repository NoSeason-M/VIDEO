// generate-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import pngToIco from 'png-to-ico';

// 配置项 - 不用改
const INPUT_PNG = './icon.png'; // 你的1024x1024原图路径
const OUTPUT_DIR = './build/icons';
const OUTPUT_ICO = path.join(OUTPUT_DIR, 'icon.ico');

// 生成包含所有标准尺寸的ICO文件
async function generateIcon() {
  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(INPUT_PNG)) {
      console.error('❌ 错误：找不到根目录下的 icon.png 文件');
      console.log('请把你的1024x1024 PNG图标命名为 icon.png 放到项目根目录');
      process.exit(1);
    }

    // 创建输出目录
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('🔄 正在生成Windows标准多尺寸ICO文件...');
    console.log('   包含尺寸：16x16, 32x32, 48x48, 64x64, 128x128, 256x256');

    // 生成ICO文件（自动包含所有标准尺寸）
    const buffer = await pngToIco(INPUT_PNG);
    
    // 写入文件
    fs.writeFileSync(OUTPUT_ICO, buffer);

    console.log(`✅ 生成成功！文件已保存到：${OUTPUT_ICO}`);
    console.log('🎉 现在可以直接执行 npm run build 打包了');
  } catch (error) {
    console.error('❌ 生成失败：', error.message);
    process.exit(1);
  }
}

generateIcon();