<template>
  <div class="local-container">
    <div class="linear-container">
      <div class="tip-container">
        <div class="tip-title">数据预处理——基于OpenMMLab的骨架关键点分离</div>
        <p class="tip-content">
          本系统使用<a href="https://github.com/open-mmlab/mmpose" style="color: #0a76a4"> OpenMMLab pose estimation
          tool-box and benchmark </a>
          论文中提供的预训练HRNet全身姿势估计器从您上传RGB视频中估计手语表演者的133点全身关键点,提取出其中的关键骨骼点构建27节点骨架图
        </p>
        <div class="tip-process-title">使用流程介绍</div>
        <div class="tip-process-content">
          <img class="tip-process-img" :src="processImg" alt="流程图图片">
          <div class="tip-process-blocks">
            <div class="tip-process-block">
              <div class="tip-process-block-title">1 上传手语视频</div>
              <div class="tip-process-block-content">点击“创建标签组”按钮，根据需要输入标签组名称和描述。</div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">2 管理标签组</div>
              <div class="tip-process-block-content">
                支持手动或批量“添加/删除/修改”标签，您可上传csv、xls、txt格式文件批量添加标签。
              </div>
            </div>
            <div class="tip-process-block">
              <div class="tip-process-block-title">3 调用标签组</div>
              <div class="tip-process-block-content">在线标注数据时，您可一键导入“标签组”，使用组内标签进行标注。</div>
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
      <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column align="center" label="视频id" width="80">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column width="180px" align="center" label="上传日期">
          <template slot-scope="{row}">
            <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120px" align="center" label="视频名称">
          <template slot-scope="{row}">
            <span>{{ row.author }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="300px" label="视频描述">
          <template slot-scope="{row}">
            <template v-if="row.edit">
              <el-input v-model="row.title" class="edit-input" size="small"/>
              <el-button
                class="cancel-btn"
                size="small"
                icon="el-icon-refresh"
                type="warning"
                @click="cancelEdit(row)"
              >
                cancel
              </el-button>
            </template>
            <span v-else>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column class-name="status-col" label="状态" width="110">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120">
          <template slot-scope="{row}">
            <el-button
              v-if="row.edit"
              type="success"
              size="small"
              icon="el-icon-circle-check-outline"
              @click="confirmEdit(row)"
            >
              Ok
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="row.edit=!row.edit"
            >
              Edit
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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import processImg from '@/views/dataProcess/components/source/img1.png';
import {fetchList} from '@/api/article'
import elDragDialog from '@/directive/el-drag-dialog'
import MdInput from "@/components/MDinput/index.vue"; // base on element-ui
import editorImage from '@/components/Tinymce/components/EditorImage.vue'

export default {
  name: 'Generate skeleton features',
  components: {MdInput, editorImage},
  directives: {elDragDialog},
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
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
      fileList: [],
      videoText: {
        videoName: '',
        videoDescribe: '',
      },
      videoTextRules: {
        videoName: [{required: true, trigger: 'change', validator: validate}],
        videoDescribe: [{required: true, trigger: 'change', validator: validate}]
      },
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
      console.log(formData)
      axios.post('http://127.0.0.1:8000/uploadVideo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          if (response.status === 200) {
            alert('上传成功!')
            this.videoText.videoName = ''
            this.videoText.videoDescribe = ''
            this.fileList = []
            this.dialogOfUpload = false
            console.log(response);
          }

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
      console.log(data)
      const items = data.items
      this.list = items.map(v => {
        this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
        v.originalTitle = v.title //  will be used when user click the cancel botton
        return v
      })
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
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.local-container {
  background: #F7F7F9;
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
  margin-bottom: 30px;
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
