<template>
  <div>
    <div class="top">
      <div class="top-tip1">算法展示 / 手语识别
        <svg-icon icon-class="guide"/>
      </div>
      <h1>将手语视频识别为词语</h1>
      <div class="top-container">
        将视频提取为全身骨骼关键点文件后，基于骨骼进行RGB视频帧裁剪，然后进行模型分类得到标签
        <div class="tooltip-icon" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
          <svg-icon class="icon-tip-message" icon-class="message"/>
          <div class="tooltip" v-if="showTooltip">{{ tooltipText }}</div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="container-left">
        <div class="video-wrapper">
          <video ref="mainVideoPlayer" class="main-video" controls>
            <!--            <source :src="this.video.sourceUrls[0]" type="video/mp4">-->
            <source :src="this.video.sourceUrls[0]" type="video/mp4">
          </video>
        </div>
        <div class="video-info">
          <div v-if="videoShowOptions.duration">
            <p>视频持续时间: {{ this.videoShowOptions.duration }} 秒</p>
            <p>视频帧数: {{ this.videoShowOptions.frames }} 帧</p>
            <p>视频分辨率: {{ this.videoShowOptions.shape }} 像素</p>
          </div>
        </div>
        <div class="container-right-bottom">
          <div class="video-wrapper-title">Video</div>
          <div class="controls">
            <input class="inputUrl" type="text" v-model="videoURL" placeholder="输入视频URL">
            <button class="inputUrlButton">Search</button>
            <div class="huo"> 或</div>
            <input type="file" @change="handleFileChange" accept="video/*"/>
            <el-button type="danger" class="delete-button" @click="deleteVideo">删除视频</el-button>
          </div>
          <div class="thumbnails">
            <div
              v-for="(thumbnail, index) in video.imgUrls"
              :key="index"
              :class="{ 'selected-thumbnail': index === selectedThumbnailIndex }"
              class="thumbnail"
              @click="switchVideo(index)"
            >
              <img class="card-img" :src="thumbnail" alt="视频缩略图">
            </div>
          </div>
        </div>
      </div>
      <div class="container-right">
        <div class="algorithm">
          <div class="tip-title">
            <el-text class="mx-1" size="small">设置</el-text>

          </div>
          <div class="select-block">
            <div class="algorithm-title">算法</div>
            <el-select class="select" v-model="algorithm" placeholder="请选择" :disabled="disabled_status">
              <el-option
                v-for="item in algorithmOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="select-block">
            <div class="algorithm-title">数据集</div>
            <el-select class="select" v-model="dataset" placeholder="请选择" :disabled="disabled_status">
              <el-option
                v-for="item in datasetOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="step">
            <el-steps :active="active" finish-status="success" :space="250">
              <el-step title="步骤 1" description="全身姿态估计"></el-step>
              <el-step title="步骤 2" description="生成RGB帧"></el-step>
              <el-step title="步骤 3" description="运行模型"></el-step>
            </el-steps>
            <el-button v-if="video.active[selectedThumbnailIndex]===0" style="margin-top: 12px;" @click="next"
                       :disabled="disabled_status">
              生成全身姿态估计
            </el-button>
            <el-button v-else-if="video.active[selectedThumbnailIndex]===1" style="margin-top: 12px;" @click="next"
                       type="warning" :disabled="disabled_status">
              生成RGB帧
            </el-button>
            <el-button v-else-if="video.active[selectedThumbnailIndex]===2" style="margin-top: 12px;" @click="next"
                       type="primary" :disabled="disabled_status">
              运行模型预测
            </el-button>
            <el-button v-else style="margin-top: 12px;" @click="next" type="success">
              预测成功
            </el-button>
            <el-divider></el-divider>
          </div>
          <div class="show-result">
            <el-tabs type="border-card">
              <el-tab-pane label="姿态估计结果">姿态估计结果</el-tab-pane>
              <el-tab-pane label="RGB帧">
                <div class="demonstration">
                  <el-button @click="getVideoFrames">显示图片</el-button>
                  RGB分割结果图片展示
                </div>
                <el-carousel trigger="click" height="200px" class="sliding-windows">
                  <el-carousel-item v-for="imgRows in imageUrls" :key="imgRows" class="image-gallery">
                    <div class="image-item" v-for="image in imgRows" :key="image.id">
                      <img :src="image" alt="Image"/>
                    </div>
                  </el-carousel-item>
                </el-carousel>
              </el-tab-pane>
              <el-tab-pane label="前五名预测结果">
                <div class="show-result-title">前五名预测结果</div>
                <div v-if="video.result[selectedThumbnailIndex] && video.result[selectedThumbnailIndex].length===5"
                     class="demo-progress">
                  <div class="progress-block"
                       v-for="(result, index) in prediction_result.scores"
                       :key="index">
                    <el-text class="mx-1 progress-block-text" size="large">
                      {{ prediction_result.prediction_label[index] }}
                    </el-text>
                    <el-progress :text-inside="true"
                                 :stroke-width="22"
                                 :percentage="prediction_result.scores[index]"/>
                  </div>
                </div>
                <div v-else
                     class="empty-img">
                  <img
                    src="https://img.ixintu.com/download/jpg/20200726/fc0a376507f1116fd382240c13aa7699_512_512.jpg!ys"/>
                </div>
              </el-tab-pane>
            </el-tabs>


          </div>
        </div>
        <div>
          <!--      算法加载进度条   -->
          <el-dialog :visible.sync="showProgress" :before-close="handleProgressClose">
            <el-text class="mx-1 prograss-bar-text" size="large">
              {{ active_name[active] }}
            </el-text>
            <el-progress :percentage="progressPercentage"></el-progress>
          </el-dialog>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import topbar_bg from '@/views/dataProcess/components/source/topbar_bg.png';
