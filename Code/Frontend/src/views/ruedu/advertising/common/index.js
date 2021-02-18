import { MessageBox, Message } from 'element-ui'

export function alertMessage(res) {
  if (res.data.fail.length) {
    let str = ''
    res.data.fail.forEach(item => {
      str += `<div>${item.product_id}: ${item.message}</div>`
    })
    MessageBox({
      title: '提示',
      message: str,
      dangerouslyUseHTMLString: true,
      type: 'error',
    })
  } else {
    Message({
      type: 'success',
      message: res.message,
    })
  }
}
