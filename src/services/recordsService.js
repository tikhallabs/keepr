// recordsService.js — All database operations for records table
// Both Commitments and Ideas go through this service

import { supabase } from './supabase';

/**
 * Create a new record (Commitment or Idea)
 * @param {object} params
 * @param {string} params.userId - Current user's ID
 * @param {string} params.body - Raw text captured
 * @param {string} params.objectType - 'commitment' or 'idea'
 */
export const createRecord = async ({
  userId,
  body,
  objectType = 'commitment',
  title = null,
  dueDate = null,
  aiProcessed = false,
  aiConfidence = null,
  captureMethod = 'text',
  status = null,
}) => {
  const finalTitle = title || body.trim().slice(0, 60);

  const finalStatus = status || (
    objectType === 'commitment'
      ? (dueDate ? 'scheduled' : 'unscheduled')
      : 'incomplete'
  );

  const { data, error } = await supabase
    .from('records')
    .insert({
      user_id: userId,
      object_type: objectType,
      title: finalTitle,
      body: body.trim(),
      capture_method: captureMethod,
      status: finalStatus,
      due_date: dueDate,
      ai_processed: aiProcessed,
      ai_confidence: aiConfidence,
      clarification_questions_asked: 0,
      reschedule_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch all records for a user
 * @param {string} userId
 */
export const fetchRecords = async (userId) => {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};