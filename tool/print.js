// tour 文件的格式变换
// 用于：【4.1.1 组件加载过程：函数组件（全流程）】.tour

// 还原
// '____[2] func' -> '2.func'
const restore = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(fileContent);

  json.steps.forEach(step => {
    const { title } = step;
    const regExp = /^_*\[(\d+)\] (.+)$/;
    const match = regExp.exec(title);

    const [, tabs, name] = match;
    step.title = `${tabs}.${name}`;
  });

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
};

// 增加缩进
// '2.func' -> '____[2] func'
const print = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(fileContent);

  json.steps.forEach(step => {
    const { title } = step;
    const regExp = /^(\d+)\.(.+)$/;
    const match = regExp.exec(title);
    if (match == null) {
      debugger
      throw new Error(`not match: ${title}`);
    }

    const [, tabs, name] = match;
    step.title = `${Array(tabs * 4 + 1).join('_')}[${tabs}] ${name}`;

    // warn: print 会删除 selection 配置
    delete step.selection;
  });

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
};