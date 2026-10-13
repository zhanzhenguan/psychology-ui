<template>
   <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" :inline="true">
    <el-row :gutter="24">
        <template v-for="item in formItemWithCol" :key="item.prop">
            <el-col v-bind="item.col">
                <el-form-item :label="item.label" :prop="item.prop">
                <component v-model="ruleForm[item.prop]" :is="isType(item.type)" :placeholder="item.placeholder"
                 style="width: 200px">
                    <template v-if="item.type === 'select'">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="option in item.options" 
                        :key="option.value" 
                        :label="option.label" 
                        :value="option.value">
                        </el-option>
                    </template>
                </component>
            </el-form-item>
            </el-col>
        </template>
    </el-row>

    <el-row>
        <el-button type="primary" @click="handleSearch(ruleFormRef)">
                查询
        </el-button>
        <el-button @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
    </el-form>
    
</template>
<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'

const props = defineProps({
    formItem: {
        type: Array,
        default: () => [
            {
                type: 'input',
                prop: 'name',
                label: 'xxx',
                placeholder: '请输入xxx',
                options: [
                    {
                        label: '分类1',
                        value: 'categoryId1'
                    },
                    {
                        label: '分类2',
                        value: 'categoryId2'
                    },
                    {
                        label: '分类3',
                        value: 'categoryId3'
                    }
                ]
            },
        ]
    }
})

// 定义事件
const emit = defineEmits(['search', 'reset'])



const ruleFormRef = ref()
const ruleForm = reactive({})
const rules = reactive({})


// 处理formItem，添加col属性
const formItemWithCol = computed(()=>{
  const {formItem} = props
  formItem.forEach(item => {
    item.col = {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 6,
        xl: 4,
    }
  })
  return formItem
})




// 判断组件类型
const isType = (type) => {
    return {
        input: 'el-input',
        select: 'el-select',
        date: 'el-date-picker',
    }[type]
}

// 处理查询事件
const handleSearch = (ruleFormRef) => {
    // ruleFormRef.value.validate((valid) => {
    //     if (valid) {
    //         console.log('查询参数', ruleForm)
    //     } else {
    //         console.log('查询参数校验失败')
    //     }
    // })
    emit('search', ruleForm)
}

// 处理重置事件
const handleReset = (ruleFormRef) => {
    if (!ruleFormRef) return
    ruleFormRef.resetFields()
    emit('search', ruleForm)
}



</script>
<style scoped lang="scss">

</style>