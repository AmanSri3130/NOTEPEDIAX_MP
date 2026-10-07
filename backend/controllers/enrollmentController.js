// Removed supabase import

export const getEnrollments = async (req, res) => {
  const userId = req.user?.id;
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true, data: enrollments || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEnrollment = async (req, res) => {
  const userId = req.user?.id;
  const { courseId } = req.body;

  try {
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert([{ user_id: userId, course_id: courseId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { courseId, amount } = req.body;
  const orderId = `ORD-${Date.now()}`;
  res.json({ success: true, data: { orderId, amount: amount || 499 } });
};

export const verifyPayment = async (req, res) => {
  res.json({ success: true, message: 'Payment verified' });
};

export const enrollFree = async (req, res) => {
  return createEnrollment(req, res);
};

export const getMyCourses = async (req, res) => {
  return getEnrollments(req, res);
};

export const getEnrollmentStatus = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  try {
    const { data: enrolled } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    res.json({ success: true, isEnrolled: !!enrolled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
