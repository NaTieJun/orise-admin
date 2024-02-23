<script>
import { getCosConfig, getVideoPic, upload } from '@/api/common'
import { AwsUpload } from "@/utils/aws";
import { dateFormat, uuid } from '@/utils/index'
import Video from 'video.js'
import Cos from 'cos-js-sdk-v5'
import BenzAMRRecorder from 'benz-amr-recorder'
import MP4Box from 'mp4box'

export default {
  components: {},
  props: {
    // 单文件上传时使用
    fileUrl: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },

    // 多文件上传时使用，例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]
    fileList: {
      type: Array,
      default: () => []
    },

    // 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file)
    type: {
      type: String,
      default: '0',
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['0', '1', '2', '3'].includes(value)
      }
    },
    // 上传文件大小不能超过 maxSize MB, 各类型有默认限制 参见: maxSizeDefault
    maxSize: {
      type: Number,
      default: undefined
    },
    // 图片的宽高像素限制 [width(number), height(number)],默认null不限制
    maxImgPx: {
      type: Array,
      default: null // () => [100, 100]
    },
    // 允许上传的文件格式后缀名 eg:["jpg", "png"]，['*']为不限制，各类型有默认限制 参见: formatDefault
    format: {
      type: Array,
      default: undefined
    },
    // 选择上传文件类型, 用于过滤系统选择文件类型, 默认根据类型自动匹配：见 acceptAuto，
    accept: {
      type: String,
      default: ''
    },
    // 是否能上传多个
    multiple: {
      type: Boolean,
      default: false
    },
    // multiple为true是有效，最多上传几个,默认不限制，最小为1，大于1是自动开启可多选,
    limit: {
      type: Number,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: false,

      fileUrlWatch: this.fileUrl,
      fileNameWatch: this.fileName,
      fileListWatch: this.fileList,

      picUrl: '', // 视频第一帧
      file: undefined,
      speed: 0, // 上传网速
      percentage: 0, //上传进度
    }
  },
  watch: {
    fileUrl: {
      handler(value) {
        this.fileUrlWatch = value
      }
    },
    fileName: {
      handler(value) {
        this.fileNameWatch = value
      }
    },
    fileList: {
      handler(value) {
        this.fileListWatch = value
      }
    },
    loading(val) {
      this.$emit('loadingChange', val)
    }
  },
  computed: {
    // 识别选择文件类型
    acceptAuto() {
      return ['image/*', 'amr/*', 'video/*'][this.type]
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    upload() {
      this.loading = true
      let file = undefined
      if (!this.multiple || this.limit == 1) {
        file = this.file
      } else {
        // 多选上传是多次调用单传的
        file = this.file.shift()
      }
      let date = new Date()

      this.percentage = 0

      // 进度条
      const uploadProgressEvent = progressEvent => {
        console.log(progressEvent)
        this.percentage = Math.floor((progressEvent.loaded * 95) / progressEvent.total) * 100
      }

      const fileFormData = new FormData();
      fileFormData.append("file", file);

      upload(fileFormData, uploadProgressEvent)
        .then(res => {
          this.percentage = 100
          console.log(res)
          let url = res.data.url
          let name = res.data.name

          // this.type == 2
          //   ? //获取视频第一帧画面
          //   getVideoPic({ url: location }).then((res) => {
          //     this.loading = false
          //     this.$emit('getPicUrl', res.data.url)
          //   })
          //   : (this.loading = false)
          this.loading = false

          // 使用本地链接提供预览，避免上传后下载的问题
          // let url = window.URL.createObjectURL(file)

          if (!this.multiple) {
            this.fileUrlWatch = url
            this.$emit('update:fileUrl', url)
            this.$emit('update:fileName', name)
            this.fileNameWatch = name
          } else {
            this.fileListWatch = this.fileListWatch.concat({ name, url })
            this.$emit('update:fileList', this.fileList.concat({ name, url: url }))
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.error('上传失败，请稍后再试')
        });
    },
    remove(i) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let clone = JSON.parse(JSON.stringify(this.fileList))
        this.fileListWatch.splice(i, 1)
        clone.splice(i, 1)
        this.$emit('update:fileList', clone)
      })
    },
    handleExceed(file, fileList) {
      this.$message.error('最多上传' + this.limit + '张')
      this.loading = false
    },
    async handleBeforeUpload(file, filelist) {
      this.loading = true
      let isFormat = true
      let isSize = true

      // type： 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file)

      // 统一校验文件后缀名格式
      // 如果没有显示配置 format 格式限制，则使用默认下面校验
      let format = this.format
      let tip = ''
      if (!format || !format.length) {
        let formatDefault = {
          0: { tip: 'png/jpg', value: ['png', 'jpg', 'jpeg'] },
          1: { value: ['amr'] },
          2: { value: ['mp4'] },
          3: { tip: 'word/pdf/ppt', value: ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'pps', 'pptsx'] }
        }
        format = formatDefault[this.type].value
        tip = formatDefault[this.type].tip
      }
      let match = file.name.match(/\.(\w+)$/g)
      let fileFormat = match && match[0].replace('.', '').toLowerCase()
      isFormat = format[0] === '*' || format.includes(fileFormat)
      if (!isFormat) {
        this.$message.error('文件格式错误，仅支持 ' + (tip || format.join('，')) + ' 格式!')
        this.loading = false
        return Promise.reject()
      }

      // 统一校验文件体积
      // 如果没有显式配置 maxSize 限制大小，则使用下面默认值，单位 MB，
      let maxSize = this.maxSize
      if (!maxSize) {
        let maxSizeDefault = { 0: 2, 1: 2, 2: 100, 3: 50 }
        maxSize || (maxSize = maxSizeDefault[this.type])
      }
      isSize = file.size / 1024 / 1024 < maxSize
      if (!isSize) {
        this.$message.error('上传文件大小不能超过 ' + maxSize + 'MB!')
        this.loading = false
        return Promise.reject()
      }

      // 各类型独有的校验
      let validate = true
      if (this.type === '0') {
        // 图片
        let maxImgPx = this.maxImgPx
        if (maxImgPx) {
          try {
            await new Promise((resolve) => {
              let width, height
              let image = new Image()
              //加载图片获取图片真实宽度和高度
              image.onload = () => {
                width = image.width
                height = image.height
                if (width > maxImgPx[0]) {
                  validate = false
                  this.$message.error(`图片“宽”度超过${maxImgPx[0]}像素，请重新选择`)
                } else if (height > maxImgPx[1]) {
                  this.$message.error(`图片“高”度超过${maxImgPx[1]}像素，请重新选择`)
                  validate = false
                }
                window.URL && window.URL.revokeObjectURL(image.src)
                resolve()
              }
              if (window.URL) {
                let url = window.URL.createObjectURL(file)
                image.src = url
              } else if (window.FileReader) {
                let reader = new FileReader()
                reader.onload = function (e) {
                  let data = e.target.result
                  image.src = data
                }
                reader.readAsDataURL(file)
              }
            })
          } catch (e) {
            console.error(e)
          }
        }
      } else if (this.type === '1') {
        // 语音
        let amr = new BenzAMRRecorder()
        try {
          await amr.initWithBlob(file)
          validate = amr.getDuration() <= 60
          if (!validate) {
            this.$message.error('上传文件时长不能超过 60秒!')
          }
        } catch (error) {
          console.log(error)
          this.$message.error('文件已损坏')
        }
      } else if (this.type === '2') {
        // 视频
        let result = await this.checkVideoCode(file)
        if (result.mime.indexOf('video/mp4') === -1) {
          this.$message.error('mp4 格式不正确, 请使用标准编码视频!')
          this.loading = false
          return Promise.reject()
        }
      } else if (this.type === '3') {
        // 普通文件
      }
      if (!validate) {
        this.loading = false
      }
      // if (beforeUpload) {
      //   return beforeUpload(file)
      // }
      if (!this.multiple || this.limit == 1) {
        this.file = file
      } else {
        Array.isArray(this.file) || (this.file = []) // 多选
        this.file.push(file)
      }
      return validate || Promise.reject()
    },
    onError(err, file, fileList) {
      this.loading = false
      this.$message.error('上传文件失败')
    },
    checkVideoCode(file) {
      return new Promise((resolve, reject) => {
        const mp4boxFile = MP4Box.createFile()
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = function (e) {
          const arrayBuffer = e.target.result
          arrayBuffer.fileStart = 0
          mp4boxFile.appendBuffer(arrayBuffer)
        }
        mp4boxFile.onReady = function (info) {
          resolve(info)
        }
        mp4boxFile.onError = function (info) {
          reject(info)
        }
      })
    },
    showView(index) {
      let imager = index !== undefined ? this.$refs.image[index] : this.$refs.image
      imager.clickHandler()
      this.$nextTick(() => {
        // 为遮罩层添加关闭事件
        let maskEl = imager.$children[0].$refs['el-image-viewer__wrapper'].firstChild
        maskEl.addEventListener('click', () => {
          event.stopPropagation()
          imager.closeViewer()
        })
      })
      // this.$refs.image.$refs.closeViewer();
    },
    dealFileName(fileName){
      if(fileName == null) return fileName;
      var arr = fileName.split('/')
      return arr[arr.length - 1]
    }
  }
}
</script>

