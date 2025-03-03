// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');
const editorSection = document.getElementById('editorSection');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressedSize = document.getElementById('compressedSize');
const compressedDimensions = document.getElementById('compressedDimensions');
const compressionRate = document.getElementById('compressionRate');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const maxWidthInput = document.getElementById('maxWidthInput');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');

// 全局变量
let originalImageFile = null;
let compressedImageData = null;

// 事件监听器设置
function setupEventListeners() {
    // 上传按钮点击事件
    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    // 文件选择事件
    imageInput.addEventListener('change', handleFileSelect);

    // 拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    // 压缩按钮事件
    compressButton.addEventListener('click', compressImage);

    // 下载按钮事件
    downloadButton.addEventListener('click', downloadCompressedImage);

    // 触摸事件
    uploadArea.addEventListener('touchstart', function(e) {
        e.preventDefault(); // 防止默认行为
    });

    uploadArea.addEventListener('touchend', function(e) {
        e.preventDefault();
        imageInput.click(); // 模拟点击文件输入
    });
}

// 处理文件选择
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

// 处理上传的文件
function handleFile(file) {
    // 检查文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('请上传JPG或PNG格式的图片');
        return;
    }

    originalImageFile = file;
    
    // 显示原始图片
    displayOriginalImage(file);
    
    // 显示编辑器区域
    editorSection.style.display = 'block';
    
    // 触发一次图片压缩
    compressImage();
}

// 显示原始图片
function displayOriginalImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // 创建图片对象以获取尺寸
        const img = new Image();
        img.onload = () => {
            // 更新原始图片尺寸信息
            originalDimensions.textContent = `${img.width} x ${img.height}`;
        };
        
        // 设置图片源
        originalImage.src = e.target.result;
        img.src = e.target.result;
        
        // 显示原始文件大小
        originalSize.textContent = formatFileSize(file.size);
    };
    
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage() {
    if (!originalImageFile) return;
    
    const quality = parseInt(qualitySlider.value) / 100;
    const maxWidth = parseInt(maxWidthInput.value);
    
    // 创建图片对象
    const img = new Image();
    
    img.onload = () => {
        // 计算新的尺寸，保持宽高比
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > maxWidth) {
            const ratio = maxWidth / newWidth;
            newWidth = maxWidth;
            newHeight = Math.round(newHeight * ratio);
        }
        
        // 创建Canvas
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 绘制图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 压缩图片
        let mimeType = originalImageFile.type;
        compressedImageData = canvas.toDataURL(mimeType, quality);
        
        // 显示压缩后的图片
        compressedImage.src = compressedImageData;
        
        // 计算压缩后的文件大小
        calculateCompressedSize(compressedImageData);
        
        // 更新压缩后的尺寸信息
        compressedDimensions.textContent = `${newWidth} x ${newHeight}`;
        
        // 启用下载按钮
        downloadButton.disabled = false;
    };
    
    img.src = URL.createObjectURL(originalImageFile);
}

