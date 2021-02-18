<template>
  <el-dialog
    :title="dialogTitle"
    class="dialog-add-upload-plan create-voucher"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    @open="onOpen"
    width="800px"
    v-dragMove
  >
    <div class="main">
      <el-form ref="formData" :model="listQuery" label-width="120px" :rules="rules" size="mini" @submit.native.prevent :disabled="readonly && !copy">
        <span class="label-name">基本信息</span>
        <div class="form-wapper">
          <el-form-item label="优惠券类型">
            <span>商店礼券</span>
          </el-form-item>
          <el-form-item label="站点" prop="site">
            <el-select style="width: 381px" v-model="listQuery.site" @change="siteChange">
              <el-option
                v-for="item in siteArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账号" prop="account_list">
            <el-select style="width: 381px" v-model="listQuery.account_list" multiple @focus="siteFocus" :ref="'site_input'" class="site_input" @change="changeSite">
              <el-option
                v-for="item in acountArrNew"
                :key="item.value"
                :label="item.account"
                :value="item.account"
              />
            </el-select>
            <el-checkbox
              v-model="checkedAll"
              @change="selectAllSite"
            >
              全选
            </el-checkbox>
          </el-form-item>
          <el-form-item label="领取期限" prop="claimPeriod">
            <el-date-picker
              v-model="listQuery.claimPeriod"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 381px"
              @change="timeChange"
              value-format="timestamp"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <span class="label-name">奖励设置</span>
        <div class="form-wapper">
          <el-form-item label="奖励设置">
            <span>折扣</span>
          </el-form-item>
          <el-form-item label="折扣类型" class="type" prop="discount_type">
            <el-select style="width: 150px;margin-right: 4px;" v-model="listQuery.discount_type">
              <el-option
                v-for="item in typeArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-form-item prop="discount_value" style="margin-bottom: 0" v-if="listQuery.discount_type === '1'">
              <el-input style="width: 227px;" v-model="listQuery.discount_value" placeholder="对应站点币种" @blur="fixedMoneyBlur" />
            </el-form-item>
            <el-form-item prop="discount_value" style="margin-bottom: 0" v-if="listQuery.discount_type === '2'">
              <el-input style="width: 227px;" v-model="listQuery.discount_value" placeholder="对应站点币种" />
              <span v-if="this.listQuery.site !== 'TW' && this.listQuery.site !== 'tw'">%</span>
              <span v-else>折</span>
            </el-form-item>
          </el-form-item>
          <el-form-item label="最高折扣价" class="type" prop="has_max_discount" v-if="listQuery.discount_type === '2'">
            <el-select style="width: 150px;margin-right: 4px;" v-model="listQuery.has_max_discount">
              <el-option
                v-for="item in highPriceArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-form-item prop="max_discount" style="margin-bottom: 0" v-if="listQuery.has_max_discount === '1'">
              <el-input style="width: 227px;" v-model="listQuery.max_discount" placeholder="对应站点币种" />
            </el-form-item>
          </el-form-item>
          <el-form-item label="最低购物金额" class="money" prop="min_money">
            <el-input style="width: 381px" v-model="listQuery.min_money" placeholder="对应站点币种" @blur="fixedMoneyBlur" />
          </el-form-item>
          <el-form-item label="优惠券数量" prop="coupon_num">
            <el-input style="width: 381px" v-model="listQuery.coupon_num" placeholder="可领取的优惠券总数" />
          </el-form-item>
        </div>
        <span class="label-name">优惠券显示和适用产品</span>
        <div class="form-wapper">
          <el-form-item label="优惠券显示设置">
            <span>在所有页面上显示</span>
          </el-form-item>
          <el-form-item label="适用产品">
            <span>所有产品</span>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!readonly || copy">
        <el-button size="mini" @click="onCancel">取 消</el-button>
        <el-button size="mini" type="primary" @click="onConfirm('formData')">确 定</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button size="mini" @click="onCancel">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { voucherAdd, voucherAccount, getVoucherDetail, voucherCopy } from '@/api/shopee'

