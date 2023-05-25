<template>
  <div class="local-container">
    <div class="linear-container">
      <div class="tip-container">
        <div class="tip-title">数据预处理——基于OpenMMLab的骨架关键点分离</div>
        <p class="tip-content">
          本系统使用<a href="https://github.com/open-mmlab/mmpose" style="color: #0a76a4"> OpenMMLab pose estimation
          tool-box and benchmark </a>
          论文中提供的预训练HRNet全身姿势估计器从您上传RGB视频中估计手语表演者的133点全身关键点,提取出其中的关键骨骼点构建27节点骨架
          ，通过利用预训练的姿势估计器估计全身关键点并根据关键点位置进行裁剪，以确保关键信息的保留并减少背景干扰.
        </p>
        <div>
          <img class="mmpose_img" :src="mmpose_img" alt="人体姿态估计示例图">
        </div>
        <div class="tip-process-title">使用流程介绍</div>
        <div class="tip-process-content">
          <img class="tip-process-img" :src="processImg" alt="流程图图片">
          <div class="tip-process-blocks">
            <div class="tip-process-block">
              <div class="tip-process-block-title">1 上传手语视频</div>
              <div class="tip-process-block-content">点击下方手语视频上传，上传至数据库中</div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">2 生成骨架特征</div>
              <div class="tip-process-block-content">
                支持手动或批量“添加/删除/修改”标签，您批量修改手语视频标签，然后通过生成的按钮将上传的视频进行提取骨架特征
              </div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">3 下载骨架特征文件</div>
              <div class="tip-process-block-content">完成骨架特征提取后，您可以下载该特征进行手动微调或者进行保存。</div>
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
    <div class="linear-container">
      <div class="tip-div">
        <span class="tip-span">提取全身骨骼特征的视频列表</span>
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
        <el-table-column min-width="180px" label="视频描述">
          <template slot-scope="{row}">
            <span>{{ row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column class-name="status-col" label="状态" width="110">
          <template slot-scope="{row}">
            <el-tag :type="row.whole_pose_status | statusFilter">
              {{ row.whole_pose_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150px">
          <template slot-scope="{row}">
            <el-button v-if="row.show_extract_button" type="primary" size="small" icon="el-icon-edit"
                       @click="extracting_whole_body_bone_features(row)">
              分离特征
            </el-button>
            <el-button v-else type="success" size="small" icon="el-icon-success" @click="download_features_files(row)">
              下载特征
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
import processImg from '@/views/dataProcess/components/source/img1.png';
import mmpose_img from '@/views/dataProcess/components/source/mmpose.png';

import elDragDialog from '@/directive/el-drag-dialog'
import MdInput from "@/components/MDinput/index.vue"; // base on element-ui
import editorImage from '@/components/Tinymce/components/EditorImage.vue'

const videoTypeOptions = [
  {key: 'AUSTL', display_name: '土耳其手语数据集'},
  {key: 'WLASL', display_name: '美国手语数据集'},
]
export default {
  name: 'Generate skeleton features',
  components: {MdInput, editorImage},
  directives: {elDragDialog},
  filters: {
    statusFilter(status) {
      const statusMap = {
        '已提取特征': 'success',
        '': 'info',
        '未提取特征': 'danger'
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
      processImg: processImg,
      mmpose_img: mmpose_img,
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
    download_features_files(row) {
      this.$confirm('是否下载该视频的特征文件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('http://127.0.0.1:8000/download_wholePose_file/', row, {
          responseType: 'blob',  // 指定响应数据类型为 blob
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          const filename = 'wholePose_' + row.videoName + '.txt';  // 下载的文件名，根据实际情况修改
          const blob = new Blob([response.data]);
          const link = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
          this.$message({
            type: 'success',
            message: '下载成功!'
          });
        }).catch(error => {
          console.error('下载文件时发生错误:', error);
          this.$message.error('下载文件时发生错误');
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消下载'
        });
      });
    },
    extracting_whole_body_bone_features(row) {
      // this.listLoading = true
      // 显示进度条弹窗
      this.showProgress = true
      let progress = 0
      const timer = setInterval(() => {
        progress += Math.floor(Math.random() * 4) + 1
        if (progress > 95) {
          clearInterval(timer)
          return
        }
        this.progressPercentage = progress
      }, 700)
      axios.post('http://127.0.0.1:8000/extract_wholepose/', row, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      })
        .then(response => {
          if (response.status === 200) {
            this.$message({
              message: '生成全身姿态估计成功!',
              type: 'success'
            });
          }
          this.getList()
          this.listLoading = false
          // 关闭进度条弹窗
          this.showProgress = false
        })
        .catch(error => {
          this.$message({
            message: '生成全身姿态估计失败，请重试...',
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

.tip-container {
  /* margin: 30px; */
}

.tip-title {
  margin-bottom: 10px;
  font-size: larger;
}

.tip-content {
  line-height: 24px;
  color: #7d7d7d;
  font-size: medium;
  width: 1000px;
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

.mmpose_img {
  height: 320px;
  width: 730px;
}

.tip-process-blocks {
  margin: 10px 0;
  display: flex;

}

.tip-process-block {
  width: 270px;
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

.edit-input {
  padding-right: 100px;
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
