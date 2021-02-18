import { MessageBox, Message } from 'element-ui'
import Vue from 'vue'

export function alertMessage(res) {
  if (res.data.fail.length) {
    let str = ''
    res.data.fail.forEach(item => {
      str += `<div>${item.istore_product_id}:${item.message}</div>`
    })
    return MessageBox({
      title: '提示',
      message: str,
      dangerouslyUseHTMLString: true,
      type: 'error'
    })
  } else {
    Message({
      type: 'success',
      message: res.message
    })
  }
}

export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  const list = res.length ? res : res.data
  Vue._.forEach(list, item => {
    if (item.status) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>${item.istore_product_id}:`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>${item.istore_product_id}:`
    }
    msg.text += `<span >${item.message}</span><br/>`
  })
  MessageBox.alert(msg.text, '执行结果', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
    callback: action => {
      if (nextFun) {
        nextFun(msg.status)
      }
      document.body.classList.remove('el-popup-parent--hidden')
    }
  })
}
