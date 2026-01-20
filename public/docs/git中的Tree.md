## Git中的Tree对象



*Tree是一种用于组织和存储文件文件名及其结果的对象，UNIX文件系统中的目录。*

它通过关联文件名和文件内容的哈希值来实现文件的管理

Tree对象可以包含多个记录，每条记录指向一个Blob对象或子Tree对象（子目录）

### Tree的作用

Tree对象主要用于解决文件名保存的问题，并允许将多个文件组织在一起。它是git版本库中记录项目快照的核心部分。每次提交时，Git会根据暂存区的内容生成一个新的Tree对象，表示当前项目的文件结构和状态。

**创建Tree对象的步骤**

1.初始化版本库：使用git init创建一个新的git仓库

2.添加文件倒版本库：通过git hash-object-w文件名 将文件内容存储为Blob对象

3.将文件暂存添加到暂存区：使用git update-index命令将文件的索引信息引入暂存区

4.生成Tree对象：通过git write-tree命令将暂存区的内容提交到版本库，生成一个新的Tree对象。



创建文件并存储为 Blob 对象

echo "version 1" > test.txt
git hash-object -w test.txt

将文件添加到暂存区

git update-index --add --cacheinfo 100644 <Blob对象的SHA-1> test.txt

生成 Tree 对象

git write-tree



#### Tree对象的结构

1.文件模式：如100644表示普通文件，100755表示可执行文件

2.对象类型：可以是Blob（文件）或Tree（子目录）

3.SHA-1指针：指向文件内容或子目录

4.文件或目录的名称

通过 *git cat-file -p <Tree对象的SHA-1>* 可以查看 Tree 对象的内容。例如：

![image-20251026202044477](C:\Users\45379\AppData\Roaming\Typora\typora-user-images\image-20251026202044477.png)

#### Tree对象的特点:

Tree对象可以关联文件名和文件内容的哈希值

它支持嵌套结构，允许子目录的存在

每次提交生成的Tree对象表示目录的一个快照。



**常用命令：**

*git update-index --add*：将文件索引存入暂存区

*git write-tree*：生成Tree对象

*git ls-files -s*：查看暂存区的文件信息

*git cat-file -t <SHA-1>*：查看对象类型

*git cat-file -p <SHA-1>*：查看对象内容