export default {
  data() {
    //折扣类型固定金额 最高折扣价校验规则
    let fixedMoneyRule = (rule, value, callback) => {
      if (this.listQuery.discount_type === '1' || this.listQuery.has_max_discount === '1') {
        if (!value) {
          return callback(new Error('请输入'))
        }
        if (!Number(value)) {
          callback(new Error('请输入正确的数字'))
          return
        }
        let dotNumber = value.toString().includes('.') ? value.toString().split('.')[1].length : 0 // 判断小数位数
        if (this.listQuery.site === 'MY' || this.listQuery.site === 'SG' || this.listQuery.site === 'br') {
          if (dotNumber >= 3) {
            return callback(new Error('只能输入两位小数'))
          } else {
            if (value < 0.10 || value > 1000000000) {
              return callback(new Error('请输入0.10-1000000000.00之间的数值'))
            }
            callback()
          }
        } else {
          if (dotNumber !== 0) {
            return callback(new Error('只能输入整数'))
          }
          if (this.listQuery.site === 'TH' || this.listQuery.site === 'ID') {
            if (value < 1 || value > 1000000000) {
              return callback(new Error('请输入1-1000000000之间的数值'))
            }
            callback()
          } else if (this.listQuery.site === 'PH') {
            if (value < 5 || value > 1000000) {
              return callback(new Error('请输入5-1000000之间的数值'))
            }
            callback()
          } else if (this.listQuery.site === 'VN') {
            if (value < 1000 || value > 120000000) {
              return callback(new Error('请输入1000-120000000之间的数值'))
            }
            callback()
          } else if (this.listQuery.site === 'TW') {
            if (value < 1 || value > 499999) {
              return callback(new Error('请输入1-499999之间的数值'))
            }
            callback()
          }
        }
      } else { // 折扣类型按百分比校验规则
        if (!value) {
          return callback(new Error('请输入数字'))
        }
        if (!Number(value)) {
          callback(new Error('请输入正确的数字'))
          return
        }
        let dotNumber = value.toString().includes('.') ? value.toString().split('.')[1].length : 0 // 判断小数位数
        if (this.listQuery.site === 'TW') {
          if (value < 3 || value > 9.9) {
            return callback(new Error('请输入3-9.9之间的数值'))
          }
          callback()
        } else {
          if (dotNumber !== 0) {
            return callback(new Error('只能输入整数'))
          }
          if (value < 1 || value > 70) {
            return callback(new Error('请输入1-70之间的数值'))
          }
          callback()
        }
      }
    }
    //折扣类型按百分比校验规则
    // let percentageRule = (rule, value, callback) => {

    // }
    //最低购物金额校验规则
    let moneyLowRule = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入'))
      }
      if (!Number(value) && Number(value) !== 0) {
        callback(new Error('请输入正确的数字'))
        return
      }
      let dotNumber = value.toString().includes('.') ? value.toString().split('.')[1].length : 0 // 判断小数位数
      if (this.listQuery.site === 'MY' || this.listQuery.site === 'SG' || this.listQuery.site === 'br') {
        if (dotNumber >= 3) {
          return callback(new Error('只能输入两位小数'))
        } else {
          if (value < 0.00 || value > 1000000000) {
            return callback(new Error('请输入0.00-1000000000.00之间的数值'))
          }
          callback()
        }
      } else {
        if (dotNumber !== 0) {
          return callback(new Error('只能输入整数'))
        }
        if (this.listQuery.site === 'TH' || this.listQuery.site === 'ID') {
          if (value < 0 || value > 1000000000) {
            return callback(new Error('请输入0-1000000000之间的数值'))
          }
          callback()
        } else if (this.listQuery.site === 'PH') {
          if (value < 0 || value > 1000000) {
            return callback(new Error('请输入0-1000000之间的数值'))
          }
          callback()
        } else if (this.listQuery.site === 'VN') {
          if (value < 0 || value > 120000000) {
            return callback(new Error('请输入0-120000000之间的数值'))
          }
          callback()
        } else if (this.listQuery.site === 'TW') {
          if (value < 0 || value > 499999) {
            return callback(new Error('请输入0-499999之间的数值'))
          }
          callback()
        }
      }
    }
    //优惠券数量校验规则
    let couponsNumberRule = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入优惠券数量'))
      }
      if (!Number(value)) {
        callback(new Error('请输入正确的数字'))
        return
      }
      let dotNumber = value.toString().includes('.') ? value.toString().split('.')[1].length : 0 // 判断小数位数
      if (dotNumber !== 0) {
        return callback(new Error('只能输入整数'))
      }
      if (value < 1 || value > 200000) {
        return callback(new Error('请输入1-200000之间的数值'))
      }
      callback()
    }

    return {
      dialogTitle: '',
      checkedAll: false,
      fixedMoneyConfirm: false,
      oneHour: 1 * 60 * 60 * 1000,
      siteArr: [
        { value: 'MY', label: 'MY' },
        { value: 'SG', label: 'SG' },
        { value: 'TH', label: 'TH' },
        { value: 'PH', label: 'PH' },
        { value: 'ID', label: 'ID' },
        { value: 'VN', label: 'VN' },
        { value: 'TW', label: 'TW' },
        { value: 'br', label: 'BR' }
      ],
      highPriceArr: [
        { value: '1', label: '设置金额' },
        { value: '0', label: '没有限制' }
      ],
      acountArrNew: [],
      acountArr: [],
      typeArr: [
        { value: '1', label: '固定金额' },
        { value: '2', label: '按百分比' }
      ],
      listQuery: {
        has_max_discount: '0',
        site: 'MY',
        account_list: [],
        discount_type: '1',
        max_discount: '',
        discount_value: '',
        coupon_start_date: '',
        coupon_end_date: '',
        min_money: '',
        coupon_num: '',
        claimPeriod: []
      },
      rules: {
        site: { required: true, message: '请选择站点', trigger: 'change' },
        account_list: { required: true, message: '请选择账号', trigger: 'change' },
        claimPeriod: { required: true, message: '请选择领取期限', trigger: 'change' },
        discount_type: { required: true, message: '请选择折扣类型', trigger: 'change' },
        min_money: { required: true, validator: moneyLowRule, trigger: 'blur' },
        coupon_num: { required: true, validator: couponsNumberRule, trigger: 'blur' },
        has_max_discount: { required: true, message: '请选择最低购物金额', trigger: 'change' },
        discount_value: { validator: fixedMoneyRule, trigger: 'blur' },
        max_discount: { validator: fixedMoneyRule, trigger: 'blur' }
      },
      pickerOptions: {
        // 选中日期后会执行的回调，只有当 daterange 或 datetimerange 才生效
        onPick: ({ maxDate, minDate }) => {
          this.pickerMinDate = minDate.getTime()
          if (maxDate) {
            this.pickerMinDate = ''
          }
        },
        disabledDate: (currentTime) => { // 禁用时间段
          const day1 = 3600 * 1000 * 24 * 1
          if (this.pickerMinDate) { // 如果已经选中了第一个点的时间
            const day90 = 3600 * 1000 * 24 * 90
            const day1 = 3600 * 1000 * 24 * 1
            let afterTime = this.pickerMinDate + day90
            // 禁用选中第一个时间的后90天（选择第一个点后才开启禁用）
            return currentTime.getTime() > afterTime || currentTime.getTime() + day1 < new Date()
          }
          // 禁用当前时间之前的日期 （加载组件就会开启禁用）
          return currentTime.getTime() + day1 < new Date()
        }
      }
    }
  },
  computed: {},
  props: {
    open: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      required: true,
      default: false
    },
    copy: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
  },
  methods: {
    selectAllSite() {
      let selector = '.site_input .el-input__inner'
      document.querySelector(selector).focus()
      this.listQuery.account_list = []
      if (this.checkedAll) {
        this.acountArrNew.map((item) => {
          this.listQuery.account_list.push(item.account)
        })
      } else {
        this.listQuery.account_list = []
      }
    },
    async onOpen() {
      await this.getVoucherAccount()
      this.readonly && !this.copy ? this.dialogTitle = '优惠券详情' : this.copy ? this.dialogTitle = '复制优惠券' : this.dialogTitle = '创建优惠券'
      if (this.readonly || this.copy) {
        await this.getVoucherDetails()
      } else {
        // 领取期限开始结束时间要大于1小时
        let startDate = new Date(new Date().setMinutes(new Date().getMinutes() + 10)).getTime()
        let oneHourLater = new Date(new Date().setHours(new Date().getHours() + 1))
        let endDate = new Date(oneHourLater.setMinutes(oneHourLater.getMinutes() + 10)).getTime()
        this.listQuery['claimPeriod'] = []
        this.listQuery.claimPeriod[0] = startDate
        this.listQuery.claimPeriod[1] = endDate
      }
      this.siteFocus()
      this.changeSite()
    },
    async getVoucherDetails() { // 查看详情
      try {
        const res = await getVoucherDetail({ id: this.data.id })
        res.data['claimPeriod'] = []
        this.listQuery = { ...res.data }
        this.listQuery.site = res.data.site.toUpperCase()
        this.listQuery.account_list = res.data.account_list.split(',')
        if (this.copy) {
          let startDate = new Date(new Date().setMinutes(new Date().getMinutes() + 10)).getTime()
          let oneHourLater = new Date(new Date().setHours(new Date().getHours() + 1))
          let endDate = new Date(oneHourLater.setMinutes(oneHourLater.getMinutes() + 10)).getTime()
          this.listQuery.claimPeriod = [startDate, endDate]
        } else {
          this.listQuery.claimPeriod = [new Date(this.listQuery.coupon_start_date).getTime(), new Date(this.listQuery.coupon_end_date).getTime()]
        }
      } catch (error) {
      }
    },
    changeSite() {
      if (this.listQuery.account_list.length !== this.acountArrNew.length) {
        this.checkedAll = false
      } else {
        this.checkedAll = true
      }
    },
    siteFocus() { // 根据站点过滤账号
      this.acountArrNew = this.acountArr.filter(e => this.listQuery.site.toLowerCase() === e.site_tag)
    },
    async getVoucherAccount() { // 获取账号
      const res = await voucherAccount()
      this.acountArr = res.data
    },
    siteChange() {  // 切换站点,清空折扣类型、最低购物金额、最高折扣价字段
      this.listQuery.discount_type = '1'
      this.listQuery.discount_value = ''
      this.listQuery.has_max_discount = '0'
      this.listQuery.max_discount = ''
      this.listQuery.min_money = ''
      this.listQuery.account_list = []
      this.checkedAll = false
    },
    fixedMoneyBlur() { //校验固定金额不能超过最低购物金额的70%
      if (this.listQuery.min_money !== '' && this.listQuery.discount_type === '1') {
        if (this.listQuery.min_money * 0.7 <= this.listQuery.discount_value) {
          this.$message.warning('固定金额不能超过最低购物金额的70%')
          this.fixedMoneyConfirm = true
        } else {
          this.fixedMoneyConfirm = false
        }
      }
    },
    timeChange(time) { // 领取期限变更
      if (time === [] || time === null || time === undefined) return
      this.listQuery.claimPeriod = []
      this.listQuery.claimPeriod[0] = time[0]
      this.listQuery.claimPeriod[1] = time[1]
      if (this.listQuery.claimPeriod[1] - this.listQuery.claimPeriod[0] < this.oneHour) {
        this.$message.warning('开始时间和结束时间最短不能少于1小时')
      }
    },
    onConfirm(formName) { // 确认
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.listQuery.claimPeriod[1] - this.listQuery.claimPeriod[0] < this.oneHour) {
            this.$message.warning('开始时间和结束时间最短不能少于1小时')
            return
          } else if (this.fixedMoneyConfirm) {
            this.$message.warning('固定金额不能超过最低购物金额的70%')
            return
          } else {
            if (this.listQuery.discount_type === '1') { // 固定金额清除最高价
              this.listQuery.has_max_discount = ''
              this.listQuery.max_discount = ''
            }
            this.listQuery.site = this.listQuery.site.toLowerCase()
            this.listQuery.coupon_start_date = this.formatDate(this.listQuery.claimPeriod[0])
            this.listQuery.coupon_end_date = this.formatDate(this.listQuery.claimPeriod[1])
            this.listQuery.account_list = this.listQuery.account_list.toString()
            if (this.copy) {
              this.listQuery.coupon_code = this.data.coupon_code
              this.listQuery.coupon_name = this.data.coupon_name
              this.listQuery.coupon_type = this.data.coupon_type
              this.listQuery.copy_id = this.data.id
              voucherCopy(this.listQuery).then((res) => {
                this.listQuery.site = this.listQuery.site.toUpperCase()
                this.listQuery.account_list = this.listQuery.account_list.split(',')
                this.$refs['formData'].resetFields()
                this.$emit('update:data', {})
                this.$emit('update:open', false)
                this.$emit('close')
              }).catch(e => {
              })
            } else {
              voucherAdd(this.listQuery).then((res) => {
                this.listQuery.site = this.listQuery.site.toUpperCase()
                this.listQuery.account_list = this.listQuery.account_list.split(',')
                this.$refs['formData'].resetFields()
                this.$emit('update:data', {})
                this.$emit('update:open', false)
                this.$emit('close')
              }).catch(e => {
              })
            }
          }
        }
      })
    },
    onCancel() { // 取消
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    onClose() {
      this.listQuery = {
        has_max_discount: '0',
        site: 'MY',
        account_list: [],
        discount_type: '1',
        max_discount: '',
        discount_value: '',
        coupon_start_date: '',
        coupon_end_date: '',
        min_money: '',
        coupon_num: '',
        claimPeriod: []
      }
      this.checkedAll = false
      this.dialogTitle = ''
      this.$refs['formData'].resetFields()
      this.$emit('update:data', {})
      this.$emit('update:open', false)
    },
    formatDate(dateVal) { // 时间戳转时间
      let date = new Date(dateVal)
      let Y = date.getFullYear() + '-'
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      let D = date.getDate() + 1 < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
      let h = date.getHours() + 1 < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
      let m = date.getMinutes() + 1 < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':'
      let s = date.getSeconds() + 1 < 10 ? '0' + date.getSeconds() : date.getSeconds()
      return Y + M + D + h + m + s
    }
  }
}
</script>
<style lang="scss" scoped>
.label-name {
  font-size: 16px;
  font-weight: 600;
  padding-left: 15px;
}

.form-wapper {
  padding: 18px 0 18px 90px;
}

.dialog-footer {
  float: right;
  padding-right: 24px;
}

.type {
  // margin-bottom: 0;
}
</style>
<style lang="scss">
.type {
  /*deep*/
  .el-form-item__content {
    display: flex !important;
  }
}

.create-voucher {
  /*deep*/
  .el-dialog {
    margin-top: 7vh !important;
  }
}
</style>
