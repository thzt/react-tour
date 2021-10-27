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

其他目录介绍  
  
（1）`build/`  
React v17.0.2 的构建产物目录，用于提供 github 链接展示
  
（2）`example-project/`  
一个极简的 React 示例项目，用于调试 React 代码用  
  
（3）`tool/`  
+ **link.bash**：用于将 `example-project` 中对 react 和 react-dom 的依赖，改成指向 React 的构建产物
+ **print.js**：用于对 code tour 中的 title 进行缩进显示