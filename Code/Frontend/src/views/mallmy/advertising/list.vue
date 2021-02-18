<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.MallMyAdvtAccount" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用逗号分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model="listQuery.advtSpuId" clearable placeholder="平台商品号" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in options.MallMyProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否指定价" prop="is_custom_price">
          <el-select v-model="listQuery.is_custom_price" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in customPriceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in customQuantityOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item label="是否指定吊牌价" prop="is_custom_msrp">-->
        <!--<el-select v-model="listQuery.is_custom_msrp" clearable placeholder="请选择" style="width: 120px;">-->
        <!--<el-option v-for="item in customMsrpOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item v-if="options.MallMyAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="advtType in options.MallMyAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="options.mallMyAdvtStatus" class="header-box">
      <el-row class="left-row">
        <el-tag v-for="status in options.mallMyAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row" v-if="listQuery.advtStatus === 103">
        <el-dropdown
          size="mini"
          split-button
          trigger="click"
          type="warning"
          @command="handleCommandTagPrice"
          v-permission="[permissions.setcustommsrpprice,permissions.cancelcustommsrpprice]"
        >
          指定吊牌价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="!multipleTable.length" command="0" v-permission="permissions.setcustommsrpprice">
              设置指定吊牌价
            </el-dropdown-item>
            <el-dropdown-item :disabled="!multipleTable.length" command="1" v-permission="permissions.cancelcustommsrpprice">
              取消指定吊牌价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          size="mini"
          split-button
          trigger="click"
          type="success"
          @command="handleCommandInventory"
          v-permission="[permissions.setstock,permissions.stockout]"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0" :disabled="!multipleTable.length" v-permission="permissions.setstock">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item command="1" :disabled="!multipleTable.length" v-permission="permissions.stockout">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          size="mini"
          split-button
          trigger="click"
          type="primary"
          @command="handleCommandPricing"
          v-permission="[permissions.setcustomprice,permissions.cancelcustomprice]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0" :disabled="!multipleTable.length" v-permission="permissions.setcustomprice">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item command="1" :disabled="!multipleTable.length" v-permission="permissions.cancelcustomprice">
              取消指定价
            </el-dropdown-item>
            <el-dropdown-item command="2" :disabled="!multipleTable.length" v-permission="permissions.setcustomprice">
              设置毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="danger" v-permission="permissions.soldout" size="mini" @click="deleteFileOrDirectory(setPriceArr,'all')" :disabled="!multipleTable.length">批量下架</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        ref="table"
        :data="listData"
        v-loading.lock="listLoading"
        element-loading-text="努力加载中"
        border
        @select-all="handleSelectionChange"
        @select="handleSelectionRow"
        @selection-change="selectionChange"
        @sort-change="tableResortEvent"
        :default-expand-all="expand"
        @header-click="handleExpand"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right"/>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="40" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected"/>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID"></el-table-column>
              <el-table-column prop="name" label="产品名称" min-width="200"></el-table-column>
              <el-table-column prop="custom_price" label="指定价" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_price" :disabled="scope.row.custom_price_type === '2' ? isDisable=true : isDisable=false" @blur="handleEditAssign(scope.row, 'single')">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="discount_price" label="价格"></el-table-column>
              <el-table-column prop="is_custom_price " label="是否指定价" min-width="85" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <span v-if="scope.row.is_custom_price === '1'">是</span>
                  <span v-else-if="scope.row.is_custom_price === '0'">否</span>
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.gross_margin" :disabled="scope.row.custom_price_type === '1' ? isDisable=true : isDisable=false" @blur="handleEditGross(scope.row, '2')">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="custom_msrp_price" label="指定吊牌价" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_msrp_price" @blur="handleSpecifiedTagPrice(scope.row, '2')">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="msrp" label="吊牌价"></el-table-column>
              <el-table-column prop="is_custom_msrp " label="是否指定吊牌价" min-width="85" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <span v-if="scope.row.is_custom_msrp === '1'">是</span>
                  <span v-else-if="scope.row.is_custom_msrp === '0'">否</span>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" v-if="listQuery.advtStatus === 103">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_quantity" @blur="handleTheInventory(scope.row, '2')"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="center" v-if="listQuery.advtStatus === 103" type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="ID" width="60" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" width="160">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="110" align="center"></el-table-column>
        <el-table-column prop="spu_id" width="180">
          <template slot="header">
            <span style="text-align: center;display: inline-block;width: 100%;">平台商品号</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="90" align="center">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
              :pictureList="scope.row.pathArr"
              :width="50"
              :height="50"
              :thumbnail="false"
              :defaultProps="defaultProps"
            >
            </picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" min-width="200">
          <template slot="header">
            <span style="display: inline-block;text-align: center;width:100%;">名称</span>
          </template>
          <template slot-scope="scope">
            <a
              v-if="scope.row.status === '103' && scope.row.mallmy_url_id"
              style="color: #409EFF;word-break: keep-all;"
              :href="scope.row.mallmy_url_id"
              target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else style="word-break: keep-all;">{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          width="90"
          align="center"
          label="类型"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === '1' ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="listQuery.advtStatus === 'wait_shelve'" prop="onshelves_status" label="执行状态" width="85" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.onshelves_status === 1">
              <el-tooltip :content="scope.row.onshelves_message" placement="top" effect="light">
                <el-tag type="danger" size="small">执行出错</el-tag>
              </el-tooltip>
            </template>
            <template v-else>
              <el-tag type="warning" size="small">未执行</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="135" sort-by="create_time" sortable align="center">
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openTheNewTAB('mallmy.advertising.detail', { id: scope.row.id })">详情</el-button>
            <el-button type="text" v-permission="permissions.soldout" v-if="listQuery.advtStatus === 103" size="mini" @click="deleteFileOrDirectory(scope)">下架</el-button>
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
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
  import { toBoolean, filterQueryParams } from '@/utils/help'
  import { fetchList, deletePlatformAdvt, unpricing, updateCustomerPrice, setTheInventory, cancelTheInventory, updateMsrpPrice, cancelTheMsrp, getSelectAll } from '@/api/mallmy'

  export default {
    name: 'MallMyAdvertising',
    data() {
      return {
        permissions: {
          // 设置指定吊牌价
          setcustommsrpprice: 'mallmy.advt.custom-msrp-price.set-custom-msrp-price',
          // 取消指定吊牌价
          cancelcustommsrpprice: 'mallmy.advt.custom-msrp-price.cancel-custom-msrp-price',
          // 设置指定库存
          setstock: 'mallmy.advt.custom-quantity.set-custom-quantity',
          // 取消指定库存
          stockout: 'mallmy.advt.custom-quantity.cancel-custom-quantity',
          // 设置指定价
          setcustomprice: 'mallmy.advt.custom-price.set-custom-price',
          // 取消指定价、毛利率
          cancelcustomprice: 'mallmy.advt.custom-price.cancel-custom-price',
          // 广告下架
          soldout: 'mallmy.advt.delete-platform-advt.execute'
        },
        show1: false,
        show2: false,
        show3: false,
        isDisable: false,
        options: [],
        listLoading: true,
        listTotal: null,
        listData: [],
        listQuery: {
          page: 1,
          per_page: 10,
          accountId: undefined,
          advtProductIds: undefined,
          advtSpuId: undefined,
          productLine: undefined,
          advtType: [],
          advtStatus: 103,
          advtCreated: [],
          is_custom_msrp: undefined,
          is_custom_price: undefined,
          is_custom_quantity: undefined
        },
        pagination: null,
        statusTags: [],
        multipleTable: [],
        newDate: new Date().getTime(),
        checkPickShow: true,
        checkNum: 0,
        customPriceOptions: [
          { label: '是', value: '1' },
          { label: '否', value: '0' }
        ],
        customQuantityOptions: [
          { label: '是', value: '1' },
          { label: '否', value: '0' }
        ],
        customMsrpOptions: [
          { label: '是', value: '1' },
          { label: '否', value: '0' }
        ],
        expand: false,
        defaultProps: {
          originalKey: 'original',
          thumbnailKey: 'thumbnail'
        }
      }
    },
    created() {
      this.searchInit()
      this.renderList()
    },
    computed: {
      setPriceArr() {
        this.checkNumChange(this.checkNum)
        const arr = []
        this._.forEach(this.multipleTable, (v) => {
          arr.push(v)
          this._.forEach(v.child_product, (v1) => {
            if (v1.isSelected) {
              arr.push(v1)
            }
          })
        })
        return arr
      }
    },
    watch: {
      expand(val) {
        this.$nextTick(() => {
          if (val) {
            document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(90deg)'
          } else {
            document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(0deg)'
          }
        })
      }
    },
    methods: {
      // 获取搜索框site_code、产品线、类型 内容
      searchInit() {
        const optionsParams = ['MallMyAdvtAccount', 'MallMyAdvtTypes', 'MallMyProductLine']
        getSelectAll(optionsParams).then(response => {
          this.options = response.data
        })
      },
      checkNumChange(num) {
      },
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
      smt(row) {
        const check = this._.some(row.child_product, (v) => {
          return v.isSelected
        })
        if (check) {
          this.$refs.table.toggleRowSelection(row, true)
        } else {
          this.$refs.table.toggleRowSelection(row, false)
        }
      },
      toBoolean(v) {
        return toBoolean(v)
      },
      renderList() {
        this.listData = []
        this.listLoading = true
        this.expand = false
        this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
        this.listQuery.advtSpuId = this._.trim(this.listQuery.advtSpuId)
        const queryParams = filterQueryParams(this.listQuery)
        fetchList(queryParams).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this.options.mallMyAdvtStatus = response.data.statistics
          this._.forEach(this.listData, (v) => {
            // 图片缩略图
            v.pathArr = []
            if (v.product_image) {
              v.pathArr.push({ thumbnail: v.product_image_thumb,
                original: v.product_image })
            }
            this._.forEach(v.child_product, (val) => {
              val.isSelected = false
              val.virtualGross_margin = val.gross_margin
              val.virtualCustom_price = val.custom_price
              val.virtualCustom_quantity = val.custom_quantity
              val.virtualCustom_msrp_price = val.custom_msrp_price
            })
          })
          this.checkPickShow = false
          this.$nextTick(() => {
            this.checkPickShow = true
          })
          const table = this._.cloneDeep(this.listData)
          this.listData = []
          this.listData = table
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
          this.listLoading = false
          this.$refs['table'].doLayout()
          this.multipleTable = []
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleFilter() {
        this.newDate = new Date().getTime()
        this.listQuery.page = 1
        this.renderList()
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
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
        const check = this._.some(row.child_product, (v) => {
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
      // 下架和批量下架
      deleteFileOrDirectory(row, type) {
        if (type === 'all') {
          this.ids = this._.map(this.multipleTable, 'id')
          this.status = this._.map(this.multipleTable, 'is_deleted')
          // *** 当前逻辑处理不通，后端返回字段无 is_deleted,导致目前所有产品无法执行下架操作
        } else {
          this.ids = [row.row.id]
          this.status = [row.row.is_deleted]
        }
        const statusResult = this._.indexOf(this.status, 0)
        if (statusResult > -1) {
          this.$confirm('确定要下架此产品吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
            deletePlatformAdvt({ advt_id: this.ids, user_id: this.$store.state.user.info.id }).then(response => {
              if (response.code === 200) {
                this.$message({
                  type: 'success',
                  message: response.message
                })
                this.renderList()
              } else {
                this.$message({
                  type: 'info',
                  message: response.message
                })
              }
            })
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          this.$alert('该产品已经进入待下架状态，不可再次提交。', '提示', {
            dangerouslyUseHTMLString: true,
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
        }
      },
      /* 指定吊牌价 */
      handleCommandTagPrice(command) {
        if (command === '0') {
          this.setSpecifiedTagPrice()
        } else if (command === '1') {
          this.cancelAll('tagPrice')
        }
      },
      /* 指定库存 */
      handleCommandInventory(command) {
        if (command === '0') {
          this.SetTheInventory()
        } else if (command === '1') {
          this.cancelAll('inventory')
        }
      },
      /* 指定价 */
      handleCommandPricing(command) {
        if (command === '0') {
          this.setPress()
        } else if (command === '1') {
          this.cancelAll('pricing')
        } else if (command === '2') {
          this.setGrossMargins()
        }
      },
      /* 批量设置毛利率 */
      setGrossMargins() {
        let isZeroType = ''
        let isTwoType = ''
        this._.forEach(this.multipleTable, (v) => {
          const status = this._.map(v.child_product, 'custom_price_type')
          isZeroType = this._.indexOf(status, '0')
          isTwoType = this._.indexOf(status, '2')
        })
        // 选中项存在毛利率指定价都未设置或设置了毛利率
        if (isZeroType >= 0 || isTwoType >= 0) {
          this.$prompt('请输入毛利率', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }).then(({ value }) => {
            this.handleEditGross('all', value)
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          // 选中项都已设置了指定价
          this.$alert('毛利率暂不能设置', '提示', {
            confirmButtonText: '确定'
          })
          return false
        }
      },
      // 设置毛利率
      handleEditGross(row, value) {
        this.listLoading = true
        let ids = []
        const prices = {}
        // 批量设置毛利率
        if (row === 'all') {
          if (this.checkGrossProfitRate(value)) {
            this._.forEach(this.setPriceArr, (v) => {
              this._.forEach(v.child_product, (val) => {
                if (val.isSelected === true) {
                  ids.push(val.id)
                  prices[val.id] = value
                }
              })
            })
            const obj = {
              gross_margin: prices,
              product_id: ids,
              custom_price_type: 2,
              user_id: this.$store.state.user.info.id
            }
            updateCustomerPrice(obj).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          } else {
            this.listLoading = false
            return
          }
        } else {
          // 输入框设置毛利率
          if (this.checkGrossProfitRate(row.gross_margin)) {
            if (parseFloat(row.gross_margin) === parseFloat(row.virtualGross_margin) && row.is_custom_price === '1') {
              this.listLoading = false
              true
            } else {
              ids = [row.id]
              prices[row.id] = row.gross_margin
              const obj = {
                gross_margin: prices,
                product_id: ids,
                custom_price_type: 2,
                user_id: this.$store.state.user.info.id
              }
              updateCustomerPrice(obj).finally(() => {
                this.listLoading = false
                this.renderList()
              })
            }
          } else {
            row.gross_margin = row.virtualGross_margin
            return
          }
        }
      },
      // 批量设置指定价
      setPress() {
        let isZeroType = ''
        let isOneType = ''
        this._.forEach(this.multipleTable, (v) => {
          const status = this._.map(v.child_product, 'custom_price_type')
          isZeroType = this._.indexOf(status, '0')
          isOneType = this._.indexOf(status, '1')
        })
        if (isZeroType >= 0 || isOneType >= 0) {
          this.$prompt('请输入指定价', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }).then(({ value }) => {
            this.handleEditAssign('all', value)
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          this.$alert('指定价暂不能设置', '提示', {
            confirmButtonText: '确定'
          })
          return false
        }
      },
      // 设置指定价（单品）
      handleEditAssign(row, value) {
        this.listLoading = true
        let ids = []
        const prices = {}
        if (row === 'all') {
          if (this._.trim(value) === '') {
            this.listLoading = false
            return
          }
          if (this.checkNumber(value)) {
            this._.forEach(this.multipleTable, (v) => {
              this._.forEach(v.child_product, (val) => {
                if (val.isSelected === true) {
                  ids.push(val.id)
                  prices[val.id] = value
                }
              })
            })
            const obj = {
              custom_price: prices,
              product_id: ids,
              custom_price_type: 1,
              user_id: this.$store.state.user.info.id
            }
            updateCustomerPrice(obj).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          } else {
            this.listLoading = false
            return
          }
        } else {
          // 验证输入是否符合标准
          if (this.checkNumber(row.custom_price)) {
            if (parseFloat(row.virtualCustom_price) === parseFloat(row.custom_price) && row.is_custom_price === '1') {
              this.listLoading = false
              return
            } else {
              ids = [row.id]
              prices[row.id] = row.custom_price
              const obj = {
                custom_price: prices,
                product_id: ids,
                custom_price_type: 1,
                user_id: this.$store.state.user.info.id
              }
              updateCustomerPrice(obj).finally(() => {
                this.listLoading = false
                this.renderList()
              })
            }
          } else {
            row.custom_price = row.virtualCustom_price
            this.listLoading = false
          }
        }
      },
      // 设置指定吊牌价
      setSpecifiedTagPrice() {
        this.$prompt('请输入指定吊牌价', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false
        }).then(({ value }) => {
          this.handleSpecifiedTagPrice('all', value)
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 吊牌价
      handleSpecifiedTagPrice(row, value) {
        this.listLoading = true
        let ids = []
        const custom_msrp_price = {}
        if (row === 'all') {
          if (this.checkMsrp(value)) {
            this._.forEach(this.setPriceArr, (v) => {
              this._.forEach(v.child_product, (val) => {
                if (val.isSelected === true) {
                  ids.push(val.id)
                  custom_msrp_price[val.id] = value
                }
              })
            })
            const obj = {
              custom_msrp_price: custom_msrp_price,
              product_id: ids,
              user_id: this.$store.state.user.info.id
            }
            updateMsrpPrice(obj).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          } else {
            this.listLoading = false
            return
          }
        } else {
          if (this.checkMsrp(row.custom_msrp_price)) {
            if (parseFloat(row.custom_msrp_price) < parseFloat(row.discount_price)) {
              this.$message.error('吊牌价不能低于售价')
              row.custom_msrp_price = row.virtualCustom_msrp_price
              this.listLoading = false
              return
            }
            if (parseFloat(row.custom_msrp_price) === parseFloat(row.virtualCustom_msrp_price) && row.is_custom_msrp === '1') {
              this.listLoading = false
              return
            } else {
              ids = [row.id]
              custom_msrp_price[row.id] = row.custom_msrp_price
              const obj = {
                custom_msrp_price: custom_msrp_price,
                product_id: ids,
                user_id: this.$store.state.user.info.id
              }
              updateMsrpPrice(obj).finally(() => {
                this.listLoading = false
                this.renderList()
              })
            }
          } else {
            row.custom_msrp_price = row.virtualCustom_msrp_price
            this.listLoading = false
            return
          }
        }
      },
      // 批量设置指定库存
      SetTheInventory() {
        this.$prompt('请输入库存', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false
        }).then(({ value }) => {
          const reg = /^[1-9]\d*$/
          if (!reg.test(value)) {
            this.$message.error('设置库存必须是大于0的整数！')
            return
          }
          this.handleTheInventory('all', value)
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 设置指定库存
      handleTheInventory(row, value) {
        this.listLoading = true
        let ids = []
        const custom_quantity = {}
        if (row === 'all') {
          if (this._.trim(value) === '') {
            this.listLoading = false
            return
          }
          if (this.checkQuantity(value)) {
            this._.forEach(this.setPriceArr, (v) => {
              this._.forEach(v.child_product, (val) => {
                if (val.isSelected === true) {
                  ids.push(val.id)
                  custom_quantity[val.id] = value
                }
              })
            })
            const obj = {
              custom_quantity: custom_quantity,
              product_id: ids,
              user_id: this.$store.state.user.info.id
            }
            setTheInventory(obj).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          } else {
            this.listLoading = false
            return
          }
        } else {
          if (this.checkQuantity(row.custom_quantity)) {
            if (parseInt(row.custom_quantity) === parseInt(row.virtualCustom_quantity) && row.is_custom_quantity === '1') {
              this.listLoading = false
              return
            } else {
              ids = [row.id]
              custom_quantity[row.id] = row.custom_quantity
              const obj = {
                custom_quantity: custom_quantity,
                product_id: ids,
                user_id: this.$store.state.user.info.id
              }
              setTheInventory(obj).finally(() => {
                this.listLoading = false
                this.renderList()
              })
            }
          } else {
            row.custom_quantity = row.virtualCustom_quantity
            this.listLoading = false
            return
          }
        }
      },
      // 取消指定价、取消库存、取消指定吊牌价
      cancelAll(type) {
        let msg = ''
        let api = ''
        const advIds = []
        if (type === 'tagPrice') { // 吊牌价
          msg = '您确定要取消指定吊牌价吗？'
          api = cancelTheMsrp
        } else if (type === 'inventory') { // 指定库存
          msg = '您确定要取消指定库存吗？'
          api = cancelTheInventory
        } else if (type === 'pricing') { // 指定价
          msg = '您确定要取消指定价吗？'
          api = unpricing
        }
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnPressEscape: false,
          closeOnClickModal: false,
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          this._.forEach(this.multipleTable, (v) => {
            this._.forEach(v.child_product, (val) => {
              if (val.isSelected === true) {
                advIds.push(val.id)
              }
            })
          })
          api({ product_id: advIds, user_id: this.$store.state.user.info.id }).finally(() => {
            this.renderList()
          })
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 指定吊牌价验证
      checkMsrp(val) {
        if (!(/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/.test(Number(val)))) {
          this.$message({
            type: 'error',
            message: '输入的吊牌价大于0且最多保留两位小数'
          })
          this.listLoading = false
          return false
        }
        return true
      },
      // 指定价验证
      checkNumber(val) {
        if (!(/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/.test(Number(val)))) {
          this.$message({
            type: 'error',
            message: '输入的指定价最多保留两位小数'
          })
          this.listLoading = false
          return false
        }
        return true
      },
      // 设置库存验证
      checkQuantity(val) {
        const reg = /^[1-9]\d*$/
        if (reg.test(Number(val)) === false) {
          this.$message({
            type: 'error',
            message: '设置库存必须是大于0的整数'
          })
          this.listLoading = false
          return false
        }
        return true
      },
      // 检测毛利率
      checkGrossProfitRate(val) {
        const reg = /(^100$)|(^\d{0,2}(\.\d{0,2})?$)/
        if (!reg.test(val)) {
          this.$message({
            type: 'error',
            message: '毛利率必须是0-100之间的数字'
          })
          this.listLoading = false
          return false
        }
        return true
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
      handleExpand(column) {
        if (column.type === 'expand') {
          this.expand = !this.expand
          // 强制刷新DOM
          this.newDate = new Date().getTime()
        }
      }
    },
    filters: {
      getTypeLabel(val, options) {
        const types = options.MallMyAdvtTypes
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
  .advt-form-inline {
    .line {
      text-align: center;
    }
  }

  .popover-cc {
    font-size: 12px;
    p {
      line-height: 22px;
      text-align: justify;
    }
  }

  .el-table th > .cell > svg {
    color: #fff;
    transition: linear .5s;
  }
</style>
