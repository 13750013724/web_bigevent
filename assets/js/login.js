$(function () {
  // 点击"去注册账号"的链接
  $('#link_reg').click(function () {
    $('.login-box').hide()
    $('.reg-box').show()
  })

  //点击"去登录"的链接
  $('#link_login').click(function () {
    $('.reg-box').hide()
    $('.login-box').show()
  })

  //从 layui 中获取 from 对象
  let form = layui.form
  let layer = layui.layer

  //通过 form.verify() 函数自定义校验规则
  form.verify({
    //自定义了一个交pwd的校验规则
    pwd: [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'],
    //校验两次密码是否一致的规则
    repwd: function (value) {
      //通过形参拿到的是确认密码框中的内容
      //还需拿到密码框中的内容
      //然后进行一次等于的判断
      //如果判断失败,则return一个提示消息即可
      let pwd = $('.reg-box [name=password]').val()
      if (pwd != value) {
        return '两次密码不一致!'
      }
    }
  })

  //监听注册表的提交事件
  $('#form_reg').submit(function (e) {
    //1. 阻止默认的提交行为
    e.preventDefault()
    //2. 发起Ajax的POST请求
    let data = { username: $('.reg-box [name=username]').val(), password: $('.reg-box [name=password]').val() }
    $.post("/api/reguser", data,
      function (res) {
        if (res.status !== 0) {
          return layer.msg(res.message)
        }
        layer.msg('注册成功! 请登录')
        //注册成功后模拟人的点击自动跳转登录
        $('#link_login').click()
      }
    )
  })

  //监听登录表单的提交事件 实现方法1
  // $('#form_login').submit(function (e) {
  //   //阻止默认提交行为
  //   e.preventDefault()
  //   let data = $(this).serialize()
  //   $.post('/api/login', data,
  //     function (res) {
  //       if (res.status !== 0) {
  //         return layer.msg(res.message)
  //       }
  //       layer.msg('登录成功!')
  //       localStorage.setItem('token', res.token)
  //       location.href = '/index.html'
  //     })
  // })

  //监听登录表单的提交事件 实现方法2
  $('#form_login').submit(function (e) {
    //阻止默认提交行为
    e.preventDefault()
    $.ajax({
      url: "/api/login",
      method: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg(res.message)
        }
        layer.msg('登录成功!')
        console.log(res.token)
        //将登录成功得到的 token 字符串,保持到localStorage中
        localStorage.setItem('token', res.token)
        location.href = '/index.html'
      }
    });
  })

})