import thumbnail1 from '@/views/recognition/source/thumbnail1.png';
import thumbnail2 from '@/views/recognition/source/thumbnail2.png';
import thumbnail3 from '@/views/recognition/source/thumbnail3.png';
import video1 from '@/views/recognition/source/video1.mp4'
import video2 from '@/views/recognition/source/video2.mp4'
import video3 from '@/views/recognition/source/video3.mp4'

export default {
  name: "index",
  data() {
    return {
      imageUrls: [],
      disabled_status: false,
      showProgress: false, // 是否显示进度条弹窗
      progressPercentage: 0, // 进度条百分比
      active_name: {
        0: "生成全身姿态估计",
        1: "生成RGB帧",
        2: "运行模型预测",
      },
      active: 0,
      algorithm: 'I3D',
      dataset: 'WLASL',
      topbar_bg: topbar_bg,
      prediction_result: {
        prediction_label: [],
        scores: [],
      },
      video: {
        shape: [[320, 240], [288, 192], [640, 480]],
        duration: [2.2, 1.2, 1.3],
        frames: [64, 58, 34],
        imgUrls: [thumbnail1, thumbnail2, thumbnail3],
        sourceUrls: [video1, video2, video3],
        active: [],
        videoId: [],
        result: [],
      },
      videoInfo: [[2, 64], [2, 58], [1, 34]],
      selectedThumbnailIndex: 0,
      videoShowOptions: {
        "duration": null,
        "frames": null,
        "shape": null,
      },
      mainVideoPlayer: null,
      videoURL: '',
      currentVideo: '', // 当前播放的视频URL
      showTooltip: false,
      tooltipText: "1、首先，点击界面上的\"选择视频文件\"按钮，从您的计算机中选择一个视频文件\n" +
        "2、选取视频文件后，界面将显示视频的相关信息，例如持续时间和帧数\n" +
        "3、然后在右边设置要预测的模型和相关数据集\n" +
        "4、在设置完参数后，点击\"运行\"按钮开始手语识别预测",
      algorithmOptions: [{
        value: 'I3D',
        label: 'I3D'
      }, {
        value: 'ResNet(2+1)D',
        label: 'ResNet(2+1)D'
      }, {
        value: 'C3D',
        label: 'C3D'
      }],
      datasetOptions: [
        {
          value: 'WLASL',
          label: 'WLASL'
        }, {
          value: 'AUSTL',
          label: 'AUSTL'
        }, {
          value: 'CSL',
          label: 'CSL'
        }
      ]
    }
  },
  mounted() {
    this.mainVideoPlayer = this.$refs.mainVideoPlayer;
  },
  created() {
    this.getAllVideoInfo()
  },
  methods: {
    getVideoFrames() {

      const info = {
        "id": this.video.videoId[this.selectedThumbnailIndex]
      }
      console.log(info)
      this.$message({
        message: '获取RGB视频帧成功!',
        type: 'success'
      });
      axios.post('http://127.0.0.1:8000/get_reccoginition_video_frames/', info, {
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
    next() {
      this.disabled_status = true
      if (!this.checkInfoNeeded()) {
        this.disabled_status = false
        return;
      }
      const currentActive = this.video.active[this.selectedThumbnailIndex]
      if (currentActive === 0) {
        this.extractWholePose()
      } else if (currentActive === 1) {
        this.extractFrames()
      } else {
        this.predictVideo()
      }
      this.disabled_status = false
    },
    predictVideo() {
      this.showProgress = true
      let progress = 0
      //进度条计时器
      const timer = setInterval(() => {
        progress += Math.floor(Math.random() * 3) + 2
        if (progress > 90) {
          clearInterval(timer)
          return
        }
        this.progressPercentage = progress
      }, 700)
      //api
      const info = {
        "id": this.video.videoId[this.selectedThumbnailIndex]
      }
      axios.post('http://127.0.0.1:8000/prediction_video/', info, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      })
        .then(response => {
          if (response.status === 200) {
            this.$message({
              message: '预测视频成功!',
              type: 'success'
            });
            console.log(response.data.data)
            const idx = this.selectedThumbnailIndex
            this.getAllVideoInfo()
            this.selectedThumbnailIndex = idx
            this.active++
          }
        })
        .catch(error => {
          this.$message({
            message: '预测视频失败，请重试...',
            type: 'error'
          })
        });
      this.handleProgressClose()
    },
    handleProgressClose() {
      this.progressPercentage = 0
    },
    extractFrames() {
      this.showProgress = true
      let progress = 0
      //进度条计时器
      const timer = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 5
        if (progress > 95) {
          clearInterval(timer)
          return
        }
        this.progressPercentage = progress
      }, 700)
      //api
      const info = {
        "id": this.video.videoId[this.selectedThumbnailIndex]
      }
      axios.post('http://127.0.0.1:8000/recognition_video_to_frames/', info, {
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
            this.getAllVideoInfo()
            this.active++
          }
          // 关闭进度条弹窗
          this.showProgress = false
        })
        .catch(error => {
          this.$message({
            message: '生成RGB视频帧失败，请重试...',
            type: 'error'
          })
          // 关闭进度条弹窗
          this.showProgress = false
        });
      this.handleProgressClose()
    },
    extractWholePose() {
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
      const info = {
        "videoId": this.video.videoId[this.selectedThumbnailIndex]
      }
      axios.post('http://127.0.0.1:8000/recognition_get_wholePose/', info, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      }).then(response => {
        if (response.status === 200) {
          this.$message({
            message: '生成全身姿态估计成功!',
            type: 'success'
          });
          // 关闭进度条弹窗
          this.showProgress = false
          this.getAllVideoInfo()
          this.active++
        }
      })
        .catch(error => {
          this.$message({
            message: '生成全身姿态估计失败，请重试...',
            type: 'error'
          })

          // 关闭进度条弹窗
          this.showProgress = false
        });
      this.handleProgressClose()
    },
    checkInfoNeeded() {
      // 进行上传前的文件的非空确认
      if (!this.algorithm) {
        this.$message({
          message: '请选择算法',
          type: 'error'
        })
        return false;
      }
      if (!this.dataset) {
        this.$message({
          message: '请选择所属的数据集',
          type: 'error'
        })
        return false;
      }
      if (!this.mainVideoPlayer.src) {
        this.$message({
          message: '请选择识别的视频',
          type: 'error'
        })
        return false;
      }
      return true
    },
    validateVideoFile(file) {
      const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime"]; // 允许的视频文件类型，可以根据需要进行修改
      // 检查文件类型
      if (allowedTypes.includes(file.type)) {
        return true;
      }
      // 检查文件扩展名
      const fileName = file.name;
      const extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
      const allowedExtensions = ["mp4", "mpeg", "mov"]; // 允许的视频文件扩展名，可以根据需要进行修改
      return allowedExtensions.includes(extension);
    },
    deleteVideo() {
      this.$confirm('此操作将永久删除该视频, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const info = {
          "videoId": this.video.videoId[this.selectedThumbnailIndex]
        }
        axios.post('http://127.0.0.1:8000/delete_recognition_video/', info, {}).then(response => {
          this.getAllVideoInfo()
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getAllVideoInfo()
          this.selectedThumbnailIndex = 0

        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (this.validateVideoFile(file)) {
        this.playVideo(file);
        this.generateThumbnail(file);
      } else {
        // 上传的文件不是视频文件，进行相应处理
        this.$message({
          message: '上传的不是视频文件，请重新上传!',
          type: 'info'
        });
        event.target.value = null; // 清除选择的文件
      }
    },
    generateThumbnail(file) {
      const formData = new FormData();
      formData.append('videoFile', file);
      axios.post('http://127.0.0.1:8000/get_video_cover/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      }).then(response => {
        // 上传成功的处理逻辑
        if (response.status === 200) {
          this.$message({
            message: '上传视频成功!',
            type: 'success'
          });

          this.getAllVideoInfo()
          this.selectedThumbnailIndex = this.video.videoId.length

        }
      })
    },
    playVideo(file) {
      const videoURL = URL.createObjectURL(file);
      this.videoURL = '';
      this.mainVideoPlayer.src = videoURL;
      this.mainVideoPlayer.load();
    },
    playVideoWithUrl(videoURL) {
      this.mainVideoPlayer.src = videoURL;
      this.mainVideoPlayer.load();
    },
    switchVideo(index) {
      this.$message({
        message: '切换视频!',
        type: 'success'
      });
      if (index < this.video.sourceUrls.length) {
        this.playVideoWithUrl(this.video.sourceUrls[index]);
        this.videoShowOptions.duration = this.video.duration[index]
        this.videoShowOptions.frames = this.video.frames[index]
        this.videoShowOptions.shape = this.video.shape[index][0] + " x " + this.video.shape[index][1]
        this.selectedThumbnailIndex = index
        this.active = this.video.active[index]
      }
      const result = this.video.result[this.selectedThumbnailIndex]
      this.prediction_result.prediction_label = []
      this.prediction_result.scores = []
      for (var i = 0; i < result.length; i++) {
        this.prediction_result.prediction_label.push(result[i][0])
        this.prediction_result.scores.push(result[i][1])
      }
      this.imageUrls = []
    },
    getAllVideoInfo() {
      const formData = new FormData();
      axios.post('http://127.0.0.1:8000/getAllVideoInfo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      }).then(response => {
        // 上获取视频列表成功的处理逻辑
        if (response.status === 200) {
          this.$message({
            message: '获取手语识别的视频列表成功!',
            type: 'success'
          });
          this.video = response.data.data

          // console.log(this.video.result.length)
          // for (var i = 0; i < this.video.result.length; i++) {
          //   console.log(i)
          //   const label = []
          //   for (var j = 0; j < this.video.result[i].length; j++) {
          //     label.push(this.video.result[i][0])
          //   }
          //   this.prediction_result.prediction_label.push(label)
          //   // this.prediction_result.prediction_label.push(this.video.result[i][0])
          //   // if (this.video.result[i].length > 1) {
          //   //   // this.video.result[i] = JSON.parse(this.video.result[i])
          //   //   console.log(this.video.result[i])
          //   // }
          // }
          // console.log(this.prediction_result);
        }
      })
    }
  }
}
</script>
<style scoped>
.top {
  padding: 10px 20px;
  width: 100%;
  height: 150px;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("https://cdn.elearningindustry.com/wp-content/uploads/2021/07/How-To-Leverage-Hybrid-Learning-As-A-Catalyst-For-Digital-Economy-Growth_landing-1920x560-1.png");
}

