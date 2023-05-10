<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner"/>
    <div class="homepage-introduce-top-title">欢迎使用乘风手语识别系统</div>
    <el-row style="background:#fff;margin-bottom:32px;margin-top: 20px;padding: 16px 16px 0 24px;">
      <p class="homepage-introduce-top-content">
        乘风手语是一个面向企业和个人开发者的零门槛AI手语识别训练平台，为零算法基础的开发者提供定制高精度AI手语模型的服务，包括数据处理、模型训练、服务管理、模型部署功能模块。
        手语识别模型用于处理不同场景下的手语表演者演示的手语，可以将手语视频分离成六种模态，包括RGB帧、骨架等形势，大幅提高手语识别的正确率</p>
      <div class="homepage-introduce-blocks">
        <div class="homepage-introduce-block">
          <img :src="img1">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">数据处理</p>
            <p class="homepage-introduce-text-content">提供闭环的数据管理功能，从数据上传、标注、训练到回流</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img :src="img2">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">模型训练</p>
            <p class="homepage-introduce-text-content">提供丰富的训练方式，零代码轻松获得高精度模型</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img :src="img3">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">模型校验</p>
            <p class="homepage-introduce-text-content">提供详细的模型评估报告，支持在线校验，助力针对性优化模型</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img :src="img4">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">手语识别</p>
            <p class="homepage-introduce-text-content">提供更高精度手语识别，突破行业壁垒，造福聋哑群体，构建无障碍的沟通环境</p>
          </div>
        </div>
      </div>
    </el-row>
    <el-row style="background:#fff;margin-bottom:32px;margin-top: 20px;padding: 16px 16px 0 24px;">
      <div>场景范例</div>
      <p class="homepage-introduce-top-content">
        乘风手语识别系统支持手语识别结果的分析和数据可视化展示，可以对手语视频进行分析并提取手势特征。同时拥有手语翻译功能，可以自动将手语识别结果翻译成其他语言的文字输出，方便跨语言交流。此外，该系统还可以增加不同手语识别模型框架的对比，以提高识别精度和效率。
      </p>
      <div class="homepage-introduce-blocks">
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img5">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">有效的时空特征提取</p>
            <p class="homepage-introduce-text-content">细致且有效的空间特征表示小面积的、细微的手势变化</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img6">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">建模手语视频中长期、短期依赖关系</p>
            <p class="homepage-introduce-text-content">有效建模长期和短期依赖关系，提取出细致的局部信息和高级的全局信息</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img7">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">基于深度学习的孤立词手语识别算法</p>
            <p class="homepage-introduce-text-content">卷积神经网络高效处理多维数据，充分利用数据的空间和时间结构信息</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img8">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">模型的高鲁棒性</p>
            <p class="homepage-introduce-text-content">算法可应对噪声、光线变化等干扰因素，基于数据增强以提高模型的鲁棒性</p>
          </div>
        </div>
      </div>
    </el-row>
    <panel-group @handleSetLineChartData="handleSetLineChartData"/>


    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart/>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}"
              style="padding-right:8px;margin-bottom:30px;">
        <transaction-table/>
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}"
              style="margin-bottom:30px;">
        <todo-list/>
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}"
              style="margin-bottom:30px;">
        <box-card/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis,
      img1: require('./components/source/img.png'),
      img2: require('./components/source/img2.png'),
      img3: require('./components/source/img3.png'),
      img4: require('./components/source/img4.png'),
      img5: require('./components/source/content1.jpg'),
      img6: require('./components/source/content2.jpg'),
      img7: require('./components/source/content3.jpg'),
      img8: require('./components/source/content4.jpg'),
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.homepage-introduce-blocks {
  display: flex;
  padding: 10px;
  justify-content: center;
  align-items: center;
}

.homepage-introduce-block {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.homepage-introduce-top-title {
  font-size: 26px;

}

.homepage-introduce-img {
  height: 200px;
  width: 280px;
}

.homepage-introduce-top-content {
  font-size: 15px;
  line-height: 1.7;
  color: #6e6e6e;
}

.homepage-introduce-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.homepage-introduce-text-content {
  color: #6e6e6e;
  font-size: 15px;
  text-align: center;
  line-height: 1.5;
}

.homepage-introduce-text-title {
  text-align: center;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
