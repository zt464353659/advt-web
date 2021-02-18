<template>
  <div style="padding-bottom:20px;" class="no-back-ground">
    <div class="submit-list">
      <div>
        <PictureView
          v-if="pictureShow"
          :pictureList="editPicList"
          :width="100"
          :height="100"
          :spaceBetween="6"
          :thumbnailWidth="80"
          :thumbnailHeight="80"
          :isEdit="true"
          @updateList="updateList"
          :defaultProps="defaultProps"
        ></PictureView>
      </div>
      <div class="add-btn">
        <!--        <el-button size="mini" :disabled="editPicList.length >= maxLength || !list.length" type="primary" @click="handleAddPicture">添加图片</el-button>-->
        <div class="tip-color">
          <i class="el-icon-warning"></i>
          最多上传10张图片，默认第一张为主图。
        </div>
      </div>
    </div>
    <driver-expand v-bind="{ optTitle: '选择istore图片'}">
      <div style="display:inline-block" slot="btn-group">
      </div>
      <div slot="content">
        <div class="select-list no-back-ground" :key="dateTime">
          <div v-for="(element, index) in list" :key="index" class="list-complete-item">
            <div class="list-complete-item-handle2" @click="pushEle(element)">
              <img class="inner-image" :src="element[thumbUrl]" alt="">
            </div>
          </div>
        </div>
      </div>
    </driver-expand>
  </div>
</template>

<script>
import DriverExpand from '@/components/driverExpand'

export default {
  name: 'DragImage',
  components: {
    DriverExpand
  },
  filters: {},
  data() {
    return {
      refresh: true,
      dateTime: Date.now(),
      canAdd: false,
      pictureShow: false,
      editPicList: [],
      list: [],
      oldList: []
    }
  },
  props: {
    // 要编辑的列表
    pictureList: {
      type: Array,
      required: true
    },
    isEdit: Boolean,
    // 可选图片列表
    pictures: {
      type: Array,
      required: true,
      default: () => []
    },
    // 图片列表最大长度
    maxLength: {
      type: Number,
      required: true,
      default: 10
    },
    // picture-view必须属性
    defaultProps: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    // 图片唯一标识
    pictureKey: {
      type: String,
      required: true,
      default: ''
    },
    // 缩略图属性
    thumbUrl: {
      type: String,
      required: true,
      default: ''
    },
    // 是否为vari子产品中图片编辑
    isVariChild: {
      type: Number,
      default: -1
    }
  },
  watch: {
    isEdit: {
      immediate: true,
      handler(val) {
        this.editPicList = this._.cloneDeep(this.pictureList)
        this.resetPicShow()
      }
    },
    // 更新父组件图片列表
    editPicList: {
      immediate: true,
      deep: true,
      handler() {
        this.oldList = this._.cloneDeep(this.editPicList)
        if (this.isVariChild > -1) {
          // vari子产品图片更新
          this.$emit('emit-update-pictureList', this.editPicList, this.isVariChild)
        } else {
          this.$emit('emit-update-pictureList', this.editPicList)
        }
      }
    }
  },
  created() {
    // 保存所有图片
    this.list = this._.cloneDeep(this.pictures)
  },
  methods: {
    resetPicShow() {
      this.pictureShow = false
      this.$nextTick(() => {
        this.pictureShow = true
      })
    },
    // 添加图片
    handleAddPicture() {
      this.canAdd = true
    },
    checkMove(ele) {
      // 多于this.maxLength张图片时提示，不再添加
      if (this.editPicList.length >= this.maxLength) {
        this.$message.error(`最多选择${this.maxLength}张图片`)
        this.canAdd = false
      }
    },
    isNotInList1(v) {
      return !this.editPicList.some(k => v[this.pictureKey] === k[this.pictureKey])
    },
    updateList(val, type) {
      if (type === 'add' && Object.keys(val).length) {
        this.editPicList = this.editPicList.concat(val)
        this.refresh = false
        this.$nextTick(() => {
          this.refresh = true
        })
      } else if (this.oldList.length !== val.length) {
        let list1 = this.oldList.map(v => v[this.pictureKey])
        let list2 = val.map(v => v[this.pictureKey])
        let delId = this._.difference(list1, list2)[0]
        this.editPicList = this._.filter(val, v => !v.is_add)
        this.$emit('emit-update-pictureList', this.editPicList)
        if (!this.list.some(v => v[this.pictureKey] === delId)) {
          this.list = this._.filter(this.list.concat(this.oldList.filter(v => v[this.pictureKey] === delId)), v => !v.is_add)
        }
        this.refresh = false
        this.$nextTick(() => {
          this.refresh = true
        })
      } else {
        this.editPicList = val
      }
    },
    pushEle(ele) {
      // 多于this.maxLength张图片时提示，不再添加
      if (this.editPicList.length >= this.maxLength) {
        this.$message.error(`最多选择${this.maxLength}张图片`)
        this.canAdd = false
        return
      } else {
        if (this.isNotInList1(ele)) {
          this.editPicList = [...this.editPicList, ele]
          this.oldList = this._.cloneDeep(this.editPicList)
        } else {
          this.$message.warning('图片已存在')
          return
        }
      }
      for (const item of this.list) {
        if (item[this.pictureKey] === ele[this.pictureKey]) {
          const index = this.list.indexOf(item)
          this.list.splice(index, 1)
          break
        }
      }
      // 可添加无图片时收起
      if (!this.list.length) {
        this.canAdd = false
      }
    },
    setData(dataTransfer) {
      dataTransfer.setData('Text', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.submit-list {
  padding: 5px;
  border-radius: 5px;
  min-height: 136px;
  border: 1px dotted #dedede;
}

.add-btn {
  margin: 5px 0px 0px 10px;
}

.select-list {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  //background-color: #ebeef5;
  border: 1px dotted #dedede;
  border-radius: 5px;
  margin-top: 5px;
  min-height: 136px;
  max-height: 255px;
  overflow: auto;
}

.image-title {
  margin: 0px;
  padding: 0 0 0 10px;
  font-size: px;
  /*color: #303133;*/
  color: #606266;
}

.inner-image {
  width: 100px;
  height: 100px;
  border-radius: 5px;
}

.dndList {
  background: #fff;
  padding-bottom: 40px;

  &:after {
    content: "";
    display: table;
    clear: both;
  }

  .dndList-list {
    float: left;
    padding-bottom: 30px;

    &:first-of-type {
      margin-right: 2%;
    }

    .dragArea {
      margin-top: 15px;
      min-height: 50px;
      padding-bottom: 30px;
    }
  }
}

.list-complete-item {
  cursor: pointer;
  position: relative;
  font-size: 14px;
  display: inline-block;
  padding: 5px;
  margin-top: 4px;
  transition: all 1s;
}

.list-complete-item-handle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-complete-item-handle2 {
  width: 100px;
  height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid #cecece;
  border-radius: 5px;
}

.list-complete-enter,
.list-complete-leave-active {
  opacity: 0;
}
</style>
