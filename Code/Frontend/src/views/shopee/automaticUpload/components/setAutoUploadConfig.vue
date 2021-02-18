<template>
  <el-dialog
    title="修改自动上传配置"
    class="dialog-add-upload-plan dialog-limit-height"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="700px"
    v-dragMove
  >
    <template>
      <el-form
        ref="formData"
        :model="formData"
        :rules="rules"
        size="mini"
        label-width="140px"
        @submit.native.prevent
      >
        <el-form-item label="自动上传广告" prop="is_auto_upload">
          <el-radio-group v-model="formData.is_auto_upload">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="每日推送数量" prop="limit_num" v-if="showbox">
          <el-input
            type="text"
            v-model="formData.limit_num"
            value=""
            style="width: 100px"
          ></el-input>
          <span class="color">必须为大于0的整数</span>
        </el-form-item>
        <el-form-item
          label="创建广告产品来源"
          prop="upload_type"
          v-if="showbox"
        >
          <el-radio-group v-model="formData.upload_type">
            <el-radio label="1">有销量产品(全平台60天有销量)</el-radio>
            <el-radio label="2">按live日期筛选</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="time" v-if="show && showbox">
          <el-date-picker
            v-model="formData.time"
            type="daterange"
            range-separator="至"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="confirm" v-debounce>确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { storeDisabled } from "@/api/shopee";
import { filterQueryParams } from "@/utils/help";

export default {
  data() {
    const limit_num = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("不能为空"));
      }
      const reg = /^[0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error("必须是整数，不能包含其他非法字符"));
      }
      if (parseFloat(value) <= 0) {
        callback(new Error("必须为大于0的整数"));
      }
      callback();
    };
    const time = (rule, value, callback) => {
      if (this.show) {
        if (value.filter((d) => d).length === 0) {
          callback(new Error("时间不能为空"));
        }
        callback();
      } else {
        callback();
      }
    };
    return {
      showbox: false, //是否启用
      show: false, //时间选择器组件显示
      formData: {
        account_id: undefined,
        is_auto_upload: "0", //自动上传广告
        limit_num: undefined, //数量限制
        upload_type: "1", //上传类型
        time: [], //原始时间
        start_time: undefined, //开始时间
        end_time: undefined, //结束时间
      },
      rules: {
        limit_num: [{ required: true, validator: limit_num, trigger: "blur" }],
        time: [{ required: true, validator: time, trigger: "blur" }],
      },
    };
  },
  props: {
    newobj: {
      type: Object,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  created() {},
  mounted() {},
  computed: {},
  methods: {
    confirm() {
      let obj = {};
      if (this.formData.is_auto_upload === "0") {
        obj = {
          account_id: this.formData.account_id,
          is_auto_upload: this.formData.is_auto_upload,
        };
      } else {
        this.$refs["formData"].validate((valid) => {
          if (valid) {
            obj = filterQueryParams(this.formData);
            delete obj.time;
            if (this.show) {
              obj.start_time = this.formData.time[0];
              obj.end_time = this.formData.time[1];
            }
          }
        });
      }
      if (Object.keys(obj).length > 0) {
        storeDisabled(obj)
          .then((res) => {})
          .finally(() => {
            this.onClose();
          });
      }
    },
    onClose() {
      this.$emit("update:open", false);
      this.$emit("reload");
      this.$refs.formData.resetFields();
    },
  },
  filters: {},
  watch: {
    open: {
      handler(val) {
        if (val) {
          let obj = this._.cloneDeep(this.newobj);
          this.formData = {
            account_id: obj.account_id,
            is_auto_upload: obj.is_auto_upload, //自动上传广告
            limit_num: obj.limit_num || 0, //数量限制
            upload_type: obj.upload_type ? obj.upload_type + "" : "1", //上传类型
            time: [
              obj.start_time ? obj.start_time : "",
              obj.end_time ? obj.end_time : "",
            ], //原始时间
            start_time: undefined, //开始时间
            end_time: undefined, //结束时间
          };
        }
      },
    },
    "formData.is_auto_upload": function () {
      this.showbox = !this.showbox;
    },
    "formData.upload_type": function (newvalue) {
      this.show = !this.show;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.color {
  color: red;
}
</style>
