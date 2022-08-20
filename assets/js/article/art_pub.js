$(function () {
  let id = getUrlParam('id')
  // let id = localStorage.getItem('data-id')

  var layer = layui.layer
  let form = layui.form

  initCate()

  // 初始化富文本编辑器
  initEditor()

  // 定义加载文章分类的方法
  function initCate() {
    $.ajax({
      type: "GET",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('初始化文章分类失败!')
        }
        // 调用模板引擎，渲染分类的下拉菜单
        let htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        // 一定要记得调用 form.render() 方法
        form.render()
      }
    })
  }

  // 1. 初始化图片裁剪器
  var $image = $('#image')

  // 2. 裁剪选项
  var options = {
    aspectRatio: 400 / 280,
    preview: '.img-preview'
  }

  // 3. 初始化裁剪区域
  $image.cropper(options)

  // 为选择封面的按钮,绑定点击事件处理函数
  $('#btnChooseImage').click(function () {
    $('#coverFile').click()
  });

  // 监听 coverFile 的 change 事件，获取用户选择的文件列表
  $('#coverFile').on('change', function (e) {
    // 获取到文件的列表数组
    let files = e.target.files
    // 判断用户是否选择了文件
    if (files.length === 0) {
      return layer.msg("请选择文件", { icon: 5 })
    }
    // console.log('files[0]:', files[0])
    // 根据文件，创建对应的 URL 地址
    let newImgURL = URL.createObjectURL(files[0])
    // console.log('newImgURL:', newImgURL)
    // 为裁剪区域重新设置图片
    $image
      .cropper('destroy') // 销毁旧的裁剪区域
      .attr('src', newImgURL) // 重新设置图片路径
      .cropper(options) // 重新初始化裁剪区域
  })

  let art_state = '已发布'

  // 为存为草稿按钮，绑定点击事件处理函数
  $('#btnSave2').click(function () {
    art_state = '草稿'
  })

  // 为表单绑定 submit 提交事件：
  $('#form-pub').submit(function (e) {
    // 1. 阻止表单的默认提交行为
    e.preventDefault();
    // 2. 基于 form 表单，快速创建一个 FormData 对象
    let fd = new FormData($(this)[0])
    // 3. 将文章的发布状态，存到 fd 中
    fd.append('state', art_state)
    // 4. 将封面裁剪过后的图片，输出为一个文件对象
    $image
      .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
        width: 400,
        height: 280
      })
      .toBlob(function (blob) {
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        // 5. 将文件对象，存储到 fd 中
        fd.append('cover_img', blob)

        // 6. 发起 ajax 数据请求
        // publishArticle(fd)
        if (id) {
          fd.append('Id', id)
          console.log('fd:', fd)
          publishArticle(fd, '/my/article/edit')
        } else {
          publishArticle(fd, '/my/article/add')
        }
      })
    // fd.forEach(function (v, k) {
    //   console.log(k, v)
    // })
  })

  // 定义一个发布文章的方法：
  function publishArticle(fd, url) {
    $.ajax({
      method: 'POST',
      url: url,
      data: fd,
      // 注意：如果向服务器提交的是 FormData 格式的数据，
      // 必须添加以下两个配置项
      contentType: false,
      processData: false,
      success: function (res) {
        layer.msg(res.msg)
        if (res.status !== 0) {
          return layer.msg(res.message, { icon: 5 })
        }
        layer.msg(res.message, { icon: 6 }, function () {
          // 提示框关闭后自哦动自动执行此函数
          // 跳转到文章列表
          // 获取父页面index.html中“文章列表”按钮标签
          // window.parent.document.getElementById("article-list").click();
          window.parent.setNavSelected('#article-list', '#article-pub')
          console.log(window.parent)
          location.href = '/article/art_list.html'
        })
        // layer.msg('操作成功！')
        // // window.parent.setNavSelected('#article-list', '#article-pub')
        // console.log(window.parent)
        // // 发布文章成功后，跳转到文章列表页面
        // location.href = '/article/art_list.html'
      }

    })
  }

  // 定义函数 用文章旧数据渲染页面  
  function getEditData() {
    $('.layui-card-header').html('修改文章')
    $.ajax({
      method: 'GET',
      url: `/my/article/get/${id}`,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg(res.msg)
        }
        form.val('formPublish', res.data)
        // console.log('res.data:', res.data)
        // console.log('content:', res.data.content)
        // newImgURL: blob:http://127.0.0.1:5500/717fd56e-a44c-47f0-bdef-69c7c276e767
        //  富文本赋值：tinyMCE.activeEditor.setContent(“需要添加的内容”); 富文本获取值：var richText = tinymce.get(“rich_body”).getContent(); 
        tinyMCE.activeEditor.setContent(res.data.content)

        // $image.cropper('destroy').attr("src", "http://www.liulongbin.top:3007" + res.data.cover_img).cropper(options)
        $image.cropper('destroy').attr("src", "http://127.0.0.1:3007" + res.data.cover_img).cropper(options)
      }
    })
  }
  // 根据id获取文章数据,并渲染到表单中
  if (id) {
    getEditData()
  }

  //获取url中的参数
  function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
  }


  // // 根据id获取文章数据,并渲染到表单中
  // if (id) {
  //   getEditData()
  // }

  // function getEditData() {
  //   $('.layui-card-header').html('修改文章')
  //   $.ajax({
  //     method: 'GET',
  //     url: "/my/article/" + id,
  //     success: function (res) {
  //       console.log(res);
  //       if (res.status !== 0) {
  //         return layer.msg(res, message, { icon: 5 })
  //       }
  //       // 拼接服务器中的图片地址
  //       $image
  //         .cropper("destroy") // 销毁旧的裁剪区域
  //         .attr("src", "http://www.liulongbin.top:3007" + res.data.cover_img) // 重新设置图片路径
  //         .cropper(options); // 重新初始化裁剪区域
  //       // 3).给表单赋值(layui中可以一键赋值)
  //       form.val('formPublish', res.data)
  //     }
  //   })
  // }
})