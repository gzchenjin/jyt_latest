document.addEventListener('DOMContentLoaded', () => {
    // 缓存 DOM 元素
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    const authDiv = document.getElementById('auth');
    const contentDiv = document.getElementById('content');
    const recordsTableBody = document.querySelector('#records-table tbody');

    // 批量操作元素
    const checkAllBox = document.getElementById('check-all');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const exportSelectedBtn = document.getElementById('export-selected-btn');

    // 过滤和分页元素
    const filterBtn = document.getElementById('filter-btn');
    const exportFilteredBtn = document.getElementById('export-filtered-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const perPageSelect = document.getElementById('per-page');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const totalItemsInfo = document.getElementById('total-items-info');

    // 存储状态
    let adminSecret = ''; // 存储密码
    let currentPage = 1;
    let totalPages = 1;

    // 【【【 关键：定义 API 的根地址 】】】
    const API_BASE_URL = 'https://www.gzchenjin.com';

    // 1. "登录" 按钮
    loginBtn.addEventListener('click', async () => {
        adminSecret = passwordInput.value;
        if (!adminSecret) {
            errorMsg.textContent = '请输入密码！';
            return;
        }
        await loadRecords(1);
    });

    // 2. 核心功能：加载数据
    async function loadRecords(page = 1) {
        errorMsg.textContent = '';
        const perPage = parseInt(perPageSelect.value, 10);
        const startDate = startDateInput.value || null;
        const endDate = endDateInput.value || null;

        try {
            // 【已修改】使用绝对路径
            const response = await fetch(`${API_BASE_URL}/api/get-all-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    secret: adminSecret,
                    page: page,
                    per_page: perPage,
                    start_date: startDate,
                    end_date: endDate
                })
            });

            if (!response.ok) {
                const err = await response.json();
                errorMsg.textContent = `加载失败: ${err.error}`;
                if (response.status === 403) {
                    authDiv.style.display = 'block';
                    contentDiv.style.display = 'none';
                }
                return;
            }

            authDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            const data = await response.json();
            populateTable(data.records);
            currentPage = data.current_page;
            totalPages = data.total_pages;
            updatePaginationControls(data);

        } catch (e) {
            errorMsg.textContent = `请求出错: ${e.message}`;
        }
    }

    // 3. 填充表格函数
    function populateTable(records) {
        recordsTableBody.innerHTML = '';
        records.forEach(record => {
            const row = recordsTableBody.insertRow();
            row.innerHTML = `
                <td><input type="checkbox" class="row-check" data-id="${record.id}"></td>
                <td>${record.id}</td>
                <td>${record.project_name || '(未填写)'}</td>
                <td>${record.business_code || '(未填写)'}</td>
                <td>${new Date(record.created_at).toLocaleString()}</td>
                <td><span class="delete-btn" data-id="${record.id}">删除</span></td>
            `;

            row.querySelector('.delete-btn').addEventListener('click', () => {
                handleDelete(record.id, row);
            });
        });
        updateSelectionButtons();
        checkAllBox.checked = false;
    }

    // 4. 更新分页控件
    function updatePaginationControls(data) {
        pageInfo.textContent = `第 ${data.current_page} / ${data.total_pages} 页`;
        totalItemsInfo.textContent = `(总计 ${data.total_items} 条记录)`;
        prevPageBtn.disabled = !data.has_prev;
        nextPageBtn.disabled = !data.has_next;
    }

    // 5. 分页按钮事件
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) { loadRecords(currentPage - 1); }
    });
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) { loadRecords(currentPage + 1); }
    });

    // 6. 过滤按钮事件
    filterBtn.addEventListener('click', () => {
        loadRecords(1);
    });

    // 7. 按日期导出按钮事件
    exportFilteredBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (!startDate || !endDate) {
            alert('请先选择开始日期和结束日期，然后再点击“按日期导出”。');
            return;
        }
        // 【已修改】使用绝对路径
        const exportUrl = `${API_BASE_URL}/api/export-excel?start=${startDate}&end=${endDate}`;
        window.location.href = exportUrl;
    });

    // 8. 删除处理函数
    async function handleDelete(id, rowElement) {
        if (!confirm(`您确定要删除 ID 为 ${id} 的记录吗？此操作无法撤销！`)) {
            return;
        }
        try {
            // 【已修改】使用绝对路径
            const response = await fetch(`${API_BASE_URL}/api/delete-record/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: adminSecret })
            });
            const result = await response.json();
            if (response.ok) {
                loadRecords(currentPage);
            } else {
                alert(`删除失败: ${result.error}`);
            }
        } catch (e) {
            alert(`请求出错: ${e.message}`);
        }
    }

    // 9. 更新“操作”按钮的计数
    function updateSelectionButtons() {
        const checkedBoxes = recordsTableBody.querySelectorAll('.row-check:checked');
        const count = checkedBoxes.length;
        if (count > 0) {
            deleteSelectedBtn.textContent = `删除选中 (${count})`;
            exportSelectedBtn.textContent = `导出选中 (${count})`;
            deleteSelectedBtn.style.display = 'inline-block';
            exportSelectedBtn.style.display = 'inline-block';
        } else {
            deleteSelectedBtn.style.display = 'none';
            exportSelectedBtn.style.display = 'none';
        }
    }

    // 10. “全选”复选框的逻辑
    checkAllBox.addEventListener('click', () => {
        recordsTableBody.querySelectorAll('.row-check').forEach(checkbox => {
            checkbox.checked = checkAllBox.checked;
        });
        updateSelectionButtons();
    });

    // 11. 监听表格中任何复选框的点击
    recordsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('row-check')) {
            updateSelectionButtons();
        }
    });

    // 12. “删除选中”按钮的点击事件
    deleteSelectedBtn.addEventListener('click', async () => {
        const checkedBoxes = recordsTableBody.querySelectorAll('.row-check:checked');
        const idsToDelete = Array.from(checkedBoxes).map(cb => cb.dataset.id);
        if (idsToDelete.length === 0) return;
        if (!confirm(`您确定要删除选中的 ${idsToDelete.length} 条记录吗？此操作无法撤销！`)) {
            return;
        }
        try {
            // 【已修改】使用绝对路径
            const response = await fetch(`${API_BASE_URL}/api/delete-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: adminSecret, ids: idsToDelete })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                loadRecords(currentPage);
            } else {
                alert(`删除失败: ${result.error}`);
            }
        } catch (e) {
            alert(`请求出错: ${e.message}`);
        }
    });

    // 13. “导出选中”按钮的点击事件
    exportSelectedBtn.addEventListener('click', async () => {
        const checkedBoxes = recordsTableBody.querySelectorAll('.row-check:checked');
        const idsToExport = Array.from(checkedBoxes).map(cb => cb.dataset.id);
        if (idsToExport.length === 0) return;
        exportSelectedBtn.textContent = '正在导出...';
        exportSelectedBtn.disabled = true;
        try {
            // 【已修改】使用绝对路径
            const response = await fetch(`${API_BASE_URL}/api/export-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: adminSecret, ids: idsToExport })
            });
            if (response.ok) {
                const blob = await response.blob();
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'export.xlsx';
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="(.+)"/);
                    if (match && match[1]) filename = match[1];
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const result = await response.json();
                alert(`导出失败: ${result.error}`);
            }
        } catch (e) {
            alert(`请求出错: ${e.message}`);
        } finally {
            exportSelectedBtn.disabled = false;
            updateSelectionButtons();
        }
    });
});
