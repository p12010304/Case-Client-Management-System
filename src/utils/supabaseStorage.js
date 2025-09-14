// 您可以將此函式放在 App.js 或一個專門的 utils 檔案中
export const uploadFile = async (supabase, file, bucketName = 'attachments') => {
  if (!file || !supabase) return null;

  // 為了避免檔名衝突，我們建立一個唯一的路徑
  // 例如：public/user_id/1662334455_document.pdf
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || 'public';
  const filePath = `${userId}/${Date.now()}_${file.name}`;

  try {
    // 使用 Supabase client 上傳檔案
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // 上傳成功後，取得該檔案的永久公開 URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};