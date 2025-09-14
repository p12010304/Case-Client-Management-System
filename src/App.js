import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageProvider';
import Header from './components/shared/Header';
import EventManagement from './components/shared/EventManagement';
import PeopleManagement from './components/shared/PeopleManagement';
import CaseManagement from './components/shared/CaseManagement';
import AuthPage from './components/auth/AuthPage';
import UserProfilePage from './components/profile/UserProfilePage';
import CaseFormModal from './components/shared/CaseFormModal';
import CaseInfoModal from './components/shared/CaseInfoModal';
import PersonFormModal from './components/shared/PersonFormModal';
import PersonInfoModal from './components/shared/PersonInfoModal';
import EventFormModal from './components/shared/EventFormModal';
import EventInfoModal from './components/shared/EventInfoModal';


const AppContent = () => {
  const t = useTranslation();

  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('cases');

  const [people, setPeople] = useState([]);
  const [events, setEvents] = useState([]);
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);

  const [editingPerson, setEditingPerson] = useState(null);
  const [viewingPerson, setViewingPerson] = useState(null);
  const [showPersonModal, setShowPersonModal] = useState(false);

  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const [editingCase, setEditingCase] = useState(null);
  const [viewingCase, setViewingCase] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showCaseInfoModal, setShowCaseInfoModal] = useState(false);
  
  const [isJsZipLoaded, setIsJsZipLoaded] = useState(false);

  useEffect(() => {
    const supabaseUrl = 'insert your own url here';
    const supabaseAnonKey = 'inset your own key here';
    const scriptId = 'supabase-script';
    if (document.getElementById(scriptId) || window.supabase) {
        if (window.supabase && !supabase) {
             const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
             setSupabase(supabaseClient);
        }
        return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(supabaseClient);
      }
    };
    document.body.appendChild(script);
    return () => {
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement) { 
          // document.body.removeChild(scriptElement); 
      }
    };
  }, []);
  
  useEffect(() => {
    if (window.JSZip) {
      setIsJsZipLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    script.onload = () => {
      setIsJsZipLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load JSZip library.");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, [supabase]);
  
  useEffect(() => {
    if (session?.user) {
        const fetchUserProfile = async () => {
            if (!supabase) return;
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
            }

            const profile = {
                id: session.user.id,
                email: session.user.email,
                username: profileData?.username || session.user.user_metadata?.username || session.user.email.split('@')[0],
                sharing_groups: profileData?.sharing_groups || [],
            };
            setCurrentUserProfile(profile);
        };
        fetchUserProfile();
    } else {
        setCurrentUserProfile(null);
        setPeople([]);
        setEvents([]);
        setCases([]);
    }
  }, [session, supabase]);

  const fetchPeople = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('people').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching people:', error);
    else setPeople(data);
  }, [supabase]);

  const fetchEvents = useCallback(async () => {
    if (!supabase) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', todayString)
      .lte('date', sevenDaysString)
      .order('date', { ascending: true });
    if (error) console.error('Error fetching events:', error);
    else setEvents(data);
  }, [supabase]);

  const fetchCases = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching cases:', error);
    else setCases(data);
  }, [supabase]);

  const fetchUsers = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email');
    if (error) {
      console.error('Error fetching users from profiles:', error);
    } else {
      setUsers(data);
    }
  }, [supabase]);

  const uploadFile = async (file, bucketName = 'attachments') => {
    if (!supabase) {
        alert('Supabase client is not initialized.');
        return null;
    }
    if (!session?.user?.id) {
        alert('User is not logged in.');
        return null;
    }

    const userId = session.user.id;
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`檔案上傳失敗: ${error.message}`);
      return null;
    }
  };

  const handleDeleteFileByUrl = async (url) => {
    if (!url || !supabase) return;

    console.log(`[handleDeleteFileByUrl] 準備刪除 URL:`, url);

    const getPathFromUrl = (url) => {
        try {
            const urlObject = new URL(url);
            const pathSegments = urlObject.pathname.split('/');
            const bucketName = 'attachments';
            const bucketIndex = pathSegments.indexOf(bucketName);
            if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) return null;
            return pathSegments.slice(bucketIndex + 1).join('/');
        } catch (error) {
            console.error("無法從 URL 解析路徑:", url, error);
            return null;
        }
    };

    const pathToDelete = getPathFromUrl(url);

    if (!pathToDelete) {
        alert('無法從 URL 解析出檔案路徑，刪除失敗。');
        return;
    }

    console.log(`[handleDeleteFileByUrl] 解析出的路徑:`, pathToDelete);
    const { error } = await supabase.storage.from('attachments').remove([pathToDelete]);

    if (error) {
        console.error('從後端刪除單一附件失敗:', error);
        alert(`刪除檔案失敗: ${error.message}`);
    } else {
        console.log('成功從後端刪除單一附件。');
    }
  };

  useEffect(() => {
    if (supabase && session) {
        fetchPeople();
        fetchEvents();
        fetchCases();
        fetchUsers();
    }
  }, [supabase, session, fetchPeople, fetchEvents, fetchCases, fetchUsers]);

  const handleRegister = async (email, password, username) => {
    if (!supabase) return;
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw error;
    alert(t('register_success_confirm_email')); 
    return data;
  };

  const handleLogin = async (email, password) => {
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setCurrentView('cases');
  };
  
   const handleSaveProfile = async (updatedUser) => {
    if (!supabase) return;

    const { id, username, sharing_groups } = updatedUser;

    try {
        // 步驟一：更新「事實來源」 -> auth.users
        const { error: authError } = await supabase.auth.updateUser({
            data: { username: username }
        });

        if (authError) {
            // 如果 auth 更新失敗，直接拋出錯誤，中斷執行
            throw authError;
        }

        // 步驟二：更新「擴充表」 -> public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ username, sharing_groups }) // 同時更新名稱和分享群組
            .eq('id', id);

        if (profileError) {
            // 如果 profile 更新失敗，也拋出錯誤
            throw profileError;
        }

        // 所有步驟都成功後，才更新前端狀態並提示成功
        setCurrentUserProfile(prevProfile => ({
            ...prevProfile,
            username: username,
            sharing_groups: sharing_groups,
        }));
        
        alert('個人資料已成功更新！');
        setCurrentView('cases');

    } catch (error) {
        console.error('Error updating user profile:', error);
        alert(`更新個人資料時發生錯誤: ${error.message}`);
        // 發生錯誤時，可以考慮重新獲取一次使用者資料，以確保前端與後端狀態一致
        // fetchUserProfile(); 
    }
};

  const personActions = useMemo(() => ({
    add: async (personData) => {
        if (!supabase || !session?.user) return;
        const { id, created_at, ...dataToInsert } = personData;
        const { error } = await supabase.from('people').insert([{ ...dataToInsert, user_id: session.user.id }]);
        if (error) {
            console.error('Error adding person:', error);
            alert(`新增人員失敗: ${error.message}`);
        } else {
            fetchPeople();
        }
    },
    update: async ({ updatedData, originalData }) => {
        if (!supabase) return;

        const getPathFromUrl = (url) => {
            if (!url || typeof url !== 'string') return null;
            try {
                const urlObject = new URL(url);
                const pathWithBucket = urlObject.pathname.split('/object/public/')[1];
                return pathWithBucket;
            } catch (e) { return null; }
        };

        const originalUrls = originalData?.attachments?.map(f => f.url) || [];
        const currentUrls = updatedData.attachments.map(f => f.url);
        const urlsToDelete = originalUrls.filter(url => !currentUrls.includes(url));
        const pathsToDelete = urlsToDelete.map(getPathFromUrl).filter(Boolean);

        const deleteFilesPromise = pathsToDelete.length > 0
            ? supabase.storage.from('attachments').remove(pathsToDelete)
            : Promise.resolve();
        
        const { id, created_at, user_id, ...dataToUpdate } = updatedData;
        const updateDbPromise = supabase.from('people').update(dataToUpdate).eq('id', id);

        const [deleteResult, updateResult] = await Promise.all([deleteFilesPromise, updateDbPromise]);

        if (deleteResult && deleteResult.error) {
            console.error('Error deleting storage files during person update:', deleteResult.error);
            alert(`刪除舊附件時發生錯誤: ${deleteResult.error.message}`);
        }

        if (updateResult.error) {
            console.error('Error updating person:', updateResult.error);
            alert(`更新人員時發生錯誤: ${updateResult.error.message}`);
        } else {
            fetchPeople();
        }
    },
    delete: async (personId) => {
        if (!window.confirm(`您確定要「永久刪除」此人員 (${personId}) 嗎？其所有附件將一併刪除。`)) return;

        console.log(`--- 開始刪除人員流程 (ID: ${personId}) ---`);

        const personToDelete = people.find(p => p.id === personId);
        if (!personToDelete) {
            console.error("錯誤：在本地 state 中找不到要刪除的人員資料。");
            alert("找不到人員資料，無法刪除附件。請手動檢查。");
            return;
        }

        const attachmentsToDelete = personToDelete.attachments || [];
        console.log("找到以下需一併刪除的附件:", attachmentsToDelete);

        const getPathFromUrl = (url) => {
            if (!url || typeof url !== 'string') return null;
            try {
                const urlObject = new URL(url);
                const pathSegments = urlObject.pathname.split('/');
                const bucketName = 'attachments';
                const bucketIndex = pathSegments.indexOf(bucketName);
                if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) return null;
                const filePath = pathSegments.slice(bucketIndex + 1).join('/');
                return filePath;
            } catch (error) { return null; }
        };

        const pathsToDelete = attachmentsToDelete.map(file => getPathFromUrl(file.url)).filter(Boolean);
        console.log("最終準備從 Storage 刪除的路徑列表:", pathsToDelete);

        if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage.from('attachments').remove(pathsToDelete);
            if (storageError) {
                console.error('從 Supabase Storage 刪除檔案時發生嚴重錯誤:', storageError);
                alert(`刪除附件時發生錯誤: ${storageError.message}。人員紀錄可能未被刪除，請檢查 Console。`);
                return; 
            }
        }

        const { error: dbError } = await supabase.from('people').delete().eq('id', personId);
        if (dbError) {
            console.error('從資料庫刪除人員時發生嚴重錯誤:', dbError);
            alert(`刪除人員紀錄時發生錯誤: ${dbError.message}`);
        } else {
            alert("人員及其所有附件已成功刪除。");
            fetchPeople();
        }
        console.log("--- 刪除人員流程結束 ---");
    },
    toggleFavorite: async (person) => {
        if (!supabase || !person) return;
        const { error } = await supabase.from('people').update({ is_favorite: !person.is_favorite }).eq('id', person.id);
        if (error) console.error('Error toggling favorite:', error);
        else fetchPeople();
    },
  }), [supabase, session, people, fetchPeople, t]);

  const eventActions = useMemo(() => ({
    add: async (eventData) => {
        if (!supabase || !session?.user) return;
        const { error } = await supabase.from('events').insert([{ ...eventData, user_id: session.user.id }]);
        if (error) {
            alert(t('error_saving_event', { message: error.message }));
        } else {
            fetchEvents();
        }
    },
    update: async (updatedEvent) => {
        if (!supabase) return;
        const { id, ...dataToUpdate } = updatedEvent;
        const { error } = await supabase.from('events').update(dataToUpdate).eq('id', id);
        if (error) {
            alert(t('error_updating_event', { message: error.message }));
        } else {
            fetchEvents();
        }
    },
    delete: async (eventId) => {
    if (!supabase || !window.confirm(t('confirm_delete_event'))) return;
    try {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        
        if (error) {
            throw error;
        }

        alert(t('event_deleted_successfully'));
        // 成功後，重新獲取最新的事件列表
        fetchEvents(); 
    } catch (error) {
        console.error('Error deleting event:', error);
        alert(t('error_deleting_event', { message: error.message }));
    }
},
  }), [supabase, session, fetchEvents, t]);

  const caseActions = useMemo(() => ({
    add: async (caseData) => {
        if (!supabase || !session?.user) return;
        const { error } = await supabase.from('cases').insert([{ ...caseData, user_id: session.user.id }]);
        if (error) {
          console.error('Error adding case:', error);
          alert(t('error_adding_case', { message: error.message }));
        }
        else fetchCases();
    },
    update: async ({ updatedData, originalData }) => {
        if (!supabase) return;

        const getPathFromUrl = (url) => {
            if (!url || typeof url !== 'string') return null;
            try {
                const urlObject = new URL(url);
                const pathWithBucket = urlObject.pathname.split('/object/public/')[1];
                return pathWithBucket;
            } catch (e) { return null; }
        };

        const originalUrls = originalData?.attachments?.map(f => f.url) || [];
        const currentUrls = updatedData.attachments.map(f => f.url);
        
        const urlsToDelete = originalUrls.filter(url => !currentUrls.includes(url));
        const pathsToDelete = urlsToDelete.map(getPathFromUrl).filter(Boolean);

        const deleteFilesPromise = pathsToDelete.length > 0
            ? supabase.storage.from('attachments').remove(pathsToDelete)
            : Promise.resolve();
        
        const { id, ...dataToUpdate } = updatedData;
        const updateDbPromise = supabase.from('cases').update(dataToUpdate).eq('id', id);

        const [deleteResult, updateResult] = await Promise.all([deleteFilesPromise, updateDbPromise]);

        if (deleteResult && deleteResult.error) {
            console.error('更新案件時刪除舊附件失敗:', deleteResult.error);
            alert(`刪除舊附件時發生錯誤: ${deleteResult.error.message}`);
        }

        if (updateResult.error) {
            console.error('更新案件失敗:', updateResult.error);
            alert(`更新案件時發生錯誤: ${updateResult.error.message}`);
        } else {
            console.log("案件更新成功。");
            fetchCases();
        }
    },
    delete: async (caseId) => {
        if (!window.confirm(`您確定要「永久刪除」整個案件 (${caseId}) 嗎？其所有附件將一併刪除。`)) return;
        console.log(`--- 開始刪除案件流程 (ID: ${caseId}) ---`);

        const caseToDelete = cases.find(c => c.id === caseId);
        if (!caseToDelete) {
            console.error("錯誤：在本地 state 中找不到要刪除的案件資料。");
            alert("找不到案件資料，無法刪除附件。請手動檢查。");
            return;
        }

        const attachmentsToDelete = caseToDelete.attachments || [];
        console.log("找到以下需一併刪除的附件:", attachmentsToDelete);

        const getPathFromUrl = (url) => {
            if (!url || typeof url !== 'string') {
                console.warn("無效的 URL，跳過:", url);
                return null;
            }
            try {
                const urlObject = new URL(url);
                const pathSegments = urlObject.pathname.split('/');
                const bucketName = 'attachments';
                const bucketIndex = pathSegments.indexOf(bucketName);
                if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
                    console.warn(`URL 中找不到 Bucket ('${bucketName}'):`, url);
                    return null;
                }
                const filePath = pathSegments.slice(bucketIndex + 1).join('/');
                console.log(`成功從 ${url} 解析出路徑: ${filePath}`);
                return filePath;
            } catch (error) {
                console.error(`從 URL 解析路徑時發生錯誤:`, url, error);
                return null;
            }
        };

        const pathsToDelete = attachmentsToDelete.map(file => getPathFromUrl(file.url)).filter(Boolean);
        console.log("最終準備從 Storage 刪除的路徑列表:", pathsToDelete);

        if (pathsToDelete.length > 0) {
            const { data, error: storageError } = await supabase.storage.from('attachments').remove(pathsToDelete);
            if (storageError) {
                console.error('從 Supabase Storage 刪除檔案時發生嚴重錯誤:', storageError);
                alert(`刪除附件時發生錯誤: ${storageError.message}。案件紀錄可能未被刪除，請檢查 Console。`);
                return; 
            }
            console.log("成功從 Storage 刪除檔案:", data);
        } else {
            console.log("此案件沒有需要從 Storage 刪除的附件。");
        }

        console.log("正在從資料庫刪除案件紀錄...");
        const { error: dbError } = await supabase.from('cases').delete().eq('id', caseId);
        if (dbError) {
            console.error('從資料庫刪除案件時發生嚴重錯誤:', dbError);
            alert(`刪除案件紀錄時發生錯誤: ${dbError.message}`);
        } else {
            console.log("成功從資料庫刪除案件紀錄。");
            alert("案件及其所有附件已成功刪除。");
            fetchCases();
        }
        console.log("--- 刪除案件流程結束 ---");
    },
  }), [supabase, session, cases, fetchCases, t]);

  const getPersonName = useCallback((personId) => people.find(p => p.id === personId)?.name_en || people.find(p => p.id === personId)?.name_zh || 'N/A', [people]);
  const getUserName = useCallback((userId) => users.find(u => u.id === userId)?.username || 'N/A', [users]);
  const getCaseRef = useCallback((caseId) => cases.find(c => c.id === caseId)?.reference_id || 'N/A', [cases]);
  
  useEffect(() => {
    if (currentView === 'profile') {
      fetchUsers();
    }
  }, [currentView, fetchUsers]);

  const handleEditCase = useCallback(async (caseId) => {
    await fetchUsers();
    const caseToEdit = cases.find(c => c.id === caseId);
    if (caseToEdit) {
        setEditingCase(caseToEdit);
        setShowCaseModal(true);
    } else if (caseId === null) {
        setEditingCase(null);
        setShowCaseModal(true);
    }
  }, [cases, fetchUsers]);

  const handleViewCase = useCallback((caseId) => {
    const caseToView = cases.find(c => c.id === caseId);
    if (caseToView) {
      setViewingCase(caseToView);
      setShowCaseInfoModal(true);
    }
  }, [cases]);

  const handleViewPerson = useCallback((person) => {
    setViewingPerson(person);
  }, []);

  const handleViewEvent = useCallback((eventId) => {
    const eventToView = events.find(e => e.id === eventId);
    if (eventToView) {
      setViewingEvent(eventToView);
    }
  }, [events]);
  
  const handleOpenPersonModal = useCallback((person = null) => {
    setEditingPerson(person);
    setShowPersonModal(true);
  }, []);

  const handleOpenEventModal = useCallback(async (event = null) => {
    await fetchUsers();
    setEditingEvent(event);
    setShowEventModal(true);
  }, [fetchUsers]);

  const handleNavigateToCase = useCallback((caseId) => {
    setShowPersonModal(false);
    setViewingPerson(null);
    handleViewCase(caseId);
  }, [handleViewCase]);

  if (loading || !supabase) { return <div className="flex justify-center items-center min-h-screen">讀取中...</div>; }
  if (!session) { return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />; }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
       <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap'); 
          body { font-family: 'Inter', 'Noto Sans TC', sans-serif; }
      `}</style>
      
      {currentView === 'profile' ? (
          <UserProfilePage user={currentUserProfile} allUsers={users} onSave={handleSaveProfile} onBack={() => setCurrentView('cases')} supabase={supabase}/>
      ) : (
          <div className="p-4 sm:p-6 lg:p-8">
              <Header 
                  currentUser={currentUserProfile}
                  currentView={currentView} 
                  setCurrentView={setCurrentView} 
                  onLogout={handleLogout}
                  onProfileClick={() => setCurrentView('profile')}
              />
              
              {currentView === 'events' && 
                  <EventManagement
                      events={events}
                      cases={cases}
                      people={people}
                      allUsers={users}
                      currentUser={currentUserProfile}
                      eventActions={eventActions}
                      caseActions={caseActions} // 傳遞 caseActions
                      getPersonName={getPersonName}
                      getUserName={getUserName}
                      getCaseRef={getCaseRef}
                      handleEditCase={handleEditCase} // onEditCase 更名為 handleEditCase 以符合組件預期
                      handleViewPersonFromEvent={handleViewPerson}
                      onEditEvent={handleOpenEventModal}
                      onViewEvent={handleViewEvent} 
                      onViewCase={handleViewCase}
                  />
              }
              
              {currentView === 'people' && 
                  <PeopleManagement 
                      people={people} 
                      actions={personActions} 
                      onViewPerson={handleViewPerson} 
                      onEditPerson={handleOpenPersonModal} 
                  />
              }
              {currentView === 'cases' && 
                  <CaseManagement
                      cases={cases}
                      people={people}
                      actions={caseActions}
                      getPersonName={getPersonName}
                      onPersonClick={handleViewPerson}
                      onEditCase={handleEditCase}
                      onViewCase={handleViewCase}
                  />
              }
          </div>
      )}

      {/* --- 所有 Modals --- */}
      {showPersonModal && 
          <PersonFormModal 
              person={editingPerson} 
              cases={cases} 
              allUsers={users} 
              currentUser={currentUserProfile}
              isJsZipLoaded={isJsZipLoaded}
              //修改點一：傳遞 supabase 和 onFileUpload
              supabase={supabase}
              onFileUpload={uploadFile}
              onDeleteAttachmentFile={handleDeleteFileByUrl}
              onSave={({ updatedData, originalData }) => {
                //修改點二：確保呼叫正確的 personActions
                if (updatedData.id) {
                    personActions.update({ updatedData, originalData });
                } else {
                    personActions.add(updatedData);
                }
                setShowPersonModal(false);
              }}
              onClose={() => setShowPersonModal(false)} 
              onCaseClick={handleNavigateToCase}
          />
      }
      {viewingPerson && 
          <PersonInfoModal 
              person={viewingPerson} 
              cases={cases} 
              onClose={() => setViewingPerson(null)} 
              onCaseClick={handleNavigateToCase}
              isJsZipLoaded={isJsZipLoaded}
          />
      }
      
      {showCaseModal && 
          <CaseFormModal 
              caseItem={editingCase}
              people={people}
              allUsers={users}
              currentUser={currentUserProfile}
              isJsZipLoaded={isJsZipLoaded}
              supabase={supabase}
              onFileUpload={uploadFile}
              onDeleteAttachmentFile={handleDeleteFileByUrl}
              onSave={({ updatedData, originalData }) => {
                if (updatedData.id) {
                    caseActions.update({ updatedData, originalData });
                } else {
                    caseActions.add(updatedData);
                }
                setShowCaseModal(false);
              }}
              onClose={() => setShowCaseModal(false)}
          />
      }
      {showCaseInfoModal && viewingCase &&
          <CaseInfoModal
              caseItem={viewingCase}
              getPersonName={getPersonName}
              isJsZipLoaded={isJsZipLoaded}
              onClose={() => {
                  setViewingCase(null);
                  setShowCaseInfoModal(false);
              }}
              onPersonClick={(personId) => {
                  setShowCaseInfoModal(false);
                  const personToView = people.find(p => p.id === personId);
                  if (personToView) handleViewPerson(personToView);
              }}
          />
      }
      {viewingEvent &&
          <EventInfoModal
              event={viewingEvent}
              onClose={() => setViewingEvent(null)}
              getPersonName={getPersonName}
              getCaseRef={getCaseRef}
              getUserName={getUserName}
              onPersonClick={(personId) => {
                  setViewingEvent(null); // 關閉目前視窗
                  const personToView = people.find(p => p.id === personId);
                  if (personToView) handleViewPerson(personToView);
              }}
              onCaseClick={(caseId) => {
                  setViewingEvent(null); // 關閉目前視窗
                  handleViewCase(caseId);
              }}
          />
      }

      {showEventModal &&
          <EventFormModal
              event={editingEvent}
              people={people}
              cases={cases}
              allUsers={users}
              currentUser={currentUserProfile}
              onSave={(data) => {
                  data.id ? eventActions.update(data) : eventActions.add(data);
                  setShowEventModal(false);
              }}
              onClose={() => setShowEventModal(false)}
              onViewPerson={handleViewPerson}
          />
      }
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;