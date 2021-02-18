<template>
  <el-row
    class="panel-group"
    :gutter="40"
  >
    <el-col
      :xs="24"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon01">
          <svg-icon
            icon-class="advt01"
            class-name="card-panel-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            创建成功总数
          </div>
          <count-to
            class="card-panel-num"
            :start-val="0"
            :end-val="totalNumberCreateSuccess"
            :duration="duration"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="24"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon02">
          <svg-icon
            icon-class="advt02"
            class-name="card-panel-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            发布成功总数
          </div>
          <count-to
            class="card-panel-num"
            :start-val="0"
            :end-val="totalNumberPublishSuccess"
            :duration="duration"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="24"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon03">
          <svg-icon
            icon-class="advt01"
            class-name="card-panel-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            昨日创建成功总数
          </div>
          <count-to
            class="card-panel-num"
            :start-val="0"
            :end-val="totalNumberCreateSuccessToday"
            :duration="duration"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="24"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon04">
          <svg-icon
            icon-class="advt02"
            class-name="card-panel-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            昨日发布成功总数
          </div>
          <count-to
            class="card-panel-num"
            :start-val="0"
            :end-val="totalNumberPublishSuccessToday"
            :duration="duration"
          />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import CountTo from 'vue-count-to'

  export default {
    components: {
      CountTo
    },
    data() {
      return {
        duration: 3000,
        totalNumberCreateSuccess: 0,
        totalNumberPublishSuccess: 0,
        totalNumberCreateSuccessToday: 0,
        totalNumberPublishSuccessToday: 0
      }
    },
    props: {
      panelData: {
        type: Object,
        required: true
      }
    },
    watch: {
      panelData() {
        this.totalNumberCreateSuccess = parseInt(this.panelData.totalNumberCreateSuccess)
        this.totalNumberPublishSuccess = parseInt(this.panelData.totalNumberPublishSuccess)
        this.totalNumberCreateSuccessToday = parseInt(this.panelData.totalNumberCreateSuccessToday)
        this.totalNumberPublishSuccessToday = parseInt(this.panelData.totalNumberPublishSuccessToday)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .panel-group {
    $blue: #409EFF;
    $success: #67C23A;
    $warning: #E6A23C;
    $danger: #F56C6C;
    margin-top: 18px;
    .card-panel-col {
      margin-bottom: 32px;
    }
    .card-panel {
      height: 108px;
      /*cursor: pointer;*/
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);
      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }
        .icon01 {
          background: $blue;
        }
        .icon02 {
          background: $success;
        }
        .icon03 {
          background: $warning;
        }
        .icon04 {
          background: $danger;
        }
      }
      .icon01 {
        color: $blue;
      }
      .icon02 {
        color: $success;
      }
      .icon03 {
        color: $warning;
      }
      .icon04 {
        color: $danger
      }
      .card-panel-icon-wrapper {
        float: left;
        margin: 14px;
        padding: 12px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }
      .card-panel-icon {
        float: left;
        font-size: 48px;
      }
      .card-panel-description {
        /*float: right;*/
        font-weight: bold;
        margin: 26px 0;
        padding-left: 82px;
        text-align: center;
        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }
        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }
</style>