<template>
  <div>
    <!-- 多个上传文件列表展示 -->
    <template v-if="multiple">
      <!-- 图片 -->
      <template v-if="type == 0">
        <!-- <transition-group> -->
        <div v-for="(item, index) in fileListWatch" :key="index" class="img-item">
          <el-image ref="image" class="upload-img" :src="item.url" fit="contain"
            :preview-src-list="fileListWatch.map((e) => e.url)" alt />
          <div class="action-mask">
            <i class="el-icon-search mr5" @click="showView(index)"></i>
            <!-- <span v-if="action.includes('download')" @click="download(item)">
                <i class="el-icon-download"></i>
              </span>-->
            <i class="el-icon-delete mr5" @click="remove(index)" v-if="!disabled"></i>
          </div>
        </div>
        <!-- </transition-group> -->
      </template>
      <!-- 后续再这里扩展其他文件列表 -->
    </template>

    <el-upload ref="multPic" class="uploader" action="/api" :accept="accept || acceptAuto" :http-request="upload"
      :data="{ mediaType: type }" :show-file-list="false" :file-list="fileListWatch" :disabled="loading || disabled"
      :multiple="multiple && limit != 1" :limit="limit" :on-error="onError" :on-exceed="handleExceed"
      :before-upload="handleBeforeUpload">
      <!--
        element-loading-text="正在上传..."
          :on-success="onSuccess"
        -->

      <slot>
        <i v-if="!loading && !fileUrlWatch && !disabled" class="el-icon-plus uploader-icon upload-action"></i>

        <transition>
          <!-- 上传精度条 -->
          <div class="upload-action" v-if="loading">
            <el-progress class="progress cc" type="circle" :percentage="percentage"></el-progress>
            <div class="el-loading-spinner">
              <svg viewBox="25 25 50 50" class="circular">
                <circle cx="50" cy="50" r="20" fill="none" class="path" />
              </svg>
            </div>
            <div class="cc" style="margin-top: 35px;">{{ speed + 'M/s' }}</div>
          </div>

          <!-- 单文件上传的文件展示 -->
          <template v-if="!loading && fileUrlWatch && !multiple">
            <div v-if="type === '0'">
              <el-image v-if="fileUrlWatch" ref="image" :src="fileUrlWatch" class="upload-img"
                :preview-src-list="[fileUrlWatch]" fit="contain" />

              <div class="action-mask" @click.self.stop>
                <i class="el-icon-search" @click.prevent.stop="showView()"></i>
                <i class="el-icon-edit"></i>
                <!-- <span v-if="action.includes('download')" @click.prevent.stop="download(item)">
                <i class="el-icon-download"></i>
                  </span>-->
                <!-- <span @click.prevent.stop="remove()">
                    <i class="el-icon-delete"></i>
                  </span>-->
              </div>
            </div>
            <div v-else-if="type === '2'">
              <video ref="video" id="myVideo" class="video-js vjs-default-skin vjs-big-play-centered" width="100%"
                controls webkit-playsinline="true" playsinline="true" :autoplay="false" :key="fileUrlWatch"
                preload="auto">
                <source :src="fileUrlWatch" type="video/mp4" />
              </video>
              <div class="action-mask" style="height: 50%;" @click.self.stop>
                <i class="el-icon-edit"></i>
              </div>
            </div>
            <div v-else class="al">
              {{ dealFileName(fileNameWatch) || fileUrlWatch }}
              <i class="el-icon-edit ml10"></i>
              <!-- a链接用本地视频打不开，视频地址使用远程地址 -->
              <a @click.stop :href="/\.mp4$/.test(fileNameWatch) ? fileUrl : fileUrlWatch" target="_blank">
                <i class="el-icon-view ml10" style="vertical-align: middle;"></i>
              </a>
            </div>
          </template>
        </transition>
      </slot>
    </el-upload>

    <!-- 上传格式，大小等提示语 -->
    <div class="tip">
      <slot name="tip"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep.uploader {
  display: inline-block;
  vertical-align: middle;

  .el-upload {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
}

.upload-action {
  width: 178px;
  height: 178px;
  position: relative;
  text-align: center;
}

.uploader-icon {
  display: block;
  font-size: 28px;
  line-height: 178px;
  text-align: center;
  color: #8c939d;
  border-radius: 6px;
  border: 1px dashed #d9d9d9;
  transition: all 0.3s;

  &:hover {
    border-color: $blue;
    color: $blue;
  }
}

.progress {
  overflow: hidden;
}

.upload-img {
  width: 178px;
  height: 178px;
  display: block;
}

.tip {
  color: #aaa;
  font-size: 12px;
}

.img-item {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin: 0 10px 10px 0;
  transition: all 0.3s;
}

.action-mask {
  position: absolute;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 30px;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: pointer;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  transition: opacity 0.3s;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.action-mask:hover {
  opacity: 1;
}
</style>
