# 自动创建软链接

echo '打印目录'
echo $ReactProject
echo $ExampleProject
echo 'done'
echo ''

# 替换 ExampleProject 的依赖为 ReactProject 的构建产物
echo '删除依赖'
rm -rf $ExampleProject/node_modules/react
rm -rf $ExampleProject/node_modules/react-dom
echo 'done'
echo ''

echo '创建软链接'
ln -s $ReactProject/build/node_modules/react $ExampleProject/node_modules/react
ln -s $ReactProject/build/node_modules/react-dom $ExampleProject/node_modules/react-dom
ln -s $ExampleProject $ReactProject/example-project
echo 'done'
echo ''