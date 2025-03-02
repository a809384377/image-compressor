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
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
}); 