.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}

.top-tip1 {
  font-size: 14px;
}

.top-container {
  display: flex;
}

.container {
  width: 100%;
  padding: 20px;
  display: flex;
}

.container-left {
  flex: 1;
  margin: 0 auto;
  padding: 0 20px;
}


.container-right {
  width: 640px;
}

h1 {
  margin-bottom: 20px;
}

pre {
  white-space: pre-wrap;
}


.container-right-bottom {
  width: 640px;
  background: #ececec;
  padding: 20px;
  margin: 20px 0;
}

.video-wrapper {
  width: 640px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 360px;
}

.main-video {
  width: 640px;
  height: 360px;
}

.video-wrapper-title {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;

}

.controls {
  display: flex;
  height: 30px;
  align-items: center;
}

.huo {
  height: 100%;
  width: 30px;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.inputUrl {
  width: 300px;
}

.inputUrlButton {
  height: 24px;
  border: 1px solid #3084c9;
  color: #3084c9;
  opacity: 1;
}

.thumbnails {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
  /*justify-content: center;*/
}

.thumbnail {
  width: 110px;
  height: 100px;
  margin-right: 10px;
  cursor: pointer;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 12px 0;
}

.selected-thumbnail img {
  border: 2px solid #3084c9;
}

.tooltip-icon {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  top: -80px;
  left: 40px;
  width: 400px;
  padding: 10px;
  background-color: #1c1818;
  color: #fff;
  font-size: 14px;
  border-radius: 5px;
  opacity: 0.8;
  pointer-events: none;
  transition: opacity 0.3s;
  white-space: pre-line;
}

.delete-button {
  width: 90px;
  height: 34px;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.icon-tip-message {
  margin-left: 10px;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: -10px;
  left: calc(50% - 10px);
  border: 10px solid transparent;
  border-bottom-color: #333;
}


.algorithm {
  width: 640px;
  background: rgba(241, 240, 240, 0.99);
  padding: 20px;

}

.select-block {
  margin-top: 24px;
  display: flex;
  align-items: center;
}

.step {
  margin-top: 24px;
}

.show-result {

}

.progress-block {
  display: flex;
}

.progress-block-text {
  width: 100px;
}

.show-result-title {
  margin: 10px 0;
  font-weight: bold;
  font-size: large;
}

.demo-progress {
  margin: 20px 0;
}

.prograss-bar-text {
  margin-top: 20px;
  font-size: 20px;
}

.empty-img {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-img img {
  width: 360px;
  height: 300px;
}

.select {
  width: 240px;
}

.algorithm-title {
  width: 100px;
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

</style>

