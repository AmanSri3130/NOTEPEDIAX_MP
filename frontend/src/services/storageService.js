import { supabase } from '../lib/supabase';

export const storageService = {
  // Upload user avatar image to Supabase Storage
  async uploadAvatar(file, userId) {
    if (!file || !userId) throw new Error('File and User ID are required.');

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError.message);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  // Upload E-Note document PDF
  async uploadNoteFile(file, examCode = 'JEE_MAIN') {
    if (!file) throw new Error('File is required.');

    const fileExt = file.name.split('.').pop();
    const filePath = `${examCode}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error('Error uploading note file:', uploadError.message);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
};

export default storageService;
