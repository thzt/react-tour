### react-tour

下载 React v17.0.2 源码，直接将以下三个文件（目录）拷贝过去 覆盖即可

（1）`package.json`
+ 增加了 `debug-build` npm scripts

（2）`.vscode/` VSCode 的调试配置  
+ **Debug Build**：调用 `debug-build` npm scripts 调试 React `yarn build` 的过程
+ **Debug React**：用 VSCode 打开 Chrome，调试 React 代码（需提前做好 [环境准备](https://www.jianshu.com/p/52f4e435eba2)）

（3）`.tour/` 源码阅读记录  
需要下载 VSCode 插件 [CodeTour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour)

- - -

当前仓库中，还包含了 React v17.0.2 的构建产物目录 `build/`，用于提供 github 链接用来展示。