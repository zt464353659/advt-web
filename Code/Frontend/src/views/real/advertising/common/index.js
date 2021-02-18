import Vue from 'vue'
import { MessageBox } from 'element-ui'

/**
 * 下架弹出框
 * @param res 下架后端返回数据
 * @param nextFun 确定后执行代码
 */
export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  Vue._.forEach(res.data, item => {
    if (/成功/g.test(item.message)) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>`
    }
    msg.text += `<span style="padding-left:10px">${item.istore_product_id}</span><span style="padding-left:5px">${item.message}</span><br/>`
  })
  MessageBox.alert(msg.text, '执行结果', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
    callback: action => {
      if (nextFun) {
        nextFun()
      }
      document.body.classList.remove('el-popup-parent--hidden')
    }
  })
}

/**
 * 指定价、指定库存 弹出框
 * @param res 下架后端返回数据
 * @param nextFun 确定后执行代码
 */
// export function customAlert(res, nextFun) {
//   let msg = ''
//   Vue._.forEach(res.data, item => {
//     msg += `<div>${item}</div>`
//   })
//   MessageBox.alert(msg, '执行结果', {
//     confirmButtonText: '确定',
//     dangerouslyUseHTMLString: true,
//     callback: action => {
//       if (nextFun) {
//         nextFun()
//       }
//       document.body.classList.remove('el-popup-parent--hidden')
//     }
//   })
// }
export function customAlert(res, nextFun) {
  const msg = { text: '', status: false }
  const list = res.length ? res : res.data
  Vue._.forEach(list, item => {
    if (item.status) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>`
    }
    msg.text += `<span style="padding-left:10px">${item.message}</span><br/>`
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
