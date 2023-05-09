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
          <img class="homepage-introduce-img" :src="img1">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">数据处理</p>
            <p class="homepage-introduce-text-content">提供闭环的数据管理功能，从数据上传、标注、训练到回流</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img2">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">模型训练</p>
            <p class="homepage-introduce-text-content">提供丰富的训练方式，零代码轻松获得高精度模型</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img3">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">模型校验</p>
            <p class="homepage-introduce-text-content">提供详细的模型评估报告，支持在线校验，助力针对性优化模型</p>
          </div>
        </div>
        <div class="homepage-introduce-block">
          <img class="homepage-introduce-img" :src="img4">
          <div class="homepage-introduce-text">
            <p class="homepage-introduce-text-title">手语识别</p>
            <p class="homepage-introduce-text-content">提供更高精度手语识别，突破行业壁垒</p>
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
