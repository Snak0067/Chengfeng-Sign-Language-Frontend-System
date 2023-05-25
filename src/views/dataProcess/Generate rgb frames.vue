<template>
  <div class="local-container">
    <div class="linear-container">
      <div class="tip-container">
        <div class="tip-title">数据预处理 ——— 生成RGB视频帧</div>
        <p class="tip-content">
          本界面展示了数据预处理部分从手语视频中提取RGB视频帧的算法功能
        </p>
        <div>
          <img class="mmpose_img" :src="rgb_frame" alt="人体姿态估计示例图">
        </div>
        <div class="tip-process-title">使用流程介绍</div>
        <div class="tip-process-content">
          <img class="tip-process-img" :src="processImg" alt="流程图图片">
          <div class="tip-process-blocks">
            <div class="tip-process-block">
              <div class="tip-process-block-title">1 上传手语视频</div>
              <div class="tip-process-block-content">
                使用视频处理库（如OpenCV）读取视频文件。通过视频的路径或URL，打开视频文件并获取视频的基本信息，如帧率、分辨率等
              </div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">2 解码帧</div>
              <div class="tip-process-block-content">
                从视频中逐帧读取图像数据。视频处理库提供的函数可以帮助您逐帧解码视频帧
              </div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">3 显示或保存帧</div>
              <div class="tip-process-block-content">
                根据您的需求，可以将处理后的帧数据显示在屏幕上或将其保存为新的视频文件。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="component-item tip-button">
      <el-button v-waves type="primary" @click="dialogOfUpload = true">
        上传手语视频
      </el-button>
    </div>
    <div>
      <div class="block" v-if="imageUrls.length>0">
        <div class="demonstration">RGB分割结果图片展示</div>
        <el-carousel trigger="click" height="160px" class="sliding-windows">
          <el-carousel-item v-for="imgRows in imageUrls" :key="imgRows" class="image-gallery">
            <div class="image-item" v-for="image in imgRows" :key="image.id">
              <img :src="image" alt="Image"/>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    <div class="linear-container">
      <div class="tip-div">
        <span class="tip-span">分离视频RGB帧的视频列表</span>
      </div>
      <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column align="center" label="视频id" width="80">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column width="180px" align="center" label="上传日期">
          <template slot-scope="{row}">
            <span>{{ row.create_time }}</span>
          </template>
        </el-table-column>
        <el-table-column width="220px" align="center" label="视频名称">
          <template slot-scope="{row}">
            <span>{{ row.videoName }}</span>
          </template>
        </el-table-column>
        <el-table-column width="120px" align="center" label="视频标题">
          <template slot-scope="{row}">
            <span>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100px" align="center" label="缩略图">
          <template slot-scope="{row}">
            <img :src="'data:image/jpeg;base64,' +row.img" alt="缩略图" style="max-width: 50px; max-height: 50px;">
          </template>
        </el-table-column>
        <el-table-column min-width="160px" label="视频描述">
          <template slot-scope="{row}">
            <span>{{ row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column class-name="status-col" label="状态" width="130">
          <template slot-scope="{row}">
            <el-tag :type="row.frame_status | statusFilter">
              {{ row.frame_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150px">
          <template slot-scope="{row}">
            <el-button v-if="row.show_extract_button" type="primary" size="small" icon="el-icon-edit"
                       @click="extracting_rgb_frames(row)">
              分离RGB帧
            </el-button>
            <el-button v-else type="success" size="small" icon="el-icon-success" @click="getVideoFrames(row)">
              显示RGB帧
            </el-button>

          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-dialog v-el-drag-dialog :visible.sync="dialogOfUpload" title="上传手语视频" @dragDialog="handleDrag">
        <div>
          <el-form :model="videoText" :rules="videoTextRules">
            <el-form-item prop="title">
              <md-input icon="el-icon-search" v-model="videoText.videoName"
                        name="videoName" placeholder="手语视频名称">
                手语视频名称
              </md-input>
            </el-form-item>
            <el-form-item prop="title">
              <md-input icon="el-icon-search" v-model="videoText.videoDescribe"
                        name="videoDescribe" placeholder="手语视频描述">
                手语视频描述
              </md-input>
            </el-form-item>
            <el-form-item label="手语视频类型" prop="type">
              <el-select v-model="videoText.videoType" class="filter-item" placeholder="Please select">
                <el-option v-for="item in videoTypeOptions" :key="item.key" :label="item.display_name"
                           :value="item.key"/>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <!-- 上传对话框 -->
        <div class="upload-box">
          <el-upload class="upload-demo"
                     action="#" drag multiple
                     :headers="headers"
                     :auto-upload="false"
                     :limit="1"
                     :file-list="fileList"
                     :on-change="handleChange">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">上传 mp4 格式文件</div>
          </el-upload>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogOfUpload = false">取 消</el-button>
          <el-button type="primary" @click="uploadVideos()">上 传</el-button>
        </div>

      </el-dialog>
      <!--      算法加载进度条   -->
      <el-dialog :visible.sync="showProgress" :before-close="handleProgressClose">
        <el-progress :percentage="progressPercentage"></el-progress>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import rgb_frame from '@/views/dataProcess/components/source/rgb_frame.png';
import {fetchList} from '@/api/article'
import elDragDialog from '@/directive/el-drag-dialog'
import MdInput from "@/components/MDinput/index.vue"; // base on element-ui
import editorImage from '@/components/Tinymce/components/EditorImage.vue'
import processImg from "@/views/dataProcess/components/source/progress.png";

const videoTypeOptions = [
  {key: 'AUSTL', display_name: '土耳其手语数据集'},
  {key: 'WLASL', display_name: '美国手语数据集'},
]
export default {
  name: 'Generate rgb frames',
  components: {MdInput, editorImage},
  directives: {elDragDialog},
  filters: {
    statusFilter(status) {
      const statusMap = {
        '已分离RGB帧': 'success',
        '': 'info',
        '未提取RGB帧': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const validate = (rule, value, callback) => {
      if (value.length > 2) {
        callback(new Error('请输入至少2个字符'))
      } else {
        callback()
      }
    }
    return {
      imageUrls: [],
      showProgress: false, // 是否显示进度条弹窗
      progressPercentage: 0, // 进度条百分比
      show_extract_button: true,
      fileList: [],
      videoText: {
        videoName: '',
        videoDescribe: '',
        videoType: '',
      },
      videoTypeOptions,
      videoTextRules: {
        videoName: [{required: true, trigger: 'change', validator: validate}],
        videoDescribe: [{required: true, trigger: 'change', validator: validate}]
      },
      rgb_frame: rgb_frame,
      processImg: processImg,
      list: null,
      listLoading: true,
      dialogOfUpload: false,
      value: '',
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getVideoFrames(row) {
      this.$message({
        message: '获取RGB视频帧成功!',
        type: 'success'
      });
      axios.post('http://127.0.0.1:8000/get_video_frames/', row, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      }).then(response => {
        console.log(response)
        if (response.status === 200) {
          this.$message({
            message: '获取RGB视频帧成功!',
            type: 'success'
          });
          this.imageUrls = response.data.data

        }
      }).catch(error => {
        this.$message({
          message: '获取RGB视频帧失败，请稍后重试...',
          type: 'error'
        });
      });
    },
    handleChange(file, fileList) { //文件数量改变
      this.fileList = fileList;
    },
    handleDrag() {
      this.$refs.select.blur()
    },
    uploadVideos() {
      if (!this.checkUpload()) {
        return;
      }
      const formData = new FormData();
      this.fileList.forEach(file => {
        formData.append('videoFile', file.raw);
      });
      formData.append('videoName', this.videoText.videoName);
      formData.append('videoDescribe', this.videoText.videoDescribe);
      formData.append('videoType', this.videoText.videoType);
      axios.post('http://127.0.0.1:8000/uploadVideo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          if (response.status === 200) {
            this.$message({
              message: '上传成功!',
              type: 'success'
            });
            this.videoText.videoName = ''
            this.videoText.videoDescribe = ''
            this.fileList = []
            this.dialogOfUpload = false
          }
          this.getList()

        })
        .catch(error => {
          alert('上传失败，请稍后重试...')
          console.log(error);
        });
    },
    checkUpload() {
      if (!this.videoText.videoName) {
        alert('视频名称不能为空');
        return false;
      }
      if (!this.videoText.videoDescribe) {
        alert('视频描述不能为空');
        return false;
      }
      if (this.fileList.length === 0) {
        alert('请先选择视频文件');
        return false;
      }
      const fileType = this.fileList[0].name.split('.').pop().toLowerCase();
      if (!['mp4', 'avi', 'mov'].includes(fileType)) {
        alert('只能上传 mp4、avi 或 mov 格式的视频');
        return false;
      }
      for (let i = 0; i < this.fileList; i++) {

      }
      return true;
    },
    async getList() {
      this.listLoading = true
      const videolist = () => {
        return axios.post('http://127.0.0.1:8000/video_list/', {}, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        })
      }

      const {data} = await videolist()
      this.list = data.data.videolist
      this.listLoading = false
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    handleProgressClose() {
      this.progressPercentage = 0
    },
    extracting_rgb_frames(row) {
      // this.listLoading = true
      // 显示进度条弹窗
      this.showProgress = true
      let progress = 0
      const timer = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 5
        if (progress > 95) {
          clearInterval(timer)
          return
        }
        this.progressPercentage = progress
      }, 700)
      axios.post('http://127.0.0.1:8000/split_video_to_frames/', row, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      })
        .then(response => {
          if (response.status === 200) {
            this.$message({
              message: '生成RGB视频帧成功!',
              type: 'success'
            });
            this.imageUrls = response.data.data
          }
          this.getList()
          this.listLoading = false
          // 关闭进度条弹窗
          this.showProgress = false
        })
        .catch(error => {
          this.$message({
            message: '生成RGB视频帧失败，请重试...',
            type: 'error'
          })
          this.listLoading = false
          // 关闭进度条弹窗
          this.showProgress = false
        });
      this.handleProgressClose()
    }
  }
}
</script>

<style scoped>
.local-container {
  background: #F7F7F9;
}

.tip-div {
  margin: 0 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tip-span {
  font-size: larger;
  color: #09356c;
  letter-spacing: 0.1em;
}

.linear-container {
  margin: 30px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 0 7px rgba(73, 73, 73, 0.5);
  border-radius: 10px;
}

.tip-title {
  font-size: larger;
}

.tip-content {
  line-height: 24px;
  color: #7d7d7d;
  font-size: medium;
  margin-bottom: 30px;
  width: 1200px;
}

.tip-process-title {
  margin-top: 20px;
  font-size: larger;
}

.tip-process-img {
  margin: 10px 0;
  height: 44px;
  width: 700px;
}

.tip-process-blocks {
  margin: 10px 0;
  display: flex;

}

.tip-process-block {
  width: 300px;
  margin-right: 30px;
}

.tip-process-block-title {
  margin-bottom: 20px;
}

.tip-process-block-content {
  color: #7d7d7d;
  font-size: medium;
}

.tip-button {
  margin: 20px 0 10px 30px;
  font-size: larger;
}

.demonstration {
  text-align: center;
  font-size: 22px;
  margin: 20px;
}

.sliding-windows {
  justify-content: center;
}

.image-gallery {
  padding-top: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px; /* 控制图片之间的小分割 */
}

.image-item {
  width: 120px;
  height: 90px;

  /*flex: 0 0 calc(25% - 10px); !* 控制每行显示的图片数量和大小 *!*/
}

.image-item img {
  width: 100%;
  height: auto;
}

.block {
  padding: 0 20px;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>

