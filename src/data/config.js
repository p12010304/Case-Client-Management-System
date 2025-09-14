// src/data/config.js

export const translations = {
  en: {
    // --- General ---
    app_title: 'Case & Client Management System',
    add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', search: 'Search...', notes: 'Notes', permission: 'Permission', actions: 'Actions', close: 'Close', date: 'Date', all_types: 'All Types', all_statuses: 'All Statuses', not_found: 'No matching records found.', details: 'Details', keyword: 'Keyword',
    loading_data: 'Loading data...',

    year: 'Year',
    month: 'Month',
    day: 'Day',
    regarding_case: 'Regarding Case', // 新增
    Plaintiff: 'Plaintiff', // 新增
    Defendant: 'Defendant', // 新增

    // --- Login & User System ---
    login: 'Login', logout: 'Logout', register: 'Register', email: 'Email', password: 'Password', username: 'Username',
    login_to_account: 'Login to your account', register_new_account: 'Register a new account',
    no_account_yet: "Don't have an account yet?", already_have_account: 'Already have an account?',
    register_success_title: 'Registration Submitted', register_success_message: 'Your registration has been submitted for approval. You will be notified by email once your account is activated.',
    my_profile: 'My Profile', personal_info: 'Personal Information', user_profile: 'User Profile',
    change_password: 'Change Password', notification_settings: 'Notification Settings', daily_email_summary: 'Daily Email Summary',
    
    // --- Sharing & Permissions ---
    private: 'Private', public: 'Public', custom_share: 'Custom Share',
    share_with: 'Share with',
    select_users_or_groups: 'Select users or groups...',
    sharing_groups: 'Sharing Groups',
    create_new_group: 'Create New Group',
    add_group: 'Add Group',
    save_group: 'Save Group',
    group_name: 'Group Name',
    group_members: 'Group Members',
    select_members: 'Select members...',
    member_selected: 'member selected',
    members_selected: 'members selected',
    members_unit: 'members', // --- THIS IS THE NEW KEY ---
    no_sharing_groups_yet: 'No sharing groups have been created yet.',
    confirm_delete_group_message: 'Are you sure you want to delete this sharing group?',
    group_creation_error: 'Group name and at least one member are required.',

    // --- People Management ---
    people_management: 'People Management', person: 'Person', person_details: 'Person Details', add_person: 'Add Person', edit_person: 'Edit Person',
    contact_phone: 'Contact Phone', add_phone: 'Add Phone', add_email: 'Add Email', nationality: 'Nationality',
    personality_notes: 'Personality/Handling Notes', person_identity_type: 'Identity/Role', identity_client: 'Client', identity_collaborator: 'Collaborator',
    identity_other: 'Other (Specify)', identity_other_specify: 'Specify Identity',
    sort_by: 'Sort by', newest_first: 'Date Added (Newest)', name_asc: 'Name (A-Z)', name_desc: 'Name (Z-A)',
    favorites_only: 'Favorites', all_identities: 'All Identities',

    // --- Case Management ---
    case_management: 'Case Management', case: 'Case', case_details: 'Case Details', add_case: 'Add Case', edit_case: 'Edit Case',
    reference_id: 'Reference ID', case_type: 'Case Type', case_subtype: 'Case Subtype', case_status: 'Case Status',
    status_ongoing: 'Ongoing', status_completed: 'Completed', status_on_hold: 'On Hold',
    roles: 'Roles', related_cases: 'Related Cases', ongoing_cases: 'Ongoing Cases', completed_cases: 'Completed Cases',
    no_ongoing_cases: 'No ongoing cases found.', no_completed_cases: 'No completed cases found.',

    // --- Attachments ---
    attachments: 'Attachments',
    add_attachment: 'Add Attachment',
    attachment_name: 'Attachment Name...',
    uploaded_on: 'Uploaded on',
    delete_selected: 'Delete Selected',
    download_selected: 'Download Selected',
    print_selected: 'Print Selected',
    select_all: 'Select All',
    selected: 'Selected',
    open_selected: 'Open Selected',
    open_files_title: 'Open Remaining Files',
    print_files_title: 'Print Remaining Files',
    files_instruction: 'Click each link to process. The link will disappear after being clicked.',
    
    // --- Events ---
    events: 'Events',
    event_management: "Event Management",
    today_reminders: "Today's Reminders",
    upcoming_reminders_seven_days: "Upcoming (Next 7 Days)",
    add_event: 'Add Event',
    edit_event: 'Edit Event',
    event_details: 'Event Details',
    event_title: 'Event Title',
    location: 'Location',
    all_day: 'All Day',
    time: 'Time',
    time_am: 'AM',
    time_pm: 'PM',
    no_events_today: 'No events scheduled for today.',
    no_upcoming_events: 'No upcoming events in the next 7 days.',
    event_with: 'Event with ...',
    unknown_participant: 'Unnamed Participant',
    related_case: 'Related Case',
    related_case_optional: 'Related Case (Optional)',
    select_case: 'Select a related case',
    no_related_case: 'None',
    related_participants: 'Related People/Contacts',
    our_attendees: 'Our Attendees',
    add_participant: 'Add Participant',
    search_or_add_person: 'Select from list or type a new name',
    confirm_delete_event: 'Are you sure you want to delete this event?',
    error_saving_event: 'Error saving event: {message}',
    error_updating_event: 'Error updating event: {message}',
    error_deleting_event: 'Error deleting event: {message}',
    event_deleted_successfully: 'Event deleted successfully.',
    error_no_participant: 'Please add at least one participant.',
    'Case Number': 'Case Number', 
    'Limitation Date': 'Limitation Date', 
    'Next Step': 'Next Step', 
    

    // --- Form Fields & Placeholders ---
    name_en: 'Name (English)',
    name_zh: 'Name (Chinese)',
    'Will/Probate/Contract': 'Will/Probate/Contract Details',
    'Property Address': 'Property Address', 'Related Property': 'Related Property', 'Completion Date': 'Completion Date', 'Solicitor': "Solicitor",
    'Hearing Date': 'Hearing Date', 'Hearing DateTime': 'Hearing Time', 'Court Name': 'Court Name', 'Opposing Counsel': 'Opposing Counsel',
    'Signing Date': 'Signing Date', 'Commencement Date': 'Commencement Date', 'Expiry Date': 'Expiry Date', 'Rent': 'Rent', 'Deposit': 'Deposit',
    date_placeholder: 'YYYY-MM-DD',
    time_placeholder: 'hh:mm',

    // --- Misc ---
    confirm_close_title: 'Confirm Close',
    confirm_close_message: 'Are you sure you want to close? All unsaved changes will be lost.',
    confirm_close_confirm: 'Confirm Close',
    confirm_close_cancel: 'Stay',
    loading: 'Loading...',
    passwords_do_not_match: 'Passwords do not match. Please try again.',
    error_invalid_credentials: 'Login failed. Please check your email and password.',
    confirm_password: 'Confirm Password',
    register_success_confirm_email: 'Registration successful! Please check your email for a confirmation link to activate your account.',

    //added for case management
    // --- Case Types & Roles ---
    'Commercial': 'Commercial',
    'Conveyancing': 'Conveyancing',
    'Litigation': 'Litigation',
    'Tenancy Agreement': 'Tenancy Agreement',
    'Will': 'Will',
    'Probate': 'Probate',
    'Contract': 'Contract',
    'Residential': 'Residential',
    'Commercial Property': 'Commercial Property',
    'Civil': 'Civil',
    'Criminal': 'Criminal',
    'Executor': 'Executor',
    'Beneficiary': 'Beneficiary',
    'Purchaser': 'Purchaser',
    'Vendor': 'Vendor',
    'Plaintiff': 'Plaintiff',
    'Defendant': 'Defendant',
    'Landlord': 'Landlord',
    'Tenant': 'Tenant',
    'regarding_case': 'Regarding Case',
  },
  zh: {
    // --- General ---
    app_title: '案件與客戶管理系統',
    add: '新增', edit: '編輯', delete: '刪除', save: '儲存', cancel: '取消', search: '搜尋...', notes: '備註', permission: '權限', actions: '操作', close: '關閉', date: '日期', all_types: '所有類型', all_statuses: '所有狀態', not_found: '沒有找到符合條件的資料。', details: '案件詳情', keyword: '關鍵字',
    loading_data: '正在載入資料...',

    year: '年',
    month: '月',
    day: '日',
    regarding_case: '關於案件', 
    Plaintiff: '原告', 
    Defendant: '被告', 

    // --- Login & User System ---
    login: '登入', logout: '登出', register: '註冊', email: '電子郵件', password: '密碼', username: '使用者名稱',
    login_to_account: '登入您的帳號', register_new_account: '註冊新帳號',
    no_account_yet: '還沒有帳號嗎？', already_have_account: '已經有帳號了？',
    register_success_title: '註冊請求已提交', register_success_message: '您的註冊請求已提交審核。帳號啟用後，您將會收到電子郵件通知。',
    my_profile: '個人主頁', personal_info: '個人資訊', user_profile: '使用者設定',
    change_password: '更改密碼', notification_settings: '通知設定', daily_email_summary: '每日 Email 提醒',
    
    // --- Sharing & Permissions ---
    private: '私人', public: '公開', custom_share: '指定分享',
    share_with: '分享給',
    select_users_or_groups: '選擇使用者或群組...',
    sharing_groups: '常用分享群組',
    create_new_group: '建立新群組',
    add_group: '新增群組',
    save_group: '儲存群組',
    group_name: '群組名稱',
    group_members: '群組成員',
    select_members: '選擇群組成員...',
    member_selected: '位成員已選擇',
    members_selected: '位成員已選擇',
    members_unit: '位成員',
    no_sharing_groups_yet: '尚未建立任何分享群組。',
    confirm_delete_group_message: '您確定要刪除這個分享群組嗎？',
    group_creation_error: '群組名稱与至少一位成員為必填。',

    // --- People Management ---
    people_management: '人員管理', person: '人員', person_details: '人員詳細資料', add_person: '新增人員', edit_person: '編輯人員資料',
    contact_phone: '聯絡電話', add_phone: '新增電話', add_email: '新增電郵', nationality: '國籍',
    personality_notes: '性格／特殊應對方式', person_identity_type: '身分/角色', identity_client: '客戶', identity_collaborator: '合作人員',
    identity_other: '其他 (請註明)', identity_other_specify: '註明身分',
    sort_by: '排序方式', newest_first: '新增日期 (新到舊)', name_asc: '姓名 (A-Z)', name_desc: '姓名 (Z-A)',
    favorites_only: '只顯示收藏', all_identities: '所有身分',

    // --- Case Management ---
    case_management: '案件管理', case: '案件', case_details: '案件詳細資料', add_case: '新增案件', edit_case: '編輯案件資料',
    reference_id: '參考編號', case_type: '案件類型', case_subtype: '案件子類型', case_status: '案件狀態',
    status_ongoing: '進行中', status_completed: '已完成', status_on_hold: '擱置中',
    roles: '相關人員', related_cases: '相關案件', ongoing_cases: '進行中案件', completed_cases: '已結案案件',
    no_ongoing_cases: '沒有進行中的案件。', no_completed_cases: '沒有已結案的案件。',

    // --- Attachments ---
    attachments: '相關檔案',
    add_attachment: '新增檔案',
    attachment_name: '檔案名稱...',
    uploaded_on: '上傳於',
    delete_selected: '刪除選取項目',
    download_selected: '下載選取項目',
    print_selected: '列印選取項目',
    select_all: '全選',
    selected: '已選取',
    open_selected: '開啟選取項目',
    open_files_title: '開啟剩餘檔案',
    print_files_title: '列印剩餘檔案',
    files_instruction: '請逐一點擊連結處理，點擊後連結將會消失。',

    // --- Events ---
    events: '行程',
    event_management: "行程管理",
    today_reminders: "今日提醒事項",
    upcoming_reminders_seven_days: '未來7日提醒',
    add_event: '新增行程',
    edit_event: '編輯行程',
    event_details: '行程詳細資訊',
    event_title: '行程標題',
    location: '地點',
    all_day: '全日',
    time: '時間',
    time_am: '上午',
    time_pm: '下午',
    no_events_today: '今天沒有已排定的行程。',
    no_upcoming_events: '未來7天內沒有即將到來的事項。',
    event_with: '與...的行程',
    unknown_participant: '未命名參與人',
    related_case: '相關案件',
    related_case_optional: '關聯案件 (選填)',
    select_case: '選擇關聯案件',
    no_related_case: '無',
    related_participants: '相關人員/聯絡人',
    our_attendees: '我方參與人',
    add_participant: '新增參與人',
    search_or_add_person: '從列表選擇或輸入新名字',
    confirm_delete_event: '您確定要刪除此行程嗎？',
    error_saving_event: '儲存行程時發生錯誤：{message}',
    error_updating_event: '更新行程時發生錯誤：{message}',
    error_deleting_event: '刪除行程時發生錯誤：{message}',
    event_deleted_successfully: '行程已成功刪除。',
    error_no_participant: '請至少新增一位參與人。',
    'Case Number': '案件編號', 
    'Limitation Date': '時效日期', 
    'Next Step': '下一步', 

    // --- Form Fields & Placeholders ---
    name_en: '英文姓名',
    name_zh: '中文姓名',
    'Will/Probate/Contract': '遺囑/遺產認證/合約詳情',
    'Property Address': '物業地址', 'Related Property': '相關物業', 'Completion Date': '交易完成日', 'Solicitor': '我方律師',
    'Hearing Date': '聆訊日期', 'Hearing DateTime': '聆訊時間', 'Court Name': '法庭名稱', 'Opposing Counsel': '對方律師',
    'Signing Date': '簽署日期', 'Commencement Date': '生效日期', 'Expiry Date': '屆滿日期', 'Rent': '租金', 'Deposit': '押金',
    date_placeholder: '年/月/日',
    time_placeholder: '時:分',

    // --- Misc ---
    confirm_close_title: '確認關閉',
    confirm_close_message: '您確定要關閉嗎？所有未儲存的變更將會遺失。',
    confirm_close_confirm: '確認關閉',
    confirm_close_cancel: '繼續編輯',
    loading: '載入中...',
    passwords_do_not_match: '兩次輸入的密碼不一致，請重新輸入。',
    error_invalid_credentials: '登入失敗，請檢查您的電子郵件和密碼。',
    confirm_password: '確認密碼',
    register_success_confirm_email: '註冊成功！請至您的信箱收取驗證信以啟用您的帳號。',

    //added for case management
    'Commercial': '商業案件',
    'Conveyancing': '物業轉易',
    'Litigation': '訴訟',
    'Tenancy Agreement': '租賃協議',
    'Will': '遺囑',
    'Probate': '遺產認證',
    'Contract': '合約',
    'Residential': '住宅',
    'Commercial Property': '商業物業',
    'Civil': '民事',
    'Criminal': '刑事',
    'Executor': '遺囑執行人',
    'Beneficiary': '受益人',
    'Purchaser': '買方',
    'Vendor': '賣方',
    'Plaintiff': '原告',
    'Defendant': '被告',
    'Landlord': '業主',
    'Tenant': '租客',
    'regarding_case': '關於案件',
  }
};

