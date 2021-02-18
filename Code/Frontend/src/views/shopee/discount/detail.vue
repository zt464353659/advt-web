<!--
 * @Author: zhangzhengzhe
 * @Date: 2019-06-03 09:49:44
 * @LastEditors: zhangzhengzhe
 * @LastEditTime: 2019-06-05 15:57:14
 -->
<template>
  <div>
    <!--头部-->
    <div class="header-box">
      <el-row v-if="isEdit" class="nextActivate">
        <span class="textData">{{ detail.name }}</span>
        <span v-if="detail.status === 1">接下来活动</span>
        <span v-if="detail.status === 2">进行中活动</span>
        <span v-if="detail.status === 3">过期活动</span>
        <span class="countdown" v-if="detail.status === 1">开始倒计时</span>
        <span class="countdown" v-if="detail.status === 2">结束倒计时</span>
        <span class="countdown" v-if="detail.status !== 3">
          ：<span class="countdown" v-if="time_diff.month">{{ `${time_diff.month}月` }}</span>
          <span class="countdown" v-if="time_diff.day">{{ `${time_diff.day}日` }}</span>
          <span class="countdown" v-if="time_diff.hour">{{ `${time_diff.hour}时` }}</span>
          <span class="countdown" v-if="time_diff.minute">{{ `${time_diff.minute}分` }}</span>
        </span>
      </el-row>
      <el-row v-if="isEdit" class="nextActivate">
        <span class="activateTime">活动时间：
          <span v-if="detail.start_time">{{ parseInt(detail.start_time) | moment('YYYY-MM-DD HH:mm') }}</span> --
          <span v-if="detail.end_time">{{ parseInt(detail.end_time) | moment('YYYY-MM-DD HH:mm') }}</span>
        </span>
        <span v-if="detail.status !== 3 && $route.params.is_clear_stocks !== '1' && $route.params.is_clear_stocks !== '2'" class="editActivate" @click="editDiscount(detail.end_time)"><i class="el-icon-edit"></i> 编辑折扣活动</span>
      </el-row>
      <el-row v-if="!isEdit" style="position: relative;">
        <el-form ref="editForm" :model="editForm" :rules="rules" :inline="true" size="mini" class="discountName">
          <el-form-item class="form-padding" label="折扣活动名称：" prop="discount_name" style="width: 100%">
            <el-input size="mini" type="" v-model="editForm.discount_name"></el-input>
          </el-form-item>
          <el-form-item label="折扣活动时间：" prop="discount_time" style="height:50px;">
            <el-date-picker v-if="detail.status === 1"
                            v-model="editForm.start_time"
                            type="date"
                            :picker-options="pickerStartOptions"
                            value-format="yyyy-MM-dd"
                            size="mini"
                            :disabled="time_disabled"
                            class="data-picker"
                            @change="selectDateStart"
                            placeholder="开始日期"
            >
            </el-date-picker>
            <el-date-picker v-if="detail.status === 2"
                            v-model="editForm.start_time"
                            type="date"
                            :picker-options="pickerStartOptions"
                            value-format="yyyy-MM-dd"
                            size="mini"
                            :disabled="true"
                            class="data-picker"
                            @change="selectDateStart"
                            placeholder="开始日期"
            >
            </el-date-picker>至
            <el-date-picker
              v-model="editForm.end_time"
              type="date"
              :picker-options="pickerEndOptions"
              value-format="yyyy-MM-dd"
              size="mini"
              :disabled="time_disabled"
              class="data-picker"
              @change="selectDateEnd"
              placeholder="结束日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="activity_time" style="height: 50px;">
            <el-time-select v-if="detail.status === 1"
                            placeholder="起始时间"
                            v-model="formData.start_time"
                            size="mini"
                            :disabled="time_disabled"
                            @change="startTimeChange"
                            value-format="HH-mm"
                            :picker-options="start_time_options" style="width: 40%"
            >
            </el-time-select>
            <el-time-select v-if="detail.status === 2"
                            placeholder="起始时间"
                            v-model="formData.start_time"
                            size="mini"
                            :disabled="true"
                            @change="startTimeChange"
                            value-format="HH-mm"
                            :picker-options="start_time_options" style="width: 40%"
            >
            </el-time-select>
            <el-time-select
              placeholder="结束时间"
              v-model="formData.end_time"
              size="mini"
              :disabled="time_disabled"
              @change="clearStartData"
              value-format="HH-mm"
              :picker-options="end_time_options" style="width: 40%"
            >
            </el-time-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" @click="editTopSave(editForm)">保存</el-button>
            <el-button size="mini" @click.stop="cancleHandleDiscount">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Product ID" prop="product_id">
          <el-input v-model="listQuery.product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="product_name">
          <el-input v-model="listQuery.product_name" clearable placeholder="关键字搜索"></el-input>
        </el-form-item>
        <el-form-item class="btn-form-item">
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="updateAdvt && detail.status !== 3 && $route.params.is_clear_stocks !== '1'" class="header-box">
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="updateDiscount">更新折扣活动</el-button>
      </el-row>
    </div>
    <div v-if="!updateAdvt" class="header-box">
      <el-row style="text-align: right">
        <el-form :inline="true" size="mini">
          <el-form-item label="折扣率">
            <el-input size="mini" style="width: 60px" v-model="discount_rate"></el-input>
            <span> %</span>
          </el-form-item>
          <el-form-item label="限购数量">
            <el-input size="mini" style="width: 60px" v-model="purchase_limit"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" @click="updateAll('all')">更新所有广告</el-button>
          <el-button size="mini" :disabled="setPriceArr.length === 0" @click="updateAll('select')">更新勾选广告</el-button>
        </el-form>
        <el-button size="mini" @click="updateDiscount">退出编辑状态</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-row v-if="!updateAdvt" class="right-row">
        <el-button size="mini" type="primary" @click="newAdvertisement">新增广告</el-button>
        <el-button size="mini" type="danger" :disabled="setPriceArr.length === 0" @click="deleteDiscountAdvt(setPriceArr, 'all')">批量移除</el-button>
      </el-row>
      <el-table :data="listData"
                ref="table"
                v-loading="listLoading"
                :key="newDate"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                highlight-current-row
                default-expand-all
                @current-change="handleCurrentChange1"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.child_product">
              <el-table-column prop="istore_product_id" label="产品ID"></el-table-column>
              <el-table-column v-if="props.row.child_product.length > 1" prop="spec_name" label="规格" min-width="200"></el-table-column>
              <el-table-column prop="discount_after_gross" label="折后毛利率">
                <template slot-scope="scope">
                  <span v-if="scope.row.discount_after_gross">{{ scope.row.discount_after_gross.toFixed(2) }}</span>
                  <span v-else>{{ scope.row.discount_after_gross }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="total_price" label="折前价"></el-table-column>
              <el-table-column prop="discount_price" label="折后价">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.discount_price"
                            :disabled="updateAdvt"
                            @input="discountPriceChange(scope.row)"
                            @blur="updateSingle('discount_price', scope.row)"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="discount_rate" label="折扣率(%)" min-width="92">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.discount_rate"
                            :disabled="updateAdvt"
                            @input="discountRateChange(scope.row)"
                            @blur="updateSingle('discount_rate', scope.row)"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价" min-width="60"></el-table-column>
              <el-table-column prop="is_clear_stocks" label="是否清货" min-width="60">
                <template slot-scope="scope">
                  {{ scope.row.is_clear_stocks === '0' ? '否' : '是' }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="ID" min-width="50"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" width="120"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="90" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
              :pictureList="scope.row.pathArr"
              :width="50"
              :height="50"
              :thumbnail="false"
            ></PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="300"></el-table-column>
        <el-table-column prop="status" label="更新状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status === '0'">archive</span>
            <span v-else-if="scope.row.status === '1'">更新中</span>
            <span v-else-if="scope.row.status === '2'">更新失败</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="135">
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="purchase_limit" label="限购数量" width="90">
          <template slot-scope="scope">
            <el-input size="small" class="inline-edit-input" v-model="scope.row.purchase_limit"
                      :disabled="updateAdvt"
                      @blur="updateSingle('purchase_limit', scope.row)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="115" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openTheNewTAB('shopee.advertising.detail', { id: scope.row.advt_id, status: scope.row.advt_status })">详情</el-button>
            <el-button type="text" v-if="!updateAdvt" size="mini" @click="deleteDiscountAdvt(scope)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 导入组件 -->
    <new-advertisement v-bind.sync="newAdvertisements" @reload="renderList"></new-advertisement>
  </div>
</template>
<script>
  import { filterQueryParams, toBoolean } from '@/utils/help'
  import { deleteDiscountDetailAdvt, getDiscountDetailList, getDiscountTop, editDiscountTop, updateAll, updateSingle } from '@/api/shopee'
  import newAdvertisement from './component/newAdvertisement'

  export default {
    name: 'Advertising',
    components: { newAdvertisement },
    data() {
      const checkDate = (rule, value, callback) => {
        if (!this.editForm.start_time) {
          callback(new Error('请选择开始日期'))
        } else if (!this.editForm.end_time) {
          callback(new Error('请选择结束日期'))
        } else {
          callback()
        }
      }
      const checkTime = (rule, value, callback) => {
        if (!this.formData.start_time) {
          callback(new Error('请选择开始时间'))
        } else if (!this.formData.end_time) {
          callback(new Error('请选择结束时间'))
        } else {
          callback()
        }
      }
      return {
        // 编辑广告
        editForm: {
          start_time: '',
          end_time: '',
          current_time: '',
          discount_time: [],
          virtual_discount_time: [],
          discount_name: '',
          virtual_discount_name: ''
        },
        formData: {
          site_code: '',
          activity_name: '',
          activity_date: '',
          start_time: '',
          virtual_start_time: '',
          end_time: '',
          virtual_end_time: '',
          virtual_min_end_time: ''
        // confirmDate: []
        },
        discount_rate: '',
        purchase_limit: '',
        isEdit: true,
        choose_picker_end: false,
        updateAdvt: true,
        checked: true,
        newDate: new Date().getTime(),
        isDisable: false,
        options: [],
        listTotal: null,
        listData: [],
        listQuery: {
          page: 1,
          per_page: 10,
          product_id: undefined,
          product_name: undefined,
          discount_id: this.$route.params.discount_id,
          advtStatus: 110
        },
        pagination: null,
        dialogFormOption: {
          data: {},
          open: false
        },
        dialogAccreditOption: {
          data: {},
          open: false
        },
        multipleTable: [],
        statusTags: [],
        currentRow: null,
        checkPickShow: true,
        checkNum: 0,
        // 新增广告
        newAdvertisements: {
          account_id: this.$route.params.account_id,
          open: false,
          discount_id: this.$route.params.discount_id
        },
        time_diff: {},
        detail: {},
        rules: {
          discount_name: [
            { required: true, message: '请填写折扣活动名称', trigger: 'blur' }
          ],
          discount_time: [
            { required: true, validator: checkDate, trigger: 'change' }
          ],
          activity_date: [
            { required: true, message: '请选择日期', trigger: 'change' }
          ],
          activity_time: [
            { required: true, validator: checkTime, trigger: 'change' }
          ]
        },
        listLoading: false,
        clearData: {
          start_time: '',
          end_time: '',
          form_start_time: '',
          form_end_time: ''
        },
        days: 24 * 60 * 60 * 1000
      }
    },
    created() {
      this.renderList()
      this.discountDetails()
    },
    computed: {
      setPriceArr() {
        const arr = []
        this._.forEach(this.multipleTable, (v) => {
          arr.push(v)
        })
        return arr
      },
      pickerEndOptions() {
        const options = {}
        options.disabledDate = time => {
          if (this.detail.status === 1) {
            return time.getTime() < new Date(this.editForm.start_time).getTime() - this.days || time.getTime() > this.detail.end_time * 1000 - this.days
          } else {
            if (this.detail.current_time > this.detail.start_time) {
              // 活动起始时间已经超过，禁用当前时间到活动开始时间
              return this.detail.end_time * 1000 < time.getTime() || this.detail.current_time * 1000 > time.getTime() + this.days
            } else {
              return this.detail.end_time * 1000 < time.getTime() || this.detail.start_time * 1000 > time.getTime()
            }
          }
        }
        return options
      },
      pickerStartOptions() {
        const options = {}
        options.disabledDate = time => {
          if (this.detail.current_time > this.detail.start_time) {
            return this.detail.end_time * 1000 < time.getTime() || this.detail.current_time * 1000 > time.getTime() + this.days
          } else {
            return this.detail.end_time * 1000 < time.getTime() || this.detail.start_time * 1000 > time.getTime()
          }
        }
        return options
      },
      start_time_options() {
        const options = {
          start: '00:00',
          step: '00:30',
          end: '23:30'
        }
        const days = new Date(this.editForm.end_time).getTime() - new Date(this.editForm.start_time).getTime()
        // if (this.detail.status === 1) {
        //   options.minTime = undefined
        //   options.maxTime = undefined
        // } else {
        if (this.editForm.start_time === this.editForm.end_time) {
          options.minTime = this.formData.start_time !== '00:00' ? this.formData.virtual_start_time : undefined
          options.maxTime = this.formData.end_time
        } else if (days > 24 * 60 * 60 * 1000) {
          options.minTime = undefined
          options.maxTime = undefined
        } else {
          options.minTime = this.formData.start_time !== '00:00' ? this.formData.virtual_start_time : undefined
          options.maxTime = this.formData.virtual_end_time
        }
        // }
        return options
      },
      end_time_options() {
        const options = {
          start: '00:00',
          step: '00:30',
          end: '23:30'
        }
        const end_time = new Date(this.editForm.discount_time[1].slice(0, 11)).getTime()
        const select_time = new Date(this.editForm.end_time).getTime()
        if (this.editForm.start_time === this.editForm.end_time) {
          options.minTime = this.formData.start_time
          options.maxTime = this.formData.virtual_end_time
        } else {
          if (select_time < end_time) {
            options.minTime = undefined
            options.maxTime = undefined
          } else {
            options.maxTime = this.formData.virtual_end_time
            options.minTime = undefined
          }
        }
        return options
      },
      time_disabled() {
        // let time = ''
        // const start_time = new Date(this.editForm.virtual_discount_time[0]).getTime()
        // const end_time = new Date(this.editForm.virtual_discount_time[1]).getTime()
        // time = end_time - start_time
        const times = (new Date(this.editForm.end_time + ' ' + this.formData.end_time).getTime()) - (new Date(this.editForm.start_time + ' ' + this.formData.start_time).getTime())
        // if (time <= 30 * 60 * 1000) {
        //   return true
        // } else {
        //   return false
        // }
        if ((this.editForm.start_time === this.editForm.end_time) && (times === 60 * 60 * 1000)) {
          return true
        } else {
          return false
        }
      }
    },
    methods: {
      selectionChange(val) {
        this.multipleTable = val
        this.checkNum++
      },
      /* 跳转新标签 */
      openTheNewTAB(name, params) {
        const { href } = this.$router.resolve({
          name: name,
          params: params || {}
        })
        window.open(href, '_blank')
      },
      toBoolean(v) {
        return toBoolean(v)
      },
      renderList() {
        this.listData = []
        this.listLoading = true
        this.listQuery.product_id = this._.trim(this.listQuery.product_id)
        const queryParams = filterQueryParams(this.listQuery)
        this.multipleTable = []
        // 折扣活动详情列表
        getDiscountDetailList(queryParams).then((res) => {
          this.listLoading = false
          res.data.list.forEach(val => {
            val.virtual_purchase_limit = val.purchase_limit
          })
          this.listData = res.data.list
          this.pagination = res.data.pagination
          this._.forEach(this.listData, (v) => {
            // 图片缩略图
            v.pathArr = []
            if (v.product_image) {
              v.pathArr.push(v.product_image)
            }
            this._.forEach(v.child_product, val => {
              val.virtual_discount_rate = val.discount_rate
              val.virtual_discount_price = val.discount_price
            })
          })
          this.tableResortEvent()
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleFilter() {
        if (this.listQuery.product_id && this.listQuery.product_id.trim()) {
          const aa = this.listQuery.product_id.trim().replace(/\s+/g, ',')
          const productIdArr = aa.split(',')
          if (productIdArr.length > 10) {
            this.$message.error('最多输入10个 Product ID')
            return
          }
        }
        this.newDate = new Date().getTime()
        this.listQuery.page = 1
        this.renderList()
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange1(val) {
        this.currentRow = val
      },
      handleCurrentChange(val) {
        this.listQuery.page = 1
        this.listQuery.page = val
        this.renderList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      changeStatus(key) {
        this.newDate = new Date().getTime()
        if (this.listQuery.advtStatus !== key) {
          this.listQuery.advtStatus = key
          this.listQuery.page = 1
          this.renderList()
        }
      },
      statusSelected(key) {
        return this.listQuery.advtStatus === key ? 'warning' : ''
      },
      clearStartData(val) {
        if (this.detail.status !== 2 && this.formData.end_time === '') {
          this.formData.start_time = ''
        }
      },
      handleSelectionChange(val) {
        this._.forEach(this.listData, (v) => {
          this._.forEach(v.child_product, (v2) => {
            v2.isSelected = false
          })
        })
        this._.forEach(val, (v) => {
          this._.forEach(v.child_product, (v2) => {
            v2.isSelected = true
          })
        })
        this.multipleTable = val
      },
      handleSelectionRow(val, row) {
        const check = this._.some(row.child_product, (v, i) => {
          return v.isSelected
        })
        if (check) {
          this._.forEach(row.child_product, v => {
            v.isSelected = false
          })
        } else {
          this._.forEach(row.child_product, v => {
            v.isSelected = true
          })
        }
      },
      // 表格类型筛选
      filterType(value, row) {
        return row.type === value
      },
      // 清理缩略图缓存
      tableResortEvent() {
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
      },
      // 编辑折扣活动
      editDiscount() {
        this.isEdit = !this.isEdit
      },
      // 取消保存编辑
      cancleHandleDiscount() {
        this.isEdit = !this.isEdit
        this.editForm.start_time = this.clearData.start_time
        this.editForm.end_time = this.clearData.end_time
        this.editForm.discount_name = this.editForm.virtual_discount_name
        this.formData.start_time = this.clearData.form_start_time
        this.formData.end_time = this.clearData.form_end_time
      },
      // 编辑保存
      editTopSave(editForm) {
        this.$refs.editForm.validate(valid => {
          if (valid) {
            const obj = {
              discount_id: this.$route.params.discount_id,
              account_id: this.$route.params.account_id,
              user_id: this.$store.state.user.info.id,
              name: editForm.discount_name,
              start_time: editForm.start_time + ' ' + this.formData.start_time,
              end_time: editForm.end_time + ' ' + this.formData.end_time
            }
            editDiscountTop(obj).then((res) => {
              this.isEdit = true
              if (res.code === 200) {
                this.renderList()
                this.discountDetails()
                this.$message({
                  type: 'success',
                  message: res.message
                })
              } else {
                this.$message({
                  type: 'info',
                  message: res.message
                })
              }
            }).catch(() => {
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      // 更新折扣管理
      updateDiscount() {
        this.updateAdvt = !this.updateAdvt
      },
      // 新增广告
      newAdvertisement() {
        this.newAdvertisements = {
          open: true
        }
      },
      // 折扣活动详情头部
      discountDetails() {
        const obj = {
          discount_id: this.$route.params.discount_id
        }
        getDiscountTop(obj).then((res) => {
          this.time_diff = res.data.time_diff
          this.detail = res.data.detail
          this.editForm.discount_name = res.data.detail.name
          this.editForm.virtual_discount_name = res.data.detail.name
          this.editForm.discount_time.push(this.time('yyyy-MM-dd HH:mm', res.data.detail.start_time), this.time('yyyy-MM-dd HH:mm', res.data.detail.end_time), this.time('yyyy-MM-dd HH:mm', res.data.detail.current_time))
          this.editForm.start_time = this.time('yyyy-MM-dd', res.data.detail.start_time)
          this.editForm.end_time = this.time('yyyy-MM-dd', res.data.detail.end_time)
          this.clearData.start_time = this.editForm.start_time
          this.clearData.end_time = this.editForm.end_time
          this.editForm.current_time = this.time('yyyy-MM-dd', res.data.detail.current_time)
          this.editForm.virtual_discount_time = this._.cloneDeep(this.editForm.discount_time)
          this.formData.start_time = this.time('HH:mm', res.data.detail.start_time)
          this.formData.virtual_start_time = this.time('HH:mm', res.data.detail.start_time - 30 * 60)
          this.formData.end_time = this.time('HH:mm', res.data.detail.end_time)
          this.clearData.form_start_time = this.time('HH:mm', res.data.detail.start_time)
          this.clearData.form_end_time = this.time('HH:mm', res.data.detail.end_time)
          this.formData.virtual_end_time = this.time('HH:mm', res.data.detail.end_time + 30 * 60)
        })
      },
      // 时间戳转 xxxx-xx-xx xx:xx:xx
      time(type, val) {
        const time = new Date(val * 1000)
        const year = time.getFullYear() + '-'
        const mouth = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) + '-' : (time.getMonth() + 1) + '-'
        const day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
        const hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
        const minute = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
        // const second = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
        // return year + mouth + day + hour + minute + second
        if (type === 'yyyy-MM-dd') {
          return year + mouth + day
        } else if (type === 'HH:mm') {
          return hour + ':' + minute
        } else if (type === 'yyyy-MM-dd HH:mm') {
          return year + mouth + day + ' ' + hour + ':' + minute
        }
      },
      // 移除，批量移除
      deleteDiscountAdvt(row, type) {
        const obj = {
          account_id: this.$route.params.account_id,
          discount_id: this.$route.params.discount_id,
          advt_id: []
        }
        if (type === 'all') {
          const arr = []
          this._.forEach(row, v => {
            arr.push(v.advt_id)
          })
          obj.advt_id = this._.join(arr, ',')
        } else {
          obj.advt_id = row.row.advt_id
        }
        this.$confirm('是否要移除此产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDiscountDetailAdvt(obj).then((res) => {
            if (res.code === 200) {
              this.$message({
                type: 'success',
                message: res.message
              })
            } else {
              this.$message({
                type: 'info',
                message: res.message
              })
            }
            this.renderList()
          }).catch(() => {
          })
        })
      },
      // 更新广告
      updateAll(type) {
        if (!this.discount_rate.trim() && !this.purchase_limit.trim()) {
          this.$message.error('限购数量和折扣率不能同时为空')
          return
        }
        // 限购数量是否为0或正整数
        if (this.purchase_limit.trim()) {
          const reg = /^\d{1,}$/
          if (!reg.test(this.purchase_limit.trim())) {
            this.$message.error('输入的限购数量必须为0或正整数')
            return
          }
        }
        // 折扣率是否为1-98之间的整数
        if (this.discount_rate.trim()) {
          const reg = /^[1-9]\d{0,1}$/
          if (!reg.test(this.discount_rate.trim()) || this.discount_rate.trim() > 98) {
            this.$message.error('折扣率必须是1-98之间的整数')
            return
          }
        }
        let discount_advt_id = []
        if (type === 'all') {
          discount_advt_id = type
        } else {
          discount_advt_id = this._.map(this.multipleTable, val => val.id)
        }
        const user_id = this.$store.state.user.info.id
        const discount_id = this.$route.params.discount_id
        const account_id = this.$route.params.account_id
        const obj = {
          discount_advt_id,
          user_id,
          discount_id,
          account_id
        }
        if (this.purchase_limit.trim()) {
          obj.purchase_limit = this.purchase_limit.trim()
        }
        if (this.discount_rate.trim()) {
          obj.discount_rate = this.discount_rate.trim()
        }
        updateAll(obj).then(() => {
          this.renderList()
        })
      },
      updateSingle(type, row) {
        const discount_advt_id = row.id
        const account_id = this.$route.params.account_id
        const discount_id = this.$route.params.discount_id
        const user_id = this.$store.state.user.info.id
        // 设置限购数量
        if (type === 'purchase_limit') {
          const reg = /^\d{1,}$/
          if (!reg.test(row.purchase_limit.trim())) {
            this.$message.error('输入的限购数量必须为0或正整数')
            row.purchase_limit = row.virtual_purchase_limit
            return
          }
          const obj = {
            discount_id,
            discount_advt_id,
            account_id,
            user_id,
            purchase_limit: row.purchase_limit
          }
          updateSingle(obj).then(() => {
            this.renderList()
          }).catch(() => {
            row.purchase_limit = row.virtual_purchase_limit
          })
        }
        // 设置折扣率
        if (type === 'discount_rate') {
          row.discount_price = row.virtual_discount_price
          const reg = /^[1-9]\d{0,1}$/
          if (!reg.test(row.discount_rate.trim()) || row.discount_rate.trim() > 98) {
            this.$message.error('折扣率必须是1-98之间的整数')
            row.discount_rate = row.virtual_discount_rate
            return
          }
          const obj = {
            discount_id,
            discount_advt_id,
            account_id,
            user_id,
            discount_rate: row.discount_rate
          }
          updateSingle(obj).then(() => {
            this.renderList()
          }).catch(() => {
            row.discount_rate = row.virtual_discount_rate
          })
        }
        // 设置折后价
        if (type === 'discount_price') {
          row.discount_rate = row.virtual_discount_rate
          const reg = /^[0-9]\d*(\.\d{1,2})?$/
          if (!reg.test(row.discount_price.trim()) || parseFloat(row.discount_price.trim()) < 0 || parseFloat(row.discount_price.trim()) > row.total_price) {
            this.$message.error(`折后价不能小于0且不能超过折前价`)
            row.discount_price = row.virtual_discount_price
            return
          }
          const obj = {
            discount_id,
            discount_advt_id,
            account_id,
            user_id,
            discount_price: row.discount_price
          }
          updateSingle(obj).then(() => {
            this.renderList()
          }).catch(() => {
            row.discount_price = row.virtual_discount_price
          })
        }
      },
      discountPriceChange(row) {
        if (Number(row.discount_price.trim())) {
          row.discount_rate = Math.round((row.total_price - row.discount_price.trim()) * 100 / row.total_price)
        } else {
          row.discount_rate = ''
        }
      },
      discountRateChange(row) {
        if (Number(row.discount_rate.trim())) {
          row.discount_price = parseFloat(row.total_price - row.total_price * row.discount_rate.trim() / 100).toFixed(2)
        } else {
          row.discount_price = ''
        }
      },
      // 选择日期
      selectDateStart(date) {
        if (this.detail.status === 1) {
          this.editForm.end_time = ''
          this.formData.start_time = ''
          this.formData.end_time = ''
          if (date) {
            const year = new Date().getFullYear()
            let month = new Date().getMonth() + 1
            let now_date = new Date().getDate()
            if (month < 10) {
              month = '0' + month
            }
            if (now_date < 10) {
              now_date = '0' + now_date
            }
            const today = `${year}-${month}-${now_date}`
            if (today === date[0]) {
              // 用户选择的时间是今天，设置可选时间范围为当前时间之后一小时整半点
              let hour = new Date().getHours() + 1
              let minute = new Date().getMinutes()
              if (hour < 10) {
                hour = '0' + hour
              }
              if (minute === 0 || minute > 0 && minute < 30) {
                minute = '30'
              } else {
                minute = '00'
                hour = Number(hour) + 1
                if (hour < 10) {
                  hour = '0' + hour
                }
              }
            }
          } else {
            this.choose_picker_end = false
            return
          }
        }
      },
      selectDateEnd(date) {
        if (this.detail.status === 1 && this.editForm.end_time === '') {
          this.editForm.start_time = ''
        } else {
          return true
        }
        const firstTime = this.editForm.start_time
        const secondTime = this.editForm.end_time
        if (firstTime === secondTime) {
          const end_hour = this.formData.end_time.slice(0, 2)
          const range = end_hour + this.formData.end_time.slice(-3)
          this.formData.virtual_end_time = range
        }
      },
      // 选择开始时间
      startTimeChange(start) {
        if (this.detail.status === 1) {
          this.formData.end_time = ''
        }
      }
    },
    filters: {
      getTypeLabel(val, options) {
        const types = options.shopeeAdvtTypes
        let label = ''
        if (types) {
          types.forEach((v) => {
            if (v.key === parseInt(val)) {
              label = v.label
            }
          })
        }
        return label
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

  .popover-cc {
    font-size: 12px;
    p {
      line-height: 22px;
      text-align: justify;
    }
  }

  .el-icon-arrow-left {
    border: 1px solid #d9d9d9;
    border-radius: 50%;
    padding: 6px;
    cursor: pointer;
  }

  .nextActivate {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    span.textData {
      color: #333;
      font-family: "微软雅黑";
      border: 0;
      font-size: 16px;
      font-weight: bold;
      margin-right: 20px;
    }

    span {
      color: #409EFF;
      border: 1px #409EFF solid;
      padding: 2px;
    }

    span.countdown {
      border: 0;
      color: #999;
      margin-left: 4px;
    }

    span.activateTime {
      border: 0;
      color: #999;
      span {
        border: 0;
        color: #999;
      }
    }

    span.editActivate {
      border: 0;
      margin-left: 20px;
      cursor: pointer;
    }
  }

  .discountName {
    margin-top: 4px;
    padding-bottom: 10px;
  }

  .form-padding {
    padding-bottom: 20px !important;
  }

  .btn-sava {
    display: inline-block;
    position: absolute;
    bottom: 10px;
    left: 860px;
  }
</style>
