<!-- 系统导航 -->
<template>
  <div v-if="sysList.length > 0 ? 1 : 0">
    <el-drawer class="box" :visible.sync="drawer2" :with-header="false" :direction="direction" :append-to-body="true">
      <div class="main">
        <el-row class="sliderMenu">
          <el-col class="nameCard" :span="8" v-for="(item, index) in sysList" :key="index">
            <el-card @click.native="jumpNext(item)" shadow="hover" :class="{ activeColor: code.systemCode === item.usId }">
              {{ item.usName }}
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { sysTree } from '@/api/login'
import Cookies from 'js-cookie'
export default {
  name: '',
  data() {
    return {
      sysList: [],
      drawer2: false,
      code: '',
      direction: 'ltr'
    }
  },
  props: {
    drawer: {
      type: [Boolean, Object],
      default: false
    }
  },
  // 监听抽屉状态
  watch: {
    drawer(val) {
      this.drawer2 = val
      if (!val) {
        this.drawer2 = true
      }
      // this.$nextTick(() => {
      //   console.log(document.querySelector('.v-modal'))
      // })
    }
  },
  created() {
    this.getList()
    this.code = JSON.parse(Cookies.get('urlInfo'))
  },
  methods: {
    getList() {
      sysTree()
        .then((res) => {
          console.log(res)
          this.sysList = res.data
        })
        .catch((e) => {})
    },
    jumpNext(i) {
      console.log(i, 's')
      // BASE64 加密编码
      const code = JSON.parse(Cookies.get('urlInfo'))
      let object = {
        userId: code.userId,
        systemCode: i.usId,
        username: code.username,
        ip: Cookies.get('userIp'),
        token: code.token
        // originUrl: window.location.href （后端校验token不通过，后期后端做处理后，在子系统可用传递的URL做回退，先写死）
      }
      // console.log(object, "obj")
      object = JSON.stringify(object)
      const Base64 = require('js-base64').Base64
      const urlCode = Base64.encode(object)
      const urlstr = `http://${i.usUrl}?code=${urlCode}`
      window.open(urlstr)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  ::v-deep .el-drawer[aria-labelledby="el-drawer__title"] {
    width: 64% !important;
    min-width:400px;
    max-width: 500px;
  }
}
.main {
  width: 100%;
  height: 100%;
  .sliderMenu {
    display: flex;
    width: 100%;
    // height: 100%;
    flex-wrap: wrap;
  }
  ::v-deep .nameCard {
    width: 44%;
    margin-top: 0.5rem;
    margin-left: 1rem;
    font-size: 0.95rem;
    border-radius: 3px;
  }

  ::v-deep .el-card__body {
      border: 0;
      background: none;
      text-transform: uppercase;
      color: #4361ee;
      font-weight: bold;
      position: relative;
      outline: none;
      // padding: 10px 20px;
      box-sizing: border-box;
  }

  ::v-deep .el-card__body::before,
  ::v-deep .el-card__body::after {
      box-sizing: inherit;
      position: absolute;
      content: '';
      border: 2px solid transparent;
      width: 0;
      height: 0;
  }

  ::v-deep .el-card__body::after {
      bottom: 0;
      right: 0;
  }

  ::v-deep .el-card__body::before {
      top: 0;
      left: 0;
  }

  ::v-deep .el-card__body:hover::before,
  ::v-deep .el-card__body:hover::after {
      width: 100%;
      height: 100%;
  }

  ::v-deep .el-card__body:hover::before {
      border-top-color: #4361ee;
      border-right-color: #4361ee;
      transition: width 0.15s ease-out, height 0.15s ease-out 0.15s;
  }

  ::v-deep .el-card__body:hover::after {
      border-bottom-color: #4361ee;
      border-left-color: #4361ee;
      transition: border-color 0s ease-out 0.3s, width 0.15s ease-out 0.3s, height 0.15s ease-out 0.5s;
  }

  ::v-deep .el-card__body {
      cursor: pointer;
      border: 0;
      font-weight: bold;
  }

  ::v-deep .activeColor {
      color: #409eff !important;
      pointer-events: none;
      border: 2px solid #4361ee;
      border-radius: 5px;
  }
}
</style>
