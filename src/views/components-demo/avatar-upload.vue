<template>
  <div class="components-container">
    <aside>
      This is based on
      <a class="link-type" href="//github.com/dai-siki/vue-image-crop-upload">
        vue-image-crop-upload</a
      >. Since I was using only the vue@1 version, and it is not compatible with
      mockjs at the moment, I modified it myself, and if you are going to use
      it, it is better to use official version.
    </aside>

    <pan-thumb :image="image"/>

    <el-button
      type="primary"
      icon="el-icon-upload"
      style="position: absolute; bottom: 15px; margin-left: 40px"
      @click="imagecropperShow = true"
    >
      Change Avatar
    </el-button>

    <image-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="300"
      :height="300"
      url="https://httpbin.org/post"
      lang-type="en"
      @close="close"
      @crop-upload-success="cropSuccess"
    />
    <div class="submit-div">
      <form @submit.prevent="onSubmit">
        <input type="file" name="file" ref="fileInput"/>
        <button type="submit">Upload</button>
      </form>
    </div>
  </div>
</template>

<script>
import ImageCropper from "@/components/ImageCropper";
import PanThumb from "@/components/PanThumb";
import axios from "axios";
import {uploadVideos} from "@/api/avatar-upload";

export default {
  name: "AvatarUploadDemo",
  components: {ImageCropper, PanThumb},
  data() {
    return {
      imagecropperShow: false,
      imagecropperKey: 0,
      image: "https://wpimg.wallstcn.com/577965b9-bb9e-4e02-9f0c-095b41417191",
    };
  },
  methods: {
    cropSuccess(resData) {
      this.imagecropperShow = false;
      this.imagecropperKey = this.imagecropperKey + 1;
      this.image = resData.files.avatar;
    },
    close() {
      this.imagecropperShow = false;
    },
    onSubmit() {
      const formData = new FormData();
      formData.append("file", this.$refs.fileInput.files[0]);
      axios
        .post("http://127.0.0.1:8000/uploadVideo/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // 清理上传的文件
          this.image = null;
          // 弹窗上传成功
          alert("上传成功");
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style scoped>
.avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
}

.submit-div {
  margin: 20px;
}
</style>

