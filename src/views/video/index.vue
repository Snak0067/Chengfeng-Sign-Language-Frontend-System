<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="视频名称" style="width: 200px;" class="filter-item"
                @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.type" placeholder="数据集类型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in videoTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'"
                   :value="item.key"/>
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 180px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit">
        上传手语视频
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download"
                 @click="handleDownload">
        导出视频列表
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="视频id" prop="id" sortable="custom" align="center" width="80"
                       :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频名称" width="220px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.videoName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据集类型" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.videoType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频标题" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="185px" label="视频描述">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="缩略图">
        <template slot-scope="{row}">
          <img :src="'data:image/jpeg;base64,' +row.img" alt="缩略图" style="max-width: 50px; max-height: 50px;">
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.whole_pose_status | statusFilter">
            {{ row.whole_pose_status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="220px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="success">
            Publish
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="videoInfo" label-position="left" label-width="120px"
               style="width: 400px; margin-left:50px;">

        <el-form-item label="视频id">
          <el-input disabled v-model="videoInfo.id"/>
        </el-form-item>
        <el-form-item label="视频名称" prop="videoName">
          <el-input v-model="videoInfo.videoName"/>
        </el-form-item>
        <el-form-item label="视频类型">
          <el-select v-model="videoInfo.videoType" class="filter-item" placeholder="Please select">
            <el-option v-for="item in videoTypeOptions" :key="item.key" :label="item.display_name"
                       :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-input disabled v-model="videoInfo.create_time"/>
        </el-form-item>
        <el-form-item label="视频标签" prop="title">
          <el-input v-model="videoInfo.title"/>
        </el-form-item>
        <el-form-item label="视频描述" prop="description">
          <el-input v-model="videoInfo.description"/>
        </el-form-item>
        <el-form-item label="数据处理状态">
          <el-input v-model="videoInfo.status" disabled=""/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList, fetchPv, createArticle, updateArticle} from '@/api/article'
import waves from '@/directive/waves' // waves directive
import {parseTime} from '@/utils'
import {MessageBox} from 'element-ui';
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from 'axios';

const videoTypeOptions = [
  {key: 'AUSTL', display_name: '土耳其手语数据集'},
  {key: 'WLASL', display_name: '美国手语数据集'},
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = videoTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'videoIndex',
  components: {Pagination},
  directives: {waves},
  filters: {
    statusFilter(status) {
      const statusMap = {
        '已提取特征': 'success',
        '未提取特征': 'info',
        '': 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        type: undefined,
        sort: 'id'
      },
      importanceOptions: [1, 2, 3],
      videoTypeOptions,
      sortOptions: [{label: '视频id正序排列', key: 'id'}, {label: '视频id逆序排列', key: '-id'}],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      videoInfo: {
        id: undefined,
        result: '',
        title: '',
        videoName: '',
        description: '',
        videoType: '',
        status: '',
        create_time: '',
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改视频信息',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        title: [
          {required: true, message: '请输入视频标签', trigger: 'blur'},
          {max: 10, message: '视频标签长度不能超过10个字符', trigger: 'blur'}
        ],
        videoName: [
          {required: true, message: '请输入视频名称', trigger: 'blur'},
          {max: 50, message: '视频名称长度不能超过50个字符', trigger: 'blur'}
        ],
        description: [
          {required: true, message: '请输入视频描述', trigger: 'blur'},
          {max: 200, message: '视频描述长度不能超过200个字符', trigger: 'blur'}
        ],
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      console.log(this.listQuery)
      axios.post('http://127.0.0.1:8000/video_list/', this.listQuery, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        if (response.status === 200) {
          console.log(response.data.data)
          this.list = response.data.data.videolist
          this.total = response.data.data.videolist.length
        }
      }).catch(error => {
        alert('获取视频列表失败，请稍后重试...')
        console.log(error);
      })
      this.listLoading = false
    },
    handleFilter() {

      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const {prop, order} = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.videoInfo = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.videoInfo)
          axios.post('http://127.0.0.1:8000/update_video/', tempData, {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
          }).then(response => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新视频成功...',
              type: 'success',
              duration: 2000
            })
          }).catch(error => {
            this.$notify({
              title: 'Failed',
              message: '更新视频失败...',
              type: 'error',
              duration: 2000
            })
            console.log(error);
          })
          this.listLoading = false
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('http://127.0.0.1:8000/delete_video/', row, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }).then(response => {
          this.getList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.$confirm('该操作将导出视频列表信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['id', 'title', 'videoName', 'videoType', 'description', 'create_time']
          const filterVal = ['id', 'title', 'videoName', 'videoType', 'description', 'create_time']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'video-table-list'
          })
          this.downloadLoading = false
        })
        this.$message({
          type: 'success',
          message: '导出成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消导出视频列表！'
        });
      });

    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
