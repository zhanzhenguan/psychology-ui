<template>
    <div class="article-container">
        <div class="header-section">
            <div class="header-content">
                <el-image :src="booksLogo" style="width: 60px;height: 60px;"></el-image>
                <h1>文章详情</h1>
            </div>
        </div>
        <div class="content">
            <div class="diary-card">
                <p class="title">文章信息</p>
                <div class="sub-title">
                    <el-tag size="large" class="category-tag">{{ articleData.categoryName }}</el-tag>
                    <div class="flex-box">
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>{{ formatDateOnly(articleData.updatedAt) }}</span>
                    </div>
                </div>
                <h1 class="article-title">{{ articleData.title }}</h1>
                <div class="summary-content" v-if="articleData.summary">
                    <p>{{ articleData.summary }}</p>
                </div>
                <div :style="{ marginTop: '20px' }" class="flex-box">
                    <div class="item flex-box">
                        <el-icon>
                            <Avatar />
                        </el-icon>
                        <span>{{ articleData.authorName }}</span>
                    </div>
                    <div class="item flex-box">
                        <el-icon>
                            <Platform />
                        </el-icon>
                        <span>{{ articleData.readCount }} 次阅读</span>
                    </div>
                </div>
            </div>
            <div class="diary-card">
                <div class="title">正文内容</div>
                <div class="content-wrapper" v-html="formatContent(articleData.content)"></div>
                <div class="tags-content" v-if="articleData.tagArray && articleData.tagArray.length">
                    <h6 class="tags-title">相关标签</h6>
                    <div class="tags-list">
                        <el-tag v-for="tag in articleData.tagArray" :key="tag" type="info" effect="light"
                            class="tag-item">{{ tag }}</el-tag>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script setup>
import { useRoute } from 'vue-router';
import { articleDetail } from '@/api/frontend'
import { ref, onMounted, defineProps } from 'vue'
import { formatDateOnly } from '@/utils/date'
const route = useRoute();
const articleData = ref({})


// 从路由参数中获取id
const id = route.params?.id
//需要再路由 props: true
const props = defineProps({
    id: {
        type: String,
        default: ''
    }
})

onMounted(() => {
    getArticleDetail()
})

const getArticleDetail = () => {
    articleDetail(props.id).then(data => {
        articleData.value = data
    })
}

const booksLogo = new URL('@/assets/images/books.png', import.meta.url).href

const formatContent = (content) => {
    if (!content) return ''

    // 基本的HTML清理和格式化
    let formatted = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')

    return formatted
}


</script>
<style scoped lang="scss">
.article-container {
    min-height: 100%;
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f4f7fb 100%);

    .flex-box {
        display: flex;
        align-items: center;
        color: #8b949e;

        .el-icon {
            color: #b6c2d4;
            font-size: 14px;
        }

        span {
            margin-left: 8px;
            font-size: 13px;
        }

        .item {
            margin-right: 20px;
        }
    }

    .header-section {
        background: linear-gradient(135deg, #f8b76a 0%, #c8a4e0 100%);
        color: #fff;
        padding: 44px 48px;

        .header-content {
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: 1200px;
            margin: 0 auto;

            h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: 1px;
            }
        }
    }

    .content {
        margin: 0 auto;
        width: 980px;
        max-width: calc(100% - 48px);
        padding: 24px 0;

        .diary-card {
            margin-bottom: 20px;
            background: #fff;
            border: 1px solid #eef1f6;
            border-radius: 14px;
            padding: 24px 28px;
            box-shadow: 0 4px 14px rgba(61, 70, 84, 0.05);

            .title {
                margin-bottom: 16px;
                font-size: 15px;
                font-weight: 600;
                color: #3d4654;
                display: flex;
                align-items: center;
                gap: 6px;

                &::before {
                    content: '';
                    width: 3px;
                    height: 14px;
                    border-radius: 2px;
                    background: #f0b26a;
                }
            }

            .sub-title {
                margin-top: 16px;
                display: flex;
                align-items: center;

                .category-tag {
                    margin-right: 20px;
                }
            }

            .article-title {
                font-size: 24px;
                font-weight: 600;
                color: #3d4654;
                margin-top: 24px;
                margin-bottom: 12px;
                line-height: 1.4;
            }

            .summary-content {
                background: #fdf8f1;
                border-left: 3px solid #f0b26a;
                padding: 12px 16px;
                border-radius: 0 10px 10px 0;

                p {
                    margin: 0;
                    font-size: 14px;
                    color: #8b949e;
                    line-height: 1.7;
                }
            }

            .content-wrapper {
                font-size: 15px;
                line-height: 1.8;
                color: #3d4654;

                :deep(p) {
                    margin-bottom: 12px;
                }

                :deep(h1) {
                    margin: 20px 0 12px;
                    font-size: 20px;
                    font-weight: 600;
                    color: #3d4654;
                }

                :deep(h2) {
                    margin: 18px 0 10px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #3d4654;
                    border-bottom: 1px solid #eef1f6;
                    padding-bottom: 6px;
                }

                :deep(h3) {
                    margin: 16px 0 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #5b6c7d;
                }

                :deep(h4),
                :deep(h5),
                :deep(h6) {
                    margin: 14px 0 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #5b6c7d;
                }

                :deep(ul),
                :deep(ol) {
                    padding-left: 20px;
                    margin-bottom: 12px;
                    color: #3d4654;
                }

                :deep(li) {
                    margin-bottom: 6px;
                    line-height: 1.8;
                }

                :deep(strong) {
                    color: #2c3540;
                    font-weight: 600;
                }

                :deep(em) {
                    color: #6b7d8f;
                }

                :deep(a) {
                    color: #5b82b8;
                    text-decoration: none;

                    &:hover {
                        text-decoration: underline;
                    }
                }

                :deep(blockquote) {
                    margin: 12px 0;
                    padding: 10px 16px;
                    border-left: 3px solid #a8c5e8;
                    background: #f6f8fb;
                    border-radius: 0 8px 8px 0;
                    color: #5b6c7d;
                }

                :deep(code) {
                    padding: 2px 6px;
                    background: #f0f2f6;
                    border-radius: 4px;
                    font-size: 14px;
                    color: #c0576b;
                }

                :deep(pre) {
                    margin: 12px 0;
                    padding: 14px 16px;
                    background: #f6f8fa;
                    border: 1px solid #eef1f6;
                    border-radius: 8px;
                    overflow-x: auto;

                    code {
                        padding: 0;
                        background: none;
                        color: #3d4654;
                    }
                }

                :deep(img) {
                    max-width: 100%;
                    border-radius: 8px;
                }

                :deep(hr) {
                    border: none;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e2e6ee, transparent);
                    margin: 20px 0;
                }
            }

            .tags-content {
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #eef1f6;

                .tags-title {
                    margin-bottom: 12px;
                    margin: 0 0 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #3d4654;
                }

                .tags-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
            }
        }
    }
}
</style>