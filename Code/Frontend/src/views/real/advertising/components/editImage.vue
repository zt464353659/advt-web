<template>
  <div style="padding-bottom:20px;">
    <div class="submit-list">
      <div>
        <el-form :model="imageForm" size="small">
          <el-form-item prop="url">
            <el-input
              type="textarea"
              v-model="imageForm.url"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="请输入内容，一行填写一个url"
            ></el-input>
            <p v-if="showUrlError">请输入正确的url</p>
            <p style="display: flex;justify-content: space-between;">
              <span class="tip-color"> <i class="el-icon-warning"></i>一行填写一个图片url，最多可添加12个 (仅允许添加jpg、jpeg、png、gif类型图片url)</span>
              <el-button :disabled="editPicList.length >= 12" type="primary" size="mini" @click="addUrl">添加</el-button>
            </p>
          </el-form-item>
          <div style="text-align: left;">
          </div>
        </el-form>
      </div>
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
        <el-button size="mini" :disabled="editPicList.length >= 12 || !list.length" type="primary" @click="handleAddPicture">添加istore图片</el-button>
      </div>
    </div>
    <!--<div v-show="canAdd && list.length" class="image-title">可添加图片</div>-->
    <div v-if="canAdd && list.length && refresh" class="select-list" :key="dateTime">
      <div v-for="(element, index) in list" :key="index" class="list-complete-item">
        <div class="list-complete-item-handle2" @click="pushEle(element)">
          <img class="inner-image" :src="element.thumb_image_path" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'DragImage',
  components: {},
  filters: {},
  data() {
    return {
      dateTime: Date.now(),
      canAdd: false,
      pictureShow: false,
      refresh: true,
      editPicList: [],
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      },
      list: [],
      oldList: [],
      imageForm: {
        url: ''
      },
      showUrlError: false
    }
  },
  props: {
    pictureList: {
      type: Array,
      required: true
    },
    isEdit: Boolean,
    pictures: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    isEdit: {
      immediate: true,
      handler(val) {
        this.editPicList = this._.cloneDeep(this.pictureList)
        this.oldList = this._.cloneDeep(this.editPicList)
        this.resetPicShow()
      }
    },
    editPicList: {
      immediate: true,
      deep: true,
      handler() {
        this.$emit('emit-update-pictureList', this.editPicList)
      }
    }
  },
  created() {
    //过滤掉所有重复图片
    this.list = this._.filter(this._.cloneDeep(this.pictures), (value, index) => {
      if (!this._.some(this.pictureList, { 'image_path': value.image_path, 'thumb_image_path': value.thumb_image_path })) {
        return value
      }
    })
  },
  methods: {
    clearUrl() {
      this.imageForm.url = ''
    },
    formatUrl() {
      const urlList = this._.uniq(this._.compact(this.imageForm.url.split('\n').map(v => v.trim())))
      let str = ''
      urlList.map((v, k) => {
        if (v.trim()) {
          if (k !== urlList.length - 1) {
            str += `${v.trim()}\n`
          } else {
            str += `${v.trim()}`
          }
        }
      })
      this.imageForm.url = str
    },
    addUrl() {
      this.formatUrl()
      const data = this.imageForm.url.split('\n')
      // 验证url格式 允许接收 png jpg gif jpeg 类型
      const reg = /^((http:\/\/|https:\/\/))[^\s]*(\.png|\.jpg|\.gif|\.jpeg)$/
      if (data.every(v => reg.test(v))) {
        // 验证通过
        this.showUrlError = false
        let addUrl = data.map(v => {
          return { image_path: v, thumb_image_path: v, is_istore: 0 }
        })
        addUrl = this._.uniqBy(addUrl, 'image_path')
        addUrl.length = 12 - this.editPicList.length
        addUrl = this._.compact(addUrl)
        // 去空值
        const addList = []
        const imageList = this.editPicList.map(v => v.image_path)
        addUrl.forEach(v => {
          if (!imageList.includes(v.image_path)) {
            addList.push(v)
          }
        })
        if (addList.length) {
          this.editPicList = this.editPicList.concat(addList)
          this.imageForm.url = data.slice(addList.length).join('\n')
          this.$emit('emit-update-pictureList', this.editPicList)
          this.$message.success(`成功添加前${addList.length}张图片`)
        } else {
          this.$message.warning('图片已存在')
        }
      } else {
        this.showUrlError = true
      }
    },
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
      // 多于12张图片时提示，不再添加
      if (this.editPicList.length >= 12) {
        this.$message.error('最多选择12张图片')
        this.canAdd = false
        return
      }
    },
    isNotInList1(v) {
      return !this.editPicList.some(k => v.image_path === k.image_path)
    },
    updateList(val) {
      if (this.oldList.length !== val.length) {
        let list1 = this.oldList.map(v => v.image_path)
        let list2 = val.map(v => v.image_path)
        let delId = this._.difference(list1, list2)[0]
        this.editPicList = val
        this.$emit('emit-update-pictureList', this.editPicList)
        if (!this.list.some(v => v.image_path === delId)) {
          this.list = this.list.concat(this.oldList.filter(v => v.image_path === delId))
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
      // 多于12张图片时提示，不再添加
      if (this.editPicList.length >= 12) {
        this.$message.error('最多选择12张图片')
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
        if (item.thumb_image_path === ele.thumb_image_path) {
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
  padding-top: 5px;
  background-color: #ebeef5;
  border-radius: 5px;
  margin-top: 5px;
  min-height: 136px;
}

.add-btn {
  margin: 5px 0px 0px 10px;
}

.select-list {
  display: flex;
  flex-wrap: wrap;
  padding-top: 5px;
  background-color: #ebeef5;
  border-radius: 5px;
  margin-top: 5px;
  min-height: 136px;
  max-height: 255px;
  overflow: auto;
}

.image-title {
  margin: 0px;
  padding: 0 0 0 10px;
  font-size: 16px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-complete-enter,
.list-complete-leave-active {
  opacity: 0;
}

.el-form-item {
  .el-form-item__content {
    p {
      margin: 5px 0 0 0;
      color: #F56C6C;
      font-size: 12px;
    }
  }
}

.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
}
</style>
