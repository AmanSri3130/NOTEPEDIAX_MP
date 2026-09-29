import { supabase } from '../lib/supabase';

export const userService = {
  // Get current user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*, students(*), teachers(*), admins(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      throw error;
    }
    return data;
  },

  // Update user profile details
  async updateProfile(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
    return data;
  },

  // Daily AI Tool Quota Check and Increment
  async checkAndUpdateToolQuota(userId, toolId, maxLimit = 5) {
    const dateString = new Date().toISOString().split('T')[0];

    const { data: existingQuota, error: fetchErr } = await supabase
      .from('tool_quotas')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .eq('date_string', dateString)
      .maybeSingle();

    if (fetchErr) {
      console.warn('Tool quota check failed:', fetchErr.message);
      return { allowed: true, remaining: maxLimit - 1 };
    }

    const currentCount = existingQuota ? existingQuota.count : 0;
    if (currentCount >= maxLimit) {
      return { allowed: false, remaining: 0 };
    }

    if (existingQuota) {
      await supabase
        .from('tool_quotas')
        .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('id', existingQuota.id);
    } else {
      await supabase
        .from('tool_quotas')
        .insert([{ user_id: userId, tool_id: toolId, date_string: dateString, count: 1 }]);
    }

    return { allowed: true, remaining: maxLimit - (currentCount + 1) };
  }
};

export default userService;
