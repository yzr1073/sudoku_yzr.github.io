// 全局变量
let data = null;
let chart = null;
let selectedTheme = 'blue';
// DOM 元素
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFile = document.getElementById('remove-file');
const dataPreview = document.getElementById('data-preview');
const tableHeader = document.getElementById('table-header');
const tableBody = document.getElementById('table-body');
const xAxisSelect = document.getElementById('x-axis-select');
const yAxisSelect = document.getElementById('y-axis-select');
const chartTitle = document.getElementById('chart-title');
const showLegend = document.getElementById('show-legend');
const showGrid = document.getElementById('show-grid');
const generateChart = document.getElementById('generate-chart');
const chartContainer = document.getElementById('chart-container');
const chartCanvas = document.getElementById('chart-canvas');
const noChartMessage = document.getElementById('no-chart-message');
const exportChart = document.getElementById('export-chart');
const exportFilename = document.getElementById('export-filename');
const exportWidth = document.getElementById('export-width');
const exportHeight = document.getElementById('export-height');
const bgTransparent = document.getElementById('bg-transparent');
const bgWhite = document.getElementById('bg-white');
const navbar = document.getElementById('navbar');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationIcon = document.getElementById('notification-icon');
// 导航栏滚动效果
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        navbar.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
    } else {
        navbar.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
    }
});
// 文件上传相关
browseBtn.addEventListener('click', () => {
    fileInput.click();
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});
// 拖放功能
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});
function highlight() {
    dropArea.classList.add('border-primary', 'bg-primary/5');
}
function unhighlight() {
    dropArea.classList.remove('border-primary', 'bg-primary/5');
}
dropArea.addEventListener('drop', handleDrop, false);
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
        handleFile(file);
    }
}
// 处理文件上传
function handleFile(file) {
    // 显示上传进度
    uploadProgress.classList.remove('hidden');
    simulateProgress();
    // 验证文件类型
    const fileTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    if (!fileTypes.includes(file.type) &&
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls') &&
        !file.name.endsWith('.csv')) {
        showNotification('错误', '请上传Excel或CSV文件', 'error');
        uploadProgress.classList.add('hidden');
        return;
    }
    // 读取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 处理Excel文件
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            }
            // 处理CSV文件
            else if (file.name.endsWith('.csv')) {
                const text = e.target.result;
                const lines = text.split('\n');
                data = lines.map(line => line.split(','));
            }
            // 检查数据是否有效
            if (!data || data.length <= 1) {
                showNotification('错误', '文件中没有足够的数据', 'error');
                uploadProgress.classList.add('hidden');
                return;
            }
            // 更新文件信息
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            // 显示文件信息和数据预览
            fileInfo.classList.remove('hidden');
            dataPreview.classList.remove('hidden');
            // 填充表格预览
            populateTablePreview();
            // 填充列选择器
            populateColumnSelectors();
            // 隐藏进度条
            uploadProgress.classList.add('hidden');
            showNotification('成功', '文件上传成功', 'success');
        } catch (error) {
            console.error('Error processing file:', error);
            showNotification('错误', '处理文件时出错', 'error');
            uploadProgress.classList.add('hidden');
        }
    };
    reader.onerror = function() {
        showNotification('错误', '读取文件时出错', 'error');
        uploadProgress.classList.add('hidden');
    };
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsText(file);
    }
}
// 模拟上传进度
function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
        progressPercentage.textContent = `${Math.round(progress)}%`;
        }, 200);
}
// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
// 填充表格预览
function populateTablePreview() {
    // 清空表格
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    // 添加表头
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        headerRow.appendChild(th);
    });
    tableHeader.appendChild(headerRow);
    // 添加数据行（最多显示10行）
    const rowsToDisplay = Math.min(data.length - 1, 10);
    for (let i = 1; i <= rowsToDisplay; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        data[i].forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500';
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    }
    // 如果有更多数据，显示省略行
    if (data.length > 11) {
        const moreRow = document.createElement('tr');
        const moreTd = document.createElement('td');
        moreTd.colSpan = data[0].length;
        moreTd.className = 'px-4 py-3 text-center text-sm text-gray-400';
        moreTd.textContent = `... 和 ${data.length - 10} 更多行`;
        moreRow.appendChild(moreTd);
        tableBody.appendChild(moreRow);
    }
}
// 填充列选择器
function populateColumnSelectors() {
    // 清空选择器
    xAxisSelect.innerHTML = '<option value="">请选择...</option>';
    yAxisSelect.innerHTML = '<option value="">请选择...</option>';
    // 添加列选项
    data[0].forEach((column, index) => {
        const xOption = document.createElement('option');
        xOption.value = index;
        xOption.textContent = column;
        xAxisSelect.appendChild(xOption);
        const yOption = document.createElement('option');
        yOption.value = index;
        yOption.textContent = column;
        yAxisSelect.appendChild(yOption);
    });
}
// 移除文件
removeFile.addEventListener('click', () => {
    fileInput.value = '';
    data = null;
    fileInfo.classList.add('hidden');
    dataPreview.classList.add('hidden');
    xAxisSelect.innerHTML = '<option value="">请选择...</option>';
    yAxisSelect.innerHTML = '<option value="">请选择...</option>';
    // 如果有图表，销毁它
    if (chart) {
        chart.destroy();
        chart = null;
        chartContainer.classList.add('hidden');
        noChartMessage.classList.remove('hidden');
    }
    showNotification('信息', '文件已移除', 'info');
});
// 图表类型选择
document.querySelectorAll('.chart-type-option').forEach(option => {
    option.addEventListener('click', () => {
        // 移除所有选中状态
        document.querySelectorAll('.chart-type-option').forEach(opt => {
            opt.classList.remove('bg-primary/10', 'text-primary');
        });
        // 添加选中状态
        option.classList.add('bg-primary/10', 'text-primary');
    });
});
// 颜色主题选择
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有选中状态
        document.querySelectorAll('.theme-btn').forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-2');
        });
        // 添加选中状态
        btn.classList.add('ring-2', 'ring-offset-2', 'ring-primary');
        // 保存选中的主题
        selectedTheme = btn.dataset.theme;
    });
});
// 生成图表
generateChart.addEventListener('click', () => {
    if (!data) {
        showNotification('错误', '请先上传数据文件', 'error');
        return;
    }
    const xAxisIndex = parseInt(xAxisSelect.value);
    const yAxisIndex = parseInt(yAxisSelect.value);
    if (isNaN(xAxisIndex) || isNaN(yAxisIndex)) {
        showNotification('错误', '请选择X轴和Y轴数据列', 'error');
        return;
    }
    if (xAxisIndex === yAxisIndex) {
        showNotification('错误', 'X轴和Y轴不能选择同一列', 'error');
        return;
    }
    // 准备图表数据
    const labels = [];
    const values = [];
    // 从第2行开始，因为第1行是表头
    for (let i = 1; i < data.length; i++) {
        // 跳过空行
        if (!data[i][xAxisIndex] || !data[i][yAxisIndex]) continue;
        labels.push(data[i][xAxisIndex]);
        // 尝试转换为数字
        const value = parseFloat(data[i][yAxisIndex]);
        values.push(isNaN(value) ? data[i][yAxisIndex] : value);
    }
    if (labels.length === 0 || values.length === 0) {
        showNotification('错误', '所选列中没有有效数据', 'error');
        return;
    }
    // 获取选中的图表类型
    let chartType = 'bar';
    const selectedChartType = document.querySelector('.chart-type-option.bg-primary\\/10');
    if (selectedChartType) {
        chartType = selectedChartType.dataset.type;
    }
    // 准备图表配置
    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: chartTitle.value || data[0][yAxisIndex],
                data: values,
                backgroundColor: getThemeColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: showLegend.checked,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chartTitle.value || `${data[0][yAxisIndex]} 图表`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                    },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1D2129',
                    bodyColor: '#4E5969',
                    borderColor: '#E5E6EB',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            return `${data[0][yAxisIndex]}: ${context.raw}`;
                        }
                    }
                }
                },
            scales: {
                x: {
                    grid: {
                        display: showGrid.checked,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#4E5969'
                    }
                    },
                y: {
                    grid: {
                        display: showGrid.checked,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#4E5969',
                        callback: function(value) {
                            // 格式化大数字
                            if (value >= 1000 && value < 1000000) {
                                return (value / 1000).toFixed(1) + 'k';
                            } else if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            return value;
                        }
                    }
                }
                },
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear'
                }
            }
        }
    };
    // 特殊配置
    if (chartType === 'pie' || chartType === 'doughnut') {
        delete config.options.scales;
        config.options.cutout = chartType === 'doughnut' ? '65%' : '0%';
    }
    // 如果已有图表，销毁它
    if (chart) {
        chart.destroy();
    }
    // 创建新图表
    chart = new Chart(chartCanvas, config);
    // 显示图表容器，隐藏无图表消息
    chartContainer.classList.remove('hidden');
    noChartMessage.classList.add('hidden');
    showNotification('成功', '图表生成成功', 'success');
});
// 根据主题获取颜色
function getThemeColors(count) {
    const themes = {
        blue: [
            'rgba(22, 93, 255, 0.8)',
            'rgba(22, 93, 255, 0.6)',
            'rgba(22, 93, 255, 0.4)',
            'rgba(22, 93, 255, 0.3)',
            'rgba(22, 93, 255, 0.2)',
            'rgba(22, 93, 255, 0.1)'
        ],
        green: [
            'rgba(0, 191, 165, 0.8)',
            'rgba(0, 191, 165, 0.6)',
            'rgba(0, 191, 165, 0.4)',
            'rgba(0, 191, 165, 0.3)',
            'rgba(0, 191, 165, 0.2)',
            'rgba(0, 191, 165, 0.1)'
        ],
        purple: [
            'rgba(156, 39, 176, 0.8)',
            'rgba(156, 39, 176, 0.6)',
            'rgba(156, 39, 176, 0.4)',
            'rgba(156, 39, 176, 0.3)',
            'rgba(156, 39, 176, 0.2)',
            'rgba(156, 39, 176, 0.1)'
        ],
        red: [
            'rgba(255, 82, 82, 0.8)',
            'rgba(255, 82, 82, 0.6)',
            'rgba(255, 82, 82, 0.4)',
            'rgba(255, 82, 82, 0.3)',
            'rgba(255, 82, 82, 0.2)',
            'rgba(255, 82, 82, 0.1)'
        ],
        yellow: [
            'rgba(255, 193, 7, 0.8)',
            'rgba(255, 193, 7, 0.6)',
            'rgba(255, 193, 7, 0.4)',
            'rgba(255, 193, 7, 0.3)',
            'rgba(255, 193, 7, 0.2)',
            'rgba(255, 193, 7, 0.1)'
        ],
        gray: [
            'rgba(108, 117, 125, 0.8)',
            'rgba(108, 117, 125, 0.6)',
            'rgba(108, 117, 125, 0.4)',
            'rgba(108, 117, 125, 0.3)',
            'rgba(108, 117, 125, 0.2)',
            'rgba(108, 117, 125, 0.1)'
        ]
    };
    const colors = themes[selectedTheme];
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}
// 导出图表
exportChart.addEventListener('click', () => {
    if (!chart) {
        showNotification('错误', '请先生成图表', 'error');
        return;
    }
    const format = document.querySelector('.export-option.bg-primary\\/10')?.dataset.format || 'png';
    const filename = exportFilename.value || 'chart';
    const width = parseInt(exportWidth.value) || 800;
    const height = parseInt(exportHeight.value) || 600;
    const useWhiteBackground = bgWhite.checked;
    // 创建临时canvas以指定大小导出
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    // 如果需要白色背景
    if (useWhiteBackground) {
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, width, height);
    }
    // 复制原图表到临时canvas
    tempCtx.drawImage(chart.canvas, 0, 0, width, height);
    // 导出逻辑
    try {
        if (format === 'png') {
            download(tempCanvas.toDataURL('image/png'), `${filename}.png`, 'image/png');
        } else if (format === 'jpg') {
            download(tempCanvas.toDataURL('image/jpeg', 0.95), `${filename}.jpg`, 'image/jpeg');
        } else if (format === 'svg') {
            // 注意：Chart.js不直接支持导出SVG，但可以使用第三方库
            showNotification('提示', 'SVG导出功能需要额外的库支持', 'info');
        } else if (format === 'pdf') {
            // 注意：导出PDF需要额外的库如jsPDF
            showNotification('提示', 'PDF导出功能需要额外的库支持', 'info');
        }
        showNotification('成功', `图表已导出为 ${filename}.${format}`, 'success');
    } catch (error) {
        console.error('导出图表时出错:', error);
        showNotification('错误', '导出图表时出错', 'error');
    }
});
// 下载文件
function download(dataUrl, filename, mimeType) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// 显示通知
function showNotification(title, message, type) {
    notificationMessage.textContent = `${title}: ${message}`;
    // 设置图标和样式
    if (type === 'success') {
        notification.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0 opacity-100 z-50 flex items-center bg-green-50 text-green-800 border-l-4 border-green-400';
        notificationIcon.className = 'fa-solid fa-check-circle text-green-500 mr-2';
    } else if (type === 'error') {
        notification.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0 opacity-100 z-50 flex items-center bg-red-50 text-red-800 border-l-4 border-red-400';
        notificationIcon.className = 'fa-solid fa-exclamation-circle text-red-500 mr-2';
    } else if (type === 'info') {
        notification.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0 opacity-100 z-50 flex items-center bg-blue-50 text-blue-800 border-l-4 border-blue-400';
        notificationIcon.className = 'fa-solid fa-info-circle text-blue-500 mr-2';
    }
    // 显示通知
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.transform = 'translateX(calc(100% + 1rem))';
        notification.style.opacity = '0';
        }, 3000);
}
// 默认选中第一个导出选项
document.querySelector('.export-option').classList.add('bg-primary/10', 'text-primary');
// 为所有导出选项添加点击事件
document.querySelectorAll('.export-option').forEach(option => {
    option.addEventListener('click', () => {
        // 移除所有选中状态
        document.querySelectorAll('.export-option').forEach(opt => {
            opt.classList.remove('bg-primary/10', 'text-primary');
        });
        // 添加选中状态
        option.classList.add('bg-primary/10', 'text-primary');
    });
});
// 默认选中第一个图表类型
document.querySelector('.chart-type-option').classList.add('bg-primary/10', 'text-primary');
// 默认选中第一个颜色主题
document.querySelector('.theme-btn').classList.add('ring-2', 'ring-offset-2', 'ring-primary');
// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});