import Vue from 'vue'
import { MessageBox, Message } from 'element-ui'

export function alertMessage(res) {
  if (res.data.fail.length) {
    let str = ''
    res.data.fail.forEach(item => {
      str += `<div>${ item.product_id }:  ${ item.message }</div>`
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

export function customSetMessage(res) {
  if (res.data.length) {
    let str = ''
    res.data.forEach(item => {
      if (item.status) {
        str += `<div><i class="el-icon-success" style="color: #67C23A;"></i>${ item.product_id }: ${ item.message }</div>`
      } else {
        str += `<div><i class="el-icon-error" style="color: #F56C6C;"></i>${ item.product_id }: ${ item.message }</div>`
      }
    })
    return MessageBox({
      title: '提示',
      message: str,
      dangerouslyUseHTMLString: true
    })
  }
}

export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  const list = res.length ? res : res.data
  Vue._.forEach(list, item => {
    if (item.status) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>`
    }
    msg.text += `<span style="padding-left:10px">ID:${ item.istore_product_id } ${ item.message }</span><br/>`
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
