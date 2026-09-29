import supabase from '../config/supabase.js';

export const SupabaseService = {
  // --- User & Role Management ---
  async getUserByPhone(phone) {
    const { data, error } = await supabase
      .from('users')
      .select('*, students(*), teachers(*), admins(*)')
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*, students(*), teachers(*), admins(*)')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createUserProfile({ name, email, phone, role = 'student', targetExam = 'JEE_MAIN' }) {
    // 1. Create specialized profile
    let studentId = null;
    let teacherId = null;
    let adminId = null;

    if (role === 'student') {
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .insert([{ phone, target_exam: targetExam }])
        .select()
        .single();
      if (studentErr) throw studentErr;
      studentId = student.id;
    } else if (role === 'teacher' || role === 'instructor') {
      const { data: teacher, error: teacherErr } = await supabase
        .from('teachers')
        .insert([{ full_name: name, phone, email }])
        .select()
        .single();
      if (teacherErr) throw teacherErr;
      teacherId = teacher.id;
    } else if (role === 'admin' || role === 'school_admin') {
      const { data: admin, error: adminErr } = await supabase
        .from('admins')
        .insert([{ full_name: name }])
        .select()
        .single();
      if (adminErr) throw adminErr;
      adminId = admin.id;
    }

    // 2. Create core user record
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        phone,
        role,
        student_id: studentId,
        teacher_id: teacherId,
        admin_id: adminId,
      }])
      .select()
      .single();

    if (userErr) throw userErr;
    return user;
  },

  // --- Courses & Catalog ---
  async getPublishedCourses(examCode = 'JEE_MAIN') {
    const { data, error } = await supabase
      .from('courses')
      .select('*, exams!inner(*), teachers(*)')
      .eq('is_published', true)
      .eq('exams.code', examCode);
    if (error) throw error;
    return data;
  },

  // --- Orders & Payments ---
  async createPaymentOrder({ orderId, userId, itemType, itemId, amount, idempotencyKey }) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        amount,
        idempotency_key: idempotencyKey,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- RAG Vector Search (pgvector) ---
  async searchNoteChunksVector({ queryEmbedding, matchThreshold = 0.78, matchCount = 5, examCode = 'JEE_MAIN' }) {
    const { data, error } = await supabase.rpc('match_note_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_exam_code: examCode,
    });
    if (error) throw error;
    return data;
  },

  // --- Tool Quota Engine ---
  async checkAndUpdateToolQuota(userId, toolId, maxLimit = 5) {
    const dateString = new Date().toISOString().split('T')[0];

    // Fetch quota row
    const { data: existingQuota } = await supabase
      .from('tool_quotas')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .eq('date_string', dateString)
      .maybeSingle();

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

export default SupabaseService;