export const personIdentityOptions = [
    'identity_client',
    'identity_collaborator',
    'identity_other',
];

export const caseTypeConfig = {
    'Commercial': {
        roles: ['Executor', 'Beneficiary'],
        fields: ['Will/Probate/Contract', 'Related Property'],
        subtypes: ['Will', 'Probate', 'Contract'],
        subtype_fields: {
            'Contract': ['Signing Date', 'Commencement Date', 'Expiry Date']
        }
    },
    'Conveyancing': {
        roles: ['Purchaser', 'Vendor'],
        fields: ['Property Address', 'Completion Date', 'Solicitor', 'Related Property'],
        subtypes: ['Residential', 'Commercial Property']
    },
    'Litigation': {
        roles: ['Plaintiff', 'Defendant'],
        fields: ['Hearing Date', 'Court Name', 'Opposing Counsel', 'Case Number', 'Limitation Date', 'Next Step', 'Related Property'],
        subtypes: ['Civil', 'Criminal']
    },
    'Tenancy Agreement': {
        roles: ['Landlord', 'Tenant'],
        fields: ['Signing Date', 'Commencement Date', 'Expiry Date', 'Rent', 'Deposit', 'Related Property'],
        subtypes: []
    }
};

export const caseStatusOptions = ['status_ongoing', 'status_completed', 'status_on_hold'];

export const dateTimeFields = ['Hearing Date'];