// 计算压缩后的文件大小
function calculateCompressedSize(dataURL) {
    // 从DataURL计算近似大小
    const base64 = dataURL.split(',')[1];
    const binarySize = window.atob(base64).length;
    
    // 显示压缩后的大小
    compressedSize.textContent = formatFileSize(binarySize);
    
    // 计算压缩率
    const compressionRatio = Math.round((1 - binarySize / originalImageFile.size) * 100);
    compressionRate.textContent = `${compressionRatio}%`;
    
    // 如果压缩效果不好（负压缩率），显示警告
    if (compressionRatio < 0) {
        compressionRate.style.color = 'red';
    } else {
        compressionRate.style.color = '';
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedImageData) return;
    
    // 检测设备类型和浏览器环境
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
        // 微信WebView环境：创建覆盖层，而不是弹出窗口
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#f5f7ff';
        overlay.style.zIndex = '9999';
        overlay.style.overflow = 'auto';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerText = '返回编辑';
        closeButton.style.position = 'fixed';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '8px 16px';
        closeButton.style.backgroundColor = '#4a6bef';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.zIndex = '10000';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // 添加内容
        overlay.innerHTML = `
            <div style="text-align: center; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; padding-top: 40px;">
                <h3 style="color: #4a6bef; margin-bottom: 20px;">保存图片到相册</h3>
                <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px; text-align: left;">
                    <p>1. 长按下方图片</p>
                    <p>2. 从弹出菜单中选择"保存图片"或"识别图中二维码"</p>
                </div>
                <img src="${compressedImageData}" alt="压缩后的图片" style="max-width: 100%; height: auto; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;" />
            </div>
        `;
        
        // 添加到页面
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
    } else if (isMobile) {
        // 其他移动设备：尝试打开新窗口
        const newTab = window.open();
        if (newTab) {
            newTab.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>保存图片</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                            text-align: center;
                            background-color: #f5f7ff;
                            min-height: 100vh;
                        }
                        .container {
                            padding: 20px;
                            max-width: 100%;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            margin-bottom: 20px;
                            border: 1px solid #e0e0e0;
                            border-radius: 8px;
                        }
                        h3 {
                            color: #4a6bef;
                        }
                        .instructions {
                            background-color: #fff;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h3>长按图片保存到相册</h3>
                        <div class="instructions">
                            <p>1. 长按下方图片</p>
                            <p>2. 在弹出菜单中选择"保存图片"或"添加到照片"</p>
                        </div>
                        <img src="${compressedImageData}" alt="压缩后的图片" />
                    </div>
                </body>
                </html>
            `);
            newTab.document.close();
        } else {
            // 如果弹出窗口被阻止，也使用覆盖层方式
            const fallbackOverlay = document.createElement('div');
            fallbackOverlay.style.position = 'fixed';
            fallbackOverlay.style.top = '0';
            fallbackOverlay.style.left = '0';
            fallbackOverlay.style.width = '100%';
            fallbackOverlay.style.height = '100%';
            fallbackOverlay.style.backgroundColor = '#f5f7ff';
            fallbackOverlay.style.zIndex = '9999';
            fallbackOverlay.style.overflow = 'auto';
            fallbackOverlay.style.padding = '20px';
            fallbackOverlay.style.boxSizing = 'border-box';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerText = '返回编辑';
            closeBtn.style.position = 'fixed';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '10px';
            closeBtn.style.padding = '8px 16px';
            closeBtn.style.backgroundColor = '#4a6bef';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '4px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10000';
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(fallbackOverlay);
            });
            
            fallbackOverlay.innerHTML = `
                <div style="text-align: center; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; padding-top: 40px;">
                    <h3 style="color: #4a6bef; margin-bottom: 20px;">保存图片到相册</h3>
                    <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px; text-align: left;">
                        <p>1. 长按下方图片</p>
                        <p>2. 在弹出菜单中选择"保存图片"或"添加到照片"</p>
                    </div>
                    <img src="${compressedImageData}" alt="压缩后的图片" style="max-width: 100%; height: auto; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;" />
                </div>
            `;
            
            fallbackOverlay.appendChild(closeBtn);
            document.body.appendChild(fallbackOverlay);
        }
    } else {
        // 桌面设备：使用传统下载方法
        // 创建下载链接
        const link = document.createElement('a');
        link.href = compressedImageData;
        
        // 设置文件名
        const originalName = originalImageFile.name;
        const extension = originalName.substring(originalName.lastIndexOf('.'));
        const filename = originalName.substring(0, originalName.lastIndexOf('.')) + '_compressed' + extension;
        
        link.download = filename;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

window.addEventListener('error', function(e) {
    console.error('全局错误捕获:', e.message, e.filename, e.lineno);
    alert('加载出错: ' + e.message); // 在移动端可见的错误提示
});

// 在页面完全加载后再初始化复杂功能
window.addEventListener('load', function() {
    // 这里放置一些不是立即需要的功能初始化
});