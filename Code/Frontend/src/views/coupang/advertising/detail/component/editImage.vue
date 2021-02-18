<template>
  <div class="no-back-ground" style="padding-bottom:20px;" v-loading="editloading">
    <div class="submit-list">
      <transition name="fade">
        <div style="width: auto;min-height: 80px">
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
      </transition>
      <div class="add-btn">
        <!--        <el-button size="mini" :disabled="editPicList.length >= maxLength || !list.length" type="primary" @click="handleAddPicture">添加istore图片</el-button>-->
        <div>
          <form enctype="multipart/form-data">
            <label :for="`file${isVariChild||''}`" :class="editPicList.length >= maxLength?'is-disabled':''" class="filelabel el-button el-button--primary">上传本地图片</label>
            <input type="file"
                   multiple
                   ref="input_file"
                   :id="`file${isVariChild||''}`"
                   style="display: none"
                   @change="uploadimg"
                   accept="image/*"
                   :disabled="editPicList.length >= maxLength"
            />
          </form>
        </div>
        <div class="tip-color">
          <i class="el-icon-warning"></i>
          最多上传10张图片,默认第一张为主图。
        </div>
      </div>
    </div>
    <driver-expand v-bind="{ optTitle: '选择istore图片'}">
      <div style="display:inline-block" slot="btn-group">
      </div>
      <div slot="content">
        <div class="select-list" :key="dateTime">
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
function delay(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, num)
  })
}

import { batchuploadoss } from '@/api/coupang'
import DriverExpand from '@/components/driverExpand'

export default {
  name: 'DragImage',
  components: {
    DriverExpand
  },
  filters: {},
  data() {
    return {
      // refresh: true,
      dateTime: Date.now(),
      canAdd: false,
      pictureShow: false,
      editPicList: [],
      list: [],
      oldList: [],
      editloading: false
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
      type: [Array, Object],
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
    isVariChild: {
      type: Number,
      default: -1
    },
    //本地上传所需参数
    editimgageAction: {
      type: Object,
      default: () => {
      }
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
    // 保存istore_image_all图片
    this.list = this._.cloneDeep(this.pictures)
  },
  methods: {
    //--------------本地图片上传-----------------------
    uploadimg(event) {
      console.log(this.$refs['input_file'].value)
      console.log(event.target.files)
      let files = event.target.files
      const list = []

      function imgarr(item) {
        return new Promise((resolve, reject) => {
          const myimg = URL.createObjectURL(item)
          const img = new Image()
          img.src = myimg
          img.onload = function() {
            if (!['jpg', 'jpeg', 'png'].includes(item.type.split('/')[1])) {
              reject('图片格式需要为jpg/jpeg/png格式')
            } else if (item.size / 1024 / 1024 > 3) {
              reject('图片大小需要小于3M')
            } else if (img.width / img.height !== 1) {
              reject('图片需要为长宽相等的绝对正方形')
            } else if ((img.width < 500 || img.width > 5000) || (img.height < 500 || img.height > 5000)) {
              reject('图片尺寸（最小500*500，最大5000*5000）')
            } else {
              resolve(item)
            }
          }
        })
      }

      this._.forEach(files, async(item, index) => {
        list.push(imgarr(item))
      })
      Promise.all(list).then(res => {
        this.checkout(files)
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.$refs['input_file'].value = ''
      })
    },
    checkout(files) {
      if (!files.length) {
      } else if ((this.editPicList.length + Object.keys(files).length) > this.maxLength) {
        this.$message.error(`添加后的图片总数大于${this.maxLength}张`)
      } else {
        this.uposs(files)
      }
      this.$refs['input_file'].value = ''
    },
    uposs(files) {
      this.editloading = true
      const obj = this._.cloneDeep(this.editimgageAction)
      let formData = new FormData()
      formData.append('not_show_message', true)
      this._.forEach(files, (item) => {
        formData.append(`file[]`, item)
      })
      for (let i in obj) {
        formData.append(i, obj[i])
      }
      console.dir(formData.get('file'))
      batchuploadoss(formData).then(async res => {
        console.log(res)
        if (res.data) {
          for (let index = 0; index < res.data.length; index++) {
            this.pushEle({
              'image_path': res.data[index].url,
              'istore_product_id': res.data[index].istore_product_id,
              'thumb_image_path': res.data[index].thumb_url
            })
            await delay(10)
          }
        } else {
          this.$message.error(res.message)
        }
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        this.editloading = false
      })
    },

    //---------------------------------
    resetPicShow() {
      this.pictureShow = false
      this.$nextTick(() => {
        this.pictureShow = true
      })
    },
    // 添加图片
    // handleAddPicture() {
    //   this.canAdd = true
    // },
    checkMove(ele) {
      // 多于this.maxLength张图片时提示，不再添加
      if (this.editPicList.length >= this.maxLength) {
        this.$message.error(`最多选择${this.maxLength}张图片`)
        // this.canAdd = false
      }
    },
    isNotInList1(v) {
      return !this.editPicList.some(k => v[this.pictureKey] === k[this.pictureKey])
    },
    updateList(val) {
      // 增加或删除图片
      if (this.oldList.length !== val.length) {
        let list1 = this.oldList.map(v => v[this.pictureKey])
        let list2 = val.map(v => v[this.pictureKey])
        let delId = this._.difference(list1, list2)[0]
        this.editPicList = val
        //this.$emit('emit-update-pictureList', this.editPicList)
        if (!this.list.some(v => v[this.pictureKey] === delId) && this.pictures.some(v => v[this.pictureKey] === delId)) {
          this.list = this.list.concat(this.oldList.filter(v => v[this.pictureKey] === delId))
        }
        // this.refresh = false
        // this.$nextTick(() => {
        //   this.refresh = true
        // })
      } else {
        // 排序
        this.editPicList = val
      }
    },
    pushEle(ele) {
      // 多于this.maxLength张图片时提示，不再添加
      if (this.editPicList.length >= this.maxLength) {
        this.$message.error(`最多选择${this.maxLength}张图片`)
        // this.canAdd = false
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
      // this.oldList = this._.cloneDeep(this.list)
      // 可添加无图片时收起
      // if (!this.list.length) {
      //   this.canAdd = false
      // }
    },
    setData(dataTransfer) {
      dataTransfer.setData('Text', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.filelabel {
  padding: 7px 15px;
}

.add-btn {
  margin: 4px 0px 0px 10px;

  div {
    display: inline-block;
  }
}

.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
  display: inline-block
}

.price-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff;
}

.submit-list {
  padding: 5px;
  border-radius: 5px;
  min-height: 136px;
  border: 1px dotted #dedede;
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

.select-list::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  /*color: red;*/
}

.select-list::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ccc;
}

.select-list::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
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
