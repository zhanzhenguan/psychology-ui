<template>
    <div class = "rich-text-editor">
        <!-- 编辑器容器 -->
        <div class="editor-container">
            <WangToolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                class="editor-toolbar"
            />
            <WangEditor
                v-model="content"
                :defaultConfig="editorConfig"
                mode="default"
                class="wang-editor"
                :style="{ minHeight: props.minHeight }"
                @onCreated="handleCreated"
                @onChange="handleChange"
                @onDestroyed="handleDestroyed"
            />
        </div>
        <!-- 字数统计 -->
         <div class="editor-footer">
            <div class="word-count">
                <span class ="count-text">{{currentCharCount}} / {{maxCharCount}}</span>
                <div class="progress-bar">
                    <div class="progress-fill"
                     :style="{width: Math.min((currentCharCount/maxCharCount) * 100,100) + '%'}">
                    </div>
                </div>
            </div>
        </div>

    </div>
    
</template>
<script setup>
import { onBeforeUnmount, ref, reactive, shallowRef,computed, onMounted,defineEmits,defineProps } from 'vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor as WangEditor, Toolbar as WangToolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/request'

const props = defineProps({
    modelValue:{
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: '请输入内容...'
    },
    maxCharCount: {
        type: Number,
        default: 2000
    },
    showWordCount:{
        type: Boolean,
        default: true
    },
    showSecurityTip:{
        type: Boolean,
        default: true
    },
    toolbarKeys:{
        type: Array,
        default: () => [
            'bold','italic','underline','color','bgColor','|',
            'fontSize','fontFamily','|',
            'header1', 'header2', 'header3', '|',
            'bulletedList','numberedList','blockquote',
            'insertLink','|',
            'undo','redo'
        ]
    },

    minHeight:{
        type: String,
        default: '300px'
    }
})

const emits = defineEmits(["update:modelValue",'change','created','destroyed'])

// 字数统计
const currentCharCount = ref(0)

// 编辑器实例,必须用 shallowRef
const editorRef = shallowRef()

const content = computed({
    get:()=>props.modelValue,
    set:(value)=> emits('update:modelValue',value)
   })


const editorConfig = reactive({
    placeholder: props.placeholder,
    // 菜单配置 不显示默认的菜单
    MENU_CONF:{
        // fontSize:{
        //     fontSizeList: ['12px','13px','14px','15px','16px','17px','18px','19px','20px',
        //     '22px','24px','26px','28px','30px','32px','34px','36px']
        // },
        // fontFamily:{
        //     fontFamilyList: ['宋体','微软雅黑','黑体',
        //         '楷体',
        //         { name: '仿宋', value: '仿宋' },
        //         'Arial',
        //         'Tahoma',
        //         'Verdana',
        //     ]
        // },
        // fontWeight:{
        //     fontWeightList: [
        //         'normal',
        //         'bold',
        //     ]
        // },
        // 前景色：常用灰阶 + 浅色系，与 bgColor 对称
        // color:{
        //     colors: [
        //         '#000','#333','#666','#999','#bbb','#ddd','#fff',
        //         '#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784',
        //         '#E3F2FD', '#BBDEFB', '#64B5F6',
        //         '#F3E5F5', '#E1BEE7', '#BA68C8',
        //         '#FFEBEE', '#FFCDD2', '#EF9A9A',
        //         '#FFF3E0', '#FFE0B2', '#FFB74D',
        //     ]
        // },
        // 背景色：修掉两处乱码（9θ→90、EO→E0）
        // bgColor:{
        //     colors: [
        //         '#fff','#f0f0f0','#e0e0e0','#d0d0d0','#c0c0c0',
        //         '#b0b0b0','#a0a0a0','#909090','#808080','#707070',
        //         '#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784',
        //         //浅蓝色系
        //         '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6',
        //         //浅紫色系
        //         '#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8',
        //         //浅灰色系
        //         '#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0'
        //     ]
        //  },
        // lineHeight:{
        //     lineHeightList: ['1','1.15','1.2','1.5','1.75','2.0','2.5','3.0']
        // },
    }

})

//工具栏配置
const toolbarConfig = reactive({
    toolbarKeys : props.toolbarKeys
})

const handleCreated = (editor) => {
    
    editorRef.value = editor
    updateCharCount()

    //调试信思－检查字体配置
    console.log('编辑器实例:',editor)
    console.log('工具栏配置:',editor.getConfig())

    //检测字体菜单
    const menus = editor.getAllMenuKeys()
    console.log('所有可用菜单:',menus)

    if (menus.includes('fontFamily')){

        console.log('字体菜单己启用')
    }else {
        console.warn('字体菜单未启用')
    }
    //触发创建事件
    emits('created',editor)

    console.log('富文本编辑器已创建')
    
}
const handleChange = (editor) => {
    updateCharCount()

    // 触发 change 事件,传递 HTML 内容和文本内容
    emits('change', {
        html: editor.getHtml(),
        text: editor.getText()
    })
    // console.log('change:', editor.children)
}
const handleDestroyed = (editor) => {
    editorRef.value = null
    console.log('destroyed')
}

const updateCharCount =() =>{
    if (!editorRef.value) return
    currentCharCount.value = editorRef.value.getText().length
}

// 内容 HTML
const valueHtml = ref('<p>hello</p>')

// 模拟 ajax 异步获取内容
onMounted(() => {
    setTimeout(() => {
        valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
    }, 1500)
})

// 组件销毁时,也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})


</script>
<style scoped lang="scss">
.rich-text-editor{
    height: 100%;
    overflow: auto;
    background-color: #f6f8fa;
    padding: 12px;
    border-radius: 6px;
    box-sizing: border-box;

    .editor-container{
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        overflow: hidden;
    }

    .editor-toolbar{
        border-bottom: 1px solid #d0d7de;
        background: #f6f8fa;
    }

    // 编辑区高度：min-height 由 props 通过 :style 注入，这里只兜底
    .wang-editor{
        display: block;
        overflow-y: auto;
        background: #fff;
    }
    // 底部统计栏
    .editor-footer{
        margin-top: 8px;
        padding: 0 4px;
        color: #fff;
        .word-count{
            display: flex;
            color: #424242;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            .count-text{
                white-space: nowrap;
            }
            .progress-bar{
                flex: 1;
                height: 4px;
                background: rgba(66, 66, 66, 0.3);
                border-radius: 2px;
                overflow: hidden;
                .progress-fill{
                    height: 100%;
                    background: #858e97;
                    transition: width 0.2s ease;
                }
            }
        }
    }
}

</style>