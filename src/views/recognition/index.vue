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
            <source :src="this.videoList[0]" type="video/mp4">
          </video>
        </div>
        <div class="video-info">
          <div v-if="videoShowOptions.duration">
            <p>视频持续时间: {{ this.videoShowOptions.duration }} 秒</p>
            <p>视频帧数: {{ this.videoShowOptions.frames }} 帧</p>
          </div>
        </div>
        <div class="container-right-bottom">
          <div class="video-wrapper-title">Video</div>
          <div class="controls">
            <input class="inputUrl" type="text" v-model="videoURL" placeholder="输入视频URL">
            <button class="inputUrlButton">Search</button>
            <div class="huo"> 或</div>
            <input type="file" @change="handleFileChange" accept="video/*"/>
          </div>
          <div class="thumbnails">
            <div
              v-for="(thumbnail, index) in thumbnails"
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
        <div class="tip-title"></div>
        <div class="select-input">

        </div>
        <div class="select-input"></div>
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
      topbar_bg: topbar_bg,
      videoInfo: [[2, 64], [2, 58], [1, 34]],
      selectedThumbnailIndex: -1,
      videoShowOptions: {
        "duration": null,
        "frames": null,
      },
      mainVideoPlayer: null,
      videoURL: '',
      currentVideo: '', // 当前播放的视频URL
      thumbnails: [thumbnail1, thumbnail2, thumbnail3],
      videoList: [video1, video2, video3],
      showTooltip: false,
      tooltipText: "1、首先，点击界面上的\"选择视频文件\"按钮，从您的计算机中选择一个视频文件\n" +
        "2、选取视频文件后，界面将显示视频的相关信息，例如持续时间和帧数\n" +
        "3、然后在右边设置要预测的模型和相关数据集\n" +
        "4、在设置完参数后，点击\"运行\"按钮开始手语识别预测",
    }
  },
  mounted() {
    this.mainVideoPlayer = this.$refs.mainVideoPlayer;
  },
  methods: {
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
      axios.post('http://127.0.0.1:8000/get_video_cover/', formData)
        .then(response => {
          // 上传成功的处理逻辑
          this.$message({
            message: '上传视频成功!',
            type: 'success'
          });
          this.generateThumbnails(videoURL);
        })
        .catch(error => {
          // 上传失败的处理逻辑
          this.$message({
            message: '网络错误,上传视频视频失败!',
            type: 'error'
          })
        });
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
    generateThumbnails(videoURL) {
      // 使用您选择的库或自定义方法生成视频缩略图
      // 将缩略图的URL存储在this.thumbnails数组中
      this.videoList.push(videoURL)

      this.thumbnails.push(videoURL)
    },
    switchVideo(index) {
      this.$message({
        message: '切换视频!',
        type: 'success'
      });
      if (index < this.videoList.length) {
        this.playVideoWithUrl(this.videoList[index]);
        this.videoShowOptions.duration = this.videoInfo[index][0]
        this.videoShowOptions.frames = this.videoInfo[index][1]
        this.selectedThumbnailIndex = index
      }

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

.upload-section {
  margin-bottom: 20px;
}

.options-section {
  margin-bottom: 20px;
}

.result-section {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}

pre {
  white-space: pre-wrap;
}

.video-info {

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
  margin: 10px 0;
  /*justify-content: center;*/
}

.thumbnail {
  width: 120px;
  height: 110px;
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
  background-color: #626262;
  color: #fff;
  font-size: 14px;
  border-radius: 5px;
  opacity: 0.8;
  pointer-events: none;
  transition: opacity 0.3s;
  white-space: pre-line;
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
</style>

