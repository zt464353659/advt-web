<template>
  <div style="padding-bottom:20px;">
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
        ></PictureView>
      </div>
      <div class="add-btn">
        <el-button size="mini" :disabled="editPicList.length >= 9 || !pictures.length" type="primary" @click="handleAddPicture">添加图片</el-button>
      </div>
    </div>
    <div v-show="canAdd && pictures.length" class="image-title">可添加图片</div>
    <div v-show="canAdd && pictures.length" class="select-list">
      <div v-for="(element, index) in pictures" :key="index" class="list-complete-item">
        <div class="list-complete-item-handle2" @click="pushEle(element)">
          <img class="inner-image" :src="element" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getPictures } from '@/api/shopee'

  export default {
    name: 'DragImage',
    components: {},
    filters: {},
    data() {
      return {
        pictures: [],
        canAdd: false,
        pictureShow: false,
        editPicList: []
      }
    },
    props: {
      pictureList: {
        type: Array,
        required: true
      },
      isEdit: Boolean,
      advtId: {
        type: Number,
        default: 0
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
      editPicList: {
        immediate: true,
        deep: true,
        handler() {
          this.$emit('emit-update-pictureList', this.editPicList)
        }
      }
    },
    created() {
      getPictures(this.advtId).then(res => {
        this.pictures = res.data
      })
    },
    mounted() {
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
        // 多于9张图片时提示，不再添加
        if (this.editPicList.length >= 9) {
          this.$message.error('最多选择9张图片')
          this.canAdd = false
          return
        }
      },
      isNotInList1(v) {
        return this.editPicList.every(k => v !== k)
      },
      updateList(val) {
        this.editPicList = val
        this.$emit('emit-update-pictureList', this.editPicList)
      },
      pushEle(ele) {
        // 多于9张图片时提示，不再添加
        if (this.editPicList.length >= 9) {
          this.$message.error('最多选择9张图片')
          this.canAdd = false
          return
        } else {
          if (this.isNotInList1(ele)) {
            this.editPicList = [...this.editPicList, ele]
          }
        }
        for (const item of this.pictures) {
          if (item === ele) {
            const index = this.pictures.indexOf(item)
            this.pictures.splice(index, 1)
            break
          }
        }
        // 可添加无图片时收起
        if (!this.pictures.length) {
          this.canAdd = false
        }
      },
      setData(dataTransfer) {
        // to avoid Firefox bug
        // Detail see : https://github.com/RubaXa/Sortable/issues/1012
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

  .list-complete-item.sortable-chosen {
    /*background: #4AB7BD;*/
  }

  .list-complete-item.sortable-ghost {
    /*background: #30B08F;*/
  }

  .list-complete-enter,
  .list-complete-leave-active {
    opacity: 0;
  }
</style>
