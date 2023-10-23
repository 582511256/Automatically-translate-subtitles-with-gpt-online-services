// ==UserScript==
// @name         字幕翻译工具
// @namespace    http://your-namespace.com
// @version      1.0
// @description  上传SRT格式字幕并进行翻译
// @author       Your Name
// @match        https://chat.openai.com/c/32eac0b1-0a53-417b-8f08-cdd136e6b2a1
// @grant        none
// ==/UserScript==

// 在全局范围内定义 sendNextBlock 函数
function sendNextBlock() {
    // 函数内容...
}
(function() {
    'use strict';

    // 定义时间间隔（以毫秒为单位）
    let delayBeforeFirstClick = 2000; // 4秒延迟点击第一个按钮
    let delayBeforeSecondClick = 10000; // 3秒延迟点击第二个按钮
    let delayBetweenBlocks = 20000; // 5秒延迟发送下一个字幕块
    const numBlocksPerSend = 5; // 每次发送的字幕块数量




    // 创建可移动和缩放的窗口
    const windowDiv = document.createElement('div');
    windowDiv.id = 'translationWindow';
    windowDiv.style.position = 'fixed';
    windowDiv.style.top = '10px';
    windowDiv.style.left = '10px';
    windowDiv.style.width = '400px';
    windowDiv.style.height = '600px';
    windowDiv.style.zIndex = '9999';
    windowDiv.style.backgroundColor = 'white';
    windowDiv.style.overflow = 'auto';
    windowDiv.style.resize = 'both';
    windowDiv.style.border = '1px solid #000';
    windowDiv.style.padding = '10px';

    // 创建用户界面
    const uiHTML = `
        <h1>字幕翻译工具</h1>
        <input type="file" id="subtitleFile" accept=".srt" />
        <button id="translateButton">上传字幕并翻译</button>
        <h2>时间间隔设置</h2>
        <label for="delayFirstClick">第一个按钮延迟（毫秒）:</label>
        <input type="number" id="delayFirstClick" value="${delayBeforeFirstClick}" />
        <br>
        <label for="delaySecondClick">第二个按钮延迟（毫秒）:</label>
        <input type="number" id="delaySecondClick" value="${delayBeforeSecondClick}" />
        <br>
        <label for="delayBetweenBlocks">字幕块间隔（毫秒）:</label>
        <br>
        <input type="number" id="delayBetweenBlocks" value="${delayBetweenBlocks}" />
        <h2>原字幕</h2>
        <textarea id="originalSubtitle" style="width: 100%; height: 30%; padding: 10px;"></textarea>
        <textarea id="subtitleBlocks" style="width: 100%; height: 30%; padding: 10px;"></textarea>
        <h2>翻译后的字幕</h2>
        <textarea id="translatedSubtitle" style="width: 100%; height: 30%; padding: 10px;"></textarea>
        <button id="downloadButton">下载翻译后的字幕</button>
    `;

    // 将用户界面添加到窗口
    windowDiv.innerHTML = uiHTML;
    document.body.appendChild(windowDiv);

    // 添加一个用于显示翻译后的字幕的文本框
    const translatedSubtitleTextarea = document.getElementById('translatedSubtitle');

    // 获取 UI 容器
    const uiContainer = document.getElementById('translationWindow');
    let isDragging = false;
    let offsetX, offsetY;

    uiContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = uiContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        uiContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            uiContainer.style.left = e.clientX - offsetX + 'px';
            uiContainer.style.top = e.clientY - offsetY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        uiContainer.style.cursor = 'grab';
    });

    // 添加CSS样式给按钮
    const translateButton = document.getElementById('translateButton');
    translateButton.style.border = '1px solid #000';
    translateButton.style.padding = '5px 10px';
    translateButton.style.backgroundColor = '#fff';
    translateButton.style.color = '#000';
    translateButton.style.cursor = 'pointer';
    translateButton.style.borderRadius = '5px';

    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.border = '1px solid #000';
    downloadButton.style.padding = '5px 10px';
    downloadButton.style.backgroundColor = '#fff';
    downloadButton.style.color = '#000';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.borderRadius = '5px';

    const delayFirstClickInput = document.getElementById('delayFirstClick');
    delayFirstClickInput.style.border = '1px solid #000';
    delayFirstClickInput.style.padding = '3px'; // 调整内边距以使其更小巧
    delayFirstClickInput.style.backgroundColor = '#fff';
    delayFirstClickInput.style.color = '#000';
    delayFirstClickInput.style.borderRadius = '3px'; // 调整圆角以使其更小巧

    const delaySecondClickInput = document.getElementById('delaySecondClick');
    delaySecondClickInput.style.border = '1px solid #000';
    delaySecondClickInput.style.padding = '3px'; // 调整内边距以使其更小巧
    delaySecondClickInput.style.backgroundColor = '#fff';
    delaySecondClickInput.style.color = '#000';
    delaySecondClickInput.style.borderRadius = '3px'; // 调整圆角以使其更小巧

    const delayBetweenBlocksInput = document.getElementById('delayBetweenBlocks');
    delayBetweenBlocksInput.style.border = '1px solid #000';
    delayBetweenBlocksInput.style.padding = '3px'; // 调整内边距以使其更小巧
    delayBetweenBlocksInput.style.backgroundColor = '#fff';
    delayBetweenBlocksInput.style.color = '#000';
    delayBetweenBlocksInput.style.borderRadius = '3px'; // 调整圆角以使其更小巧

    // 隐藏分割后的字幕块文本框
    const subtitleBlocksTextarea = document.getElementById('subtitleBlocks');
    subtitleBlocksTextarea.style.display = 'none';



    // 函数用于点击最后一个复制按钮
    function clickLatestCopyButton() {
        const copyButtons = document.querySelectorAll('button[class*="flex ml-auto gizmo:ml-0"]');
        if (copyButtons.length > 0) {
            const latestCopyButton = copyButtons[copyButtons.length - 1];
            latestCopyButton.click();
            latestCopyButton.focus(); // 设置焦点在第二个按钮
            setTimeout(() => pasteFromClipboard(translatedSubtitleTextarea), delayBeforeSecondClick);
            setTimeout(sendNextBlock, delayBetweenBlocks);
        }
    }

    // 函数用于从剪贴板中粘贴内容到文本框
    function pasteFromClipboard(textarea) {
        navigator.clipboard.readText()
            .then(clipboardText => {
                textarea.value += clipboardText + '\n\n';
            })
            .catch(error => {
                console.error('无法从剪贴板中读取文本: ' + error);
            });
    }

    // 函数用于将文本内容下载为文件
    function downloadSubtitle() {
        const translatedSubtitle = translatedSubtitleTextarea.value;
        const blob = new Blob([translatedSubtitle], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'translated_subtitle.txt';
        a.click();

        URL.revokeObjectURL(url);
    }

    // 修改上传操作的事件监听器
    document.getElementById('translateButton').addEventListener('click', async () => {
        const subtitleFile = document.getElementById('subtitleFile').files[0];

        if (subtitleFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const subtitleText = event.target.result;
                const subtitleLines = subtitleText.split('\n'); // 使用单个换行符分割字幕行

                let currentBlock = '';

                document.getElementById('originalSubtitle').value = ''; // 清空原字幕文本框
                document.getElementById('subtitleBlocks').value = ''; // 清空分割后的字幕文本框
                translatedSubtitleTextarea.value = ''; // 清空翻译后的字幕文本框

                subtitleLines.forEach(line => {
                    currentBlock += line + '\n';

                    if (line.trim() === '') { // 检测空行
                        if (currentBlock.trim() !== '') { // 排除没有内容的情况
                            document.getElementById('subtitleBlocks').value += `字幕块:\n${currentBlock}`;
                        }
                        currentBlock = ''; // 重置当前块
                    }
                });

                document.getElementById('originalSubtitle').value = subtitleText; // 显示原字幕

                // 逐个逐个发送字幕块
                const subtitleBlocks = document.getElementById('subtitleBlocks').value.split('字幕块:\n').filter(block => block.trim() !== '');
                let currentIndex = 0;

                function sendNextBlock() {
                    if (currentIndex < subtitleBlocks.length) {
                        const targetTextArea = document.querySelector('#prompt-textarea'); // 使用选择器 #prompt-textarea
                        if (targetTextArea) {
                            const blocksToSend = subtitleBlocks.slice(currentIndex, currentIndex + numBlocksPerSend);
                            targetTextArea.value = blocksToSend.join('\n');
                            // 触发输入事件，以确保文本框中的值被更新
                            const inputEvent = new Event('input', { bubbles: true });
                            targetTextArea.dispatchEvent(inputEvent);
                            setTimeout(() => {
                                const button = document.querySelector('button[data-testid="send-button"]');
                                if (button) {
                                    button.click();
                                    setTimeout(clickLatestCopyButton, delayBeforeSecondClick);
                                    currentIndex += numBlocksPerSend;
                                    if (currentIndex < subtitleBlocks.length) {
                                        setTimeout(sendNextBlock, delayBetweenBlocks);
                                    } else {
                                        // 所有字幕块发送完成后，下载翻译后的字幕
                                        downloadSubtitle();
                                    }
                                }
                            }, delayBeforeFirstClick);
                        }
                    }
                }

                // 开始发送字幕块
                sendNextBlock();
            };

            reader.readAsText(subtitleFile);
        } else {
            alert('请先选择一个SRT格式的字幕文件。');
        }
    });

    // 添加下载按钮的事件监听器
    document.getElementById('downloadButton').addEventListener('click', downloadSubtitle);

    // 更新时间间隔设置
    document.getElementById('delayFirstClick').addEventListener('input', function() {
        delayBeforeFirstClick = parseInt(this.value);
    });

    document.getElementById('delaySecondClick').addEventListener('input', function() {
        delayBeforeSecondClick = parseInt(this.value);
    });

    document.getElementById('delayBetweenBlocks').addEventListener('input', function() {
        delayBetweenBlocks = parseInt(this.value);
    });
})();
