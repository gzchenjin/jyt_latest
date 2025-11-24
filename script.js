document.addEventListener('DOMContentLoaded', function() {
    // ======================= DATA INITIALIZATION =======================
    // 1. 定义全局变量，初始为空，等待数据加载
    let PM_DATA = [];
    let EMAIL_DATA = {};

    // 2. 异步加载 data.json 文件
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应异常: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // 3. 将加载的数据赋值给全局变量
            PM_DATA = data.pm_data;
            EMAIL_DATA = data.email_data;
            console.log("人员与邮件数据加载成功！");
        })
        .catch(error => {
            console.error('数据加载失败:', error);
            alert("⚠️ 警告：人员基础数据加载失败，查询与邮件功能可能无法使用。\n请检查网络或 data.json 文件是否存在。");
        });

    // ======================= 2. 帮助文档加载 (help-content.html) =======================
    // 找到帮助文档的容器
    const helpContainer = document.querySelector('.help-content');

    if (helpContainer) {
        fetch('help-content.html')
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.text(); // 注意：这里是 .text() 不是 .json()
            })
            .then(html => {
                // 1. 注入 HTML
                helpContainer.innerHTML = html;
                
                // 2. 重新渲染数学公式 (MathJax)
                // 因为 HTML 是动态插入的，必须手动通知 MathJax 重新渲染
                if (window.MathJax) {
                    MathJax.typesetPromise([helpContainer]);
                }
            })
            .catch(err => {
                console.error("帮助文档加载失败:", err);
                helpContainer.innerHTML = "<p style='color:red; padding:20px;'>加载帮助文档失败，请检查 help-content.html 是否存在。</p>";
            });
    }

    // ======================= ELEMENT SELECTORS (DOM Cache) =======================
    const DOMElements = {
        // Main Form
        mainForm: document.getElementById('main-form'),
        ironTriangleInput: document.getElementById('ironTriangleInput'),
        projectLevel: document.getElementById('projectLevel'),
        budgetAmount: document.getElementById('budgetAmount'),
        
        // UI Interaction Elements
        procurement: document.getElementById('procurement'),
        procurementAmount: document.getElementById('procurementAmount'),
        procurementRiskRow: document.getElementById('procurementRiskRow'),
        coreCapability: document.getElementById('coreCapability'),
        coreCapabilityWarning: document.getElementById('coreCapabilityWarning'),
        capacityType: document.getElementById('capacityType'),
        deliveryDetailsTable: document.getElementById('deliveryDetailsTable'),
        
        SJ_projectCooperationNeeded: document.getElementById('SJ_projectCooperationNeeded'),
        SJ_projectCooperationAssessmentRow: document.getElementById('SJ_projectCooperationAssessmentRow'),
        SJ_preInvestmentNeeded: document.getElementById('SJ_preInvestmentNeeded'),
        SJ_preInvestmentDetailsRow: document.getElementById('SJ_preInvestmentDetailsRow'),
        
        TB_biddingMethod: document.getElementById('TB_biddingMethod'),
        TB_bidOpeningDate: document.getElementById('TB_bidOpeningDate'),
        TB_bidResponseDate: document.getElementById('TB_bidResponseDate'),
        TB_biddingRiskRow: document.getElementById('TB_biddingRiskRow'),
        TB_projectCooperationNeeded: document.getElementById('TB_projectCooperationNeeded'),
        TB_projectCooperationAssessmentRow: document.getElementById('TB_projectCooperationAssessmentRow'),
        TB_isPrimarySystem: document.getElementById('TB_isPrimarySystem'),
        TB_securityAssessmentRow: document.getElementById('TB_securityAssessmentRow'),
        
        JD_biddingMethod: document.getElementById('JD_biddingMethod'),
        JD_bidOpeningDate: document.getElementById('JD_bidOpeningDate'),
        JD_bidResponseDate: document.getElementById('JD_bidResponseDate'),
        JD_awardDate: document.getElementById('JD_awardDate'),
        
        // Help Panel
        helpContent: document.querySelector('.help-content'),

        // Modals
        reportModal: document.getElementById('report-modal'),
        reportTitle: document.getElementById('report-title'),
        reportText: document.getElementById('report-text'),

        pmQueryModal: document.getElementById('pm-query-modal'),
        pmAutoResult: document.getElementById('pm-auto-result'),
        pmSearchInput: document.getElementById('pm-search-input'),
        pmDeptFilter: document.getElementById('pm-dept-filter'),
        pmFullTableBody: document.getElementById('pm-full-table').querySelector('tbody'),

        attendeesModal: document.getElementById('attendees-modal'),
        attendeesForm: document.querySelector('#attendees-modal .attendees-form'),
        attendeesOutput: document.getElementById('attendees-output'),

        emailModal: document.getElementById('email-modal'),
        emailChecklist: document.getElementById('email-checklist'),
        emailOutput: document.getElementById('email-output'),
    };

    // ======================= INITIALIZATION =======================
    


    // Create Delivery Details Table Rows
    const tableBody = DOMElements.deliveryDetailsTable.querySelector('tbody');
    const verticalHeaders = ['牵头交付事业部', ...Array.from({length: 7}, (_, i) => `协助交付事业部${i + 1}`)];
    const deptOptions = ["", "IT系统事业部", "大数据AI应用事业部", "数字政府事业部/社会治理大数据研究院广州分院", "云网事业部", "智呼事业部", "智慧企业集成事业部/工业主研院", "智慧网络运营事业部", "智慧业财事业部"];

    verticalHeaders.forEach(headerText => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <th>${headerText}</th>
            <td><select class="table-dept-select">${deptOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
        `;
    });

    // ======================= UI INTERACTIVITY LOGIC =======================
    
    function setupConditionalVisibility(selectId, rowId) {
        const select = document.getElementById(selectId);
        const row = document.getElementById(rowId);
        select.addEventListener('change', () => {
            const shouldShow = (select.value === '是');
            row.style.display = shouldShow ? '' : 'none';
            if (!shouldShow) {
                const textarea = row.querySelector('textarea');
                if (textarea) textarea.value = '';
            }
        });
    }

    DOMElements.procurement.addEventListener('change', () => {
        const isProcurement = DOMElements.procurement.value === '是';
        DOMElements.procurementAmount.disabled = !isProcurement;
        DOMElements.coreCapability.disabled = !isProcurement;
        DOMElements.procurementRiskRow.style.display = isProcurement ? '' : 'none';
        if (!isProcurement) {
            DOMElements.coreCapability.value = '';
            DOMElements.coreCapabilityWarning.style.display = 'none';
            DOMElements.procurementAmount.value = '';
            document.getElementById('procurementRisk').value = '';
        }
    });

    DOMElements.coreCapability.addEventListener('change', () => {
        DOMElements.coreCapabilityWarning.style.display = (DOMElements.coreCapability.value === '是') ? '' : 'none';
    });

    DOMElements.capacityType.addEventListener('change', () => {
        const showTable = ['多产能', '大集成'].includes(DOMElements.capacityType.value);
        DOMElements.deliveryDetailsTable.style.display = showTable ? 'table' : 'none';
    });

    setupConditionalVisibility('SJ_projectCooperationNeeded', 'SJ_projectCooperationAssessmentRow');
    setupConditionalVisibility('SJ_preInvestmentNeeded', 'SJ_preInvestmentDetailsRow');
    setupConditionalVisibility('TB_projectCooperationNeeded', 'TB_projectCooperationAssessmentRow');
    setupConditionalVisibility('TB_isPrimarySystem', 'TB_securityAssessmentRow');

    function updateBiddingFields(methodSelectId) {
        const method = document.getElementById(methodSelectId).value;
        const isTB = methodSelectId.startsWith('TB');
        const openDateEl = document.getElementById(isTB ? 'TB_bidOpeningDate' : 'JD_bidOpeningDate');
        const responseDateEl = document.getElementById(isTB ? 'TB_bidResponseDate' : 'JD_bidResponseDate');
        const awardDateEl = document.getElementById('JD_awardDate');
        const riskRowEl = document.getElementById('TB_biddingRiskRow');

        const openMethods = ["公开招标", "邀请招标", "比选"];
        const responseMethods = ["单一来源", "询价", "竞争性谈判"];
        
        const isOpen = openMethods.includes(method);
        const isResponse = responseMethods.includes(method);
        
        openDateEl.disabled = !isOpen;
        responseDateEl.disabled = !isResponse;
        if(isTB && riskRowEl) riskRowEl.style.display = isOpen ? '' : 'none';
        if(!isTB && awardDateEl) awardDateEl.disabled = !isOpen;
    };
    
    DOMElements.TB_biddingMethod.addEventListener('change', () => updateBiddingFields('TB_biddingMethod'));
    DOMElements.JD_biddingMethod.addEventListener('change', () => updateBiddingFields('JD_biddingMethod'));

    // ======================= FIELD SYNCHRONIZATION =======================
    const syncPairs = {
        'SJ_grossMargin': 'TB_grossMargin', 'TB_grossMargin': 'SJ_grossMargin',
        'SJ_projectCooperationAssessment': 'TB_projectCooperationAssessment', 'TB_projectCooperationAssessment': 'SJ_projectCooperationAssessment',
        'SJ_projectCooperationNeeded': 'TB_projectCooperationNeeded', 'TB_projectCooperationNeeded': 'SJ_projectCooperationNeeded',
        'TB_businessType': 'JD_businessType', 'JD_businessType': 'TB_businessType',
        'TB_biddingMethod': 'JD_biddingMethod', 'JD_biddingMethod': 'TB_biddingMethod',
        'JD_deliveryPeriod': 'TB_deliveryPeriod', 'TB_deliveryPeriod': 'JD_deliveryPeriod',
        'JD_deliveryRisk': 'TB_deliveryRisk', 'TB_deliveryRisk': 'JD_deliveryRisk',
        'JD_maintenanceRequirements': 'TB_maintenanceRequirements', 'TB_maintenanceRequirements': 'JD_maintenanceRequirements',
        'JD_trialRun': 'TB_trialRun', 'TB_trialRun': 'JD_trialRun',
        'JD_maintenanceAssessment': 'TB_maintenanceAssessment', 'TB_maintenanceAssessment': 'JD_maintenanceAssessment',
        'JD_testingRequirements': 'TB_testingRequirements', 'TB_testingRequirements': 'JD_testingRequirements',
    };
    
    let isSyncing = false;
    
    Object.keys(syncPairs).forEach(sourceId => {
        const sourceEl = document.getElementById(sourceId);
        sourceEl.addEventListener('change', () => { // Use 'change' for selects, works for inputs too
            if (isSyncing) return;
            isSyncing = true;
            const targetEl = document.getElementById(syncPairs[sourceId]);
            if (targetEl) {
                targetEl.value = sourceEl.value;
                targetEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            isSyncing = false;
        });
        sourceEl.addEventListener('input', () => { // Use 'input' for live typing in text fields
            if (isSyncing || sourceEl.tagName === 'SELECT') return;
             isSyncing = true;
            const targetEl = document.getElementById(syncPairs[sourceId]);
            if (targetEl) targetEl.value = sourceEl.value;
            isSyncing = false;
        });
    });

    // ======================= CORE LOGIC (from logic_1.py) =======================

    function _safeFloat(value, defaultValue = 0.0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function _ensurePeriod(text) {
        text = String(text || '').trim();
        if (!text) return "";
        return (text.endsWith('。') || text.endsWith('.')) ? text : text + '。';
    }

    function _formatDate(dateStr) {
        try {
            const dt = new Date(dateStr);
            if (isNaN(dt.getTime())) return dateStr;
            return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
        } catch (e) {
            return dateStr;
        }
    }



    function _formatProjectRoles(inputText) {
        if (!inputText) return "【铁三角信息未填写】。";
        const roles = {};
        // --- 修改后的正则表达式 ---
        const pattern = /(.+?)\s*[:：]\s*(.+?)\s*[(（](.+?)[)）]/gs; 
        // --- 修改结束 ---
        let match;
        while ((match = pattern.exec(inputText.trim())) !== null) {
            // Trim potential extra spaces around names and departments
            roles[match[1].trim()] = { name: match[2].trim(), department: match[3].trim() };
        }
        const getInfo = (role) => roles[role] || { name: "【待定】", department: "【待定】" };
        const pm = getInfo("项目经理"), sales = getInfo("销售经理"), solution = getInfo("方案经理"), delivery = getInfo("交付经理");
        // Ensure department is captured correctly even if name extraction failed slightly
        if (!pm.department && roles["项目经理"]?.department) pm.department = roles["项目经理"].department;
        if (!sales.department && roles["销售经理"]?.department) sales.department = roles["销售经理"].department;
        if (!solution.department && roles["方案经理"]?.department) solution.department = roles["方案经理"].department;
        if (!delivery.department && roles["交付经理"]?.department) delivery.department = roles["交付经理"].department;
        
        return `项目经理是${pm.name}(${pm.department})，销售经理是${sales.name}(${sales.department})，方案经理是${solution.name}(${solution.department})，交付经理是${delivery.name}(${delivery.department})。`;
    }

    function gatherFormData() {
        const data = {};
        const form = DOMElements.mainForm;
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) data[input.id] = input.value;
        });
        
        const table_data = [];
        const rows = DOMElements.deliveryDetailsTable.querySelector('tbody').rows;
        for(let i=0; i<rows.length; i++) {
            const row = rows[i];
            const dept = row.cells[1].querySelector('select').value;
            if(!dept) continue;

            table_data.push({
                '类型': row.cells[0].innerText,
                '事业部': dept,
                '项目经理': row.cells[2].querySelector('input').value,
                '交付内容': row.cells[3].querySelector('input').value,
                '预算（万元）': row.cells[4].querySelector('input').value
            });
        }
        data['deliveryDetails'] = table_data;
        return data;
    }

    function _calculateCommonLogic(formData) {
        const budgetYuan = _safeFloat(formData.budgetAmount);
        const procurementYuan = _safeFloat(formData.procurementAmount);
        const budgetWan = budgetYuan / 10000;
        const procurementWan = procurementYuan / 10000;
        const procurementRatio = (budgetWan !== 0) ? (procurementWan / budgetWan) : 0.0;
        
        let leadDepartment = "【未知事业部】";
        const tjsRawText = formData.ironTriangleInput || '';
        // --- 修改后的正则表达式 ---
        const pmPattern = /项目经理\s*[:：]\s*(?:.+?)\s*[(（](.+?)[)）]/s;
        // --- 修改结束 ---
        const pmMatch = tjsRawText.match(pmPattern);
        if (pmMatch && pmMatch[1]) {
             leadDepartment = pmMatch[1].trim();
        }

        const tjsSummary = _formatProjectRoles(tjsRawText); // Uses the updated function from Step 1

        // Delivery details summaries (logic remains the same)

        let assistDepartmentsSummary = '';
        let deliverySummary = '';
        const deliveryDetails = formData.deliveryDetails || [];
        if (formData.capacityType !== '单产能' && deliveryDetails.length > 0) {
            const assistDepts = deliveryDetails
                .filter(row => row['类型'] !== '牵头交付事业部' && row['事业部'])
                .map(row => row['事业部'].trim());
            if (assistDepts.length > 0) assistDepartmentsSummary = `${assistDepts.join('、')}协助交付。`;

            deliverySummary = '\n' + deliveryDetails.map((row, index) => {
                let currentPart = `${row['事业部']}`;
                if (row['交付内容']) currentPart += `负责交付${row['交付内容']}`;
                const budgetVal = _safeFloat(row['预算（万元）']);
                if (budgetVal > 0) currentPart += `，预算${budgetVal.toFixed(2)}万元`;
                if (row['项目经理']) {
                    const managerRole = row['类型'] === '牵头交付事业部' ? '项目经理' : '子项目经理';
                    currentPart += `，${managerRole}是${row['项目经理']}`;
                }
                return `${index + 1}）${currentPart}`;
            }).join('；\n') + '。';
        }

        return {
            budget_in_wan: budgetWan,
            procurement_in_wan: procurementWan,
            procurement_ratio: procurementRatio,
            lead_department: leadDepartment,
            tjs_summary: tjsSummary,
            assist_departments_summary: assistDepartmentsSummary,
            delivery_summary: deliverySummary
        };
    }
    
    // --- Generate Opportunity Minutes ---
    function generateOpportunityMinutes(formData) {
        const common = _calculateCommonLogic(formData);
        const temp = {...formData, ...common};
        const getVal = (key, placeholder) => temp[key]?.trim() || placeholder;

        const projectName = getVal('projectName', "【请补充项目名称】");
        const businessCode = getVal('businessCode', "【请补充项目商机编码】");
        const constructionContent = getVal('constructionContent', "【请补充建设内容】");
        const capacityType = getVal('capacityType', "【请选择产能能力】");
        const projectLevel = getVal('projectLevel', "【请选择项目级别】");
        const SJ_projectRisk = `本项目存在风险：\n${getVal('SJ_projectRisk', "【请补充项目风险（商机）】")}`;
        const OT_risk = getVal('OT_risk');
        
        const clientDescription = !temp.contractClient  ? "【请补充签约客户】"
          : `${temp.contractClient}` 
          + ((!temp.endClient || temp.endClient === temp.contractClient) ? '。'
          : `，最终客户是${temp.endClient}。`);

        let procurement_text = temp.procurement === '是' ? `涉及外采，外采预算${temp.procurement_in_wan.toFixed(2)}万元（含税），`
            : temp.procurement === '否' ? '不涉及外采，' : '【请选择是否后向外采】，';
        
        let procurementRisk = temp.procurement === '是' ? getVal('procurementRisk', "【请补充外采风险】")
            : temp.procurement === '否' ? "本项目不涉及外采" : "【请评估是否涉及外采】";
        
        let SJ_projectCooperationAssessment = temp.SJ_projectCooperationNeeded === '是' ? getVal('SJ_projectCooperationAssessment', "【请补充项目合作评估】")
            : temp.SJ_projectCooperationNeeded === '否' ? "本项目不涉及项目合作" : "【请评估是否项目合作】";
        
        let SJ_preInvestmentDetails = temp.SJ_preInvestmentNeeded === '是' ? getVal('SJ_preInvestmentDetails', "【请补充预投入情况】")
            : temp.SJ_preInvestmentNeeded === '否' ? "本项目不涉及预投入情况" : "【请评估是否涉及预投入】";

        const SJ_atomicCapability = getVal('SJ_atomicCapability', "【请补充原子能力评估】");



        
        const key1_text = `本项目是${projectName}，项目签约客户是${clientDescription}项目建设内容为${constructionContent}`;
        const key2_text = `本项目属于${capacityType}${projectLevel}项目，由${temp.lead_department}牵头，${temp.assist_departments_summary}${temp.tjs_summary}${temp.delivery_summary}`;
        const key3_text = `本项目预算${temp.budget_in_wan.toFixed(2)}万元（含税），${procurement_text}毛利率预估${_safeFloat(temp.SJ_grossMargin).toFixed(2)}%（不含税），利润率预估${_safeFloat(temp.SJ_netMargin).toFixed(2)}%（不含税）`;

        let output = `${projectName}（${businessCode}）\n\n商机评估会\n`;
        const points = [key1_text, key2_text, key3_text, SJ_projectRisk, procurementRisk, SJ_projectCooperationAssessment, SJ_preInvestmentDetails, SJ_atomicCapability, OT_risk];
        
        let counter = 1;
        points.forEach(p => {
            if (p && String(p).trim()) {
                output += `${counter}、${_ensurePeriod(p)}\n`;
                counter++;
            }
        });
        output += "综合评估各要素，铁三角成员评估跟进此商机。";
        return output;
    }

    // --- Generate Bidding Minutes ---
    function generateBiddingMinutes(formData) {
        const common = _calculateCommonLogic(formData);
        const temp = {...formData, ...common};
        const getVal = (key, placeholder) => temp[key]?.trim() || placeholder;

        const projectName = getVal('projectName', "【请补充项目名称】");
        const businessCode = getVal('businessCode', "【请补充项目商机编码】");
        const TB_businessType = getVal('TB_businessType', "【请补充业务类型】");
        const constructionContent = getVal('constructionContent', "【请补充建设内容】");
        const capacityType = getVal('capacityType', "【请选择产能能力】");
        const projectLevel = getVal('projectLevel', "【请选择项目级别】");
        const TB_deliveryPeriod = getVal('TB_deliveryPeriod', "【请补充交付周期】");
        const TB_deliveryRisk = getVal('TB_deliveryRisk', "【请补充交付风险】");
        const TB_maintenanceRequirements = getVal('TB_maintenanceRequirements', "【请补充运维要求】");
        const TB_maintenanceAssessment = getVal('TB_maintenanceAssessment', "【请补充运维服务评估意见】");
        const TB_financialAssessment = getVal('TB_financialAssessment', "【请补充财务评估】");
        const TB_testingRequirements = getVal('TB_testingRequirements', "【请补充等保测评、第三方测评要求】");
        const TB_trialRun = getVal('TB_trialRun', "【请补充试运行情况】");
        const OT_risk = getVal('OT_risk');
        const TB_biddingRisk = getVal('TB_biddingRisk', "【请补充招投标风险评估】");

        const clientDescription = !temp.contractClient  ? "【请补充签约客户】"
          : `${temp.contractClient}` 
          + ((!temp.endClient || temp.endClient === temp.contractClient) ? '。'
          : `，最终客户是${temp.endClient}。`);
        

        const bidMethodsWithRisk = ["公开招标", "邀请招标", "比选"];
        const bid_method_desc = (method => {
            if (!method) return "【请选择投标方式】";
            const entity = getVal('TB_biddingEntity', '【请选择投标主体】');
            if (bidMethodsWithRisk.includes(method)) return `${method}方式，拟以${entity}名义投标，开标时间为${_formatDate(temp.TB_bidOpeningDate)}`;
            if (["单一来源", "询价", "竞争性谈判"].includes(method)) return `${method}方式，拟以${entity}名义应答，应答时间为${_formatDate(temp.TB_bidResponseDate)}`;
            return method;
        })(temp.TB_biddingMethod);

        const risk_assessment_desc = bidMethodsWithRisk.includes(temp.TB_biddingMethod) ? TB_biddingRisk
            : (temp.TB_biddingMethod ? `本项目客户采用${temp.TB_biddingMethod}方式，不涉及招投标风险` : "【请选择投标方式】");

        const procurement_text = temp.procurement === '是' ? `涉及外采，外采预算${temp.procurement_in_wan.toFixed(2)}万元（含税），外采占比${temp.procurement_ratio.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2})}，`
            : temp.procurement === '否' ? '不涉及外采，' : '【请选择是否后向外采】，';

        const procurementRisk = temp.procurement === '是' ? getVal('procurementRisk', "【请补充外采风险】")
            : temp.procurement === '否' ? "本项目不涉及外采" : "【请评估是否涉及外采】";

        const TB_projectCooperationAssessment = temp.TB_projectCooperationNeeded === '是' ? getVal('TB_projectCooperationAssessment', "【请补充项目合作评估】")
            : temp.TB_projectCooperationNeeded === '否' ? "本项目不涉及项目合作" : "【请评估是否项目合作】";
            
        const TB_securityAssessment = temp.TB_isPrimarySystem === '是' ? getVal('TB_securityAssessment', "【请补充网络和信息安全评估】")
            : temp.TB_isPrimarySystem === '否' ? "本项目不涉及亿迅主责系统" : "【请评估是否亿迅主责系统】";



        // 先处理 constructionContent，移除末尾可能自带的句号
        const trimmedContent = constructionContent.endsWith('。') 
            ? constructionContent.slice(0, -1) 
            : constructionContent;


        const key1_text = `本项目为${TB_businessType}项目，项目签约客户是${clientDescription}客户计划采用${bid_method_desc}。`;
        const key2_text = `项目建设内容为：${trimmedContent}。由${temp.lead_department}牵头，${temp.assist_departments_summary}${temp.tjs_summary}${temp.delivery_summary}`;
        const key3_text = `本项目预算${temp.budget_in_wan.toFixed(2)}万元（含税），属于${capacityType}${projectLevel}项目，${procurement_text}毛利率预估${_safeFloat(temp.TB_grossMargin).toFixed(2)}%（不含税）。`;
        const key4_text = `本项目交付要求：交付周期为${TB_deliveryPeriod}，${TB_deliveryRisk}`;

        let output = `${projectName}(${businessCode})\n\n投标评估会\n一、项目基本信息\n1、${key1_text}\n2、${key2_text}\n3、${key3_text}\n二、风险及应对措施\n`;
        
        const risk_points = [risk_assessment_desc, key4_text, procurementRisk, TB_projectCooperationAssessment, TB_maintenanceRequirements, TB_securityAssessment, TB_maintenanceAssessment, TB_financialAssessment, TB_testingRequirements, TB_trialRun, OT_risk];
        let counter = 1;
        risk_points.forEach(p => {
            if (p && String(p).trim()) {
                output += `${counter}、${_ensurePeriod(p)}\n`;
                counter++;
            }
        });
        
        output += "三、会议结论\n综合评估各要素，铁三角评估可参与此项目投标，并根据内控审批权限作投标审批决策。";
        return output;
    }

    // --- Generate Kickoff Minutes ---
    function generateKickoffMinutes(formData) {
        const common = _calculateCommonLogic(formData);
        const temp = {...formData, ...common};
        const getVal = (key, placeholder) => temp[key]?.trim() || placeholder;

        const projectName = getVal('projectName', "【请补充项目名称】");
        const businessCode = getVal('businessCode', "【请补充项目商机编码】");
        const JD_businessType = getVal('JD_businessType', "【请补充业务类型】");
        const constructionContent = getVal('constructionContent', "【请补充建设内容】");
        const capacityType = getVal('capacityType', "【请选择产能能力】");
        const projectLevel = getVal('projectLevel', "【请选择项目级别】");
        const JD_deliveryPeriod = getVal('JD_deliveryPeriod', "【请补充交付周期】");
        const JD_deliveryRisk = getVal('JD_deliveryRisk', "【请补充交付风险】");
        const JD_maintenanceRequirements = getVal('JD_maintenanceRequirements', "【请补充运维要求】");
        const JD_trialRun = getVal('JD_trialRun', "【请补充试运行情况】");
        const JD_maintenanceAssessment = getVal('JD_maintenanceAssessment', "【请补充运维服务评估意见】");
        const JD_testingRequirements = getVal('JD_testingRequirements', "【请补充等保测评、第三方测评要求】");
        const OT_risk = getVal('OT_risk');

        const clientDescription = !temp.contractClient  ? "【请补充签约客户】"
          : `${temp.contractClient}` 
          + ((!temp.endClient || temp.endClient === temp.contractClient) ? '。'
          : `，最终客户是${temp.endClient}。`);

        // ========================[ 这里是您确认的最新逻辑 ]========================
        const bid_method_desc = (method => {
            if (!method) return "【请选择投标方式】";
            
            const open_date = _formatDate(temp.JD_bidOpeningDate);
            const award_date = _formatDate(temp.JD_awardDate);
            const signing_date = _formatDate(temp.JD_signingDate);
            const response_date = _formatDate(temp.JD_bidResponseDate);
    
            if (["公开招标", "邀请招标", "比选"].includes(method)) {
                return `${method}方式，开标时间为${open_date}，中标时间为${award_date}，计划${signing_date}前完成签约`;
            }
            if (method === "单一来源") {
                return `${method}方式，无需招投标，${response_date}已完成应答，计划${signing_date}前完成签约`;
            }
            if (["原子能力下单", "订单方式"].includes(method)) {
                return `${method}方式，预计客户在${signing_date}前完成下单`;
            }
            if (["询价", "竞争性谈判"].includes(method)) {
                return `${method}方式，${response_date}已完成应答，预计客户在${signing_date}前完成签约`;
            }
            if (["电商采购", "直接采购"].includes(method)) {
                return `${method}方式，预计客户在${signing_date}前完成签约`;
            }
            return method; // 其他情况直接返回方法名
        })(temp.JD_biddingMethod);
        // ======================================================================

        const procurement_text = temp.procurement === '是' ? `涉及外采，外采预算${temp.procurement_in_wan.toFixed(2)}万元（含税），外采占比${temp.procurement_ratio.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2})}。`
            : temp.procurement === '否' ? '不涉及外采。' : '【请选择是否后向外采】，';
            
        const procurementRisk = temp.procurement === '是' ? getVal('procurementRisk', "【请补充外采风险】")
            : temp.procurement === '否' ? "本项目不涉及外采" : "【请评估是否涉及外采】";

        const trimmedContent = constructionContent.endsWith('。') 
            ? constructionContent.slice(0, -1) 
            : constructionContent;
        
        const key1_text = `本项目为${JD_businessType}项目，项目签约客户是${clientDescription}客户采用${bid_method_desc}。`;
        const key2_text = `本项目预算${temp.budget_in_wan.toFixed(2)}万元（含税），${procurement_text}`;
        const key3_text = `项目建设内容为：${trimmedContent}。本项目属于${capacityType}${projectLevel}项目，由${temp.lead_department}牵头，${temp.assist_departments_summary}${temp.tjs_summary}${temp.delivery_summary}`;
        const key4_text = "1、项目售前资料交底：销售经理、方案经理已对项目所有售前的会议纪要、客户沟通记录、客户需求及交付要求等资料交接给交付经理、项目经理；\n2、项目投标资料交底：销售经理、方案经理已对招标文件、投标文件、技术规范书等资料交接给交付经理、项目经理；\n3、项目实施计划交底：项目经理已完成项目里程碑计划，各关键节点已有明确的交付成果要求，铁三角已确认该时间节点可行；\n4、项目干系人交底：销售经理已上传项目干系人清单，清单已包含客户（签约客户/最终客户）以及合作伙伴干系人的名单和联系方式，铁三角对项目干系人已知晓。";
        const key5_text = `本项目交付要求：交付周期为${JD_deliveryPeriod}，${JD_deliveryRisk}`;

        let output = `${projectName}（${businessCode}）\n\n项目交底会\n一、项目基本信息\n1、${key1_text}\n2、${key2_text}\n3、${key3_text}\n二、项目文件交底\n${key4_text}\n三、风险及应对举措\n`;
        
        const risk_points = [key5_text, JD_maintenanceRequirements, procurementRisk, JD_trialRun, JD_maintenanceAssessment, JD_testingRequirements, OT_risk];
        let counter = 1;
        risk_points.forEach(p => {
            if (p && String(p).trim()) {
                output += `${counter}、${_ensurePeriod(p)}\n`;
                counter++;
            }
        });

        output += "四、其他参会部门意见\n公共架构评估师意见详见会议纪要中【公共架构结论】部分。\n五、会议结论\n项目铁三角对项目情况、项目角色分工、项目计划及里程碑节点、项目风险及问题解决方案等内容均已了解清晰，交底完成，请项目组尽快完成合同签约。";
        return output;
    }
    
    // ======================= EVENT LISTENERS FOR BUTTONS =======================
    
    document.getElementById('btn-gen-opportunity').addEventListener('click', () => {
        const formData = gatherFormData();
        const report = generateOpportunityMinutes(formData);
        showReportDialog("商机评估会纪要", report);
    });

    document.getElementById('btn-gen-bidding').addEventListener('click', () => {
        const formData = gatherFormData();
        const report = generateBiddingMinutes(formData);
        showReportDialog("投标评估会纪要", report);
    });
    
    document.getElementById('btn-gen-kickoff').addEventListener('click', () => {
        const formData = gatherFormData();
        const report = generateKickoffMinutes(formData);
        showReportDialog("项目交底会纪要", report);
    });


    // ======================= MODAL/DIALOG HANDLING =======================
    
    function showReportDialog(title, text) {
        DOMElements.reportTitle.innerText = title;
        DOMElements.reportText.value = text;
        DOMElements.reportModal.style.display = 'flex';
    }
    document.getElementById('close-report-modal').addEventListener('click', () => DOMElements.reportModal.style.display = 'none');

    // --- PM Query Modal Logic ---
    document.getElementById('btn-query-pm').addEventListener('click', () => {
        DOMElements.pmFullTableBody.innerHTML = '';
        PM_DATA.forEach(pm => {
            const row = DOMElements.pmFullTableBody.insertRow();
            row.innerHTML = `<td>${pm.项目经理}</td><td>${pm.级别}</td><td>${pm.在职部门}</td>`;
        });
        const allDepts = [...new Set(PM_DATA.map(p => p.在职部门))].sort();
        DOMElements.pmDeptFilter.innerHTML = `<option>所有部门</option>` + allDepts.map(d => `<option>${d}</option>`).join('');
        
        performPMAutoSearch();
        filterPMTable();
        DOMElements.pmQueryModal.style.display = 'flex';
    });
    document.getElementById('close-pm-modal').addEventListener('click', () => DOMElements.pmQueryModal.style.display = 'none');
    
    function performPMAutoSearch() {
        const ironTriangleText = DOMElements.ironTriangleInput.value;
        // --- 修改后的正则表达式 ---
        const pattern = /项目经理\s*[:：]\s*(.+?)\s*[(（](.+?)[)）]/s;
        // --- 修改结束 ---
        const match = ironTriangleText.match(pattern);
        
        if (!match) {
            DOMElements.pmAutoResult.innerHTML = "未在铁三角信息中找到有效的项目经理信息。";
            return;
        }
        const pmName = match[1].trim();
        const pmDept = match[2].trim();
        const matches = PM_DATA.filter(p => p.项目经理 === pmName);
        
        if (matches.length === 0) {
            DOMElements.pmAutoResult.innerHTML = `匹配不成功：未在列表中找到名为 '${pmName}' 的项目经理。`;
            return;
        }
        matches.sort((a, b) => (a.在职部门 === pmDept ? -1 : 1) - (b.在职部门 === pmDept ? -1 : 1));
        let result_text = `<b>为 '${pmName}' 找到 ${matches.length} 个结果（部门匹配优先）：</b><br>`;
        result_text += matches.map(p => `&nbsp;&nbsp;- ${p.项目经理} (<b>${p.级别}</b>) - ${p.在职部门}`).join('<br>');
        DOMElements.pmAutoResult.innerHTML = result_text;
    }

    
    
    function filterPMTable() {
        const searchText = DOMElements.pmSearchInput.value.toLowerCase();
        const selectedDept = DOMElements.pmDeptFilter.value;
        const rows = DOMElements.pmFullTableBody.rows;
        for (let i = 0; i < rows.length; i++) {
            const name = rows[i].cells[0].textContent.toLowerCase();
            const dept = rows[i].cells[2].textContent;
            const nameMatch = !searchText || name.includes(searchText);
            const deptMatch = selectedDept === '所有部门' || dept === selectedDept;
            rows[i].style.display = (nameMatch && deptMatch) ? '' : 'none';
        }
    }
    DOMElements.pmSearchInput.addEventListener('input', filterPMTable);
    DOMElements.pmDeptFilter.addEventListener('change', filterPMTable);

    
    // --- Attendees Modal Logic ---
    document.getElementById('btn-show-attendees').addEventListener('click', () => {
        const attendeesForm = DOMElements.attendeesForm;
        attendeesForm.querySelector('#attendees-projectLevel').value = DOMElements.projectLevel.value;
        try {
            const budgetWan = parseFloat(DOMElements.budgetAmount.value) / 10000;
            attendeesForm.querySelector('#attendees-budgetAmount').value = isNaN(budgetWan) ? '' : budgetWan;
        } catch { attendeesForm.querySelector('#attendees-budgetAmount').value = ''; }
        attendeesForm.querySelector('#attendees-procurement').value = DOMElements.procurement.value;
        attendeesForm.querySelector('#attendees-cooperation').value = DOMElements.SJ_projectCooperationNeeded.value || DOMElements.TB_projectCooperationNeeded.value;
        attendeesForm.querySelector('#attendees-primarySystem').value = DOMElements.TB_isPrimarySystem.value;
        
        updateAttendeesList();
        DOMElements.attendeesModal.style.display = 'flex';
    });
    document.getElementById('close-attendees-modal').addEventListener('click', () => DOMElements.attendeesModal.style.display = 'none');
    
    function updateAttendeesList() {
        const form = DOMElements.attendeesForm;
        const getV = (id) => form.querySelector(`#${id}`).value;
        
        let roles = {};
        // --- 修改后的正则表达式 ---
        const pattern = /(.+?)\s*[:：]\s*(.+?)\s*[(（](.+?)[)）]/gs;
        // --- 修改结束 ---
        const ironTriangleText = DOMElements.ironTriangleInput.value.trim();
        let match;
        while ((match = pattern.exec(ironTriangleText)) !== null) {
             roles[match[1].trim()] = { name: match[2].trim(), department: match[3].trim() };
        }
        
        const getRoleString = roleName => {
            const info = roles[roleName];
            return info && info.name && info.department ? `${roleName}：${info.name}【${info.department}】` : roleName;
        };
        
        const all = {
            '项目经理': getRoleString("项目经理"), '销售经理': getRoleString("销售经理"), '方案经理': getRoleString("方案经理"), '交付经理': getRoleString("交付经理"),
            '法律风险评估': "法律风险评估: 李屹【法律合规部】", '项目合作': "项目合作评估: 高仲凯/许海燕【市场及渠道支撑部（标前）】",
            '采购评估': "采购评估: 梁其容/罗晓纯【采购部】", '网信安评估': "网信安评估: 吴中华/陆艺阳【运营管理部/研发与质量管理中心、安全事业部】",
            '运维服务评估意见': "运维服务评估: 熊俊伟, 蒋朝豪【运营管理部/研发与质量管理中心】",
            '公共架构评估': (() => {
                const archMap = {
                    "IT系统事业部": "王沛文、高航",
                    "大数据AI应用事业部": "许智洋",
                    "数字政府事业部/社会治理大数据研究院广州分院": "李佳鑫、许伟明",
                    "云网事业部": "许智洋",
                    "智呼事业部": "郑辉",
                    "智慧企业集成事业部/工业主研院": "郑辉、陈家辉",
                    "智慧网络运营事业部": "周宏江、高航、许伟明",
                    "智慧业财事业部": "王沛文",
                };
                const pmDept = roles["项目经理"]?.department;
                return `公共架构评估师： ${archMap[pmDept] || ''}【运营管理部/研发与质量管理中心】`;
            })()
        };

        const budget = _safeFloat(getV('attendees-budgetAmount'));
        const procurement = getV('attendees-procurement'); // 获取是否涉及外采
        const level = getV('attendees-projectLevel');       // 获取项目级别

        if (budget >= 50) {
            // 首先判断：如果不涉及外采 且 项目级别是 B类 或 C类
            if (procurement === '否' && (level === 'B类' || level === 'C类')) {
                all['财务评估'] = "财务评估: 刘椰韵【财务部】";
            } else {
                // 其他所有预算大于等于50万的情况（涉及外采，或者项目是A类）
                all['财务评估'] = "财务评估: 戴亮【财务部】";
            }
        }
        // 注意：如果预算小于50万，则 all['财务评估'] 不会被赋值，即不邀请财务参会。
        
        const required = {
            "商机评估会": ["项目经理", "销售经理", "方案经理", "交付经理"],
            "投标评估会": ["项目经理", "销售经理", "方案经理", "交付经理", "运维服务评估意见", "财务评估"],
            "项目交底会": ["项目经理", "销售经理", "方案经理", "交付经理", "公共架构评估"],
            "商机、投标评估会": ["项目经理", "销售经理", "方案经理", "交付经理", "运维服务评估意见", "财务评估"],
        };

        const optionalFlags = {
            "项目合作": getV('attendees-cooperation') === '是',
            "采购评估": getV('attendees-procurement') === '是',
            "网信安评估": getV('attendees-primarySystem') === '是',
            "法律风险评估": getV('attendees-legalRisk') === '是',
        };

        const meetingType = getV('attendees-meetingType');
        let final = (required[meetingType] || []).map(role => all[role]).filter(Boolean);
        Object.keys(optionalFlags).forEach(role => {
            if (optionalFlags[role] && all[role]) final.push(all[role]);
        });
        
        DOMElements.attendeesOutput.value = [...new Set(final)].join('\n');
    }
    DOMElements.attendeesForm.addEventListener('change', updateAttendeesList);
    DOMElements.attendeesForm.addEventListener('input', updateAttendeesList);

    // --- Email Modal Logic ---
    document.getElementById('btn-email').addEventListener('click', () => {
        repopulateEmailDepartments();
        DOMElements.emailModal.style.display = 'flex';
    });
    document.getElementById('close-email-modal').addEventListener('click', () => DOMElements.emailModal.style.display = 'none');
    
    const repopulateEmailDepartments = () => {
        DOMElements.emailChecklist.innerHTML = '';
        let depts = new Set();
        const tjsText = DOMElements.ironTriangleInput.value;
        const salesMatch = tjsText.match(/销售经理：\n.+?\((.+?)\)/s);
        if (salesMatch && EMAIL_DATA[salesMatch[1].trim()]) {
            depts.add(salesMatch[1].trim());
        }
        
        const tableRows = DOMElements.deliveryDetailsTable.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            const dept = row.querySelector('select').value;
            if (dept) depts.add(dept);
        });

        if (depts.size === 0) { // Add a blank dynamic row if no depts found
            addEmailDeptRow(true);
        } else {
            depts.forEach(dept => addEmailDeptRow(false, dept, true));
        }
        updateEmailList();
    };

    const addEmailDeptRow = (isDynamic = false, deptName = "", isChecked = false) => {
        const rowWidget = document.createElement('div');
        rowWidget.className = 'mail-dept-item'; // 应用网格布局
        
        if (isDynamic) {
            // --- 动态行 (下拉框) ---
            const control = document.createElement('select');
            control.innerHTML = [''].concat(Object.keys(EMAIL_DATA)).map(d => `<option value="${d}">${d}</option>`).join('');
            control.value = deptName;
            control.addEventListener('change', updateEmailList);
            
            rowWidget.appendChild(control); // 子元素 1: 下拉框

        } else {
            // --- 静态行 (复选框) ---
            const control = document.createElement('input');
            control.type = 'checkbox';
            control.id = `email-check-${deptName.replace(/\s+/g, '-')}`;
            control.checked = isChecked;
            control.dataset.dept = deptName;
            control.addEventListener('change', updateEmailList);

            const deptSpan = document.createElement('span');
            deptSpan.textContent = deptName;
            
            // (可选的良好体验) 点击部门名称也能选中复选框
            deptSpan.style.cursor = 'pointer';
            deptSpan.onclick = () => {
                control.checked = !control.checked;
                // 手动触发 change 事件来更新邮件列表
                control.dispatchEvent(new Event('change', { bubbles: true }));
            };

            rowWidget.appendChild(control);  // 子元素 1: 复选框
            rowWidget.appendChild(deptSpan); // 子元素 2: 部门名称
        }

        // --- 通用的移除按钮 ---
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove'; // 使用您统一的 btn-remove 样式
        removeBtn.textContent = '移除';
        removeBtn.onclick = () => {
            rowWidget.remove();
            updateEmailList();
        };

        rowWidget.appendChild(removeBtn); // 子元素 3 (静态行) 或 子元素 2 (动态行)

        DOMElements.emailChecklist.appendChild(rowWidget);
    };
    
    const updateEmailList = () => {
        let leaders = [], managers = [], seenEmails = new Set();
        
        // --- 关键修改：查找 .mail-dept-item 而不是 .checklist-row ---
        const rows = DOMElements.emailChecklist.querySelectorAll('.mail-dept-item');
        // --- 修改结束 ---
        
        const getDeptFromRow = row => {
            const chk = row.querySelector('input[type="checkbox"]');
            if (chk && chk.checked) return chk.dataset.dept;
            const sel = row.querySelector('select');
            if (sel && sel.value) return sel.value;
            return null;
        };

        rows.forEach(row => {
            const dept = getDeptFromRow(row);
            if (dept && EMAIL_DATA[dept]) {
                const [name, email] = EMAIL_DATA[dept].leader;
                if (email && !seenEmails.has(email)) {
                    leaders.push(`${name} <${email}>`);
                    seenEmails.add(email);
                }
            }
        });
        rows.forEach(row => {
            const dept = getDeptFromRow(row);
            if (dept && EMAIL_DATA[dept]) {
                const [name, email] = EMAIL_DATA[dept].manager;
                if (email && !seenEmails.has(email)) {
                    managers.push(`${name} <${email}>`);
                    seenEmails.add(email);
                }
            }
        });
        
        let finalText = leaders.join('； ');
        if (leaders.length > 0 && managers.length > 0) finalText += '；\n';
        finalText += managers.join('； ');
        DOMElements.emailOutput.value = finalText;
    };
    
    document.getElementById('email-add-btn').addEventListener('click', () => addEmailDeptRow(true));
    document.getElementById('email-refresh-btn').addEventListener('click', repopulateEmailDepartments);

    // ======================= IMPORT/EXPORT LOGIC ======================
    
    document.getElementById('btn-export').addEventListener('click', () => {
        const data = gatherFormData();

        // 【【【【【【 新增的唯一一行代码 】】】】】】
        saveDataToBackend(data); // 在导出本地文件的同时，发送到服务器
        // 【【【【【【        结束         】】】】】】


        const projectName = data.projectName || '纪要数据';
        const businessCode = data.businessCode ? `(${data.businessCode})` : '';
        
        // --- 修复时区问题的代码 ---
        const now = new Date(); // 获取当前本地时间
        const Y = now.getFullYear();
        const M = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1
        const D = now.getDate().toString().padStart(2, '0');
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const timestamp = `${Y}${M}${D}${h}${m}`; // 拼接为 YYYYMMDDHHMM 格式
        // --- 修复结束 ---
        
        const filename = `${projectName}${businessCode}_${timestamp}.json`;
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename.replace(/[<>:"/\\|?*]/g, '_');;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    const importInput = document.getElementById('import-file-input');
    document.getElementById('btn-import').addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let importData = data;
                if (Array.isArray(data) && data.length > 0) {
                    console.log('检测到数据库导出格式 (数组)，将导入第一个条目。');
                    importData = data[0]; // 只获取数组中的第一个对象
            }

                
                populateFormData(importData);
                alert('数据导入成功！');
            } catch (err) { alert(`导入失败: ${err.message}`); }
        };
        reader.readAsText(file);
        importInput.value = '';
    });
    
    function populateFormData(data) {
        const inputs = DOMElements.mainForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id && data.hasOwnProperty(input.id)) {
                input.value = data[input.id];
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        if (data.deliveryDetails) {
            const rows = DOMElements.deliveryDetailsTable.querySelector('tbody').rows;
            for(let i=0; i < rows.length; i++){ // Clear existing data first
                rows[i].cells[1].querySelector('select').value = '';
                rows[i].cells[2].querySelector('input').value = '';
                rows[i].cells[3].querySelector('input').value = '';
                rows[i].cells[4].querySelector('input').value = '';
            }
            data.deliveryDetails.forEach((rowData, index) => {
                if (index < rows.length) {
                    const row = rows[index];
                    row.cells[1].querySelector('select').value = rowData['事业部'] || '';
                    row.cells[2].querySelector('input').value = rowData['项目经理'] || '';
                    row.cells[3].querySelector('input').value = rowData['交付内容'] || '';
                    row.cells[4].querySelector('input').value = rowData['预算（万元）'] || '';
                }
            });
        }
    }

}); // End of DOMContentLoaded



/**
 * 【新增】使用 fetch API 将数据发送到您的后端服务器
 * @param {object} data - 从 gatherFormData() 获得的对象
 */
async function saveDataToBackend(data) {
    
    // 这就是您服务器的地址！
    const backendUrl = 'https://www.gzchenjin.com/api/save';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST', // 使用 POST 方法
            headers: {
                'Content-Type': 'application/json', // 告诉服务器我们发送的是 JSON
            },
            body: JSON.stringify(data), // 将 JS 对象转换为 JSON 字符串
        });

        if (response.ok) {
            // 如果服务器返回成功 (HTTP 201)
            console.log('数据成功保存到后端！');
            //alert('数据已成功备份到服务器！'); // 弹出成功提示
        } else {
            // 如果服务器返回错误 (例如 HTTP 500)
            console.error('保存到后端失败:', await response.text());
            //alert('数据备份到服务器失败，请检查服务器日志。'); // 弹出错误提示
        }
    } catch (error) {
        // 如果网络不通或服务器未运行
        console.error('连接后端服务器时出错:', error);
        //alert('无法连接到后端服务器，请检查服务器是否正在运行且防火墙已配置。'); // 弹出连接错误提示
    }
}
